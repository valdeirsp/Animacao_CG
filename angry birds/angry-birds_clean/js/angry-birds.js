var AngryBirds = AngryBirds || {};

var $ = $ || function (id) {
    return document.getElementById(id)
};

(function (AngryBirds) {
    "use strict";

    AngryBirds.Texture = {
        BULLET: THREE.ImageUtils.loadTexture('image/bullet.jpg'),
        BOARD: THREE.ImageUtils.loadTexture('image/launcher.jpg'),
        POST: THREE.ImageUtils.loadTexture('image/post.jpg'),
        LEATHER: THREE.ImageUtils.loadTexture('image/leather.png'),
        get GRASS() {
            if (!this._GRASS) {
                this._GRASS = THREE.ImageUtils.loadTexture('image/grass_grass_0100_02_preview.jpg');
                this._GRASS.wrapS = THREE.RepeatWrapping;
                this._GRASS.wrapT = THREE.RepeatWrapping;
                this._GRASS.repeat.set(100, 100);
            }
            return this._GRASS;
        }
    };

    AngryBirds.Color = {
        FIXED: 0x660000,
        STONE: 0x999999
    };

    AngryBirds.GameMode = {
        TITLE: 0,
        SIGHT_SETTING: 1,
        FLYING: 2,
        LANDING: 3
    };

    AngryBirds.ViewMode = {
        BULLETVIEW: 1,
        SIDEVIEW: 2
    };

    AngryBirds.Setting = function (density) {
        this.density = density || 2;
        this.waitingTimeToReshot = 8000;
    };

    AngryBirds.Stage = function () {
        this.game = null;
        this.index = 0;
    };

    AngryBirds.Stage.prototype = {
        constructor: AngryBirds.Stage,
        createBox: function (size, position, opts) {
            opts = opts || {};
            opts.receiveShadow = true;
            if (!opts.mass && !opts.fixed) {
                opts.mass = size.width * size.height * size.depth * this.game.setting.density;
            }
            var box = new C3.Box(size.width, size.height, size.depth, opts);
            box.position.copy(position);
            return box;
        },
        //APAGAR APÓS ADICIONAR A LUA
        createBoard: function (size, position, opts) {
            opts = opts || {};
            if (!opts.map && !opts.color)
                opts.map = AngryBirds.Texture.BOARD;
            return this.createBox(size, position, opts);
        },
        destructFromFrom: function (world) {
            this.bodies.forEach(function (body) {
                world.bodies.splice(world.bodies.indexOf(body), 1);
                world.cannonWorld.remove(body.cannonBody);
                world.threeScene.remove(body.threeMesh);
            });
        },
    };

    AngryBirds.Game = function (opts) {
        if (!opts.stages)
            throw 'stages is the mandatory option.';
        this.stages = opts.stages;
        this.stages.forEach(function (stage, index) {
            stage.game = this;
            stage.index = index;
        }, this);
        this.currentStageNo = 0;
        this.setting = new AngryBirds.Setting(opts.density);
        this.setGameMode(AngryBirds.GameMode.TITLE);
        this.setViewMode(AngryBirds.ViewMode.SIDEVIEW);
        this.world = null;
        this.skybox = null;
        this.launcher = null;
        this.ground = null;
        this.bullet = null;
        this.bulletStartPosition = new THREE.Vector3(0, 5, 3);
        this.tracks = [];

        this.isBulletDragging = false;
        this.isWorldDragging = false;
        this.dragStartMousePosition = null;
        this.projector = new THREE.Projector();
//        this.nextStageTimer = null;
    };

    AngryBirds.Game.prototype = {
        constructor: AngryBirds.Game,
        construct: function () {
            this.world = new C3.World();
            this.world.addDirectionalLight(0xffffff);
            this.world.addAmbientLight(0x666666);
            this.world.fog = new THREE.FogExp2(0xccccff, 0.007);

            // lens flare
            this.world.threeScene.add(this.createLensFlare());

            // skybox
            this.skybox = this.createSkybox();
            this.world.threeScene.add(this.skybox);

            // ground
            this.ground = new C3.Ground({map: AngryBirds.Texture.GRASS});
            this.world.add(this.ground);

            // launcher
            this.launcher = this.createSlingshotMesh();
            this.world.threeScene.add(this.launcher);

            // bullet
            this.bullet = this.createBullet();
            this.bullet.position.copy(this.bulletStartPosition);
            this.bullet.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
            this.world.add(this.bullet);

            this.constructStage();
        },
        //cria o efeito de refração
        createLensFlare: function () {
            var textureFlare0 = THREE.ImageUtils.loadTexture('image/lensflare0.png');
            var textureFlare2 = THREE.ImageUtils.loadTexture('image/lensflare2.png');
            var textureFlare3 = THREE.ImageUtils.loadTexture('image/lensflare3.png');
            var flareColor = new THREE.Color(0xffccdd);
            var lensFlare = new THREE.LensFlare(textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor);
            lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
            lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
            lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
            lensFlare.add(textureFlare3, 60, 0.6, THREE.AdditiveBlending);
            lensFlare.add(textureFlare3, 70, 0.7, THREE.AdditiveBlending);
            lensFlare.add(textureFlare3, 120, 0.9, THREE.AdditiveBlending);
            lensFlare.add(textureFlare3, 70, 1.0, THREE.AdditiveBlending);
            lensFlare.position = new THREE.Vector3(-50, 200, -100);
            return lensFlare;
        },
//cria um skybox usando um cubo ao inves de uma esfera
        createSkybox: function () {
            var urls = [
                'image/cube01.jpg',
                'image/cube02.jpg',
                'image/cube03.jpg',
                'image/cube04.jpg',
                'image/cube05.jpg',
                'image/cube06.jpg'
            ];

            var cubemap = THREE.ImageUtils.loadTextureCube(urls); // load textures
            cubemap.format = THREE.RGBFormat;

            var shader = THREE.ShaderLib['cube']; // init cube shader from built-in lib
            shader.uniforms['tCube'].value = cubemap; // apply textures to shader

            var skyBoxMaterial = new THREE.ShaderMaterial({
                fragmentShader: shader.fragmentShader,
                vertexShader: shader.vertexShader,
                uniforms: shader.uniforms,
                depthWrite: false,
                side: THREE.BackSide
            });

            return new THREE.Mesh(
                    new THREE.CubeGeometry(300, 300, 300),
                    skyBoxMaterial
                    );
        },
        
        createBullet: function (world) {
            var bullet = new C3.Sphere(0.5, {
                mass: 1.1,
                angularDamping: 0.8,
                threeMaterial: new THREE.MeshPhongMaterial({
                    map: AngryBirds.Texture.BULLET,
                    ambient: 0x999999,
                    transparent: true,
                    blending: THREE.NormalBlending//,
//        depthTest:false
                }),
                cannonMaterial: this.world.cannonWorld.defaultMaterial
            });
            return bullet;
        },
//carrega o cenario da fase atual
        constructStage: function () {
            var stage = this.getCurrentStage();
            stage.constructOn(this.world);
//            stage.setupEventListeners();
        },
        //cria o lançador.
        createSlingshotMesh: function () {
            var launcherGeometry = new THREE.Geometry();
            var barGeometry = new THREE.CylinderGeometry(0.4, 0.4, 15, 10);
            var bar = new THREE.Mesh(barGeometry);
            bar.position.set(0, 2.5 / 2, 0);

            THREE.GeometryUtils.merge(launcherGeometry, bar);
            var launcher = new THREE.Mesh(launcherGeometry, new THREE.MeshPhongMaterial({
                map: AngryBirds.Texture.BOARD,
                transparent: true,
                blending: THREE.NormalBlending
            }));
            launcher.castShadow = true;
            return launcher;
        },
//adiciona um tracejado marcando o caminho que o ultimo passaro fez
        addTrack: function () {
            var radius = 0.05 + 0.025 * Math.random();
            var sphereGeometry = new THREE.SphereGeometry(radius, 3, 3);
            var sphereMaterial = new THREE.MeshLambertMaterial({
                color: 0xffffff,
                blending: THREE.AdditiveBlending,
                transparent: true
            });
            var sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphereMesh.position.copy(this.bullet.threeMesh.position);
            this.world.threeScene.add(sphereMesh);

            this.tracks.push(sphereMesh);
        },
//limpa o caminho do ultimo passaro
        removeTracks: function () {
            this.tracks.forEach(function (track) {
                this.world.threeScene.remove(track);
            }.bind(this));
            this.tracks = [];
        },
        setGameMode: function (gameMode) {
            this.gameMode = gameMode;
            var header = document.getElementsByTagName('header')[0];
            var toolbar = $('toolbar');

            if (0 <= [AngryBirds.GameMode.SIGHT_SETTING, AngryBirds.GameMode.FLYING, AngryBirds.GameMode.LANDING].indexOf(this.gameMode) /*&& !this.isSmartphone*/ /*TODO*/) {
                header.className = 'show';
                toolbar.className = 'show';
            }
            else {
                header.className = 'hide';
                toolbar.className = 'hide';
            }
        },
//define se vai usar visão lateral ou a visão do passaro
        setViewMode: function (viewMode) {
            this.viewMode = viewMode;
            var elm = $('viewpoint-button-label');
            if (elm) {
                if (this.viewMode === AngryBirds.ViewMode.BULLETVIEW) {
                    elm.textContent = 'Bullet View';
                }
                else if (this.viewMode === AngryBirds.ViewMode.SIDEVIEW) {
                    elm.textContent = 'Side View';
                }
            }
        },
//movimenta "a camera"dentro do skybox
        dragWorld: function (event) {
            event.preventDefault();
            var dx = this.dragStartMousePosition.x - event.clientX;
            var dy = this.dragStartMousePosition.y - event.clientY;
            this.dragStartMousePosition = new THREE.Vector3(event.clientX, event.clientY, 0);

            var yAxis = new THREE.Vector3(0, 1, 0);
            var yawAngle = -dx / 5000 * Math.PI;
            var yawMatrix = new THREE.Matrix4().makeRotationAxis(yAxis, yawAngle);
            var xAxis = new THREE.Vector3(1, 0, 0);
            var pitchAngle = dy / 5000 * Math.PI;
            var pitchMatrix = new THREE.Matrix4().makeRotationAxis(xAxis, pitchAngle);
            var backupCameraDirection = new THREE.Vector3().copy(this.cameraDirection);
            this.cameraDirection.applyMatrix4(yawMatrix);
            this.cameraDirection.applyMatrix4(pitchMatrix);
            if (this.cameraDirection.z < 2.3) {
                this.cameraDirection.copy(backupCameraDirection);
                return;
            }
            this.world.threeCamera.position.copy(new THREE.Vector3().copy(this.bullet.threeMesh.position));
            this.world.threeCamera.lookAt(this.bullet.threeMesh.position);
        },
//arrasta o passaro
        dragBullet: function (event) {
            event.preventDefault();
            var currentMousePosition = new THREE.Vector3(event.clientX, event.clientY, 0);
            var dist = this.dragStartMousePosition.distanceTo(currentMousePosition);
            if (0.4 < dist)
                dist = 0.4;

            this.bullet.position.set(
                    this.bulletStartPosition.x - this.cameraDirection.x * dist,
                    this.bulletStartPosition.y - this.cameraDirection.y * dist,
                    this.bulletStartPosition.z - this.cameraDirection.z * dist
                    );
            return dist;
        },
        shot: function (impulseScalar) {
            this.removeTracks();

            var impulseDir = new CANNON.Vec3(this.cameraDirection.x, this.cameraDirection.y, this.cameraDirection.z);
            impulseDir.normalize();
            var impulse = impulseDir.mult(impulseScalar);
            this.bullet.applyImpulse(impulse, this.bullet.cannonBody.position);
            this.world.isStopped = false;
            this.setGameMode(AngryBirds.GameMode.FLYING);
        },
        getCurrentStage: function () {
            return this.stages[this.currentStageNo];
        },
        // TODO
        clearStage: function (stage) {
            this.removeTracks();
            this.setGameMode(AngryBirds.GameMode.CLEAR_STAGE);
            var nextStageIndex = stage.index + 1;
        },
        //quando segura o mouse
        mouseDownListener: function (event) {
            if (this.gameMode != AngryBirds.GameMode.SIGHT_SETTING)
                return;

            this.dragStartMousePosition = new THREE.Vector3(event.clientX, event.clientY, 0);
            var vector = new THREE.Vector3(
                    (event.clientX / window.innerWidth) * 2 - 1,
                    -(event.clientY / window.innerHeight) * 2 + 1,
                    0.5
                    );
            var camera = this.world.threeCamera;
            this.projector.unprojectVector(vector, camera);
            var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
            var intersects = ray.intersectObjects([this.bullet.threeMesh]);

            if (0 < intersects.length) {
                this.isBulletDragging = true;
                this.isWorldDragging = false;
            }
            else {
                this.isBulletDragging = false;
                if (this.viewMode == AngryBirds.ViewMode.BULLETVIEW) {
                    this.isWorldDragging = true;
                }
            }
        },
        //quando move o o mouse segurando o botão
        mouseMoveListener: function (event) {
            if (this.gameMode != AngryBirds.GameMode.SIGHT_SETTING)
                return;

            if (this.isBulletDragging) {
                this.dragBullet(event);
            }
            else if (this.isWorldDragging) {
                this.dragWorld(event);
            }
        },
        //quando solta o mouse
        mouseUpListener: function (event) {
            if (this.gameMode != AngryBirds.GameMode.SIGHT_SETTING)
                return;

            if (this.isBulletDragging) {
                this.isBulletDragging = false;
                var dist = this.dragBullet(event);

                var f = dist * 4000;
                var dt = 1 / 60;
                if (f < 600) {
                    this.ready();
                }
                else {
                    this.shot(f * dt);
                }
            }
            else if (this.isWorldDragging) {
                this.isWorldDragging = false;
            }
        },
        keyPressListener: function (event) {
            if (event.charCode === 13) { // enter
                if (this.gameMode === AngryBirds.GameMode.TITLE) {
                    document.getElementById('title').className = 'hide';
                    this.setGameMode(AngryBirds.GameMode.SIGHT_SETTING);
                }
                else if (this.gameMode === AngryBirds.GameMode.FLYING
                        || this.gameMode === AngryBirds.GameMode.CLEAR_STAGE) {
                    // ignore
                }
                else if (this.world.isStopped) {
                    this.restartGame();
                }
                else {
                    this.world.stop();
                    this.ready();
                }
            }
            else if (event.charCode === 32) { // space
                if (this.viewMode === AngryBirds.ViewMode.BULLETVIEW) {
                    this.setViewMode(AngryBirds.ViewMode.SIDEVIEW);
                }
                else if (this.viewMode === AngryBirds.ViewMode.SIDEVIEW) {
                    this.setViewMode(AngryBirds.ViewMode.BULLETVIEW);
                }
            }
            else if (event.charCode === 112) { // 'p'
                this.togglePause();
            }
        },
        setupEventListeners: function () {
            document.addEventListener('mousedown', this.mouseDownListener.bind(this));
            document.addEventListener('mousemove', this.mouseMoveListener.bind(this));
            document.addEventListener('mouseup', this.mouseUpListener.bind(this));
            document.addEventListener('keypress', this.keyPressListener.bind(this));
            $('start-button').addEventListener('click', function (event) {
                $('title').className = 'hide';
                this.setGameMode(AngryBirds.GameMode.SIGHT_SETTING);
            }.bind(this));

            $('viewpoint-button').addEventListener('click', function (event) {
                $('viewpoint-button').blur();
                if (this.viewMode === AngryBirds.ViewMode.BULLETVIEW) {
                    this.setViewMode(AngryBirds.ViewMode.SIDEVIEW);
                }
                else if (this.viewMode === AngryBirds.ViewMode.SIDEVIEW) {
                    this.setViewMode(AngryBirds.ViewMode.BULLETVIEW);
                }
            }.bind(this));

//reiniciar animação
            $('next-shot-button').addEventListener('click', function (event) {
                $('next-shot-button').blur();
                this.world.stop();
                this.ready();
            }.bind(this));

        },
        ready: function () {
            this.setGameMode(AngryBirds.GameMode.SIGHT_SETTING);
            this.setViewMode(AngryBirds.ViewMode.BULLETVIEW);
            this.isBulletDragging = false;
            this.isWorldDragging = false;
            this.bullet.cannonBody.velocity.set(0, 0, 0);
            this.bullet.position.copy(this.bulletStartPosition);
            this.bullet.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
            this.cameraDirection = new THREE.Vector3(0, 0, 5);
            this.world.threeCamera.position.copy(new THREE.Vector3().copy(this.bullet.threeMesh.position).sub(this.cameraDirection));
            this.world.threeCamera.lookAt(this.bullet.threeMesh.position);
            this.launcher.lookAt(new THREE.Vector3(0,-1, 1).add(this.launcher.position));
        },
        start: function (isRestart) {
            this.construct();
            this.setupEventListeners();
            this.ready();
            this.setGameMode(AngryBirds.GameMode.TITLE);
            var step = 1;
            //constroi o mundo
            this.world.start(1 / 24, function () {
                //mundo da pagina inicial
                if (this.gameMode === AngryBirds.GameMode.TITLE) {
                    step += 1;
                    var angle = step * 180 / Math.PI / 5000;
                    var radius = 12 + 2 * Math.sin(angle / 3);
                    this.world.threeCamera.position.set(0 + radius * Math.cos(angle), 20 + radius * Math.cos(angle * 2), 15 + radius * Math.sin(angle));
                    this.world.threeCamera.lookAt(new THREE.Vector3(0, 10, 60));
                }
                //mundo com a camera no passaro
                else if (this.viewMode === AngryBirds.ViewMode.BULLETVIEW) {
                    this.bullet.threeMesh.material.opacity = 0.5;

//                    if (this.gameMode === AngryBirds.GameMode.SIGHT_SETTING) {
                        this.launcher.material.opacity = 0.5;
                        var behindBullet = 
                                new THREE.Vector3().copy(this.bullet.threeMesh.position).sub(this.cameraDirection);
                        this.world.threeCamera.position.copy(behindBullet);
                        this.world.threeCamera.lookAt(new THREE.Vector3(0, 30, 50));
//                    }
                }
                //mundo com a camera na lateral
                else if (this.viewMode === AngryBirds.ViewMode.SIDEVIEW) {
                    this.bullet.threeMesh.material.opacity = 1;
                    
                    this.launcher.material.opacity = 1;
                    this.world.threeCamera.position.set(-35, 15 , 25);
                    this.world.threeCamera.lookAt(new THREE.Vector3(5,15, 30));
                };
                
                //se o passaro estiver voando já vai traçando o caminho que ele fez
                if (this.gameMode === AngryBirds.GameMode.FLYING) {
                    this.addTrack();
                }

            }.bind(this));

            this.world.stop();
        }
    };

    AngryBirds.Game.start = function (opts) {
        var game = new AngryBirds.Game(opts || {});
        game.start();
    };

}).call(this, AngryBirds);