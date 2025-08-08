
import React, { useState, useEffect } from 'react';
import type { Course, TeePlan, WeatherData, ConditionsSlice } from '../types';
import { getWeather, getConditionsSlice } from '../services/api';
import WeatherDashboard from './WeatherDashboard';
import WindImpact from './WindImpact';
import GolfBallAnimation from './GolfBallAnimation';
import AiCaddy from './AiCaddy';

interface WeatherDisplayProps {
    course: Course;
    plan: TeePlan;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ course, plan }) => {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [conditions, setConditions] = useState<ConditionsSlice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAndSetWeather = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getWeather(course, plan);
                setWeatherData(data);
                const slice = getConditionsSlice(data, plan);
                setConditions(slice);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAndSetWeather();
    }, [course, plan]);

    if (loading) {
        return (
            <div className="text-center p-8 bg-golf-green-light rounded-xl shadow-md">
                <p className="font-roboto">Getting your forecast...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-golf-green-dark mx-auto mt-4"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center p-8 bg-red-100 text-red-700 rounded-xl shadow-md font-roboto">Error: {error}</div>;
    }

    if (!conditions) {
        return null;
    }

    // Roll factor: 1 = fast/dry, 0 = slow/wet.
    // Derived from humidity and precipitation.
    const rollFactor = Math.max(0, 1 - (conditions.avgHumidity / 150) - (conditions.precipTotal * 2));

    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-2xl font-bold mb-4 text-golf-green-dark">Tee Time Weather</h2>
                <WeatherDashboard slice={conditions} />
            </section>
            <section>
                <h2 className="text-2xl font-bold mb-4 text-golf-green-dark">Weather Impact</h2>
                <div className="space-y-4">
                    <WindImpact windSpeed={conditions.avgWind} windDirection={conditions.avgWindDir} />
                    <GolfBallAnimation rollFactor={rollFactor} />
                </div>
            </section>
            <section>
                <AiCaddy conditions={conditions} course={course} />
            </section>
        </div>
    );
};

export default WeatherDisplay;
