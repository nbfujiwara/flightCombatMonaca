/// <reference path="../libs/stats.d.ts"/>
/// <reference path="../libs/three.d.ts"/>
/// <reference path="../libs/threeTrackball.js.my.d.ts"/>
/// <reference path="../libs/tween.js.d.ts"/>
/// <reference path="../libs/sparks.js.my.d.ts"/>
//ミサイル打ってみよう
var myLib;
(function (myLib) {
    var Main = (function () {
        function Main() {
            this._pRotZVelocity = 0;
            this._pRotXVelocity = 0;
            this._pSpeed = 80;
            this._missileToggle = false;
            this._keyLeft = false;
            this._keyTop = false;
            this._keyRight = false;
            this._keyBottom = false;
            this._stats = new Stats();
            document.getElementById('stats').appendChild(this._stats.domElement);
            var scene = new THREE.Scene();
            var width = 960;
            var height = 640;
            var fov = 60;
            var aspect = width / height;
            var near = 1;
            var far = 500000;
            var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
            camera.position.set(0, 0, 300);
            //this._controls = new THREE.TrackballControls(camera);
            var renderer = new THREE.WebGLRenderer();
            if (renderer == null) {
                alert('あなたの環境はWebGLは使えません');
            }
            renderer.setSize(width, height);
            document.getElementById('main').appendChild(renderer.domElement);
            this._mainNode = new THREE.Group();
            scene.add(this._mainNode);
            var directionalLight = new THREE.DirectionalLight(0xffffff);
            directionalLight.position.set(0, 0.7, 0.7);
            scene.add(directionalLight);
            this._camera = camera;
            this._scene = scene;
            this._renderer = renderer;
            this._pVelocity = new THREE.Vector3(0, 0, 0.2);
            this._pQuaternion = new THREE.Quaternion();
            this._enemies = [];
            this._missiles = [];
            this._initBackground();
            this._initPlayerAirplane();
            this._initDummyCubes();
        }
        Main.prototype._initBackground = function () {
            var materials = [
                new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('assets/skybox/px.jpg') }),
                new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('assets/skybox/nx.jpg') }),
                new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('assets/skybox/py.jpg') }),
                new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('assets/skybox/ny.jpg') }),
                new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('assets/skybox/pz.jpg') }),
                new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('assets/skybox/nz.jpg') })
            ];
            var mesh = new THREE.Mesh(new THREE.BoxGeometry(200000, 200000, 200000, 7, 7, 7), new THREE.MeshFaceMaterial(materials));
            mesh.scale.x = -1;
            this._scene.add(mesh);
            this._backgroundBox = mesh;
        };
        Main.prototype._initDummyCubes = function () {
            var group = new THREE.Object3D();
            var geometry = new THREE.BoxGeometry(300, 300, 300);
            var material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
            var mesh = new THREE.Mesh(geometry, material);
            var setX = 0;
            var setY = 0;
            var setZ = 0;
            for (var i = 0; i < 5; i++) {
                setX += 1000;
                for (var j = 0; j < 5; j++) {
                    setY += 1000;
                    for (var k = 0; k < 5; k++) {
                        setZ += 1000;
                        var clone = mesh.clone();
                        clone.position.set(setX, setY, setZ);
                        group.add(clone);
                    }
                    setZ = 0;
                }
                setY = 0;
            }
            group.position.set(500, 500, -30000);
            this._scene.add(group);
        };
        Main.prototype._initPlayerAirplane = function () {
            var _this = this;
            var loader = new THREE.JSONLoader();
            loader.load('assets/f14_blender/f14.json', function (geometry, materials) { return _this._onLoadBlenderJson(geometry, materials); }, 'assets/f14_blender/');
        };
        Main.prototype._onLoadBlenderJson = function (geometry, materials) {
            var faceMaterial = new THREE.MeshFaceMaterial(materials);
            var mesh = new THREE.Mesh(geometry, faceMaterial);
            //mesh.position.set( 0,-30,0);
            mesh.scale.set(10, 10, 10);
            mesh.rotateX(-90 * Math.PI / 180);
            this._playerMesh = mesh;
            this._playerAirplane = new THREE.Object3D();
            this._playerAirplane.add(mesh);
            this._playerAirplane.position.set(0, 0, 0);
            this._scene.add(this._playerAirplane);
            this._initEnemyAirplane();
            this._onReady();
        };
        Main.prototype._initEnemyAirplane = function () {
            for (var i = 0; i < 10; i++) {
                var enemy = new EnemyAirplane(this._playerMesh.clone());
                enemy.setSpeed(50);
                enemy.setPosition(Math.random() * 20000 - 10000, Math.random() * 20000 - 10000, Math.random() * 20000 - 10000);
                enemy.setDeltaPitch(Math.random() * 0.4 + 0.4);
                enemy.setQuaternion(new THREE.Quaternion(Math.random(), Math.random(), Math.random(), Math.random()).normalize());
                this._scene.add(enemy.getObject());
                this._enemies.push(enemy);
            }
        };
        Main.prototype.shotMissile = function () {
            console.log('shoooooooooot!');
            var posOffsetX;
            if (this._missileToggle) {
                this._missileToggle = false;
                posOffsetX = 20;
            }
            else {
                this._missileToggle = true;
                posOffsetX = -20;
            }
            var missile = new myLib.Missile(this._pSpeed);
            var obj = missile.getObject();
            var missileVector = (new THREE.Vector3(posOffsetX, -20, 0)).applyQuaternion(this._pQuaternion);
            missileVector.x += this._playerAirplane.position.x;
            missileVector.y += this._playerAirplane.position.y;
            missileVector.z += this._playerAirplane.position.z;
            obj.position.set(missileVector.x, missileVector.y, missileVector.z);
            //obj.position.set(this._playerAirplane.position.x , this._playerAirplane.position.y - 100 , this._playerAirplane.position.z );
            obj.quaternion.copy(this._pQuaternion);
            this._mainNode.add(obj);
            this._missiles.push(missile);
        };
        Main.prototype._onReady = function () {
            var _this = this;
            document.addEventListener('keydown', function (e) { return _this.onDocumentKeyDown(e); }, false);
            document.addEventListener('keyup', function (e) { return _this.onDocumentKeyUp(e); }, false);
            this._tick();
        };
        Main.prototype._tick = function () {
            var _this = this;
            requestAnimationFrame(function () { return _this._tick(); });
            this._pRotZVelocity = this._calculateRotVelocity(this._pRotZVelocity, this._keyLeft, this._keyRight, 2, -2, 0.05, 0.025);
            this._pRotXVelocity = this._calculateRotVelocity(this._pRotXVelocity, this._keyBottom, this._keyTop, 2, -1, 0.05, 0.025);
            this._playerMesh.rotation.y = -this._pRotZVelocity * 5 * Math.PI / 180;
            this._playerMesh.rotation.x = (-90 + this._pRotXVelocity * 5) * Math.PI / 180;
            var quotDeltaZ = new THREE.Quaternion();
            var quotDeltaX = new THREE.Quaternion();
            quotDeltaZ.setFromAxisAngle(new THREE.Vector3(0, 0, 1), this._pRotZVelocity * Math.PI / 180);
            quotDeltaX.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this._pRotXVelocity * Math.PI / 180);
            this._pQuaternion.multiply(quotDeltaZ).multiply(quotDeltaX);
            var moveVector = (new THREE.Vector3(0, 0, -this._pSpeed)).applyQuaternion(this._pQuaternion);
            this._playerAirplane.position.x += moveVector.x;
            this._playerAirplane.position.y += moveVector.y;
            this._playerAirplane.position.z += moveVector.z;
            //機体の回転
            this._playerAirplane.quaternion.copy(this._pQuaternion);
            //カメラの追随
            var cameraDiffVector = new THREE.Vector3(0, 30, 200); //機体からどれだけカメラをずらして追随させるか
            //            var cameraVector:THREE.Vector3 = this._pQuaternion.multiplyVector3(cameraDiffVector); //←動作するけど近々削除されそうらしいので↓に変更
            var cameraVector = cameraDiffVector.applyQuaternion(this._pQuaternion);
            cameraVector.x += this._playerAirplane.position.x;
            cameraVector.y += this._playerAirplane.position.y;
            cameraVector.z += this._playerAirplane.position.z;
            //            this._playerAirplane2.position.set(cameraVector.x , cameraVector.y , cameraVector.z);
            //            this._playerAirplane2.quaternion.set(this._pQuaternion.x ,this._pQuaternion.y , this._pQuaternion.z ,this._pQuaternion.w);
            this._camera.position.set(cameraVector.x, cameraVector.y, cameraVector.z);
            //機体と同じ方向を向かせる
            this._camera.quaternion.copy(this._pQuaternion);
            var i;
            for (i = 0; i < this._enemies.length; i++) {
                this._enemies[i].tick();
            }
            for (i = 0; i < this._missiles.length; i++) {
                this._missiles[i].tick();
            }
            this._renderer.render(this._scene, this._camera);
            this._stats.update();
        };
        Main.prototype._calculateRotVelocity = function (org, plusFlag, minusFlag, plusMax, minusMax, changeDiff, noneDiff) {
            var ret = org;
            if (plusFlag && !minusFlag) {
                if (ret < plusMax) {
                    ret += changeDiff;
                }
                else {
                    ret = plusMax;
                }
            }
            else if (minusFlag && !plusFlag) {
                if (ret > minusMax) {
                    ret -= changeDiff;
                }
                else {
                    ret = minusMax;
                }
            }
            else {
                if (ret < -noneDiff) {
                    ret += noneDiff;
                }
                else if (ret > noneDiff) {
                    ret -= noneDiff;
                }
                else {
                    ret = 0;
                }
            }
            return ret;
        };
        Main.prototype.onDocumentKeyDown = function (e) {
            switch (e.keyCode) {
                case 37:
                    this._keyLeft = true;
                    break;
                case 38:
                    this._keyTop = true;
                    break;
                case 39:
                    this._keyRight = true;
                    break;
                case 40:
                    this._keyBottom = true;
                    break;
            }
        };
        Main.prototype.onDocumentKeyUp = function (e) {
            switch (e.keyCode) {
                case 37:
                    this._keyLeft = false;
                    break;
                case 38:
                    this._keyTop = false;
                    break;
                case 39:
                    this._keyRight = false;
                    break;
                case 40:
                    this._keyBottom = false;
                    break;
                case 81:
                    this.shotMissile();
                    break;
            }
        };
        return Main;
    })();
    myLib.Main = Main;
    var EnemyAirplane = (function () {
        function EnemyAirplane(mesh) {
            this._speed = 1;
            this._quaternion = new THREE.Quaternion();
            this._deltaPitch = 0;
            this._deltaRoll = 0;
            this._node = new THREE.Object3D();
            this._node.add(mesh);
        }
        EnemyAirplane.prototype.setPosition = function (x, y, z) {
            this._node.position.set(x, y, z);
        };
        EnemyAirplane.prototype.setSpeed = function (speed) {
            this._speed = speed;
        };
        EnemyAirplane.prototype.setQuaternion = function (q) {
            this._quaternion.copy(q);
        };
        EnemyAirplane.prototype.setDeltaPitch = function (num) {
            this._deltaPitch = num;
        };
        EnemyAirplane.prototype.setDeltaRoll = function (num) {
            this._deltaRoll = num;
        };
        EnemyAirplane.prototype.getObject = function () {
            return this._node;
        };
        EnemyAirplane.prototype.tick = function () {
            var quotDeltaZ = new THREE.Quaternion();
            var quotDeltaX = new THREE.Quaternion();
            quotDeltaZ.setFromAxisAngle(new THREE.Vector3(0, 0, 1), this._deltaRoll * Math.PI / 180);
            quotDeltaX.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this._deltaPitch * Math.PI / 180);
            this._quaternion.multiply(quotDeltaZ).multiply(quotDeltaX);
            this._node.quaternion.copy(this._quaternion);
            var moveVector = (new THREE.Vector3(0, 0, -this._speed)).applyQuaternion(this._quaternion);
            this._node.position.x += moveVector.x;
            this._node.position.y += moveVector.y;
            this._node.position.z += moveVector.z;
        };
        return EnemyAirplane;
    })();
    myLib.EnemyAirplane = EnemyAirplane;
    var Missile = (function () {
        function Missile(speed) {
            var _this = this;
            this._activeCount = 0;
            this._explodeParticle = null;
            this.ACCELERATE = 2;
            this.FORWARD_FRAME_COUNT = 100; //ミサイルが前進するフレーム数
            this._speed = speed + 10;
            this._pool = new Pool;
            this._particleAttributes = new ParticleAttributes();
            var geometry = new THREE.Geometry();
            for (var i = 0; i < 200; i++) {
                this._particleAttributes.size.value[i] = 100;
                this._particleAttributes.pcolor.value[i] = new THREE.Color(0x111111);
                geometry.vertices.push(new THREE.Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY));
                this._pool.add(i);
            }
            var texture = THREE.ImageUtils.loadTexture('images/particle1.png');
            /*
            var material = new THREE.PointCloudMaterial({
                size: 20, color: 0x111111, blending: THREE.AdditiveBlending,
                transparent: true, depthTest: false, map: texture , sizeAttenuation:true });
*/
            var material = new THREE.ShaderMaterial({
                uniforms: {
                    texture: { type: "t", value: texture }
                },
                attributes: this._particleAttributes,
                vertexShader: document.getElementById('vertexshader').textContent,
                fragmentShader: document.getElementById('fragmentshader').textContent,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                transparent: true
            });
            var particleCloud = new THREE.PointCloud(geometry, material);
            particleCloud.position = new THREE.Vector3(0, 0, 0);
            particleCloud.dynamic = true;
            particleCloud.sortParticles = true;
            this._particleCloud = particleCloud;
            this._particleGeometry = geometry;
            var sparksEmitter = new SPARKS.Emitter(new SPARKS.SteadyCounter(200));
            this._emitterPos = new THREE.Vector3(0, 0, 0);
            sparksEmitter.addInitializer(new SPARKS.Position(new SPARKS.PointZone(this._emitterPos)));
            sparksEmitter.addInitializer(new SPARKS.Lifetime(0.8, 1));
            sparksEmitter.addInitializer(new SPARKS.Target(null, function () { return _this._sparksSetTargetParticle(); }));
            sparksEmitter.addInitializer(new SPARKS.Velocity(new SPARKS.PointZone(new THREE.Vector3(0, 0, -this._speed))));
            sparksEmitter.addAction(new SPARKS.Age());
            //sparksEmitter.addAction( new SPARKS.Accelerate( 0, 0, -50 ) );
            sparksEmitter.addAction(new SPARKS.Move());
            sparksEmitter.addAction(new SPARKS.RandomDrift(300, 300, 300));
            sparksEmitter.addCallback("created", function (p) { return _this._sparksOnParticleCreated(p); });
            sparksEmitter.addCallback("dead", function (p) { return _this._sparksOnParticleDead(p); });
            sparksEmitter.start();
            this._frameCount = 0;
            this._sparksEmitter = sparksEmitter;
            this._mainNode = new THREE.Object3D;
            this._mainNode.add(this._particleCloud);
        }
        Missile.prototype._sparksSetTargetParticle = function () {
            var target = this._pool.get();
            //console.log('set target particle is ' + target);
            if (target) {
                this._activeCount++;
            }
            return target;
        };
        Missile.prototype._sparksOnParticleCreated = function (p) {
            var position = p.position;
            if (p.target) {
                p.target.position = position;
                var target = p.target;
                //                this._emitterPos.y += 0.1;
                this._particleGeometry.vertices[target] = p.position;
            }
        };
        Missile.prototype._sparksOnParticleDead = function (particle) {
            var target = particle.target;
            if (target) {
                this._particleGeometry.vertices[target] = new THREE.Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
                this._activeCount--;
                if (this._frameCount <= this.FORWARD_FRAME_COUNT) {
                    this._pool.add(particle.target);
                }
                else {
                }
                //追加がなくなったあと、すべてがdeadしたら
                if (this._activeCount <= 0) {
                    console.log('missile finish');
                    this._sparksEmitter.stop();
                }
            }
        };
        Missile.prototype.getObject = function () {
            return this._mainNode;
        };
        Missile.prototype.tick = function () {
            this._speed += this.ACCELERATE;
            this._particleCloud.geometry.verticesNeedUpdate = true;
            this._frameCount++;
            if (this._frameCount <= this.FORWARD_FRAME_COUNT) {
                this._emitterPos.z -= this._speed;
            }
            if (this._frameCount == this.FORWARD_FRAME_COUNT) {
                //poolをゼロ件にしてこれ以上出ないようにする
                this._pool.clear();
                var explode = new ExplodeParticle(this._emitterPos.x, this._emitterPos.y, this._emitterPos.z);
                var explodeObj = explode.getObject();
                //explodeObj.position.set(this._emitterPos.x,this._emitterPos.y,this._emitterPos.z);
                this._mainNode.add(explodeObj);
                this._explodeParticle = explode;
            }
            if (this._explodeParticle) {
                this._explodeParticle.tick();
            }
        };
        return Missile;
    })();
    myLib.Missile = Missile;
    var ExplodeParticle = (function () {
        function ExplodeParticle(x, y, z) {
            var _this = this;
            this._activeCount = 0;
            this._isFinish = false;
            this.FORWARD_FRAME_COUNT = 10; //ミサイルが前進するフレーム数
            this._pool = new Pool;
            this._particleAttributes = new ParticleAttributes();
            var geometry = new THREE.Geometry();
            for (var i = 0; i < 3000; i++) {
                this._particleAttributes.size.value[i] = 1000;
                this._particleAttributes.pcolor.value[i] = new THREE.Color(0x993300);
                geometry.vertices.push(new THREE.Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY));
                this._pool.add(i);
            }
            var texture = THREE.ImageUtils.loadTexture('images/particle1.png');
            //            var material = new THREE.PointCloudMaterial({
            //                size: 20, color: 0x993300, blending: THREE.AdditiveBlending,
            //                transparent: true, depthTest: false, map: texture , sizeAttenuation:false });
            var material = new THREE.ShaderMaterial({
                uniforms: {
                    texture: { type: "t", value: texture }
                },
                attributes: this._particleAttributes,
                vertexShader: document.getElementById('vertexshader').textContent,
                fragmentShader: document.getElementById('fragmentshader').textContent,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                transparent: true
            });
            var particleCloud = new THREE.PointCloud(geometry, material);
            particleCloud.dynamic = true;
            particleCloud.sortParticles = false;
            this._particleCloud = particleCloud;
            this._particleGeometry = geometry;
            var sparksEmitter = new SPARKS.Emitter(new SPARKS.SteadyCounter(5000));
            //this._emitterPos = new THREE.Vector3( x, y, z );
            this._emitterPos = new THREE.Vector3(0, 0, 0);
            sparksEmitter.addInitializer(new SPARKS.Position(new SPARKS.PointZone(this._emitterPos)));
            sparksEmitter.addInitializer(new SPARKS.Lifetime(0.5, 0.6));
            sparksEmitter.addInitializer(new SPARKS.Target(null, function () { return _this._sparksSetTargetParticle(); }));
            sparksEmitter.addInitializer(new SPARKS.Velocity(new SPARKS.PointZone(new THREE.Vector3(0, 0, 0))));
            sparksEmitter.addAction(new SPARKS.Age());
            //sparksEmitter.addAction( new SPARKS.Accelerate( 10, 10, 10 ) );
            sparksEmitter.addAction(new SPARKS.Move());
            sparksEmitter.addAction(new SPARKS.RandomDrift(20000, 20000, 20000));
            sparksEmitter.addCallback("created", function (p) { return _this._sparksOnParticleCreated(p); });
            sparksEmitter.addCallback("dead", function (p) { return _this._sparksOnParticleDead(p); });
            sparksEmitter.start();
            this._frameCount = 0;
            this._sparksEmitter = sparksEmitter;
            this._mainNode = new THREE.Object3D;
            this._mainNode.add(this._particleCloud);
            this._mainNode.position.set(x, y, z);
        }
        ExplodeParticle.prototype._sparksSetTargetParticle = function () {
            var target = this._pool.get();
            //console.log('set target particle is ' + target);
            if (target) {
                this._activeCount++;
            }
            return target;
        };
        ExplodeParticle.prototype._sparksOnParticleCreated = function (p) {
            var position = p.position;
            if (p.target) {
                p.target.position = position;
                var target = p.target;
                this._particleGeometry.vertices[target] = p.position;
            }
        };
        ExplodeParticle.prototype._sparksOnParticleDead = function (particle) {
            var target = particle.target;
            if (target) {
                this._particleGeometry.vertices[target] = new THREE.Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
                this._activeCount--;
                if (this._frameCount <= this.FORWARD_FRAME_COUNT) {
                    //もう再利用は打ち止め
                    this._pool.add(particle.target);
                }
                //追加がなくなったあと、すべてがdeadしたら
                if (this._activeCount <= 0) {
                    console.log('explode finish');
                    this._sparksEmitter.stop();
                    this._isFinish = true;
                    this._mainNode.remove(this._particleCloud);
                    this._mainNode.parent.remove(this._mainNode);
                }
            }
        };
        ExplodeParticle.prototype.getObject = function () {
            return this._mainNode;
        };
        ExplodeParticle.prototype.tick = function () {
            if (this._isFinish) {
                return;
            }
            this._particleCloud.geometry.verticesNeedUpdate = true;
            this._particleAttributes.size.needsUpdate = true;
            this._particleAttributes.pcolor.needsUpdate = true;
            this._frameCount++;
            if (this._frameCount == this.FORWARD_FRAME_COUNT) {
                //poolをゼロ件にしてこれ以上出ないようにする
                this._pool.clear();
            }
        };
        return ExplodeParticle;
    })();
    var ParticleAttributes = (function () {
        function ParticleAttributes() {
            this.size = new ParticleAttributesParams('f', []);
            this.pcolor = new ParticleAttributesParams('c', []);
        }
        return ParticleAttributes;
    })();
    var ParticleAttributesParams = (function () {
        function ParticleAttributesParams(t, v) {
            this.type = '';
            this.value = [];
            this.needsUpdate = false;
            this.type = t;
            this.value = v;
        }
        return ParticleAttributesParams;
    })();
    var Pool = (function () {
        function Pool() {
            this.__pools = [];
        }
        Pool.prototype.get = function () {
            if (this.__pools.length > 0) {
                return this.__pools.pop();
            }
            return null;
        };
        Pool.prototype.add = function (v) {
            this.__pools.push(v);
        };
        Pool.prototype.clear = function () {
            this.__pools = [];
        };
        return Pool;
    })();
})(myLib || (myLib = {}));
window.onload = function () {
    new myLib.Main();
};
//# sourceMappingURL=main007.js.map