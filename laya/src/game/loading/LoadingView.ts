// import BaseView, { ViewEffect } from "../../LayaCommon/frame/mvc/BaseView";
// import Tween from "../../LayaCommon/utils/Tween";
// import GlobalEvent from "../../LayaCommon/utils/GlobalEvent";
// import { LoadingEvent } from "../common/CommonEvent";
// import ConfigManager, { remoteUrl } from "../manager/ConfigManager";
// import Resource from "../../LayaCommon/resource/Resource";
// import GameConfig from "../../GameConfig";
// export default class LoadingView extends BaseView{
//     public progressValue:number;
//     private progressTargetValue:number;
//     private progress:Laya.ProgressBar;
//     private imgBullet:Laya.Image;
//     private txtContent:Laya.Text;
//     private imgBG:Laya.Image;
//     private imgIcon:Laya.Image;
//     private txtWords:Laya.Label;
//     private btnReload:Laya.Button;

//     public onAwake(){
//         this.imgBG.skin = Resource.loadingUrl("bg_ksjm01.jpg");
//         this.imgIcon.skin = Resource.loadingUrl("gongyong_logo_1.png");
//         // 暂时不要手动重新加载
//         this.btnReload.visible = false;
//         // this.btnReload.on(Laya.Event.CLICK, this, function(){
//         //     Laya.Scene.open(GameConfig.startScene);
//         // })
//     }

//     public onEnable(){
//         super.onEnable();

//         console.info("[loading] enable");

//         this.progressValue = 0;
//         this.progressTargetValue = -1;

//         this.alpha = 1;
//         this.progress.value = 0;
//         this.imgBullet.x = 0;
//         GlobalEvent.event(LoadingEvent.show);

//         Laya.timer.loop(2000,this,this.switchLoadingWords)
//     }

//     public switchLoadingWords() {
//         this.txtWords.text = ConfigManager.loadWords[Math.floor( Math.random() * ConfigManager.loadWords.length)];
//     }

//     public setContent(value:string){
//         if (!this.txtContent){
//             return;
//         }
//         this.txtContent.text = value;
//     }

//     /**
//      * 设置当前进度
//      * @param progress 
//      * @param duration 
//      */
//     public async updateProgress(progress:number, duration:number = 1000):Promise<any>{
//         let targetValue = progress * 100;
//         if (targetValue <= this.progressTargetValue){
//             return;
//         }

//         this.progressTargetValue = targetValue;
//         if (duration > 0){
//             await Tween.to(
//                 this, 
//                 {progressValue:this.progressTargetValue}, 
//                 duration, 
//                 null,null,null, null,null, 
//                 Laya.Handler.create(this, function(){
//                     this.progress.value = this.progressValue / 100;
//                     this.imgBullet.x = this.progress.value * this.progress.width - this.imgBullet.width/2 - 10;
//                 }, null, false));
//         } else {
//             this.progress.value = this.progressTargetValue / 100;
//             this.imgBullet.x = this.progress.value * this.progress.width - this.imgBullet.width/2 - 10;
//         }
//         if (progress >= 1){
//             this.close(null, ViewEffect.Alpha);
//         }
//     }

//     onDisable(){
//         console.info("[loading] disable");
//         GlobalEvent.event(LoadingEvent.hide);
//         Laya.timer.clear(this,this.switchLoadingWords);
//     }
// }
