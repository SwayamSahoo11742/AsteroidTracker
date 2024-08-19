import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Sun, Body, OrbitalCurve } from "./BodyVisual";
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
    const KM = 149.6;
    const addDays = (now, days) => new Date(new Date(now).setDate(now.getDate() + days));
    const stats = useRef(null);

    useEffect(() => {
        stats.current = new Stats();
        stats.current.showPanel(0);
        document.body.appendChild(stats.current.dom);

        return () => {
            document.body.removeChild(stats.current.dom);
        };
    }, []);

    Object.entries(celestials).forEach(([name, obj]) => {
        const { xeclip, yeclip, zeclip } = obj.coordinates(d);
        const x = xeclip * KM;
        const y = yeclip * KM;
        const z = zeclip * KM;

        const body = <Body obj={obj} d={d} t={t} mesh={obj.mesh} radius={obj.radius} />;
        const orbitalCurve = <OrbitalCurve key={`curve-${name}`} obj={obj} color={obj.color} d={d} t={t} />;

        bodies.push(body);
        orbitalCurves.push(orbitalCurve);
    });

    const InstancedSpheres = () => {
        const meshRef = useRef();
    
        const { sphereGeometry, sphereMaterial } = useMemo(() => {
            const sphereGeometry = new THREE.SphereGeometry(1, 1, 1); // Increase the radius to 1
            const sphereMaterial = new THREE.MeshBasicMaterial({ color: "#144be3" });
    
            return { sphereGeometry, sphereMaterial };
        }, []);
    
        useFrame(() => {
            const mesh = meshRef.current;
            if (!mesh) return;
            
            const instanceMatrix = mesh.instanceMatrix;
            for (let i = 0; i < asteroidCount; i++) {
                const matrix = new THREE.Matrix4();
                const {xeclip, yeclip, zeclip} = asteroidData[i].coordinates(d + t.current);
                const x = xeclip * KM;
                const y = yeclip * KM;
                const z = zeclip * KM;
                // const x = (Math.random() - 0.5) * 100; // Position within a smaller range
                // const y = (Math.random() - 0.5) * 100;
                // const z = (Math.random() - 0.5) * 100;
                matrix.setPosition(x, y, z);
                mesh.setMatrixAt(i, matrix);
            }
            instanceMatrix.needsUpdate = true;
        });
    
        return (
            <instancedMesh ref={meshRef} args={[sphereGeometry, sphereMaterial, asteroidCount]} />
        );
    };

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

            stats.current.update();
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
            <InstancedSpheres />
            <OrbitControls />
            <Animation />
        </Canvas>
    );
};

export default AsteroidTracker;
