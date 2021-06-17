import { PhysicsLoader } from '@enable3d/ammo-physics';
import { ThreeGraphics } from '@enable3d/three-graphics';
import { Project, Scene3D } from 'enable3d';
import { createImmersiveButton } from './vr'
import * as THREE from 'three';


class MainScene extends Scene3D {
  move = false;
  moveLeft = false;
  moveRight = false;
  moveBottom = false;
  moveTop = false;
  grab = false;
  controller;
  intersected: any = [];
  tempMatrix = new THREE.Matrix4();
  cameraBox;
  minVector;
  maxVector;
  raycaster;
  group;
  grabbed = false;
  constructor() {
    super({ enableXR: true })


  }

  async update() {

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


    if (this.webXR.isPresenting && this.move) {
      // move in the direction of the view

      const cam = this.webXR.camera
      const v3 = new THREE.Vector3()
      const distance = 0.06
      const box = this.cameraBox;
      box.body.needUpdate = true;

      cam.position.clamp(this.minVector, this.maxVector);
      cam.getWorldDirection(v3)
      let addVector = v3.multiplyScalar(distance)

      box.position.set(box.position.x + addVector.x, box.position.y, box.position.z + addVector.z);

      cam.position.add(addVector);
      console.log("Box!!!")
      console.log(box.position);
      console.log("CAM!!!")
      console.log(cam.position);

    }

  }


  async create() {


    this.raycaster = new THREE.Raycaster();
    this.minVector = new THREE.Vector3(-9, 0, -9)
    this.maxVector = new THREE.Vector3(9, 0, 9)
    console.log(this.controller);
    let controls;
    this.physics.debug?.enable()
    let word = "welcome";



    this.warpSpeed('-orbitControls')
    this.camera.position.set(0, 30, 0)
    this.camera.lookAt(0, 0, 0)

    // * Create Camera Box

    this.cameraBox = this.physics.add.box({ x: this.webXR.camera.position.x, y: this.webXR.camera.position.y + 0.5, z: this.webXR.camera.position.z }, { basic: { color: 'transparent' } })
    this.cameraBox.body.setCollisionFlags(2);
    this.cameraBox.visible = false;
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
      { x: 0, y: 2, z: 10, width: 21, height: 8, depth: 1, mass: 0, collisionFlags: 0 },
      { lambert: { color: 'red', transparent: false, opacity: 0.5 } }
    )

    const left = this.physics.add.box(
      { x: -10, y: 2, z: -0.5, width: 1, height: 8, depth: 20, mass: 0, collisionFlags: 0 },
      { lambert: { color: 'red', transparent: false, opacity: 0.5 } }
    )

    const right = this.physics.add.box(
      { x: 10, y: 2, z: -0.5, width: 1, height: 8, depth: 20, mass: 0, collisionFlags: 0 },
      { lambert: { color: 'red', transparent: false, opacity: 0.5 } }
    )

    const front = this.physics.add.box(
      { x: 0, y: 2, z: -10, width: 19, height: 8, depth: 1, mass: 0, collisionFlags: 0 },
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

      // var randomStartIndex = 1;
      // var randomStart = startValues[randomStartIndex];

      var randomStartIndex = Math.floor(Math.random() * startValues.length)
      var randomStart = startValues[randomStartIndex];

      var randomcolor = '#';
      var letters = '0123456789ABCDEF';
      for (let y = 0; y < 6; y++) {
        randomcolor += letters[Math.floor(Math.random() * 16)];
      }

      const ball = this.physics.add.sphere(randomStart, { lambert: { color: randomcolor } })
      // ball.body.setBounciness(0.7)


      //ball.body.applyForce(getRandomNum(-2, 2), 0, getRandomNum(-2, 2))

      switch (randomStartIndex) {
        case 0: {
          console.log("Top")
          ball.body.applyForceZ(1)
          ball.body.applyForceX(getRandomNum(-0.7, 0.7))
          break;
        }
        case 1: {
          console.log("Right")
          ball.body.applyForceZ(getRandomNum(-0.7, 0.7))
          ball.body.applyForceX(-1)
          break;
        }
        case 2: {
          console.log("Left")
          ball.body.applyForceZ(getRandomNum(-0.7, 0.7))
          ball.body.applyForceX(1)
          break;
        }
        case 3: {
          console.log("Bottom")
          ball.body.applyForceZ(1);
          ball.body.applyForceX(getRandomNum(-0.7, 0.7));
          break;
        }
      }


      //ball.body.applyForceX(5);
      this.physics.add.collider(ball, this.cameraBox, event => {
        this.destroy(this.cameraBox)
      })

      setTimeout(() => {
        this.destroy(ball)
      }, 10000)
    }, 700)

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
    this.controller.addEventListener('disconnected', () => {
      this.controller.remove(this.controller.children[0])
    })

  }


}



PhysicsLoader('/ammo', () => new Project({ scenes: [MainScene], antialias: true }))