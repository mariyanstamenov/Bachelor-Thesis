import * as THREE from 'three';

class Camera {

    constructor() {
        this.camera = new THREE.PerspectiveCamera(45, window.screen.width / window.screen.height, 1.0, 10000);
        this.camera.position.set(0,400, 100);
    }
};

export default Camera;