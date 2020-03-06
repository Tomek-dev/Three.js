import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/110/three.module.js';
import {FirstPersonControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/controls/FirstPersonControls.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});

  const clock = new THREE.Clock();

  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  const scene = new THREE.Scene();

  //moving
  const cameraControls = new FirstPersonControls(camera);
  cameraControls.movementSpeed = 5;
  cameraControls.noFly = true;
  cameraControls.lookSpeed = 0.8;
  cameraControls.lookVertical = true;
  cameraControls.constrainVertical = true;

  //light
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(2, 2, 4);
  scene.add(light);

  //floor
  const floorGeometry = new THREE.PlaneGeometry(10, 10, 10, 10);
  const floorMaterial = new THREE.MeshPhongMaterial({color: 0x5544AA});
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.set(1, -1, 1);
  floor.rotation.x = Math.PI * -.5;
  scene.add(floor);

  //cube
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshPhongMaterial({color: 0x44aa88});
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  scene.add(cube);

  renderer.render(scene, camera);

  //resizing and responsive
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if(needResize){
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time){
    time *= 0.001;
    let delta = clock.getDelta();

    if(resizeRendererToDisplaySize(renderer)){
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    cube.rotation.x = time;
    cube.rotation.y = time;

    cameraControls.update(delta);
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
