import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';

import Position from '../extenders/Position';

import { calcHeight, calculateFacilityHeight, calculatePillarColor } from '../utils/functions';
import { percentColors } from '../utils/configs';
import { facilityColors } from '../utils/const';
import Decimal from 'decimal.js';

class Pillar extends Position {
    constructor(scene, point, mapIndex, ground, label, w = 0.1, d = 0.1, facilityNumber) {
        super(scene, point, mapIndex, ground, label);

        this.facilityNumber = facilityNumber;
        this.calc(w, d);
    }

    calc(w, d) {
        let lat, lng;
        if (this.label === "Residences") {
            lat = this.point.geom.coordinates[0][1];
            lng = this.point.geom.coordinates[0][0];
        } else {
            lat = this.point.geom.coordinates[1];
            lng = this.point.geom.coordinates[0];
        }

        const { newX, newZ } = this.calculatePoint(lng, lat);

        this.draw(newX, newZ, lat, lng, w, d);
    }

    draw(x, z, lat, lng, w, d) {
        let score, height, pillarColor;
        if (this.label === "Residences") {
            score = this.point.walkscore / 100;
            height = calcHeight(this.point.walkscore);
            pillarColor = calculatePillarColor(percentColors, score);
        } else {
            score = 1;
            const f = calculateFacilityHeight(this.point.type, this.point.length, this.facilityNumber);
            height = f.height;
            const size = new Decimal(new Decimal(f.heightFactor).pow(-0.3).toNumber()).dividedBy(18);
            w = size.toNumber();
            d = size.toNumber();
            pillarColor = new THREE.Color(facilityColors[this.point.type]);

            // no overlapping
            x = x + ((Math.random() * 0.1) * ((Math.random() * 10) >= 5 ? (-1) : 1));
            z = z + ((Math.random() * 0.1) * ((Math.random() * 10) >= 5 ? (-1) : 1));
        }
        this.geometry = new THREE.BoxGeometry(w, height + 1, d);
        this.material = new THREE.MeshLambertMaterial({
            color: new THREE.Color(pillarColor),
            transparent: true,
            opacity: 1
        });
        this.geometry.matrixAutoUpdate = true;
        this.geometry.matrixWorldNeedsUpdate = true;

        this.object = new THREE.Mesh(this.geometry, this.material);

        // set the position of the pillar
        this.object.position.x = x;
        this.object.position.y = (height / 2) - 1;
        this.object.position.z = z;

        this.object.castShadow = true;
        this.object.receiveShadow = true;
        this.object.userData.canSelect = true;
        this.object.userData.uuid = uuidv4();

        this.object.userData.info = {
            originalColor: pillarColor,
            type: "point",
            label: this.label
        }
        if (this.label == "Residences") {
            this.object.userData.info.point = {
                id: this.point.id,
                n_seniors: this.point.n_seniors,
                walkscore: this.point.walkscore
            };
        } else {
            this.object.userData.info.point = {
                id: this.point.id,
                name: this.point.name,
                type: this.point.type,
                length: this.point.length
            };
        }
        this.object.userData.info.point.lat = lat;
        this.object.userData.info.point.lng = lng;

        this.scene.add(this.object);
    }

}

export default Pillar;