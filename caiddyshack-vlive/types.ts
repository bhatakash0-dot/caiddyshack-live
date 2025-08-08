
export interface Course {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    latitude: number;
    longitude: number;
}

export interface TeePlan {
    teeTime: Date;
    holes: 9 | 18;
}

export interface WeatherData {
    latitude: number;
    longitude: number;
    hourly: {
        time: string[];
        temperature_2m: number[];
        relative_humidity_2m: number[];
        precipitation_probability: number[];
        precipitation: number[];
        wind_speed_10m: number[];
        wind_direction_10m: number[];
    };
}

export interface ConditionsSlice {
    from: Date;
    to: Date;
    avgTemp: number;
    avgHumidity: number;
    precipProbMax: number;
    precipTotal: number;
    avgWind: number;
    avgWindDir: number;
}

export interface AiCaddyResponse {
    clubSelection: string;
    shotShaping: string;
    puttingStrategy: string;
}
