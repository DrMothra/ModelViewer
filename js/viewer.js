/**
 * Created by DrTone on 14/08/2014.
 */
/* 3D model viewer */

// Globals
var GROUND_WIDTH = 300;
var GROUND_HEIGHT = 300;

function addGroundPlane(scene, width, height) {
    // create the ground plane
    var planeGeometry = new THREE.PlaneGeometry(width,height,1,1);
    var texture = THREE.ImageUtils.loadTexture("images/grid.png");
    var planeMaterial = new THREE.MeshLambertMaterial({map: texture, transparent: true, opacity: 0.5});
    var plane = new THREE.Mesh(planeGeometry,planeMaterial);

    //plane.receiveShadow  = true;

    // rotate and position the plane
    plane.rotation.x=-0.5*Math.PI;
    plane.position.x=0;
    plane.position.y=-60;
    plane.position.z=0;

    scene.add(plane);

    //Second plane
    planeGeometry = new THREE.PlaneGeometry(width, height, 1, 1);
    planeMaterial = new THREE.MeshLambertMaterial({color: 0x16283c});
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x=-0.5*Math.PI;
    plane.position.x=0;
    plane.position.y=-61;
    plane.position.z=0;
    //Give it a name
    plane.name = 'ground';

    // add the plane to the scene
    scene.add(plane);
}

//Init this app from base
function Viewer() {
    BaseApp.call(this);
}

Viewer.prototype = new BaseApp();

Viewer.prototype.init = function(container) {
    BaseApp.prototype.init.call(this, container);
    this.updateRequired = false;
    this.guiControls = null;
    this.filename = '';
};

Viewer.prototype.update = function() {
    //Perform any updates
    var delta = this.clock.getDelta();
    var clicked = this.mouse.down;

    //Perform mouse hover
    var vector = new THREE.Vector3(( this.mouse.x / window.innerWidth ) * 2 - 1, -( this.mouse.y / window.innerHeight ) * 2 + 1, 0.5);
    this.projector.unprojectVector(vector, this.camera);

    var raycaster = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());

    this.hoverObjects.length = 0;
    //this.hoverObjects = raycaster.intersectObjects(this.scene.children, true);

    //Check hover actions
    if(this.hoverObjects.length != 0) {
        for(var i=0; i<this.hoverObjects.length; ++i) {

        }
    }

    BaseApp.prototype.update.call(this);
};

Viewer.prototype.createScene = function() {
    //Init base createsScene
    BaseApp.prototype.createScene.call(this);

    //Load ground plane
    addGroundPlane(this.scene, GROUND_WIDTH, GROUND_HEIGHT);
};



$(document).ready(function() {
    //Initialise app
    console.log("Starting...");
    var container = document.getElementById("WebGL-output");
    var app = new Viewer();
    app.init(container);
    app.createScene();
    //app.createGUI();

    $(document).keydown(function (event) {
        app.onKeyDown(event);
    });

    app.run();
});