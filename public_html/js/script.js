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

var controls;

// Elemento que conterá o canvas
var container; 

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

	loadMoon();
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
}

function render() {
	renderer.render( scene, camera );
}

function loadMoon() {
	//configurando as variáveis da esfera
 	var radius = 50,
 		segments = 16,
 		rings = 16;
 
	//criando o material da esfera, inicialmente será apenas o wireframe
 	var sphereMaterial = new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture('model/texturaLua.jpg'),
        bumpScale: 0.1 });
 
	//criando a esfera
 	var sphere = new THREE.Mesh(
 		new THREE.SphereGeometry(
 			radius,
 			segments,
 			rings
 		),
 		sphereMaterial
 	); 

 	sphere.position.set(300, 1000, 300);
 
	//adicionando a esfera na cena
 	scene.add(sphere);

 	var ambientLight = new THREE.AmbientLight(0xbbbbbb);
    scene.add(ambientLight);
}
