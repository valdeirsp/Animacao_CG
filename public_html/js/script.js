/*
*	Grupo: ??
*	Membros: Gabriela de Jesus Martins 489689
			 Valdeir Soares Perozim	   489786
			 Vinnícius Ferreira
*
*	script.js
*	21/06/2015
*
*	Seguindo os tutoriais de:
*	http://adrianomaciel.ninja/tutoriais/1o-tutorial-pratico-com-three-js
*	http://threejs.org/docs/index.html#Manual/Introduction/Creating_a_scene
*/

/* Variáveis básicas para compor uma aplicação com Three.js */
var scene,
	camera,
	renderer;

var bullet,
	cannon,
	moon;

var controls, cannonControls;

// Elemento que conterá o canvas
var container; 

var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

function init() {
	console.log ("Inicializando");

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
	camera.position.set(100, 100, 500);
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
	
	/* Instala os controles da câmera, permitindo navegar na cena */
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	
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
	
	/*
	* Adiciona o skybox na cena
	*/
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

	/*
	* Luz ambiente para a cena
	*/
	var ambientLight = new THREE.AmbientLight(0xbbbbbb);
    scene.add(ambientLight);

	/*
	* Carrega e define a bala
	*/
	debugger;
	loadBullet();
	
	/*
	* Carrega e define a lua
	*/
	loadMoon();


	//loadCannon();

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
	cannonControls.update();
}

function render() {
	renderer.render( scene, camera );
}

function loadBullet() {

	var bulletLoader = new THREE.JSONLoader();

    // load a resource
    bulletLoader.load('model/bullet.json', function ( geometry ) {
    	var material = new THREE.MeshBasicMaterial({
    		map: THREE.ImageUtils.loadTexture('model/bulletTexture.jpg')
    	});
        
        bullet = new THREE.Mesh( geometry, material );
       	bullet.position.set(1000, -500, -600);
    	bullet.scale.set(100, 100, 100);
    	scene.add( bullet );
    });
}

function loadCannon() {

	var cannonLoader = new THREE.JSONLoader();
	var cannon;

    cannonLoader.load('model/cannon.json', function ( geometry ) {
    	var material = new THREE.MeshBasicMaterial();
        
        cannon = new THREE.Mesh( geometry, material );

        cannon.position.set(-500, -500, -50);
    	cannon.scale.set(180, 180, 180);
    	scene.add( cannon );
    	cannonControls = new THREE.OrbitControls( cannon, renderer.domElement );
    });
}

function loadMoon() {
	//configurando as variáveis da esfera
 	var radius = 150,
 		segments = 16,
 		rings = 16;
 
 	var sphereMaterial = new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture('model/texturaLua.jpg'),
        bumpScale: 0.1 
    });
 
	//criando a esfera
 	moon = new THREE.Mesh(
 		new THREE.SphereGeometry(
 			radius,
 			segments,
 			rings
 		),
 		sphereMaterial
 	); 
 	
 	moon.position.set(700, 1800, 900);
	//adicionando a esfera na cena
 	scene.add(moon);
}
