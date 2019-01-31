import BaseScene from "./BaseScene";
import Resource from "../resource/Resource";

export interface SceneData{
    url:string,
    // script:any,
    clas:any
}

export default class SceneManager{
    // static sceneMap:
    private static _root:Laya.Sprite;

    public static setup(){
        this._root = new Laya.Sprite();
        Laya.stage.addChild(this._root);
    }
    
    private static _curScene:BaseScene;
    public static get curScene(){
        return this._curScene;
    }

    public static async open(sceneData:SceneData){
        console.log("[scene]open", sceneData);
        try {
            let scene = await Resource.load3D(sceneData.url) as Laya.Scene;
            if (scene == null){
                console.error("[scene]load fail ", sceneData.url);
                return;
            }
            
            let baseScene = scene.addComponent(sceneData.clas) as BaseScene;
            baseScene.sceneNode = scene;

            this._root.addChild(scene);
            return baseScene;
        } catch(e){
            console.error("[scene]load faield", e);
        }
    }
}