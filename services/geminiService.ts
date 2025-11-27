import { GoogleGenAI, Type, Schema } from "@google/genai";
import { VocabularyItem, DifficultyLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const vocabularySchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      english: { type: Type.STRING, description: "The English word or phrase." },
      russian: { type: Type.STRING, description: "The Russian translation." },
      transcription: { type: Type.STRING, description: "Phonetic transcription (IPA)." },
      definition: { type: Type.STRING, description: "Short definition in English." },
      example: { type: Type.STRING, description: "A simple example sentence using the word." },
    },
    required: ["english", "russian", "transcription", "definition", "example"],
  },
};

export const generateVocabulary = async (
  topic: string,
  level: DifficultyLevel
): Promise<VocabularyItem[]> => {
  try {
    const prompt = `Generate a list of 10 useful English words, idioms, or phrases related to the topic "${topic}" for a student at the "${level}" level. Ensure the Russian translations are accurate and natural.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: vocabularySchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as VocabularyItem[];
  } catch (error) {
    console.error("Error generating vocabulary:", error);
    throw error;
  }
};
