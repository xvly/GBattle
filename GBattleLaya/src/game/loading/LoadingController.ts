import BaseController from "../../LayaCommon/frame/mvc/BaseController";
import LoadingView from "./LoadingView";
import ViewManager, { ViewLayer } from "../../LayaCommon/view/ViewManager";
import { ViewID } from "../common/CommonView";

export default class LoadingController extends BaseController{
    private _loadingView:LoadingView;
    public async show(){
        this._loadingView = 
            await ViewManager.show(ViewID.loading, ViewLayer.overlay) as LoadingView;
    }

    public async hide(){
        return await this._loadingView.setProgress(1, 1000);
    }
}