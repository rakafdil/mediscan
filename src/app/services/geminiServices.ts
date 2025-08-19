import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function main(message: object[]) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message,
        });
        console.log(response.text);
        return new Response(null, { status: 204 })
    } catch (reason) {
        const errorMessage = reason instanceof Error ? reason.message : 'Unexpected error'

        return new Response(errorMessage, { status: 500 })
    }
}