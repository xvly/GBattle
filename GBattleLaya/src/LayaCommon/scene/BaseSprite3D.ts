import Resource from "../resource/Resource";
import Tween from "../utils/Tween";

export default class BaseSprite3D extends Laya.MeshSprite3D{
    public inst:Laya.Sprite3D;
    protected tempVec3:Laya.Vector3;
    protected tempQuaternion:Laya.Quaternion;

    constructor(
        urlOrPrefab?:string|Laya.Sprite3D, 
        parent?:Laya.Node,
        localPosition?: Laya.Vector3, 
        localRotation?: Laya.Quaternion,
        name?:string){
        super();

        this.tempVec3 = new Laya.Vector3();
        this.tempQuaternion = new Laya.Quaternion();

        if (parent != null){
            parent.addChild(this);
        }

        if (urlOrPrefab != null){
            if (urlOrPrefab instanceof Laya.Sprite3D){
                this.doInstantiate(urlOrPrefab, this, localPosition, localRotation);
            } else {
                this.load(urlOrPrefab);
            }
        }

        if (localPosition != null){
            this.transform.localPosition = localPosition;
        }
        
        if (localRotation != null){
            this.transform.localRotation = localRotation;
        }
    }

    public async load(url){
        let prefab = await Resource.load3D(url) as Laya.Sprite3D;
        this.event("onloaded", prefab);
        this.doInstantiate(prefab, this);
    }

    private doInstantiate(
        origin:Laya.Sprite3D, 
        parent?:Laya.Node,
        position?: Laya.Vector3, 
        rotation?: Laya.Quaternion){

        this.inst = Laya.Sprite3D.instantiate(origin, this, false, position, rotation);

        // TEMP
        this.inst.transform.localRotationEulerY = 180;

        console.log("!! inst forward ", this.inst.transform.forward, this.transform.forward);

        this.addChild(this.inst);
    }

    public moveTo(pos:Laya.Vector3, duration:number){
        console.log("!! moveto ", this.transform.forward, this.transform.position, pos, duration)

        // let dir = this.tempVec3;
        // Laya.Vector3.subtract(pos, this.transform.position, dir);

        Laya.Quaternion.lookAt(pos,this.transform.position,  Laya.Vector3.Up, this.tempQuaternion);
        // this.transform.rotation = this.tempQuaternion;

        Tween.transformTranslate(this.transform, {x:pos.x, z:pos.z}, duration);
        // Tween.transformRotationTo(this.transform, {x:this.tempQuaternion.x, y:this.tempQuaternion.y, z:this.tempQuaternion.z, w:this.tempQuaternion.w}, 300);

        this.transform.lookAt(pos, Laya.Vector3.Up, false);
        // this.transform.rotation = this.tempQuaternion;
    }

    public update(deltaMs:number){

    }
}