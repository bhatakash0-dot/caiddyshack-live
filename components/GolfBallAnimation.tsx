import React, { useEffect, useRef } from "react";

interface Props {
  rollFactor: number; // 1 for fast/dry, 0 for slow/wet
}

const GolfBallAnimation: React.FC<Props> = ({ rollFactor }) => {
    const ref = useRef<HTMLCanvasElement | null>(null);
    
    // Calculate estimated roll in yards. Assume 2 yards for wettest, 15 for driest.
    const rollYards = (2 + rollFactor * 13).toFixed(0);
    
    const descriptiveText = rollFactor > 0.8 ? "Greens are fast." :
                     rollFactor > 0.5 ? "Average roll on the greens." :
                     "Soft, damp greens.";

    const rollText = `${descriptiveText} Expect ~${rollYards} yards of roll.`;

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animFrameId: number;

        const w = canvas.width = 360;
        const h = canvas.height = 90;

        const drawGrass = () => {
            const lightGreen = '#c8e6c9'; // Brighter light green
            const darkGreen = '#81c784';  // Brighter dark green

            // Fill with the base light color
            ctx.fillStyle = lightGreen;
            ctx.fillRect(0, 0, w, h);
            
            // Draw darker stripes on top
            ctx.fillStyle = darkGreen;
            const stripeCount = 6;
            const stripeHeight = h / stripeCount;
            for (let i = 0; i < stripeCount; i++) {
                if (i % 2 !== 0) { // Draw odd stripes (1, 3, 5)
                    ctx.fillRect(0, i * stripeHeight, w, stripeHeight);
                }
            }
        };

        let x = 20;
        const y = h / 2;
        let v = 6 * rollFactor; // px/frame
        // More friction for wetter (lower rollFactor) conditions
        const friction = 0.02 + (1 - rollFactor) * 0.06;

        const drawBall = () => {
            ctx.beginPath();
            ctx.arc(x, y, 9, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.stroke();
        };

        const loop = () => {
            drawGrass();
            drawBall();

            x += v;
            v = Math.max(0, v - friction);

            // Reset animation
            if (x > w - 20 || v <= 0.01) {
                x = 20;
                v = 6 * rollFactor;
            }

            animFrameId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            cancelAnimationFrame(animFrameId);
        };
    }, [rollFactor]);

    return (
        <div className="bg-golf-green-light rounded-xl shadow-md p-4">
            <h3 className="font-bold mb-2 text-golf-green-dark font-roboto text-lg">Ball Roll on Green</h3>
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <canvas ref={ref} className="w-full h-auto" />
                <div className="absolute inset-0 flex items-end justify-center p-4">
                     <p 
                        className="text-center font-bold text-white font-roboto"
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}
                     >
                        {rollText}
                     </p>
                </div>
            </div>
        </div>
    );
};

export default GolfBallAnimation;