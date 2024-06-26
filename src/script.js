import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

THREE.ColorManagement.enabled = false;

/**
 * Base ================================================================================================
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// AxesHelper
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);
axesHelper.visible = false;
gui.add(axesHelper, "visible").name("axesHelper");

/**
 * Textures =============================================================================================
 */

// matcap texture
// image dimension is 256px x 256px
const matcapURLBase = "/textures/matcaps/";

// -- text
let matcapIndex = 3;
const matcapImage = new Image();
matcapImage.src = matcapURLBase + matcapIndex + ".png";

const matcapTexture = new THREE.Texture(matcapImage);
matcapImage.onload = () => {
  matcapTexture.needsUpdate = true;
};

// -- text
let donutMatcapIndex = 3;
const donutMatcapImage = new Image();
donutMatcapImage.src = matcapURLBase + donutMatcapIndex + ".png";

const donutMatcapTexture = new THREE.Texture(donutMatcapImage);
donutMatcapImage.onload = () => {
  donutMatcapTexture.needsUpdate = true;
};

/**
 * Texture loader ========================================================================================
 */
const textureLoader = new THREE.TextureLoader();

/**
 * Fonts ================================================================================================
 *    - You should adjust parameters to find minimum values
 *      for better performance (curveSegments, bevelSegments)
 *
 *    - In order to put text at the center,
 *      translate GEOMETRY, NOT MESH!!
 */

const fontLoader = new FontLoader();

fontLoader.load("/fonts/New_Walt_Disney_Font_Regular.json", (font) => {
  const textGeometry = new TextGeometry("Click to change", {
    font: font,
    size: 0.5,
    height: 0.2,
    curveSegments: 5,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 4,
  });

  textGeometry.center();

  // this is alternative way for moving it to the center
  // move text to the center, with taking bevel values into account
  // textGeometry.computeBoundingBox();
  // textGeometry.translate(
  //   - (textGeometry.boundingBox.max.x - 0.02) * 0.5,
  //   - (textGeometry.boundingBox.max.y - 0.02) * 0.5,
  //   - (textGeometry.boundingBox.max.z - 0.03) * 0.5,
  // );

  const textMaterial = new THREE.MeshMatcapMaterial();
  textMaterial.matcap = matcapTexture;
  textMaterial.transparent = true;
  const text = new THREE.Mesh(textGeometry, textMaterial);
  scene.add(text);

  // gui
  gui
    .add(textMaterial, "opacity")
    .min(0.1)
    .max(1.0)
    .step(0.01)
    .name("text: opacity");

  console.time("donuts");

  // create lots of donuts
  // - geometry and material should be declared and initialised
  // - outside for-loop, because it's really performance-friendly
  const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);
  const donutMaterial = new THREE.MeshMatcapMaterial({
    matcap: donutMatcapTexture,
  });
  donutMaterial.transparent = true;
  donutMaterial.opacity = 0.7;

  // gui
  gui
    .add(donutMaterial, "opacity")
    .min(0.1)
    .max(1.0)
    .step(0.01)
    .name("donut: opacity");

  for (let i = 0; i < 1000; i++) {
    const donut = new THREE.Mesh(donutGeometry, donutMaterial);

    donut.position.x = (Math.random() - 0.5) * 15;
    donut.position.y = (Math.random() - 0.5) * 15;
    donut.position.z = (Math.random() - 0.5) * 15;

    donut.rotation.x = Math.random() * Math.PI;
    donut.rotation.y = Math.random() * Math.PI;

    // in order to maintain donut's proportion
    // the same single value should be used to x, y, z
    const scale = Math.random();
    donut.scale.set(scale, scale, scale);

    scene.add(donut);
  }

  console.timeEnd("donuts");
});

/**
 * Sizes ==================================================================================================
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  halfWidth: window.innerWidth / 2,
  halfHeight: window.innerHeight / 2,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.halfWidth = window.innerWidth / 2;
  sizes.halfHeight = window.innerHeight / 2;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera ==================================================================================================
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer =================================================================================================
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Mouse ========================================================================
 */
const mouse = new THREE.Vector2();

window.addEventListener("pointermove", (event) => {
  if (event.isPrimary === false) return;

  // scale half window size into 1% for mouse movement
  mouse.x = (event.clientX - sizes.halfWidth) * 0.02;
  mouse.y = (event.clientY - sizes.halfHeight) * 0.02;
});

const getRandomInt = (max) => {
  return Math.ceil(Math.random() * max);
};

const getRandomTexture = () => {
  matcapIndex = getRandomInt(12);
  matcapImage.src = matcapURLBase + donutMatcapIndex + ".png";
};

const getRandomDonutTexture = () => {
  donutMatcapIndex = getRandomInt(12);
  donutMatcapImage.src = matcapURLBase + donutMatcapIndex + ".png";
};

window.addEventListener("click", () => {
  getRandomTexture();
  getRandomDonutTexture();
});

/**
 * Animate ==================================================================================================
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Update camera, adjust mouse easing out speed
  camera.position.x += (mouse.x - camera.position.x) * 0.04;
  camera.position.y += (-mouse.y - camera.position.y) * 0.04;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
