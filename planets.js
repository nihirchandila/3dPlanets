import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);

// Setting up ambient light
const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

// Setting up HDRI light
const hdri = new RGBELoader();
hdri.load(
    "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr",
    function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
    }
);

// Creating background of stars texture
const backTextureLoader = new THREE.TextureLoader();
const backTexture = backTextureLoader.load("./stars.jpg");
backTexture.colorSpace = THREE.SRGBColorSpace;

const backSphere = new THREE.SphereGeometry(50, 65, 65);
const backMat = new THREE.MeshStandardMaterial({
    map: backTexture,
    side: THREE.BackSide,
    opacity: 0.5,
    transparent: true,
});
const backMesh = new THREE.Mesh(backSphere, backMat);
scene.add(backMesh);

// Add a loop for 4 spheres
const radius = 1.4;
const widthSegement = 64;
const heightSegement = 64;
const textures = ["./csilla/csilla.jpg", "./earth/earth.jpg", "./venus/venus.jpg", "./volcanic/volcanicJpg.jpg"];
const spheres = new THREE.Group();
const orbitRadius = 4.4;

const spheresMesh = [];
for (let i = 0; i < 4; i++) {
    // Load textures
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(textures[i]);
    texture.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.SphereGeometry(radius, widthSegement, heightSegement);
    const geoMaterial = new THREE.MeshPhysicalMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, geoMaterial);
    spheresMesh.push(mesh);

    const angle = (i / 4) * (Math.PI * 2);
    mesh.position.x = orbitRadius * Math.cos(angle);
    mesh.position.z = orbitRadius * Math.sin(angle);
    spheres.add(mesh);
}
spheres.rotation.x = 0.1;
spheres.position.y = -0.9;
scene.add(spheres);

// Position camera
camera.position.z = 9;

// Scroll event handling
let lastWheelTime = 0;
const throttleDelay = 2000;
let scroll = 0;

window.addEventListener("wheel", (e) => {
    const direction = e.deltaY > 0 ? "down" : "up";
    const currentTime = Date.now();
    if (direction === "down") {
        if (currentTime - lastWheelTime >= throttleDelay) {
            scroll = (scroll + 1) % 4;
            lastWheelTime = currentTime;
            const headings = document.querySelectorAll("h1");

            // Move headings based on scroll direction
            gsap.to(headings, {
                y: `-=${100}%`,
                duration: 0.5,
                ease: "power1.inOut",
            });

            // Rotate spheres based on scroll direction
            gsap.to(spheres.rotation, {
                y: `+=1.5708`,
                duration: 2,
                ease: "expo.easeInOut",
            });

            // Reset headings position when scroll reaches beginning
            if (scroll === 0) {
                gsap.to(headings, {
                    y: 0,
                    duration: 0.5,
                    ease: "power1.inOut",
                });
            }
        }
    }
});

// Mobile touch event handling
let touchStartY = 0;

document.addEventListener("touchstart", (e) => {
    touchStartY = e.touches[0].clientY;
});

document.addEventListener("touchmove", (e) => {
    const touchEndY = e.touches[0].clientY; // Current touch position
    const direction = touchStartY > touchEndY ? "down" : "up"; // Determine direction
    const currentTime = Date.now();

    if (direction === "down") {
        if (currentTime - lastWheelTime >= throttleDelay) {
            scroll = (scroll + 1) % 4;
            lastWheelTime = currentTime;
            const headings = document.querySelectorAll("h1");

            // Move headings based on scroll direction
            gsap.to(headings, {
                y: `-=${100}%`,
                duration: 0.5,
                ease: "power1.inOut",
            });

            // Rotate spheres based on scroll direction
            gsap.to(spheres.rotation, {
                y: `+=1.5708`,
                duration: 2,
                ease: "expo.easeInOut",
            });

            // Reset headings position when scroll reaches beginning
            if (scroll === 0) {
                gsap.to(headings, {
                    y: 0,
                    duration: 0.5,
                    ease: "power1.inOut",
                });
            }
        }
    }
});

// Renderer setup
const canvas = document.querySelector('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

// Animation loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    for (let i = 0; i < 4; i++) {
        const sphere = spheresMesh[i];
        sphere.rotation.y = clock.getElapsedTime() * 0.02;
    }
    renderer.render(scene, camera);
}

animate();
