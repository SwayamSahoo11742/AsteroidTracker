import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Sun, Body, OrbitalCurve, InstancedAsteroids, initBodies } from "./BodyVisual";
import { getCurrentD, orbitalData } from "./BodyPosition";
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

    initBodies(celestials, d, t, bodies, orbitalCurves);

    // Initialize Stats.js
    const statsRef = useRef(null);

    useEffect(() => {
        statsRef.current = new Stats();
        statsRef.current.showPanel(0); // 0: FPS, 1: MS/frame, 2: Memory
        document.body.appendChild(statsRef.current.dom);

        return () => {
            document.body.removeChild(statsRef.current.dom);
        };
    }, []);

    const Animation = () => {

        useFrame(({ clock }) => {

            setViewDate(addDays(datenow, t.current));
            t.current += Number(speed.current)/30;
    

            // Update stats
            statsRef.current.begin();
            statsRef.current.end();
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
