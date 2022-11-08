import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class Controllers {
    constructor(params) {
        this.controls = new OrbitControls(params.camera.camera, params.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 1000;
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE
        }
        this.controls.panSpeed = 0.3;
        this.controls.rotateSpeed = 0.1;
        this.controls.position = new THREE.Vector4(1200, 0, 900);
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.update();
    }
}

export default Controllers;