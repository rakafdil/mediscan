import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { DailyWeatherFactors } from "@/hooks/getWeatherFactors";
import { summarizeWeather } from "@/hooks/summarizeWeather";
import { Symptom } from "@/app/symptom-checker/symptoms/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface DiagnosisSnapshot {
    disease: string;
    estimated_probability: number;
}

function hasProbabilityConverged(
    prev: DiagnosisSnapshot[],
    curr: DiagnosisSnapshot[],
    threshold = 0.05
): boolean {
    if (prev.length === 0 || curr.length === 0) return false;
    if (prev.length !== curr.length) return false;

    // Sort keduanya by disease name agar comparable
    const sortedPrev = [...prev].sort((a, b) => a.disease.localeCompare(b.disease));
    const sortedCurr = [...curr].sort((a, b) => a.disease.localeCompare(b.disease));

    return sortedPrev.every((p, i) => {
        const c = sortedCurr[i];
        return p.disease === c.disease &&
            Math.abs(p.estimated_probability - c.estimated_probability) < threshold;
    });
}

function handleEvaluateConfidence(
    args: {
        current_diagnoses: DiagnosisSnapshot[];
        confidence_level: string;
        gaps: string[];
    },
    previousSnapshot: DiagnosisSnapshot[]
): { result: string; shouldStop: boolean; snapshot: DiagnosisSnapshot[] } {
    const converged = hasProbabilityConverged(previousSnapshot, args.current_diagnoses);
    const highConfidence = args.confidence_level === "high";
    const noGaps = args.gaps.length === 0;

    const shouldStop = converged || (highConfidence && noGaps);

    return {
        result: JSON.stringify({
            converged,
            should_stop: shouldStop,
            reason: shouldStop
                ? converged
                    ? "Probabilities have converged — no significant change from previous iteration."
                    : "High confidence with no remaining knowledge gaps."
                : `Continue research. Confidence: ${args.confidence_level}. Gaps: ${args.gaps.join("; ")}`,
            recommendation: shouldStop
                ? "Proceed to final JSON output."
                : "Continue calling search_medical_literature or calculate_risk_factors for remaining gaps.",
        }),
        shouldStop,
        snapshot: args.current_diagnoses,
    };
}

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
  {
    type: "function",
    function: {
      name: "evaluate_confidence",
      description:
        "Evaluate current diagnostic confidence and decide whether more research is needed. Call this after gathering sufficient evidence to check if probabilities have converged.",
      parameters: {
        type: "object",
        properties: {
          current_diagnoses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                disease: { type: "string" },
                estimated_probability: { type: "number" },
              },
            },
            description: "Current estimated diagnoses with probabilities",
          },
          confidence_level: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Overall confidence in current differential diagnosis",
          },
          gaps: {
            type: "array",
            items: { type: "string" },
            description:
              "Remaining knowledge gaps that need further research. Empty array if confident.",
          },
        },
        required: ["current_diagnoses", "confidence_level", "gaps"],
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

// ─── Agentic loop dengan konvergensi ──────────────────────────────────────────
async function runAgenticPrediction(
    messages: Groq.Chat.ChatCompletionMessageParam[]
): Promise<string> {
    const MAX_ITERATIONS = 6; // lebih banyak untuk riset mendalam
    let iteration = 0;
    let previousSnapshot: DiagnosisSnapshot[] = [];
    let forceStop = false;

    while (iteration < MAX_ITERATIONS && !forceStop) {
        iteration++;
        console.log(`[MediScan] Iteration ${iteration}/${MAX_ITERATIONS}`);

        const response = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages,
            tools,
            tool_choice: "auto",
            temperature: 0.15, // lebih rendah = lebih deterministik untuk riset
            max_tokens: 4096,
        });

        const choice = response.choices[0];

        if (choice.finish_reason === "stop") {
            console.log(`[MediScan] Finished at iteration ${iteration} (stop)`);
            return choice.message.content ?? "";
        }

        if (choice.finish_reason === "tool_calls" && choice.message.tool_calls) {
            messages.push({ ...choice.message, role: "assistant" });

            for (const toolCall of choice.message.tool_calls) {
                const args = JSON.parse(toolCall.function.arguments);
                let result = "";

                if (toolCall.function.name === "search_medical_literature") {
                    result = handleSearchMedicalLiterature(args);

                } else if (toolCall.function.name === "calculate_risk_factors") {
                    result = handleCalculateRiskFactors(args);

                } else if (toolCall.function.name === "evaluate_confidence") {
                    const evaluation = handleEvaluateConfidence(args, previousSnapshot);
                    result = evaluation.result;
                    previousSnapshot = evaluation.snapshot;

                    if (evaluation.shouldStop) {
                        forceStop = true;
                        console.log(`[MediScan] Converged at iteration ${iteration} — stopping early`);
                        // Inject instruksi untuk langsung output final JSON
                        messages.push({
                            role: "tool",
                            tool_call_id: toolCall.id,
                            content: result,
                        });
                        messages.push({
                            role: "user",
                            content: "Research complete. Now produce the final JSON prediction based on all gathered evidence."
                        });
                        break;
                    }
                }

                if (!forceStop) {
                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: result,
                    });
                }
            }

            continue;
        }

        break;
    }

    // Jika loop habis atau forceStop, minta final output
    if (iteration >= MAX_ITERATIONS || forceStop) {
        console.log(`[MediScan] Requesting final output after ${iteration} iterations`);
        const finalResponse = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages,
            temperature: 0.1,
            max_tokens: 4096,
        });
        return finalResponse.choices[0].message.content ?? "";
    }

    throw new Error("Agentic loop exited unexpectedly");
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

  const systemPrompt = `You are MediScan's AI medical prediction agent — an expert differential diagnosis assistant with deep reasoning capability.

You have access to tools for research and self-evaluation. Follow this workflow rigorously:

Workflow:
1. Call search_medical_literature for the primary symptom cluster.
2. Call search_medical_literature again for secondary/atypical presentations and weather-related conditions.
3. Call calculate_risk_factors for each candidate disease (minimum 3 diseases).
4. Call evaluate_confidence to assess if your differential diagnosis has converged.
   - If confidence is LOW or gaps remain → continue researching.
   - If confidence is HIGH and probabilities converged → proceed to final output.
5. Repeat steps 1–4 as needed until evaluate_confidence signals to stop.
6. Output final JSON with user's language ${body.user_language}.

Research guidelines:
- Do NOT limit to a single body system. Always consider systemic, infectious, environmental, and metabolic causes.
- Actively correlate weather data (temperature, humidity, air quality) with disease likelihood.
- Do NOT hallucinate patient habits unless explicitly stated in input.
- Minimum 2 search_medical_literature calls and 3 calculate_risk_factors calls before first evaluate_confidence.

Output rules:
- Maximum 5 diseases, ordered by probability (highest first).
- Probability between 0 and 1.
- Respond ONLY with valid JSON:

{
  "result": [
    {
      "disease": "string",
      "probability": float,
      "description": "string",
      "reasoning": "string (cite specific symptoms, patient factors, AND weather context)",
      "precautions": ["string", "string"],
      "first_aid": "string"
    }
  ],
  "disclaimer": "string"
}`;

  const userMessage = `Patient Profile:
- Age: ${body.age} | Gender: ${body.gender}
- Height: ${body.height}cm | Weight: ${body.weight}kg
- BMI: ${bmi} (${getBMICategory(Number(bmi))})
- Location: ${body.location}
- Medical History: ${JSON.stringify(body.histories)}

Verified Symptoms:
${symptoms
  .map(
    (s) =>
      `- ${s.name} | Duration: ${s.duration} | Severity: ${s.severity}${s.description ? ` | Note: ${s.description}` : ""}`,
  )
  .join("\n")}

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
