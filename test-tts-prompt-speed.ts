import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from 'fs';

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  try {
    const ttsResponse = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: "Speak at 80% normal speed. TTS the following conversation between Alex and Sam:\n\nAlex: Hello!\nSam: Hi Alex. I am speaking very slowly now to see if it works." }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              { speaker: 'Alex', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Ursa' } } },
              { speaker: 'Sam', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Orion' } } }
            ]
          }
        },
      },
    });
    const audioPart = ttsResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if(audioPart?.inlineData?.data) {
        fs.writeFileSync('test80.pcm', Buffer.from(audioPart.inlineData.data, 'base64'));
        console.log("Wrote 80%");
    }
    
    const ttsResponse2 = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: "Speak at 100% normal speed. TTS the following conversation between Alex and Sam:\n\nAlex: Hello!\nSam: Hi Alex. I am speaking very slowly now to see if it works." }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              { speaker: 'Alex', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Ursa' } } },
              { speaker: 'Sam', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Orion' } } }
            ]
          }
        },
      },
    });
    const audioPart2 = ttsResponse2.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if(audioPart2?.inlineData?.data) {
        fs.writeFileSync('test100.pcm', Buffer.from(audioPart2.inlineData.data, 'base64'));
        console.log("Wrote 100%");
    }
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}
run();
