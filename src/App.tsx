
import React, { useState, useCallback } from 'react';
import { Course, TeePlan, WeatherData, AiCaddyResponse } from './types';
import CourseSelector from './components/CourseSelector';
import PlanRound from './components/PlanRound';
import WeatherDisplay from './components/WeatherDisplay';

function App() {
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [teePlan, setTeePlan] = useState<TeePlan | null>(null);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePlanRound = useCallback(async (plan: TeePlan) => {
        if (!selectedCourse) {
            setError("Please select a course first.");
            return;
        }
        setLoading(true);
        setError(null);
        setWeatherData(null);
        setTeePlan(plan); // Set teePlan to trigger WeatherDisplay
    }, [selectedCourse]);
    
    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8 max-w-md">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold tracking-wider text-golf-green-dark">cAIddyshack</h1>
                    <i className="material-icons text-3xl text-gray-400">settings</i>
                </header>

                <main>
                    <section className="mb-8 p-6 bg-golf-green-light rounded-xl shadow-md">
                        <h2 className="text-2xl font-bold mb-4 text-golf-green-dark">Plan Your Round</h2>
                        <div className="space-y-4">
                            <CourseSelector onSelect={setSelectedCourse} />
                            {selectedCourse && <PlanRound onPlan={handlePlanRound} />}
                        </div>
                    </section>
                    
                    {teePlan && selectedCourse && (
                         <WeatherDisplay 
                            course={selectedCourse} 
                            plan={teePlan}
                         />
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;