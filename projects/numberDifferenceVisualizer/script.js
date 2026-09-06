import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// --- State Management ---
const MAX_INPUTS = 7;
let inputs = [
    { id: 1, value: 7, color: '#4caf50' },
    { id: 2, value: 50, color: '#2196f3' },
    { id: 3, value: 100, color: '#ff9800' }
];

// --- DOM Elements ---
const inputsList = document.getElementById('inputs-list');
const addBtn = document.getElementById('add-input-btn');
const visualizeBtn = document.getElementById('visualize-btn');
const clearBtn = document.getElementById('clear-btn');
const canvas = document.getElementById('webgl-canvas');

// --- Three.js Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f0f13);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(20, 20, 20);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false; // Disable built-in zoom - we'll handle it ourselves

// Custom Zoom State
let zoomSensitivity = 0.002; // How much each pixel of scroll affects zoom (lower = slower)

// Zoom Speed Control
const zoomSlider = document.getElementById('zoom-speed');
const zoomVal = document.getElementById('zoom-val');

if (zoomSlider) {
    // Set slider to control sensitivity (0.0005 to 0.01)
    zoomSlider.min = "0.0005";
    zoomSlider.max = "0.01";
    zoomSlider.step = "0.0005";
    zoomSlider.value = "0.002";
    zoomVal.textContent = "0.002";

    zoomSlider.addEventListener('input', (e) => {
        zoomSensitivity = parseFloat(e.target.value);
        zoomVal.textContent = zoomSensitivity.toFixed(4);
    });
}

// Background Color Control
const bgColorPicker = document.getElementById('bg-color');
if (bgColorPicker) {
    bgColorPicker.addEventListener('input', (e) => {
        scene.background = new THREE.Color(e.target.value);
    });
}

// Custom wheel zoom handler
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();

    // Calculate zoom factor based on scroll delta
    // deltaY is positive when scrolling down (zoom out), negative when scrolling up (zoom in)
    const zoomFactor = 1 + (e.deltaY * zoomSensitivity);

    // Get current distance from target
    const direction = new THREE.Vector3();
    direction.subVectors(camera.position, controls.target);
    const currentDistance = direction.length();

    // Apply zoom with limits
    const minDistance = 2;
    const maxDistance = 5000;
    const newDistance = Math.max(minDistance, Math.min(maxDistance, currentDistance * zoomFactor));

    // Set new camera position
    direction.normalize().multiplyScalar(newDistance);
    camera.position.copy(controls.target).add(direction);
}, { passive: false });

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(50, 100, 50);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

// Grid Helper (optional, maybe nice for reference)
const gridHelper = new THREE.GridHelper(2000, 100, 0x333333, 0x111111);
scene.add(gridHelper);

// --- UI Logic ---

function renderInputs() {
    inputsList.innerHTML = '';
    inputs.forEach((input, index) => {
        const div = document.createElement('div');
        div.className = 'input-group';
        div.innerHTML = `
            <input type="color" value="${input.color}" data-index="${index}" class="color-input">
            <input type="text" value="${input.value}" placeholder="Number or expression" data-index="${index}" class="number-input">
            <button class="remove-btn" data-index="${index}" title="Remove">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        `;
        inputsList.appendChild(div);
    });

    // Update event listeners
    document.querySelectorAll('.color-input').forEach(el => {
        el.addEventListener('input', (e) => {
            inputs[e.target.dataset.index].color = e.target.value;
        });
    });

    document.querySelectorAll('.number-input').forEach(el => {
        // On input change, try to parse as number
        el.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val)) {
                inputs[e.target.dataset.index].value = val;
            }
        });

        // On Enter key, evaluate expression
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const expression = e.target.value;
                try {
                    // Use math.js to evaluate the expression
                    const result = math.evaluate(expression);
                    const intResult = Math.floor(result);
                    if (!isNaN(intResult) && intResult > 0) {
                        e.target.value = intResult;
                        inputs[e.target.dataset.index].value = intResult;
                    }
                } catch (err) {
                    // Invalid expression - leave as is
                    console.warn('Invalid expression:', expression);
                }
            }
        });
    });

    document.querySelectorAll('.remove-btn').forEach(el => {
        el.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            inputs.splice(index, 1);
            renderInputs();
        });
    });

    if (inputs.length >= MAX_INPUTS) {
        addBtn.style.display = 'none';
    } else {
        addBtn.style.display = 'block';
    }
}

addBtn.addEventListener('click', () => {
    if (inputs.length < MAX_INPUTS) {
        // Generate a random color
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        inputs.push({ id: Date.now(), value: 10, color: randomColor });
        renderInputs();
    }
});

clearBtn.addEventListener('click', () => {
    inputs = [{ id: Date.now(), value: 1, color: '#ffffff' }];
    renderInputs();
    updateVisualization();
});

visualizeBtn.addEventListener('click', () => {
    updateVisualization();
});

// --- Visualization Logic ---

let meshes = [];

function updateVisualization() {
    // Clear existing meshes
    meshes.forEach(mesh => scene.remove(mesh));
    meshes = [];

    const validInputs = inputs.filter(i => i.value > 0);
    if (validInputs.length === 0) return;

    // Calculate layout
    // We want to center the entire assembly at X=0.
    // First, calculate total width including gaps.
    const gap = 2;

    const groupData = validInputs.map(input => {
        const side = Math.ceil(Math.sqrt(input.value));
        return { ...input, side };
    });

    // Total width = sum of sides + (n-1)*gaps
    const sumSides = groupData.reduce((acc, g) => acc + g.side, 0);
    const totalSpan = sumSides + (groupData.length - 1) * gap;

    let currentX = -totalSpan / 2; // Start from left

    const INSTANCE_THRESHOLD = 250000;

    groupData.forEach(group => {
        const count = group.value;
        const side = group.side;
        const color = new THREE.Color(group.color);

        // Center of this group
        const groupCenterX = currentX + (side / 2);

        if (count <= INSTANCE_THRESHOLD) {
            // --- STANDARD INSTANCED MESH ---
            const geometry = new THREE.BoxGeometry(0.9, 0.1, 0.9);
            const material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.2,
                metalness: 0.1
            });
            const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
            instancedMesh.castShadow = true;
            instancedMesh.receiveShadow = true;

            const dummy = new THREE.Object3D();
            const offset = (side - 1) / 2;

            for (let i = 0; i < count; i++) {
                const lx = (i % side) - offset;
                const lz = (Math.floor(i / side)) - offset;

                dummy.position.set(
                    groupCenterX + lx,
                    0.05,
                    lz
                );
                dummy.scale.setScalar(1);
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(i, dummy.matrix);
            }

            instancedMesh.instanceMatrix.needsUpdate = true;
            scene.add(instancedMesh);
            meshes.push(instancedMesh);
        } else {
            // --- PROCEDURAL SHADER MESH (MASSIVE SCALE) ---
            // Create a single large box representing the entire group
            const geometry = new THREE.BoxGeometry(side, 0.1, side);

            // Custom shader to simulate grid lines
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    uColor: { value: color },
                    uGridSize: { value: side }, // Total side length = number of cells
                    uGap: { value: 0.1 } // Gap size relative to cell (approx)
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform vec3 uColor;
                    uniform float uGridSize;
                    uniform float uGap;
                    varying vec2 vUv;
                    
                    void main() {
                        vec2 gridPos = vUv * uGridSize;
                        vec2 grid = fract(gridPos);
                        vec2 delta = fwidth(gridPos);
                        
                        // Square size logic
                        float padding = 0.05; // 0.9 size square
                        float squareSize = 1.0 - (2.0 * padding); // 0.9
                        
                        // Anti-aliased edge calculation
                        // We use smoothstep to determine if we are inside the square
                        
                        // X axis
                        float x1 = smoothstep(padding - delta.x, padding + delta.x, grid.x);
                        float x2 = smoothstep(1.0 - padding - delta.x, 1.0 - padding + delta.x, grid.x);
                        float inX = x1 - x2;
                        
                        // Y axis
                        float y1 = smoothstep(padding - delta.y, padding + delta.y, grid.y);
                        float y2 = smoothstep(1.0 - padding - delta.y, 1.0 - padding + delta.y, grid.y);
                        float inY = y1 - y2;
                        
                        // Calculated intensity from grid pattern
                        float gridIntensity = inX * inY;
                        
                        // Average intensity (coverage) when grid is too small to resolve
                        // Coverage = square width * square height
                        float averageIntensity = squareSize * squareSize; // 0.81
                        
                        // Determine how "bad" the aliasing is based on derivative
                        // If delta is large (> 0.5), we can't resolve the grid at all
                        float blurFactor = smoothstep(0.0, 0.5, max(delta.x, delta.y));
                        
                        // Mix between the sharp grid pattern and the average color
                        // This ensures that at distance, it looks like a solid block of the correct brightness
                        float finalIntensity = mix(gridIntensity, averageIntensity, blurFactor);
                        
                        // Use a threshold for transparency, but don't discard if we are in the "average" mode
                        // We want to keep the solid block visible
                        
                        // If we are close (low blur), we can discard gaps for transparency
                        // If we are far (high blur), we keep the average opacity
                        
                        // Actually, let's just output the alpha.
                        // If we want true transparency in gaps at distance, it's tricky because it's sub-pixel.
                        // Standard approach is to just use alpha blending.
                        
                        gl_FragColor = vec4(uColor, finalIntensity);
                    }
                `,
                transparent: true
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(groupCenterX, 0.05, 0); // Centered at 0 Z
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            scene.add(mesh);
            meshes.push(mesh);
        }

        // Advance X
        currentX += side + gap;
    });

    // Adjust camera
    // We want to see the whole span.
    // Camera Z should be proportional to totalSpan.
    // We also want to see the depth (largest side).
    const maxSide = Math.max(...groupData.map(g => g.side));
    const fitHeightDistance = Math.max(totalSpan, maxSide) / (2 * Math.atan(Math.PI * camera.fov / 360));
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const distance = Math.max(15, fitHeightDistance, fitWidthDistance) * 1.1;

    // Animate camera position
    const targetPos = new THREE.Vector3(0, distance * 0.6, distance * 0.8);

    // Simple animation loop for camera would be nice, but setting it is fine for now.
    // We'll use a simple tween-like approach in the animate loop if we wanted, 
    // but direct set is more robust for "Visualize" click.
    camera.position.copy(targetPos);
    controls.target.set(0, 0, 0);
    controls.update();
}


// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize
renderInputs();
updateVisualization();
animate();
