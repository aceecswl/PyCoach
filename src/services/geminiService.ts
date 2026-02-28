import { GoogleGenAI, Type, ThinkingLevel, Modality, LiveServerMessage } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey });

export const tutorChat = ai.chats.create({
  model: "gemini-3.1-pro-preview",
  config: {
    systemInstruction: "You are a friendly and expert Python tutor. Your goal is to help users learn Python through practical examples and clear explanations. Always provide code snippets in Python. If a user asks a complex question, use your thinking capabilities to provide a thorough answer.",
    thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
  },
});

export async function analyzeCode(code: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Analyze this Python code for bugs, style improvements, and explain what it does:\n\n\`\`\`python\n${code}\n\`\`\``,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING, description: "A brief explanation of what the code does." },
          bugs: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of potential bugs or errors." },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of style or performance improvements." },
          output: { type: Type.STRING, description: "Simulated output if the code were to run." }
        },
        required: ["explanation", "bugs", "improvements", "output"]
      }
    }
  });
  return JSON.parse(response.text);
}

export async function generateLesson(topic: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a practical Python lesson about: ${topic}. Include a brief explanation, a code example, and a small exercise for the user.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  return response.text;
}

export async function generateConceptImage(concept: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: {
      parts: [{ text: `A clean, educational diagram or illustration explaining the Python concept: ${concept}. Minimalist style, high contrast, suitable for a learning dashboard.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "1K"
      }
    }
  });
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export function connectVoiceTutor(callbacks: {
  onopen?: () => void;
  onmessage: (message: LiveServerMessage) => void;
  onerror?: (error: any) => void;
  onclose?: () => void;
}) {
  return ai.live.connect({
    model: "gemini-2.5-flash-native-audio-preview-09-2025",
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
      },
      systemInstruction: "You are a friendly Python tutor. Have a conversation with the user about Python. Keep it interactive and encouraging.",
    },
  });
}

export async function generateConceptVideo(concept: string) {
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `An educational animation explaining the Python concept: ${concept}. Clear, minimalist, professional motion graphics.`,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) return null;

  const response = await fetch(downloadLink, {
    method: 'GET',
    headers: {
      'x-goog-api-key': apiKey,
    },
  });
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function editConceptImage(base64Image: string, prompt: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(',')[1],
            mimeType: 'image/png',
          },
        },
        {
          text: prompt,
        },
      ],
    },
  });
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}
