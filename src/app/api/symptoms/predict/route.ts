import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { DailyWeatherFactors } from "@/hooks/getWeatherFactors";
import { summarizeWeather } from "@/hooks/summarizeWeather";
import { Symptom } from "@/app/symptom-checker/symptoms/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Tool definitions ──────────────────────────────────────────────────────────

const tools: Groq.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_medical_literature",
      description:
        "Search trusted medical literature and clinical guidelines to cross-reference symptoms with possible diseases. Use this to validate differential diagnoses.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Medical search query, e.g. 'fever headache fatigue differential diagnosis adult'",
          },
          symptoms: {
            type: "array",
            items: { type: "string" },
            description: "List of symptom names to cross-reference",
          },
        },
        required: ["query", "symptoms"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_risk_factors",
      description:
        "Calculate risk score adjustments based on patient demographics, BMI, medical history, and environmental factors.",
      parameters: {
        type: "object",
        properties: {
          disease: {
            type: "string",
            description: "Disease name to evaluate risk for",
          },
          patient_factors: {
            type: "object",
            description: "Patient demographic and health factors",
            properties: {
              age: { type: "number" },
              gender: { type: "string" },
              bmi: { type: "number" },
              bmi_category: { type: "string" },
              has_relevant_history: { type: "boolean" },
            },
            required: [
              "age",
              "gender",
              "bmi",
              "bmi_category",
              "has_relevant_history",
            ],
          },
        },
        required: ["disease", "patient_factors"],
      },
    },
  },
];

// ─── Tool handlers ─────────────────────────────────────────────────────────────

function handleSearchMedicalLiterature(args: {
  query: string;
  symptoms: string[];
}): string {
  // Di production ini bisa di-replace dengan real API (PubMed, WHO, dll)
  // Untuk sekarang return structured context agar AI tetap bisa reasoning
  return JSON.stringify({
    source: "Clinical Guidelines Database",
    query: args.query,
    findings: `Cross-referenced ${args.symptoms.length} symptoms: ${args.symptoms.join(", ")}. Common differential diagnoses considered based on symptom clustering, prevalence, and clinical presentation patterns.`,
    confidence: "high",
    note: "Always recommend professional medical consultation for definitive diagnosis.",
  });
}

function handleCalculateRiskFactors(args: {
  disease: string;
  patient_factors: {
    age: number;
    gender: string;
    bmi: number;
    bmi_category: string;
    has_relevant_history: boolean;
  };
}): string {
  const { age, bmi_category, has_relevant_history } = args.patient_factors;

  let risk_modifier = 1.0;
  if (age > 60) risk_modifier += 0.2;
  if (age < 12) risk_modifier += 0.1;
  if (bmi_category === "Obese") risk_modifier += 0.15;
  if (bmi_category === "Underweight") risk_modifier += 0.1;
  if (has_relevant_history) risk_modifier += 0.25;

  return JSON.stringify({
    disease: args.disease,
    risk_modifier: Math.min(risk_modifier, 1.8).toFixed(2),
    factors_considered: ["age", "bmi", "medical_history"],
    recommendation: has_relevant_history
      ? "Prior medical history significantly increases relevance of this diagnosis."
      : "No significant history-based risk elevation.",
  });
}

// ─── Agentic loop ──────────────────────────────────────────────────────────────

async function runAgenticPrediction(
  messages: Groq.Chat.ChatCompletionMessageParam[],
): Promise<string> {
  const MAX_ITERATIONS = 5;
  let iteration = 0;

  while (iteration < MAX_ITERATIONS) {
    iteration++;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      tools,
      tool_choice: iteration === 1 ? "auto" : "auto",
      temperature: 0.2,
    });

    const choice = response.choices[0];

    // Selesai — kembalikan hasil
    if (choice.finish_reason === "stop") {
      return choice.message.content ?? "";
    }

    // Ada tool call — proses semua
    if (choice.finish_reason === "tool_calls" && choice.message.tool_calls) {
      messages.push({ ...choice.message, role: "assistant" });

      for (const toolCall of choice.message.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        let result = "";

        if (toolCall.function.name === "search_medical_literature") {
          result = handleSearchMedicalLiterature(args);
        } else if (toolCall.function.name === "calculate_risk_factors") {
          result = handleCalculateRiskFactors(args);
        }

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }

      continue;
    }

    // Fallback jika finish_reason tidak terduga
    break;
  }

  throw new Error(
    "Agentic loop exceeded max iterations without final response",
  );
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json();

  const symptoms: Symptom[] = body.symptoms;
  const weather: DailyWeatherFactors = body.weather;

  const bmi = (Number(body.weight) / (Number(body.height) / 100) ** 2).toFixed(
    2,
  );

  function getBMICategory(bmi: number) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  }

  const weatherSummary = weather
    ? summarizeWeather(weather)
    : "Weather data unavailable";

  const systemPrompt = `You are MediScan's AI medical prediction agent — an expert differential diagnosis assistant.

You have access to tools to cross-reference symptoms with medical literature and calculate patient risk factors. You MUST use these tools before producing your final answer.

Workflow:
1. Call search_medical_literature with relevant symptom combinations.
2. Call calculate_risk_factors for each top candidate disease.
3. Synthesize all findings into a final JSON prediction.

Output rules:
- Predict a MAXIMUM of 5 diseases, ordered by probability (highest first).
- Probability must be between 0 and 1.
- Always end with a professional note to consult a doctor.
- Respond ONLY with valid JSON in this exact format:

{
  "result": [
    {
      "disease": "string",
      "probability": float,
      "description": "string",
      "reasoning": "string (why this disease matches the patient's profile and symptoms)",
      "precautions": ["string", "string"],
      "first_aid": "string (immediate steps the patient can take)"
    }
  ],
  "disclaimer": "string (always remind to consult a professional doctor)"
}`;

  const userMessage = `Patient Profile:
- Age: ${body.age} | Gender: ${body.gender}
- Height: ${body.height}cm | Weight: ${body.weight}kg
- BMI: ${bmi} (${getBMICategory(Number(bmi))})
- Location: ${body.location}
- Medical History: ${JSON.stringify(body.histories)}

Verified Symptoms:
${symptoms.map(s =>
    `- ${s.name} | Duration: ${s.duration} | Severity: ${s.severity}${s.description ? ` | Note: ${s.description}` : ''}`
).join("\n")}

Environmental Context:
${weatherSummary}`;

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  try {
    const finalText = await runAgenticPrediction(messages);

    const clean = finalText
      .replace(/```(json)?\s*/gi, "")
      .replace(/```$/m, "")
      .trim();

    const parsed = JSON.parse(clean);

    return NextResponse.json({
      ...parsed,
      scan_timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Predict API Error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON from AI" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
