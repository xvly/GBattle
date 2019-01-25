import BaseView from "../../LayaCommon/frame/mvc/BaseView";

export default class LoginView extends BaseView{
    private rankButton:Laya.Button;
    private settingButton:Laya.Button;
    private shareButton:Laya.Button;
    private startButton:Laya.Button;

    onLoad(){
        this.rankButton.on(Laya.Event.CLICK, this, this.onClickRank);
        this.settingButton.on(Laya.Event.CLICK, this, this.onClickSetting);
        this.shareButton.on(Laya.Event.CLICK, this, this.onClickShare);
        this.startButton.on(Laya.Event.CLICK, this, this.onClickStart);
    }

    onOpened(){

    }

    onClickRank(){
    }

    onClickSetting(){

    }

    onClickShare(){

    }

    onClickStart(){
        this.doClose();
    }
}