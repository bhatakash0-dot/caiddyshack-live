import { GoogleGenAI, Type } from "@google/genai";
import { GOLFERS_ALMANAC } from '../constants';
import type { Course, TeePlan, WeatherData, ConditionsSlice, AiCaddyResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

export async function getWeather(course: Course, plan: TeePlan): Promise<WeatherData> {
    const { latitude, longitude } = course;
    const startTime = plan.teeTime;
    const durationHours = plan.holes === 9 ? 2.5 : 4.5;
    const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

    const startDateStr = startTime.toISOString().slice(0, 10);
    const endDateStr = endTime.toISOString().slice(0, 10);
    
    const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m,wind_direction_10m&start_date=${startDateStr}&end_date=${endDateStr}&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`;

    const response = await fetch(weatherApiUrl);
    if (!response.ok) {
        throw new Error('Failed to fetch weather data');
    }
    return response.json();
}

export function toCompass(direction: number): string {
    const val = Math.floor((direction / 22.5) + 0.5);
    const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
}

export function getConditionsSlice(weather: WeatherData, plan: TeePlan): ConditionsSlice {
    const { hourly } = weather;
    const startTime = plan.teeTime;
    const durationHours = plan.holes === 9 ? 2.5 : 4.5;
    const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

    const startIndex = hourly.time.findIndex(t => new Date(t) >= startTime);
    if (startIndex === -1) throw new Error("Tee time is out of weather forecast range.");

    const endIndex = hourly.time.findIndex(t => new Date(t) >= endTime);
    const actualEndIndex = endIndex === -1 ? hourly.time.length : endIndex;

    const relevantTimes = hourly.time.slice(startIndex, actualEndIndex);
    if (relevantTimes.length === 0) throw new Error("No weather data available for the selected time slot.");

    const temps = hourly.temperature_2m.slice(startIndex, actualEndIndex);
    const humidities = hourly.relative_humidity_2m.slice(startIndex, actualEndIndex);
    const precipProbs = hourly.precipitation_probability.slice(startIndex, actualEndIndex);
    const precips = hourly.precipitation.slice(startIndex, actualEndIndex);
    const winds = hourly.wind_speed_10m.slice(startIndex, actualEndIndex);
    const windDirs = hourly.wind_direction_10m.slice(startIndex, actualEndIndex);

    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

    return {
        from: new Date(relevantTimes[0]),
        to: new Date(relevantTimes[relevantTimes.length - 1]),
        avgTemp: Math.round(sum(temps) / temps.length),
        avgHumidity: Math.round(sum(humidities) / humidities.length),
        precipProbMax: Math.max(...precipProbs),
        precipTotal: Number(sum(precips).toFixed(2)),
        avgWind: Math.round(sum(winds) / winds.length),
        avgWindDir: Math.round(sum(windDirs) / windDirs.length),
    };
}


export async function getAiCaddyInsights(conditions: ConditionsSlice, course: Course): Promise<AiCaddyResponse> {
    const greensCondition = conditions.precipTotal > 0.1 || conditions.avgHumidity > 75 ? "Soft and slow due to moisture" : "Likely firm and fast";
    const fairwayCondition = conditions.precipTotal > 0.1 ? "Wet, expect minimal roll" : "Dry, expect average roll";

    const prompt = `
I am playing at ${course.name} in ${course.city}, ${course.state}. The weather conditions for my round are:
- Average Temperature: ${conditions.avgTemp}°F
- Wind: ${conditions.avgWind} mph from the ${toCompass(conditions.avgWindDir)}
- Humidity: ${conditions.avgHumidity}%
- Precipitation: ${conditions.precipTotal} inches expected during play
- Greens Condition: ${greensCondition}
- Fairway Condition: ${fairwayCondition}

Based on your knowledge from the Golfer's Almanac, provide specific, expert-level advice.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: GOLFERS_ALMANAC,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        clubSelection: {
                            type: Type.STRING,
                            description: "Advice on how to adjust club choices. e.g., club up/down."
                        },
                        shotShaping: {
                            type: Type.STRING,
                            description: "Advice on what kind of shots to prioritize. e.g., low-trajectory punch shots, high fades."
                        },
                        puttingStrategy: {
                            type: Type.STRING,
                            description: "Advice on how the greens will play and how to adjust putting."
                        }
                    },
                    required: ["clubSelection", "shotShaping", "puttingStrategy"]
                },
            }
        });
        
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        return parsedJson;

    } catch (error) {
        console.error("Error fetching AI insights:", error);
        return {
            clubSelection: "The AI Caddy is having trouble analyzing the data. Please try again in a moment.",
            shotShaping: "Remember to check wind direction and green firmness yourself before each shot.",
            puttingStrategy: "Conditions seem tricky. Trust your eyes and your practice strokes."
        };
    }
}