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

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
  apiKey: "AIzaSyDiCOSmTc5a0U0m4jY4D8s7ZXZ6ab5NTWo",
  authDomain: "sanctuary-76c32.firebaseapp.com",
  projectId: "sanctuary-76c32",
  storageBucket: "sanctuary-76c32.appspot.com",
  messagingSenderId: "656056199487",
  appId: "1:656056199487:web:278a2511cfb83f7798cb8a",
  measurementId: "G-TDGFN204SM"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

let container, stats;
let camera, scene, raycaster, renderer;
// let cloudParticles = [];

let controls, water, sun, cenmesh;
let newText;
let INTERSECTED;
let theta = 0;
let currFriendModalDiv = undefined;
let modalOpen = false;
const mouse = new THREE.Vector2();
let boxGroup;
let boxSpeeds = [];
const radius = 100;
let toggleOpen = false;
let objects = [];
let database = firebase.database();
let ref = database.ref();
let msgsRef = ref.child('msg');

init();
animate();

function gotData(data) {
  let msgs = data.val();
  console.log(msgs);
  let keys = Object.keys(msgs);
  console.log(`keys: ${keys}`);
  for (let i = 0; i < keys.length; i++) {
    let k = keys[i];
    var msgg = msgs[k].msg;
    let txtDivToUpdate = document.getElementById("textDivID" + k);
    txtDivToUpdate.innerHTML = msgg;
    // console.log(msgg);
  }
}
function errData() {
  console.log("error");
}

msgsRef.on('value', gotData, errData); //callback for receive data, then for err data




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
    // sun.scale.set(10, 10 10);

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

  scene.fog = new THREE.FogExp2(15655413, 0.0002);
  renderer.setClearColor(scene.fog.color);
  //

  // let loader = new THREE.TextureLoader();
  // loader.load("./img/psmoke.png", function (texture) {
  //   //texture is loaded
  //   let cloudGeo = new THREE.PlaneBufferGeometry(500, 500);
  //   let cloudMaterial = new THREE.MeshLambertMaterial({
  //     map: texture,
  //     transparent: true
  //   });

  //   for (let p = 0; p < 50; p++) {
  //     let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
  //     cloud.position.set(
  //       Math.random() * 800 - 400,
  //       500,
  //       Math.random() * 500 - 500
  //     );
  //     cloud.rotation.x = 1.16;
  //     cloud.rotation.y = -0.12;
  //     cloud.rotation.z = Math.random() * 2 * Math.PI;
  //     cloud.scale.multiplyScalar(2.5);
  //     cloud.material.opacity = 0.25;
  //     cloudParticles.push(cloud);
  //     scene.add(cloud);
  //   }
  // });



  // const geometry = new THREE.BoxGeometry(30, 30, 30);
  const boxGeom = new THREE.BoxGeometry(21, 21, 21);
  const centerSpGeom = new THREE.SphereGeometry(10, 300, 2, 30);
  const tinySphereGeom = new THREE.SphereGeometry(2, 30, 20, 30);

  // const material = new THREE.MeshStandardMaterial({ roughness: 0 });
  const brightMaterial = new THREE.MeshPhongMaterial({ emissive: 0xFFFF00 });

  // mesh = new THREE.Mesh(geometry, material);
  cenmesh = new THREE.Mesh(centerSpGeom, brightMaterial);
  scene.add(cenmesh);


  ///test area for sun

  const friendWorld = new THREE.Object3D();
  scene.add(friendWorld);
  objects.push(friendWorld);

  let tempSun = new THREE.Mesh(tinySphereGeom, brightMaterial);
  tempSun.scale.set(2, 2, 2);
  friendWorld.add(tempSun);
  // scene.add(tempSun);
  objects.push(tempSun);

  const earthMaterial = new THREE.MeshPhongMaterial({ color: 3093151, opacity: 0.5, transparent: true, emissive: 1})
  const earthMesh = new THREE.Mesh(tinySphereGeom, earthMaterial);
  earthMesh.position.x = 20;
  earthMesh.position.y = 8;
  earthMesh.scale.set(2, 2, 2);

  friendWorld.add(earthMesh);
  objects.push(earthMesh);




  function makeInstance(geometry, color, x, y, z) {
    // const material = new THREE.MeshPhongMaterial({ emissive: color });
    const cube = new THREE.Mesh(tinySphereGeom, brightMaterial);
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
  controls.maxPolarAngle = Math.PI * 0.499;
  controls.target.set(0, 10, 0);
  controls.minDistance = 40.0;
  controls.maxDistance = 400.0;
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


      function makeFriendModal(friendID) {
        let friendModalDiv = document.createElement("div");
        let infoTextDiv = document.createElement("div");
        let textDiv = document.createElement("div");
        let inputDiv = document.createElement("div");

        friendModalDiv.id = "friendModalDivID" + friendID;
        textDiv.id = "textDivID" + friendID;
        inputDiv.id = "inputDivID" + friendID;

        friendModalDiv.classList.add("friendModalDiv");
        textDiv.classList.add("textDiv");
        inputDiv.classList.add("inputDiv");
        
        let newText = document.createTextNode(" ");    // Create a text node
        textDiv.appendChild(newText);

        let newInfoText = document.createTextNode("This is a space where things may happen.");    // Create a text node
        infoTextDiv.appendChild(newInfoText);

        let msgInput = document.createElement("input");
        msgInput.type = "text";
        inputDiv.appendChild(msgInput);

        let postBtn = document.createElement("input");
        postBtn.setAttribute('type', 'button');

        postBtn.classList.add("postBtn");
        // postBtn.textContent = 'test value';
        postBtn.value = 'send';

        console.log(postBtn.nintensity);

        postBtn.addEventListener("click", function (event) {

          var data = {};
          data[friendID] = {
            msg: msgInput.value
          };
          console.log(msgInput.value);
          msgsRef.update(data);
          msgInput.value = "";
        });

        let container = document.getElementById("container");

        container.insertBefore(friendModalDiv, container.childNodes[0]);
        friendModalDiv.insertBefore(postBtn, friendModalDiv.childNodes[0]);
        friendModalDiv.insertBefore(inputDiv, friendModalDiv.childNodes[0]);
        friendModalDiv.insertBefore(textDiv, friendModalDiv.childNodes[0]);
        friendModalDiv.insertBefore(infoTextDiv, friendModalDiv.childNodes[0]);
      }

      makeFriendModal(object.friendID);

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
  document.addEventListener('mousemove', onDocumentMouseMove);
  window.addEventListener('resize', onWindowResize);

}

function takeModalIDReturnMsg(currModalID) {
  // console.log(currModalID);
  return "Welcome to orb " + currModalID;
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

  // cloudParticles.forEach(p => {
  //   p.rotation.z -= 0.001;
  // });

  cenmesh.position.y = Math.sin(time) * 20 + 5;
  cenmesh.rotation.x = time * 0.5;
  cenmesh.rotation.z = time * 0.51;

  for (let i = 0; i < boxGroup.children.length; i++) {
    // let random = Math.random() * -.05 - .08; // 100
    const randomSpeedForThisBox = boxSpeeds[i];
    boxGroup.children[i].position.y = Math.sin(time) * 40 + 15;

    // boxGroup.children[i].position.y = Math.sin(randomSpeedForThisBox * time) * 80 + 15;
    boxGroup.children[i].rotation.x = Math.sin(time) * 2 + 1;
    boxGroup.children[i].rotation.z = Math.sin(time) * 5 + 1;

  }

  objects.forEach((obj) => {
    obj.rotation.y = time;
  });


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
  renderer.domElement.addEventListener('click', onClick, false);

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

  // close modals when clicking outside them
  var modal = document.getElementsByClassName('friendModalDiv');
  if (event.target.classList.contains('friendModalDiv')) {
  } else {
    for (var i = 0; i < modal.length; i++) {
      let currModal = modal[i];
      currModal.classList.remove("openFriendModalDiv");

      // document.getElementById("wrapper").classList.remove("openWrapper");
    }
  }



  let intersectsFriend = raycaster.intersectObjects(boxGroup.children, true);

  if (intersectsFriend.length > 0) { //you know you have an intersection
    // document.getElementById("wrapper").classList.add("openWrapper");

    if (wrapper.classList.contains("openWrapper")) {
      wrapper.classList.remove("openWrapper");
      wrapperBtn.classList.add("wrapperBtnClosing");
      toggleOpen = false;
    }

    let currFriendID = intersectsFriend[0].object.parent.friendID; //grab the id of the friend
    let currModalID = "friendModalDivID" + currFriendID; //form the modal ID
    currFriendModalDiv = document.getElementById(currModalID); //grad the current Modal
    currFriendModalDiv.classList.add("openFriendModalDiv")
    modalOpen = true;

    let msg = takeModalIDReturnMsg(currFriendID);
    let currTextDiv = document.getElementById("textDivID" + currFriendID);
    // currTextDiv.innerHTML = msg;

    for (let i = 0; i < intersectsFriend.length; i++) {
      let currObj = intersectsFriend[i].object;
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

  // let video = document.getElementById("video");
  // let source = document.createElement("source");
  // video.appendChild(source);

  const wrapper = document.getElementById("wrapper");
  const wrapperBtn = document.getElementById("wrapperBtn");
  const wrapperToggleDiv = document.getElementById("wrapperToggleDiv");

  const btn1 = document.getElementById("btn1");
  const btn2 = document.getElementById("btn2");
  const btn3 = document.getElementById("btn3");
  const btn4 = document.getElementById("btn4");
  const btn5 = document.getElementById("btn5");
  const btn6 = document.getElementById("btn6");

  document.addEventListener(
    "click",
    function (event) {
      if (toggleOpen == false) {
        console.log("toggle is closed - return");
        // return;
      } else {
        console.log("toggle is open");
        if (event.target.classList.contains(wrapper)) { // || event.target.contains( wrapper )
          console.log("clicking on wrapper or button - return");
          // return;
        } else {
          console.log("clicking on world - run code");

          // if (wrapper.classList.contains("openWrapper")) {
          //   wrapper.classList.remove("openWrapper");
          //   wrapperBtn.classList.add("wrapperBtnClosing");
          //   toggleOpen = false;
          // }
        }
      }
    },
  );

  wrapperBtn.addEventListener(
    "click",
    function (event) {
      if (toggleOpen == false) {
        // console.log("toggle is opening");
        if (wrapperBtn.classList.contains('wrapperBtnClosed')) {
          wrapperBtn.classList.remove("wrapperBtnClosed");
        }
        if (wrapperBtn.classList.contains('wrapperBtnClosing')) {
          wrapperBtn.classList.remove("wrapperBtnClosing");
        }
        wrapperBtn.classList.add("wrapperBtnOpening");
        wrapper.classList.add("openWrapper");
        toggleOpen = true;
        // console.log(`toggle should be open ${toggleOpen}`);
      } else {
        console.log("toggle is closing");
        if (wrapperBtn.classList.contains('wrapperBtnOpening')) {
          wrapperBtn.classList.remove("wrapperBtnOpening");
        }
        wrapperBtn.classList.add("wrapperBtnClosing");
        wrapper.classList.remove("openWrapper");
        toggleOpen = false;
        // console.log(`toggle should be closed ${toggleOpen}`);


      }
      // toggleOpen != toggleOpen
      // console.log(toggleOpen);
      // toggleOpen
    },
  );

  btn1.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn1);
      // source.setAttribute("src", "img/v1.mp4");
      // video.load();
      playSong(song1);
    },
    false
  );
  btn2.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn2);
      // source.setAttribute("src", "img/v2.mp4");
      // video.load();
      playSong(song2);
    },
    false
  );
  btn3.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn3);
      // source.setAttribute("src", "img/v3.mp4");
      // video.load();
      playSong(song3);
    },
    false
  );
  btn4.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn4);
      // source.setAttribute("src", "img/v4.mp4");
      // video.load();
      playSong(song4);
    },
    false
  );
  btn5.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn5);
      // source.setAttribute("src", "img/v5.mp4");
      // video.load();
      playSong(song5);
    },
    false
  );
  btn6.addEventListener(
    "click",
    function () {
      updateBtnStyle(btn6);
      // source.setAttribute("src", "img/v6.mp4");
      // video.load();
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
    song.volume = 0.1;

    song.play();
  }


}

window.addEventListener("load", windowOnLoad);

