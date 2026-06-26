import { GoogleGenAI, Modality } from "@google/genai";

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  try {
    let script = "";
    for (let i = 0; i < 50; i++) {
        script += "Alex: Blah blah blah this is a very long sentence that just keeps going and going and going and going. I'm trying to reach 2500 characters so let me just type more stuff here. I wonder what happens if the payload is too large.\nSam: Me too. Let's see what happens!\n";
    }
    console.log("Length:", script.length);

    const ttsResponse = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: "TTS the following conversation between Alex and Sam:\n\n" + script }] }],
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
