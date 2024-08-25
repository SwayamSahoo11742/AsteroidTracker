import AsteroidTracker from './components/Three-JS-Render/AsteroidTracker';
import { Slider } from './components/UI/slider';
import { Timeline } from './components/UI/timeline';
import { Menu } from './components/UI/controlMenu';
import styles from "./index.css";
import React, { useState, useRef } from 'react';

// Disabling native browser zoom so threejs zoom doesn't get interrupted
document.addEventListener('wheel', event => {
    const { ctrlKey } = event;
    if (ctrlKey) {
        event.preventDefault();
        return;
    }
}, { passive: false });

const App = () => {
    const [showPHA, setShowPHA] = useState(false);
    const [showNEO, setShowNEO] = useState(true);
    const speed = useRef(0); // Moved speed state here
    const [viewDate, setViewDate] = useState(new Date());     
    const t = useRef(0);

    return (
        <>
        <div className="relative h-screen bg-gradient-to-r from-blue-400 to-purple-500">
            {/* 3D Scene */}
            <div className="absolute inset-0 z-10">
                <AsteroidTracker speed={speed} setViewDate={setViewDate} t={t} showNEO={showNEO} showPHA={showPHA}/> {/* Pass speed as a prop */}
            </div>

            {/* UI overlay */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center text-white z-20">
                <div className="w-4/12 max-w-3xl px-4 py-2">
                    <Slider speed={speed} t={t} />
                </div>
                <div className="w-full max-w-3xl px-4 py-2 mt-4">
                    <Timeline viewDate={viewDate} t={t} />
                </div>
            </div>

            {/* Menu at the top right */}
            <div className="absolute top-0 right-0 m-4 z-20">
                <Menu setShowNEO={setShowNEO} setShowPHA={setShowPHA} showNEO={showNEO} />
            </div>
        </div>
        </>
    );
};

export default App;
