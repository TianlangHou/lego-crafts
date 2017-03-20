LegoCrafts.BoardController = function(options) {
  'use strict';

  this.drawGrid = function() {
    var size = 500;
    var step = 50;

    var geometry = new THREE.Geometry();

    for (var i = -size; i <= size; i += step) {
      geometry.vertices.push(new THREE.Vector3(-size, 0, i));
      geometry.vertices.push(new THREE.Vector3(size, 0, i));

      geometry.vertices.push(new THREE.Vector3(i, 0, -size));
      geometry.vertices.push(new THREE.Vector3(i, 0, size));
    }
    var material = new THREE.LineBasicMaterial({
      color: 0x000000,
      opacity: 0.2,
      transparent: true
    });
    var line = new THREE.LineSegments(geometry, material);
    return line;
  };

  this.drawPlane = function() {
    var width = LegoCrafts.BoardUnit * LegoCrafts.BoardWidthStep * 2;
    var height = LegoCrafts.BoardUnit * LegoCrafts.BoardLengthStep * 2;
    var plane = drawPlane(width, height);
    plane.name = "plane";
    return plane;
  };

  this.drawBackgroundPlane = function() {
    var width = 10000;
    var height = 10000;
    var plane = drawPlane(width, height);
    return plane;
  };

  function drawPlane(width, height) {
    var geometry = new THREE.PlaneBufferGeometry(width, height);
    geometry.rotateX(-Math.PI / 2);

    var plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      visible: false
    }));
    return plane;
  };

  this.isLegal = function(position) {
    var flag = true;
    //遍历所有object的child
    return true;
  };


  this.drawComponet = function() {

    var componet = new THREE.Object3D();

    var geometry = new THREE.BoxBufferGeometry(LegoCrafts.BoardUnit, LegoCrafts.BoardDepthUnit, LegoCrafts.BoardUnit);
    var material = new THREE.MeshPhongMaterial({
      color: 0x6C6C6C
    });
    var mesh = new THREE.Mesh(geometry, material);
    componet.add(mesh);
    var geometryPoint = new THREE.CylinderGeometry(15, 15, LegoCrafts.BoardUnitCylinderHeight, 100);
    var materialPoint = new THREE.MeshPhongMaterial({
      color: 0x6C6C6C
    });
    var meshPoint = new THREE.Mesh(geometryPoint, materialPoint);
    //make every componet float on the plane (basic coordinate is on y = 0)
    meshPoint.translateY(LegoCrafts.BoardDepthUnit);
    componet.add(meshPoint);
    componet.castShadow = true;
    componet.receiveShadow = true;
    return componet;
  };


  this.drawBoard = function() {
    var board = new THREE.Object3D();
    for (var i = -LegoCrafts.BoardLengthStep; i < LegoCrafts.BoardLengthStep; i++) {
      for (var j = -LegoCrafts.BoardLengthStep; j < LegoCrafts.BoardLengthStep; j++) {
        //draw basic componet for board
        var componet = this.drawComponet();
        //need translate half board unit make the coordinate right
        componet.translateX(i * LegoCrafts.BoardUnit + LegoCrafts.BoardUnit / 2);
        componet.translateZ(j * LegoCrafts.BoardUnit + LegoCrafts.BoardUnit / 2);
        board.add(componet);
      }
    }
    return board;
  };

  this.collisionDetect = function(mouse, brick, collideList, camera) {
    //brick.position.setY(brick.position.y - 7.5);
    //console.log(brick.alignX);
    var ray1 = new THREE.Raycaster();
    ray1.setFromCamera(mouse, camera);
    var intersects2 = ray1.intersectObjects(collideList);
    var j = 0;

    for(j=0;j<collideList.length;j++){
      //console.log(collideList[j].parent.position);
    }

    //console.log(intersects2.length);
    if (intersects2.length > 0) {
      console.log("false");
      return false;
    }

      var i = 0;
      for (i = 0; i < 4; i = i + 2) {
        var directionVector = brick.children[0].geometry.faces[i].normal.clone();
        var ray2 = new THREE.Raycaster(brick.position, directionVector.clone().normalize());
        var collisionResults = ray2.intersectObjects(collideList);

        if (collisionResults.length > 0 && Math.round(collisionResults[0].distance) < brick.alignX) {

          console.log("false");
          return false;
        }
      }
      var directionVector = brick.children[0].geometry.faces[6].normal.clone();
      //console.log(directionVector);
      var ray2 = new THREE.Raycaster(brick.position, directionVector.clone().normalize());
      var collisionResults = ray2.intersectObjects(collideList);

      if (collisionResults.length > 0 && collisionResults[0].distance < 5) {

        console.log("false");
        return false;
      }

      for (i = 8; i < 12; i = i + 2) {
        var directionVector = brick.children[0].geometry.faces[i].normal.clone();
        var ray2 = new THREE.Raycaster(brick.position, directionVector.clone().normalize());
        var collisionResults = ray2.intersectObjects(collideList);

        if (collisionResults.length > 0 && Math.round(collisionResults[0].distance) < brick.alignY) {
          console.log("false");
          return false;
        }
      }


    return true;
  };

  this.detectWithCollideList = function(movingCube, collideMeshList) {
    var crash = false;
    /**
     *  功能：检测 movingCube 是否与数组 collideMeshList 中的元素发生了碰撞
     * 
     */
    var originPoint = movingCube.position.clone();
    var theVertices = movingCube.children[0].geometry.vertices;
    for (var vertexIndex = 0; vertexIndex < theVertices.length; vertexIndex++) {
      // 顶点原始坐标
      var localVertex = theVertices[vertexIndex].clone();
      // 顶点经过变换后的坐标
      var globalVertex = localVertex.applyMatrix4(movingCube.matrix);
      // 获得由中心指向顶点的向量
      var directionVector = globalVertex.sub(movingCube.position);

      // 将方向向量初始化
      var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
      // 检测射线与多个物体的相交情况
      var collisionResults = ray.intersectObjects(collideMeshList);
      // 如果返回结果不为空，且交点与射线起点的距离小于物体中心至顶点的距离，则发生了碰撞
      if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
        crash = true; // crash 是一个标记变量
      }
    }
    return crash;
  };

};