import CameraController from "./CameraController";
import MainCamera from "./MainCamera";

export default class BaseScene extends Laya.Script{
    public sceneNode:Laya.Scene;
    public camera:Laya.Camera;

    public onAwake(){
        if (this.sceneNode != null){
            this.camera = this.sceneNode.getChildByName("Main Camera") as Laya.Camera;
            if (this.camera == null){
                console.error("Not find Main Camera");
                return;
            } else {
                MainCamera.camera = this.camera;
            }
        }
    }

    public addChild(node){
        this.sceneNode.addChild(node);
    }
}