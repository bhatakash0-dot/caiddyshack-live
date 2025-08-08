

import React, { useState } from 'react';
import type { TeePlan } from '../types';

interface PlanRoundProps {
    onPlan: (plan: TeePlan) => void;
}

const PlanRound: React.FC<PlanRoundProps> = ({ onPlan }) => {
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [time, setTime] = useState('08:30');
    const [holes, setHoles] = useState<'9' | '18'>('18');
    
    const handlePlanClick = () => {
        const teeTime = new Date(`${date}T${time}`);
        onPlan({ teeTime, holes: holes === '9' ? 9 : 18 });
    };

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1 font-roboto" htmlFor="date">Date</label>
                    <input className="w-full bg-white border border-gray-300 rounded-lg p-2 focus:outline-none text-gray-800 font-roboto" id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1 font-roboto" htmlFor="time">Tee Time</label>
                    <input className="w-full bg-white border border-gray-300 rounded-lg p-2 focus:outline-none text-gray-800 font-roboto" id="time" type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-2 font-roboto">Holes</label>
                <div className="flex bg-gray-200 rounded-lg p-1">
                    <button onClick={() => setHoles('9')} className={`w-1/2 py-2 rounded-md text-center transition-colors text-gray-600 font-roboto ${holes === '9' ? 'active-holes' : ''}`}>9 Holes</button>
                    <button onClick={() => setHoles('18')} className={`w-1/2 py-2 rounded-md text-center transition-colors font-roboto ${holes === '18' ? 'active-holes' : 'text-gray-600'}`}>18 Holes</button>
                </div>
            </div>
            <button
              onClick={handlePlanClick}
              className="w-full mt-4 py-3 bg-white border-2 border-golf-green-dark text-black font-bold rounded-lg hover:bg-golf-green-light transition-colors font-roboto"
            >
              Get Caddy Advice
            </button>
        </>
    );
};

export default PlanRound;