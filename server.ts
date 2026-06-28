import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality } from '@google/genai';
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

// TTS serial queue: 22s gap between calls stays within ~3 RPM TTS preview limit
let ttsLast = 0;
const ttsQueue: Array<() => void> = [];
let ttsRunning = false;

function ttsCall<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    ttsQueue.push(async () => {
      const wait = Math.max(0, ttsLast + 22000 - Date.now());
      if (wait > 0) await sleep(wait);
      ttsLast = Date.now();
      try { resolve(await geminiWithRetry(fn, 2, 25000)); } catch (e) { reject(e); }
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
}

// Shared Gemini client defined on the server side
// We set 'User-Agent' header to 'aistudio-build' in httpOptions for telemetry.
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

  // Save a podcast
  app.post('/api/podcasts', async (req, res) => {
    try {
      const { title, transcript, vocabulary, audioData, level, hostCount } = req.body;
      const result = await pool.query(
        'INSERT INTO podcasts (title, transcript, vocabulary, audio_data, level, host_count) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, title, level, host_count, created_at',
        [title, transcript, vocabulary, audioData, level, hostCount]
      );
      res.json(result.rows[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // List all podcasts
  app.get('/api/podcasts', async (_req, res) => {
    try {
      const result = await pool.query('SELECT id, title, description, level, host_count, created_at FROM podcasts ORDER BY created_at DESC');
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

  // API Route for generating the script
  app.post('/api/generate-script', async (req, res) => {
    try {
      const { 
        subject, 
        sourceType, 
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
      } = req.body;

      const host1 = speakerNames?.host1 || 'Alex';
      const host2 = speakerNames?.host2 || 'Sam';

      const isSubjectMode = sourceType === 'subject';
      let prompt = '';
      let tools: any[] = [];

      if (isSubjectMode) {
        prompt = `Generate a podcast script about "${subject}".`;
        tools = [];
      } else if (articleSourceType === 'url') {
        prompt = `I am providing URLs to articles: 
        Article 1: ${articleUrl}
        ${articleUrl2 ? `Article 2: ${articleUrl2}` : ''}
        
        Your task is to generate a podcast script based on the ACTUAL CONTENT of the articles at these URLs.
        
        CRITICAL INSTRUCTIONS:
        1. Access the URLs directly using your tools.
        2. If a URL is a shortened link (like share.google, bit.ly, etc.) and you see an error page or "Something went wrong", DO NOT use that as the topic.
        3. Instead, use Google Search to find the original article that this link points to. Search for the URL itself or any descriptive text you can find.
        4. If you absolutely cannot find the content of the articles after trying both direct access and search, you MUST start your response with the exact phrase: "ERROR: COULD NOT ACCESS LINK". 
        5. DO NOT hallucinate a topic like "digital memories" or "broken links" if you can't find the content.
        
        The podcast should summarize and discuss the key points of the articles in an engaging way.`;
        tools = [{ urlContext: {} }, { googleSearch: {} }];
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

      const scriptResponse = await geminiWithRetry(() => ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `${prompt}
            
            Today's date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Use this to correctly describe whether events are past, happening now, or upcoming — but do NOT mention or state the date in the script itself.
            Target Length: EXACTLY ${length} minutes of spoken audio. Write between ${length * 150} and ${length * 165} words of actual dialogue (not counting speaker labels). Do not write fewer OR more words than this range.
            English Level: ${level} (CEFR).
            ${hostCount === 'two' ? `The script MUST be a dialogue between two hosts: ${host1} (Female) and ${host2} (Male).` : `The script MUST be a monologue by a single host: ${host1} (Female).`}

            IMPORTANT:
            1. Start your response with a short, catchy title for this podcast episode on the first line, formatted as "TITLE: [Your Title]".
            2. After the ${hostCount === 'two' ? 'dialogue' : 'monologue'}, include a section titled "VOCABULARY CHART" containing exactly 10 interesting words, phrases, or idioms used in the script.
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
            
            Keep the conversation natural and engaging. Do not include any stage directions or non-spoken text.`,
            config: {
              temperature: 0.7,
              tools: tools.length > 0 ? tools : undefined,
            }
          }));

      const fullText = scriptResponse.text || '';
      res.json({ fullText });
    } catch (error: any) {
      console.error("Script generation failed on server:", error);
      res.status(error?.status || 500).json({ error: error?.message || String(error) });
    }
  });

  // All-in-one audio generation: chunks script, runs TTS sequentially, returns combined PCM
  app.post('/api/generate-audio', async (req, res) => {
    try {
      const { script, speechSpeed, level, hostCount, readAsWritten, speakerNames } = req.body;
      const host1Name = speakerNames?.host1 || 'Alex';
      const host2Name = speakerNames?.host2 || 'Sam';

      const speedInstruction = speechSpeed !== 100 ? `Speak at ${speechSpeed}% normal speed. ` : '';
      const clarityInstruction = (level === 'A1' || level === 'A2') ? 'Speak slowly and clearly. ' : '';
      const readInstruction = readAsWritten ? 'Read the following exactly as written. Do not add, change, or improvise anything. ' : '';

      const speechConfig = hostCount === 'two'
        ? {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                { speaker: host1Name, voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                { speaker: host2Name, voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } },
              ],
            },
          }
        : { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } };

      // Split script into 1200-char chunks
      const chunks: string[] = [];
      let current = '';
      for (const line of script.split('\n')) {
        if (!line.trim()) continue;
        const trimmed = line.trim();
        if (current.length + trimmed.length > 1200) {
          if (current) chunks.push(current.trim());
          current = trimmed + '\n';
        } else {
          current += trimmed + '\n';
        }
      }
      if (current) chunks.push(current.trim());

      const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
      const pcmParts: Buffer[] = [];

      for (let i = 0; i < chunks.length; i++) {

        const promptText = `${speedInstruction}${clarityInstruction}${readInstruction}TTS the following:\n\n${chunks[i]}`;

        const ttsResponse = await ttsCall(() => ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-tts',
          contents: [{ parts: [{ text: promptText }] }],
          config: { responseModalities: [Modality.AUDIO], speechConfig },
        }));
        const audioPart = ttsResponse.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        if (audioPart?.inlineData?.data) {
          pcmParts.push(Buffer.from(audioPart.inlineData.data, 'base64'));
        }
      }

      const combined = Buffer.concat(pcmParts);
      res.json({ base64Pcm: combined.toString('base64') });
    } catch (error: any) {
      console.error('Audio generation failed:', error);
      res.status(error?.status || 500).json({ error: error?.message || String(error) });
    }
  });

  // API Route for generating a TTS chunk
  app.post('/api/generate-tts', async (req, res) => {
    try {
      const { chunk, speechSpeed, level, hostCount, readAsWritten, speakerNames } = req.body;

      const speedInstruction = speechSpeed !== 100 ? `Speak at ${speechSpeed}% normal speed. ` : '';
      const clarityInstruction = (level === 'A1' || level === 'A2') ? 'Speak slowly and clearly. ' : '';
      const readInstruction = readAsWritten ? 'Read the following exactly as written. Do not add, change, or improvise anything. ' : '';
      const promptText = `${speedInstruction}${clarityInstruction}${readInstruction}TTS the following:\n\n${chunk}`;

      const host1Name = speakerNames?.host1 || 'Alex';
      const host2Name = speakerNames?.host2 || 'Sam';
      const speechConfig = hostCount === 'two'
        ? {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                { speaker: host1Name, voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                { speaker: host2Name, voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } },
              ],
            },
          }
        : { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } };

      const ttsResponse = await geminiCall(() => ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig,
        },
      }));

      const audioPart = ttsResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      const base64Audio = audioPart?.inlineData?.data || null;
      const mimeType = audioPart?.inlineData?.mimeType || 'audio/pcm';

      res.json({ base64Audio, mimeType });
    } catch (error: any) {
      console.error("TTS generation failed on server:", error);
      res.status(error?.status || 500).json({ error: error?.message || String(error) });
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
