/* Collection of functions used for rendering the visual aspect of the bodies, which include orbits, body sphere, body animation and orbit animation*/

import * as THREE from "three";
import { Earth } from "./BodyPosition";
import { Canvas, useLoader, useFrame } from '@react-three/fiber'
import React, {useMemo, useEffect, useRef} from "react"
import { asteroidData } from "./AsteroidData";

// Initializes Bodies
export const initBodies = (celestials,d,t,bodies,orbitalCurves) =>{
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
}


// Instance Mesh Asteroids
export const InstancedAsteroids = ({asteroidCount, d, t}) => {
  const meshRef = useRef();

  const AsteroidGeometry = new THREE.SphereGeometry(1, 1, 1); // Increase the radius to 1
  const AsteroidMaterial = new THREE.MeshBasicMaterial({ color: "#144be3" });

  useEffect(() => {
    return () => {
      AsteroidGeometry.dispose(); // Dispose on unmount
      AsteroidMaterial.dispose();
    };
  }, [AsteroidGeometry, AsteroidMaterial]);


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
          matrix.setPosition(x, y, z);
          mesh.setMatrixAt(i, matrix);
      }

      instanceMatrix.needsUpdate = true;
  });

  return (
      <instancedMesh ref={meshRef} args={[AsteroidGeometry, AsteroidMaterial, asteroidCount]} />
  );
};


//  Draws body at given heliocentric ecliptic rectangular coords with a given mesh
export const Body = ({ obj, d, t, mesh, radius }) => {
  const texture = useLoader(THREE.TextureLoader, mesh);
  const KM = 149.6;

  useEffect(() => {
    return () => {
      texture.dispose(); // Dispose texture on unmount
    };
  }, [texture]);

  // Use useMemo to compute the position based on t.current
  const position = useMemo(() => {
      const { xeclip, yeclip, zeclip } = obj.coordinates(d + t.current);
      const x = xeclip * KM;
      const y = yeclip * KM;
      const z = zeclip * KM;
      return [x, y, z];
  }, [obj, d, t]);

  return (
      <mesh position={position}> 
          <sphereGeometry args={[radius, 32, 16]} />
          <meshBasicMaterial attach="material" map={texture} />
      </mesh>
  );
};
const KM = 149.6;

// Generates vectors that will be used to generate a curve to describe a body's orbit
export const orbitalVectors = (obj, d, t) => {
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

// Returns properties needed to create orbital line (geometry and mesh)
export const orbitalLineProperties = (vectors, color) => {
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
export const OrbitalCurve = ({ obj, color, d, t }) => {;

  const { geometry, material } = useMemo(() => {
      // Generate the orbital vectors
      const vectors = orbitalVectors(obj, d, t.current).reverse();

      // Get the geometry and material using the vectors and color
      return orbitalLineProperties(vectors, color);
  }, [obj, color, d, t]);

  useEffect(() => {
    return () => {
      geometry.dispose(); // Dispose of geometry
      material.dispose(); // Dispose of material
    };
  }, [geometry, material]);

  return (
      <line geometry={geometry} material={material} />
  );
};


 // follows a body (works once, therefore miust be looped)
export const followBody = (name, controls, d, t, celestials) => {
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
  controls.update()
  controls.saveState()
}

// Create Sun
export const Sun = () => {
  const sunTexture = useLoader(THREE.TextureLoader, "sun.jpg")

  useEffect(() => {
    return () => {
      sunTexture.dispose(); // Dispose of texture on unmount
    };
  }, [sunTexture]);
  return(
      <mesh position={[0,0,0]}>
          <sphereGeometry args={[2,32,32]}/>
          <meshBasicMaterial attach="material" map={sunTexture}  />
      </mesh>
  )
}

export const updateLabel = (model, textDiv, sceneDiv, camera, textPosition) => {
  if (model) {
    textPosition.setFromMatrixPosition(model.sphere.matrixWorld);
    textPosition.project(camera);

    const halfWidth = sceneDiv.clientWidth / 2;
    const halfHeight = sceneDiv.clientHeight / 2;
    textPosition.x = (textPosition.x * halfWidth) + halfWidth;
    textPosition.y = - (textPosition.y * halfHeight) + halfHeight;

    const labelWidth = textDiv.offsetWidth;
    const labelHeight = textDiv.offsetHeight;

    // Check if the label is within the viewport
    const isInViewport = (
      textPosition.x >= -labelWidth &&
      textPosition.x <= sceneDiv.clientWidth &&
      textPosition.y >= -labelHeight &&
      textPosition.y <= sceneDiv.clientHeight
    );

    if (isInViewport) {
      textDiv.style.display = 'block';
      textDiv.style.top = `${Math.max(0, Math.min(textPosition.y, sceneDiv.clientHeight - labelHeight))}px`;
      textDiv.style.left = `${Math.max(0, Math.min(textPosition.x, sceneDiv.clientWidth - labelWidth))}px`;
    } else {
      textDiv.style.display = 'none';
    }
  }
}


export const updateIcon = (model, iconDiv, sceneDiv, camera, iconPosition) => {
  if (model) {
    // Get the position of the object in world space
    iconPosition.setFromMatrixPosition(model.sphere.matrixWorld);
    
    // Project this position to 2D screen space
    iconPosition.project(camera);

    const halfWidth = sceneDiv.clientWidth / 2;
    const halfHeight = sceneDiv.clientHeight / 2;
    iconPosition.x = (iconPosition.x * halfWidth) + halfWidth;
    iconPosition.y = - (iconPosition.y * halfHeight) + halfHeight;

    // Calculate the icon's position relative to its dimensions
    const iconWidth = iconDiv.offsetWidth;
    const iconHeight = iconDiv.offsetHeight;
    
    // Center the icon directly on top of the object
    const iconX = iconPosition.x - (iconWidth / 2);
    const iconY = iconPosition.y - (iconHeight / 2);

    // Set the icon's position
    iconDiv.style.left = `${iconX}px`;
    iconDiv.style.top = `${iconY}px`;

    // Check if the icon is within the viewport
    const isInViewport = (
      iconX >= 0 &&
      iconX <= sceneDiv.clientWidth - iconWidth &&
      iconY >= 0 &&
      iconY <= sceneDiv.clientHeight - iconHeight
    );

    // Toggle visibility based on whether the icon is in the viewport
    iconDiv.style.display = isInViewport ? 'block' : 'none';
  }
};

