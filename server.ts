import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });
dotenv.config();

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Detect Gemini rate-limit errors regardless of SDK error shape
const isRateLimit = (e: any) =>
  e?.status === 429 ||
  e?.code === 429 ||
  Number(e?.status) === 429 ||
  String(e?.message).includes('429') ||
  String(e?.message).includes('RESOURCE_EXHAUSTED') ||
  String(e?.status).includes('RESOURCE_EXHAUSTED');

// Call Gemini with automatic retry on rate limit.
// maxWaitMs caps total retry time to stay within Railway's request timeout.
async function geminiWithRetry<T>(fn: () => Promise<T>, maxRetries = 4, retryWaitMs = 35000): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e: any) {
      if (isRateLimit(e) && attempt < maxRetries) {
        console.log(`Rate limit hit, waiting ${retryWaitMs / 1000}s (attempt ${attempt + 1})...`);
        await sleep(retryWaitMs);
      } else {
        throw e;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// TTS serial queue: 8s gap between calls.
// Serializes all TTS calls so concurrent requests don't pile up.
// Within a single podcast (4-5 chunks × 8s = 32-40s) stays within Railway's timeout.
let ttsLast = 0;
const ttsQueue: Array<() => void> = [];
let ttsRunning = false;

function ttsCall<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    ttsQueue.push(async () => {
      const wait = Math.max(0, ttsLast + 8000 - Date.now());
      if (wait > 0) await sleep(wait);
      ttsLast = Date.now();
      try { resolve(await geminiWithRetry(fn, 2, 65000)); } catch (e) { reject(e); }
    });
    if (!ttsRunning) {
      ttsRunning = true;
      (async () => {
        while (ttsQueue.length > 0) await ttsQueue.shift()!();
        ttsRunning = false;
      })();
    }
  });
}

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false });

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS podcasts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      transcript TEXT,
      vocabulary TEXT,
      audio_data TEXT,
      level TEXT,
      host_count TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS description TEXT`);
  await pool.query(`ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS speech_speed INTEGER`);
  await pool.query(`ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS duration INTEGER`);
  await pool.query(`ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS grammar_tips JSONB`);
  await pool.query(`ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'english'`);
  await pool.query(`ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS content_mode TEXT DEFAULT 'podcast'`);
  await pool.query(`ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS topic TEXT`);
}

// Shared Gemini client defined on the server side
// We set 'User-Agent' header to 'aistudio-build' in httpOptions for telemetry.
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  await initDb();

  const app = express();
  app.use(express.json({ limit: '100mb' }));

  // Generate a short description from a title
  app.post('/api/generate-description', async (req, res) => {
    try {
      const { title } = req.body;
      const msg = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 100,
        messages: [{ role: 'user', content: `Write a 1-2 sentence description for a podcast episode titled "${title}". Be concise and engaging. Return only the description, no quotes, no extra text.` }],
      });
      const description = (msg.content[0] as { type: string; text: string }).text.trim();
      res.json({ description });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Save a podcast
  app.post('/api/podcasts', async (req, res) => {
    try {
      const { title, transcript, vocabulary, audioData, level, hostCount, speechSpeed, duration, grammarTips, language, contentMode } = req.body;
      const result = await pool.query(
        'INSERT INTO podcasts (title, transcript, vocabulary, audio_data, level, host_count, speech_speed, duration, grammar_tips, language, content_mode) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id, title, level, host_count, speech_speed, duration, created_at',
        [title, transcript, vocabulary, audioData, level, hostCount, speechSpeed ?? 100, duration ?? null, grammarTips ? JSON.stringify(grammarTips) : null, language ?? 'english', contentMode ?? 'podcast']
      );
      let topic = 'Other';
      if (transcript) {
        try {
          const topicMsg = await anthropic.messages.create({
            model: 'claude-haiku-4-5',
            max_tokens: 20,
            messages: [{ role: 'user', content: `Read this transcript and pick exactly ONE category that best fits it. Return ONLY the category name, nothing else.\n\nCategories: Politics, Business, Health, Travel, Science, Psychology, Education, Technology, Culture, World Events, Other\n\nTranscript:\n${(transcript as string).slice(0, 2000)}` }],
          });
          const raw = ((topicMsg.content[0] as any).text || '').trim();
          const valid = ['Politics','Business','Health','Travel','Science','Psychology','Education','Technology','Culture','World Events','Other'];
          topic = valid.find(t => raw.includes(t)) || 'Other';
        } catch { topic = 'Other'; }
      }
      await pool.query('UPDATE podcasts SET topic = $1 WHERE id = $2', [topic, result.rows[0].id]);
      res.json({ ...result.rows[0], topic });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // List all podcasts
  app.get('/api/podcasts', async (req, res) => {
    try {
      const lang = (req.query.language as string) || 'english';
      const result = await pool.query('SELECT id, title, description, level, host_count, speech_speed, duration, created_at, content_mode, topic FROM podcasts WHERE language = $1 ORDER BY created_at DESC', [lang]);
      res.json(result.rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update podcast title and description
  app.put('/api/podcasts/:id', async (req, res) => {
    try {
      const { title, description } = req.body;
      const result = await pool.query(
        'UPDATE podcasts SET title = $1, description = $2 WHERE id = $3 RETURNING id, title, description, level, host_count, created_at',
        [title, description, req.params.id]
      );
      if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get a single podcast (with audio)
  app.get('/api/podcasts/:id', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM podcasts WHERE id = $1', [req.params.id]);
      if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete a podcast
  app.delete('/api/podcasts/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM podcasts WHERE id = $1', [req.params.id]);
      res.json({ ok: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Backfill topics for all podcasts that don't have one yet
  app.post('/api/admin/backfill-topics', async (req, res) => {
    try {
      const { rows: podcasts } = await pool.query('SELECT id, transcript FROM podcasts WHERE topic IS NULL');
      let updated = 0;
      for (const podcast of podcasts) {
        try {
          const topicMsg = await anthropic.messages.create({
            model: 'claude-haiku-4-5',
            max_tokens: 20,
            messages: [{ role: 'user', content: `Read this transcript and pick exactly ONE category that best fits it. Return ONLY the category name, nothing else.\n\nCategories: Politics, Business, Health, Travel, Science, Psychology, Education, Technology, Culture, World Events, Other\n\nTranscript:\n${(podcast.transcript as string).slice(0, 2000)}` }],
          });
          const raw = ((topicMsg.content[0] as any).text || '').trim();
          const valid = ['Politics','Business','Health','Travel','Science','Psychology','Education','Technology','Culture','World Events','Other'];
          const topic = valid.find(t => raw.includes(t)) || 'Other';
          await pool.query('UPDATE podcasts SET topic = $1 WHERE id = $2', [topic, podcast.id]);
          updated++;
        } catch (err: any) {
          console.error(`Failed to classify podcast ${podcast.id}:`, err?.message || err);
        }
        await sleep(300);
      }
      res.json({ updated, total: podcasts.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route for generating the script
  app.post('/api/generate-script', async (req, res) => {
    try {
      const {
        subject,
        sourceType,
        contentMode,
        articleSourceType,
        articleText,
        articleText2,
        articleUrl,
        articleUrl2,
        specificWords,
        length,
        level,
        hostCount,
        speakerNames,
        language,
      } = req.body;

      const host1 = speakerNames?.host1 || 'Alex';
      const host2 = speakerNames?.host2 || 'Sam';

      const isSubjectMode = sourceType === 'subject';
      let prompt = '';
      let tools: any[] = [];

      if (contentMode === 'roleplay') {
        prompt = `Create a role play script between two speakers: ${host1} (Female) and ${host2} (Male).\n\nScenario: ${subject}`;
        tools = [];
      } else if (isSubjectMode) {
        prompt = `Generate a podcast script about "${subject}".`;
        tools = [];
      } else if (articleSourceType === 'url') {
        // Fetch URL content server-side and pass as text to Claude
        const fetchArticle = async (url: string): Promise<string> => {
          const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          if (!r.ok) throw new Error(`Could not fetch URL (${r.status}): ${url}`);
          const html = await r.text();
          // Strip HTML tags and collapse whitespace
          return html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim()
            .slice(0, 12000);
        };

        let fetchedText1 = '';
        let fetchedText2 = '';
        try { fetchedText1 = await fetchArticle(articleUrl); } catch (e: any) {
          return res.status(400).json({ error: `ERROR: COULD NOT ACCESS LINK — ${e.message}` });
        }
        if (articleUrl2) {
          try { fetchedText2 = await fetchArticle(articleUrl2); } catch { /* ignore second URL failure */ }
        }

        prompt = `Generate a podcast script based on the following article content:

--- ARTICLE 1 START ---
${fetchedText1}
--- ARTICLE 1 END ---
${fetchedText2 ? `\n--- ARTICLE 2 START ---\n${fetchedText2}\n--- ARTICLE 2 END ---` : ''}

The podcast should summarize and discuss the key points of the article(s) in an engaging way.`;
        tools = [];
      } else {
        prompt = `Generate a podcast script based on the following article(s):
        
        --- ARTICLE 1 START ---
        ${articleText}
        --- ARTICLE 1 END ---
        
        ${articleText2 ? `
        --- ARTICLE 2 START ---
        ${articleText2}
        --- ARTICLE 2 END ---
        ` : ''}
        
        The podcast should summarize and discuss the key points of these articles in an engaging way.`;
      }

      if (specificWords) {
        prompt += `\n\nPlease make sure to include these specific words or phrases: ${specificWords}.`;
      }

      const userPrompt = `${prompt}

Target Length: EXACTLY ${length} minutes of spoken audio. Write between ${length * 150} and ${length * 165} words of actual dialogue (not counting speaker labels). Do not write fewer OR more words than this range.
English Level: ${level} (CEFR).
${contentMode === 'roleplay'
  ? `The script MUST be a role play dialogue between ${host1} (Female) and ${host2} (Male). They should act out the scenario naturally and conversationally.`
  : hostCount === 'two'
    ? `The script MUST be a dialogue between two hosts: ${host1} (Female) and ${host2} (Male).`
    : `The script MUST be a monologue by a single host: ${host1} (Female).`
}
${contentMode !== 'roleplay' ? `Today's date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Use this to correctly describe whether events are past, happening now, or upcoming — but do NOT mention or state the date in the script itself.` : ''}

IMPORTANT:
1. Start your response with a short, catchy title for this podcast episode on the first line, formatted as "TITLE: [Your Title]".
2. On the very next line, write the DESCRIPTION formatted as "DESCRIPTION: [Your Description]". ${isSubjectMode ? 'Write the topic/subject in NO MORE THAN 6 WORDS.' : 'Write ONLY the original title of the article (as it appears in the source), nothing else.'}
3. After the ${hostCount === 'two' ? 'dialogue' : 'monologue'}, include a section titled "VOCABULARY CHART" containing exactly 10 interesting words, phrases, or idioms used in the script.
3. For each vocabulary item, provide a simple explanation/definition in the format: "Word/Phrase = Explanation".

Format:
TITLE: [Short Title]
${host1}: [Text]
${hostCount === 'two' ? `${host2}: [Text]` : ''}
...

VOCABULARY CHART
1. Word/Phrase = Explanation
2. Word/Phrase = Explanation
...

Keep the conversation natural and engaging. Do not include any stage directions or non-spoken text.`;

      const finalUserPrompt = language === 'spanish'
        ? userPrompt + '\n\nIMPORTANT: Write the ENTIRE podcast script in Spanish. All dialogue, vocabulary chart, and content must be in Spanish.'
        : userPrompt;

      const scriptMsg = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 4096,
        temperature: 0.7,
        messages: [{ role: 'user', content: finalUserPrompt }],
      });
      const fullText = (scriptMsg.content[0] as { type: string; text: string }).text || '';

      // Grammar tips: allowed patterns per level
      const grammarByLevel: Record<string, string> = {
        A1: 'verb to be, past simple',
        A2: 'verb to be, past simple, present simple',
        B1: 'verb to be, past simple, present simple, present progressive, prepositions, passive voice (simple tenses only), modal verbs',
        B2: 'present perfect, present perfect progressive, passive in all tenses (passive simple, passive progressive, passive perfect, etc.), modal verbs (advanced usage)',
        C1: 'present perfect, present perfect progressive, passive in all tenses, modal verbs (advanced usage), conditionals (all types), reported speech',
        C2: 'conditionals, reported speech, mixed tenses, inversion, subjunctive, cleft sentences, advanced modal verbs, complex passive structures',
      };
      const allowedPatterns = grammarByLevel[level] || grammarByLevel['B2'];
      const grammarPrompt = `You are an expert English grammar teacher. Read the podcast transcript below and identify 1 or 2 grammar patterns from this allowed list: ${allowedPatterns}. Return 2 if you can find 2 clear examples, otherwise return 1. Never return an empty array — always return at least 1.

PREPOSITIONS GUIDANCE (when "prepositions" is in the allowed list):
- Prepositions here means time and place prepositions: "in" (in the morning, in 2024, in summer), "on" (on Monday, on the weekend, on the street), "at" (at school, at home, at night, at the weekend).
- Occasionally choose prepositions as one of the 2 tips (not every time — vary it with verb tenses across podcasts).
- When you do choose prepositions, the examples should contrast in/on/at to help learners understand when to use each.

STRICT RULES:
- NEVER teach perfect tenses for levels A1, A2, or B1.
- For B1 passive voice: ONLY use simple tenses (e.g. "is made", "was built"). NEVER use passive perfect ("has been made", "had been built") or passive progressive ("is being made") in the examples — those are too advanced for B1. The 3 examples (positive, negative, question) must all use simple passive only.
- The podcastExample sentence MUST genuinely come from the transcript and contain the grammar pattern you name. Double-check before choosing.
- For present simple: the sentence must use the BASE FORM of the verb (e.g. "they play", "she plays", "companies use"). DO NOT pick sentences with "have/has + past participle" — that is present perfect, not present simple.
- For present perfect: the sentence must contain "have" or "has" + past participle (e.g. "have reduced", "has grown"). Verify the verb form before choosing.
- Present progressive requires a form of "to be" + verb+ing (e.g. "is playing", "are running"). Do NOT label a sentence as present progressive if it does not contain is/am/are + verb+ing.
- Present simple uses the base form of the verb (e.g. "they play", "she plays"). Do not confuse it with progressive or perfect.
- Before finalising each podcastExample, explicitly verify: does this sentence contain the exact grammatical structure I named? If no, search the transcript again.
- Only pick sentences where the grammar pattern is clearly and unambiguously present.
- formulaHighlights must be substrings of formula (exactly as they appear).
- podcastHighlights must be substrings of podcastExample (exactly as they appear).
- examples[].highlights must be substrings of the corresponding sentence.
- examples must always contain exactly 3 items: one positive, one negative, one question — in that order.
- highlights must include the auxiliary/main verb words that show the grammar pattern (e.g. for negative present simple: "doesn't"/"don't" AND the main verb; for questions: the auxiliary "do/does/is/are/have" AND the main verb).
- Return ONLY a raw JSON array, no markdown, no code fences, no extra text.
${language === 'spanish' ? '- The podcast is in SPANISH. The podcastExample must be a Spanish sentence from the transcript. All 3 example sentences (positive, negative, question) must be in Spanish. Explanations (formula, whenToUse) stay in English.' : ''}

[
  {
    "pattern": "Pattern Name (e.g. Passive Progressive)",
    "formula": "structural formula (e.g. is/am/are + being + V3)",
    "formulaHighlights": ["is/am/are", "being", "V3"],
    "whenToUse": "One plain sentence explaining when to use this pattern.",
    "podcastExample": "Exact sentence from the transcript that contains this pattern.",
    "podcastHighlights": ["grammatical", "key words"],
    "examples": [
      { "type": "positive", "sentence": "The company sells products every day.", "highlights": ["sells"] },
      { "type": "negative", "sentence": "The manager doesn't arrive early.", "highlights": ["doesn't", "arrive"] },
      { "type": "question", "sentence": "Do the employees like their job?", "highlights": ["Do", "like"] }
    ]
  }
]

Transcript:
${fullText}`;

      let grammarTips: { pattern: string; formula: string; formulaHighlights: string[]; whenToUse: string; podcastExample: string; podcastHighlights: string[]; examples: { type: string; sentence: string; highlights: string[] }[] }[] = [];
      try {
        const grammarMsg = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          temperature: 0.3,
          messages: [{ role: 'user', content: grammarPrompt }],
        });
        const grammarText = (grammarMsg.content[0] as { type: string; text: string }).text.trim()
          .replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
        grammarTips = JSON.parse(grammarText);
      } catch (grammarErr: any) {
        console.error('Grammar tips generation failed:', grammarErr?.message || grammarErr);
        grammarTips = [];
      }

      // Extract publication/source name from article content (only for article-based, non-roleplay podcasts)
      let sourceName = '';
      if (sourceType !== 'subject' && contentMode !== 'roleplay') {
        try {
          const articleContent = articleSourceType === 'url'
            ? (prompt.match(/--- ARTICLE 1 START ---\n([\s\S]*?)\n--- ARTICLE 1 END ---/)?.[1] || '').slice(0, 3000)
            : (articleText || '').slice(0, 3000);
          if (articleContent.trim()) {
            const sourceMsg = await anthropic.messages.create({
              model: 'claude-haiku-4-5',
              max_tokens: 60,
              messages: [{
                role: 'user',
                content: `Look at this article text and identify the name of the publication or website that published it (e.g. "The New York Times", "Ynet", "BBC"). Return ONLY the publication name as plain text, nothing else. If you cannot identify a publication name, return an empty string.\n\nArticle: ${articleContent}`,
              }],
            });
            sourceName = ((sourceMsg.content[0] as { type: string; text: string }).text || '').trim();
          }
        } catch {
          sourceName = '';
        }
      }

      res.json({ fullText, grammarTips, sourceName });
    } catch (error: any) {
      console.error("Script generation failed on server:", error);
      res.status(error?.status || 500).json({ error: error?.message || String(error) });
    }
  });

  // Audio generation via Microsoft Edge TTS (neural voices)
  app.post('/api/generate-audio', async (req, res) => {
    try {
      const { script, speechSpeed, level, hostCount, speakerNames, language } = req.body;
      const host1Name = speakerNames?.host1 || 'Alex';

      // Voice constants
      const VOICE_FEMALE_US = 'en-US-EmmaMultilingualNeural';   // two-host female
      const VOICE_MALE_US   = 'en-US-AndrewMultilingualNeural'; // two-host male
      const VOICE_FEMALE_GB = 'en-GB-SoniaNeural';              // one-host (British)
      const VOICE_FEMALE_ES = 'es-ES-ElviraNeural';
      const VOICE_MALE_ES   = 'es-ES-AlvaroNeural';

      const getVoice = (speaker: string) => {
        if (language === 'spanish') {
          if (hostCount === 'one') return VOICE_FEMALE_ES;
          return speaker === host1Name ? VOICE_FEMALE_ES : VOICE_MALE_ES;
        }
        if (hostCount === 'one') return VOICE_FEMALE_GB;
        return speaker === host1Name ? VOICE_FEMALE_US : VOICE_MALE_US;
      };

      // Speaking rate: 90% speed → 0.9, A1/A2 capped at 0.8
      const baseRate = (speechSpeed ?? 100) / 100;
      const rate = (level === 'A1' || level === 'A2') ? Math.min(baseRate, 0.8) : baseRate;

      const edgeTtsLine = async (voice: string, text: string): Promise<Buffer> => {
        const tts = new MsEdgeTTS();
        await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
        const { audioStream } = await tts.toStream(text, { rate });
        return new Promise((resolve, reject) => {
          const chunks: Buffer[] = [];
          audioStream.on('data', (chunk: Buffer) => chunks.push(chunk));
          audioStream.on('end', () => resolve(Buffer.concat(chunks)));
          audioStream.on('error', reject);
        });
      };

      // Strip VOCABULARY CHART and split into speaker lines, merging continuation lines
      const speakerPattern = /^[A-Za-z0-9 ]{1,30}:/;
      const entries: { voice: string; text: string }[] = [];
      for (const line of script.split('\n')) {
        const t = line.trim();
        if (!t) continue;
        if (t.startsWith('VOCABULARY')) break;
        if (/^\d+\.\s/.test(t)) continue;
        if (speakerPattern.test(t)) {
          const colonIdx = t.indexOf(':');
          const speaker = t.substring(0, colonIdx).trim();
          const text = t.substring(colonIdx + 1).trim();
          if (text) entries.push({ voice: getVoice(speaker), text });
        } else if (entries.length > 0) {
          // Continuation line — append to last speaker's text
          entries[entries.length - 1].text += ' ' + t;
        } else {
          // Plain text with no speaker prefix — treat as single speaker
          entries.push({ voice: getVoice(''), text: t });
        }
      }
      const tasks = entries;

      const audioBuffers: Buffer[] = [];
      for (const t of tasks) {
        audioBuffers.push(await edgeTtsLine(t.voice, t.text));
      }
      const combined = Buffer.concat(audioBuffers);
      res.json({ base64Pcm: combined.toString('base64'), mimeType: 'audio/mpeg' });
    } catch (error: any) {
      console.error('Audio generation failed:', error);
      res.status(500).json({ error: error?.message || String(error) });
    }
  });


  // Vite development vs production middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
