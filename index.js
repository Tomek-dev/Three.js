import {PointerLockControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/controls/PointerLockControls.js';
var camera, scene, controls, renderer, canvas, loadingManager, clock, mesh;
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var objects = [];
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var prevTime = performance.now();
var USE_WIREFRAME = false;
var loadingManager = null;
var RESOURCES_LOADED = false;

var models = {
	house: {
		obj:"models/house.obj",
		mtl:"models/house.mtl",
		mesh: null
	},
};
var meshes = {};

function init() {
  canvas = document.querySelector('#c');
  renderer = new THREE.WebGLRenderer({canvas});
  clock = new THREE.Clock();


  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 100;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.y = 2;

  loadingManager = new THREE.LoadingManager();
	loadingManager.onProgress = function(item, loaded, total){
		console.log(item, loaded, total);
	};
	loadingManager.onLoad = function(){
		console.log("loaded all resources");
		RESOURCES_LOADED = true;
		onResourcesLoaded();
  };
  
  scene = new THREE.Scene();

  controls = new PointerLockControls(camera);

  var blocker = document.getElementById( 'blocker' );
    var instructions = document.getElementById( 'instructions' );
    instructions.addEventListener( 'click', function () {
    	controls.lock();
    }, false );
    controls.addEventListener( 'lock', function () {
    	instructions.style.display = 'none';
    	blocker.style.display = 'none';
    } );
    controls.addEventListener( 'unlock', function () {
    	blocker.style.display = 'block';
    	instructions.style.display = '';
    } ); 

  scene.add(controls.getObject());

  mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1,1,1),
		new THREE.MeshPhongMaterial({color:0xff4444, wireframe:USE_WIREFRAME})
	);
	mesh.position.y += 1;
	mesh.receiveShadow = true;
  mesh.castShadow = true;
  
	scene.add(mesh);
  //MOVING CONTROLS
  var onKeyDown = function ( event ) {
     switch ( event.keyCode ) {
        case 38: // up
        case 87: // w
        	moveForward = true;
        	break;

        case 37: // left
        case 65: // a
        	moveLeft = true;
        	break;

        case 40: // down
        case 83: // s
        	moveBackward = true;
        	break;

        case 39: // right
        case 68: // d
        	moveRight = true;
        	break;
    	}
    };

    var onKeyUp = function ( event ) {
    	switch ( event.keyCode ) {
    		case 38: // up
    		case 87: // w
    			moveForward = false;
    			break;

    		case 37: // left
    		case 65: // a
    			moveLeft = false;
    			break;

    		case 40: // down
    		case 83: // s
    			moveBackward = false;
    			break;

    		case 39: // right
    		case 68: // d
    			moveRight = false;
    			break;
    	}
    };

  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );
  //loading models
for( var _key in models ){
		(function(key){
			var mtlLoader = new THREE.MTLLoader(loadingManager);
			mtlLoader.load(models[key].mtl, function(materials){
				materials.preload();
				
				var objLoader = new THREE.OBJLoader(loadingManager);
				
				objLoader.setMaterials(materials);
				objLoader.load(models[key].obj, function(mesh){
					
					mesh.traverse(function(node){
						if( node instanceof THREE.Mesh ){
							if('castShadow' in models[key])
								node.castShadow = models[key].castShadow;
							else
								node.castShadow = true;
							
							if('receiveShadow' in models[key])
								node.receiveShadow = models[key].receiveShadow;
							else
								node.receiveShadow = true;
						}
					});
					models[key].mesh = mesh;
					
				});
			});
			
		})(_key);
	}
  //LIGHT
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(2, 2, 4);
  scene.add(light);

  //FLOOR
  const floorGeometry = new THREE.PlaneGeometry(10, 10, 10, 10); //set floor size
  floorGeometry.rotateX( - Math.PI / 2 ); //rotate floor
  const floorMaterial = new THREE.MeshPhongMaterial({color: 0x5544AA}); //set floor material / color
  const floor = new THREE.Mesh(floorGeometry, floorMaterial); // create mesh
  scene.add(floor);

  //CUBE
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1); //create cube with size x:1 y:1 z:1
  const cubeMaterial = new THREE.MeshPhongMaterial({color: 0x44aa88}); //
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial); // create mesh
  cube.position.set(1, 1, 1);
  objects.push(cube);
  scene.add(cube);

  renderer.render(scene, camera);

  //RESIZING AND RESPONSIVE
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

  function render(){
    if(resizeRendererToDisplaySize(renderer)){
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
function onResourcesLoaded(){
	// Clone models into meshes.
	meshes["house"] = models.house.mesh.clone();
	
	// Reposition individual meshes, then add meshes to scene
	meshes["house"].position.set(-5, 0, 4);
	scene.add(meshes["house"]);
} 

function animate(){
    requestAnimationFrame(animate);
    if(controls.isLocked === true){

        var time = performance.now();
        let delta = (time - prevTime) / 1000; //calculate delta

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        //calculate direction
        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveRight ) - Number( moveLeft );
        direction.normalize();

        if(moveForward || moveBackward) velocity.z -= direction.z * 50.0 * delta;
        if(moveLeft || moveRight) velocity.x -= direction.x * 50.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(- velocity.z * delta);

        if(controls.getObject().position.y < 2){
            velocity.y = 0;
            controls.getObject().position.y = 2;
        }
        prevTime = time;
    }
    renderer.render( scene, camera );
}

init();
animate();
