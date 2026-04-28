import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Fallback model chain ──────────────────────────────────────────────────────
// All models here must support response_format: json_object.
// Order: best quality first → fastest/lightest last.
const MODEL_CHAIN: string[] = [
  "llama-3.3-70b-versatile", // primary  — strong multilingual + instruction following
  "llama-3.1-8b-instant", // fallback 1 — fast, still supports json_object
  "gemma2-9b-it", // fallback 2 — lightweight, reliable JSON output
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
  "529",
];

function shouldFallback(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return FALLBACK_TRIGGERS.some((t) => msg.includes(t.toLowerCase()));
}

// ─── Completion with fallback ──────────────────────────────────────────────────
async function completionWithFallback(
  messages: Groq.Chat.ChatCompletionMessageParam[],
): Promise<string> {
  for (let i = 0; i < MODEL_CHAIN.length; i++) {
    const model = MODEL_CHAIN[i];
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages,
        temperature: 0.3,
        response_format: { type: "json_object" },
      });
      const { choices, usage, model: usedModel } = completion;
      const content = choices[0].message.content ?? "";

      console.log(`[MediScan:validate] model used: ${usedModel}`);
      console.log(
        `[MediScan:validate] tokens — prompt: ${usage?.prompt_tokens}, completion: ${usage?.completion_tokens}, total: ${usage?.total_tokens}`,
      );
      if (i > 0) {
        console.log(`[MediScan:validate] Fell back to model[${i}]: ${model}`);
      }

      return completion.choices[0].message.content ?? "";
    } catch (err) {
      if (shouldFallback(err) && i < MODEL_CHAIN.length - 1) {
        const reason =
          err instanceof Error ? err.message.slice(0, 120) : String(err);
        console.warn(
          `[MediScan:validate] model[${i}] (${model}) failed: ${reason}. Trying next…`,
        );
        continue;
      }
      throw err;
    }
  }
  throw new Error("All models in fallback chain exhausted");
}

// ─── Route handler ─────────────────────────────────────────────────────────────
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

1. Extract ONLY symptoms explicitly or implicitly mentioned in the user's text. NEVER hallucinate or assume symptoms that are not clearly present.

2. DO NOT output diseases or diagnoses (e.g., "Common cold", "Flu", etc.) as symptoms.
   - Only extract TRUE symptoms (e.g., "Batuk", "Hidung tersumbat", "Sakit tenggorokan").

3. Avoid redundancy:
   - Do NOT include overlapping symptoms with the same meaning.
   - Prefer the most specific and medically accurate term.

4. Normalize informal/slang language into proper medical symptom names.
   Examples:
   - "bapil" → separate into "Batuk (Cough)" and "Hidung berair/tersumbat (Rhinitis)"
   - "mules" → "Nyeri perut kram (Abdominal cramping)"
   - "masuk angin" → map ONLY to symptoms explicitly implied (e.g., bloating, nausea IF mentioned)

5. Severity must be one of:
   - "Mild" → noticeable but does not affect daily activity
   - "Moderate" → affects activity but still functional
   - "Severe" → significantly limits activity

6. Duration:
   - If unclear, use "unknown"
   - If implied progression exists (e.g., worsening), capture that nuance in description

7. Description field:
   - Capture ONLY details mentioned by the user (e.g., "kadang mampet kadang meler", "kebangun terus saat tidur")
   - DO NOT add new information

8. DO NOT misclassify symptoms:
   - "pusing" ≠ "demam"
   - "tidak nafsu makan" ≠ "mual"
   - "meriang/kedinginan-gerah" → map to "Demam (Fever)" ONLY if clearly implied

9. Special attention:
   - If there are unusual or potentially serious signs (e.g., bleeding), keep them as separate symptoms if possible.

10. CRITICAL FOR 'response_for_user':
   - This system is STATELESS and uses a card-based UI.
   - DO NOT ask open-ended questions.
   - Instead, empathetically instruct the user to:
     → EDIT the symptom cards below (especially description fields)
     → or ADD new symptom cards
   - Be SPECIFIC about missing details, such as:
     • warna cairan (bening/kuning/hijau/berdarah)
     • tingkat nyeri (skala ringan–berat)
     • frekuensi (terus-menerus atau hilang-timbul)
     • pemicu (misalnya saat menelan, malam hari, dll)
   - Remind that missing details may lead to inaccurate detection.
   - Keep tone natural and human (not robotic, not too formal).

11. Language:
   - Detect user's language and ensure 'response_for_user' uses the SAME language.
   - Keep symptom names in Indonesian + medical term in English.

12. Determine 'symptoms_related':
   - true → symptoms likely part of the same condition (e.g., flu-like cluster)
   - false → symptoms appear unrelated

STRICT REMINDER before responding:
- Re-read the user's message carefully.
- Extract ONLY what is actually present.
- DO NOT over-interpret.

Output format (STRICT JSON ONLY, no markdown, no explanation):

{
  "response_for_user": "string",
  "symptoms": [
    {
      "name": "<symptom name> (<medical term>)",
      "duration": "<duration or 'unknown'>",
      "severity": "Mild" | "Moderate" | "Severe",
      "description": "<user-provided detail or empty string>"
    }
  ],
  "symptoms_related": boolean,
  "user_language": "<detected language>"
}
`;

  try {
    const content = await completionWithFallback([
      { role: "system", content: systemPrompt },
      { role: "user", content: symptoms },
    ]);

    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 },
      );
    }

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
