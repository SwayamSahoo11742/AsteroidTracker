import React from "react";

export const Slider = ({ speed, setSpeed }) => {
    const changeSpeed = (event) => {
        setSpeed(event.target.value);
    };

    return (
        <div className="flex flex-col items-center">
            <div className="text-white mb-2">{Math.round(Number(speed) * 100)} days/s</div>
            <input
                type="range"
                max="3.65"
                min="-3.65"
                step="0.0416666"
                value={speed}
                onChange={changeSpeed}
                className="w-full mb-2 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer" // Tailwind CSS classes
            />
        </div>
    );
};
