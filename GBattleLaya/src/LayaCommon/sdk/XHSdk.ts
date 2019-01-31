
import * as sdk from "./xh/xh_minipro_sdk_1.6.0.min.js"
import * as staticSdk from "./xh/xh_minipro_statistic_1.6.0.min.js"
import * as tigerSdk from "./xh/tiger_sdk_1.2.0.js"
import Device from "../device/Device";
import Utils from "../utils/Utils";
import XHTiger, { TigerInfo } from "./XHTiger";
import GlobalEvent, { GlobalEventType } from "../utils/GlobalEvent";

export const SDKLoadingLog = {
    start: "progressStart",
    end: "progressEnd"
}

export interface OnShareAppMessageData {
    title: string;
    imageUrl: string;
    channelCode: string;
    success?: Function;
    arg?: string;
    query?: any;
    fail?: Function;
}

export interface ShareData {
    title: string;
    imageUrl: string;
    channelCode: string;
    query: string;
}

export interface SDKOnShowData {
    query: any;
    referrerInfo: {
        appId: string;
        extraData: {
            channelCode: string;
        }
    };
    referpagepath: string;
    prescene: number;
    scene: number;
    scene_note: string;
    sessionid: string;
    path: string;
    clickTimestamp: number;
    isSticky: boolean;
}

export interface ShareTemplate {
    channel_code: string;
    title: string;
    image: string;
    path: string;
    scene: string;
}

export interface OptionsSync {
    scene: number;
    query: any;
    isSticky: boolean;
    shareTicket: string;
}

/**
 * 平台玩家数据
 */
export interface UserInfo {
    open_id: string;    //String	用户在该应用下的open_id
    pid?: string;	//String	用户在平台的统一索引
    app_id?: string;	//String	所在应用的appId
    union_id?: string;	//String	用户的union_id
    nick_name?: string;	//String	用户的微信昵称
    avatar_url?: string;	//String	用户的微信头像地址
    gold?: number;	    //Number	用户在平台的金币数
    diamond?: number;	//Number	用户在平台的钻石数
    is_new?: boolean;	//Bool	    用户是否新注册的用户
    gender?: number;	    //Number	男：1 女：0
    country?: string;   //String	用户国家
    language?: string;	//String	用户微信里面选择使用的语言
    city?: string; 	//String	用户城市
    province?: string;	//String	用户省份
    ofp?: string; // string pid的指纹
}

export default class XHSdk {
    private static gameVersion: string;

    private static shareTemplates: { [key: string]: ShareTemplate[] };
    private static switchs: { [key: string]: boolean } = {};

    public static userInfo: UserInfo = {
        open_id: "oyIX64hQlA3u7QkmUcSEmwUpgX7A",
        ofp: "f95b3e2fd613138a79cc0c3d9de3910645a78fe4"
    };

    public static inviter: string;

    public static launchOptions: wx.types.LaunchOption;

    public static async setup(version: string) {
        if (!Laya.Browser.onWeiXin)
            return;

        this.gameVersion = version;
        console.log("[platform]setup", "version=" + this.gameVersion);

        wx.showShareMenu();

        this.userInfo = await sdk.login();
        // 记录从其他应用跳转过来的新用户
        if (this.userInfo.open_id && this.userInfo.is_new) {
            tigerSdk.sendRegisterInfo({
                openId: this.userInfo.open_id
            });
        }
        console.log("[platform]userinfo ", this.userInfo);

        // launch info
        this.launchOptions = wx.getLaunchOptionsSync();
        GlobalEvent.event("onLaunch", this.launchOptions);

        // 开关信息
        this.switchs = await sdk.getGameSwitchConfig({ version: this.gameVersion });
        console.log("[platform]switch", this.switchs)

        // 分享信息
        this.shareTemplates = await sdk.getShareTemplates({version:this.gameVersion});
        console.log("[platform]shareTemplates", this.shareTemplates);

        // 右上角分享
        let regular = this.shareTemplates["regular"][0];
        if (regular != null) {
            staticSdk.onShareAppMessage(function () {
                return {
                    title: regular.title,
                    imageUrl: regular.image,
                    channelCode: regular.channel_code
                }
            });
        }

        // tiger初始化
        XHTiger.setup();

        this.onShow(res => {
            GlobalEvent.event(GlobalEventType.onShow, res);
        });

        this.onHide(res => {
            GlobalEvent.event(GlobalEventType.onHide, res);
        });
    }

    /**
     * 判断是否已经授权
     */
    public static get isAuthorize() {
        if (!Laya.Browser.onWeiXin)
            return true;

        return this.userInfo.nick_name != null && this.userInfo.nick_name != "";
    }

    /**
     * 判断指定开关是否打开
     * @param key 
     */
    public static isSwitchOpen(key: string): boolean {
        if (!Laya.Browser.onWeiXin)
            return true;
        return this.switchs[key];
    }

    /**
     * 授权登陆
     */
    public static authorizeLogin() {
        let stageWidth = Laya.stage.width;
        let stageHeight = Laya.stage.height;

        let node = new Laya.Sprite();
        Laya.stage.addChild(node);

        let mask = new Laya.Button();
        mask.width = Laya.stage.width * 2;
        mask.height = Laya.stage.height * 2;
        mask.on(Laya.Event.CLICK, this, function () { });
        node.addChild(mask);
        mask.graphics.drawRect(0, 0, stageWidth, stageHeight, "#000000");
        mask.alpha = 0.5;

        let btnOWidth = 300;
        let btnOHeight = 250;

        let wxWidth = Device.systemInfo.windowWidth;
        let wxHeight = Device.systemInfo.windowHeight;

        let rateW = btnOWidth / wxWidth;

        let btnRWidth = btnOWidth * rateW;
        let btnRHeight = btnOHeight * rateW;

        let left = wxWidth / 2 - btnRWidth / 2;
        let top = wxHeight / 2 - btnRHeight / 2;

        let btnInfo = {
            type: "image",
            image: "https://cdn.kuaiyugo.com/xyx/t4/Common/SDK/loginButton.png",
            style: {
                left: left,
                top: top,
                width: btnRWidth,
                height: btnRHeight,
            },
            withCredentials: true,
        }

        return new Promise((resolve, reject) => {
            let btn = wx.createUserInfoButton(btnInfo);
            btn.onTap(res => {
                // 无论是否成功都需要删掉按钮
                btn.destroy();
                node.destroy();

                if (res.errMsg == "getUserInfo:ok") {
                    console.log("[platform]authorize ok ");
                    // 更新平台数据
                    sdk.updateUserInfo({
                        encryptedData: res.encryptedData,
                        iv: res.iv,
                        signature: res.signature
                    }).then((res) => {
                        console.log("[platform]update userinfo ", res);
                        this.userInfo = res;
                        resolve();
                    }).catch(() => {
                        resolve();
                    });
                } else {
                    console.log("[platform]authorize reject");
                    reject();
                }
            });
        })
    }

    /**
     * 尝试授权登陆
     */
    public static tryAuthorize(): Promise<any> {
        if (this.isAuthorize)
            return Promise.resolve();
        return this.authorizeLogin();
    }

    /**
     * 监听显示事件
     * @param cb 
     */
    public static onShow(cb: (res: SDKOnShowData) => void) {
        staticSdk.onShow(cb);
    }

    /**
     * 监听隐藏事件
     * @param cb 
     */
    public static onHide(cb: (res: SDKOnShowData) => void) {
        staticSdk.onHide(cb);
    }

    /**
     * 分享
     * @param shareKey 
     * @param titleArgs 
     * @param query 
     */
    public static shareAppMessage(shareKey: string, content?: string, titleArgs?: any, query?: string | any): Promise<any> {
        if (!Laya.Browser.onWeiXin) return Promise.resolve();

        if (this.switchs[shareKey] && this.switchs[shareKey] == false) {
            console.warn("[platform]share failed, ", shareKey + " not open");
            return Promise.reject(null);
        }

        // let data = this.shareTemplates[shareKey][0];
        let shareDataList = this.shareTemplates[shareKey];
        if (shareDataList == null) {
            return Promise.reject(null);
        }

        let rand = Math.random() - 0.01;
        let index = Math.floor(rand * shareDataList.length);
        let shareConfig: ShareTemplate = shareDataList[index];
        let title = content || shareConfig.title;
        if (titleArgs != null) {
            title = Utils.strFormat(title, titleArgs);
        }

        if (query != null && typeof (query) != "string") {
            let str = "";
            for (let k in query) {
                if (str != "")
                    str += "&";
                str = str + k + "=" + query[k];
            }
            query = str;
        }

        return new Promise((resolve, reject) => {
            // let isCancel = false;
            // let isShowed = false;

            let shareData = {
                title: title,
                imageUrl: shareConfig.image,
                channelCode: shareConfig.channel_code,
                query: query
                // cancel: res => {
                //     isCancel = true;
                //     if (isShowed) {
                //         console.log("share reject because cancel");
                //         wx.showModal({
                //             title: "温馨提示",
                //             content: "你取消了分享，请分享到群",
                //             showCancel: false
                //         });
                //         reject();
                //     }
                // }
            }

            console.log("[share]shareData ", shareData);
            staticSdk.shareAppMessage(shareData);
            let shareTime = Date.now();
            GlobalEvent.once(GlobalEventType.onShow, this, (res: { scene: string, query: string, shareTicket: string }) => {
                if (Date.now() - shareTime < 2500){
                    wx.showModal({
                        title: "温馨提示",
                        content: "你取消了分享，请分享到群",
                        showCancel: false
                    });    
                    reject();
                } else {
                    console.log("share resolve");
                    resolve();
                }

                // isShowed = true;
                // if (isCancel) {
                //     console.log("share reject because cancel on show");
                //     wx.showModal({
                //         title: "温馨提示",
                //         content: "你取消了分享，请分享到群",
                //         showCancel: false
                //     });
                //     reject();
                // } else {
                    // Laya.timer.once(200, this, function () {
                        // 如果执行了前面的cancel，不应该跑到这里，所以只需要判断isCancel==false
                        // if (!isCancel) {
                            console.log("share resolve");
                            resolve();
                        // }
                    // });
                // }
            });
        });
    }

    /**
     * 发送加载日志
     * @param type progressStart|progressEnd
     */
    public static sendLoadingLog(type: string) {
        if (!Laya.Browser.onWeiXin) return;

        sdk.sendLoadingLog(type);
    }

    // tiger
    public static navigateToTiger(arg: any): Promise<any> {
        if (!Laya.Browser.onWeiXin) return Promise.resolve();

        return sdk.navigateToTiger(arg);
    }

    public static getTigerList(id: number): Promise<TigerInfo[]> {
        if (!Laya.Browser.onWeiXin) return Promise.resolve([]);

        return sdk.getTigerList({
            tiger_position_id_list: [id],
            appVersion: this.gameVersion
        });
    }

    //
    public static createRewardedVideoAd(arg) {
        return sdk.createRewardedVideoAd(arg)
    }

    public static createBannerAd(arg) {
        return sdk.createBannerAd(arg);
    }

    public static async isTigerOpen(id:number){
        return sdk.getTigerConfig({
            tiger_position_id: id,
            appVersion:this.gameVersion
        });
    }
}