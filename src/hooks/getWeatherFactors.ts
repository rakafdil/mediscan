import { fetchWeatherApi } from "openmeteo";

export interface DailyWeatherFactors {
  temperature_max: number[];
  temperature_min: number[];
  precipitation_sum: number[];
  windspeed_max: number[];
  airQuality?: {
    pm10: number[];
    pm2_5: number[];
    ozone: number[];
  };
}

export async function getDailyWeatherFactors(lat: number, lon: number): Promise<DailyWeatherFactors> {
  // Range 14 hari terakhir
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 14);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  // Weather (daily)
  const weatherParams = {
    latitude: lat,
    longitude: lon,
    start_date: formatDate(startDate),
    end_date: formatDate(endDate),
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "windspeed_10m_max",
    ].join(","),
    timezone: "auto"
  };

  const weatherUrl = "https://api.open-meteo.com/v1/forecast";
  const weatherResponses = await fetchWeatherApi(weatherUrl, weatherParams);
  const weatherResponse = weatherResponses[0];
  const daily = weatherResponse.daily()!;

  const weather: DailyWeatherFactors = {
    temperature_max: Array.from(daily.variables(0)!.valuesArray() || []),
    temperature_min: Array.from(daily.variables(1)!.valuesArray() || []),
    precipitation_sum: Array.from(daily.variables(2)!.valuesArray() || []),
    windspeed_max: Array.from(daily.variables(3)!.valuesArray() || []),
  };

  // Air Quality (hourly)
  const airUrl = "https://air-quality-api.open-meteo.com/v1/air-quality";
  const airParams = {
    latitude: lat,
    longitude: lon,
    start_date: formatDate(startDate),
    end_date: formatDate(endDate),
    hourly: "pm10,pm2_5,ozone",
    timezone: "auto"
  };

  const airResponses = await fetchWeatherApi(airUrl, airParams);
  const airResponse = airResponses[0];
  const airHourly = airResponse.hourly()!;

  const hours = Array.from(
    { length: Number(airHourly.timeEnd() - airHourly.time()) / airHourly.interval() },
    (_, i) => (Number(airHourly.time()) + i * airHourly.interval()) * 1000
  );

  const pm10 = airHourly.variables(0)!.valuesArray();
  const pm2_5 = airHourly.variables(1)!.valuesArray();
  const ozone = airHourly.variables(2)!.valuesArray();

  // 👉 grup per hari
  function groupDaily(values: Float32Array, hours: number[]): number[] {
    const byDay: Record<string, number[]> = {};
    hours.forEach((ts, i) => {
      const day = new Date(ts).toISOString().split("T")[0];
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(values[i]);
    });
    return Object.values(byDay).map(arr => {
      const sum = arr.reduce((a, b) => a + b, 0);
      return sum / arr.length;
    });
  }

  weather.airQuality = {
    pm10: groupDaily(pm10, hours),
    pm2_5: groupDaily(pm2_5, hours),
    ozone: groupDaily(ozone, hours),
  };

  return weather;
}
