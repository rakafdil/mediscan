import { NextRequest, NextResponse } from "next/server";
import { main } from "@/app/services/geminiServices";
import { UserComplication } from "@/app/symptom-checker/symptoms/types";
import { DailyWeatherFactors } from "@/hooks/getWeatherFactors";
import { summarizeWeather } from "@/hooks/summarizeWeather";

export async function POST(req: NextRequest) {
  const body = await req.json();

  let weather: DailyWeatherFactors | undefined = undefined;
  if (typeof body.weather === "string") {
    try {
      weather = JSON.parse(body.weather);
    } catch {
      weather = undefined;
    }
  } else {
    weather = body.weather;
  }

  const userComplication: UserComplication = {
    gender: body.gender,
    age: body.age,
    height: body.height,
    weight: body.weight,
    symptoms: body.symptoms,
    histories: body.histories,
    location: body.location,
    weather: weather as DailyWeatherFactors,
  };

  const bmi =
    userComplication.height && userComplication.weight
      ? (Number(userComplication.weight) / ((Number(userComplication.height) / 100) ** 2)).toFixed(1)
      : "unknown";

  const weatherSummary = userComplication.weather
    ? summarizeWeather(userComplication.weather)
    : "Weather data unavailable";

  const messages = `{
  "user_data": {
    "age": "${userComplication.age}", 
    "gender": "${userComplication.gender}", 
    "height": "${userComplication.height}", 
    "weight": "${userComplication.weight}",
    "BMI": "${bmi}",
    "location": "${userComplication.location ? JSON.stringify(userComplication.location) : "unknown"}", 
    "histories": "${userComplication.histories ? JSON.stringify(userComplication.histories) : "unknown"}"
  },
  "user_complication": "${userComplication.symptoms}",
  "weather_on_user_location": "${weatherSummary}"
}
    "user_complication": "${userComplication.symptoms}",
    "weather_on_user_location": "${weatherSummary}"
  }

  You are a diagnoses validator and specifier. Your only tasks are:
  1. Validate if the user is providing their symptoms/diagnosis.
  2. If valid, respond by politely asking *only* about the symptoms they have already mentioned — no new symptoms should be introduced.
  3. Always use formal, easy-to-understand language in the "response_for_user".
  4. Consider user_data (including BMI category) and weather_on_user_location to produce the best, medically-reasonable response.
  5. Always respond strictly in JSON format as follows:
  {
    "response_for_user": "string",
    "symptoms": ["string", "string", "..."],
    "symptoms_related": true | false
  }

  Rules:
  - "response_for_user" should be a single sentence or short paragraph asking the user follow-up questions about the symptoms they mentioned, while also reflecting potential influences of BMI or weather if relevant.
  - "symptoms" must be an array containing the exact symptoms described by the user, preserving all details, modifiers, and context (e.g., "persistent headache" instead of just "headache").
  - Do not infer or add unrelated symptoms.
  - Always produce valid JSON with no extra text outside the JSON.
  `;

  try {
    const aiText = await main(messages);

    if (aiText === undefined)
      return NextResponse.json({ error: "Response is empty" }, { status: 500 });
    else if (typeof aiText !== "string")
      return NextResponse.json(
        { error: "Invalid response type" },
        { status: 500 }
      );
    else {
      const cleanJson = aiText
        .replace(/```(json)?\s*/gi, "")
        .replace(/```$/m, "")
        .trim();
      const parsed = JSON.parse(cleanJson);
      return NextResponse.json(parsed);
    }
  } catch (e) {
    console.error("JSON Error:", e);
    console.log("AI Response:", e instanceof Error ? e.message : String(e));
    return NextResponse.json(
      { error: "Invalid JSON from AI" },
      { status: 500 }
    );
  }
}
