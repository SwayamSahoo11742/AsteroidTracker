/*  Combines all the functions and classes from BodyPosition.js and BodyVisual.js to create the final threejs scene   */

import React, { useEffect, useRef} from 'react';
import * as THREE from 'three';
import styles from "../../index.css"
import {createSun, drawBody, orbitalVectors, orbitalLineProperties, orbitalCurve, followBody, updateBody, updateCurve} from "./BodyVisual"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {Asteroid, orbitalData, Earth, getCurrentD} from "./BodyPosition"
const AsteroidTracker = () => {
  const asteroids = [[54465177,"       (2024 OR1)",2460518.5,0.3748674005642724,1.451355255608841,5.395116589003017,141.5630586798764,220.8290318745761,333.1071345627266,638.6442726005058]]
  var celestials = orbitalData;
  const mountRef = useRef(null);
  const d = getCurrentD(Date.now());
  const KM = 149.6;

const n2_ = (str) => {
  const newStr = str.replace(/\s+/g, '_');
  return newStr;
}


const createAsteroids = (lst) => {
  lst.forEach(data =>{
    celestials[n2_(data[1])] = new Asteroid(Number(data[2]), Number(data[6]), Number(data[5]), Number(data[7]), Number(data[4]), Number(data[3]), Number(data[8]), Number(data[9]), n2_(data[1]), 0xf0f0f0, "asteroid.jpg", true, 1)
  })
}
createAsteroids(asteroids)
  
  useEffect(() => {
    // Scene set ups
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

    // State storing variables
    // t is in days
    var t = -30;
    // json to store each bodies name, sphere object, orbit object and Celestial object
    var bodies = {};

    // Add the Sun
    const sun = createSun();
    scene.add(sun);

    // Loop to initialize all bodys and orbits 
    for (const [name, obj] of Object.entries(celestials)) {
      let xeclip, yeclip, zeclip;
      const curD = d + t;
      // Special case for the earth as it uses the Earth class
      if(name === "Earth"){
        ({xeclip, yeclip, zeclip} = new Earth().coordinates(curD)) 
      }else{
        ({xeclip, yeclip, zeclip} = obj.coordinates(curD))
      }
      
      const x = xeclip * KM;
      const y = yeclip * KM;
      const z = zeclip * KM;

      // Bodies sphere object stored to update later for animations
      const sphere = drawBody(x, y, z, obj.mesh, obj.radius);
      scene.add(sphere);

      // Adding orbit curve object if the body has one
      if (obj.orbit === true){
        const orbit =  orbitalCurve(obj, obj.color, d, t);
        scene.add(orbit);
        bodies[name] = {obj, sphere, orbit};
      }
      else{
        const orbit = 0;
        bodies[name] = {obj, sphere, orbit}
      }
      
    }
    
    
    // Animate function
    const updateAnimation = () => {
      // Updates body position and orbit curve based on the t value which updates in an interval 
      // t increments by 1 second ( 1/(60*60*24) days ) every second in the final product
      for(const [name, body] of Object.entries(bodies)){
        updateBody(body, d, t)
        if(body.orbit !== 0){
          updateCurve(body.orbit, body.obj, body.obj.color, d, t)
        }
      }

      // Follow the specified body
      followBody("Earth", controls, d, t, celestials)
    };


    // Call updateAnimation every second and update t
    const interval = setInterval(() => {
      updateAnimation();
      t += 0.01;
    }, 10);


    // Render loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    // Clean up function
    return () => {
      clearInterval(interval);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <>
    <div id="scene" ref={mountRef}></div>
    </>
    ;
};

export default AsteroidTracker;
