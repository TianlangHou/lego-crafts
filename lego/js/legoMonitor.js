if (!Detector.webgl) Detector.addGetWebGLMessage();

var canvas;

var camera;

var trackballControls;
var orbitControls;
var boardController;
var brickController;

var scenes = [],
	renderer;
init();
render();


var socket = io.connect('http://localhost:3000/bricks');

socket.on('new brick', function(brick) {
	brickController.changeType(brick.brickType.substring(0, 1), brick.brickType.substring(1, 2));
	brickController.changeColor(brick.color);
	var newBrick = brickController.drawBrickNew();
	newBrick.position.setX(brick.positionX / 2 * LegoCrafts.BoardUnit);
	newBrick.position.setZ(brick.positionY / 2 * LegoCrafts.BoardUnit);
	newBrick.position.setY(LegoCrafts.BoardDepthUnit / 2 + LegoCrafts.BrickUnitHeight / 2);
	scenes[brick.scene].add(newBrick);
	render();
});



function init() {

	canvas = document.getElementById("c");

	var template = document.getElementById("template").text;
	var content = document.getElementById("content");

	for (var i = 0; i < 3; i++) {

		var scene = new THREE.Scene();

		// make a list item
		var element = document.createElement("div");
		element.className = "list-item";
		element.innerHTML = template.replace('$', i + 1);

		// Look up the element that represents the area
		// we want to render the scene
		scene.userData.element = element.querySelector(".scene");
		content.appendChild(element);


		boardController = new LegoCrafts.BoardController();
		brickController = new LegoCrafts.BrickController();

		//scene = new THREE.Scene();

		var axes = new THREE.AxisHelper(1000);
		scene.add(axes);

		initCamera();

		var board = boardController.drawBoard();
		scene.add(board);
		//objects.push(board);

		initLights(scene);
		initRender();

		//init oribit controls and trackball controls
		orbitControls = initOrbitControls();
		trackballControls = initTrackballControls(camera);

		scenes.push(scene);

	}

}

function initCamera() {
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.set(500, 800, 1300);
	camera.lookAt(new THREE.Vector3());
};

function initLights(scene) {
	// Lights
	var ambientLight = new THREE.AmbientLight(0x606060);
	scene.add(ambientLight);
	var directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.castShadow = true;
	directionalLight.position.set(1, 0.75, 0.5).normalize();

	scene.add(directionalLight);
};

function initOrbitControls() {
	var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
	//controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
	orbitControls.enableDamping = true;
	orbitControls.dampingFactor = 0.25;
	orbitControls.enableZoom = false;
	return orbitControls;
};

function initTrackballControls(camera) {
	var trackballControls = new THREE.TrackballControls(camera);
	trackballControls.rotateSpeed = 1.0;
	trackballControls.zoomSpeed = 1.2;
	trackballControls.panSpeed = 0.8;
	trackballControls.noZoom = false;
	trackballControls.noPan = false;
	trackballControls.staticMoving = true;
	trackballControls.dynamicDampingFactor = 0.3;
	return trackballControls;
};

function initRender() {
	renderer = new THREE.WebGLRenderer({
		canvas: canvas,
		antialias: true
	});
	renderer.setClearColor(0xffffff, 1);
	renderer.setPixelRatio(window.devicePixelRatio);

};

function updateSize() {

	var width = canvas.clientWidth;
	var height = canvas.clientHeight;

	if (canvas.width !== width || canvas.height != height) {

		renderer.setSize(width, height, false);

	}

}

function render() {

	updateSize();

	renderer.setClearColor(0xffffff);
	renderer.setScissorTest(false);
	renderer.clear();

	renderer.setClearColor(0xe0e0e0);
	renderer.setScissorTest(true);

	scenes.forEach(function(scene) {

		// get the element that is a place holder for where we want to
		// draw the scene
		var element = scene.userData.element;

		// get its position relative to the page's viewport
		var rect = element.getBoundingClientRect();

		// check if it's offscreen. If so skip it
		if (rect.bottom < 0 || rect.top > renderer.domElement.clientHeight ||
			rect.right < 0 || rect.left > renderer.domElement.clientWidth) {

			return; // it's off screen

		}

		// set the viewport
		var width = rect.right - rect.left;
		var height = rect.bottom - rect.top;
		var left = rect.left;
		var bottom = renderer.domElement.clientHeight - rect.bottom;

		renderer.setViewport(left, bottom, width, height);
		renderer.setScissor(left, bottom, width, height);

		renderer.render(scene, camera);

	});

}