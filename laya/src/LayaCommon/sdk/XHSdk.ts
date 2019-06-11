import Device from "../device/Device";
import Utils from "../utils/Utils";
import XHTiger, { TigerInfo } from "./XHTiger";
import GlobalEvent, { GlobalEventType } from "../utils/GlobalEvent";
import WXSdk from "./WXSdk";

export const SDKLoadingLog = {
    start: "progressStart",
    end: "progressEnd"
};

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
        };
    };
    referpagepath: string;
    prescene: number;
    scene: number;
    scene_note: string;
    sessionid: string;
    path: string;
    clickTimestamp: number;
    isSticky: boolean;
    targetAction: number;
    mode: string;
    targetPagePath: string;
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
    open_id: string; //String	用户在该应用下的open_id
    pid?: string; //String	用户在平台的统一索引
    app_id?: string; //String	所在应用的appId
    union_id?: string; //String	用户的union_id
    nick_name?: string; //String	用户的微信昵称
    avatar_url?: string; //String	用户的微信头像地址
    gold?: number; //Number	用户在平台的金币数
    diamond?: number; //Number	用户在平台的钻石数
    is_new?: boolean; //Bool	    用户是否新注册的用户
    gender?: number; //Number	男：1 女：0
    country?: string; //String	用户国家
    language?: string; //String	用户微信里面选择使用的语言
    city?: string; //String	用户城市
    province?: string; //String	用户省份
    ofp?: string; // string pid的指纹
}

const wx = window["wx"];

export default class XHSdk {
    private static gameVersion: string;

    private static shareTemplates: { [key: string]: ShareTemplate[] };
    private static switchs: { [key: string]: boolean } = {};

    public static userInfo: UserInfo = {
        open_id: "坦克破坏王",
        nick_name: "坦克破坏王",
        // avatar_url: remoteUrl + "/view/icon1.png",
        ofp: "127f579a61aaa84fe35a5366a79f7a7313b77a99"
    };

    public static inviter: string;

    public static launchOptions: wx.types.LaunchOption;

    public static async setup(version: string) {
        if (!Laya.Browser.onWeiXin) {
            return;
        }

        this.gameVersion = version;
        console.log("[platform]setup", "version=" + this.gameVersion);

        wx.showShareMenu();

        await wx.tmSDK.init({
            appVersion: this.gameVersion, // 小游戏审核版本号
            hideRequestLog: true
        });

        try {
            this.userInfo = await wx.tmSDK.login();
            if (this.userInfo.nick_name == null || this.userInfo.nick_name == "") {
                this.userInfo.nick_name = "坦克破坏王";
                // this.userInfo.avatar_url = remoteUrl + "/view/icon1.png";
            }
        } catch (err) {
            console.error("[platform]wx.tmSDK login failed");
            this.userInfo.nick_name = "坦克破坏王";
            // this.userInfo.avatar_url = remoteUrl + "/view/icon1.png";
        }

        console.log("[platform]userinfo ", this.userInfo);

        // launch info
        this.launchOptions = wx.getLaunchOptionsSync();
        GlobalEvent.event("onLaunch", this.launchOptions);

        // 开关信息
        this.switchs = await wx.tmSDK.getGameSwitchConfig({ version: this.gameVersion });
        console.log("[platform]switch", this.switchs);

        // 分享信息
        this.shareTemplates = await wx.tmSDK.getShareTemplates({ version: this.gameVersion });
        console.log("[platform]shareTemplates", this.shareTemplates);

        // 右上角分享
        wx.tmSDK.onShareAppMessage(function(){
            return {
                scene:'common'
            }
        });
        // if (this.shareTemplates["common"]){
        //     let regular = this.shareTemplates["common"][0];
        //     if (regular != null) {
        //         wx.tmSDK.onShareAppMessage(function () {
        //             return {
        //                 title: regular.title,
        //                 imageUrl: regular.image,
        //                 channelCode: regular.channel_code
        //             }
        //         });
        //     }
        // }

        // tiger初始化
        XHTiger.setup();

        this.onShow(res => {
            console.log("[wx]onshow ", res);
            WXSdk.setCollected(res);
            GlobalEvent.event(GlobalEventType.onShow, res);
        });

        this.onHide(res => {
            console.info("[wx]onhide ", res);
            GlobalEvent.event(GlobalEventType.onHide, res);
        });
    }

    /**
     * 判断是否已经授权
     */
    public static get isAuthorize() {
        if (!Laya.Browser.onWeiXin) return true;

        return (
            this.userInfo.nick_name != null &&
            this.userInfo.nick_name != "" &&
            this.userInfo.nick_name != "坦克破坏王"
        );
    }

    /**
     * 判断指定开关是否打开
     * @param key
     */
    public static isSwitchOpen(key: string): boolean {
        if (!Laya.Browser.onWeiXin) return true;
        return this.switchs[key];
    }

    private static _authorizeBtn;
    public static removeAuthorizeBtn() {
        if (!this._authorizeBtn) {
            return;
        }

        this._authorizeBtn.destroy();
        this._authorizeBtn = null;
    }

    /**
     * 授权登陆
     */
    public static authorizeLogin(bindWidget?: Laya.Sprite) {
        let stageWidth = Laya.stage.width;
        let stageHeight = Laya.stage.height;

        let node = new Laya.Sprite();
        Laya.stage.addChild(node);

        let point = WXSdk.widgetToWXPos(bindWidget);
        let btnInfo = {
            type: "text",
            text: "",
            // image: "view/common/baidi.png",
            style: {
                left: point.x,
                top: point.y,
                width: point.w,
                height: point.h
            },
            withCredentials: true
        };

        return new Promise((resolve, reject) => {
            this._authorizeBtn = wx.createUserInfoButton(btnInfo);
            this._authorizeBtn.onTap(res => {
                // 无论是否成功都需要删掉按钮
                // this._authorizeBtn.destroy();
                // node.destroy();

                if (res.errMsg == "getUserInfo:ok") {
                    console.log("[platform]authorize ok ");
                    // 更新平台数据
                    wx.tmSDK
                        .updateUserInfo({
                            encryptedData: res.encryptedData,
                            iv: res.iv,
                            signature: res.signature
                        })
                        .then(res => {
                            console.log("[platform]update userinfo ", res);
                            this.userInfo = res;
                            resolve();
                        })
                        .catch(() => {
                            resolve();
                        });
                    // 成功才删除按钮
                    this._authorizeBtn.destroy();
                    node.destroy();
                } else {
                    console.log("[platform]authorize reject");
                    reject();
                }
            });
        });
    }

    /**
     * 尝试授权登陆
     */
    public static tryAuthorize(bindWidget?: Laya.Sprite): Promise<any> {
        if (this.isAuthorize) return Promise.resolve();
        return this.authorizeLogin(bindWidget);
    }

    /**
     * 监听显示事件
     * @param cb
     */
    public static onShow(cb: (res: SDKOnShowData) => void, once: boolean = false) {
        let tempCallback = function(res) {
            cb(res);
            if (once) {
                this.offShow(tempCallback);
            }
        };
        wx.onShow(tempCallback);
    }

    public static offShow(cb) {
        // staticsdk没有提供offshow
        wx.offShow(cb);
    }

    /**
     * 监听隐藏事件
     * @param cb
     */
    public static onHide(cb: (res: SDKOnShowData) => void, once: boolean = false) {
        let tempCallback = function(res) {
            cb(res);
            if (once) {
                this.offHide(tempCallback);
            }
        };
        wx.onHide(tempCallback);
    }

    public static offHide(cb) {
        // staticsdk没有提供offhide
        wx.offHide(cb);
    }

    /**
     * 分享
     * @param shareKey
     * @param titleArgs
     * @param query
     */
    public static shareAppMessage(
        shareKey: string,
        content?: string,
        titleArgs?: any,
        query?: string | any
    ): Promise<any> {
        if (!Laya.Browser.onWeiXin) return Promise.resolve();

        if (this.switchs[shareKey] && this.switchs[shareKey] == false) {
            console.warn("[platform]share failed, ", shareKey + " not open");
            return Promise.reject(null);
        }

        // old sdk
        // let data = this.shareTemplates[shareKey][0];
        // let shareDataList = this.shareTemplates[shareKey];
        // if (shareDataList == null) {
        //     return Promise.reject(null);
        // }

        // let rand = Math.random() - 0.01;
        // let index = Math.floor(rand * shareDataList.length);
        // let shareConfig: ShareTemplate = shareDataList[index];
        // if (!content && !shareConfig){
        //     console.error("share config is null, index:", index);
        //     return Promise.reject(null);
        // }

        // let title = content || shareConfig.title;
        // if (titleArgs != null) {
        //     title = Utils.strFormat(title, titleArgs);
        // }

        if (query != null && typeof query != "string") {
            let str = "";
            for (let k in query) {
                if (str != "") str += "&";
                str = str + k + "=" + query[k];
            }
            query = str;
        }

        return new Promise((resolve, reject) => {
            // let isCancel = false;
            // let isShowed = false;

            // old sdk
            // let shareData = {
            //     title: title,
            //     imageUrl: shareConfig.image,
            //     channelCode: shareConfig.channel_code,
            //     query: query
            //     // cancel: res => {
            //     //     isCancel = true;
            //     //     if (isShowed) {
            //     //         console.log("share reject because cancel");
            //     //         wx.showModal({
            //     //             title: "温馨提示",
            //     //             content: "你取消了分享，请分享到群",
            //     //             showCancel: false
            //     //         });
            //     //         reject();
            //     //     }
            //     // }
            // }

            // tmsdk
            let shareData = {
                scene: shareKey,
                query: query
            };

            console.log("[share]shareData ", shareData);
            wx.tmSDK.shareAppMessage(shareData);
            let shareTime = Date.now();
            GlobalEvent.once(
                GlobalEventType.onShow,
                this,
                (res: { scene: string; query: string; shareTicket: string }) => {
                    if (Date.now() - shareTime < 2500) {
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
                }
            );
        });
    }

    /**
     * 发送加载日志
     * @param type progressStart|progressEnd
     */
    public static sendLoadingLog(type: string) {
        if (!Laya.Browser.onWeiXin) return;

        wx.tmSDK.sendLoadingLog(type);
    }

    // tiger
    public static navigateToTiger(arg: any): Promise<any> {
        if (!Laya.Browser.onWeiXin) return Promise.resolve();

        //{positionId:e,creativeId:t}
        return wx.tmSDK.flowNavigate(arg);
    }

    public static getTigerList(id: number): Promise<TigerInfo[]> {
        if (!Laya.Browser.onWeiXin) return Promise.resolve([]);
        // console.log('+=======tiger=======')
        //{positionId:e}
        return wx.tmSDK.getFlowConfig({ positionId: id });
    }

    //
    public static createRewardedVideoAd(arg) {
        return wx.createRewardedVideoAd(arg);
    }

    public static createBannerAd(arg) {
        return wx.createBannerAd(arg);
    }

    public static async isTigerOpen(id: number) {
        if (!Laya.Browser.onWeiXin) {
            return true;
        }

        return wx.tmSDK.checkFlowIsOpen({ positionId: id });
    }

    public static async pay(coin, program_param, success?: Function, fail?: Function) {
        try {
            await wx.tmSDK.pay({ coin, program_param });

            if (success) {
                success();
            }

            if (Laya.Browser.onWeiXin) {
                wx.showToast({ title: "充值成功" });
            }
        } catch (res) {
            console.error("[wx.tmSDK]pay failed ", coin, res);
            if (fail) {
                fail();
            }
            if (Laya.Browser.onWeiXin) {
                wx.showModal({ title: "充值失败", content: res.message });
            }
            return Promise.reject(res);
        }
    }

    public static getShareConfig(shareKey: string) {
        if (!Laya.Browser.onWeiXin) {
            return null;
        }
        if (this.shareTemplates) {
            return this.shareTemplates[shareKey];
        }
        return null;
    }
}
