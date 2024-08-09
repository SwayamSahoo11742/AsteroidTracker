import AsteroidTracker from './components/Three-JS-Render/AsteroidTracker';
import { Slider } from './components/UI/slider';
import { Timeline } from './components/UI/timeline';
import styles from "./index.css";
import React, { useState } from 'react';

const App = () => {
    const [speed, setSpeed] = useState(0); // Moved speed state here
    const [viewDate, setViewDate] = useState(new Date());  
    const [t, setT] = useState(0);     
    return (
        <div className="relative h-screen bg-gradient-to-r from-blue-400 to-purple-500">
            {/* 3D Scene */}
            <div className="absolute inset-0 z-10">
                <AsteroidTracker speed={speed} setViewDate={setViewDate} t={t} setT={setT}/> {/* Pass speed as a prop */}
            </div>

            {/* UI overlay */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center text-white z-20">
                <div className="w-4/12 max-w-3xl px-4 py-2">
                    <Slider speed={speed} setSpeed={setSpeed} /> {/* Pass speed and setSpeed as props */}
                </div>
                <div className="w-full max-w-3xl px-4 py-2 mt-4">
                    <Timeline viewDate={viewDate} setT={setT} />
                </div>
            </div>
        </div>
    );
};

export default App;
