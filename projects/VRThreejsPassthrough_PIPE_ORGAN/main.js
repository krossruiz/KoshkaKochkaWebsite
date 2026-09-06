import * as THREE from 'three';
import { ARButton } from './threejsAddons/ARButton.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const appElement = document.getElementById('app');

const scene = new THREE.Scene();
scene.background = null; // transparent for passthrough

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.6, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
appElement.appendChild(renderer.domElement);
renderer.setClearColor(0x000000, 0.0); // transparent clear color

// Environment for realistic reflections/refractions (helps transparent plastic look)
const pmremGenerator = new THREE.PMREMGenerator(renderer);
const environmentTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.02).texture;
scene.environment = environmentTexture;
pmremGenerator.dispose();

document.body.appendChild(ARButton.createButton(renderer, { optionalFeatures: ['hit-test'], requiredFeatures: ['local-floor'] }));

// Lighting
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
hemisphereLight.position.set(0, 1, 0);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(3, 10, 10);
scene.add(directionalLight);

// Load Pipe Organ Model
let modelLoaded = false;

function loadModel() {
	// Debug cube at origin
	const debugGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
	const debugMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
	const debugCube = new THREE.Mesh(debugGeometry, debugMaterial);
	debugCube.position.set(0, 0, 0);
	scene.add(debugCube);

	// Debug cube at model position
	const debugGeometry2 = new THREE.BoxGeometry(0.1, 0.1, 0.1);
	const debugMaterial2 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
	const debugCube2 = new THREE.Mesh(debugGeometry2, debugMaterial2);
	debugCube2.position.set(0, 0, -3.66);
	scene.add(debugCube2);

	const loader = new GLTFLoader();
	loader.load(
		'pipeorgan/pipeorgan.glb',
		function (gltf) {
			const model = gltf.scene;

			// 12 feet is approximately 3.66 meters
			model.position.set(0, 0, -1.5);
			model.rotation.y = Math.PI / 2; // Rotate 90 degrees
			scene.add(model);
		},
		undefined,
		function (error) {
			console.error(error);
		}
	);
}

renderer.xr.addEventListener('sessionstart', () => {
	if (!modelLoaded) {
		loadModel();
		modelLoaded = true;
	}
});

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

// VR animation loop
renderer.setAnimationLoop((timeMs) => {
	renderer.render(scene, camera);
});

