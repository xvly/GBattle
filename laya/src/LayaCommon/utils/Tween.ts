import Timer from "./Timer";

export enum LoopType{
    loop,
    pingpong
}

export default class Tween{
    public static to(
        target:any,  
        props:any, 
        duration:number, 
        ease?:Function, 
        complete?:Laya.Handler, 
        delay?:number, 
        coverBefore?:boolean, 
        autoRecover?:boolean,
        progress?:Laya.Handler):Promise<Laya.Tween>{

        let tween = target["__tweener"] as Laya.Tween;
        if (tween != null){
            tween.clear();
        }

        if (props.update == undefined &&
            progress != null){
            props.update = progress;
        }
            
        return new Promise((resolve, reject) => {
            let layaTween = Laya.Tween.to(
                target, 
                props, 
                duration, 
                ease, 
                Laya.Handler.create(this, function(){
                    target["__tweener"] = null;
                    if(complete)
                    {
                        complete.runWith(complete.args);
                    }
                    resolve();
                }),
                delay, 
                coverBefore, 
                autoRecover);

            // layaTween.update = progress;
            target["__tweener"] = layaTween;
        });
          
    }

    public static async transformTranslate(
        tf:Laya.Transform3D, 
        pos:{x?:number,y?:number,z?:number}, 
        duration:number, 
        ease?:Function
    ){
        let tempPos = tf.position.clone();
        return Tween.to(
            tempPos, 
            {x:pos.x, y:pos.y, z:pos.z}, 
            duration, 
            ease, 
            null, null, true, null,  
            Laya.Handler.create(tf, function(){
                tf.position = tempPos;
            }, null, false)
        );
    }

    public static async transformRotateTo(
        tf:Laya.Transform3D,
        rot:{x?:number, y?:number, z?:number, w?:number},
        duration:number,
        ease?:Function
    ){
        let tempRot = {x:tf.rotation.x, y:tf.rotation.y, z:tf.rotation.z, w:tf.rotation.w};
        return Tween.to(
            tempRot, 
            {x:rot.x, y:rot.y, z:rot.z, w:rot.w}, 
            duration, 
            ease, 
            null, null, true, null,  
            Laya.Handler.create(tf, function(){
                // quaternion的x,y,z,w属性是只读的
                tf.rotation = new Laya.Quaternion(tempRot.x, tempRot.y, tempRot.z, tempRot.w);
            }, null, false));
    }

    public static clearAll(target){
        Laya.Tween.clearAll(target);
    }

    public static numberTween_Int(startNum: number, targetNum: number, runTime: number, callback: (data: number) => void){
        if(runTime == 0) return;
        let curNum: number = Math.ceil(startNum);
        let interval: number = Math.abs(runTime / (targetNum - startNum));
        let targetNumStep;
        if(interval >= 25){
            targetNumStep = targetNum > 0 ? 1 : -1;
        }   
        else{
            targetNumStep = targetNum > 0 ? 1 : -1;
            targetNumStep /= (interval / 25);
            targetNumStep = Math.floor(targetNumStep);
        }
        let numberTweenFunc = function () {
            curNum += targetNumStep;
            if ((targetNum > 0 && curNum >= targetNum) || (targetNum <= 0 && curNum <= targetNum)) {
                curNum = targetNum;
                Laya.timer.clear(this,numberTweenFunc);
            }
            callback(curNum);
        };
        Laya.timer.loop(interval,this,numberTweenFunc);
    }
}