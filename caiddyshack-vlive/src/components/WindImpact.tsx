import React, { useEffect, useRef } from 'react';
import { toCompass } from '../services/api';

interface WindImpactProps {
    windSpeed: number;
    windDirection: number;
}

const WindImpact: React.FC<WindImpactProps> = ({ windSpeed, windDirection }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | undefined>(undefined);

    const windEffectYards = Math.abs(windSpeed * 1.5 * Math.sin(windDirection * Math.PI / 180));
    const direction = toCompass(windDirection);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width = 360;
        const h = canvas.height = 180;
        const horizonY = h * 0.4;
        const groundHeight = h - horizonY;
        
        let progress = 0;

        // Convert wind direction (degrees) to a sideways force factor
        const windAngleRad = windDirection * Math.PI / 180;
        // Use sine for crosswind component; a wind from 90 deg (E) gives max positive drift.
        const driftFactor = Math.sin(windAngleRad);
        const maxDrift = (w / 3) * (windSpeed / 15); // At 15mph, max drift is 1/3 canvas width

        const draw = () => {
            ctx.clearRect(0, 0, w, h);

            // Draw Sky
            ctx.fillStyle = '#a1d4e2';
            ctx.fillRect(0, 0, w, horizonY);

            // Draw Ground
            ctx.fillStyle = '#c8e6c9';
            ctx.fillRect(0, horizonY, w, groundHeight);

            // Draw Fairway Lines for perspective
            ctx.beginPath();
            ctx.moveTo(w * 0.1, h);
            ctx.lineTo(w * 0.45, horizonY);
            ctx.moveTo(w * 0.9, h);
            ctx.lineTo(w * 0.55, horizonY);
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.stroke();

            // Draw Center Line for reference
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            ctx.moveTo(w / 2, h);
            ctx.lineTo(w / 2, horizonY);
            ctx.stroke();
            ctx.setLineDash([]); // Reset for other lines

            // Ball flight calculations
            const flightProgress = Math.sin(progress * Math.PI); // 0 -> 1 -> 0
            const perspectiveScale = 1 - (progress * 0.7); // 1 -> 0.3
            
            const ballHeight = flightProgress * (h * 0.8);
            const drift = driftFactor * maxDrift * progress;

            const screenX = w / 2 + drift * perspectiveScale;
            const screenY = h - (ballHeight * perspectiveScale) - (groundHeight * (1 - perspectiveScale)) * 0.5;

            // Draw shadow
            ctx.beginPath();
            ctx.fillStyle = `rgba(0, 0, 0, ${0.2 * flightProgress * perspectiveScale})`;
            ctx.ellipse(screenX, h - 5 * perspectiveScale, 5 * perspectiveScale, 2 * perspectiveScale, 0, 0, Math.PI * 2);
            ctx.fill();

            // Draw ball
            ctx.beginPath();
            ctx.arc(screenX, screenY, Math.max(2, 8 * perspectiveScale), 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.stroke();
        };

        const loop = () => {
            progress += 0.01;
            if (progress >= 1) {
                progress = 0;
            }
            draw();
            animationFrameId.current = requestAnimationFrame(loop);
        };

        // Cleanup previous animation frame
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        loop();

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [windSpeed, windDirection]);

    return (
        <div className="bg-golf-green-light rounded-xl shadow-md p-4">
            <h3 className="font-bold mb-2 text-golf-green-dark font-roboto text-lg">Wind Impact on Ball Flight</h3>
            <div className="relative h-48 rounded-lg overflow-hidden border border-gray-200">
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
                <div className="absolute inset-0 flex items-end justify-center p-4">
                    <p 
                        className="text-center font-bold text-white font-roboto"
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}
                    >
                        {windSpeed > 2 ? `Expect a ~${windEffectYards.toFixed(0)}-yard sideways drift from a ${direction} crosswind.` : "Light wind, minimal effect on flight."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WindImpact;