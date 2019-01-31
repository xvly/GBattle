import Resource from "../resource/Resource";

interface ParticleSetting{
    life:number[],
    bornTime:number[],
    bornRadius:number[],
    endRadius:number[],
    angle:number[]
    count:number,
    bornScale?:number[],
    endScale?:number[],
    moveEase?:Function,
    loop?:boolean
}

export default class Particle{
    private static random(min:number, max:number){
        return Math.random()*(max-min) + min;
    }

    public static async playAt(url:string, node:Laya.Node, x:number, y:number, settings:ParticleSetting){
        let tex = await Resource.load(url);

        for (let i=0, n=settings.count; i<n; i++){
            let spr = new Laya.Sprite();
            spr.texture = tex;
            node.addChild(spr);
            spr.alpha=0;

            let bornTime = this.random(settings.bornTime[0], settings.bornTime[1]);
            let lifeTime = this.random(settings.life[0], settings.life[1]);
            let bornRadius = this.random(settings.bornRadius[0], settings.bornRadius[1]);
            let endRaiuds = this.random(settings.endRadius[0], settings.endRadius[1]);
            let bornScale = 1;
            if (settings.bornScale != null){
                bornScale = this.random(settings.bornScale[0], settings.bornScale[1]);
            }
            let endScale = 1;
            if (settings.endScale != null){
                endScale = this.random(settings.endScale[0], settings.endScale[1]);
            }
            
            let radian = this.random(settings.angle[0], settings.angle[1])*(Math.PI/180);

            let cosA = Math.cos(radian);
            let sinA = Math.sin(radian);

            let startX = x + bornRadius*cosA;
            let startY = y + bornRadius*sinA;

            let endX = startX + endRaiuds*cosA;
            let endY = startY + endRaiuds*sinA;

            spr.x = startX;
            spr.y = startY;
            spr.scaleX = bornScale;
            spr.scaleY = bornScale;

            let timeline = new Laya.TimeLine();
            timeline.to(spr, {}, bornTime);
            timeline.to(spr, {alpha:1}, 100);
            timeline.to(spr, {x:endX, y:endY, scaleX:endScale, scaleY:endScale, alpha:0}, lifeTime, settings.moveEase);
            timeline.play(null, settings.loop);
            timeline.on(Laya.Event.COMPLETE, spr, function(){
                spr.destroy();
            });
        }
    }
}