import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import styles from "../../index.css";
import { createSun, drawBody, orbitalCurve, updateBody, updateCurve } from "./BodyVisual";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Asteroid, orbitalData, Earth, getCurrentD } from "./BodyPosition";
import asteroids from "./asteroids.json"
const AsteroidTracker = ({ speed, setViewDate, t, setT}) => {
    var celestials = orbitalData;
    const mountRef = useRef(null);
    const datenow = new Date();
    const d = getCurrentD(datenow);
    const KM = 149.6;

    // Declare t outside of the useEffect so that it persists across re-renders
    // const [t, setT] = useState(0);
    const bodiesRef = useRef({});
    const intervalRef = useRef(null);

    const n2_ = (str) => {
        const newStr = str.replace(/\s+/g, '_');
        return newStr;
    };

    const addDays = (now, days) => {
      return new Date(new Date(now).setDate(now.getDate() + days))
    }

    const createAsteroids = (lst) => {
        for(let i = 0; i < 1000; i++){
          let data = lst[i];
          celestials[n2_(data.full_name)] = new Asteroid(Number(data.epoch), Number(data.om), Number(data.i), Number(data.w), Number(data.a), Number(data.e), Number(data.ma), Number(data.per), n2_(data.full_name), 0xf0f0f0, "asteroid.jpg", false, 1);
        }
    };
    createAsteroids(asteroids);

    useEffect(() => {
        // Scene setup (runs only once)
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        const renderer = new THREE.WebGLRenderer();

        // Camera Settings
        camera.position.z = 1000;
        camera.far = 100000000000;
        camera.near = 0.00001;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);

        // Add the Sun
        const sun = createSun();
        scene.add(sun);

        // Initialize all bodies and orbits 
        for (const [name, obj] of Object.entries(celestials)) {
            let xeclip, yeclip, zeclip;
            const curD = d + t;

            // Special case for the earth as it uses the Earth class
            if (name === "Earth") {
                ({ xeclip, yeclip, zeclip } = new Earth().coordinates(curD));
            } else {
                ({ xeclip, yeclip, zeclip } = obj.coordinates(curD));
            }

            const x = xeclip * KM;
            const y = yeclip * KM;
            const z = zeclip * KM;

            // Bodies sphere object stored to update later for animations
            const sphere = drawBody(x, y, z, obj.mesh, obj.radius);
            scene.add(sphere);

            // Adding orbit curve object if the body has one
            if (obj.orbit === true) {
                const orbit = orbitalCurve(obj, obj.color, d, t);
                scene.add(orbit);
                bodiesRef.current[name] = { obj, sphere, orbit };
            } else {
                const orbit = 0;
                bodiesRef.current[name] = { obj, sphere, orbit };
            }
        }

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
        // Clear any existing intervals when speed changes
        clearInterval(intervalRef.current);

        // Animation interval (runs when speed changes)
        intervalRef.current = setInterval(() => {
            setT((prevT) => prevT + Number(speed)); // Update t using setT so it persists
            // speed = speed*100 days/s
            setViewDate(addDays(datenow,t))

            // Updates body position and orbit curve based on the t value
            for (const [name, body] of Object.entries(bodiesRef.current)) {
                updateBody(body, d, t);
                if (body.orbit !== 0) {
                    updateCurve(body.orbit, body.obj, body.obj.color, d, t);
                }
            }
        }, 10);

        // Clean up interval when speed changes
        return () => clearInterval(intervalRef.current);
    }, [speed, t, d]); // Only re-run when speed changes

    return (
        <>
            <div id="scene" ref={mountRef}></div>
        </>
    );
};

export default AsteroidTracker;
