import BaseScene from "../../LayaCommon/scene/BaseScene";
import Resource from "../../LayaCommon/resource/Resource";
import { CharacterRes } from "../common/CommonScene";
import Tween from "../../LayaCommon/utils/Tween";
import MainRole from "./SceneObject/MainRole";
import BaseSprite3D from "../../LayaCommon/scene/BaseSprite3D";
import MainCamera from "../../LayaCommon/scene/MainCamera";

export default class FightScene extends BaseScene{
    public isRunning:boolean;

    private mainRole:MainRole;

    public onAwake(){
        super.onAwake();

        this.createElements();
    }

    private async createPlayer(){
        this.mainRole = new MainRole({
            speed:1
        });
        await this.mainRole.load(CharacterRes.ArcherRed);
        this.mainRole.transform.localScale = new Laya.Vector3(0.3,0.3,0.3);
        this.addChild(this.mainRole);
    }

    public onKeyDown(event:Laya.Event){
        this.mainRole.onKeyDown(event);
    }

    public onMouseUp(event:Laya.Event){

    }

    private async createElements(){
        this.createPlayer();
    }
    
    public gameStart(){
        this.isRunning = true;
    }

    public gameRestart(){
        this.gameStart();
    }

    public gameOver(){
        this.isRunning = false;
    }

    public onUpdate(){
        if (!this.isRunning)
            return;

        let deltaMs = Laya.timer.delta;
        if (deltaMs > 1000){
            deltaMs = 33;
        }

        this.mainRole.update(deltaMs);
    }
}