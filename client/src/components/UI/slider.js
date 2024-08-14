import React, { useState } from "react";
import "./slider.css"
export const Slider = ({ speed, setSpeed, setT }) => {
    const changeSpeed = (event) => {
        setSpeed(event.target.value);
    };
    const pause = (event) => {
        setSpeed(0)
    }
    const live = (event) =>{
        setT(0)
        setSpeed(1.15740741e-7)
    }
    return (
        <div className="flex flex-col items-center">
            <div className="text-white mb-2 flex w-3/4 justify-between items-center">
                <button id="live" onClick={live}>Live</button>
                <span>{Math.round(Number(speed) * 100)} days/s</span>
                <button id="pause" onClick={pause}></button>
            </div>
            <input
                id="speed-slider"
                type="range"
                max="3.65"
                min="-3.65"
                step="0.0416666"
                value={speed}
                onChange={changeSpeed}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer" // Tailwind CSS classes
            />
        </div>
    );
};
