import Resource from "../resource/Resource";
import Utils from "../utils/Utils";
import Timer from "../utils/Timer";
import MathUtils from "../utils/MathUtils";

const _tempVec3:Laya.Vector3 = new Laya.Vector3();
const _tempRot:Laya.Quaternion = new Laya.Quaternion();

export default class BaseSprite3D extends Laya.Sprite3D{
    public inst:Laya.Sprite3D;
    protected tempVec3:Laya.Vector3;
    protected tempQuaternion:Laya.Quaternion;

    public isMoving:boolean;
    private shouldLookDown: boolean = true;
    private _manualComponents:Laya.Script[];

    protected _pos:Laya.Vector3;
    protected _rot:Laya.Quaternion;
    protected _isLateUpdateTransform:boolean;

    constructor(){
        super();

        this._pos = this.transform.position.clone();
        this._rot = this.transform.rotation.clone();

        this.tempVec3 = new Laya.Vector3();
        this.tempQuaternion = new Laya.Quaternion();
        this.isMoving = false;

        this._manualComponents = [];
    }
    
    private _destination:Laya.Vector3;
    public set destination(value:Laya.Vector3){
        this._destination = value;
    } 

    public get destination(){
        return this._destination;
    }

    // protected destination:Laya.Vector3;
    protected targetEulerY:number;

    protected destinationTarget:BaseSprite3D;

    protected translateDuration:number;     // 剩余时长
    protected translateDurationSum:number;  // 总时长
    protected rotateDuration:number;

    protected translateSpd:Laya.Vector3;
    protected rotateSpd:number;

    private yASpeed:number;

    public moveTo(
        pos:Laya.Vector3, 
        translateDuration:number, 
        rotateDuration?:number,
        ySpeed?:number,
        shouldLookDown?:number,
        complete?:Laya.Handler){

        (rotateDuration == null) && (rotateDuration = 0);
        (shouldLookDown == null) && (shouldLookDown = 1);

        if (this.isMoving == false){
            this.isMoving = true;
            this.onMoveStart();
        }

        // console.info("!! moveto ", this["userName"], this.position.elements, pos.elements);

        this.moveComplete = complete;
        
        this.shouldLookDown = shouldLookDown ? true : false;

        this.translateDuration = translateDuration;
        this.translateDurationSum = translateDuration;

        this.rotateDuration = rotateDuration;

        // 
        this.destination = pos.clone();
        Laya.Vector3.subtract(pos, this.position, this.tempVec3);
        Laya.Vector3.scale(this.tempVec3, 1/translateDuration, this.tempVec3);
        this.translateSpd = this.tempVec3.clone();
        if (ySpeed != null){
            this.translateSpd.y = ySpeed;
            this.yASpeed = (-ySpeed)/(translateDuration/2);
        }

        // rotation
        if (rotateDuration == null || rotateDuration <= 0){
            this.lookAt(this.destination);
            // this.transform.lookAt(this.destination, Laya.Vector3.Up)
            this.targetEulerY = null; // flag
            this.rotateSpd = 0;
        } else {
            // todo: 还有问题
            // Laya.Quaternion.lookAt(this.position, pos,  Laya.Vector3.Up, this.tempQuaternion);
            // this.tempQuaternion.invert(this.tempQuaternion);
            // this.tempQuaternion.getYawPitchRoll(this.tempVec3);
            // let localRotationEulerY = MathUtils.radinToAgnle(this.tempVec3.x) % 360;
            // this.targetEulerY = localRotationEulerY;
            // let deltaY = (localRotationEulerY - this.rotationEuler.y) % 360;
            // if (Math.abs(deltaY) > 180){
            //     if (deltaY > 0){
            //         this.rotationEuler.y += 360;
            //     } else {
            //         this.rotationEuler.y -= 360;
            //     }
            // }
            // this.rotateSpd = (localRotationEulerY - this.rotationEuler.y)/rotateDuration;
        }
    }

    public stopMove(){
        if (this.isMoving == false){
            return;
        }
        this.isMoving = false;
        this.destination = null;
        this.destinationTarget = null;
        this.targetEulerY = null;
        this.onMoveEnd();

        if (this.moveComplete){
            this.moveComplete.run();
        }
    }

    private destinationSrcPos:Laya.Vector3;
    private moveComplete:Laya.Handler;
    
    public moveToTarget(tf:BaseSprite3D, translateDuration:number, rotateDuration:number=300, complete?:Laya.Handler){
        if (this.isMoving == false){
            this.isMoving = true;
            this.onMoveStart();
        } 
        
        this.destinationTarget = tf;
        
        this.destinationSrcPos = this.position;
        this.translateDuration = translateDuration;

        this.translateDurationSum = translateDuration;

        this.moveComplete = complete;

        // todo
        // this.rotateDuration = rotateDuration;
    }

    protected onMoveStart(){}

    protected onMoveEnd(){}

    protected onMoving(){}

    protected moveUpdate(deltaMs:number){
        if (this.transform == null){
            return;
        }
        // rotate
        // if (this.targetEulerY != null){
        //     this.rotationEuler.y += this.rotateSpd*deltaMs;
        //     this.rotateDuration -= deltaMs;
        //     if (this.rotateDuration <= 0){
        //         this.rotationEuler.y = this.targetEulerY;
        //         this.targetEulerY = null;
        //     }
        // }

        // translate
        if (this.destination != null){ // 移动到目标点
            this.translateDuration -= deltaMs;
            if (this.translateDuration <= 0){
                this.position = this.destination.clone();
                // console.log("!! pos ", this["userName"], this.transform.position.elements);
                this.yASpeed = null;
                this.stopMove();
            } else {
                if (this.yASpeed){
                    if (this.position.y > 0){
                        this.translateSpd.y += this.yASpeed*deltaMs;
                    } else {
                        this.translateSpd.y = 0;
                    }
                }
                
                Laya.Vector3.scale(this.translateSpd, deltaMs, this.tempVec3);
                Laya.Vector3.add(this.position, this.tempVec3, this.tempVec3);

                if (this.yASpeed && this.shouldLookDown) {
                    this.transform.lookAt(this.tempVec3, Laya.Vector3.Up);
                }
                
                this.position = this.tempVec3.clone();
                // console.log("!! pos ", this["userName"], this.transform.position.elements);
                this.onMoving();
            }
        } else if (this.destinationTarget != null){ // 移动到目标对象，跟随
            this.translateDuration -= deltaMs;
            if (this.translateDuration <= 0){
                this.position = this.destinationTarget.position.clone();
                // console.log("!! pos ", this["userName"], this.transform.position.elements);
                this.stopMove();
            } else {
                Laya.Vector3.lerp(
                    this.destinationSrcPos, 
                    this.destinationTarget.position, 
                    (this.translateDurationSum-this.translateDuration)/this.translateDurationSum,
                    this.tempVec3);
                this.position = this.tempVec3.clone();
                // console.log("!! pos ", this["userName"], this.transform.position.elements);
                this.onMoving();
            }
        }
    }

    public onUpdate(deltaMs:number){
        this.moveUpdate(deltaMs);

        for (let i=this._manualComponents.length-1; i>=0; i--){
            let component = this._manualComponents[i];
            if (component.destroyed){
                this._manualComponents.splice(i, 1);
                continue;
            }
            component["onManualUpdate"](deltaMs);
        }
    }

    public onLateUpdate(deltaMs?:number){
        if (this.transform == null){
            return;
        }

        if (this._isLateUpdateTransform){
            let spd = deltaMs/50;

            if (this.transform.position != this._pos){
                if (Laya.Vector3.distanceSquared(this.transform.position, this._pos) > 4){
                    
                    this.transform.position = this._pos.clone();
                } else {
                    Laya.Vector3.lerp(
                        this.transform.position, this._pos, spd, _tempVec3);
                    this.transform.position = _tempVec3.clone();
                }
                
            }
            
            if (this.transform.rotation != this._rot){
                Laya.Quaternion.lerp(
                    this.transform.rotation, this._rot, spd, _tempRot);
                this.transform.rotation = _tempRot.clone();
            }
        }
        
    }

    public addComponentIntance(inst:any){
        super.addComponentIntance(inst);

        if (inst["onManualUpdate"] != null){
            this._manualComponents.push(inst);
        }
    }

    public addComponent(clas:any){
        let inst = super.addComponent(clas);

        if (inst["onManualUpdate"] != null){
            this._manualComponents.push(inst);
        }

        return inst;
    }

    //
    public setPosition(value:Laya.Vector3, syncAtOnce:boolean = false){
        if (syncAtOnce){
            this.transform.position = value;
        }
        this.position = value;
    }

    public set position(value:Laya.Vector3){
        if (this._isLateUpdateTransform){
            this._pos = value;

            if (Laya.Vector3.distanceSquared(this.transform.position, this._pos) >4){
                // console.warn("!! force set ", this["userName"], this.transform.position.elements, this._pos.elements);
                this.transform.position = this._pos.clone();
            }
        } else {
            this.transform.position = value;
        }
    }

    public get position(){
        if (this._isLateUpdateTransform){
            return this._pos;
        } else {
            return this.transform.position;
        }
    }
    
    public setRotation(value:Laya.Quaternion, syncAtOnce:boolean = false){
        if (this._isLateUpdateTransform){
            this._rot = value;
            if (syncAtOnce){
                this.transform.rotation = value;
            }
        } else {
            this.transform.rotation = value;
        }
    }

    public lookAt(target:Laya.Vector3){
        if (this._isLateUpdateTransform){
            var targetE=target.elements;
            var eyeE;
            var worldPosition=this.position;
            eyeE=worldPosition.elements;
            if (Math.abs(eyeE[0]-targetE[0])< Laya.MathUtils3D.zeroTolerance && Math.abs(eyeE[1]-targetE[1])< Laya.MathUtils3D.zeroTolerance && Math.abs(eyeE[2]-targetE[2])< Laya.MathUtils3D.zeroTolerance)
                return;
            Laya.Quaternion.lookAt(worldPosition,target, Laya.Vector3.Up ,this._rot);
            this._rot.invert(this._rot);
        } else {
            this.transform.lookAt(target, Laya.Vector3.Up);
        }
    }

    public set rotation(value:Laya.Quaternion){
        if (this._isLateUpdateTransform){
            this._rot = value;
        } else {
            this.transform.rotation = value;
        }
    }

    public get rotation(){
        if (this._isLateUpdateTransform){
            return this._rot;
        } else {
            return this.transform.rotation;
        }
    }

    private _rotationEuler:Laya.Vector3;
    public get rotationEuler(){
        if (this._isLateUpdateTransform){
            if (this._rotationEuler == null){
                this._rotationEuler = new Laya.Vector3();
            }
    
            this._rot.getYawPitchRoll(_tempVec3);
            let eulerElement = this._rotationEuler.elements;
            eulerElement[0] = _tempVec3.elements[1];
            eulerElement[1] = _tempVec3.elements[0];
            eulerElement[2] = _tempVec3.elements[2];
            return this._rotationEuler;
        } else {
            return this.transform.rotationEuler;
        }
    }

    public set rotationEuler(value:Laya.Vector3){
        if (this._isLateUpdateTransform){
            Laya.Quaternion.createFromYawPitchRoll(
                MathUtils.angleToRandin(value.y),
                MathUtils.angleToRandin(value.x),
                MathUtils.angleToRandin(value.z),
                this._rot
            );
        } else {
            this.transform.rotationEuler = value;
        }
    }

    public set rotationEulerY(value:number){
        if (this._isLateUpdateTransform){
            this.rotationEuler.elements[1] = value;
        } else {
            this.transform.localRotationEulerY = value;
        }
    }

    public get rotationEulerY(){
        if (this._isLateUpdateTransform){
            return this.rotationEuler.y;
        } else {
            return this.transform.localRotationEulerY;
        }
    }

    private _matrix:Laya.Matrix4x4;
    private _forward:Laya.Vector3;
    public get forward(){
        if (this._isLateUpdateTransform){
            if (this._matrix == null){
                this._matrix = new Laya.Matrix4x4();
            }
    
            if (this._forward == null){
                this._forward = new Laya.Vector3();
            }
    
            Laya.Matrix4x4.createAffineTransformation(
                this._pos,
                this._rot,
                this.transform.scale, 
                this._matrix);
            var worldMatElem=this._matrix.elements;
            this._forward.elements[0]=-worldMatElem[8];
            this._forward.elements[1]=-worldMatElem[9];
            this._forward.elements[2]=-worldMatElem[10];
            return this._forward;
        } else {
            return this.transform.forward;
        }
    }
}