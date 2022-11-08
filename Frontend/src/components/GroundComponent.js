import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { createMapUrl, maps } from '../utils/configs';

class Ground {
    constructor(params) {
        this.geometry = new THREE.PlaneGeometry(1140, 525);
        const texture = THREE.ImageUtils.loadTexture("./images/map1.png");
        this.material = new THREE.MeshLambertMaterial({ map: texture });
        this.ground = new THREE.Mesh(this.geometry, this.material);

        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.y = -1;
        this.ground.userData.ground = true;

        params.scene.add(this.ground);
    }

    loadNewMap(url) {
        this.material.map = THREE.ImageUtils.loadTexture(`./images/${url}`);
    }
};

export default Ground;