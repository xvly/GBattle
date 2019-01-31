import Device from "../device/Device";
import XHSdk, { SDKOnShowData } from "./XHSdk";
import GlobalEvent from "../utils/GlobalEvent";

export interface TigerInfo {
    creative_id: number;
    is_open: boolean;
    redirect_version: string;
    tiger_position_id: string;
    type: number;
    show_config: any;
    list?:TigerInfo[];
}

export default class XHTiger {
    public static tigerInfo: TigerInfo;
    private static onShowInfo: SDKOnShowData;

    private static btnFloatAdEventDispatcher; // 浮窗按钮事件分发器
    private static btnFloatAd: Laya.Button;
    private static animFloatAd: Laya.Animation;

    /**
     * 交叉广告初始化，该函数默认会在XHSdk的初始化函数中调用。
     * @param version 游戏版本号
     */
    public static setup() {
        XHSdk.onShow(res => {
            this.onShowInfo = res;
        });
    }

    // /**
    //  * 获取广告列表
    //  * @param id 
    //  */
    // public static async getTigerList(id: number):Promise<TigerInfo[]> {
    //     if (!Laya.Browser.onWeiXin)
    //         return;

    //     let tigerList = await XHSdk.getTigerList(id);
    //     this.tigerInfo = tigerList[0];
    //     return tigerList;
    // }

    /**
     * 创建浮窗广告
     * @param tigerId tigerID
     * @param root 显示节点
     * @param x 位置X
     * @param y 位置Y
     */
    public static createFloatAd(tigerId: number, x: number, y: number) {
        if (!Laya.Browser.onWeiXin) return;

        if (this.btnFloatAd != null) this.btnFloatAd.removeSelf();
        if (this.animFloatAd != null) this.animFloatAd.removeSelf();

        this.btnFloatAd = new Laya.Button();
        this.btnFloatAd.width = 148;
        this.btnFloatAd.height = 165;
        this.btnFloatAd.x = x;
        this.btnFloatAd.y = y;
        this.btnFloatAd.zOrder = 99999;
        Laya.stage.addChild(this.btnFloatAd);
        this.tweenFloatAd(this.btnFloatAd);

        this.animFloatAd = new Laya.Animation();
        this.animFloatAd.width = 95;
        this.animFloatAd.height = 135;
        this.animFloatAd.x = 10;
        this.animFloatAd.y = 10;
        this.btnFloatAd.addChild(this.animFloatAd);

        console.warn("[platform] bind floatad", tigerId);
        this.refreshFloatAd(tigerId, this.btnFloatAd, this.animFloatAd);
        return this.btnFloatAd;

    }

    /**
     * 清除浮窗广告
     */
    public static clearFloadAd() {
        if (!Laya.Browser.onWeiXin) return;

        console.warn("[platform] unbind floatad");
        Laya.timer.clear(this, this.refreshFloatAd);

        if (this.animFloatAd) {
            this.animFloatAd.removeSelf();
            this.animFloatAd = null;
        }

        if (this.btnFloatAd) {
            this.clearTweenFloatAd(this.btnFloatAd);
            this.btnFloatAd.removeSelf();
            this.btnFloatAd = null;
        }
    }

    /**
     * 是否显示首屏广告
     */
    public static isShowFirstScreenAD() {
        if (!Laya.Browser.onWeiXin)
            return false;

        // 判断是否从rg跳转过来
        let isFromReadygo = false;
        if (this.onShowInfo &&
            this.onShowInfo.referrerInfo &&
            this.onShowInfo.referrerInfo.extraData &&
            this.onShowInfo.referrerInfo.extraData.channelCode) {
            let cc = this.onShowInfo.referrerInfo.extraData.channelCode;
            isFromReadygo = cc.indexOf("-platform-default") !== -1;
        }

        // 不是从rg跳转过来的，并且不是首次打开
        return !isFromReadygo &&
            !Device.isFirstOpen
    }

    /**
     * 广告跳转
     */
    public static navigateToTiger(positionId, creativeId): Promise<TigerInfo[]> {
        console.log("[platform]navigate to tiger ", positionId, creativeId);
        return new Promise((resolve, reject) => {
            XHSdk.navigateToTiger({
                tiger_position_id: positionId,
                creative_id: creativeId
            }).then((newInfos: TigerInfo[]) => {
                if (newInfos != null) {
                    this.tigerInfo = newInfos[0];
                    resolve(newInfos);
                } else {
                    console.error("[platform]navigate to tiger, get info failed");
                    reject(null);
                }
            }).catch((err) => {
                console.error("[platform]navigate to tiger failed, err=", err);
                reject(null);
            });
        })
    }

    private static tweenFloatAd(widget: Laya.UIComponent) {
        let h = 80;

        let originY = widget.y;
        let timeline = new Laya.TimeLine();
        timeline.to(widget, { y: originY - h }, 500, Laya.Ease.quadOut);
        timeline.to(widget, { y: originY }, 100);

        timeline.to(widget, { y: originY - h / 2 }, 500, Laya.Ease.quadOut);
        timeline.to(widget, { y: originY }, 100);

        timeline.to(widget, { y: originY - h / 4 }, 300, Laya.Ease.quadOut);
        timeline.to(widget, { y: originY }, 100);
        timeline.to(widget, {}, 1000);

        timeline.play(null, true);

        // 没找到方法自动释放，暂时用个临时变量记录，然后在clearTimeline释放
        widget["timeline"] = timeline;
    }

    private static clearTweenFloatAd(widget: Laya.UIComponent) {
        let timeline = widget["timeline"] as Laya.TimeLine;
        if (timeline == null)
            return;
        timeline.destroy();
        delete widget["timeline"];
    }

    private static async refreshFloatAd(tigerId: number, button: Laya.Button, anim: Laya.Animation, inTigerInfo?: TigerInfo) {
        button.visible = false;

        let tigerInfo: TigerInfo;
        if (inTigerInfo != null) {
            tigerInfo = inTigerInfo;
        } else {
            tigerInfo = await XHSdk.getTigerList(tigerId)[0];
            if (tigerInfo == null) return;
        }

        let showConfig = tigerInfo.show_config;
        if (showConfig == null) return;

        // anim.scale(0.7,0.7);
        button.visible = true;

        anim.clear();
        if (showConfig.images != null) {
            anim.loadImages(showConfig.images);
            anim.interval = 1 / showConfig.fps * 1000;
        } else {
            anim.loadImage(showConfig.image);
        }
        // anim.width = 95;
        // anim.height = 135;
        anim.play();

        if (this.btnFloatAdEventDispatcher != null) {
            this.btnFloatAdEventDispatcher.offAll();
            this.btnFloatAdEventDispatcher = null;
        }
        this.btnFloatAdEventDispatcher = button.once(Laya.Event.CLICK, this, function () {
            this.navigateToTiger(tigerInfo.tiger_position_id, tigerInfo.creative_id)
                .then((res: TigerInfo) => {
                    Laya.timer.clear(this, this.refreshFloatAd);
                    this.refreshFloatAd(tigerId, button, anim, res);
                });
        });

        Laya.timer.once(10000, this, this.refreshFloatAd, [tigerId, button, anim]);
    }

    private static likeDatas:any[];
    private static likeWidget: Laya.List;
    public static async bindLike(list:Laya.List, id:number){
        this.likeWidget = list;
        
        let datas = await XHSdk.getTigerList(id);
        this.likeDatas = datas;
        list.renderHandler = Laya.Handler.create(this, this.onLikeListItemRender, null, false);
        list.hScrollBarSkin = "";
        // list.selectHandler = Laya.Handler.create(this, this.onLikeListItemSelect);

        list.array = datas[0].list;
    }

    private static onLikeListItemRender(cell:Laya.Box, index:number){
        let data = cell.dataSource;

        let icon = cell.getChildByName("imgIcon") as Laya.Image;
        let name = cell.getChildByName("txtName") as Laya.Label;

        icon.loadImage(data.show_config.image, Laya.Handler.create(icon, function(){
            icon.width = 92;
            icon.height = 92;
        }));

        name.text = data.show_config.title;

        cell.offAll(Laya.Event.CLICK);
        cell.on(Laya.Event.CLICK, this, function(){
            this.navigateToTiger(data.tiger_position_id, data.creative_id)
                .then( (tigerList:TigerInfo[]) => {
                    this.likeWidget.array = tigerList[0].list;
                });    
        });
    }

    public static async isOpen(id:number):Promise<boolean>{
        let config = await XHSdk.isTigerOpen(id);
        return config && config.is_open;
    }

    // 无响应
    // private static onLikeListItemSelect(index:number){
    //     let data = this.likeDatas[index];
    //     console.log("!! select ", index, data);
    //     this.navigateToTiger(data.tiger_position_id, data.creative_id)
    //         .then( (tigerList:TigerInfo[]) => {
    //             this.likeWidget.array = tigerList[0].list;
    //         });
    // }
}

