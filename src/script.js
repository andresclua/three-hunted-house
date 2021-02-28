import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'



class HauntedHouse{
    constructor(){

        this.scene = new THREE.Scene();
        this.sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        this.canvas = document.querySelector('canvas.webgl');
        this.init()
    }

    init(){
        
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias:true

        })
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setClearColor('#6b7ba0')
        this.renderer.shadowMap.enabled = true;

        this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 100)
        this.camera.position.x = 4
        this.camera.position.y = 2
        this.camera.position.z = 5
        this.scene.add(this.camera)

        // Controls
        this.controls = new OrbitControls(this.camera, this.canvas)
        this.controls.enableDamping = true

        /**
         * Lights
         */
        const gui = new dat.GUI()
        const ambientLight = new THREE.AmbientLight('#ffffff', 0.2)
        gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
        this.scene.add(ambientLight)

        const fog = new THREE.Fog('#6b7ba0',6,15);
        this.scene.fog = fog;

        this.textureloader = new THREE.TextureLoader()

  
        this.addObjects();
        
        this.clock = new THREE.Clock()
        this.animate()
    }
    addObjects(){
        
        const grassColorTexture = this.textureloader.load('/textures/grass/color.jpg');
        grassColorTexture.repeat.set(8, 8)
        grassColorTexture.wrapS = THREE.RepeatWrapping
        grassColorTexture.wrapT = THREE.RepeatWrapping

        // Floor
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(40, 40),
            new THREE.MeshStandardMaterial({ 
                map: grassColorTexture,
               
            })
        )
        
        floor.rotation.x = - Math.PI * 0.5
        floor.position.y = 0
        floor.receiveShadow = true;
        this.scene.add(floor)

        // House container
        this.buildHouse()
        this.buildGraves()
        this.gohsts()
   
    }
    gohsts(){

        this.ghostGreen= new THREE.PointLight('#00ff00', 3, 3)
        this.ghostGreen.position.set(4, 2, 0)
        this.ghostGreen.castShadow = true;
        this.scene.add(this.ghostGreen)


        this.ghostRed = new THREE.PointLight('#ff0000', 1, 3)
        this.ghostRed.position.set(-4, 2, 0);
        this.ghostRed.castShadow = true;
        this.scene.add(this.ghostRed)
    }
    buildGraves(){
        const graves = new THREE.Group()
        this.scene.add(graves);
        const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
        const graveMaterial = new THREE.MeshStandardMaterial({ color: '#b2b6b1' });

        for(let i = 0; i < 50; i++)
        {
            const angle = Math.random() * Math.PI * 2 // Random angle
            const radius = 4 + Math.random() * 4      // Random radius
            const x = Math.cos(angle) * radius;     // Get the x position using cosinus
            const z = Math.sin(angle) * radius;       // Get the z position using sinus

            // Create the mesh
            const grave = new THREE.Mesh(graveGeometry, graveMaterial)
            grave.castShadow = true;

            // Position
            grave.position.set(x, 0.4, z)                              

            // Rotation
            grave.rotation.z = (Math.random() - 0.5) * 0.4
            grave.rotation.y = (Math.random() - 0.5) * 0.4

            // Add to the graves container
            graves.add(grave)
        }

    }
    buildHouse(){
        const house = new THREE.Group()
        this.scene.add(house)


        const bricksColorTexture = this.textureloader.load('/textures/bricks2/color.jpg')
        const bricksAmbientOcclusionTexture = this.textureloader.load('/textures/bricks2/ambientOcclusion.jpg')
        const bricksNormalTexture = this.textureloader.load('/textures/bricks2/normal.jpg')
        const bricksRoughnessTexture = this.textureloader.load('/textures/bricks2/roughness.jpg')

        const walls = new THREE.Mesh(
            new THREE.BoxGeometry(4, 2.5, 4),
            new THREE.MeshStandardMaterial({ 
                map: bricksColorTexture,
                aoMap: bricksAmbientOcclusionTexture,
                normalMap: bricksNormalTexture,
                roughnessMap: bricksRoughnessTexture
            })
        )
        walls.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2))
        walls.position.y = 1.25
        walls.castShadow = true;
        house.add(walls)

        const roofColorTexture = this.textureloader.load('/textures/roof/color.jpg')
        roofColorTexture.repeat.set(8, 8)
        roofColorTexture.wrapS = THREE.RepeatWrapping
        roofColorTexture.wrapT = THREE.RepeatWrapping
        const roofAmbientOcclusionTexture = this.textureloader.load('/textures/roof/ambientoclussion.jpg')
        roofAmbientOcclusionTexture.repeat.set(8, 8)
        roofAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping
        roofAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping
        const roofNormalTexture = this.textureloader.load('/textures/roof/normal.jpg')
        roofNormalTexture.wrapS = THREE.RepeatWrapping
        roofNormalTexture.wrapT = THREE.RepeatWrapping
        roofNormalTexture.repeat.set(8, 8)
        // const bricksRoughnessTexture = this.textureloader.load('/textures/bricks2/roughness.jpg')

        // Roof
        const roof = new THREE.Mesh(
            new THREE.ConeGeometry(3.5, 1, 4),
            new THREE.MeshStandardMaterial({ 
                map: roofColorTexture,
                aoMap: roofAmbientOcclusionTexture,
                normalMap: roofNormalTexture,
            })
        )
        roof.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(roof.geometry.attributes.uv.array, 2))

        roof.rotation.y = Math.PI * 0.25
        roof.position.y = 2.5 + 0.5
        house.add(roof)

        
        const doorColorTexture = this.textureloader.load('./textures/door/color.jpg')
        const doorAlphaTexture = this.textureloader.load('/textures/door/alpha.jpg')
        const doorAmbientOcclusionTexture = this.textureloader.load('/textures/door/ambientOcclusion.jpg')
        const doorHeightTexture = this.textureloader.load('/textures/door/height.jpg')
        const doorNormalTexture = this.textureloader.load('/textures/door/normal.jpg')
        const doorMetalnessTexture = this.textureloader.load('/textures/door/metalness.jpg')
        const doorRoughnessTexture = this.textureloader.load('/textures/door/roughness.jpg')

        // Door
        const door = new THREE.Mesh(
            new THREE.PlaneGeometry(2.2, 2.2,100,100),
            new THREE.MeshStandardMaterial({
                map: doorColorTexture,
                transparent: true,
                alphaMap: doorAlphaTexture,
                aoMap: doorAmbientOcclusionTexture,
                displacementMap: doorHeightTexture,
                displacementScale: 0.1,
                normalMap: doorNormalTexture,
                metalnessMap: doorMetalnessTexture,
                roughnessMap: doorRoughnessTexture
            })
        )
        door.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2))
        door.position.y = 1;
        door.position.z = 2 + 0.01; //0.01 asi se despliega
        house.add(door)

        const doorLight = new THREE.PointLight('#ff7d46', 1, 7)
        doorLight.position.set(0, 2.2, 2.7)
        doorLight.castShadow = true;
        house.add(doorLight)
        


        // Bushes
        const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
        const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })

        const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
        bush1.scale.set(0.5, 0.5, 0.5)
        bush1.castShadow = true;
        bush1.position.set(0.8, 0.2, 2.2)

        const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
        bush2.scale.set(0.25, 0.25, 0.25)
        bush2.castShadow = true;
        bush2.position.set(1.4, 0.1, 2.1)

        const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
        bush3.scale.set(0.4, 0.4, 0.4)
        bush3.castShadow = true;
        bush3.position.set(- 0.8, 0.1, 2.2)

        const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
        bush4.scale.set(0.15, 0.15, 0.15)
        bush4.castShadow = true;
        bush4.position.set(- 1, 0.05, 2.6)

        house.add(bush1, bush2, bush3, bush4)

    }
    animate(){
        const elapsedTime = this.clock.getElapsedTime()

        let angle = elapsedTime * 0.5;
        this.ghostGreen.position.x = Math.sin(angle) * 10;
        this.ghostGreen.position.z = Math.cos(angle) * 10;
        this.ghostGreen.position.y = 1 + Math.sin(elapsedTime);

        this.camera.position.x = 3 + Math.sin(angle)*3;


        this.ghostRed.position.x = Math.sin( angle) * 5;
        this.ghostRed.position.z = Math.cos( angle) * 5;

        // Update controls
        this.controls.update()

        // Render
        this.renderer.render(this.scene, this.camera)

        // Call tick again on the next frame
        window.requestAnimationFrame(()=>{this.animate()})
    }
}
export default HauntedHouse;
new HauntedHouse();
