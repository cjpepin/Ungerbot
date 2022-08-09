import { AfterViewInit, Component, HostListener, OnInit, ElementRef, Input, ViewChild } from '@angular/core';
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Floor {
  //Necessary vars
  public length: number = 1;
  public width: number = 1;
  private floor;
  private grid: THREE.Object3D;
  private planeMesh: THREE.Mesh;
  private plane: THREE.Mesh;

  constructor(
    length: number,
    width: number,
  ) {
    this.length = length;
    this.width = width;
  }
  //Getters and setters
  public getLength(): number {
    return this.length;
  }
  public setLength(newLength: number): void {
    this.length = newLength;
  }
  public getWidth(): number {
    return this.length;
  }
  public setWidth(newWidth: number): void {
    this.width = newWidth;
  }

  //Create a Three box with specific parameters to a "floor"
  public makeFloor() {

    const geometry = new THREE.BoxGeometry(this.length, this.width, 0.2);
    const material = new THREE.MeshPhongMaterial({ color: 0x999999, side: THREE.DoubleSide });
    this.floor = new THREE.Mesh(geometry, material)
    this.floor.position.set(0, 0, 0);
    this.floor.userData["draggable"] = false;
    this.floor.userData["scalable"] = true;
    this.floor.name = "box";
    this.floor.castShadow = true;
    /*this.floor.rotateX(this.degToRad(90));*/
    this.floor.receiveShadow = true;
    return this.floor;
  }

  //Three uses radians, convert deg to rad
  private degToRad(deg: number) {
    return deg / 180 * Math.PI;
  }

  //Creates a grid of lines sized this.length by this.width
  public createAGrid(scene, opts?) {
    scene.remove(this.grid);

    var config = opts || {
      height: this.length/2,
      width: this.width/2,
      linesHeight: 10,
      linesWidth: 10,
      color: 0xDD006C
    };

    var material = new THREE.LineBasicMaterial({
      color: config.color,
      opacity: 0.2,
      vertexColors: true,
    });

    this.grid = new THREE.Object3D();

    var gridGeo = new THREE.BufferGeometry(),
      stepw = 1,
      steph = 1;

    //width
    let points = []
    for (var i = -config.width; i <= config.width; i += stepw) {
        points.push(new THREE.Vector3(-config.height, i, 0));
        points.push(new THREE.Vector3(config.height, i, 0));
    }
    for (var j = -config.height; j <= config.height; j += steph) {
      points.push(new THREE.Vector3(j, -config.width, 0));
      points.push(new THREE.Vector3(j, config.width, 0));
    }

    //height
      gridGeo.setFromPoints(points);


    gridGeo.rotateX(this.degToRad(90));
    
    var line = new THREE.LineSegments(gridGeo, material);

    this.grid.position.set(0,0.11,0)
    this.grid.add(line);

    scene.add(this.grid)
  }

  //Creates a plane for the grid to sit on
  public createAGridPlane(scene: THREE.Scene): void {
    scene.remove(this.planeMesh);

    const geometry = new THREE.PlaneGeometry(this.length, this.width);
    geometry.rotateX(this.degToRad(90))

    this.planeMesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        visible: false,
      })
    );

    this.planeMesh.position.set(0, 0.11, 0);

    scene.add(this.planeMesh);
  }

  public createBottomPlane(scene: THREE.Scene): void {
    scene.remove(this.plane);

    const geometry = new THREE.PlaneGeometry(100, 100);
    geometry.rotateX(this.degToRad(90))

    this.plane = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        visible: false,
      })
    );

    this.plane.position.set(0, -1, 0);

    scene.add(this.plane);
  }
}
