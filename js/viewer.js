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

function readLine(text, fileHead) {
    //Get next line of text
    var offset = fileHead != undefined ? fileHead : 0;
    var index = text.indexOf('\r', offset);
    if(index >= 0) {
        return text.substr(offset, index-offset);
    } else {
        return null;
    }
}

function readVerts(line) {
    var point = parseFloat(line);
    if(isNaN(point)) return null;

    var index = line.indexOf(' ');
    if(index >= 0) {
        ++index;
        line = line.substr(index, line.length-index);
    }

    return point;
}

function readIndices(line) {
    var index = parseInt(line);
    if(isNaN(index)) return null;

    return index;
}

function skipSpaces(line) {
    //Get value up to next space
    //2nd space if first char is space
    var offset = line.charAt(0) == ' ' ? 1 : 0;
    var index = line.indexOf(' ', offset);
    if(index >= 0) {
        ++index;
        return line.substr(index, line.length-index);
    }

    return null;
}

function analyseLine(line) {
    //See what data contains

}

function get_blob() {
    return window.Blob;
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
    var fileHead = 0;
    var fileLength = contents.length;
    var line = readLine(contents);
    fileHead += (line.length + 2);

    if(line.charAt(0) != 'P') return;

    line = line.slice(2, line.length);
    //Get colour data
    var colours = [];
    for(var i=0; i<3; ++i) {
        var colour = parseFloat(line);
        colours.push(colour);
        line = line.slice(4, line.length);
    }

    var specular = parseInt(line);
    line = line.slice(3, line.length);

    var alpha = parseInt(line);
    line = line.slice(2, line.length);

    var numVerts = parseInt(line);

    var vertices = [];
    var point;
    for(var i=0; i<numVerts; ++i) {
        line = readLine(contents, fileHead);
        if(line == null) {
            console.log('Bad vertex');
            continue;
        }
        if(line.length == 0) {
            console.log('No vertex');
            continue;
        }
        fileHead += (line.length + 2);
        if(line) {
            for(var j=0; j<3; ++j) {
                point = readVerts(line);
                if(point == null) {
                    console.log('bad vertex in line');
                }
                vertices.push(point);
                line = skipSpaces(line);
            }
        }
    }

    line = readLine(contents, fileHead);
    fileHead += (line.length + 2);

    var normals = [];
    var lineNumber = 0
    for(var i=0; i<numVerts; ++i) {
        line = readLine(contents, fileHead);
        ++lineNumber;
        if(line == null) {
            console.log('Bad normal');
            continue;
        }
        fileHead += (line.length + 2);
        if(line.length == 0) {
            console.log('No normal line=', lineNumber);
            continue;
        }
        if(line) {
            for(var j=0; j<3; ++j) {
                point = readVerts(line);
                if(point == null) {
                    console.log('Bad normal in line');
                }
                normals.push(point);
                line = skipSpaces(line);
            }
        }
    }

    //Get num polygons
    line = readLine(contents, fileHead);
    fileHead += (line.length + 2);
    line = readLine(contents, fileHead);
    fileHead += (line.length + 2);
    var numPolygons = parseInt(line);
    if(isNaN(numPolygons)) numPolygons = 0;

    console.log('Polygons =', numPolygons);

    line = readLine(contents, fileHead);
    fileHead += (line.length + 2);

    line = readLine(contents, fileHead);
    fileHead += (line.length + 2);

    //Indices
    var lineNumber = 0;
    var indices = [];
    for(var i=0; i<61440; ++i) {
        line = readLine(contents, fileHead);
        ++lineNumber;
        if(line == null) {
            console.log('Bad index line =', lineNumber);
            continue;
        }
        fileHead += (line.length + 2);
        if(line.length == 0){
            console.log('No index line =', lineNumber);
            continue;
        }

        for(var j=0; j<8; ++j) {
            var index = readIndices(line);
            if(index == null) {
                console.log('Bad index in line');
            }
            indices.push(index);
            line = skipSpaces(line);
        }
    }

    console.log('Verts =', vertices.length, 'Normals =', normals.length, 'Indices =', indices.length);

    //Set up geometry
    var geom = new THREE.BufferGeometry();
    var geomMat = new THREE.MeshLambertMaterial( {color: 0xababab});
    geom.addAttribute('index', new THREE.BufferAttribute( new Uint32Array(indices), 1));
    geom.addAttribute('position', new THREE.BufferAttribute( new Float32Array(vertices), 3));
    geom.addAttribute('normal', new THREE.BufferAttribute( new Float32Array(normals), 3));
    geom.computeBoundingSphere();
    //geom.offsets = [ {start: 0, count: 360000, index: 0}];

    var mesh = new THREE.Mesh(geom, geomMat);

    this.scene.add(mesh);

    //Write out to obj format
    var testVerts = [];
    testVerts.push(0.1, 0.2, 0.3);

    var fh = fopen("./test.obj", 3); // Open the file for writing

    if(fh!=-1) // If the file has been successfully opened
    {
        var str = "Some text goes here...";
        fwrite(fh, str); // Write the string to a file
        fclose(fh); // Close the file
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
