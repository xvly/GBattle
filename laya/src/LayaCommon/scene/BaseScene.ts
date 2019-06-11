import CameraController from "./CameraController";
import MainCamera from "./MainCamera";

export default class BaseScene extends Laya.Script{
    public config:any;
    public sceneNode:Laya.Sprite;

    public get scene3D(){
        return this.sceneNode as Laya.Scene3D;
    }

    public get scene2D(){
        return this.sceneNode as Laya.View;
    }

    public camera:Laya.Camera;
    public directionLight:Laya.DirectionLight;

    public onAwake(){
        console.log("[scene]on awake");
        if (this.sceneNode != null){
            this.camera = this.sceneNode.getChildByName("Main Camera") as Laya.Camera;
            if (this.camera == null){
                console.error("Not find Main Camera");
                return;
            } else {
                MainCamera.camera = this.camera;
            }

            this.directionLight = this.sceneNode.getChildByName("Directional Light") as Laya.DirectionLight;
        }
    }

    public onEnable(){
        console.log("[scene]on enable")
    }

    public onDestroy(){
        console.log("[scene]on destroy");
    }

    public addChild(node){
        this.sceneNode.addChild(node);
    }
}