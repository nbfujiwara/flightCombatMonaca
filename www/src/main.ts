/// <reference path="../libs/stats.d.ts"/>
/// <reference path="../libs/three.d.ts"/>
/// <reference path="../libs/threeTrackball.js.my.d.ts"/>
/// <reference path="../libs/tween.js.d.ts"/>
/// <reference path="../libs/sparks.js.my.d.ts"/>



//ミサイル打ってみよう

module myLib
{
    export class Main{
        private _stats:Stats;


        private _camera:THREE.PerspectiveCamera;
        private _scene:THREE.Scene;
        private _renderer:THREE.WebGLRenderer;



        private _pVelocity:THREE.Vector3;
        private _pQuaternion:THREE.Quaternion;

        private _pRotZVelocity:number = 0;
        private _pRotXVelocity:number = 0;
        private _pSpeed:number = 80;
//        private _pSpeed:number = 0;


        private _mainNode:THREE.Group;

        private _playerMesh:THREE.Mesh;
        private _playerAirplane:THREE.Object3D;
        private _enemies:EnemyAirplane[];
        private _missiles:Missile[];
        private _missileToggle:boolean = false;

        private _keyLeft:boolean = false;
        private _keyTop:boolean = false;
        private _keyRight:boolean = false;
        private _keyBottom:boolean = false;


        private _backgroundBox:THREE.Object3D;

        constructor(){
            this._stats = new Stats();
            document.getElementById('stats').appendChild( this._stats.domElement);

            var scene:THREE.Scene = new THREE.Scene();

            var width:number = 960;
            var height:number = 640;
            var fov:number = 60;
            var aspect:number = width/height;
            var near:number = 1;
            var far:number = 500000;
            var camera:THREE.PerspectiveCamera = new THREE.PerspectiveCamera(fov, aspect , near , far);
            camera.position.set(0,0,300);

            //this._controls = new THREE.TrackballControls(camera);

            var renderer:THREE.WebGLRenderer = new THREE.WebGLRenderer();
            if (renderer == null) {
                alert('あなたの環境はWebGLは使えません');
            }

            renderer.setSize( width, height );
            document.getElementById('main').appendChild( renderer.domElement );


            this._mainNode = new THREE.Group();
            scene.add(this._mainNode);


            var directionalLight:THREE.DirectionalLight = new THREE.DirectionalLight( 0xffffff );
            directionalLight.position.set( 0, 0.7, 0.7 );
            scene.add( directionalLight );


            this._camera = camera;
            this._scene = scene;
            this._renderer = renderer;


            this._pVelocity = new THREE.Vector3(0 , 0 , 0.2);
            this._pQuaternion = new THREE.Quaternion();
            this._enemies = [];
            this._missiles = [];


            this._initBackground();
            this._initPlayerAirplane();
            this._initDummyCubes();
        }


        private _initBackground():void
        {
            var materials = [
                new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'assets/skybox/px.jpg' ) } ), // right
                new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'assets/skybox/nx.jpg' ) } ), // left
                new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'assets/skybox/py.jpg' ) } ), // top
                new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'assets/skybox/ny.jpg' ) } ), // bottom
                new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'assets/skybox/pz.jpg' ) } ), // back
                new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'assets/skybox/nz.jpg' ) } )  // front
            ];
            var mesh = new THREE.Mesh( new THREE.BoxGeometry( 200000, 200000, 200000, 7, 7, 7 ), new THREE.MeshFaceMaterial( materials ) );
            mesh.scale.x = - 1;
            this._scene.add(mesh);

            this._backgroundBox = mesh;
        }


        private _initDummyCubes():void
        {

            var group:THREE.Object3D = new THREE.Object3D();
            var geometry = new THREE.BoxGeometry( 300, 300, 300 );
            var material = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
            var mesh = new THREE.Mesh( geometry, material );

            var setX:number = 0;
            var setY:number = 0;
            var setZ:number = 0;

            for(var i:number=0; i< 5; i++){
                setX += 1000;
                for(var j:number=0; j< 5; j++){
                    setY += 1000;
                    for(var k:number=0; k< 5; k++){
                        setZ += 1000;

                        var clone:THREE.Mesh = mesh.clone();
                        clone.position.set(setX,setY,setZ);
                        group.add( clone );
                    }
                    setZ = 0;
                }
                setY = 0;
            }
            group.position.set(500,500,-30000);

            this._scene.add( group );
        }


        private _initPlayerAirplane():void
        {
            var loader:THREE.JSONLoader = new THREE.JSONLoader();
            loader.load('assets/f14_blender/f14.json' , (geometry, materials)=>this._onLoadBlenderJson(geometry, materials) ,'assets/f14_blender/' );
        }
        private _onLoadBlenderJson(geometry, materials):void
        {
            var faceMaterial = new THREE.MeshFaceMaterial( materials );
            var mesh = new THREE.Mesh( geometry, faceMaterial );
            //mesh.position.set( 0,-30,0);
            mesh.scale.set( 10, 10, 10 );
            mesh.rotateX(-90 * Math.PI / 180);

            this._playerMesh = mesh;

            this._playerAirplane = new THREE.Object3D();
            this._playerAirplane.add(mesh);
            this._playerAirplane.position.set( 0,0,0);
            this._scene.add( this._playerAirplane );


            this._initEnemyAirplane();


            this._onReady();
        }

        private _initEnemyAirplane():void
        {


            for(var i=0; i<10; i++){
                var enemy:EnemyAirplane = new EnemyAirplane(this._playerMesh.clone());
                enemy.setSpeed(50);

                enemy.setPosition( Math.random() * 20000 - 10000, Math.random() * 20000 - 10000 , Math.random() * 20000 - 10000);
                enemy.setDeltaPitch(Math.random() * 0.4 + 0.4);
                enemy.setQuaternion( new THREE.Quaternion(Math.random(),Math.random(),Math.random(),Math.random()).normalize() );

                this._scene.add(enemy.getObject());

                this._enemies.push(enemy);
            }

        }




        private shotMissile():void
        {
            console.log('shoooooooooot!');

            var posOffsetX:number;
            if(this._missileToggle){
                this._missileToggle = false;
                posOffsetX = 20;
            }else{
                this._missileToggle = true;
                posOffsetX = -20;
            }

            var missile:Missile = new myLib.Missile( this._pSpeed);

            var obj:THREE.Object3D = missile.getObject();
            var missileVector:THREE.Vector3 = (new THREE.Vector3(posOffsetX,-20,0)).applyQuaternion(this._pQuaternion);
            missileVector.x += this._playerAirplane.position.x;
            missileVector.y += this._playerAirplane.position.y;
            missileVector.z += this._playerAirplane.position.z;
            obj.position.set(missileVector.x , missileVector.y , missileVector.z);

            //obj.position.set(this._playerAirplane.position.x , this._playerAirplane.position.y - 100 , this._playerAirplane.position.z );
            obj.quaternion.copy(this._pQuaternion);
            this._mainNode.add(obj);
            this._missiles.push(missile);
        }

        private _onReady():void
        {
            document.addEventListener( 'keydown', (e)=>this.onDocumentKeyDown(e), false );
            document.addEventListener( 'keyup', (e)=>this.onDocumentKeyUp(e), false );
            this._tick();
        }

        private _tick():void
        {

            requestAnimationFrame( () => this._tick() );


            this._pRotZVelocity = this._calculateRotVelocity(this._pRotZVelocity , this._keyLeft,this._keyRight , 2 , -2 , 0.05 , 0.025);
            this._pRotXVelocity = this._calculateRotVelocity(this._pRotXVelocity , this._keyBottom,this._keyTop , 2 , -1 , 0.05 , 0.025);

            this._playerMesh.rotation.y = - this._pRotZVelocity * 5  * Math.PI / 180;
            this._playerMesh.rotation.x = (- 90 + this._pRotXVelocity * 5)  * Math.PI / 180;

            var quotDeltaZ:THREE.Quaternion = new THREE.Quaternion();
            var quotDeltaX:THREE.Quaternion = new THREE.Quaternion();
            quotDeltaZ.setFromAxisAngle(new THREE.Vector3(0,0,1) , this._pRotZVelocity * Math.PI / 180);
            quotDeltaX.setFromAxisAngle(new THREE.Vector3(1,0,0) , this._pRotXVelocity * Math.PI / 180);
            this._pQuaternion.multiply(quotDeltaZ).multiply(quotDeltaX);


            var moveVector:THREE.Vector3 = (new THREE.Vector3(0, 0, -this._pSpeed)).applyQuaternion(this._pQuaternion);
            this._playerAirplane.position.x += moveVector.x;
            this._playerAirplane.position.y += moveVector.y;
            this._playerAirplane.position.z += moveVector.z;

            //機体の回転
            this._playerAirplane.quaternion.copy(this._pQuaternion);


            //カメラの追随
            var cameraDiffVector = new THREE.Vector3(0,30,200); //機体からどれだけカメラをずらして追随させるか
//            var cameraVector:THREE.Vector3 = this._pQuaternion.multiplyVector3(cameraDiffVector); //←動作するけど近々削除されそうらしいので↓に変更
            var cameraVector:THREE.Vector3 = cameraDiffVector.applyQuaternion(this._pQuaternion);
            cameraVector.x += this._playerAirplane.position.x;
            cameraVector.y += this._playerAirplane.position.y;
            cameraVector.z += this._playerAirplane.position.z;
//            this._playerAirplane2.position.set(cameraVector.x , cameraVector.y , cameraVector.z);
//            this._playerAirplane2.quaternion.set(this._pQuaternion.x ,this._pQuaternion.y , this._pQuaternion.z ,this._pQuaternion.w);
            this._camera.position.set(cameraVector.x , cameraVector.y , cameraVector.z);
            //機体と同じ方向を向かせる
            this._camera.quaternion.copy(this._pQuaternion);

            var i:number;
            for(i=0; i < this._enemies.length; i++){
                this._enemies[i].tick();
            }
            for(i=0; i < this._missiles.length; i++){
                this._missiles[i].tick();
            }

            this._renderer.render( this._scene, this._camera );
            this._stats.update();

        }




        private _calculateRotVelocity(org:number,plusFlag:boolean,minusFlag:boolean , plusMax:number , minusMax:number , changeDiff:number ,noneDiff:number):number
        {
            var ret:number = org;
            if(plusFlag && ! minusFlag){
                if(ret < plusMax){
                    ret += changeDiff;
                }else{
                    ret = plusMax;
                }
            }else if(minusFlag && ! plusFlag){
                if(ret > minusMax){
                    ret -= changeDiff;
                }else{
                    ret = minusMax;
                }
            }else{
                if(ret < -noneDiff) {
                    ret += noneDiff;
                }else if(ret > noneDiff){
                    ret -= noneDiff;
                }else{
                    ret = 0;
                }
            }
            return ret;
        }


        private onDocumentKeyDown(e):void
        {
            //console.log('keyDown=' + e.keyCode);
            switch(e.keyCode){
                case 37 :
                    this._keyLeft = true;
                    break;
                case 38 :
                    this._keyTop = true;
                    break;
                case 39 :
                    this._keyRight = true;
                    break;
                case 40 :
                    this._keyBottom = true;
                    break;
            }
        }
        private onDocumentKeyUp(e):void
        {
            //console.log('keyUp=' + e.keyCode);
            switch(e.keyCode){
                case 37 :
                    this._keyLeft = false;
                    break;
                case 38 :
                    this._keyTop = false;
                    break;
                case 39 :
                    this._keyRight = false;
                    break;
                case 40 :
                    this._keyBottom = false;
                    break;
                case 81 :
                    this.shotMissile();
                    break;
            }

        }


    }
    export class EnemyAirplane{
        private _node:THREE.Object3D;
        private _speed:number = 1;
        private _quaternion:THREE.Quaternion = new THREE.Quaternion();

        private _deltaPitch :number = 0;
        private _deltaRoll :number = 0;


        constructor(mesh:THREE.Mesh){
            this._node = new THREE.Object3D();
            this._node.add(mesh);
        }
        public setPosition(x:number , y:number , z:number):void
        {
            this._node.position.set(x , y , z);
        }
        public setSpeed(speed:number):void
        {
            this._speed = speed;
        }
        public setQuaternion(q:THREE.Quaternion):void
        {
            this._quaternion.copy(q);
        }
        public setDeltaPitch(num:number):void
        {
            this._deltaPitch = num;
        }
        public setDeltaRoll(num:number):void
        {
            this._deltaRoll = num;
        }

        public getObject():THREE.Object3D
        {
            return this._node;
        }


        public tick():void
        {
            var quotDeltaZ:THREE.Quaternion = new THREE.Quaternion();
            var quotDeltaX:THREE.Quaternion = new THREE.Quaternion();
            quotDeltaZ.setFromAxisAngle(new THREE.Vector3(0,0,1) , this._deltaRoll * Math.PI / 180);
            quotDeltaX.setFromAxisAngle(new THREE.Vector3(1,0,0) , this._deltaPitch * Math.PI / 180);
            this._quaternion.multiply(quotDeltaZ).multiply(quotDeltaX);


            this._node.quaternion.copy(this._quaternion);

            var moveVector:THREE.Vector3 = (new THREE.Vector3(0, 0, -this._speed)).applyQuaternion(this._quaternion);
            this._node.position.x += moveVector.x;
            this._node.position.y += moveVector.y;
            this._node.position.z += moveVector.z;
        }
    }


    export class Missile
    {
        private _mainNode:THREE.Object3D;
        private _sparksEmitter:SPARKS.Emitter;
        private _particleCloud:THREE.PointCloud;
        private _emitterPos:THREE.Vector3;
        private _particleGeometry:THREE.Geometry;
        private _particleAttributes:ParticleAttributes;
        private _pool:Pool;

        private _speed:number;
        private _activeCount:number = 0;
        private _frameCount:number;
        private _explodeParticle:ExplodeParticle = null;


        private ACCELERATE:number = 2;

        private FORWARD_FRAME_COUNT = 100; //ミサイルが前進するフレーム数

        constructor( speed){
            this._speed = speed + 10;

            this._pool = new Pool;

            this._particleAttributes = new ParticleAttributes();

            var geometry:THREE.Geometry = new THREE.Geometry();
            for(var i:number = 0 ; i < 200 ; i++) {
                this._particleAttributes.size.value[ i ] = 100;
                this._particleAttributes.pcolor.value[ i ] = new THREE.Color( 0x111111 );
                geometry.vertices.push(new THREE.Vector3(Number.POSITIVE_INFINITY , Number.POSITIVE_INFINITY , Number.POSITIVE_INFINITY));
                this._pool.add(i);
            }
            var texture =THREE.ImageUtils.loadTexture('images/particle1.png');
            /*
            var material = new THREE.PointCloudMaterial({
                size: 20, color: 0x111111, blending: THREE.AdditiveBlending,
                transparent: true, depthTest: false, map: texture , sizeAttenuation:true });
*/


            var material = new THREE.ShaderMaterial( {
                uniforms: {
                    texture:   { type: "t", value: texture }
                },
                attributes: this._particleAttributes,
                vertexShader: document.getElementById( 'vertexshader' ).textContent,
                fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
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


            var sparksEmitter = new SPARKS.Emitter( new SPARKS.SteadyCounter(200)  );
            this._emitterPos = new THREE.Vector3( 0, 0, 0 );
            sparksEmitter.addInitializer( new SPARKS.Position( new SPARKS.PointZone( this._emitterPos ) ) );
            sparksEmitter.addInitializer( new SPARKS.Lifetime( 0.8, 1 ));
            sparksEmitter.addInitializer( new SPARKS.Target( null, ()=>this._sparksSetTargetParticle() ) );
            sparksEmitter.addInitializer( new SPARKS.Velocity( new SPARKS.PointZone( new THREE.Vector3( 0, 0, -this._speed ) ) ) );

            sparksEmitter.addAction( new SPARKS.Age() );
            //sparksEmitter.addAction( new SPARKS.Accelerate( 0, 0, -50 ) );
            sparksEmitter.addAction( new SPARKS.Move() );
            sparksEmitter.addAction( new SPARKS.RandomDrift( 300, 300, 300 ) );

            sparksEmitter.addCallback( "created", (p:any)=>this._sparksOnParticleCreated(p) );
            sparksEmitter.addCallback( "dead", (p:any)=>this._sparksOnParticleDead(p) );
            sparksEmitter.start();

            this._frameCount = 0;
            this._sparksEmitter = sparksEmitter;


            this._mainNode = new THREE.Object3D;
            this._mainNode.add(this._particleCloud);
        }
        private _sparksSetTargetParticle(){
            var target = this._pool.get();
            //console.log('set target particle is ' + target);

            if(target){
                this._activeCount ++;
            }
            return target;
        }
        private _sparksOnParticleCreated(p){
            var position = p.position;
            if ( p.target ) {
                p.target.position = position;
                var target = p.target;
//                this._emitterPos.y += 0.1;
                this._particleGeometry.vertices[ target ] = p.position;

           //     this._rot += 0.2;
           //     this._emitterPos.z = 20 * Math.cos(this._rot * Math.PI / 180);
           //     this._emitterPos.y = 20 * Math.sin(this._rot * Math.PI / 180);
            }
        }
        private _sparksOnParticleDead(particle){
            var target = particle.target;
            if ( target ) {
                this._particleGeometry.vertices[ target ] = new THREE.Vector3(Number.POSITIVE_INFINITY , Number.POSITIVE_INFINITY , Number.POSITIVE_INFINITY);

                this._activeCount --;
                if(this._frameCount <= this.FORWARD_FRAME_COUNT){
                    this._pool.add( particle.target );
                }else{
                    //もう再利用は打ち止め
                }

                //追加がなくなったあと、すべてがdeadしたら
                if(this._activeCount <= 0){
                    console.log('missile finish');
                    this._sparksEmitter.stop();
                }
            }
        }


        public getObject():THREE.Object3D
        {

            return this._mainNode;

        }
        public tick():void
        {
            this._speed += this.ACCELERATE;

            this._particleCloud.geometry.verticesNeedUpdate = true;

            this._frameCount ++;
            if(this._frameCount <= this.FORWARD_FRAME_COUNT){
                this._emitterPos.z -= this._speed
            }
            if(this._frameCount == this.FORWARD_FRAME_COUNT){
                //poolをゼロ件にしてこれ以上出ないようにする
                this._pool.clear();


                var explode:ExplodeParticle = new ExplodeParticle(this._emitterPos.x,this._emitterPos.y,this._emitterPos.z);
                var explodeObj:THREE.Object3D = explode.getObject();
                //explodeObj.position.set(this._emitterPos.x,this._emitterPos.y,this._emitterPos.z);
                this._mainNode.add(explodeObj);
                this._explodeParticle = explode;
            }

           if(this._explodeParticle){
                this._explodeParticle.tick();
            }

        }

    }




    class ExplodeParticle
    {
        private _mainNode:THREE.Object3D;
        private _sparksEmitter:SPARKS.Emitter;
        private _particleCloud:THREE.PointCloud;
        private _emitterPos:THREE.Vector3;
        private _particleGeometry:THREE.Geometry;
        private _particleAttributes:ParticleAttributes;
        private _pool:Pool;

        private _activeCount:number = 0;
        private _frameCount:number;
        private _isFinish:boolean = false;



        private FORWARD_FRAME_COUNT = 10; //ミサイルが前進するフレーム数
        constructor(x:number , y:number , z:number){
            this._pool = new Pool;


            this._particleAttributes = new ParticleAttributes();

            var geometry:THREE.Geometry = new THREE.Geometry();
            for(var i:number = 0 ; i < 3000 ; i++) {
                this._particleAttributes.size.value[ i ] = 1000;
                this._particleAttributes.pcolor.value[ i ] = new THREE.Color( 0x993300 );
                geometry.vertices.push(new THREE.Vector3(Number.POSITIVE_INFINITY , Number.POSITIVE_INFINITY , Number.POSITIVE_INFINITY));
                this._pool.add(i);
            }
            var texture =THREE.ImageUtils.loadTexture('images/particle1.png');

//            var material = new THREE.PointCloudMaterial({
//                size: 20, color: 0x993300, blending: THREE.AdditiveBlending,
//                transparent: true, depthTest: false, map: texture , sizeAttenuation:false });

            var material = new THREE.ShaderMaterial( {
                uniforms: {
                    texture:   { type: "t", value: texture }
                },
                attributes: this._particleAttributes,
                vertexShader: document.getElementById( 'vertexshader' ).textContent,
                fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                transparent: true
            });


            var particleCloud = new THREE.PointCloud(geometry, material);
            particleCloud.dynamic = true;
            particleCloud.sortParticles = false;

            this._particleCloud = particleCloud;
            this._particleGeometry = geometry;


            var sparksEmitter = new SPARKS.Emitter( new SPARKS.SteadyCounter(5000)  );
            //this._emitterPos = new THREE.Vector3( x, y, z );
            this._emitterPos = new THREE.Vector3( 0,0,0 );
            sparksEmitter.addInitializer( new SPARKS.Position( new SPARKS.PointZone( this._emitterPos ) ) );
            sparksEmitter.addInitializer( new SPARKS.Lifetime( 0.5, 0.6 ));
            sparksEmitter.addInitializer( new SPARKS.Target( null, ()=>this._sparksSetTargetParticle() ) );
            sparksEmitter.addInitializer( new SPARKS.Velocity( new SPARKS.PointZone( new THREE.Vector3( 0, 0, 0 ) ) ) );

            sparksEmitter.addAction( new SPARKS.Age() );
            //sparksEmitter.addAction( new SPARKS.Accelerate( 10, 10, 10 ) );
            sparksEmitter.addAction( new SPARKS.Move() );
            sparksEmitter.addAction( new SPARKS.RandomDrift( 20000, 20000, 20000 ) );

            sparksEmitter.addCallback( "created", (p:any)=>this._sparksOnParticleCreated(p) );
            sparksEmitter.addCallback( "dead", (p:any)=>this._sparksOnParticleDead(p) );
            sparksEmitter.start();

            this._frameCount = 0;
            this._sparksEmitter = sparksEmitter;


            this._mainNode = new THREE.Object3D;
            this._mainNode.add(this._particleCloud);
            this._mainNode.position.set(x,y,z);
        }
        private _sparksSetTargetParticle(){
            var target = this._pool.get();
            //console.log('set target particle is ' + target);

            if(target){
                this._activeCount ++;
            }
            return target;
        }
        private _sparksOnParticleCreated(p){
            var position = p.position;
            if ( p.target ) {
                p.target.position = position;
                var target = p.target;
                this._particleGeometry.vertices[ target ] = p.position;
            }
        }

        private _sparksOnParticleDead(particle){
            var target = particle.target;
            if ( target ) {
                this._particleGeometry.vertices[ target ] = new THREE.Vector3(Number.POSITIVE_INFINITY , Number.POSITIVE_INFINITY , Number.POSITIVE_INFINITY);

                this._activeCount --;
                if(this._frameCount <= this.FORWARD_FRAME_COUNT){
                    //もう再利用は打ち止め
                    this._pool.add( particle.target );
                }

                //追加がなくなったあと、すべてがdeadしたら
                if(this._activeCount <= 0){
                    console.log('explode finish');
                    this._sparksEmitter.stop();
                    this._isFinish = true;
                    this._mainNode.remove(this._particleCloud);
                    this._mainNode.parent.remove(this._mainNode);
                }
            }
        }


        public getObject():THREE.Object3D
        {

            return this._mainNode;

        }
        public tick():void
        {
            if(this._isFinish){
                return;
            }
            this._particleCloud.geometry.verticesNeedUpdate = true;
            this._particleAttributes.size.needsUpdate = true;
            this._particleAttributes.pcolor.needsUpdate = true;


            this._frameCount ++;
            if(this._frameCount == this.FORWARD_FRAME_COUNT){
                //poolをゼロ件にしてこれ以上出ないようにする
                this._pool.clear();
            }
        }

    }

    class ParticleAttributes
    {
        public size:ParticleAttributesParams;
        public pcolor:ParticleAttributesParams;
        constructor(){
            this.size = new ParticleAttributesParams('f' , []);
            this.pcolor = new ParticleAttributesParams('c' , []);
        }
    }
    class ParticleAttributesParams
    {
        public type:string = '';
        public value:any[] = [];
        public needsUpdate:boolean = false;
        constructor(t,v){
            this.type = t;
            this.value = v;
        }
    }
    class Pool {
        private __pools = [];
        public get(){
            if ( this.__pools.length > 0 ) {
                return this.__pools.pop();
            }
            return null;
        }
        public add( v ){
            this.__pools.push(v);
        }
        public clear(){
            this.__pools = [];
        }
    }
}


window.onload = function ()
{
    new myLib.Main();
};