import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bounds, OrbitControls } from '@react-three/drei';
import { Sun, Body, OrbitalCurve, InstancedAsteroids, initBodies, updateLabel,updateIcon, followBody, ZoomComponent, CameraController} from "./BodyVisual";
import { getCurrentD, orbitalData } from "./BodyPosition";
import Stats from 'stats.js';
import { asteroidData, pha, cometData } from './AsteroidData';

const AsteroidTracker = ({ speed, setViewDate, t, showNEO, showPHA, showComet}) => {
    const [labeledBodies, setLabeledBodies] = useState({"Mercury":"#dabaff", "Venus":"#fa9a41", "Earth":"#1fb0e0", "Mars":"#e0521f", "Jupiter":"#f2a285", "Saturn":"#e0d665", "Uranus":"#8ee6e4", "Neptune":"#4534fa"});
    const asteroidCount = 35469;
    const PHACount = 2440;
    const cometCount = 205;
    const d = getCurrentD(new Date());
    const datenow = new Date();
    const celestials = orbitalData;
    const bodies = {};
    const orbitalCurves = [];
    const canvas = document.getElementById("canvas");
    const addDays = (now, days) => new Date(new Date(now).setDate(now.getDate() + days));
    const bodyRefs = useRef({}); // Create an array of refs
    const [target, setTarget] = useState(new THREE.Vector3(0,0,0))
    const controls = useRef();
    const [zoomFactor, setZoomFactor] = useState(1);
    const [followingBody, setFollowingBody] = useState(null);
    const [alt, setAlt] = useState(0);
    const [az, setAz] = useState(0);


    initBodies(celestials, d, t, bodies, orbitalCurves);

    
    // Assign refs to bodies
    useEffect(() => {
        // Update bodyRefs.current to match the structure of bodies
        const updatedRefs = {};
        Object.keys(bodies).forEach((name) => {
            if (!bodyRefs.current[name]) {
                bodyRefs.current[name] = React.createRef();
            }
            updatedRefs[name] = bodyRefs.current[name];
        });
    
        // Keep only refs for existing bodies
        bodyRefs.current = updatedRefs;
    }, [bodies]);

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
        const { camera } = useThree();
        
        useFrame(() => {
            setViewDate(addDays(datenow, t.current));
            t.current += Number(speed.current) / 30;
        
            // Update stats
            statsRef.current.begin();
            statsRef.current.end();
        
            // Updating labels and icons
            Object.entries(labeledBodies).forEach(([body, color]) => {
                const bodyDiv = document.getElementById(body);
                const textPosition = new THREE.Vector3();
                const iconDiv = document.getElementById(`${body}-icon`);
                const iconPosition = new THREE.Vector3();
        
                if (bodyRefs.current[body] && bodyDiv && canvas) {
                    updateLabel(bodyRefs.current[body], bodyDiv, canvas, camera, textPosition);
                    updateIcon(bodyRefs.current[body], iconDiv, canvas, camera, iconPosition);
                }
                if(followingBody){
                    followBody(followingBody, bodyRefs, zoomFactor, controls, camera, setTarget, alt, az)
                }
        
            });
        });
    };
    


    return (
        <>
            <Canvas
                id='canvas'
                gl={{ alpha: false, antialias: true }} style={{ background: 'black' }}
                camera={{ position: [0, 0, 150], far: 100000 }} // Adjusted camera position
            >
                <Sun />
                {Object.entries(bodies).map(([name, body]) => (
                    <Body
                        key={name}
                        obj={body.props.obj}
                        d={d}
                        t={t}
                        mesh={body.props.mesh}
                        radius={body.props.radius}
                        ref={el => bodyRefs.current[name] = el}
                    />
                ))}
                {orbitalCurves}
                {showNEO ? <InstancedAsteroids asteroidCount={asteroidCount} d={d} t={t} data={asteroidData} pha={false} /> : null}
                {!showNEO && !showPHA ? null : <InstancedAsteroids asteroidCount={PHACount} d={d} t={t} data={pha} pha={showPHA} />}
                {showComet? <InstancedAsteroids asteroidCount={cometCount} d={d} t={t} data={cometData} pha={false} comet={true}/> : null}
                <OrbitControls target={target} ref={controls}/>
                <Animation />
                <ZoomComponent setZoomFactor={setZoomFactor} zoomFactor={zoomFactor}/>
                <CameraController setAlt={setAlt} alt={alt} az={az} setAz={setAz}/>
            </Canvas>

            {/* Text Labels */}
            {Object.entries(labeledBodies).map(([body,color]) => (
                <div key={body} id={body} onClick={() => setFollowingBody(body)} className="absolute z-50 text-white hover:cursor-pointer" style={{color:color}}>
                    {body}
                </div>
            ))} 

            {/* Icons */}
            {Object.entries(labeledBodies).map(([body,color]) => (
                <div key={`${body}-icon`} id={`${body}-icon`} className='absolute z-50 rounded-full size-2.5' style={{backgroundColor: color}}></div>
            ))}

            
        </>
    );
};

export default AsteroidTracker;
