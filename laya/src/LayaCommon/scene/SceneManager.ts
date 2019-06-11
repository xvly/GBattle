import BaseScene from "./BaseScene";
import Resource from "../resource/Resource";
import Pool from "./Pool";
import { ViewFlyword } from "../view/ViewFlyword";
import ViewManager from "../view/ViewManager";
import Timer from "../utils/Timer";
import GlobalEvent from "../utils/GlobalEvent";

export enum SceneType{
    twod,
    threed
}

export const SceneEvent = {
    clear:"sceneManagerClear"
}

export default class SceneManager{
    private static root:Laya.Sprite;

    public static curScene:BaseScene;

    private static _isChanging:boolean;
    private static _isNeedSwitchToLogin:boolean;

    public static setup(){
        this.root = new Laya.Sprite();
        this.root.name = "scene manager";
        this.root.zOrder = 0;
        Laya.stage.addChild(this.root);
        this._isChanging = false;
    }

    public static onDisconnect(){
        if (this._isChanging){
            this._isNeedSwitchToLogin = true;
        }
    }

    public static async open(
        clas:any, 
        url:string,
        type:SceneType, 
        preloads?:string[],
        isComplieShader=false){

        this._isChanging = true;

        // clear
        GlobalEvent.event(SceneEvent.clear);

        if (this.curScene != null){
            this.curScene.owner.destroy();
            this.curScene = null;
        }

        try {
            // empty scene
            let scene:Laya.Sprite;
            if (url == null || url == ""){
                scene = new Laya.Sprite();    
            } else {
                if (type == SceneType.threed){ // 3d scene
                    scene = await Resource.load3D(url) as Laya.Scene3D;
                    if (scene == null){
                        console.error("[scene]open scene failed, url = ", url);
                        return;
                    }
                } else { // 2d scene
                     scene = await Resource.load(url);
                     if (scene == null){
                        console.error("[scene]open scene failed, url = ", url);
                        return;
                    }
                }
            }
            
            let baseScene = scene.addComponent(clas) as BaseScene;
            baseScene.sceneNode = scene;
            this.root.addChild(scene);

            this.curScene = baseScene;

            if (preloads){
                let loadedCount = 0;
                for (let url of preloads){
                    try {
                        if (Resource.is3DUrl(url)){
                            await Resource.load3D(url, 
                                null, null, null, null, null, 0, true, 
                                isComplieShader);
                        } else {
                            await Resource.load(url);
                        }
                    } catch (err) {
                        console.error("[scene] load asset failed, error: ", err);
                    }

                    loadedCount++;
                }
            }

            this._isChanging = false;
            return baseScene;
        } catch(e){
            console.error("[scene]load faield", e);
        }
    }
}