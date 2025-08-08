
import React, { useState, useEffect } from 'react';
import type { AiCaddyResponse, ConditionsSlice, Course } from '../types';
import { getAiCaddyInsights } from '../services/api';

interface AiCaddyProps {
    conditions: ConditionsSlice;
    course: Course;
}

const AiCaddy: React.FC<AiCaddyProps> = ({ conditions, course }) => {
    const [insights, setInsights] = useState<AiCaddyResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInsights = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await getAiCaddyInsights(conditions, course);
                setInsights(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, [conditions, course]);

    return (
        <div className="p-6 bg-golf-green-light rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-4 flex items-center text-golf-green-dark">
                <i className="material-icons mr-3 text-3xl">smart_toy</i>
                <span>AI Caddy Insights</span>
            </h2>
            {loading && (
                 <div className="font-roboto">
                    <p className="text-gray-600">Your caddy is analyzing the conditions...</p>
                    <div className="h-2 bg-gray-200 rounded-full w-full mt-3 overflow-hidden">
                        <div className="h-full bg-golf-green-dark animate-pulse w-1/2" style={{animation: 'indeterminate 2s infinite'}}></div>
                    </div>
                </div>
            )}
            {error && <p className="text-red-600 font-roboto">Error: {error}</p>}
            {insights && !loading && (
                <div className="space-y-4 text-gray-800 text-lg leading-relaxed font-serif">
                    <div>
                        <strong className="text-golf-green-dark font-roboto font-bold">Club Selection:</strong>
                        <p>{insights.clubSelection}</p>
                    </div>
                    <div>
                        <strong className="text-golf-green-dark font-roboto font-bold">Shot Shaping:</strong>
                        <p>{insights.shotShaping}</p>
                    </div>
                    <div>
                        <strong className="text-golf-green-dark font-roboto font-bold">Putting:</strong>
                        <p>{insights.puttingStrategy}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiCaddy;
