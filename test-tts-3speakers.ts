import { GoogleGenAI, Modality } from "@google/genai";

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  try {
    const ttsResponse = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: "TTS the following conversation between Alex and Sam: Alex: Hi Sam. Sam: Hi Alex. Bob: Hello." }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              { speaker: 'Alex', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } },
              { speaker: 'Sam', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } }
            ]
          }
        },
      },
    });
    const audioPart = ttsResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    console.log("Mime type:", audioPart?.inlineData?.mimeType);
    console.log("Has data:", !!audioPart?.inlineData?.data);
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}
run();
