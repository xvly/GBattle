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
        loop?:LoopType,
        progress?:Laya.Handler):Promise<Laya.Tween>{

        let tween = target["tween"] as Laya.Tween;
        if (tween != null){
            tween.clear();
        }
        
        return new Promise((resolve, reject) => {
            let originProps = {};
            for (let k in props){
                originProps[k] = target[k];
            }

            let _complete = Laya.Handler.create(this, function(){
                if (loop != null){
                    if (target.activeInHierarchy == false){
                        
                    } else {
                        if (loop == LoopType.loop){
                            // loop
                            for (let k in originProps){
                                target[k] = originProps[k];
                            }
                            let layaTween = Laya.Tween.to(target, props, duration, ease, _complete, delay, coverBefore, autoRecover);
                            layaTween.update = progress;
                            target["tween"] = layaTween;
                        } else if (loop == LoopType.pingpong){
                            // pingpong
                            let layaTween = Laya.Tween.to(target, originProps, duration, ease, _complete, delay, coverBefore, autoRecover);
                            layaTween.update = progress;
                            target["tween"] = layaTween;
                            for (let k in props){
                                originProps[k] = target[k];
                            }
                        }
                    }
                } else {
                    complete != null && complete.run();
                    resolve();
                }
            }, null, false);
            
            let layaTween = Laya.Tween.to(target, props, duration, ease, _complete, delay, coverBefore, autoRecover);
            layaTween.update = progress;
            target["tween"] = layaTween;
        });
    }

    public static async transformTranslate(
        tf:Laya.Transform3D, 
        pos:{x?:number,y?:number,z?:number}, 
        duration:number, 
        ease?:Function
    ){
        let tempPos = tf.position.clone();
        return Tween.to(tempPos, pos, duration, ease, null, null, null, null, null, Laya.Handler.create(tf, function(){
            tf.position = tempPos;
        }, null, false));
    }

    public static async transformRotationTo(
        tf:Laya.Transform3D,
        rot:{x?:number, y?:number, z?:number, w?:number},
        duration:number,
        ease?:Function
    ){
        let tempRot = tf.rotation.clone();        
        return Tween.to(tempRot, rot, duration, ease, null, null, null, null, null, Laya.Handler.create(tf, function(){
            tf.rotation = tempRot;
        }))
    }

    // public static async updateTo(
    //     target:any,
    //     props:any,
    //     duration:number,
    //     ease?:Function
    // ){
    //     let tempProps={};
    //     for (let k in props){
            
    //         tempProps[k]=target[k].clone();

    //         console.log("!! tween to ", k, target[k], props[k])
    //         Tween.to(tempProps[k], props[k], duration, ease);
    //     }
    //     return Timer.loop(1, target, function(){
    //         for (let k in tempProps){
    //             target[k] = tempProps[k];
    //             console.log("!! update to  ", k, tempProps[k].x);
    //         }
    //     }, null, null, null, duration);
    // }

}