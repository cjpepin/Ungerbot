import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Floor } from './threejs-helpers/floor-builder'
import { Helpers } from './threejs-helpers/helpers'
import Stats from 'three/examples/jsm/libs/stats.module'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { FloorPlanApiService } from '../../shared/apis/floor-plan-api.service';
import { style } from '@angular/animations';

@Component({
  selector: 'app-floor-planner',
  templateUrl: './floor-planner.component.html',
  styleUrls: ['./floor-planner.component.scss']
})
export class FloorPlannerComponent implements OnInit, OnDestroy {

  constructor(
    private floorPlanApiService: FloorPlanApiService,
  ) { }

  //Instantiate variables... lots of variables
  @ViewChild('canvas')
  private canvasRef: ElementRef;
  @ViewChild('myBar') progressBar: ElementRef;

  public editMode: boolean = true;
  private scene: THREE.Scene;
  private camera;
  private raycaster;
  private renderer;
  private floor: THREE.Mesh;
  private floorLength: number = 10;
  private floorWidth: number = 10;
  private floorInst: Floor = new Floor(this.floorLength, this.floorWidth);
  private helpers = new Helpers();
  private hemiLight = new THREE.AmbientLight(0xffffff, 0.2);
  private light = new THREE.DirectionalLight(0xffffff, 1);
  private clickMouse = new THREE.Vector2();
  private moveMouse = new THREE.Vector2();
  private draggable: THREE.Object3D;
  private scaling: boolean;
  private scalable: THREE.Object3D = null;
  private controls;
  private control;
  private box;
  private isGroup: boolean = null;
  private loader = new OBJLoader();
  public isLoading: boolean;
  private createNewScene: boolean = false;
  public spaceName: string;
  public sceneInd: number = null;
  //Stage Properties
  public cameraX: number = 0;
  public cameraZ: number = 0;
  public cameraY: number = 800 * Math.max(this.floorLength, this.floorWidth);
  public cameraRot: number = 90;
  public fieldOfView: number = 1;
  public nearClippingPlane: number = 1;
  public farClippingPlane: number =100000;
  public scenesList = [];
  private tempScene;
  private orbitControlActive: boolean = false;
  private childCount: number = 0;
  private totalChildren: number = 0;
  public loadBarPercent;
  private helpActive: boolean = false;
  private warn: number = 1;

  //Initialize event listeners and local variables
  ngOnInit(): void {
    window.addEventListener('keydown', (event) => this.onKeyDown(event))
    window.addEventListener('resize', () => this.onWindowResize());
    window.addEventListener('click', (event) => this.onClick(event))
    window.addEventListener('mousemove', (event) => this.onMouseMove(event))

    this.isLoading = false;
    this.floorPlanApiService.getScenes().subscribe(scenes => {
      this.makeScenesList(scenes);
    })
    this.helpers.sceneIndVal.subscribe(val => {
      this.sceneInd = val;
    })
    if (this.sceneInd) {
      this.createScene();
      this.startRederingLoop();
    }
  }

  ngAfterViewInit(): void {

  }
  //Get canvas element from DOM
  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private createScene() {
   
      //Create a new scene
      this.scene = new THREE.Scene();
      //Load the scene children from db
      if (!this.createNewScene)
        this.loadScene();
      else {
        this.scene.add(this.helpers.createCube("floor"));
        this.scene.userData["unsaved"] = true;
        this.createNewScene = false;
      }

      this.scene.background = new THREE.Color(0x89CFF0);
      this.light.position.set(-30, 50, -30);
      this.scene.add(this.light);
      this.scene.add(this.hemiLight)

      let aspectRatio = this.helpers.getAspectRatio(this.canvas);

      this.raycaster = new THREE.Raycaster();

      this.camera = new THREE.PerspectiveCamera(
        this.fieldOfView,
        aspectRatio,
        this.nearClippingPlane,
        this.farClippingPlane
      )

      this.camera.position.set(0, this.cameraY, this.cameraZ);
      this.camera.lookAt(0, 0, 0);
      console.log(this.scene)
  }
 //Create a renderer and start rendering
  private startRederingLoop() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = !this.editMode;

    this.control = new TransformControls(this.camera, this.renderer.domElement)
/*    this.control.addEventListener('change', () => this.renderer.render(this.scene, this.camera));*/
    this.control.setSpace('local');

    let component: FloorPlannerComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.renderer.render(component.scene, component.camera)
      component.floorInst.setLength(component.floorLength);
      component.floorInst.setWidth(component.floorWidth);
      component.dragObject();
    }());
  }
  //Toggle orbit controls
  public toggleOrbitControl() {
    this.orbitControlActive = !this.orbitControlActive;
  }

  //Can be used to resize canvas if you want canvas to resize based on screen size
  private onWindowResize() {
  /*  if (this.camera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }*/
  }

  //When in edit mode, be able to drag object on the x,y plane
  private dragObject() {
    if (this.scalable != null) {
      return;
    }
    if (this.draggable != null) {
      this.raycaster.setFromCamera(this.moveMouse, this.camera);
      const found = this.raycaster.intersectObjects(this.scene.children, true);
      if (found.length > 0) {
        const newPos = new THREE.Vector3().copy(found[0].point).floor().addScalar(0.5);
        this.draggable.position.set(newPos.x, 0.61, newPos.z);
      }
    }
  }

  //Load an object from an obj file into the scene given the saved data associated
  public createObject(objPath: string, name?, position?, scale?, userData?, rotation?): void {
    this.loadBarPercent = 0;
    const component = this;

    if (objPath == 'box') {
      let box = component.helpers.createCube(name, position, scale, userData, rotation);
      this.floor = box;
      this.scene.add(box);
      this.childCount += 1;
      return;
    }

    const basePath = "../../../assets/objects/"
    this.loader.load(
      basePath + objPath + ".obj",
      function (object) {
        if (objPath == 'circle-table')
          object.scale.set(0.005, 0.005, 0.005);
        if (objPath == 'stage')
          object.scale.set(0.25, 0.25, 0.25);
        if (objPath == 'desk')
          object.scale.set(0.2, 0.2, 0.2);
        if (objPath == 'ping-pong') {
          object.scale.set(0.08, 0.08, 0.07);
          object.rotateX(-Math.PI / 2);
        }
        if (objPath == 'deck_chair') {
          object.scale.set(8, 8, 8);
        }
        if (objPath == 'computer-chair') {
          object.scale.set(8, 8, 8);
        }
        if (objPath == 'kitchen-chair') {
          object.scale.set(2, 2, 2);
        }
        if (objPath == 'monitor') {
          object.scale.set(2.2, 2.2, 2.2);
        }


        if (name || position || scale || userData) {
          object.position.set(position.x, position.y, position.z);
          object.rotation.set(rotation["_x"], rotation["_y"], rotation["_z"]);
          object.scale.set(scale.x, scale.y, scale.z);

          object.name = name;
          object.userData = userData;
        } else {
          object.position.set(0, 2, 0);
          object.userData["draggable"] = true;
          object.userData["scalable"] = true;
          object.name = objPath;
        }
        component.childCount += 1;
        component.scene.add(object)

        component.continueLoading();
/*
        console.log(component.childCount, component.totalChildren)*/
        if (component.childCount === component.totalChildren)
          component.doneLoading();

        
      },
      function (xhr) {
        let loadPer = xhr.loaded / xhr.total * 100;
      },
      // called when loading has errors
      function (error) {
        console.log('An error happened');
        console.log(error)
      }
    )
    

  }

  //Save a scene to the database
  public saveScene(buttonClick: boolean): void {
    let curScene = { ...this.scene };
    if (!this.scene) {
      alert("You must select a scene or create a new one before it can be saved.")
      return;
    }
    if ((!this.scene.name || this.scene.name === "none") && this.warn === 1) {
      alert("Please put add a name for your space to be saved")
      return;
    }
    let unsaved;
    console.log(curScene.name, this.sceneInd, curScene.userData["unsaved"])

    if (curScene.userData["unsaved"] == true)
      unsaved = true;
    else
      unsaved = false;

    if (unsaved && this.scenesList.includes(this.scene.name)) {
      alert("That name already exists for another scene, please choose a different name")
      return;
    }

    let children = curScene.children;
    let newChildrenObj = {}
    for (let child in children) {
      const newChild = {
        name: children[child].name,
        position: children[child].position,
        scale: children[child].scale,
        rotation: children[child].rotation,
        userData: children[child].userData,
      }
      newChildrenObj[child] = newChild;
      delete children[child]

    }

    curScene.userData["children"] = newChildrenObj;

    this.floorPlanApiService.saveScene(curScene, this.sceneInd, unsaved).subscribe(res => {
        if (res === "")
          console.log("success!")
        else
          console.log(res)
      }
    );
    if (buttonClick)
      window.location.reload();
  }

  //Loading scene data
  public loadScene(): void {
    console.log(`%c${this.sceneInd}`, "color: blue");
      this.isLoading = true;
      this.floorPlanApiService.getScenes().subscribe(scenes => {
        this.makeScenesList(scenes);
        this.tempScene = JSON.parse(JSON.parse(scenes)[this.sceneInd]);
      })
      //Makes sure the data had enough time to be gotten from db
      setTimeout(() => {
        this.spaceName = this.tempScene.name;
        this.scene.name = this.spaceName;
        let children = this.tempScene.userData["children"];
        this.totalChildren = Object.keys(children).length;
        this.childCount = 0;
        if (this.totalChildren <= 3) {
          this.isLoading = false;
        }
        if (this.totalChildren == 0) {
          this.isLoading = false;
          return
        }
        console.log(this.totalChildren)
        for (let child in children) {

          if (children[child].name === 'box' || children[child].name === 'floor') {
            this.createObject('box', children[child].name, children[child].position, children[child].scale, children[child].userData, children[child].rotation)
          }
          if (children[child].name === 'stage') {
            this.createObject('stage', children[child].name, children[child].position, children[child].scale, children[child].userData, children[child].rotation)
          }
          if (children[child].name === 'circle-table') {
            this.createObject('circle-table', children[child].name, children[child].position, children[child].scale, children[child].userData, children[child].rotation)
          }
          if (children[child].name === 'deck_chair') {
            this.createObject('deck_chair', children[child].name, children[child].position, children[child].scale, children[child].userData, children[child].rotation)
          }
          if (children[child].name === 'ping-pong') {
            this.createObject('ping-pong', children[child].name, children[child].position, children[child].scale, children[child].userData, children[child].rotation)
          }
          if (children[child].name === 'desk') {
            this.createObject('desk', children[child].name, children[child].position, children[child].scale, children[child].userData, children[child].rotation)
          }
          if (children[child].name === 'kitchen-chair') {
            this.createObject('kitchen-chair', children[child].name, children[child].position, children[child].scale, children[child].userData, children[child].rotation)
          }
          if (children[child].name === 'computer-chair') {
            this.createObject('computer-chair', children[child].name, children[child].position, children[child].scale, children[child].userData, children[child].rotation)
          }
          if (children[child].name === 'monitor') {
            this.createObject('monitor', children[child].name, children[child].position, children[child].scale, children[child].userData, children[child].rotation)
          }
          if (children[child].name === '') {
            this.childCount += 1;
 /*           this.totalChildren -= 1;*/
          }
        }
      }, 100)
  }

  //Create a list of scenes for the UI dropdown
  private makeScenesList(scenes): void {
    const listOfScenes = JSON.parse(scenes);
    const indices = Object.keys(listOfScenes);

    for (let i = 0; i < indices.length; i++) {
      const curSceneInd = parseInt(indices[i]);
      const curSceneName = JSON.parse(listOfScenes[curSceneInd]).name;
      this.scenesList[curSceneInd] = curSceneName;
    }
  }

  public toggleScene(e?: Event, index?: number) {
    let ind;

    if (e)
      ind = (e.target as HTMLElement).id;
    else if (index >= 0)
      ind = index;

    console.log(ind);
    if (this.isLoading) {
      console.log("we loading")
      return;
    }

      const i = parseInt(ind);
      //if the scene clicked is the scene being used, don't change
      if (i == this.sceneInd) {
        this.saveScene(false);
        this.createScene()
      }
     
      else {
        //if there is a scene being used
        if (this.sceneInd != null) {
          //If the scene name is not empty or none and the user has one warning left
          if ((!this.scene.name || this.scene.name === "none") && this.warn === 1) {
            //Decrement the warning, and let them know they need to input a name for the scene
            this.warn -= 1;
            alert("Please put add a name for your space to be saved. If you don't enter a name, this space will be deleted")
            return;
          } else if (this.sceneInd && this.warn === 0) {
            //If there is a scene being used and the user has used up their warning, delete the current scene
            this.destroyScene();

          } else if (this.sceneInd && this.warn === 1 && this.scene.name != "none") {
            //If there is a scene being used and the used has one warning left, save the scene then destroy it 

          }
          this.destroyScene();

        }

        console.log(this.sceneInd + " three")

        //Makes sure that on reload, the data had time to upload to db and back
        //Set the scene index
        this.helpers.setSceneInd(i);
        console.log(`%c${this.sceneInd}`, "color: green")
        this.createScene();
        this.startRederingLoop();
      }
  }

  //Create a new scene with one empty plane
  public createNewSpace() {
    if (!this.isLoading) {
      this.warn = 1;
      this.createNewScene = true;
      this.spaceName = "none"
      this.toggleScene(null, this.scenesList.length);
    }
  }

  //On loading another scene, need to remove the object from this scene first
  public destroyScene() {
    if (!this.isLoading) {
      while (this.scene.children.length > 0) {
        this.scene.remove(this.scene.children[0]);
      }
      this.renderer.dispose();
    }
  }
  //When leaving, be sure variables are reset, objects are removed, and listeners are removed
  ngOnDestroy(): void {
    if (this.sceneInd != null) {
      this.destroyScene();
      this.warn = 1;
      this.helpers.setSceneInd(null);
      this.createNewScene = false;
      window.removeAllListeners;
    }
  }
  //Update mouse position when mouse moves if it is on the canvas
  private onMouseMove(event) {
    if (!this.checkOnCanvas())
      return;
    if (this.sceneInd != null) {
      var rect = this.renderer.domElement.getBoundingClientRect();
      this.moveMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.moveMouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
    }
  }

  //When the user clicks, if on the canas, if there is an object already being dragged or controlled, remove it. Otherwise
  //if there is an object that has been clicked on, select it to be dragged or controlled
  private onClick(event) {
    if (!this.checkOnCanvas())
      return;
    if (event.target.id === "canvas" && this.sceneInd != null) {
      if (this.draggable) {
        this.control.detach(this.draggable);
        this.scaling = false;
        this.scene.remove(this.control);
        if (this.isGroup) {
          for (let child of this.draggable.children) {
            if (child["material"].length > 1) {
              for (let material in child["material"]) {
/*                child["material"][material]["color"].set(0xFFFFFF);
*/              }
            } else {
            /*  child["material"]["color"].set(0xFFFFFF);*/
            }
          }
        } else {
/*          this.scalable["material"]["color"].set(this.scalable.userData["color"]);
*/        }
        this.isGroup = null;
        this.draggable = null;
        return;
      }
      if (this.scalable) {
        if (this.isGroup) {
          for (let child of this.scalable.children) {
            if (child["material"].length > 1) {
              for (let material in child["material"]) {
/*                child["material"][material]["color"].set(0xFFFFFF);
*/              }
            } else {

/*              child["material"]["color"].set(0xFFFFFF);
*/            }
          }
        } else {
          const r = this.scalable.userData["r"];
          const g = this.scalable.userData["g"];
          const b = this.scalable.userData["b"];
/*          this.scalable["material"]["color"].set(0x999999);*/

        }

        this.control.detach(this.scalable);
        this.controls.enabled = true;
        this.scaling = false;
        this.scalable = null;

        this.scene.remove(this.control);
        return;
      }
      var rect = this.renderer.domElement.getBoundingClientRect();
      this.clickMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.clickMouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.clickMouse, this.camera);

      const found = this.raycaster.intersectObjects(this.scene.children, true);

      const bool1 = found.length > 0 && found[0].object.userData["draggable"] == true;
      const bool2 = found.length > 0 && found[0].object.parent.userData["draggable"] == true;
      const bool3 = found.length > 0 && found[0].object.userData["scalable"] == true;
      const bool4 = found.length > 0 && found[0].object.parent.userData["scalable"] == true;

      if (event.shiftKey && bool3) {
        this.scalable = found[0].object
/*        this.scalable.userData["r"] = this.scalable["material"]["color"].r;
        this.scalable.userData["g"] = this.scalable["material"]["color"].g;
        this.scalable.userData["b"] = this.scalable["material"]["color"].b;

        this.scalable["material"]["color"].set(0x000000);*/

        this.control.attach(this.scalable);
        this.scene.add(this.control);
        this.controls.enabled = false;
      } else
        if (event.shiftKey && bool4 && !bool3) {
          this.isGroup = true;
          this.scalable = found[0].object.parent;
          for (let child of this.scalable.children) {
            if (child["material"].length > 1) {
              for (let material in child["material"]) {
/*                child["material"][material]["color"].set(0x000000);
*/              }
            } else {
           /*   child["material"]["color"].set(0x000000);*/
            }
          }

          this.control.attach(this.scalable);
          this.controls.enabled = false;
          this.scene.add(this.control);
        } else if (this.editMode) {
          if (bool1) {
            this.draggable = found[0].object;
/*            this.scalable.userData["color"] = this.scalable["material"]["color"];
*//**//*            this.draggable["material"]["color"].set(0x000000);
*/          } else
            if (bool2 && !bool1) {
              this.isGroup = true;
              this.draggable = found[0].object.parent;
              for (let child of this.draggable.children) {
                if (child["material"].length > 1) {
                  for (let material in child["material"]) {
/*                    child["material"][material]["color"].set(0x000000);
*/                  }
                } else {
/*                  child["material"]["color"].set(0x000000);
*/                }
              }
            }
        }
    }
  }

  //Get user input to toggle whether in edit/control mode
  private onKeyDown(event) {
    if (!this.checkOnCanvas())
      return;
    if (event.key === "e") {
      console.log("e")
      this.editMode = !this.editMode;
      this.controls.enabled = !this.editMode;
      if (this.editMode) {
        this.camera.position.set(0, this.camera.position.y, 0)
        this.camera.lookAt(this.camera.position.x, 0, this.camera.position.z);
      } else if (this.draggable) {
/*        this.draggable["material"]["color"].set(0xFF9900);
*/        this.draggable = null;
        return;
      }
    }
    if (this.scalable && event.key === "s") {
      this.control.mode = "scale"
    }
    if (this.scalable && event.key === "r") {
      this.control.mode = "rotate"
    }
    if (this.scalable && event.key === "t") {
      this.control.mode = "translate"
    }
    if (this.draggable && event.key === "d") {
      this.control.detach(this.draggable);
      this.scaling = false;
      this.scene.remove(this.control);
      this.scene.remove(this.draggable);
      this.isGroup = null;
      this.draggable = null;
    }
    if (this.scalable && event.key === "d") {
      this.control.detach(this.scalable);
      this.scaling = false;
      this.scene.remove(this.control);
      this.scene.remove(this.scalable);
      this.isGroup = null;
      this.scalable = null;
    }
  }

  //Update the current name of a scene
  public updateSceneName(name: string): void {
    this.scene.name = name;
  }

  //Check if the scene is done loading
  private doneLoading() {
    console.log("%cLocation three", "color: pink")
    this.isLoading = false;
    return;
  }
  //Update the loading bar for the scene
  private continueLoading() {
    console.log(Math.round(this.childCount / this.totalChildren * 100))
    this.loadBarPercent = Math.round(this.childCount / this.totalChildren * 100);
    document.getElementById('myBar').style.width = this.loadBarPercent + "%";
  }

  //Toggle the help menu's active state
  public toggleHelpMenu(): void {
    let elt = document.getElementById("help");
    this.helpActive = !this.helpActive;
    if (this.helpActive)
      elt.style.visibility = "visible";
    else
      elt.style.visibility = "hidden";
  }

  //Check if the canvas is the active element
  private checkOnCanvas(): boolean {
    if (this.canvas === document.activeElement)
      return true;
    else
      return false;
  }
}
