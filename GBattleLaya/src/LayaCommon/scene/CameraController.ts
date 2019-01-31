export enum CameraFollowType{
    back
}

export interface CameraFollowSetting{
    distance:number;
    yaw?:number;    // 偏航角 （Y）
    pitch?:number;  // 仰角 （X）
    roll?:number;   // 滚转角（Z）
    speed:number;
    followType:CameraFollowType;
}

export default class CameraController extends Laya.Script{
    public camera:Laya.Camera;
    public target:Laya.Transform3D;
    public followSetting:CameraFollowSetting;

    public setFollowSetting(setting:CameraFollowSetting){
        this.followSetting=setting;

        if (this.target)
            this.follow();
    }

    private deltaPos;

    public setTarget(target:Laya.Transform3D){
        this.target = target;

        this.deltaPos = new Laya.Vector3();
        Laya.Vector3.subtract(
            this.camera.transform.position, 
            this.target.position, 
            this.deltaPos);

        if (this.followSetting)
            this.follow();
    }

    onAwake(){
        // this.camera = this.owner as Laya.Camera;
    }

    onUpdate(){
        this.follow();
    }

    follow(){
        if(this.target == null) return;

        // let targetPos = this.target.position;

        // let cameraTargetPos = new Laya.Vector3();

        // switch(this.followSetting.followType){
        //     case CameraFollowType.back:{
        //         // let rot = new Laya.Quaternion();
        //         // Laya.Quaternion.createFromYawPitchRoll(
        //         //     this.followSetting.yaw || 0,
        //         //     this.followSetting.pitch || 0,
        //         //     this.followSetting.roll || 0,
        //         //     rot
        //         // );
                
        //         // let targetForward = this.target.forward;
        //         // Laya.Vector3.scale(targetForward, -1, targetForward);
        //         // let cameraDirection = new Laya.Vector3();
        //         // Laya.Vector3.transformQuat(targetForward, rot, cameraDirection);

        //         // let cameraDistance = new Laya.Vector3();
        //         // Laya.Vector3.scale(cameraDirection, this.followSetting.distance, cameraDistance);

        //         // Laya.Vector3.add(
        //         //     targetPos, 
        //         //     cameraDistance,
        //         //     cameraTargetPos);

        //         let targetPos = new Laya.Vector3();

        //         let dir = new Laya.Vector3();
        //         Laya.Vector3.normalize(this.deltaPos, dir);

        //         let dis = Laya.Vector3.scalarLength(this.deltaPos);

        //         Laya.Vector3.transformQuat(
        //             dir,
        //             this.target.rotation,
        //             dir
        //         );

        //         let disV3=new Laya.Vector3();
        //         Laya.Vector3.scale(dir, dis, disV3);

        //         Laya.Vector3.add(
        //             this.target.position, 
        //             disV3   ,
        //             targetPos);
        //         this.camera.transform.position = targetPos;

        //         this.camera.transform.localRotationEulerY = this.target.localRotationEulerY;
        //         console.log("!! rotation Y ", this.camera.transform.localRotationEulerY)

        //         // console.log("!! rotation begin ", this.camera.transform.rotation);
        //         // Laya.Quaternion.lookAt(
        //         //     this.camera.transform.position,
        //         //     this.target.position,
        //         //     Laya.Vector3.Up,
        //         //     this.camera.transform.rotation);
        //         // console.log("!! rotation after ", this.camera.transform.rotation);
        //         // this.camera.transform.lookAt(this.target.position, Laya.Vector3.Up);

        //     }break;
        // }

        // this.camera.transform.position = cameraTargetPos;
        // this.camera.transform.position = this.target.position 
        // let pos = this.camera.transform.position;
        // pos.y += this.followSetting.distance;
        // this.camera.transform.position = pos;
        // this.camera.transform.lookAt(this.target.position, Laya.Vector3.Up);

        // let cameraTransform = this.camera.transform;

        // // calc pos
        // let cameraTargetPos = new Laya.Vector3(0, 0, 0);
        // // let playerController = BattleManager.playerController;
        // // const player = BattleManager.playerController.player;
        // Laya.Vector3.add(
        //     target.position,
        //     new Laya.Vector3(0, cameraTransform.position.y - target.position.y, 0),
        //     cameraTargetPos
        // );

        // const s = new Laya.Vector3(
        //     -target.forward.x * distance,
        //     0,
        //     -target.forward.z * distance
        // );

        // Laya.Vector3.subtract(cameraTargetPos, s, cameraTargetPos);
        // cameraTransform.position = cameraTargetPos;

        // // calc rot
        // const r = new Laya.Vector3(0, 0, 0);
        // const o = new Laya.Quaternion(0, 0, 0, 0);

        // Laya.Vector3.subtract(playerController.birthPos, cameraTransform.position, r);

        // Laya.Quaternion.rotationLookAt(r, playerController.up, o);

        // cameraTransform.rotationEuler = new Laya.Vector3(
        //         cameraTransform.rotationEuler.x,
        //         BattleManager.groundController.initEluY +
        //             player.transform.rotationEuler.y,
        //         cameraTransform.rotationEuler.z
        //     );
    }
}