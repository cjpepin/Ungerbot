import { AfterViewInit, Component, HostListener, OnInit, ElementRef, Input, ViewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Helpers {

  //Gets the size of an object being loaded
  public getSize(obj: object): void {
    let size = new TextEncoder().encode(JSON.stringify(obj)).length
    let kiloBytes = size / 1024;
    let megaBytes = kiloBytes / 1024;
  }

  //Let the scene index be dynamically updatabled
  private sceneIndSub: Subject<number> = new Subject<number>();
  public sceneIndVal: Observable<number> = this.sceneIndSub.asObservable();

  public setSceneInd(val: number) {
    this.sceneIndSub.next(val);
    localStorage.setItem("sceneInd", JSON.stringify(val));
  }

  public getSceneInd(): number {
    return JSON.parse(localStorage.getItem("sceneInd"));
  }

  //Get aspecet ration of the canvas
  public getAspectRatio(canvas): number {
    return canvas.clientWidth / canvas.clientHeight;
  }

  //Change the length based on text input
  public changeLength(length: string) {
    if (!parseInt(length))
      return 0;

    const newLength = parseInt(length) / 10;
    return newLength;
  }
  //Change the width based on text input
  public changeWidth(width: string) {
    if (!parseInt(width))
      return 0;
    const newWidth = parseInt(width) / 10;
    return newWidth;
  }

  //Creates a cube with the given set of data
  public createCube(name, position?, scale?, userData?, rotation?) {
    let geometry = new THREE.BoxGeometry(10, 0.2, 10);
    const material = new THREE.MeshPhongMaterial({ color: 0x999999, side: THREE.DoubleSide });

    let box = new THREE.Mesh(geometry, material);
    if (name === "floor") {
      box.name = name;
      box.position.set(0,0,0);
      box.scale.set(1,1,1);
      box.rotation.set(0,0,0);
    }
    else if (name && position && scale && userData && rotation) {
      box.name = name;
      box.position.set(position.x, position.y, position.z);
      box.scale.set(scale.x, scale.y, scale.z);
      box.rotation.set(rotation["_x"], rotation["_y"], rotation["_z"]);
      box.userData = userData;
    }

    box.castShadow = true;
    box.receiveShadow = true;
    box.userData["draggable"] = false;
    box.userData["scalable"] = true;
    box.name = 'box';
    return box;
  }

  //Creates a plane with the given set of data
  private createPlane(name, position, scale, userData) {
    let geometry = new THREE.PlaneGeometry(10, 10, 0.2);
    const material = new THREE.MeshPhongMaterial({ color: 0xFF9900, side: THREE.DoubleSide });


    let plane = new THREE.Mesh(geometry, material);

    plane.position.set(position.x, position.y, position.z);
    plane.scale.set(scale.x, scale.y, scale.z);

    plane.castShadow = true;
    plane.receiveShadow = true;
    plane.userData = userData;
    plane.name = name;
    return plane;
  }
}
