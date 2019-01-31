import GlobalEvent, { GlobalEventType } from "../../LayaCommon/utils/GlobalEvent";
import Device from "../../LayaCommon/device/Device";
import AudioManager from "../../LayaCommon/audio/AudioManager";
import SceneManager from "../../LayaCommon/scene/SceneManager";
import ViewManager from "../../LayaCommon/view/ViewManager";
import ModuleManager from "../manager/ModuleManager";
import XHSdk from "../../LayaCommon/sdk/XHSdk";
import Net from "../../LayaCommon/net/Net";
import { AppInfo } from "../common/CommonPlatform";
import { ServerConfig } from "../common/CommonServer";
import DB, { DBType } from "../../LayaCommon/db/DB";
import ConfigManager from "../manager/ConfigManager";
import Resource from "../../LayaCommon/resource/Resource";

export default class Launcher extends Laya.Script{
    onAwake():void{
        this.init();
    }

    private async init(){
        console.log("[launcher]init start");
        
        // setup
        Device.setup();

        AudioManager.setup();
        SceneManager.setup();
        ViewManager.setup();

        Laya.timer.frameLoop(1, Laya.stage, this.update);

        // appstart event
        GlobalEvent.event(GlobalEventType.appStart);
        
        // 打开加载界面
        // await Resource.load("ui.game.init.testUI");
        
        // let testUI = await Resource.load("game/init/test.efc")
        // console.log("!! test ui")

        await ModuleManager.loading.show();
        // XHSdk.sendLoadingLog("progressStart");

        await ConfigManager.setup();

        // db
        await DB.setup(DBType.localStorage);

        // 平台相关初始化
        // await XHSdk.setup(AppInfo.GameVersion);

        // 网络相关初始化
        // Net.setBaseUrl(ServerConfig.testUrl);
        // Net.setHttpDefaultKV("open_id", XHSdk.userInfo.open_id);

        // 登陆
        // try {
        //     await ModuleManager.login.login();
        // } catch(err){
        //     console.error("login failed", err);
        // }

        // 显示初始场景
        await ModuleManager.fight.show();

        //
        GlobalEvent.event(GlobalEventType.gameStart);

        // 关闭加载界面
        await ModuleManager.loading.hide();
        // XHSdk.sendLoadingLog("progressEnd");
        
        console.log("[launcher]init finish");
    }

    /**
     * 更新函数
     * 不用onUpdate，没找到laya的常驻脚本写法，所以把update挂到laya.stage上好了。
     */
    update(){
        let deltaMs = Laya.timer.delta;
        ViewManager.update(deltaMs);
        ModuleManager.update(deltaMs);
    }
}