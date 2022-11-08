import * as THREE from 'three';
import "@babel/polyfill";
import Decimal from 'decimal.js';

import Ground from './components/GroundComponent';
import Camera from './components/CameraComponent';
import Light from './components/LightComponent';
import Loader from './components/LoaderComponent';
import Controllers from './components/ControllersComponent';
import Legend from './components/LegendComponent';
import Pillar from './components/PillarComponent';
import Line from './components/LineComponent';
import Draw from './components/DrawComponent';
import Distance from './components/DistanceComponent';

import { fetchData } from './utils/fetchData';
import { maps, apis, sortByOptions, colorByOptions, percentColors } from './utils/configs';
import { calcHeight, calculatePillarColor, calcMinAvgMaxRealDistance, calcMinAvgMaxDistance } from './utils/functions';

class World {
    constructor() {
        this.initialize();

        this.loader.remove("Initializing..");
        this.callAPI();
    }

    initialize() {
        // Variables        
        this.data = [];
        this.receivedFacilities = {
            grocery: 0,
            restaurants: 0,
            shopping: 0,
            coffee: 0,
            banks: 0,
            parks: 0,
            schools: 0,
            books: 0,
            entertainment: 0
        };
        this.apiIndex = 0;
        this.mapIndex = 0;
        this.sortByIndex = sortByOptions[0];
        this.colorByIndex = colorByOptions[0];
        this.maps = maps;
        this.apis = apis;
        this.renderedElements = [];
        this.expand = false;

        // Loader
        this.loader = new Loader();

        // Threejs
        this.threejs = new THREE.WebGLRenderer({
            antialias: true,
        });
        this.threejs.setSize(window.innerWidth, window.innerHeight);
        this.threejs.setPixelRatio(window.devicePixelRatio);
        this.threejs.shadowMap.enabled = true;
        this.threejs.shadowMap.type = THREE.PCFShadowMap;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x253655);

        // Light
        this.light = new Light({ scene: this.scene, renderer: this.threejs });

        // Camera
        this.camera = new Camera();

        // Ground
        this.ground = new Ground({ scene: this.scene, camera: this.camera.camera });

        // Controllers
        this.controllers = new Controllers({ camera: this.camera, renderer: this.threejs, scene: this.scene });

        // Legend
        this.legend = new Legend();
        this.legend.setParams(this.apiIndex, this.sortByIndex, this.colorByIndex);

        // click
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();

        // Navigation
        this.navigation();

        // Selecting
        this.selecting();

        // Drawing
        this.draw = new Draw(
            this.threejs,
            this.scene,
            this.camera,
            this.controllers,
            this.renderedElements,
            this.loader,
            this.raycaster,
            this.pointer
        );

        document.body.appendChild(this.threejs.domElement);
        this.draw.draw();
    }

    OnKeyDown(event) {
        if (event.keyCode == 32) {
            this.controllers.controls.reset();
        }
    }

    async callAPI(offset = 0) {
        if (this.loader.status !== "fetching") this.loader.add("Fetching data..");

        let props = `limit=${this.apis[this.apiIndex].limit}&offset=${offset}`;
        Object.keys(this.maps[this.mapIndex].options).forEach((key, index) => {
            props += `&${key}=${this.maps[this.mapIndex].options[key]}`;
        });

        this.data = await fetchData(`http://localhost:8001/api/${this.apis[this.apiIndex].api}?${props}`, "GET");

        this.data.data.forEach(point => {
            if (this.apis[this.apiIndex].type == "point") this.renderedElements.push(new Pillar(this.scene, point, this.mapIndex, this.ground, this.apis[this.apiIndex].label, this.maps[this.mapIndex].w, this.maps[this.mapIndex].d));
        });

        if (parseInt(this.data.total.count) > (offset + this.apis[this.apiIndex].limit) && this.apis[this.apiIndex].type == "point") {
            this.callAPI(offset + this.apis[this.apiIndex].limit);
        } else {
            this.loader.remove("Fetching data..");
        }
    }

    async callAPIForResidence(id) {
        if (this.loader.status !== "fetching") this.loader.add("Fetching data..");
        const lines = await fetchData(`http://localhost:8001/api/routes/residence/${id}`, "GET");

        const recFac = [];
        for (let i = 0; i < lines.data.length; i++) {
            const line = lines.data[i];

            const lat = this.selectedElement.getElement().userData.info.point.lat;
            const lng = this.selectedElement.getElement().userData.info.point.lng;

            // if we want to sort the lines
            // const sortedLines = sortLineHandler(line, lat, lng);
            // line.geom.coordinates = JSON.parse(JSON.stringify(sortedLines));

            this.renderedElements.push(new Line(this.scene, line, this.mapIndex, this.ground, "routes"));
            const facility = await fetchData(`http://localhost:8001/api/facilities/${line.id_einrichtung}/${line.id_wohnort}`, "GET");
            this.receivedFacilities[facility.data?.type] += 1;
            recFac.push(facility.data);
        }

        recFac.forEach(facility => {
            const countOfFacility = (facility && facility?.type?.trim() !== "") ? this.receivedFacilities[facility.type] : 0.1;
            this.renderedElements.push(new Pillar(this.scene, facility, this.mapIndex, this.ground, "facilities", 0.1, 0.1, countOfFacility));
        });

        this.expandedData = lines.data;
        this.loader.remove("Fetching data..");
    }

    async callAPIForFacilities(id_einrichtung, id_wohnort) {
        const facility = await fetchData(`http://localhost:8001/api/facilities/${id_einrichtung}/${id_wohnort}`, "GET");
        this.receivedFacilities[facility.data?.type] += 1;
        this.renderedElements.push(new Pillar(this.scene, facility.data, this.mapIndex, this.ground, "facilities", 0.1, 0.1, this.receivedFacilities[facility.data?.type]));
    }

    navigation() {
        // Navigation
        this.navigation = document.getElementById("navigation");

        // - Map
        const mapLabel = document.createElement("p")
        mapLabel.innerText = "Map:";
        this.navigation.appendChild(mapLabel);
        const selectMap = document.createElement("select");
        maps.forEach((map, index) => {
            const _option = document.createElement("option");
            _option.value = index;
            _option.textContent = map.label;
            selectMap.appendChild(_option);
        });
        const lineMap = document.createElement("div");
        const selectLabelMap = document.createElement("p");
        selectLabelMap.innerText = "City: ";
        lineMap.append(selectLabelMap);
        lineMap.append(selectMap);
        this.navigation.appendChild(lineMap);
        selectMap.id = "selectMap";
        selectMap.addEventListener("change", (e) => {
            this.selectedElement.setNewElement(null);
            this.legend.clearHints();
            this.draw.resetScene(this.renderedElements);
            this.renderedElements = [];
            this.mapIndex = e.target.value;
            this.ground.loadNewMap(this.maps[e.target.value].map);
            this.callAPI();
            document.getElementById('sliderOpacity').value = 100;
            document.getElementById("sortBySelect").value = sortByOptions[0];
            document.getElementById("colorBySelect").value = colorByOptions[0];
        });
        // Opacity
        const elementsLabel = document.createElement("p")
        elementsLabel.innerText = "Pillars:";
        this.navigation.appendChild(elementsLabel);
        const lineOpacity = document.createElement("div");
        const labelOpacity = document.createElement("p");
        labelOpacity.innerText = "Opacity: ";
        const sliderOpacity = document.createElement("input");
        sliderOpacity.id = "sliderOpacity";
        sliderOpacity.setAttribute('type', 'range');
        sliderOpacity.setAttribute('value', '100');
        sliderOpacity.setAttribute('min', '1');
        sliderOpacity.setAttribute('max', '100');
        lineOpacity.append(labelOpacity);
        lineOpacity.append(sliderOpacity);
        this.navigation.appendChild(lineOpacity);
        sliderOpacity.addEventListener("change", (e) => {
            this.scene.children.forEach(element => {
                if (element.userData.canSelect) {
                    element.material.opacity = (parseInt(e.target.value) / 100);
                }
            });
        });
        // SortBy
        const selectSortBy = document.createElement("select");
        selectSortBy.id = "sortBySelect";
        sortByOptions.forEach((option, index) => {
            const _option = document.createElement("option");
            _option.value = option;
            _option.textContent = option;
            selectSortBy.appendChild(_option);
        });
        const lineSortBy = document.createElement("div");
        const selectLabeSortBy = document.createElement("p");
        selectLabeSortBy.innerText = "SortBy: ";
        lineSortBy.append(selectLabeSortBy);
        lineSortBy.append(selectSortBy);
        this.navigation.appendChild(lineSortBy);
        selectSortBy.addEventListener("change", (e) => {
            const type = e.target.value;
            this.sortByIndex = type;
            document.getElementById("colorBySelect").value = type;
            this.colorByIndex = type;
            this.scene.children.forEach(child => {
                if (child.userData.canSelect && child.userData.info?.type == "point") {
                    const height = calcHeight(child.userData.info.point[type], type);
                    const newGeometry = new THREE.BoxGeometry(this.maps[this.mapIndex].w, height, this.maps[this.mapIndex].d);
                    child.position.y = height / 2;
                    child.geometry.dispose();
                    child.geometry = newGeometry;
                    child.material.color = new THREE.Color(calculatePillarColor(percentColors, child.userData.info.point[type] / 100));
                }
            });

            if (this.selectedElement.getElement() !== null && this.apis[this.apiIndex].api == "residences") {
                this.legend.setHint(this.apiIndex, this.selectedElement.getElement(), this.colorByIndex);
            }

            this.legend.setParams(this.apiIndex, this.sortByIndex, this.colorByIndex);
        });
        // Color By
        const selectColorBy = document.createElement("select");
        selectColorBy.id = "colorBySelect";
        colorByOptions.forEach((option, index) => {
            const _option = document.createElement("option");
            _option.value = option;
            _option.textContent = option;
            selectColorBy.appendChild(_option);
        });
        const lineColorBy = document.createElement("div");
        const selectLabeColorBy = document.createElement("p");
        selectLabeColorBy.innerText = "ColorBy: ";
        lineColorBy.append(selectLabeColorBy);
        lineColorBy.append(selectColorBy);
        this.navigation.appendChild(lineColorBy);
        selectColorBy.addEventListener("change", (e) => {
            const type = e.target.value;
            this.colorByIndex = type;
            this.legend.clearHints();
            this.scene.children.forEach(child => {
                if (child.userData.canSelect && child.userData.info?.type == "point") {
                    child.material.color = new THREE.Color(calculatePillarColor(percentColors, child.userData.info.point[type] / 100));
                }
            });

            if (this.selectedElement.getElement() !== null && this.apis[this.apiIndex].api == "residences") {
                this.legend.setHint(this.apiIndex, this.selectedElement.getElement(), this.colorByIndex);
            }
            this.legend.setParams(this.apiIndex, this.sortByIndex, this.colorByIndex);
        });
    }

    selecting() {
        const trigger = (callback) => {
            let element = null;
            return {
                setNewElement: (newElement) => {
                    element = newElement;
                    const el = document.getElementById("selectedElement");
                    el.innerHTML = "";
                    if (element != null) {
                        if (newElement.userData.info.type == "point") {
                            const p1 = document.createElement("p");
                            const p2 = document.createElement("p");
                            const p3 = document.createElement("p");
                            const p4 = document.createElement("p");
                            let extras = [];
                            if (newElement.userData.info.label == "Residences") {
                                const expandBtn = document.createElement("input");
                                expandBtn.setAttribute('type', 'button');
                                expandBtn.setAttribute('value', 'Expand');
                                expandBtn.onclick = () => {
                                    if (!this.expand) {
                                        document.getElementById('sliderOpacity').value = 100;
                                        this.selectedElement.getElement().material.opacity = 100;
                                        this.renderedElements.forEach(child => {
                                            if (child.object?.userData.uuid != this.selectedElement.getElement().userData.uuid) {
                                                child.object?.material.dispose();
                                                child.object?.geometry.dispose();
                                                this.scene.remove(child.object);
                                            }
                                        });
                                        this.expand = true;
                                        this.selectedResidenceId = this.selectedElement.getElement().userData.info.point.id;
                                        document.getElementById("sortBySelect").disabled = true;
                                        document.getElementById("colorBySelect").disabled = true;
                                        document.getElementById("selectMap").disabled = true;
                                        this.callAPIForResidence(this.selectedElement.getElement().userData.info.point.id);
                                        const newGeometry = new THREE.BoxGeometry(0.3, this.selectedElement.getElement().geometry.parameters.height, 0.3);
                                        this.selectedElement.getElement().geometry.dispose();
                                        this.selectedElement.getElement().geometry = newGeometry;
                                    }
                                };
                                const resetBtn = document.createElement("input");
                                resetBtn.setAttribute('type', 'button');
                                resetBtn.setAttribute('value', 'Reset/Unselect');
                                resetBtn.onclick = () => {
                                    if (this.expand) {
                                        this.draw.resetScene(this.renderedElements);
                                        this.renderedElements = [];
                                        this.expand = false;
                                        this.drawedCircles = false;
                                        this.callAPI();
                                        document.getElementById("sortBySelect").disabled = false;
                                        document.getElementById("colorBySelect").disabled = false;
                                        document.getElementById("selectMap").disabled = false;
                                        document.getElementById("sortBySelect").value = "walkscore";
                                        document.getElementById("colorBySelect").value = "walkscore";
                                    }
                                    this.selectedElement.getElement().material.color = this.selectedElement.getElement().userData.prevColor;
                                    this.selectedElement.setNewElement(null);
                                    this.legend.clearHints();
                                };
                                const environmentBtn = document.createElement("input");
                                environmentBtn.setAttribute('type', 'button');
                                environmentBtn.setAttribute('value', 'Show Circles');
                                environmentBtn.onclick = () => {
                                    if (this.expand && !this.drawedCircles) {
                                        this.drawedCircles = true;

                                        const { minDistance, maxDistance, avg, sElX, sElZ } = calcMinAvgMaxDistance(this.scene, this.ground, this.selectedElement, this.mapIndex);

                                        const circles = [{
                                            color: 0xf7a8b5,
                                            additionalRadius: new Decimal(new Decimal(maxDistance).minus(avg)).dividedBy(20).toNumber(),
                                            additionalY: 0,
                                            radius: maxDistance,
                                            opacity: 0.6
                                        }, {
                                            color: 0xeae864,
                                            additionalRadius: new Decimal(new Decimal(maxDistance).minus(avg)).dividedBy(10).toNumber(),
                                            additionalY: 0.001,
                                            radius: avg,
                                            opacity: 0.5
                                        }, {
                                            color: 0x64ea78,
                                            additionalRadius: new Decimal(new Decimal(avg).minus(minDistance)).dividedBy(10).toNumber(),
                                            additionalY: 0.002,
                                            radius: minDistance,
                                            opacity: 0.35
                                        }];

                                        circles.forEach(circle => {
                                            new Distance(this.scene, sElX, sElZ, circle.radius, circle.color, circle.additionalRadius, circle.additionalY, circle.opacity);
                                        });
                                    }
                                };
                                p1.innerHTML = `<b>Walkscore</b>: ${newElement.userData.info.point.walkscore.toFixed(2)}`;
                                p2.innerHTML = `<b>#Seniors</b>: ${newElement.userData.info.point.n_seniors}`;
                                const colorP = document.createElement("p");
                                const rgb = this.selectedElement.getElement()?.userData?.info.point[this.colorByIndex] || 0;
                                colorP.innerHTML = `<b class="color">Color: <div style="background-color: ${calculatePillarColor(percentColors, rgb / 100)}"></div></b>`;
                                extras.push(colorP);
                                el.appendChild(expandBtn);
                                el.appendChild(resetBtn);
                                el.appendChild(environmentBtn);
                            } else {
                                p1.innerHTML = `<b>Name</b>: ${newElement.userData.info.point.name}`;
                                p2.innerHTML = `<b>Type</b>: ${newElement.userData.info.point.type}`;
                                const length = document.createElement("p");
                                length.innerHTML = `<b>Length</b>: ${parseInt(newElement.userData.info.point.length)}m`;
                                extras.push(length);

                                const seePath = document.createElement("input");
                                seePath.setAttribute('type', 'button');
                                seePath.setAttribute('value', 'See Path');
                                seePath.onclick = () => {
                                    const {minDistance, maxDistance, avg} = calcMinAvgMaxRealDistance(this.scene);

                                    this.scene.children.forEach((child, index) => {
                                        if (child.userData?.info?.type == "line") {
                                            let slope = -0.9;
                                            let color = 0x000000;
                                            if (child.userData?.info?.line?.id_einrichtung == this.selectedElement.getElement().userData?.info?.point?.id) {
                                                slope = -0.8;

                                                const length = this.selectedElement.getElement().userData?.info?.point?.length || Number.MAX_VALUE;

                                                if (length <= minDistance) {
                                                    color = 0x0a6b00;
                                                } else if (length > minDistance && length <= avg) {
                                                    color = 0x6b6200;
                                                } else {
                                                    color = 0x6C0000;
                                                }
                                            }
                                            const points = [...child.geometry.points];
                                            for (let index = 0; index < points.length; index++) {
                                                if (index % 3 == 1) {
                                                    points[index] = slope;
                                                }
                                            };

                                            child.geometry.points = points;
                                            child.material.color = new THREE.Color(color);
                                        }
                                    });
                                };
                                const colorP = document.createElement("p");
                                const rgb = ("#" + this.selectedElement.getElement()?.userData?.info?.originalColor.getHexString()) || "#000000";
                                colorP.innerHTML = `<b class="color">Color: <div style="background-color: ${rgb}"></div></b>`;
                                extras.push(colorP);
                                el.appendChild(seePath);
                            }
                            p3.innerHTML = `<b>#Lat:</b>: ${newElement.userData.info.point.lat}`;
                            p4.innerHTML = `<b>#Lng</b>: ${newElement.userData.info.point.lng}`;
                            el.appendChild(p1);
                            el.appendChild(p2);
                            el.appendChild(p3);
                            el.appendChild(p4);
                            extras.forEach(element => el.appendChild(element));
                            el.appendChild(document.createElement("hr"));
                        }

                    }
                },
                getElement: () => element
            }
        };

        this.selectedElement = trigger();
        window.addEventListener('dblclick', (event) => {
            this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.pointer, this.camera.camera);

            const intersects = this.raycaster.intersectObjects(this.scene.children);

            for (let i = 0; i < intersects.length; i++) {
                if (intersects[i].object.userData.canSelect) {
                    if (this.selectedElement.getElement() !== null) {
                        this.selectedElement.getElement().material.color = { ...this.selectedElement.getElement().userData.prevColor };
                    }
                    intersects[i].object.userData.prevColor = { ...intersects[i].object.material.color };
                    intersects[i].object.material.color = new THREE.Color(0xA0A0A0);
                    this.selectedElement.setNewElement(intersects[i].object);
                    if (this.apis[this.apiIndex].api == "residences") {
                        this.legend.setHint(this.apiIndex, this.selectedElement.getElement(), this.colorByIndex);
                    }
                    break;
                }
            }
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const world = new World();
});