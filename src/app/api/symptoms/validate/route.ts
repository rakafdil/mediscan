import { NextRequest, NextResponse } from "next/server";
import { main } from "@/app/services/geminiServices";

export async function POST(req: NextRequest) {
    const { gejala } = await req.json();

    const messages = [
        {
            role: "user",
            content: `{
        "user_question":"${gejala}"
      }

      You are a diagnoses validator and specifier. Your only tasks are:
      1. Validate if the user is providing their symptoms/diagnosis.
      2. If valid, respond by politely asking *only* about the symptoms they have already mentioned — no new symptoms should be introduced.
      3. Always use formal, easy-to-understand language in the "response_for_user".
      4. Always respond strictly in JSON format as follows:
      {
        "response_for_user": "string",
        "symptoms": ["string", "string", "..."],
        "symptoms_related": true | false
      }
        
      Rules:
    - "response_for_user" should be a single sentence or paragraph asking the user follow-up questions about the symptoms they mentioned.
    - "symptoms" must be an array containing only the symptoms explicitly mentioned by the user in this turn.
    - Do not infer or add unrelated symptoms.
    - Always produce valid JSON with no extra text outside the JSON.
      `
        }
    ];

    try {
        const aiText = await main(messages);

        // // Bersihin JSON (kalau AI masih ngereturn pake ```json ... ``` )
        // let cleanJson = aiText
        //     .replace(/```(json)?\s*/gi, "")
        //     .replace(/```$/m, "")
        //     .trim();
        // const parsed = JSON.parse(cleanJson);
        return NextResponse.json(aiText);
    } catch (e) {
        console.error("JSON Error:", e);
        return NextResponse.json({ error: "Invalid JSON from AI" }, { status: 500 });
    }
}
