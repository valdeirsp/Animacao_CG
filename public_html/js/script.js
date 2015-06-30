/*
*	Grupo: ??
*	script.js
*	21/06/2015
*
*	Seguindo o tutorial de:
*	http://adrianomaciel.ninja/tutoriais/1o-tutorial-pratico-com-three-js
*	http://threejs.org/docs/index.html#Manual/Introduction/Creating_a_scene
*/

/*var anima {
	scene : null,
	camera: null,
	renderer: null
}*/

/* Variáveis básicas para compor uma aplicação com Three.js */
var scene,
	camera,
	renderer;

var controls,
	stats;

// Elemento que conterá o canvas
var container; 

var cubo;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

function init() {
	console.log ("Inicializando");
	debugger;
	/*
	* Preparação da cena
	*/
	scene = new THREE.Scene();
	var WIDTH = window.innerWidth,
		HEIGHT = window.innerHeight;
	
	/*
	* Definindo os parâmetros da câmera
	*/

	//FOV: % de abertura da camera, de 0 .. 100
	var FOV = 100, 
		NEAR = 0.1,
		FAR = 20000;
	camera = new THREE.PerspectiveCamera(FOV, WIDTH / HEIGHT, NEAR, FAR);
	camera.position.set(0,150,400);
	camera.lookAt(scene.position);	
	
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	renderer.setSize(WIDTH, HEIGHT);
	container = document.getElementById( 'animabox' );
	container.appendChild( renderer.domElement );
	
	// EVENTS
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
	
	// CONTROLS
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
	
	// LIGHT
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0,250,0);
	scene.add(light);
        
    //imagem dentro da skybox!
	/*var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -0.5;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);*/
	
	////////////
	// CUSTOM //
	var directions  = ["esquerdo", "direito", "ceu", "solo", "tras", "frente"];
	var imageSuffix = ".png";
	var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );	
	
	var materialArray = [];
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture("./img/" + directions[i] + imageSuffix ),
			side: THREE.BackSide
		}));
	var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
	var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
	scene.add( skyBox );	
}

function animate() {
    requestAnimationFrame( animate );
	render();		
	update();
}

function update() {
	if ( keyboard.pressed("z") ) { 
		// Pode ser disparar a animação!
	}
	
	controls.update();
	stats.update();
}

function render() {
	renderer.render( scene, camera );
}
