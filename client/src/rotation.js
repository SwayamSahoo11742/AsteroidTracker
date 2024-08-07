import * as THREE from "three";
const perihelionDates = {
  'Mercury': timeSincePerihelion(Date.now(), new Date(2024, 4, 15)),
  'Venus': timeSincePerihelion(Date.now(), new Date(2024, 0, 4)),
  'Earth': timeSincePerihelion(Date.now(), new Date(2023, 0, 4)),
  'Mars': timeSincePerihelion(Date.now(), new Date(2022, 5, 21)),
  'Jupiter': timeSincePerihelion(Date.now(), new Date(2023, 0, 20)),
  'Saturn': timeSincePerihelion(Date.now(), new Date(2003, 6, 27)),
  'Uranus': timeSincePerihelion(Date.now(), new Date(2024, 4, 15))
};
export default class Rotation {
  constructor(planetMesh, showRotation = false) {
    this.planetPositionX = planetMesh.position.x;
    this.y = 0.25;
    this.z = 0.25;
    this.showRotation = showRotation;
  }
  
  getMesh() {
    if (this.mesh === undefined || this.mesh === null) {
      const geometry = new THREE.BoxGeometry(this.planetPositionX, 0.25, 0.25);
      const material = new THREE.MeshNormalMaterial();
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.position.x = this.planetPositionX / 2;
      this.mesh.visible = this.showRotation;
    }
    return this.mesh;
  }
}