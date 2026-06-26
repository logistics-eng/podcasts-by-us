import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const port = 3000;

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
  const app = express();
  app.use(express.json({ limit: '10mb' }));

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
        hostCount 
      } = req.body;

      const isSubjectMode = sourceType === 'subject';
      let prompt = '';
      let tools: any[] = [];

      if (isSubjectMode) {
        prompt = `Generate a podcast script about "${subject}".`;
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
            
            Target Length: approximately ${length} minutes (around ${length * 150} words).
            English Level: ${level} (CEFR).
            ${hostCount === 'two' ? `The script MUST be a dialogue between two hosts: Alex (Female) and Sam (Male).` : `The script MUST be a monologue by a single host: Alex (Female).`}
            
            IMPORTANT: 
            1. Start your response with a short, catchy title for this podcast episode on the first line, formatted as "TITLE: [Your Title]".
            2. After the ${hostCount === 'two' ? 'dialogue' : 'monologue'}, include a section titled "VOCABULARY CHART" containing exactly 10 interesting words, phrases, or idioms used in the script.
            3. For each vocabulary item, provide a simple explanation/definition in the format: "Word/Phrase = Explanation".
            
            Format: 
            TITLE: [Short Title]
            Alex: [Text]
            ${hostCount === 'two' ? 'Sam: [Text]' : ''}
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
      const { chunk, speechSpeed, level, hostCount } = req.body;

      const speedInstruction = speechSpeed !== 100 ? `Speak at ${speechSpeed}% normal speed. ` : '';
      const promptText = `${speedInstruction}${(level === 'A1' || level === 'A2') ? 'Speak slowly and clearly. ' : ''}TTS the following ${hostCount === 'two' ? 'conversation between Alex and Sam' : 'monologue by Alex'}:\n\n${chunk}`;

      const ttsResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: hostCount === 'two' ? {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: 'Alex',
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Ursa' }, // Female
                  }
                },
                {
                  speaker: 'Sam',
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Orion' }, // Male
                  }
                }
              ]
            }
          } : {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Ursa' }, // Female
            }
          },
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
