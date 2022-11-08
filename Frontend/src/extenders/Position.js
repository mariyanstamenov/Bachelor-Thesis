import Decimal from 'decimal.js';

import { maps } from '../utils/configs';

class Position {
    constructor(scene, point, mapIndex, ground, label) {
        this.scene = scene;
        this.point = point;
        this.mapIndex = mapIndex;
        this.ground = ground;
        this.label = label;
    }

    calculatePoint(lng, lat) {
        const mapWidth = this.ground.ground.geometry.parameters.width;
        const mapHeight = this.ground.ground.geometry.parameters.height;

        const lngMax = maps[this.mapIndex].options.lngMax;
        const lngMin = maps[this.mapIndex].options.lngMin;
        const latMax = maps[this.mapIndex].options.latMax;
        const latMin = maps[this.mapIndex].options.latMin;

        const lngDifference = new Decimal(lngMax).minus(lngMin).toNumber();
        const latDifference = new Decimal(latMax).minus(latMin).toNumber();

        // (lng - lngMin) / (lngDifference));
        const x = new Decimal(new Decimal(lng).minus(lngMin)).dividedBy(lngDifference).toNumber();
        // ((mapWidth * x) - (mapWidth / 2));
        const newX =  new Decimal(new Decimal(mapWidth).times(x)).minus(new Decimal(mapWidth).dividedBy(2)).toNumber();

        // ((lat - latMin) / (latDifference))
        const z = new Decimal(new Decimal(lat).minus(latMin)).dividedBy(latDifference).toNumber();
        // ((mapHeight * z) - (mapHeight / 2))
        const newZ = new Decimal(new Decimal(mapHeight).times(z)).minus(new Decimal(mapHeight).dividedBy(2)).toNumber();

        return { newX, newZ: (newZ * (-1)) };
    }
}

export default Position;