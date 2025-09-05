import { NextRequest, NextResponse } from "next/server";
import { main } from "@/app/services/geminiServices";
import { UserComplication } from "@/app/symptom-checker/symptoms/types";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log(body);

        const userComplication: UserComplication = {
            gender: body.gender,
            age: body.age,
            symptoms: body.symptoms,
            histories: body.histories,
            location: body.location
        };

        const messages = `{
    "user_data": {age: "${userComplication.age}", gender: "${userComplication.gender}", location: "${userComplication.location}", histories: "${userComplication.histories}"},
        "user_question":"saya merupakan ${userComplication.gender} yang berumur ${userComplication.age}. saya memiliki beberapa gejala, yaitu: ${userComplication.symptoms}"
      }

      You are a medical disease prediction assistant.
Your tasks:
1. Predict as accurately as possible what diseases the user might have based on the symptoms they provide.
2. Produce the results as many as possible for the user to 
3. If additional medical knowledge is required, search the web for the most reliable and up-to-date information.
4. Always respond in formal, easy-to-understand Indonesian.
5. You are a strict JSON generator. Respond ONLY with valid JSON in the following format:
      
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
      `;

        const aiText = await main(messages);
        console.log("AI Response:", aiText);

        if (!aiText) {
            return NextResponse.json({ error: "No response from AI service" }, { status: 500 });
        }

        const cleanJson = aiText
            .replace(/```(json)?\s*/gi, "")
            .replace(/```$/m, "")
            .trim();

        const parsed = JSON.parse(cleanJson);
        console.log("Parsed JSON:", parsed);
        return NextResponse.json(parsed);

    } catch (error) {
        console.error("API Error:", error);

        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: "Invalid JSON from AI" }, { status: 500 });
        }

        return NextResponse.json({
            error: "Internal server error",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}