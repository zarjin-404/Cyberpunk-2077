import * as THREE from "three";
import "./style.css";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { RGBShiftShader } from "three/addons/shaders/RGBShiftShader.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { gsap } from "gsap";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

// Load HDRI environment map
new RGBELoader().load("./public/pondbridgenight1k.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

// Load GLTF Model
const loader = new GLTFLoader();
let model;

loader.load(
  "./public/DamagedHelmet.gltf",
  function (gltf) {
    model = gltf.scene;
    model.scale.set(2, 2, 2); // Scale the model
    scene.add(model);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.error("An error happened:", error);
  }
);

camera.position.z = 5;

const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

// Post processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms["amount"].value = 0.0035;
composer.addPass(rgbShiftPass);

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

window.addEventListener("mousemove", (event) => {
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = (event.clientY / window.innerHeight) * 2 - 1;

  gsap.to(model.rotation, {
    y: mouseX * 0.5,
    x: mouseY * 0.5,
    duration: 2,
  });
});

function animate() {
  window.requestAnimationFrame(animate);
  composer.render();
}
animate();
