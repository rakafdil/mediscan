import { NextRequest, NextResponse } from "next/server";
import { main } from "@/app/services/geminiServices";
import { UserComplication } from "@/app/symptom-checker/symptoms/types";
import { DailyWeatherFactors } from "@/hooks/getWeatherFactors";
import { summarizeWeather } from "@/hooks/summarizeWeather";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const userComplication: UserComplication = {
    gender: body.gender,
    age: body.age,
    height: body.height,
    weight: body.weight,
    symptoms: body.symptoms,
    histories: body.histories,
    location: body.location,
    weather: body.weather as DailyWeatherFactors,
  };

  const bmi = (Number(userComplication.weight) / ((Number(userComplication.height) / 100) ** 2)).toFixed(2);

  function getBMICategory(bmi: number) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  }

  const weatherSummary = userComplication.weather
    ? summarizeWeather(userComplication.weather)
    : "Weather data unavailable";

  const messages = `{
  "user_data": {
    "age": "${userComplication.age}", 
    "gender": "${userComplication.gender}", 
    "location": "${userComplication.location}", 
    "histories": "${userComplication.histories}",
    "height": "${userComplication.height} cm",
    "weight": "${userComplication.weight} kg",
    "bmi": "${bmi}",
    "bmi_category": "${getBMICategory(Number(bmi))}"
  },
  "user_symptoms": ${JSON.stringify(userComplication.symptoms)},
  "weather_factors": "${weatherSummary}"
}

You are a professional medical disease prediction assistant.

Your tasks:
1. Predict the most likely diseases based on the user's symptoms, personal data, and weather factors.
2. Provide multiple possible diseases (not just one) to help the user consider different conditions.
3. Consider the user's BMI and medical history in the prediction.
4. Always respond ONLY in valid JSON with the following format:

{
  "result": [
    {
      "disease": "string",        // predicted disease name
      "probability": float,       // value between 0 and 1
      "description": "string",    // short and clear description
      "precautions": [            // recommended precautions
        "string",
        "string"
      ]
    }
  ]
}

Rules:
- Probability must be between 0 and 1.
- Only include diseases relevant to the given symptoms.
- Do not output anything outside of the JSON.
- Keep description short and easy to understand.
`;

  try {
    const aiText = await main(messages);

    if (!aiText) {
      return NextResponse.json({ error: "No response from AI service" }, { status: 500 });
    }

    const cleanJson = aiText
      .replace(/```(json)?\s*/gi, "")
      .replace(/```$/m, "")
      .trim();

    const parsed = JSON.parse(cleanJson);
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