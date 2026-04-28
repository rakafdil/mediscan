import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    gender,
    age,
    height,
    weight,
    histories,
    location,
    symptoms,
    weather,
  } = body;

  const bmi = (Number(weight) / (Number(height) / 100) ** 2).toFixed(2);

  const systemPrompt = `You are a medical symptom extraction assistant for MediScan.

Your task is to analyze a patient's free-text symptom description and extract structured symptom data.

Patient context:
- Age: ${age}, Gender: ${gender}
- BMI: ${bmi} (Height: ${height}cm, Weight: ${weight}kg)
- Location: ${location}
- Weather condition: ${weather}
- Medical history: ${JSON.stringify(histories)}

Rules:
1. Extract ONLY symptoms explicitly or implicitly mentioned in the user's text.
2. For each symptom, estimate a reasonable duration if not stated (e.g. "unknown").
3. Severity must be one of: "Mild", "Moderate", "Severe".
4. Respond ONLY in valid JSON — no explanation, no markdown.
5. Recognize informal, colloquial, or slang health terms in any language and map them to their proper medical symptom names.
6. "bapil" is informal Indonesian slang for "batuk pilek" (cough + runny nose) — recognize common informal/slang health terms.
7. add the scientific names after the general names of what user input (e.g. Batuk pilek (common cold))
8. Treat each symptom as INDEPENDENT — do not infer causation between symptoms. Extract what the user states, nothing more.
9. For each symptom, extract any additional contextual detail the user mentions (e.g. timing, triggers, associated sensations) into the "description" field. If none, leave as empty string.
10. Format:
{
  "response_for_user": "string (brief, empathetic summary in the same language as user input)",
  "symptoms": [
    {
      "name": "string",
      "duration": "string",
      "severity": "Mild" | "Moderate" | "Severe"
      "description": "string" 
    }
  ],
  "symptoms_related": boolean
}

example: 
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: symptoms },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content)
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 },
      );

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Validate API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
