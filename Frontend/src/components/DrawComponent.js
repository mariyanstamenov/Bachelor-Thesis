import * as THREE from 'three';

import { calcHeight } from "../utils/functions";

class Draw {

    constructor(threejs, scene, camera, controllers, renderedElements, loader, raycaster, pointer) {
        this.threejs = threejs;
        this.scene = scene;
        this.camera = camera;
        this.controllers = controllers;
        this.renderedElements = renderedElements;
        this.loader = loader;
        this.raycaster = raycaster;
        this.pointer = pointer;
    }

    draw() {
        requestAnimationFrame((t) => {
            this.draw();
            this.threejs.render(this.scene, this.camera.camera);

            this.controllers.controls.update();
            this.previousRender = t;
        });
    }

    resetScene(renderedElements, args) {
        this.renderedElements = renderedElements;
        this.loader.add("Clearing scene..");
        this.renderedElements.forEach((element) => {
            if (element.object) {
                element.object?.material.dispose();
                element.object?.geometry.dispose();
                this.scene.remove(element.object);
            } else if (element.objects) {
                element.objects.forEach(_element => {
                    _element.material.dispose();
                    _element.geometry.dispose();
                    this.scene.remove(_element);
                });
            }

        });

        // For Lines Or Circles
        [...this.scene.children].forEach((element) => {
            if (element?.userData?.info?.type == "line" || element?.userData?.info?.type == "circle") {
                element.geometry.dispose();
                element.material.dispose();
                this.scene.remove(element);
            }
        });
        this.loader.remove("Clearing scene..")

        args?.forEach(el => el = null);
    }

    sortByHandler(renderedElements, type) {
        const newChildren = [];

        this.scene.children.forEach(child => {
            if (child.userData.canSelect && child.userData.info?.type == "point") {
                const height = calcHeight(child.userData.info.point[type], type);
                const newChild = { ...child };
                newChild.geometry.parameters.height = height;
                const object = new THREE.Mesh(newChild.geometry, newChild.material);
                newChildren.push(object);
            }
        });

        this.resetScene(renderedElements);

        newChildren.forEach(child => {
            renderedElements.push(child);
            this.scene.add(child);
        });
    }

};

export default Draw;