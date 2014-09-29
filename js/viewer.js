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

function readLine(text) {
    //Get next line of text
    var cr = text.indexOf('\r');
    if(cr >= 0) {
        return text.substr(0, cr);
    } else {
        return null;
    }
}

function analyseLine(line) {
    //See what data contains

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
    //this.modelLoader = new THREE.JSONLoader();
    this.manager = new THREE.LoadingManager();
    this.manager.onProgress = function ( item, loaded, total ) {

        console.log( item, loaded, total );

    };
    this.modelLoader = new THREE.OBJLoader(this.manager);
    this.filename = '';
    this.loadedModel = null;
    this.debug = true;
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

    if(this.loadedModel != null) {
        if(this.debug) {
            console.log('Model =', this.loadedModel);
            this.debug = false;
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

/*
Viewer.prototype.onSelectFile = function(evt) {
    //Load given json file
    var files = evt.target.files;
    if (files.length == 0) {
        console.log('no file specified');
        this.filename = '';
        return;
    }
    this.filename = files[0].name;
    var _this = this;
    if (this.loadedModel != null) {
        this.scene.remove(this.loadedModel);
    }

    var modelPath = 'models/'+this.filename;
    console.log('Path =', modelPath);
    this.modelLoader.load(modelPath, function (object) {

        //object.position.y = - 80;
        _this.loadedModel = object;
        _this.scene.add(object);
        _this.debug = true;
    });
};
*/

Viewer.prototype.onSelectFile = function(evt) {
    //User selected file
    //See if we support filereader API's
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        //File APIs are supported.
        var files = evt.target.files; // FileList object
        if (files.length == 0) {
            console.log('no file specified');
            this.filename = "";
            return;
        }
        //Clear old data first
        if (this.dataFile) {
            this.reset();
        }
        this.dataFile = files[0];
        this.filename = this.dataFile.name;
        console.log("File chosen", this.filename);

        //Try and read this file
        this.parseFile();
    } else {
        alert('sorry, file apis not supported');
    }
};

Viewer.prototype.parseFile = function() {
    //Attempt to load and parse given json file
    if(!this.filename) return;

    console.log("Reading file...");

    var reader = new FileReader();
    var _this = this;
    reader.onload = function(evt) {
        //File loaded - parse it
        console.log('file read');
        try {
            _this.data = evt.target.result;
            _this.parseMNIFile(_this.data);
        }
        catch (err) {
            console.log('error parsing file', err);
            alert('Sorry, there was a problem reading that file');
            return;
        }
    };

    // Read in the file
    reader.readAsText(this.dataFile, 'ISO-8859-1');
};

Viewer.prototype.parseOBJFile = function(data) {
    //Parse mni obj file
    var first = data.split("\n", 1);
    console.log("First =", first);
};

Viewer.prototype.parseMNIFile = function(contents) {
    //Read file contents
    //Ensure we have polygons
    var line = readLine(contents);
    if(line.charAt(0) != 'P') return;

    line = line.slice(2, line.length-1);
    for(var i=0; i<3; ++i) {
        var value = parseFloat(line);
    }
    while(contents != null) {
        line = readLine(contents);
        if(line) {
            analyseLine(line);
        }
    }
};

$(document).ready(function() {
    //Initialise app
    console.log("Starting...");
    var container = document.getElementById("WebGL-output");
    var app = new Viewer();
    app.init(container);
    app.createScene();
    //app.createGUI();

    //GUI callbacks
    $("#chooseFile").on("change", function(evt) {
        app.onSelectFile(evt);
    });

    /*
    $(document).keydown(function (event) {
        app.onKeyDown(event);
    });
    */
    app.run();
});
