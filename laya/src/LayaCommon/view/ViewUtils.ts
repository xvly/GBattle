export default class ViewUtils{
    /**
     * 自转
     * @param item 目标控件
     * @param angleSpd 每次旋转角度
     * @param gap 帧间隔，单位ms
     */
    public static rotate360(item:Laya.UIComponent, angleSpd:number=1, gap:number=5){
        item.timerLoop(gap, item, function(){
            this.rotation += angleSpd;
        })
    }

    /**
     * 震动
     * @param item 目标控件
     * @param strengthX x方向幅度
     * @param strengthY y方向幅度
     * @param duration 单次震动持续时间
     * @param gap 震动间隔，不填不会循环执行。
     */
    public static shake(item:Laya.UIComponent, strengthX:number=5, strengthY:number=5, duration:number=500, gap:number=500){
        let originX = item.x;
        let originY = item.y;

        let startTime = Laya.timer.currTimer;

        item.frameLoop(5, item, function(){
            let curTime=Laya.timer.currTimer;
            this.x += Math.sin(curTime)*strengthX;
            this.y += Math.cos(curTime)*strengthY;

            if (curTime - startTime > duration){
                this.x = originX;
                this.y = originY;
                Laya.timer.clearAll(this);

                if (gap && gap > 0){
                    this.timerOnce(gap, this, function(){
                        ViewUtils.shake(this, strengthX, strengthY, duration, gap);
                    });
                }
            }
        });
    }

    /**
     * 摆动
     * @param item 目标控件
     * @param rotation 晃动角度范围
     * @param gap 间隔，单位ms
     */
    public static swing(item:Laya.UIComponent, rotation:number=15, gap:number=1000){
        let originRotation = item.rotation;
        item.timerLoop(gap, item, function(){
            Laya.Tween.to(
                this, 
                {rotation:originRotation+rotation}, 
                gap*2/4, 
                Laya.Ease.backInOut, 
                Laya.Handler.create(this, function(){
                    Laya.Tween.to(
                        this, 
                        {rotation:originRotation}, 
                        gap*1/4, 
                        Laya.Ease.linearNone);
                })
            );
        });
    }

    /**
     * 缩放
     * @param item 目标控件
     * @param scaleX 缩放X值
     * @param scaleY 缩放Y值
     * @param gap 间隔，单位ms
     */
    public static scale(item:Laya.UIComponent, scaleX:number=1.2, scaleY:number=1.2, gap:number=1000){
        let originScaleX = item.scaleX;
        let originScaleY = item.scaleY;

        item.timerLoop(gap, item, function(){
            Laya.Tween.to(
                this,
                { scaleX:scaleX, scaleY:scaleY },
                gap*2/4,
                Laya.Ease.quadOut,
                Laya.Handler.create(this, function(){
                    Laya.Tween.to(
                        this, 
                        {scaleX:originScaleX, scaleY:originScaleY},
                        gap*1/4);
                }));
        });
    }

    /**
     * 来回移动
     * @param item 目标控件
     * @param deltax x方向差值
     * @param deltay y方向差值
     * @param gap 间隔，单位ms
     */
    public static translatePingpong(item:Laya.UIComponent, deltax:number=0, deltay:number=0, gap:number=1000){
        let originx = item.x;
        let originy = item.y;
        item.timerLoop(gap, item, function(){
            Laya.Tween.to(this, 
                {x:originx+deltax/2, y:originy+deltay/2},
                gap/2, 
                Laya.Ease.linearNone, 
                Laya.Handler.create(this, function(){
                    Laya.Tween.to(this, 
                        {right:originx-deltax/2, y:originy-deltay/2}, 
                        gap/2);
                })
            );
        });
    }

    /**
     * 数字变化
     * @param label 目标文本控件
     * @param targetValue 目标值
     */
    public static animNumberText(label:Laya.Label, targetValue:number):Promise<any>{
        let number = parseInt(label.text);
        if (number == targetValue){
            return Promise.resolve<any>("");
        }

        return new Promise((resolve, reject) => {
            let delta = Math.abs(targetValue - number);
            let step = delta/30; //delta/60/2;
            Laya.timer.frameLoop(1, label, function(){
                if (number > targetValue){
                    if (number - targetValue < step)
                        number = targetValue;
                    else
                        number -= step;
                } else if (number < targetValue){
                    if (targetValue - number < step)
                        number = targetValue;
                    else
                        number += step;
                }

                label.text = Math.ceil(number).toString();

                if (number == targetValue){
                    Laya.timer.clearAll(label);
                    resolve();
                }
            });
        });
    }   

    private static tempPoint:Laya.Point;
    public static setWidgetGlobalPos(globalX:number, globalY:number, widget:Laya.Sprite){
        if (!widget || !widget.parent){
            return;
        }

        if (this.tempPoint == null){
            this.tempPoint = new Laya.Point();
        }

        this.tempPoint.x = globalX;
        this.tempPoint.y = globalY;
        (widget.parent as Laya.Sprite).globalToLocal(this.tempPoint, false);
        widget.x = this.tempPoint.x;
        widget.y = this.tempPoint.y;
    }

    public static getWidgetGlobalPos(widget:Laya.Sprite):Laya.Point{
        if (this.tempPoint == null){
            this.tempPoint = new Laya.Point();
        }

        if (widget != null && widget.parent != null){
            this.tempPoint.x = widget.x;
            this.tempPoint.y = widget.y;
            (widget.parent as Laya.Sprite).localToGlobal(this.tempPoint, false);
        } else {
            console.warn("get widget global pos failed, widget is null");
        }
        
        return this.tempPoint;
    }
}
