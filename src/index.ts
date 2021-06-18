import { PhysicsLoader } from '@enable3d/ammo-physics';
import { ThreeGraphics } from '@enable3d/three-graphics';
import { Project, Scene3D } from 'enable3d';
import { billboard } from './billboard.js'
import * as THREE from 'three';
import ThreeMeshUI from 'three-mesh-ui';
import { add_audio, add_background } from './audio.js';

class MainScene extends Scene3D {
  move = false;
  moveLeft = false;
  moveRight = false;
  moveBottom = false;
  moveTop = false;
  grab = false;
  gameover;
  gamestarted = false;
  countdown = 5;
  controller;
  intersected: any = [];
  tempMatrix = new THREE.Matrix4();
  cameraBox;
  minVector;
  maxVector;
  raycaster;
  group;
  grabbed = false;
  container;
  lifes = 5;

  shield;


  cameraStartY;
  boxStartY;

  constructor() {
    super({ enableXR: true })


  }



  async update() {

    if (this.webXR.isPresenting) {
      this.cleanIntersected();
      this.intersectObjects(this.controller);

    }


    if (this.lifes === 0) {
      this.gameover = true;
      this.makePanel();
    }

    if (!this.gameover) {
      if (this.moveRight) {
        const box = this.cameraBox;
        box.body.needUpdate = true;
        box.position.x += 0.06;
      }
      if (this.moveLeft) {
        const box = this.cameraBox;
        box.body.needUpdate = true;
        box.position.x -= 0.06;
      }

      if (this.moveTop) {
        const box = this.cameraBox;
        box.body.needUpdate = true;
        box.position.z -= 0.06;
      }

      if (this.moveBottom) {
        const box = this.cameraBox;
        box.body.needUpdate = true;
        box.position.z += 0.06;
      }
    }

    // This is typically done in the loop :
    ThreeMeshUI.update();


    if (this.countdown == 0) {
      this.gamestarted = true;
    }

    if (this.webXR.isPresenting && !this.gameover && this.gamestarted) {

      const cam = this.webXR.camera
      const v3 = new THREE.Vector3()
      const distance = 0.1
      const box = this.cameraBox;
      cam.position.clamp(this.minVector, this.maxVector);
      box.position.clamp(this.minVector, this.maxVector);
      if (this.move) {
        // move in the direction of the view
        box.body.needUpdate = true;
        cam.getWorldDirection(v3)
        let addVector = v3.multiplyScalar(distance)

        box.position.set(box.position.x + addVector.x, 1, box.position.z + addVector.z);
        cam.position.add(addVector);
      }

      if (this.renderer.xr.getSession().inputSources[0].gamepad.buttons[2].pressed) {

        const controller = this.controller;

        const intersections = this.getIntersections(controller);

        if (intersections.length > 0) {

          const intersection = intersections[0];

          const object = intersection.object;
          object.body.setCollisionFlags(2); 0
          object.body.needUpdate = true;
          object.material.emissive.b = 1;
          controller.attach(object);

          controller.userData.selected = object;

        }
      }
      else if (!this.renderer.xr.getSession().inputSources[0].gamepad.buttons[2].pressed) {
        const controller = this.controller

        if (controller.userData.selected !== undefined) {

          const object = controller.userData.selected;
          //object.matrixAutoUpdate = true;;
          object.material.emissive.b = 0;
          this.group.attach(object);

          controller.userData.selected = undefined;

        }
      }
    }
    if (this.webXR.isPresenting && this.gameover && this.renderer.xr.getSession().inputSources[0].gamepad.buttons[2].pressed) {
      window.location.reload();
    }

  }


  getIntersections(controller) {

    this.tempMatrix.identity().extractRotation(controller.matrixWorld);

    this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(this.tempMatrix);

    return this.raycaster.intersectObjects(this.group.children);

  }

  intersectObjects(controller) {

    // Do not highlight when already selected

    if (controller.userData.selected !== undefined) return;

    const line = controller.getObjectByName('line');
    const intersections = this.getIntersections(controller);

    if (intersections.length > 0) {

      const intersection = intersections[0];

      const object = intersection.object;
      object.material.emissive.r = 1;
      this.intersected.push(object);

      this.controller.children[0].scale.z = intersection.distance;

    } else {

      this.controller.children[0].scale.z = 5;

    }

  }

  cleanIntersected() {

    while (this.intersected.length) {

      const object = this.intersected.pop();
      object.material.emissive.r = 0;

    }

  }









  async create() {



    this.raycaster = new THREE.Raycaster();
    this.minVector = new THREE.Vector3(-9, 0, -9)
    this.maxVector = new THREE.Vector3(9, 0, 9)

    this.group = new THREE.Group();
    this.scene.add(this.group);
    console.log(this.controller);
    let controls;
    this.physics.debug?.enable()

    this.makeLife();

    var background_audio = add_background(this.webXR.camera.group)

    setInterval(() => {
      if (this.countdown > 0 && this.webXR.isPresenting) {
        this.makeCountdown();
        this.countdown -= 1;
      }
      else {
        this.removeCountDownContainer();
      }
    }, 1000)


    setTimeout(() => {

    }, 5000);


    this.warpSpeed('-orbitControls')
    this.camera.position.set(0, 30, 0)
    this.camera.lookAt(0, 0, 0)

    // * Create Camera Box

    this.cameraBox = this.physics.add.box({ x: this.webXR.camera.position.x, y: this.webXR.camera.position.y + 1, z: this.webXR.camera.position.z, height: 2 },)
    this.cameraBox.body.setCollisionFlags(2);

    this.cameraBox.visible = false;


    // * Create Shield
    const { factory } = this.physics;
    this.shield = this.physics.add.box({ x: this.webXR.camera.position.x, y: this.webXR.camera.position.y + 1, z: this.webXR.camera.position.z + 2, height: 2, depth: 0.22, mass: 0 }, { standard: { color: 'blue' } })

    this.group.add(this.shield);


    // // * Creates Boxes for the words

    // for (let i = 0; i < word.length; i++) {
    //   var randomcolor = '#';
    //   var letters = '0123456789ABCDEF';
    //   for (let y = 0; y < 6; y++) {
    //     randomcolor += letters[Math.floor(Math.random() * 16)];
    //   }

    //   const box = this.physics.add.box({ x: -4 + i * 2, y: 0, z: 9 }, { lambert: { color: randomcolor } })
    // }


    //** Creates Walls */

    // will add a 5x3x1 red box
    const back = this.physics.add.box(
      { x: 0, y: 2, z: 10, width: 21, height: 8, depth: 1, mass: 100, collisionFlags: 1 },
      { lambert: { color: 'red', transparent: false, opacity: 0.5 } }
    )

    const left = this.physics.add.box(
      { x: -10, y: 2, z: -0.5, width: 1, height: 8, depth: 20, mass: 100, collisionFlags: 1 },
      { lambert: { color: 'red', transparent: false, opacity: 0.5 } }
    )

    const right = this.physics.add.box(
      { x: 10, y: 2, z: -0.5, width: 1, height: 8, depth: 20, mass: 100, collisionFlags: 1 },
      { lambert: { color: 'red', transparent: false, opacity: 0.5 } }
    )

    const front = this.physics.add.box(
      { x: 0, y: 2, z: -10, width: 19, height: 8, depth: 1, mass: 100, collisionFlags: 1 },
      { lambert: { color: 'red', transparent: false, opacity: 0.5 } }
    )


    // * Create Balls


    var randomStartX;
    var randomStartZ;
    setInterval(() => {
      randomStartX = getRandomNum(-9, 9)
      randomStartZ = getRandomNum(-9, 9)
    }, 2000)


    setInterval(() => {

      if (!this.gameover && this.gamestarted && !this.gameover) {
        const startValues = [
          {
            x: randomStartX,
            y: 2,
            z: -9,
            radius: 0.2,
            mass: 0.1
          },
          {
            x: 9, y: 2, z: randomStartZ, radius: 0.2,
            mass: 0.1
          },
          {
            x: -9,
            y: 2,
            z: randomStartZ, radius: 0.2,
            mass: 0.1,
          },
          {
            x: randomStartX,
            y: 2,
            z: 9,
            radius: 0.2,
            mass: 0.1
          }


        ]




        var randomStartIndex = Math.floor(Math.random() * startValues.length)
        //var randomStartIndex = 0;
        var randomStart = startValues[randomStartIndex];

        // * Random Color

        var randomcolor = '#';
        var letters = '0123456789ABCDEF';
        for (let y = 0; y < 6; y++) {
          randomcolor += letters[Math.floor(Math.random() * 16)];
        }

        const ball = this.physics.add.sphere(randomStart, { lambert: { color: randomcolor } })
        let sound = add_audio(this.webXR.camera.group, ball, './sounds/ping.mp3')
        console.log(this.webXR.camera.group)
        ball.body.setBounciness(0.7)

        var deltaVector = new THREE.Vector3();

        deltaVector.subVectors(this.cameraBox.position, randomStart)
        deltaVector.setLength(0.5)

        //var deltaVector = camVector.sub(ball.body.position);
        //ball.body.applyForce(getRandomNum(-2, 2), 0, getRandomNum(-2, 2))

        switch (randomStartIndex) {
          case 0: {
            console.log("Top")
            ball.body.applyForceZ(deltaVector.z);
            ball.body.applyForceX(deltaVector.x);

            break;
          }
          case 1: {
            console.log("Right")
            ball.body.applyForceZ(deltaVector.z);
            ball.body.applyForceX(deltaVector.x);


            break;
          }
          case 2: {
            console.log("Left")
            ball.body.applyForceZ(deltaVector.z);
            ball.body.applyForceX(deltaVector.x);

            break;
          }
          case 3: {
            console.log("Bottom")
            ball.body.applyForceZ(deltaVector.z);
            ball.body.applyForceX(deltaVector.x);

            break;
          }
        }




        //ball.body.applyForceX(5);
        ball.body.on.collision((otherObj, event) => {
          if (otherObj == this.cameraBox && event == 'start') {
            this.lifes -= 1;
            this.makeLife();
            console.log(this.lifes)
            this.destroy(ball);
          }



        });
      }
    }, 3000)



    // show all collision for object that have { checkCollisions: true }
    // this.physics.collisionEvents.on('collision', data => {
    //   const { bodies, event } = data
    //   console.log(bodies[0].name, bodies[1].name, event)
    // })





    function getRandomNum(min, max) {

      return Math.random() * (max - min) + min;
    }




    const onSelectStart = (e) => {
      this.move = true
    }

    const onSelectEnd = () => {
      this.move = false
    }



    this.controller = this.webXR.getController(0)
    const controllerGrip = this.webXR.getControllerGrip ? this.webXR.getControllerGrip(0) : null
    const modelFactory = this.webXR.controllerModelFactory

    const tempMatrix = new THREE.Matrix4();



    this.controller.addEventListener('select', () => { })
    this.controller.addEventListener('selectstart', onSelectStart)
    this.controller.addEventListener('selectend', onSelectEnd)

    this.controller.addEventListener('squeeze', () => { })
    this.controller.addEventListener('touchpaddown', onSelectStart)
    this.controller.addEventListener('squeezeend', onSelectStart)

    this.controller.addEventListener('connected', event => {
      const ray = this.webXR.getControllerRay(event.data)
      if (ray) this.controller.add(ray)


    })

    this.controller.addEventListener('disconnected', () => {
      this.controller.remove(this.controller.children[0])
    })

    document.addEventListener('keydown', (event) => {
      const keyName = event.key;
      if (keyName === 'ArrowRight') {
        this.moveRight = true;
      }
      else if (keyName === 'ArrowLeft') {
        this.moveLeft = true;
      }
      else if (keyName === 'ArrowUp') {
        this.moveTop = true;
      }
      else if (keyName === 'ArrowDown') {
        this.moveBottom = true;
      }
      console.log(keyName);
    })

    document.addEventListener('keyup', (event) => {
      const keyName = event.key;
      if (keyName === 'ArrowRight') {
        this.moveRight = false;
      }
      else if (keyName === 'ArrowLeft') {
        this.moveLeft = false;
      }
      else if (keyName === 'ArrowUp') {
        this.moveTop = false;
      }
      else if (keyName === 'ArrowDown') {
        this.moveBottom = false;
      }
      console.log(keyName);
    })



  }

  makePanel() {
    const container = new ThreeMeshUI.Block({
      width: 2,
      height: 2,
      padding: 0.2,

      fontFamily: './Roboto_Regular.json',
      fontTexture: './Roboto-msdf.png',
    });

    container.position.set(this.webXR.camera.position.x, 2, this.webXR.camera.position.z - 2);

    const Loose = new ThreeMeshUI.Text({
      content: "You Lost.",
      fontSize: 0.4
    });

    const reload = new ThreeMeshUI.Text({
      content: "Press Touch Button to reload",
      fontSize: 0.2
    })


    container.add(Loose, reload);

    // scene is a THREE.Scene (see three.js)
    this.scene.add(container);

  }

  makeCountdown() {
    this.scene.remove(this.scene.getObjectByName("oldContainer"));
    const container = new ThreeMeshUI.Block({
      width: 2,
      height: 2,
      padding: 0.2,

      fontFamily: './Roboto_Regular.json',
      fontTexture: './Roboto-msdf.png',
    });

    container.position.set(this.webXR.camera.position.x, 2, this.webXR.camera.position.z - 2);

    const Countdown = new ThreeMeshUI.Text({
      content: `${this.countdown}`,
      fontSize: 0.4
    });

    //this.scene.remove(this.scene.getObjectByName("oldContainer"))

    container.add(Countdown);
    container.name = "oldContainer"
    // scene is a THREE.Scene (see three.js)
    this.scene.add(container);
    console.log(this.scene.getObjectByName("oldContainer"));

  }

  removeCountDownContainer() {
    this.scene.remove(this.scene.getObjectByName("oldContainer"));
  }


  makeLife() {
    this.scene.remove(this.scene.getObjectByName("lifeContainer"));
    const container = new ThreeMeshUI.Block({
      width: 2,
      height: 1,
      padding: 0.2,

      fontFamily: './Roboto_Regular.json',
      fontTexture: './Roboto-msdf.png',
    });

    container.position.set(5, 4, -9);

    const Countdown = new ThreeMeshUI.Text({
      content: `Leben: ${this.lifes}`,
      fontSize: 0.4
    });

    //this.scene.remove(this.scene.getObjectByName("oldContainer"))

    container.add(Countdown);
    container.name = "lifeContainer"
    // scene is a THREE.Scene (see three.js)
    this.scene.add(container);
    console.log(this.scene.getObjectByName("lifeContainer"));

  }
}






PhysicsLoader('/ammo', () => new Project({ scenes: [MainScene], antialias: true }))