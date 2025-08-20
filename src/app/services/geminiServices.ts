import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function main(message: string) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message,
        });

        return response.text
    } catch (reason) {
        const errorMessage = reason instanceof Error ? reason.message : 'Unexpected error'

        return new Response(errorMessage, { status: 500 })
    }
}