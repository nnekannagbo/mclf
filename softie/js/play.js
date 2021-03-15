import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';

import Stats from './node_modules/three/examples/jsm/libs/stats.module.js';
import { GUI } from './node_modules/three/examples/jsm/libs/dat.gui.module.js';
import { Water } from './node_modules/three/examples/jsm/objects/Water.js';
import { Sky } from './node_modules/three/examples/jsm/objects/Sky.js';
import { BufferGeometryUtils } from "./node_modules/three/examples/jsm/utils/BufferGeometryUtils.js";

import { SimplifyModifier } from './node_modules/three/examples/jsm/modifiers/SimplifyModifier.js';


// import { EffectComposer } from './node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from './node_modules/three/examples/jsm/postprocessing/RenderPass.js';
// import { ShaderPass } from './node_modules/three/examples/jsm/postprocessing/ShaderPass.js';
// import { UnrealBloomPass } from './node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';

let container, stats;
let camera, scene, raycaster, renderer;
let cloudParticles = [];

let controls, water, sun, cenmesh;

let INTERSECTED;
let theta = 0;

const mouse = new THREE.Vector2();
let boxGroup;
let boxSpeeds = [];
const radius = 100;

init();
animate();

function init() {

  container = document.getElementById('container');

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  //

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.set(30, 30, 200);

  //

  sun = new THREE.Vector3();

  // Water

  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

  water = new Water(
    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load('img/waternormals.jpeg', function (texture) {

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

      }),
      alpha: 1.0,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined
    }
  );

  water.rotation.x = - Math.PI / 2;

  scene.add(water);

  // Skybox

  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;

  skyUniforms['turbidity'].value = 10;
  skyUniforms['rayleigh'].value = 10;
  skyUniforms['mieCoefficient'].value = 0.009;
  skyUniforms['mieDirectionalG'].value = 0.8;

  const parameters = {
    inclination: 0.49,
    azimuth: 0.205
  };

  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  function updateSun() {

    const theta = Math.PI * (parameters.inclination - 0.5);
    const phi = 2 * Math.PI * (parameters.azimuth - 0.5);

    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();

    scene.environment = pmremGenerator.fromScene(sky).texture;

  }

  updateSun();

  let ambient = new THREE.AmbientLight(0x555555);
  scene.add(ambient);

  const color = 0xFFFFFF;
  const intensity = .5;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(5, 10, 2);
  scene.add(light);
  scene.add(light.target);
  //  

  const ncolor = 0xFFFFFF;
  const nintensity = 1;
  const nlight = new THREE.DirectionalLight(ncolor, nintensity);
  nlight.position.set(-1, 2, 4);
  scene.add(nlight);

  //   let directionalLight = new THREE.DirectionalLight(0xff8c19);
  // directionalLight.position.set(0,0,1);
  // scene.add(directionalLight);

  scene.fog = new THREE.FogExp2(15655413, 0.0001);
  renderer.setClearColor(scene.fog.color);
  //
  let loader = new THREE.TextureLoader();
  loader.load("./img/psmoke.png", function (texture) {
    //texture is loaded
    let cloudGeo = new THREE.PlaneBufferGeometry(500, 500);
    let cloudMaterial = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true
    });

    for (let p = 0; p < 50; p++) {
      let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
      cloud.position.set(
        Math.random() * 800 - 400,
        500,
        Math.random() * 500 - 500
      );
      cloud.rotation.x = 1.16;
      cloud.rotation.y = -0.12;
      cloud.rotation.z = Math.random() * 2 * Math.PI;
      cloud.scale.multiplyScalar(2.5);
      cloud.material.opacity = 0.25;
      cloudParticles.push(cloud);
      scene.add(cloud);
    }
  });



  // const geometry = new THREE.BoxGeometry(30, 30, 30);
  const boxGeom = new THREE.BoxGeometry(1, 1, 1);
  const centerSpGeom = new THREE.SphereGeometry(10, 300, 2, 30);
  const tinySphereGeom = new THREE.SphereGeometry(2, 30, 20, 30);

  // const material = new THREE.MeshStandardMaterial({ roughness: 0 });
  const brightMaterial = new THREE.MeshPhongMaterial({ emissive: 0xFFFF00 });

  // mesh = new THREE.Mesh(geometry, material);
  cenmesh = new THREE.Mesh(centerSpGeom, brightMaterial);

  scene.add(cenmesh);
  // scene.add(centerShape);



  function makeInstance(geometry, color, x, y, z) {
    const material = new THREE.MeshPhongMaterial({ emissive: color });
    const cube = new THREE.Mesh(tinySphereGeom, material);
    scene.add(cube);
    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;
    return cube;
  }

  const tinySph = [
    makeInstance(centerSpGeom, 0x8844aa, -10, 0, 10),
    makeInstance(centerSpGeom, 0xaa8844, 10, 0, 10),
    makeInstance(centerSpGeom, 0x8844aa, 0, 0, 0),
    // makeInstance(centerSpGeom, 0xaa8844, 20, 0, 10),
  ];


  // const torusGeo = new THREE.TorusKnotGeometry( 80, .3, 10000, 60, 3, 2);
  // const torusKnot = new THREE.Mesh( torusGeo, brightMaterial );
  // scene.add( torusKnot );
  // torusKnot.position.set(0, -10, 10);

  //

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 10, 0);
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;
  controls.update();

  const geometry = new THREE.TorusKnotGeometry(10, 6, 100, 14, 4, 2);
  boxGroup = new THREE.Group();

  for (let i = 0; i < 70; i++) {

    const gltfLoader = new GLTFLoader();
    gltfLoader.load('./img/friend2.glb', (gltf) => {
      let object = gltf.scene;
      scene.add(object);
      // root.position.set(0, 0, 3);
      object.scale.multiplyScalar(20);

      object.traverse((o) => {
        if (o.isMesh) {
          o.friendID = i;
          o.material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff, opacity: 0.5, transparent: true, })
        }
      });

      object.friendID = i;
      object.position.x = Math.random() * 800 - 200;
      object.position.y = Math.random() * 150 - 5; // 100
      object.position.z = Math.random() * 800 - 400; //-200

      object.rotation.x = Math.random() * 2 * Math.PI;
      object.rotation.y = Math.random() * 2 * Math.PI;
      object.rotation.z = Math.random() * 2 * Math.PI;

      boxSpeeds.push(Math.random());

      boxGroup.add(object);
    });

  }
  scene.add(boxGroup);




  raycaster = new THREE.Raycaster();
  // document.addEventListener('mousemove', onDocumentMouseMove);


  window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

  requestAnimationFrame(animate);
  render();
  // stats.update();

}

function render() {
  const time = performance.now() * 0.0001;

  cloudParticles.forEach(p => {
    p.rotation.z -= 0.001;
  });

  cenmesh.position.y = Math.sin(time) * 20 + 5;
  cenmesh.rotation.x = time * 0.5;
  cenmesh.rotation.z = time * 0.51;

  for (let i = 0; i < boxGroup.children.length; i++) {
    // let random = Math.random() * -.05 - .08; // 100
    const randomSpeedForThisBox = boxSpeeds[i];
    boxGroup.children[i].position.y = 1 * Math.sin(time) * 80 + 15;

    // boxGroup.children[i].position.y = Math.sin(randomSpeedForThisBox * time) * 80 + 15;
    boxGroup.children[i].rotation.x = time * Math.sin(time) * 2 + 1;
    boxGroup.children[i].rotation.z = time * 1 * Math.sin(time) * 5 + 1;

  }


  water.material.uniforms['time'].value += 1.0 / 60.0;


  camera.updateMatrixWorld();

  //mouse stuff
  // find intersections
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(boxGroup.children, true);

  if (intersects.length > 0) {
    if (INTERSECTED != intersects[0].object) {
      if (INTERSECTED) {
        INTERSECTED.traverse((o) => {
          if (o.isMesh) {
            o.material.emissive.setHex(o.currentHex);
          }
        });
      }
      INTERSECTED = intersects[0].object;
      INTERSECTED.traverse((o) => {
        if (o.isMesh) {
          o.currentHex = o.material.emissive.getHex();
          o.material.emissive.setHex(0xff0000);
        }
      });

      //if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
      //INTERSECTED = intersects[ 0 ].object;
      //INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      //INTERSECTED.material.emissive.setHex( 0xff0000 );
    }
  } else {
    if (INTERSECTED) {
      // loop over intersected meshes and reset their
      // Hex to the "currentHex" (which is the old hex?)
      // equivalent to:
      //if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
      INTERSECTED.traverse((o) => {
        if (o.isMesh) {
          o.material.emissive.setHex(o.currentHex);
        }
      });

    }
    INTERSECTED = null;
  }
  renderer.render(scene, camera);
  renderer.domElement.addEventListener('touch', onClick, false);

}


function onDocumentMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function onClick(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  let intersects = raycaster.intersectObjects(boxGroup.children, true);

  if (intersects.length > 0) { //you know you have an intersection

    console.log(intersects); 
    // console.log(intersects[0].object.parent.friendID);

    for (let i = 0; i < intersects.length; i++) {
      let currObj = intersects[i].object;
      currObj.traverse((o) => {
        if (o.isMesh) {
          o.material.emissive.setHex(3135135);
        }
      });
    }
  }

}


function windowOnLoad() {
  let currBtn;

  const song1 = new Audio("audio/love.mp3");
  const song2 = new Audio("audio/ask.mp3");
  const song3 = new Audio("audio/face.mp3");
  const song4 = new Audio("audio/hey.mp3");
  const song5 = new Audio("audio/numb.mp3");
  const song6 = new Audio("audio/why.mp3");

  const songs = [song1, song2, song3, song4, song5, song6];

  let video = document.getElementById("video");
  let source = document.createElement("source");
  video.appendChild(source);

  const btn1 = document.getElementById("btn1");
  const btn2 = document.getElementById("btn2");
  const btn3 = document.getElementById("btn3");
  const btn4 = document.getElementById("btn4");
  const btn5 = document.getElementById("btn5");
  const btn6 = document.getElementById("btn6");

  btn1.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn1);
      source.setAttribute("src", "img/v1.mp4");
      video.load();
      playSong(song1);
    },
    false
  );
  btn2.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn2);
      source.setAttribute("src", "img/v2.mp4");
      video.load();
      playSong(song2);
    },
    false
  );
  btn3.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn3);
      source.setAttribute("src", "img/v3.mp4");
      video.load();
      playSong(song3);
    },
    false
  );
  btn4.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn4);
      source.setAttribute("src", "img/v4.mp4");
      video.load();
      playSong(song4);
    },
    false
  );
  btn5.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn5);
      source.setAttribute("src", "img/v5.mp4");
      video.load();
      playSong(song5);
    },
    false
  );
  btn6.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn6);
      source.setAttribute("src", "img/v6.mp4");
      video.load();
      playSong(song6);
    },
    false
  );

  function updateBtnStyle(clickedBtn) {
    // remove the class from the old button (which is the "current" button)
    if (currBtn !== undefined) {
      currBtn.classList.remove("currBtn");
    }
    currBtn = clickedBtn; // update the "current" button to the most recently clicked button
    clickedBtn.classList.add("currBtn");
  }

  function playSong(song) {
    for (let i = 0; i < songs.length; i++) {
      songs[i].pause();
    }
    song.play();
  }


}

window.addEventListener("load", windowOnLoad);

