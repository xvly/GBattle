import BaseController from "../../LayaCommon/frame/mvc/BaseController";
import { AppInfo } from "../common/CommonPlatform";
import XHSdk from "../../LayaCommon/sdk/XHSdk";
import Net from "../../LayaCommon/net/Net";
import LoginModel from "./LoginModel";

export default class LoginController extends BaseController{
    private model:LoginModel;

    constructor(){
        super();

        this.model=new LoginModel();
    }

    public async show(){
        // await ViewManager.show(ViewID.login, ViewLayer.background);
    }

    public async login(){
        let data = {
            miniprogram:AppInfo.appid, // appid
            programId:AppInfo.programId, // programid
            openid:XHSdk.userInfo.open_id,
            ofp:XHSdk.userInfo.ofp
        }

        let res = await Net.httpPost("getJWT", data);
        if (res.err){
            console.error("login failed");
            return;
        }

        this.model.data = res.data;

        // set default header
        Net.setHeaders("Authorization", "Bearer " + res.data.jwt);

        return res.data;
    }
}