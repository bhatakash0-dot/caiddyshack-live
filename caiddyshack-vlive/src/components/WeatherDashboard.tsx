

import React from 'react';
import type { ConditionsSlice } from '../types';
import { toCompass } from '../services/api';

interface WeatherDashboardProps {
    slice: ConditionsSlice;
}

const WeatherDashboard: React.FC<WeatherDashboardProps> = ({ slice }) => {
    return (
        <div className="grid grid-cols-2 gap-4 font-roboto">
            <div className="bg-golf-green-light p-4 rounded-xl shadow-md flex flex-col items-center text-center">
                <i className="material-icons text-5xl text-yellow-500 mb-2">wb_sunny</i>
                <p className="text-3xl font-bold text-gray-900">{slice.avgTemp}°F</p>
                <p className="text-sm text-gray-500">Avg Temp</p>
            </div>
            <div className="bg-golf-green-light p-4 rounded-xl shadow-md flex flex-col items-center text-center">
                <i className="material-icons text-5xl text-blue-500 mb-2">air</i>
                <p className="text-3xl font-bold text-gray-900">{slice.avgWind} mph</p>
                <p className="text-sm text-gray-500">Wind - {toCompass(slice.avgWindDir)}</p>
            </div>
            <div className="bg-golf-green-light p-4 rounded-xl shadow-md flex flex-col items-center text-center">
                <i className="material-icons text-5xl text-blue-400 mb-2">water_drop</i>
                <p className="text-3xl font-bold text-gray-900">{slice.precipProbMax}%</p>
                <p className="text-sm text-gray-500">Max Rain %</p>
            </div>
            <div className="bg-golf-green-light p-4 rounded-xl shadow-md flex flex-col items-center text-center">
                <i className="material-icons text-5xl text-gray-500 mb-2">opacity</i>
                <p className="text-3xl font-bold text-gray-900">{slice.avgHumidity}%</p>
                <p className="text-sm text-gray-500">Humidity</p>
            </div>
        </div>
    );
};

export default WeatherDashboard;