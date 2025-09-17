import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
});

export async function main(message: string): Promise<string> {
    try {
        if (!process.env.GOOGLE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
            throw new Error('Missing Google AI API key. Please set GOOGLE_AI_API_KEY or GEMINI_API_KEY in environment variables.');
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: message,
        });

        if (!response.text) throw new Error('Empty response from Gemini API');
        return response.text;
    } catch (reason) {
        const errorMessage = reason instanceof Error ? reason.message : 'Unexpected error';
        console.error('Gemini API Error:', errorMessage);
        throw new Error(errorMessage);
    }
}