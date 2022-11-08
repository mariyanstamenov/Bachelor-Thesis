import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';

class Distance {

    constructor(scene, x, z, radius, color, additionalRadius, additionalY, opacity) {
        this.scene = scene;
        this.x = x;
        this.z = z;

        this.draw(radius, color, additionalRadius, additionalY, opacity);
    }

    draw(radius, color, additionalRadius, additionalY = 0, opacity) {
        this.geometry = new THREE.CircleGeometry(radius + additionalRadius, 32);
        this.material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: opacity
        });
        this.object = new THREE.Mesh(this.geometry, this.material);
        this.object.position.x = this.x;
        this.object.position.z = this.z;
        this.object.position.y = -0.99 + additionalY;
        this.object.rotation.x = -Math.PI / 2;

        this.object.castShadow = true;
        this.object.receiveShadow = true;

        this.object.userData.canSelect = true;
        this.object.userData.uuid = uuidv4();

        this.object.userData.info = {
            type: "circle",
            point: {
                x: this.x,
                z: this.z,
                radius: radius,
                additionalRadius: additionalRadius,
                additionalY: additionalY
            }
        }

        this.scene.add(this.object);
    }
}

export default Distance;