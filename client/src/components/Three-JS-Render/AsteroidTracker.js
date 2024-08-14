import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import styles from "../../index.css";
import { createSun, drawBody, orbitalCurve, updateBody, updateCurve, updateLabel, updateIcon, followBody} from "./BodyVisual";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Asteroid, orbitalData, Earth, getCurrentD } from "./BodyPosition";
import asteroids from "./asteroids.json"

const AsteroidTracker = ({ speed, setViewDate, t, setT }) => {
    var celestials = orbitalData;
    const mountRef = useRef(null);
    const controlsRef = useRef(null)
    const cameraRef = useRef(null); // Declare the camera ref
    const [textLabels, setTextLabels] = useState([]);
    const [icons, setIcons] = useState([]);
    const datenow = new Date();
    const d = getCurrentD(datenow);
    const KM = 149.6;
    const sceneDiv = document.getElementById("scene")
    const bodiesRef = useRef({});
    const intervalRef = useRef(null);

    const n2_ = (str) => str.replace(/\s+/g, '_');

    const addDays = (now, days) => new Date(new Date(now).setDate(now.getDate() + days));

    const createAsteroids = (lst) => {
        for (let i = 0; i < 10; i++) {
            let data = lst[i];
            celestials[n2_(data.full_name)] = new Asteroid(
                Number(data.epoch), Number(data.om), Number(data.i), Number(data.w),
                Number(data.a), Number(data.e), Number(data.ma), Number(data.per),
                n2_(data.full_name), 0xf0f0f0, "asteroid.jpg", false, 1, false
            );
        }
    };
    createAsteroids(asteroids);

    useEffect(() => {
        // Scene setup (runs only once)
        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer();

        // Camera Settings
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.z = 1000;
        camera.far = 100000000000;
        camera.near = 0.00001;
        camera.updateProjectionMatrix();
        cameraRef.current = camera; // Assign the camera to the ref

        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controlsRef.current = controls

        // Add the Sun
        const sun = createSun();
        scene.add(sun);

        // Initialize all bodies and orbits
        const labels = []; // Temporary array to hold label elements
        const tempIcons = [];
        for (const [name, obj] of Object.entries(celestials)) {
            let xeclip, yeclip, zeclip;
            const curD = d + t;

            if (name === "Earth") {
                ({ xeclip, yeclip, zeclip } = new Earth().coordinates(curD));
            } else {
                ({ xeclip, yeclip, zeclip } = obj.coordinates(curD));
            }

            const x = xeclip * KM;
            const y = yeclip * KM;
            const z = zeclip * KM;

            const sphere = drawBody(x, y, z, obj.mesh, obj.radius);
            scene.add(sphere);
            const textPosition = new THREE.Vector3();
            const iconPosition = new THREE.Vector3();
            if (obj.orbit === true) {
                const orbit = orbitalCurve(obj, obj.color, d, t);
                scene.add(orbit);
                bodiesRef.current[name] = { obj, sphere, orbit, textPosition, iconPosition };
            } else {
                const orbit = 0;
                bodiesRef.current[name] = { obj, sphere, orbit, textPosition, iconPosition };
            }

            if (obj.label === true) {
                labels.push(
                    <div
                        key={name}
                        id={name}
                        className='absolute z-50 text-white hover:cursor-pointer'
                        style={{ color: `#${obj.color.toString(16)}` }}
                        onClick={() => followBody(name, controls, d, t, celestials)}
                    >
                        {name}
                    </div>
                );
                tempIcons.push(
                    <div
                        key={`${name}-icon`}
                        id={`${name}-icon`}
                        className='hover:cursor-pointer absolute z-50 rounded-full size-1.5'
                        style={{ backgroundColor: `#${obj.color.toString(16)}` }}
                        onClick={() => followBody(name, controls, d, t, celestials)} 
                    ></div>
                );
        }
    }

        // Update state with generated labels
        setTextLabels(labels);
        setIcons(tempIcons)

        // Render loop (runs continuously)
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };

        animate();

        // Clean up function (when the component is unmounted)
        return () => {
            clearInterval(intervalRef.current);
            mountRef.current.removeChild(renderer.domElement);
        };
    }, []); // Empty dependency array ensures this effect runs only once

    useEffect(() => {
        clearInterval(intervalRef.current);

        // Animation interval (runs when speed changes)
        intervalRef.current = setInterval(() => {
            setT((prevT) => prevT + Number(speed));
            setViewDate(addDays(datenow, t));

            // Updates body position and orbit curve based on the t value
            for (const [name, body] of Object.entries(bodiesRef.current)) {
                updateBody(body, d, t);
                if (body.orbit !== 0) {
                    updateCurve(body.orbit, body.obj, body.obj.color, d, t);
                }
                if(body.obj.label === true){
                    var model = bodiesRef.current[name];
                    var textDiv = document.getElementById(name)
                    var iconDiv = document.getElementById(`${name}-icon`)
                    var textPosition = bodiesRef.current[name].textPosition;
                    var iconPosition = bodiesRef.current[name].iconPosition;
                    updateLabel(model, textDiv, sceneDiv, cameraRef.current, textPosition)
                    updateIcon(model, iconDiv, sceneDiv, cameraRef.current, iconPosition)
                }
            }
        }, 10);

        // Clean up interval when speed changes
        return () => clearInterval(intervalRef.current);
    }, [speed, t, d]);
    return (
        <>
            <div id="scene" ref={mountRef}></div>
            {textLabels}
            {icons}
        </>
    );
};

export default AsteroidTracker;
