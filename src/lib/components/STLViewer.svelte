<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import * as THREE from "three";
	import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
	import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
	import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	interface Props {
		modelPath: string;
		width?: number;
		height?: number;
	}

	let { modelPath, width = 300, height = 200 }: Props = $props();

	let container: HTMLDivElement;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;
	let controls: OrbitControls;
	let animationId: number;

	onMount(() => {
		initScene();
		loadModel();
		animate();
	});

	onDestroy(() => {
		if (animationId) cancelAnimationFrame(animationId);
		if (renderer) renderer.dispose();
		if (controls) controls.dispose();
	});

	function initScene() {
		// Scene
		scene = new THREE.Scene();
		scene.background = new THREE.Color(0x1e1e2e);

		// Camera
		camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
		camera.position.set(100, 100, 100);

		// Renderer
		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(width, height);
		renderer.setPixelRatio(window.devicePixelRatio);
		container.appendChild(renderer.domElement);

		// Controls - OrbitControls for intuitive 3D navigation
		controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.autoRotate = true;
		controls.autoRotateSpeed = 1.5;

		// Zoom limits
		controls.minDistance = 20;
		controls.maxDistance = 300;

		// Pan settings
		controls.enablePan = true;
		controls.panSpeed = 0.8;

		// Touch support
		controls.touches = {
			ONE: THREE.TOUCH.ROTATE,
			TWO: THREE.TOUCH.DOLLY_PAN,
		};

		// Stop auto-rotate on interaction
		controls.addEventListener("start", () => {
			controls.autoRotate = false;
		});

		// Lights
		const ambientLight = new THREE.AmbientLight(0x404040, 2);
		scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(1, 1, 1);
		scene.add(directionalLight);

		const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
		backLight.position.set(-1, -1, -1);
		scene.add(backLight);

		// Grid helper
		const gridHelper = new THREE.GridHelper(100, 10, 0x444466, 0x333344);
		scene.add(gridHelper);
	}

	function loadModel() {
		const extension = modelPath.split(".").pop()?.toLowerCase();

		if (extension === "obj") {
			loadOBJ();
		} else if (extension === "gltf" || extension === "glb") {
			loadGLTF();
		} else {
			loadSTL();
		}
	}

	function loadSTL() {
		const loader = new STLLoader();

		loader.load(
			modelPath,
			(geometry) => {
				addGeometryToScene(geometry);
			},
			undefined,
			(err) => {
				console.error("Error loading STL:", err);
			},
		);
	}

	function loadOBJ() {
		const loader = new OBJLoader();

		loader.load(
			modelPath,
			(obj) => {
				// Center the object
				const box = new THREE.Box3().setFromObject(obj);
				const center = box.getCenter(new THREE.Vector3());
				obj.position.sub(center);

				// Scale to fit
				const size = box.getSize(new THREE.Vector3());
				const maxDim = Math.max(size.x, size.y, size.z);
				const scale = 50 / maxDim;
				obj.scale.set(scale, scale, scale);

				// Apply material to all meshes
				const material = new THREE.MeshPhongMaterial({
					color: 0x3b82f6,
					specular: 0x111111,
					shininess: 50,
					flatShading: false,
				});

				obj.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						child.material = material;
					}
				});

				obj.rotation.x = -Math.PI / 2;
				scene.add(obj);

				// Position camera
				const distance = maxDim * scale * 2.5;
				camera.position.set(distance, distance, distance);
				controls.update();
			},
			undefined,
			(err) => {
				console.error("Error loading OBJ:", err);
			},
		);
	}

	function loadGLTF() {
		const loader = new GLTFLoader();

		loader.load(
			modelPath,
			(gltf) => {
				const model = gltf.scene;

				// Center the object
				const box = new THREE.Box3().setFromObject(model);
				const center = box.getCenter(new THREE.Vector3());
				model.position.sub(center);

				// Scale to fit
				const size = box.getSize(new THREE.Vector3());
				const maxDim = Math.max(size.x, size.y, size.z);
				const scale = 50 / maxDim;
				model.scale.set(scale, scale, scale);

				// glTF models may have their own materials, apply default if missing
				model.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						if (
							!child.material ||
							(child.material as THREE.Material).type ===
								"MeshBasicMaterial"
						) {
							child.material = new THREE.MeshPhongMaterial({
								color: 0x3b82f6,
								specular: 0x111111,
								shininess: 50,
							});
						}
					}
				});

				scene.add(model);

				// Position camera
				const distance = maxDim * scale * 2.5;
				camera.position.set(distance, distance, distance);
				controls.update();
			},
			undefined,
			(err) => {
				console.error("Error loading glTF:", err);
			},
		);
	}

	function addGeometryToScene(geometry: THREE.BufferGeometry) {
		// Center the geometry
		geometry.computeBoundingBox();
		const center = new THREE.Vector3();
		geometry.boundingBox!.getCenter(center);
		geometry.translate(-center.x, -center.y, -center.z);

		// Scale to fit
		const size = new THREE.Vector3();
		geometry.boundingBox!.getSize(size);
		const maxDim = Math.max(size.x, size.y, size.z);
		const scale = 50 / maxDim;

		// Material
		const material = new THREE.MeshPhongMaterial({
			color: 0x3b82f6,
			specular: 0x111111,
			shininess: 50,
			flatShading: false,
		});

		const mesh = new THREE.Mesh(geometry, material);
		mesh.scale.set(scale, scale, scale);
		mesh.rotation.x = -Math.PI / 2;
		scene.add(mesh);

		// Position camera based on model size
		const distance = maxDim * scale * 2.5;
		camera.position.set(distance, distance, distance);
		controls.update();
	}

	function animate() {
		animationId = requestAnimationFrame(animate);
		controls.update();
		renderer.render(scene, camera);
	}
</script>

<div
	bind:this={container}
	class="model-viewer rounded-lg overflow-hidden"
	style="width: {width}px; height: {height}px;"
></div>

<style>
	.model-viewer {
		border: 1px solid rgba(255, 255, 255, 0.1);
	}
	.model-viewer :global(canvas) {
		display: block;
	}
</style>
