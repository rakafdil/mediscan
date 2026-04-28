import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { DailyWeatherFactors } from "@/hooks/getWeatherFactors";
import { summarizeWeather } from "@/hooks/summarizeWeather";
import { Symptom } from "@/app/symptom-checker/symptoms/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Utility: Sleep (Delay) untuk menangani Rate Limit ───────────────────────
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Utility: Prune Messages untuk Meringkas History & Hemat Token ───────────
function pruneMessages(messages: Groq.Chat.ChatCompletionMessageParam[]): Groq.Chat.ChatCompletionMessageParam[] {
  // Jika pesan belum terlalu panjang, biarkan saja
  if (messages.length <= 8) return messages;

  const core = messages.slice(0, 2); // [0] System Prompt, [1] User Profile
  const history = messages.slice(2);
  
  const cycles: Groq.Chat.ChatCompletionMessageParam[][] = [];
  let currentCycle: Groq.Chat.ChatCompletionMessageParam[] = [];

  // Kelompokkan history menjadi siklus-siklus riset
  for (const msg of history) {
    // Siklus baru dimulai saat ada pesan assistant yang memanggil tools
    if (msg.role === "assistant" && (msg as any).tool_calls && currentCycle.length > 0) {
      cycles.push(currentCycle);
      currentCycle = [];
    }
    currentCycle.push(msg);
  }
  if (currentCycle.length > 0) cycles.push(currentCycle);

  // Jika ada lebih dari 2 siklus, kita simpan yang PERTAMA dan TERAKHIR saja
  // Ini menghindari error orphaned tool_calls sekaligus menghemat token
  if (cycles.length > 2) {
    const firstCycle = cycles[0];
    const lastCycle = cycles[cycles.length - 1];
    return [...core, ...firstCycle, ...lastCycle];
  }

  return messages;
}

// ─── Fallback model chain ──────────────────────────────────────────────────────
const MODEL_CHAIN: string[] = [
  "openai/gpt-oss-120b",                       // primary — highest reasoning
  "llama-3.3-70b-versatile",                   // fallback 1 — strong tool-calling support
  "qwen/qwen3-32b",                            // fallback 2 — Qwen 3 (Sesuai list preview)
  "meta-llama/llama-4-scout-17b-16e-instruct", // fallback 3 — Llama 4 terbaru yang efisien
  "llama-3.1-8b-instant"                       // fallback 4 — lapis pertahanan super ringan
];

const FALLBACK_TRIGGERS = [
  "rate_limit_exceeded",
  "tokens_exceeded",
  "context_length_exceeded",
  "model_not_found",
  "service_unavailable",
  "request too large",
  "maximum context length",
  "rate limit",
  "429",
  "529",
  "model_decommissioned", // FIX: Tambahkan ini agar aman kalau Groq mematikan model lagi
  "decommissioned"
];

function shouldFallback(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return FALLBACK_TRIGGERS.some((trigger) => msg.includes(trigger.toLowerCase()));
}

// ─── Types ─────────────────────────────────────────────────────────────────────
interface DiagnosisSnapshot {
  disease: string;
  estimated_probability: number;
}

// ─── Convergence check ─────────────────────────────────────────────────────────
function hasProbabilityConverged(
  prev: DiagnosisSnapshot[],
  curr: DiagnosisSnapshot[],
  threshold = 0.05,
): boolean {
  if (prev.length === 0 || curr.length === 0) return false;
  if (prev.length !== curr.length) return false;

  const sortedPrev = [...prev].sort((a, b) => a.disease.localeCompare(b.disease));
  const sortedCurr = [...curr].sort((a, b) => a.disease.localeCompare(b.disease));

  return sortedPrev.every((p, i) => {
    const c = sortedCurr[i];
    return (
      p.disease === c.disease &&
      Math.abs(p.estimated_probability - c.estimated_probability) < threshold
    );
  });
}

function handleEvaluateConfidence(
  args: {
    current_diagnoses: DiagnosisSnapshot[];
    confidence_level: string;
    gaps: string[];
  },
  previousSnapshot: DiagnosisSnapshot[],
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
        : "Continue calling search_medical_literature or calculate_risk_factors.",
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
      description: "Search trusted medical literature to cross-reference symptoms.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          symptoms: { type: "array", items: { type: "string" } },
        },
        required: ["query", "symptoms"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_risk_factors",
      description: "Calculate risk score based on patient demographics. Pass multiple diseases in the array to evaluate them simultaneously.",
      parameters: {
        type: "object",
        properties: {
          diseases: { 
            type: "array", 
            items: { type: "string" },
            description: "List of candidate diseases to evaluate risk for"
          },
          patient_factors: {
            type: "object",
            properties: {
              age: { type: "number" },
              gender: { type: "string" },
              bmi: { type: "number" },
              bmi_category: { type: "string" },
              has_relevant_history: { type: "boolean" },
            },
            required: ["age", "gender", "bmi", "bmi_category", "has_relevant_history"],
          },
        },
        required: ["diseases", "patient_factors"], // FIX 400: Ubah requirement jadi 'diseases' (Array)
      },
    },
  },
  {
    type: "function",
    function: {
      name: "evaluate_confidence",
      description: "Evaluate if differential diagnosis has converged. Call this to check if you can stop researching.",
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
          },
          confidence_level: { type: "string", enum: ["low", "medium", "high"] },
          gaps: { type: "array", items: { type: "string" } },
        },
        required: ["current_diagnoses", "confidence_level", "gaps"],
      },
    },
  },
];

// ─── Tool handlers ─────────────────────────────────────────────────────────────
function handleSearchMedicalLiterature(args: { query: string; symptoms: string[] }): string {
  return JSON.stringify({
    source: "Clinical Guidelines Database",
    query: args.query,
    findings: `Cross-referenced ${args.symptoms.length} symptoms: ${args.symptoms.join(", ")}.`,
    confidence: "high",
  });
}

function handleCalculateRiskFactors(args: any): string {
  const { age, bmi_category, has_relevant_history } = args.patient_factors;
  let risk_modifier = 1.0;
  if (age > 60) risk_modifier += 0.2;
  if (age < 12) risk_modifier += 0.1;
  if (bmi_category === "Obese") risk_modifier += 0.15;
  if (bmi_category === "Underweight") risk_modifier += 0.1;
  if (has_relevant_history) risk_modifier += 0.25;

  // FIX: Dukung format 'diseases' (array) atau fallback ke 'disease' (string) kalau model ngeyel
  const targetDiseases = args.diseases || (args.disease ? [args.disease] : ["Unknown"]);

  return JSON.stringify({
    evaluated_diseases: targetDiseases,
    risk_modifier: Math.min(risk_modifier, 1.8).toFixed(2),
  });
}

// ─── Single-model completion ───────────────────────────────────────────────────
async function createCompletion(
  model: string,
  messages: Groq.Chat.ChatCompletionMessageParam[],
  withTools: boolean,
  temperature: number,
): Promise<Groq.Chat.ChatCompletion> {
  const params: any = {
    model,
    messages,
    temperature,
    max_tokens: 4096,
  };

  if (withTools) {
    // JIKA menggunakan tools, kirim definisi tools.
    params.tools = tools;
    params.tool_choice = "auto";
  } else {
    // FIX 400 ERROR: Jangan kirim "tools" sama sekali jika withTools = false.
    // Paksa ke JSON mode (Groq support ini untuk Llama & Mixtral).
    params.response_format = { type: "json_object" };
  }

  return groq.chat.completions.create(params);
}

// ─── Model-aware completion with fallback & Retry ──────────────────────────────
async function completionWithFallback(
  messages: Groq.Chat.ChatCompletionMessageParam[],
  withTools: boolean,
  temperature: number,
  startModelIndex = 0,
): Promise<{ completion: Groq.Chat.ChatCompletion; modelIndex: number }> {
  for (let i = startModelIndex; i < MODEL_CHAIN.length; i++) {
    const model = MODEL_CHAIN[i];
    let retryCount = 0;

    while (retryCount < 2) { // Maksimal 1x retry per model jika kena 429
      try {
        const completion = await createCompletion(model, messages, withTools, temperature);
        if (i > startModelIndex) console.log(`[MediScan] Fell back to model[${i}]: ${model}`);
        return { completion, modelIndex: i };
      } catch (err: any) {
        const msg = err.message ? err.message.toLowerCase() : String(err).toLowerCase();
        
        // FIX 429 ERROR: Naikkan Jeda ke 5 detik jika kena rate limit sebelum coba lagi
        if ((msg.includes("429") || msg.includes("rate limit")) && retryCount < 1) {
          console.warn(`[MediScan] Rate limit hit on ${model}. Waiting 5s before retry...`);
          await sleep(5000); // 5000ms = 5 detik
          retryCount++;
          continue;
        }

        if (shouldFallback(err) && i < MODEL_CHAIN.length - 1) {
          console.warn(`[MediScan] model[${i}] (${model}) failed. Trying next...`);
          break; // Keluar dari while retry, lanjut ke model berikutnya di for loop
        }
        throw err;
      }
    }
  }
  throw new Error("All models in fallback chain exhausted");
}

// ─── Agentic loop with convergence + fallback ─────────────────────────────────
async function runAgenticPrediction(
  messages: Groq.Chat.ChatCompletionMessageParam[],
): Promise<string> {
  const MAX_ITERATIONS = 4; // Kurangi ke 4 agar lebih hemat limit
  let iteration = 0;
  let previousSnapshot: DiagnosisSnapshot[] = [];
  let forceStop = false;
  let currentModelIndex = 0;

  while (iteration < MAX_ITERATIONS && !forceStop) {
    iteration++;
    console.log(`[MediScan] Iteration ${iteration}/${MAX_ITERATIONS} | model: ${MODEL_CHAIN[currentModelIndex]}`);

    // IMPLEMENTASI PRUNING: Amankan token sebelum menembak ke API
    const safeMessages = pruneMessages(messages);

    const { completion: response, modelIndex } = await completionWithFallback(
      safeMessages,
      true, // withTools
      0.15,
      currentModelIndex,
    );
    currentModelIndex = modelIndex;

    const choice = response.choices[0];

    if (choice.finish_reason === "stop") {
      console.log(`[MediScan] Finished naturally at iteration ${iteration}`);
      return choice.message.content ?? "";
    }

    if (choice.finish_reason === "tool_calls" && choice.message.tool_calls) {
      
      // FIX 400 REASONING ERROR: Sanitize the assistant message!
      // Do NOT use `...choice.message` directly. Reasoning models inject a "reasoning" key 
      // which causes schema errors when switching to fallback models like Llama 3.
      messages.push({ 
        role: "assistant",
        content: choice.message.content,
        tool_calls: choice.message.tool_calls
      } as any);

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
            console.log(`[MediScan] Converged at iteration ${iteration}`);
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: result,
            });
            break; // FIX: Break tool loop, jangan buat request final di sini!
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

  // ─── REQUEST FINAL (OUTSIDE LOOP) ───
  console.log(`[MediScan] Requesting final output after ${iteration} iterations`);

  // Kita gunakan role "user" di akhir karena beberapa model bingung jika role "system" ditaruh di akhir percakapan.
  messages.push({
    role: "user",
    content: forceStop 
      ? "IMPORTANT: Research phase has converged successfully. DO NOT call any tools. Output the final diagnostic JSON response immediately matching the required schema."
      : "SYSTEM ALERT: Maximum research iterations reached. Time is up! DO NOT call any tools. Immediately synthesize data and output the final JSON response matching the required schema.",
  });

  // IMPLEMENTASI PRUNING UNTUK REQUEST FINAL
  const finalSafeMessages = pruneMessages(messages);

  const { completion: finalResponse } = await completionWithFallback(
    finalSafeMessages,
    false, // TANPA TOOLS = BEBAS ERROR 400
    0.1,
    currentModelIndex,
  );
  
  return finalResponse.choices[0].message.content ?? "";
}

// ─── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json();

  const symptoms: Symptom[] = body.symptoms;
  const weather: DailyWeatherFactors = body.weather;
  const bmi = (Number(body.weight) / (Number(body.height) / 100) ** 2).toFixed(2);

  function getBMICategory(bmi: number) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  }

  const weatherSummary = weather ? summarizeWeather(weather) : "Weather data unavailable";

  const systemPrompt = `You are MediScan's AI medical prediction agent — an expert differential diagnosis assistant with deep reasoning capability.

Follow this workflow rigorously:
1. Call search_medical_literature for the primary symptom cluster.
2. Call calculate_risk_factors. Pass an array of multiple diseases at once to save time.
3. Call evaluate_confidence to assess if your differential diagnosis has converged.
4. Output final JSON with user's language ${body.user_language}.

Research guidelines:
- Do NOT limit to a single body system. Consider systemic, infectious, and environmental causes.
- Actively correlate weather data.
- Whenever possible, call calculate_risk_factors for multiple candidates at once.

Output rules:
- Respond ONLY with valid JSON. Do not include markdown blocks like \`\`\`json.
- Maximum 5 diseases.
- Format:
{
  "result": [
    {
      "disease": "string",
      "probability": float (0-1),
      "description": "string",
      "reasoning": "string (cite symptoms, factors, weather)",
      "precautions": ["string", "string"],
      "first_aid": "string"
    }
  ],
  "disclaimer": "string"
}`;

  const userMessage = `Patient Profile:
- Age: ${body.age} | Gender: ${body.gender}
- BMI: ${bmi} (${getBMICategory(Number(bmi))})
- Medical History: ${JSON.stringify(body.histories)}

Verified Symptoms:
${symptoms.map((s) => `- ${s.name} | Duration: ${s.duration} | Severity: ${s.severity}`).join("\n")}

Environmental Context:
${weatherSummary}`;

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  try {
    const finalText = await runAgenticPrediction(messages);

    // Pembersihan JSON yang lebih robust
    const clean = finalText.replace(/```(json)?\s*/gi, "").replace(/```$/m, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json({
      ...parsed,
      scan_timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Predict API Error (All Models Failed):", error);

    // ALTERNATIF: GRACEFUL FALLBACK JIKA GROQ BENAR-BENAR ERROR/LIMIT HABIS
    // UI Aplikasi tidak akan crash 500, melainkan menampilkan peringatan aman ini.
    return NextResponse.json({
      result: [
        {
          disease: "Sistem Sedang Sibuk (Timeout)",
          probability: 0.0,
          description: "Server AI kami (Groq) saat ini sedang mengalami kelebihan beban (rate limit) atau gangguan jaringan. Kami tidak dapat menjalankan prediksi yang akurat saat ini.",
          reasoning: "API error atau kehabisan limit penggunaan harian. Ini bukan masalah kesehatan, melainkan gangguan server sementara.",
          precautions: [
            "Tunggu beberapa menit lalu coba scan lagi",
            "Jika gejala yang dirasakan berat, jangan menunggu! Segera periksakan diri ke dokter",
            "Pastikan Anda cukup istirahat"
          ],
          first_aid: "Hubungi layanan kesehatan profesional jika Anda merasa kondisi darurat."
        }
      ],
      disclaimer: "PERINGATAN SISTEM: Ini adalah pesan otomatis karena kegagalan server AI. Analisis medis tidak dapat dilakukan.",
      scan_timestamp: new Date().toISOString(),
    });
  }
}