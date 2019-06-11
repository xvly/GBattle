// import BaseController from "../../LayaCommon/frame/mvc/BaseController";
// import LoadingView from "./LoadingView";
// import ViewManager, { ViewLayer } from "../../LayaCommon/view/ViewManager";
// import { ViewID } from "../common/CommonView";
// import SceneManager from "../../LayaCommon/scene/SceneManager";

// export default class LoadingController extends BaseController{
//     private _loadingView:LoadingView;
//     public async show(){
//         this._loadingView = 
//             await ViewManager.show(ViewID.loading, ViewLayer.overlay) as LoadingView;
//     }

//     public async hide(){
//         return await this.updateProgress(1, 1000);
//     }

//     public get progressValue(){
//         return this._loadingView.progressValue;
//     }

//     public async updateProgress(value:number, duration:number){
//         return await this._loadingView.updateProgress(value, duration);
//     }

//     public setLoadingText(value:string){
//         if (!this._loadingView){
//             return;
//         }
//         this._loadingView.setContent(value);
//     }
// }