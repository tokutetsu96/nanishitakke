import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load env from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
const envConfig = dotenv.config({ path: envPath }).parsed;
const API_KEY = envConfig?.VITE_GOOGLE_GEN_AI_API_KEY;

if (!API_KEY) {
  console.error("API Key not found in .env.local");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  try {
    const modelResponse = await genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    }); // Just to instantiate, but we need listModels.
    // Wait, the SDK exposes listModels via strict method?
    // Actually the SDK might not directly expose listModels on the main class in all versions,
    // but usually it is separate.
    // Let's check if we can just try a known newer model if this fails, but listing is better.
    // Unfortuantely the @google/generative-ai SDK usually abstracts this.
    // We might need to use the REST API manually for listing if the SDK method isn't obvious.

    // Attempting to match SDK usage for listing...
    // In many versions it is not directly in the high level client.
    // Let's try making a raw fetch request to list models.

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    const data = await response.json();

    if (data.models) {
      console.log("Available Models:");
      data.models.forEach((m) => {
        if (
          m.supportedGenerationMethods &&
          m.supportedGenerationMethods.includes("generateContent")
        ) {
          console.log(`- ${m.name}`);
        }
      });
    } else {
      console.error("Failed to list models:", data);
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
