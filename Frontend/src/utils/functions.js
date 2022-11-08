import Decimal from "decimal.js";

import { facility_length, facility_types } from "./const";
import { maps } from './configs';

export const calcHeight = (score, type = "walkscore") => {
    if (type === "walkscore") {
        const minHeight = 1;
        const maxHeight = 10;
        const height = ((maxHeight - minHeight) * (score * score * score / 100) + minHeight) / 800;
        return height;
    } else if (type === "n_seniors") {
        const minHeight = 1;
        const maxHeight = 30;
        const height = (maxHeight - minHeight) * (score / 300) + minHeight;
        return height;
    }
    return 1;
}

export const calculatePillarColor = (percentColors, pct) => {
    for (var i = 1; i < percentColors.length - 1; i++) {
        if (pct < percentColors[i].pct) {
            break;
        }
    }
    var lower = percentColors[i - 1];
    var upper = percentColors[i];
    var range = upper.pct - lower.pct;
    var rangePct = (pct - lower.pct) / range;
    var pctLower = 1 - rangePct;
    var pctUpper = rangePct;
    var color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };

    return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

export const calculatePoint = (lng, lat, groundWidth, groundHeight, options) => {
    const mapWidth = groundWidth;
    const mapHeight = groundHeight;

    const lngMax = options.lngMax;
    const lngMin = options.lngMin;
    const latMax = options.latMax;
    const latMin = options.latMin;

    const lngDifference = new Decimal(lngMax).minus(lngMin).toNumber();
    const latDifference = new Decimal(latMax).minus(latMin).toNumber();

    // (lng - lngMin) / (lngDifference));
    const percX = new Decimal(new Decimal(lng).minus(lngMin)).dividedBy(lngDifference).toNumber();
    // ((mapWidth * percX) - (mapWidth / 2));
    const newX = new Decimal(new Decimal(mapWidth).times(percX)).minus(new Decimal(mapWidth).dividedBy(2)).toNumber();

    // ((lat - latMin) / (latDifference))
    const percZ = new Decimal(new Decimal(lat).minus(latMin)).dividedBy(latDifference).toNumber();
    // ((mapHeight * percZ) - (mapHeight / 2))
    const newZ = new Decimal(new Decimal(mapHeight).times(percZ)).minus(new Decimal(mapHeight).dividedBy(2)).toNumber();

    return { newX, newZ: (newZ * (-1)) };
}

export const calculateDistanceFromFacilityToResidence = (fx, fz, rx, rz) => {
    const xDiff = Math.abs(new Decimal(fx).minus(rx).toNumber());
    const zDiff = Math.abs(new Decimal(fz).minus(rz).toNumber());

    // a^2 + b^2 = c^2
    return new Decimal(new Decimal(new Decimal(xDiff).pow(2)).plus(new Decimal(zDiff).pow(2))).sqrt().toNumber();
}

export const calculateFacilityHeight = (type, routeLength, facilityNumber) => {
    let lengthFactor = -1;
    const lengthKeys = Object.keys(facility_length);

    for (let i = 0; i < lengthKeys.length; i++) {
        if (parseInt(lengthKeys[i]) > routeLength) {
            lengthFactor = facility_length[lengthKeys[i]];
            break;
        }
    }

    if (lengthFactor == -1) {
        lengthFactor = facility_length["x"];
    }

    const heightFactor = new Decimal(new Decimal(lengthFactor).mul(new Decimal(facility_types[type]))).dividedBy(new Decimal(facilityNumber));

    // 3 + ((lengthFactor * facility_type / facilityNumber) * 4)
    const height = new Decimal(3).plus((new Decimal(heightFactor).mul(4)));

    return { height: height.toNumber(), heightFactor: heightFactor.toNumber() };
}

export const sortLineHandler = (line, lat, lng) => {
    const sortedLines = [];
    let index = -1, distance = new Decimal(Number.MAX_VALUE);

    for (let j = 0; j < line.geom.coordinates.length; j++) {
        const lineLat = line.geom.coordinates[j][0][1];
        const lineLng = line.geom.coordinates[j][0][0];

        const res = new Decimal(calculateDistanceFromFacilityToResidence(lineLat, lineLng, lat, lng));
        if (res.lessThan(distance)) {
            distance = new Decimal(res);
            index = j;
        }
    }

    if (index != -1) {
        const deepCopy = JSON.parse(JSON.stringify(line.geom.coordinates));

        sortedLines.push(deepCopy[index]);
        deepCopy.splice(index, 1);

        for (let j = 0; j < sortedLines.length; j++) {
            let nDistance = new Decimal(Number.MAX_VALUE);
            let foundIndex = -1;

            for (let k = 0; k < deepCopy.length; k++) {
                const res = new Decimal(calculateDistanceFromFacilityToResidence(deepCopy[k][deepCopy[k].length - 1][0], deepCopy[k][deepCopy[k].length - 1][1], sortedLines[j][0][0], sortedLines[j][0][1]));

                if (res.lessThan(nDistance)) {
                    nDistance = new Decimal(res);
                    foundIndex = k;
                }
            }

            if (foundIndex !== -1) {
                sortedLines.push(deepCopy[foundIndex]);
                deepCopy.splice(foundIndex, 1);
            }
        }
    }

    return sortedLines;
};

export const calcMinAvgMaxDistance = (scene, ground, selectedElement, mapIndex) => {
    let minDistance = Number.MAX_VALUE, maxDistance = 0;
    const sElX = selectedElement.getElement().position.x;
    const sElZ = selectedElement.getElement().position.z;
    const gwidth = ground.ground.geometry.parameters.width;
    const gheight = ground.ground.geometry.parameters.height;
    const options = maps[mapIndex].options;
    scene.children.forEach(child => {
        if (child.userData?.info?.label == "facilities") {
            const { newX, newZ } = calculatePoint(child.userData.info.point.lng, child.userData.info.point.lat, gwidth, gheight, options);
            const distance = calculateDistanceFromFacilityToResidence(newX, newZ, sElX, sElZ);
            if (minDistance > distance) minDistance = distance;
            if (maxDistance < distance) maxDistance = distance;
        }
    });

    const avg = new Decimal(new Decimal(maxDistance).plus(minDistance)).dividedBy(2).toNumber();

    return {
        minDistance, maxDistance, avg, sElX, sElZ
    }
}

export const calcMinAvgMaxRealDistance = (scene) => {
    let minDistance = Number.MAX_VALUE, maxDistance = 0;
    scene.children.forEach(child => {
        if (child.userData?.info?.label == "facilities") {
            const distance = child.userData?.info?.point?.length;
            if (minDistance > distance) minDistance = distance;
            if (maxDistance < distance) maxDistance = distance;
        }
    });

    const avg = new Decimal(new Decimal(maxDistance).plus(minDistance)).dividedBy(2).toNumber();

    return {
        minDistance: new Decimal(minDistance).plus(new Decimal(new Decimal(avg).minus(minDistance)).dividedBy(10).toNumber()).toNumber(), 
        avg: new Decimal(avg).plus(new Decimal(new Decimal(maxDistance).minus(avg)).dividedBy(10).toNumber()).toNumber(), 
        maxDistance: new Decimal(maxDistance).plus(new Decimal(new Decimal(maxDistance).minus(avg)).dividedBy(20).toNumber()).toNumber() 
    }
}