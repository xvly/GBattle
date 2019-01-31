import BaseSprite3D from "../../../LayaCommon/scene/BaseSprite3D";
import MainCamera from "../../../LayaCommon/scene/MainCamera";
import Tween from "../../../LayaCommon/utils/Tween";

export interface CharactorAttr{
    speed:number;
}

export default class MainRole extends BaseSprite3D{
    private attr:CharactorAttr;
    private targetPos:Laya.Vector3;

    constructor(attr:CharactorAttr){
        super();

        this.tempVec3 = new Laya.Vector3();
        this.targetPos = new Laya.Vector3();
        this.attr = attr;
    }

    public onKeyDown(event:Laya.Event){
        let dir = null;

        let camera = MainCamera.camera;
        if (camera == null){
            return;
        }

        switch (event.keyCode){
            // w/up
            case 87:
            case 38:{
                dir = camera.transform.forward;
            }break;
            // s/down
            case 83:
            case 40:{
                dir = camera.transform.forward;
                Laya.Vector3.scale(dir, -1, dir);
            }break;
            // a/left
            case 65:
            case 37:{
                dir = camera.transform.right;
                Laya.Vector3.scale(dir, -1, dir);
            }break;
            // d/right
            case 68:
            case 39:{
                dir = camera.transform.right;
            }break;
        }

        if (dir == null){
            return;
        }

        dir.y = 0;
        
        console.log("!! moveto , dir ", dir);

        Laya.Vector3.normalize(dir, dir);
        let step = this.tempVec3;
        Laya.Vector3.scale(dir, 0.5, step);
        Laya.Vector3.add(
            this.transform.position, 
            step,
            this.targetPos);

        this.moveTo(this.targetPos, 1000/this.attr.speed);
    }

    public update(deltaMs:number){
        if (this.targetPos == null){
            return;
        }
    }   

    public Test(){
        console.log("!! main role test")
    }
}