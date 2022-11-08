import * as THREE from 'three';
import { MeshLine, MeshLineMaterial } from 'three.meshline';

import Position from '../extenders/Position';

class Line extends Position {
    constructor(scene, point, mapIndex, ground, label) {
        super(scene, point, mapIndex, ground, label);

        this.calculatePosition();
    }

    calculatePosition() {
        let y = -0.9;
        this.point.geom.coordinates.forEach(point => {
            const points = [];
            point.forEach((_point, index) => {
                const lat = _point[1];
                const lng = _point[0];

                const { newX, newZ } = this.calculatePoint(lng, lat);
                points.push(new THREE.Vector3(newX, y, newZ));
            });
            this.draw(points);
        });
    }

    draw(points) {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new MeshLine();
        line.setGeometry(geometry);
        const material = new MeshLineMaterial({
            color: 0x000000,
            lineWidth: 0.2
        });
        this.object = new THREE.Mesh(line, material);
        this.object.userData.info = {
            line: {
                id: this.point.id,
                id_einrichtung: this.point.id_einrichtung,
                id_wohnort: this.point.id_wohnort,
                length: this.point.length,
                points: points
            },
            type: "line",
            label: this.label,
            canSelect: true
        }

        this.scene.add(this.object);
    }
};

export default Line;