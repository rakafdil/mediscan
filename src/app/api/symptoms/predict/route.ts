import { NextRequest, NextResponse } from "next/server";
import { main } from "@/app/services/geminiServices";

interface UserComplication {
    gender: string
    age: string
    symptoms: string
}

export async function POST(req: NextRequest) {
    const body = await req.json()
    console.log(body)
    const userComplication: UserComplication = {
        gender: body.gender,
        age: body.age,
        symptoms: body.symptoms
    }

    const messages = `{
        "user_question":"saya merupakan ${userComplication.gender} yang berumur ${userComplication.age}. saya memiliki beberapa gejala, yaitu: ${userComplication.symptoms}"
      }

      You are a medical disease prediction assistant.
Your tasks:
1. Predict as accurately as possible what diseases the user might have based on the symptoms they provide.
2. If additional medical knowledge is required, search the web for the most reliable and up-to-date information.
3. Always respond in formal, easy-to-understand Indonesian.
4. You are a strict JSON generator. Respond ONLY with valid JSON in the following format:
      
{
    "result": [
        {
            "disease": "string",        // the name of predicted disease
            "probability": float,       // disease's probabilty from the symptoms
            "description": "string",    // brief descriptions of the disease
            "precautions": [            // list of precaution that user can do
                "string",
                "string"
            ]
        }
    ]
}

Rules:
- Probability must be a decimal number between 0 and 1 (e.g., 0.85 for 85%).
- The "result" array may contain more than one predicted disease.
- All predictions must be relevant to the symptoms provided by the user.
- Do not add unrelated diseases or information.
- Do not output anything outside of the JSON.
      `
        ;

    try {
        const aiText = await main(messages);

        // // Bersihin JSON (kalau AI masih ngereturn pake ```json ... ``` )
        // let cleanJson = aiText
        //     .replace(/```(json)?\s*/gi, "")
        //     .replace(/```$/m, "")
        //     .trim();
        // const parsed = JSON.parse(cleanJson);
        console.log(aiText);
        return NextResponse.json(aiText);
    } catch (e) {
        console.error("JSON Error:", e);
        return NextResponse.json({ error: "Invalid JSON from AI" }, { status: 500 });
    }
}
