import * as THREE from 'three';

class Light {
    constructor(params) {

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
        this.directionalLight.position.set(0, 10000, 0);
        params.scene.add(this.directionalLight);

        this.light = new THREE.SpotLight(0xffffff, 0.4);
        this.light.position.set(1000, 10000, 0);
        this.light.angle = Math.PI / 9;

        this.light.castShadow = true;
        this.light.shadow.camera.near = 1000;
        this.light.shadow.camera.far = 4000;
        this.light.shadow.mapSize.width = 1024;
        this.light.shadow.mapSize.height = 1024;

        params.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        params.scene.add(this.light);

    }
}
export default Light;