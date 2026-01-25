import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_GEN_AI_API_KEY;

if (!API_KEY) {
  console.warn("VITE_GOOGLE_GEN_AI_API_KEY is not set.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");
const model = genAI.getGenerativeModel(
  { model: "gemini-3-flash" },
  { apiVersion: "v1beta" }
);

export const generateContent = async (prompt: string) => {
  if (!API_KEY) {
    throw new Error("API Key is missing");
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
};
