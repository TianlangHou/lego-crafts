//define the whole application
var LegoCrafts = {
	BoardUnit: 50,
	BoardDepthUnit: 5,
	BoardWidthStep: 12,
	BoardLengthStep: 12,
	BoardUnitCylinderHeight: 10,
	BrickUnitHeight: 20
};



LegoCrafts.Playground = function(options) {
	'use strict';
	if (!Detector.webgl) Detector.addGetWebGLMessage();

	/** @type THREE.Scene */
	var scene;
	/** @type THREE.WebGLRenderer */
	var renderer;
	/** @type THREE.PerspectiveCamera */
	var camera;
	/** @type THREE.Raycaster */
	var raycaster = new THREE.Raycaster();
	/** @type THREE.THREE.Vector2 */
	var mouse = new THREE.Vector2();




	var trackballControls;
	var orbitControls;

	var isShiftDown = false;
	var rollOverBrick;
	var plane;
	var backgroundPlane;
	var objects = [];
	var collideList = [];
	var playground;
	var boardController;
	var brickController;
	initPlayground();

	render();

	var rotationTimes = 0;
	this.changeType = function(changToWidth,changToLength) {
		rotationTimes = 0;
		brickController.changeType(changToWidth,changToLength);
		scene.remove(rollOverBrick);
		rollOverBrick = brickController.drawBrickNew();
		scene.add(rollOverBrick);
		render();
	};

	this.rotate = function() {
		rotationTimes++;
		rollOverBrick.rotation.y = Math.PI * 0.5 * (rotationTimes % 4);
		var temp = rollOverBrick.alignX;
		rollOverBrick.alignX = rollOverBrick.alignY;
		rollOverBrick.alignY = temp;
	};

	this.changeColor = function(changeToColor) {
		rotationTimes = 0;
		brickController.changeColor(changeToColor);
		scene.remove(rollOverBrick);
		rollOverBrick = brickController.drawBrickNew();
		scene.add(rollOverBrick);
	};

	this.finish = function() {
		var json = toJson(objects);
		console.log(json);
		//方法一：截图转化成base64编码存储在变量dataUrl里面
		var dataUrl = renderer.domElement.toDataURL("image/png");
	//	console.log(dataUrl);

		//方法二：截图直接以图片的方式下载到本地download文件夹，缺点是文件名无法修改
		//var image = renderer.domElement.toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.
		//window.location.href=image; // it will save locally

	};

	function toJson(objects) {
		var output = {};
		var object = {};

		for (var i = 2; i < objects.length; i++) {
			object[i] = {};
			object[i].x = objects[i].position.x/LegoCrafts.BoardUnit*2;
			object[i].y = objects[i].position.z/LegoCrafts.BoardUnit*2;
			object[i].color = objects[i].children[0].material.color;
			object[i].type = objects[i].type;
		}
		output.object = object;
		return output;
	};

	function initPlayground() {
		playground = document.getElementById('legoCrafts');

		boardController = new LegoCrafts.BoardController();
		brickController = new LegoCrafts.BrickController();

		scene = new THREE.Scene();

		var axes = new THREE.AxisHelper(1000);
		scene.add(axes);

		initCamera();

		var line = boardController.drawGrid();
		scene.add(line);

		var board = boardController.drawBoard();
		scene.add(board);
		//objects.push(board);

		plane = boardController.drawPlane();
		backgroundPlane = boardController.drawBackgroundPlane();
		backgroundPlane.name = "background-plane";

		scene.add(plane);
		scene.add(backgroundPlane);
		objects.push(plane);
		objects.push(backgroundPlane);

		initLights(scene);
		initRender();
		playground.appendChild(renderer.domElement);

		//init oribit controls and trackball controls
		orbitControls = initOrbitControls();
		trackballControls = initTrackballControls(camera);

		initListners();
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

	function initRender() {
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			//截图用
			preserveDrawingBuffer   : true
		});
		// renderer.sortObjects = false;
		renderer.setClearColor(0xf0f0f0);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMapEnabled = true;
		renderer.shadowMapDarkness = 0.5;
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

	function initListners() {
		document.addEventListener('mousemove', onDocumentMouseMove, false);
		document.addEventListener('mousedown', onDocumentMouseDown, false);
		document.addEventListener('keydown', onDocumentKeyDown, false);
		document.addEventListener('keyup', onDocumentKeyUp, false);

		window.addEventListener('resize', onWindowResize, false);
	};

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
	};

	function onDocumentMouseMove(event) {
		event.preventDefault();

		//added by steven 
		if (rollOverBrick === undefined) {
			return;
		}
		mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
		raycaster.setFromCamera(mouse, camera);

		var intersects = raycaster.intersectObjects(objects);

		if (intersects.length > 0) {
			var intersect = intersects[0];

			rollOverBrick.position.copy(intersect.point).add(intersect.face.normal);
			//boardController.BoardUnit:  basic compont width 50
			rollOverBrick.position.setX(Math.floor(rollOverBrick.position.x / LegoCrafts.BoardUnit) * LegoCrafts.BoardUnit + rollOverBrick.alignX);
			rollOverBrick.position.setZ(Math.floor(rollOverBrick.position.z / LegoCrafts.BoardUnit) * LegoCrafts.BoardUnit + rollOverBrick.alignY);

			//board height 5 plus cylinder height 15
			var rollOverRelativeY = LegoCrafts.BoardDepthUnit / 2 + LegoCrafts.BoardUnitCylinderHeight + LegoCrafts.BrickUnitHeight / 2;
			rollOverBrick.position.setY(Math.floor(rollOverBrick.position.y / rollOverRelativeY) * rollOverRelativeY + rollOverRelativeY);
			
		}

		render();
	};

	function onDocumentMouseDown(event) {

		event.preventDefault();
		//added by steven xu
		if (rollOverBrick === undefined) {
			return;
		}
		mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);

		raycaster.setFromCamera(mouse, camera);

		var intersects = raycaster.intersectObjects(objects);
		if (intersects.length > 0) {

			var intersect = intersects[0];

			// for roll over judge
			if (intersect.object === backgroundPlane) {
				return;
			}

			if (intersect.object === plane&&(rollOverBrick.position.x > LegoCrafts.BoardWidthStep * LegoCrafts.BoardUnit - rollOverBrick.alignX||rollOverBrick.position.z > LegoCrafts.BoardWidthStep * LegoCrafts.BoardUnit - rollOverBrick.alignY))
				return;

			// delete cube
			if (isShiftDown) {
				if (intersect.object !== plane) {
					scene.remove(intersect.object);

					objects.splice(objects.indexOf(intersect.object), 1);
				}

				// create cube
			} else {

				//collision detect on the board 
				var isCollision = boardController.collisionDetect(mouse, rollOverBrick, collideList, camera);
				if (isCollision === true) {
					var voxel = rollOverBrick.clone();
					voxel.type = rollOverBrick.alignX/LegoCrafts.BoardUnit*2+""+rollOverBrick.alignY/LegoCrafts.BoardUnit*2;
					voxel.position.setY(voxel.position.y - LegoCrafts.BoardUnitCylinderHeight);
					//add the new brick to scene
					scene.add(voxel);
					//add the brick to intersects objects array too
					objects.push(voxel);
					collideList.push(voxel.children[0]);
				} else {
					return;
				}

			}
			render();
		}

	};

	function onDocumentKeyDown(event) {
		switch (event.keyCode) {
			case 16:
				isShiftDown = true;
				break;
		}
	};

	function onDocumentKeyUp(event) {
		switch (event.keyCode) {
			case 16:
				isShiftDown = false;
				break;
		}
	};

	function render() {
		orbitControls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
		renderer.render(scene, camera);
	};

}