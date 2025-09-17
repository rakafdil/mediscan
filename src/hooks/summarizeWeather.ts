import { DailyWeatherFactors } from "./getWeatherFactors";

function avg(arr: number[]): number {
    if (!Array.isArray(arr)) return 0;
    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function max(arr: number[]): number {
    if (!Array.isArray(arr)) return 0;
    return arr.length ? Math.max(...arr) : 0;
}

function min(arr: number[]): number {
    if (!Array.isArray(arr)) return 0;
    return arr.length ? Math.min(...arr) : 0;
}

function categorizeAQI(pm2_5: number, pm10: number, ozone: number): string {
    // Simple WHO guideline thresholds
    if (pm2_5 > 35 || pm10 > 50 || ozone > 120) return "high";
    if (pm2_5 > 15 || pm10 > 25 || ozone > 100) return "moderate";
    return "low";
}

export function summarizeWeather(weather: DailyWeatherFactors): string {
    const tempMax = max(weather.temperature_max);
    const tempMin = min(weather.temperature_min);
    const avgPrecip = avg(weather.precipitation_sum).toFixed(1);
    const maxWind = max(weather.windspeed_max);

    let airQualitySummary = "Air quality data unavailable";
    if (weather.airQuality) {
        const avgPm25 = avg(weather.airQuality.pm2_5);
        const avgPm10 = avg(weather.airQuality.pm10);
        const avgOzone = avg(weather.airQuality.ozone);
        const category = categorizeAQI(avgPm25, avgPm10, avgOzone);
        airQualitySummary = `Air quality is ${category} (avg PM2.5 ${avgPm25.toFixed(
            1
        )}, PM10 ${avgPm10.toFixed(1)}, Ozone ${avgOzone.toFixed(1)})`;
    }

    return `Daily weather summary: temperature ranged between ${tempMin.toFixed(
        1
    )}°C and ${tempMax.toFixed(
        1
    )}°C, average precipitation ${avgPrecip} mm/day, max windspeed ${maxWind.toFixed(
        1
    )} km/h. ${airQualitySummary}.`;
}
