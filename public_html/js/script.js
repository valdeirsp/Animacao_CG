/*
*	Grupo: 5
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

var animating = false;
var cannonmoved = false;

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

	loadCannon();

}

function animate() {
    requestAnimationFrame( animate );
	render();		
	update();
}

function update() {
	if ( keyboard.pressed("z") && ! animating ) { 
		//collisionDetector();
		console.log('Iniciando a animação');
		animating = true;
		if (cannonmoved == false) {
			cannonmoved = true;
			cannon.position.x -= 115;
		}
		shot();
	}
	
	controls.update();
	//cannonControls.update();
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
       	bullet.rotateZ(-45);
    	bullet.scale.set(100, 100, 100);
    	scene.add( bullet );
    	console.log('Posição da bala: ');
    	console.log(bullet.position);
    });
}

function loadCannon() {

	var cannonLoader = new THREE.JSONLoader();

    cannonLoader.load('model/cannon.json', function ( geometry ) {
    	material = new THREE.MeshPhongMaterial({
        	color: 0x131314,
        	shininess: 100.0,
        	ambient: 0x131314,
        	emissive: 0x111111,
        	specular: 0xbbbbbb
      	});
        
        cannon = new THREE.Mesh( geometry, material );
       
        cannon.position.set(100, -500, -600);
        cannon.rotateY(110);
    	cannon.scale.set(180, 180, 180);
        
    	scene.add( cannon );
       
        //cannonControls = new THREE.OrbitControls( cannon, renderer.domElement );
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
 	console.log('Posição da lua: ');
 	console.log(moon.position);
}

function shot() {

	//Pontos de controle para a curva de bezier
	var start = coord(bullet.position.x, bullet.position.y);
	var end = coord(moon.position.x, moon.position.y);

	var C1 = coord(bullet.position.x, bullet.position.y + 400);
	var C2 = coord(moon.position.x, moon.position.y + 300);

	var stage = 0;
	while (stage < 1) {
		var curpos = getBezier(stage, start, C1, C2, end);

		bullet.position.set(curpos.x, curpos.y, bullet.position.z + (stage * 100));

		stage += 0.2;

		console.log('Stage atual: ');
		console.log(stage);
		console.log(curpos);
		console.log(bullet.position);
	}
	
	animating = false;
}

function collisionDetector() {
	
	if (bullet.position.x == moon.position.x &&
		bullet.position.y == moon.position.y) {
		console.log('Colidiu!!');
	}
}
