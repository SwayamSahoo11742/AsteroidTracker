import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {Celestial, Asteroid, celestials, Earth} from "./Celestial"
const PlanetaryOrbits = () => {
  // Julian Date given a date
  const getCurrentD = (t) => {
    const now = t;
    const julianDate = now / 86400000 + 2440587.5;
    const d = julianDate - 2451543.5;

    return d;
  }
  const hidden = useState("false")
  const asteroids = [[54465177,"       (2024 OR1)",2460518.5,0.3748674005642724,1.451355255608841,5.395116589003017,141.5630586798764,220.8290318745761,333.1071345627266,638.6442726005058]]


  const [target, setTarget] = useState({x:0,y:0,z:0})
  const mountRef = useRef(null);
  const [d, setD] = useState(getCurrentD(Date.now()));
  const KM = 149.6;



  //  Orbital elements of the major plents
  const celestials = {
  Mercury : new Celestial(48.3313, 3.24587E-5,
    7.0047, 5.00E-8,
    29.1241, 1.01444E-5,
    0.387098, 0,
    0.205635, 5.59E-10,
    168.6562, 4.0923344368,
    0xdabaff, "Mercury.jpg", true,
    0.002440),
  
  Venus : new Celestial(
    76.6799, 2.46590E-5,
    3.3946, 2.75E-8,
    54.8910, 1.38374E-5,
    0.723330, 0,
    0.006773, - 1.302E-9,
    48.0052, 1.6021302244,
    0xfa9a41, "Venus.jpg", true,
    0.006052),
    Earth: new Earth(),

    Mars: new Celestial(
      49.5574, 2.11081E-5,
      1.8497, -1.78E-8,
      286.5016, 2.92961E-5,
      1.523688, 0,
      0.093405, 2.516E-9,
      18.6021, 0.5240207766,
      0xe0521f, "Mars.jpg", true,
      0.003396),

    Jupiter : new Celestial(
      100.4542, 2.76854E-5,
      1.3030, -1.557E-7,
      273.8777, 1.64505E-5,
      5.20256, 0,
      0.048498, 4.469E-9,
      19.8950, 0.0830853001,
      0xf2a285, "Jupiter.jpg", true,
      0.071492),
    
    Saturn : new Celestial(
      113.6634, 2.38980E-5,
      2.4886, -1.081E-7,
      339.3939, 2.97661E-5,
      9.55475, 0,
      0.055546, -9.499E-9,
      316.9670, 0.0334442282,
      0xe0d665, "Saturn.jpg", true,
      0.060268),
    
    Uranus : new Celestial(
      74.0005, 1.3978E-5,
      0.7733, 1.9E-8,
      96.6612, 3.0565E-5,
      19.18171, -1.55E-8,
      0.047318, 7.45E-9,
      142.5905, 0.011725806,
      0x8ee6e4, "Uranus.jpg", true,
      0.025559
    ),
    
    Neptune : new Celestial(
      131.7806, 3.0173E-5,
      1.7700, -2.55E-7,
      272.8461, 6.027E-6,
      30.05826, 3.313E-8,
      0.008606, 2.15E-9,
      260.2471, 0.005995147,
      0x4534fa, "Neptune.jpg", true,
      0.024764
    )
}

const n2_ = (str) => {
  let newstr = "";
  for(let i = 0; i < str.length; i++){
    if(str[i] === ' '){
      newstr = newstr.concat('_');
    }else{
      newstr = newstr.concat(str[i]);
    }
  }
  return newstr;
}


const createAsteroids = (lst) => {
  lst.forEach(data =>{
    celestials[n2_(data[1])] = new Asteroid(Number(data[2]), Number(data[6]), Number(data[5]), Number(data[7]), Number(data[4]), Number(data[3]), Number(data[8]), Number(data[9]), n2_(data[1]), 0xf0f0f0, "asteroid.jpg", true, 1)
  })
}
createAsteroids(asteroids)
  
  useEffect(() => {
    document.getElementById("scene").setAttribute("hidden", true)
    // Scene set ups
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    // State storing variables
    var t = -30;
    var bodies = {};

    // Add the Sun
    const sunGeometry = new THREE.SphereGeometry(32, 32, 32);
    const sunTexture = new THREE.TextureLoader().load("Sun.jpg")
    const sunMaterial = new THREE.MeshBasicMaterial({map: sunTexture});
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    //  Draws body at given heliocentric ecliptic rectangular coords with a given mesh
    const drawBody = (x, y, z, mesh, radius) => {
      const geometry = new THREE.SphereGeometry(radius, 32, 16);
      const texture = new THREE.TextureLoader().load(mesh)
      const material = new THREE.MeshBasicMaterial({map: texture});
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(x, y, z);
      scene.add(sphere);
      return sphere;
    };

    //  Updates body's position
    const updateBody = (body) => {
      const {xeclip, yeclip, zeclip} = body.obj.coordinates(d+t);
      const x = xeclip * KM;
      const y = yeclip * KM;
      const z = zeclip * KM;
      body.sphere.position.x = x;
      body.sphere.position.y = y;
      body.sphere.position.z = z;
    }

    // Curve with a fading trail as the orbit for bodies. obj is Celestion object
    const orbitalCurve = (obj, color) => {
      let vectors = orbitalVectors(obj);
      vectors = flipArray(vectors);
      const {geometry, material} = orbitalLineProperties(vectors, color);
    
      // Create the final object to add to the scene
      const curveObject = new THREE.Line(geometry, material);
      scene.add(curveObject);
      return curveObject;
    };

    const flipArray = (array) => {
      let newArray = [];
      for(let i = array.length-1; i >= 0; i--){
        newArray.push(array[i]);
      }
      return newArray
    }

    const orbitalLineProperties = (vectors, color) => {
        // 3d vectors used to create a CatmullRom curve
        const curve = new THREE.CatmullRomCurve3(vectors);
        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
        const fadeRate = 2;
        // Create a buffer attribute for the alpha values (Fading effect)
        const alphas = new Float32Array(points.length);
        for (let i = 0; i < points.length; i++) {
          alphas[i] = Math.pow(i / (points.length - 1), fadeRate) // This will create a gradient from 0 to 1
        }
        geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
      
        // Create the custom shader material
        const material = new THREE.ShaderMaterial({
          uniforms: {
            color: { value: new THREE.Color(color) }
          },
          vertexShader: `
            attribute float alpha;
            varying float vAlpha;
            void main() {
              vAlpha = alpha;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 color;
            varying float vAlpha;
            void main() {
              gl_FragColor = vec4(color, vAlpha);
            }
          `,
          transparent: true
      });
      return {geometry, material};

    }

    const orbitalVectors = (obj) => {
      var vectors = [];
      const P = obj.P(d + t);
      const part = P / 50;
      var curd = d + t;
      for (let i = 0; i < 51; i++) {
        curd = (d + t) - (i * part);
        const { xeclip, yeclip, zeclip } = obj.coordinates(curd);
        const x = xeclip * KM;
        const y = yeclip * KM;
        const z = zeclip * KM;
        vectors.push(new THREE.Vector3(x, y, z));
      }
      return vectors;
    }

    const updateCurve = (orbit, obj, color) => {
      let vectors = orbitalVectors(obj);
      vectors = flipArray(vectors);
      const {geometry, material} = orbitalLineProperties(vectors, color);
      // update the curve
      orbit.geometry = geometry;
      orbit.material = material;
    }

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
      if (obj.orbit === true){
        const orbit =  orbitalCurve(obj, obj.color);
        bodies[name] = {obj, sphere, orbit};
      }
      else{
        const orbit = 0;
        bodies[name] = {obj, sphere, orbit}
      }
      
    }
    
    // TODO: FIX
    const followBody = (name) => {
      let curD = d + t;
      let xeclip, yeclip, zeclip;
      if(name === "Earth"){
        ({xeclip, yeclip, zeclip} = new Earth().coordinates(curD)) 
      }else{
        ({xeclip, yeclip, zeclip} = celestials[name].coordinates(curD))
      }
      const x = xeclip * KM;
      const y = yeclip * KM;
      const z = zeclip * KM;
      controls.target.set(x, y, z)

      // bodies.name.sphere.add(camera)
    }
    followBody("Earth")

    
    
    camera.position.z = 1000;
    camera.far = 100000000000;
    camera.near = 0.001;
    camera.updateProjectionMatrix();
    
    console.log("READY")
    setInterval(() => {
      document.getElementById("scene").removeAttribute("hidden", true)
    }, 10000);
    // Animate function
    const updateAnimation = () => {
      // Updates body position based on the t value which updates in an interval 
      // t increments by 1 second ( 1/(60*60*24) days ) every second in the final product
      for(const [name, body] of Object.entries(bodies)){
        updateBody(body)
        if(body.orbit !== 0){
          updateCurve(body.orbit, body.obj, body.obj.color)
        }
      }
    };
    // Call updateAnimation every second and update t
    const interval = setInterval(() => {
      updateAnimation();
      t += 0.01;
    }, 10);
    // followBody("Earth")
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
    <div>Loading...</div>
    </>
    ;
};

export default PlanetaryOrbits;
