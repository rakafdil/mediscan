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
1. Extract ONLY symptoms explicitly or implicitly mentioned in the user's text. Do not hallucinate symptoms.
2. For each symptom, estimate a reasonable duration if not stated (e.g. "unknown").
3. Severity must be one of: "Mild", "Moderate", "Severe".
4. Respond ONLY in valid JSON — no explanation, no markdown.
5. Recognize informal, colloquial, or slang health terms in any language and map them to their proper medical symptom names (e.g., "bapil" -> Cough and Coryza).
6. Include the scientific/medical name in parentheses after the general name (e.g., "Batuk pilek (Common cold)").
7. Treat each symptom as INDEPENDENT — do not infer causation between symptoms.
8. For each symptom, extract any additional contextual detail the user mentions (e.g., timing, triggers, associated sensations) into the "description" field. If none, leave as empty string.
9. CRITICAL FOR 'response_for_user': This system is STATELESS and uses a card-based UI. DO NOT ask conversational questions that expect a text reply. Instead, identify missing critical details (e.g., color of fluids, exact triggers, visible swelling/redness) and empathetically INSTRUCT the user to **edit the symptom cards below** (by modifying the description) or **add a new symptom card** to include these specific details. Gently remind them that missing visual/sensory details can cause the real disease to go undetected.
10. Ensure 'response_for_user' matches the 'user_language'.

Format:
{
  "response_for_user": "string (Empathetic instruction telling the user to explicitly edit the generated cards below or add new ones to provide specific missing details like [X] or [Y] to prevent misdiagnosis)",
  "symptoms": [
    {
      "name": "string",
      "duration": "string",
      "severity": "Mild" | "Moderate" | "Severe",
      "description": "string" 
    }
  ],
  "symptoms_related": boolean,
  "user_language": "string"
}
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
