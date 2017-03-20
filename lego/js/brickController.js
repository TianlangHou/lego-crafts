LegoCrafts.BrickController = function(options) {
    'use strict';

    var color = 0xff0000;
    var width = 2;
    var length = 3;

    this.changeColor = function(changToColor) {
        color = changToColor;
    };

    this.changeType = function(changToWidth,changToLength) {
        width = changToWidth;
        length = changToLength;
    };


    this.drawBrickNew = function() {
        var componet = new THREE.Object3D();

        var geometry = new THREE.BoxGeometry(LegoCrafts.BoardUnit * length, LegoCrafts.BrickUnitHeight, LegoCrafts.BoardUnit*width);
        var material = new THREE.MeshLambertMaterial({
            color: color,
        });
        var mesh = new THREE.Mesh(geometry, material);
        componet.add(mesh);
        //the brick cylinder height is the same with board cylinder height
        var geometryPoint = new THREE.CylinderGeometry(15, 15, LegoCrafts.BoardUnitCylinderHeight, 100);
        var materialPoint = new THREE.MeshLambertMaterial({
            color: color,
        });
        var meshPoint1 = new THREE.Mesh(geometryPoint, materialPoint);
        meshPoint1.translateX(-LegoCrafts.BoardUnit / 2 *(length-1));
        meshPoint1.translateZ(-LegoCrafts.BoardUnit / 2 *(width-1));
        //translate based brick height and cylinder height
        //brick unit height divide 2 equals normal 
        meshPoint1.translateY(LegoCrafts.BrickUnitHeight / 2 + LegoCrafts.BoardUnitCylinderHeight/2);

        componet.add(meshPoint1);
        var tempMeshPointW=meshPoint1;
        var tempMeshPointL=meshPoint1;

        for(var j=0;j<width;j++){
            if(j!=0){
                var frontMeshPoint = frontPoint(tempMeshPointW);
                componet.add(frontMeshPoint);
                tempMeshPointW = frontMeshPoint;
                tempMeshPointL = frontMeshPoint;
            }
            for(var i=1;i<length;i++){
                var rightMeshPoint = rightPoint(tempMeshPointL);
                componet.add(rightMeshPoint);
                tempMeshPointL = rightMeshPoint;
            }
        }
        
        
        //align based on the board unit
        componet.alignX = LegoCrafts.BoardUnit*length/2;
        componet.alignY = LegoCrafts.BoardUnit*width/2;

        componet.castShadow = true;
        componet.receiveShadow = true;
        return componet;
    };


    function rightPoint(point){
        var rightPoint = point.clone();
        rightPoint.translateX(LegoCrafts.BoardUnit);
        return rightPoint;
    };
    function frontPoint(point){
        var rightPoint = point.clone();
        rightPoint.translateZ(LegoCrafts.BoardUnit);
        return rightPoint;
    };


};