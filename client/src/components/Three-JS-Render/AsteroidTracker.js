import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Sun, Body, OrbitalCurve, InstancedAsteroids, initBodies } from "./BodyVisual";
import { getCurrentD, orbitalData, Asteroid} from "./BodyPosition";
import Stats from 'stats.js';
import { asteroidData } from './AsteroidData';

const AsteroidTracker = ({ speed, viewDate, setViewDate, t }) => {
    const asteroidCount = 35000;
    const d = getCurrentD(new Date());
    const datenow = new Date();
    const celestials = orbitalData;
    const bodies = [];
    const orbitalCurves = [];
    const addDays = (now, days) => new Date(new Date(now).setDate(now.getDate() + days));
    const stats = useRef(null);

    initBodies(celestials, d, t, bodies, orbitalCurves)



    const Animation = () => {
        const lastTime = useRef(0);
        const interval = 0.1;

        useFrame(({ clock }) => {
            const elapsedTime = clock.getElapsedTime();
            if (elapsedTime - lastTime.current >= interval) {
                setViewDate(addDays(datenow, t.current));
                t.current += Number(speed.current);
                lastTime.current = elapsedTime;
            }
        });
    };

    return (
        <Canvas
            gl={{ alpha: false, antialias: true }} style={{ background: 'black' }}
            camera={{ position: [0, 0, 150], far: 10000 }} // Adjusted camera position
        >
            <Sun />
            {bodies}
            {orbitalCurves}
            <InstancedAsteroids asteroidCount={asteroidCount} d={d} t={t}/>
            <OrbitControls />
            <Animation />
        </Canvas>
    );
};

export default AsteroidTracker;
