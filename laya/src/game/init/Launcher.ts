import GlobalEvent, { GlobalEventType } from "../../LayaCommon/utils/GlobalEvent";

export default class Launcher extends Laya.Script {
    onAwake(): void {
        this.init();
    }

    private async init() {
        console.info("[launcher] init start");

        console.info("[launcher] load config");

        // base

        // appstart event
        GlobalEvent.event(GlobalEventType.appStart);

        // remote url
        // Laya.URL.rootPath = "https://cdn.kuaiyugo.com/xyx/t1/TankIO/";

        // show loading

        // load subpackage
        // if (Laya.Browser.onWeiXin) {
        //     console.log("[launcher]load subpackage");
        //     try {
        //         await this.loadSubpackage("assets", true);
        //         await this.loadSubpackage("view", false);
        //     } catch (err) {
        //         console.error("load wx subpackage failed ", err);
        //     }
        // }
        
        console.info("[launcher] finish");
    }
}


