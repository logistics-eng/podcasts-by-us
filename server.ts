import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });
dotenv.config();

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
        prompt = `Generate a podcast script about "${subject}". Use Google Search to find the most up-to-date and accurate information on this topic before writing the script.`;
        tools = [{ googleSearch: {} }];
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

      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      let scriptResponse;
      let scriptRetryCount = 0;
      const maxScriptRetries = 3;
      
      while (scriptRetryCount <= maxScriptRetries) {
        try {
          scriptResponse = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
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
          });
          break;
        } catch (error: any) {
          if ((error?.message?.includes('429') || error?.status === 429) && scriptRetryCount < maxScriptRetries) {
            scriptRetryCount++;
            await sleep(Math.pow(2, scriptRetryCount) * 2000);
          } else {
            throw error;
          }
        }
      }

      if (!scriptResponse) throw new Error("Failed to generate script.");

      const fullText = scriptResponse.text || '';
      res.json({ fullText });
    } catch (error: any) {
      console.error("Script generation failed on server:", error);
      res.status(error?.status || 500).json({ error: error?.message || String(error) });
    }
  });

  // API Route for generating a TTS chunk
  app.post('/api/generate-tts', async (req, res) => {
    try {
      const { chunk, speechSpeed, level, hostCount, readAsWritten, voiceName } = req.body;

      const speedInstruction = speechSpeed !== 100 ? `Speak at ${speechSpeed}% normal speed. ` : '';
      const clarityInstruction = (level === 'A1' || level === 'A2') ? 'Speak slowly and clearly. ' : '';
      const readInstruction = readAsWritten ? 'Read the following exactly as written. Do not add, change, or improvise anything. ' : '';
      const promptText = `${speedInstruction}${clarityInstruction}${readInstruction}TTS the following:\n\n${chunk}`;

      const speechConfig = { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' } } };

      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig,
        },
      });

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
