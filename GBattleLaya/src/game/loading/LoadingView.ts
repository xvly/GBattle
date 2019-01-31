import BaseView, { ViewEffect } from "../../LayaCommon/frame/mvc/BaseView";
import XHTiger from "../../LayaCommon/sdk/XHTiger";

export default class LoadingView extends BaseView{

    private progressValue:number;
    private progressTargetValue:number;
    private progress:Laya.ProgressBar;
    private runningTween:Laya.Tween;

    private rgRoot:Laya.Box;
    private imgRGBG:Laya.Image;
    private btnSkip:Laya.Button;

    private adInfo:{posId:string, creativeId:number};

    public onAwake(){
        
        this.imgRGBG.on(Laya.Event.CLICK, this, this.onClickFirstScreenAD);
        this.btnSkip.on(Laya.Event.CLICK, this, this.onClickSkip);
    }

    public onEnable(){
        this.progressValue = 0;
        this.progressTargetValue = -1;

        this.rgRoot.visible=false;
    }

    /**
     * 刷新界面
     */
    public showAD(imgUrl:string, posId:string, creativeId:number){
        this.adInfo = {
            posId:posId,
            creativeId:creativeId
        };

        this.rgRoot.visible=true;
        this.btnSkip.visible=false;

        this.imgRGBG.loadImage(imgUrl);
    }

    /**
     * 点击首屏广告
     */
    private onClickFirstScreenAD(){
        XHTiger.navigateToTiger(
            this.adInfo.posId, 
            this.adInfo.creativeId);
    }

    /**
     * 跳过首屏广告
     */
    private onClickSkip(){
        // Laya.timer.once(100, this, this.doClose);
        this.close();
    }

    /**
     * 设置当前进度
     * @param progress 
     * @param duration 
     */
    public setProgress(progress:number, duration:number = 1000):Promise<any>{
        return new Promise((resolve, reject) => {
            this.progressTargetValue = progress * 100;

            if (this.runningTween != null){
                this.runningTween.clear();
            }

            if (this.rgRoot.visible && progress==1){
                Laya.timer.once(1000, this, function(){
                    this.adBtnSkip.visible=true;
                });
                
                duration = 3000;
            }

            // let duration = duration;
            this.runningTween = Laya.Tween.to(this, {progressValue:this.progressTargetValue}, duration, null, Laya.Handler.create(
                this, function(){
                    resolve();
                }
            ), null, true);
        });
    }

    public update(){
        if (!this.visible ||
            this.progressTargetValue == -1)
            return;

        if (this.progressValue >= 100)
        {
            this.progressTargetValue = -1;
            this.close(null, ViewEffect.Alpha);
            return;
        }

        this.progress.value = this.progressValue / 100;
    }
}
