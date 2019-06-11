import BaseSprite3D from "./BaseSprite3D";
import Timer from "../utils/Timer";
import Tween from "../utils/Tween";

const _tempVec3:Laya.Vector3 = new Laya.Vector3();

export enum CameraFollowType{
    none,
    back,
}

export interface CameraFollowSetting{
    distance:number;    // 距离
    followType:CameraFollowType;// 跟随方式
    speed?:number;   // 跟随速度，单位s
    yaw?:number;    // 偏航角 （Y）
    pitch?:number;  // 仰角 （X）
    roll?:number;   // 滚转角（Z）
}

export default class CameraController extends Laya.Script{
    public camera:Laya.Camera;
    public target:Laya.Transform3D;
    public followSetting:CameraFollowSetting;

    private tempVec3:Laya.Vector3;
    private tempQuaternion:Laya.Quaternion;

    private targetPos:Laya.Vector3;

    // none type
    private deltaPos:Laya.Vector3;

    private shakeStrength:number;
    private shakeTime:number;
    private shakeGap:number;
    private shakeDuration:number;

    public static inst:CameraController;

    public onAwake(){
        CameraController.inst = this;
        
        this.tempVec3 = new Laya.Vector3();
        this.tempQuaternion = new Laya.Quaternion();

        this.camera = this.owner as Laya.Camera;

        this.targetPos = null;
    }

    /**
     * 
     * @param target 
     * @param sync 是否马上盯住
     */
    public setTarget(target:Laya.Transform3D, sync:boolean = true){
        if (this.owner == null){
            return;
        }

        this.target = target;

        let tranform = (this.owner as Laya.Sprite3D).transform;
        
        Laya.Vector3.scale(tranform.forward, this.followSetting.distance*(-1), this.tempVec3)
        this.deltaPos = this.tempVec3.clone();

        if(sync)
        {
            Laya.Vector3.add(this.target.position, this.deltaPos, this.tempVec3);
            tranform.position = this.tempVec3.clone();
            tranform.lookAt(target.position, Laya.Vector3.Up);
        }
    }

    public setFollowSetting(setting:CameraFollowSetting){
        this.followSetting=setting;

        if (this.target){
            this.follow();
        }
    }

    public onLateUpdate(){
        let deltaMs = Timer.deltaMs;
        this.follow();
        this.updateShake(deltaMs);
    }

    private limitPos(){

    }

    public follow(){
        if(this.target == null) {
            return;
        }

        // calc pos
        switch(this.followSetting.followType){
            case CameraFollowType.none:{
                if (!this.targetPos){
                    this.targetPos = new Laya.Vector3();
                }
                Laya.Vector3.add(this.target.position, this.deltaPos, this.targetPos);
            }break;
        }

        // 
        if (this.targetPos){
            if (this.targetPos.x > 14){
                this.targetPos.x = 14;
            }

            if (this.targetPos.x < -14){
                this.targetPos.x = -14;
            }

            if (this.targetPos.z > 20.4){
                this.targetPos.z = 20.4;
            }

            if (this.targetPos.z < -12){
                this.targetPos.z = -12;
            }

            if (this.shakeStrength){
                this.targetPos.x += this.shakeStrength;
            }

            let tf = (this.owner as Laya.Sprite3D).transform;
            Laya.Vector3.lerp(
                tf.position, this.targetPos, Timer.deltaS*this.followSetting.speed, _tempVec3);
            tf.position = _tempVec3.clone();
        }
    }
    
    public shake(strength:number, frequent:number, duration:number){
        this.shakeStrength = strength;
        this.shakeGap = 1000/frequent;
        this.shakeDuration = duration;
        this.shakeTime = 0;
    }

    public updateShake(deltaMs:number){
        if (this.shakeDuration == null){
            return;
        }

        if (this.shakeDuration < 0){
            this.shakeStrength = null;
            return;
        }

        this.shakeDuration -= deltaMs;
        this.shakeTime += deltaMs;
        if (this.shakeTime > this.shakeGap){
            this.shakeTime = 0;
            this.shakeStrength = -this.shakeStrength;
        }
    }
}