import Device from "../device/Device";
import Utils from "../utils/Utils";
import { ViewFlyword } from "../view/ViewFlyword";
import AudioManager from "../audio/AudioManager";
import XHSdk from "./XHSdk";
import ViewUtils from "../view/ViewUtils";
import GlobalEvent from "../utils/GlobalEvent";
import Timer from "../utils/Timer";


export default class WXSdk {
    private static _isHasAD = true;

    private static showingBannerAd: { [id: string]: BannerAd } = {};
    private static cachedBannerAd: { [id: string]: BannerAd } = {};

    private static isShowingVideo: boolean;
    private static showingVideoId: string;
    private static cacheVideo: { [id: string]: { video: RewardedVideoAd, callback: Laya.Handler } } = {};

    /**
     * 检测
     */
    public static isHasAd() {
        if (!Laya.Browser.onWeiXin)
            return true;
        if (Utils.strVersionCompare(Device.systemInfo.SDKVersion, "2.0.4") < 0)
            return false;
        return this._isHasAD;
    }

    /**
     * 检测是否没有广告
     * @param err 错误信息
     */
    private static checkNoAd(err) {
        if (!err || !this._isHasAD)
            return;
        // if (err.errCode == 1005) {
            this._isHasAD = false;
        // }
    }

    private static bannerTopValue;
    private static fixBannerTop(bannerAd:BannerAd){
        let top = 0;
        let maxTop = Device.systemInfo.windowHeight - bannerAd["style"]["realHeight"]
        if (this.bannerTopValue != null){
            top = this.bannerTopValue;
            if (top > maxTop){
                top = maxTop;
            }else{
                if(bannerAd["style"]["realHeight"] > 90)
                {
                    // 大banner
                    top = this.bannerTopValue - 10;
                }
            }
        } else {
            top = maxTop;
            // if (Device.isBangsScreen() && Device.screenMode == 'vertical'){
            //     top -= 20;
            // }
        }
        bannerAd["style"]["top"] = top;
    }

    private static bannerLeftValue;
    private static fixBannerLeft(bannerAd:BannerAd){
        let left = 0;
        let windowWidth = Device.systemInfo.windowWidth;
        if(this.bannerLeftValue != null)
        {
            left = this.bannerLeftValue;
        }else{
            if(Device.screenMode == 'horizontal')
            {
                left = windowWidth - bannerAd['style']['realWidth'];
            }else{
                left = (windowWidth - bannerAd['style']['realWidth']) / 2;
            }
        }

        bannerAd.style.left = left;
    }

    private static tempPoint:Laya.Point;
    public static calcWidgetY(widget:Laya.UIComponent, offset?:number){
        let y = 0;

        if (this.tempPoint == null){
            this.tempPoint = new Laya.Point();
        }

        this.tempPoint.x = 0;
        this.tempPoint.y = 0;
        widget.localToGlobal(this.tempPoint, false);
        
        let widgetY = this.tempPoint.y;
        // if (widget.anchorY != null && !isNaN(widget.anchorY)){
        //     y = (widgetY - widget.anchorY*widget.height)/Laya.stage.height*Device.systemInfo.windowHeight;
        // } else {
            y = widgetY/Laya.stage.height*Device.systemInfo.windowHeight;
        // }

        if (offset){
            y += offset;
        }

        return y;
    }

    private static loadingBanner:number[] = [];
    /**
     * 显示banner广告
     * @param id 
     * @param topValue 传入以小banner计算的top，方法会自动适配大banner的top
     * @param leftValue 
     * @param node 
     */
    public static async showBanner(id: string, topValue?:number, leftValue?:number, node?:Laya.Sprite){
        if (!Laya.Browser.onWeiXin) {
            return Promise.reject("err platform");
        }

        if (!id || id == "") {
            return Promise.reject("err id");
        }

        console.warn("[wx]showbanner ", id, topValue, leftValue, this.showingBannerAd);

        if (!this.isHasAd()) {
            return Promise.reject("no ad");
        }

        this.bannerTopValue = topValue;
        this.bannerLeftValue = leftValue;

        // 已经显示，或者缓存已经存在，直接显示
        let nowTime = Date.now();
        let bannerAd = this.showingBannerAd[id];
        // console.warn("!! banner check showing ", id, this.showingBannerAd);
        if (bannerAd != null) {
            console.warn("[wx]show banner by still showing");
            this.fixBannerTop(bannerAd);
            this.fixBannerLeft(bannerAd);
            return bannerAd;
        } else {
            bannerAd = this.cachedBannerAd[id];
            if (bannerAd != null) {
                bannerAd.show();
                delete this.cachedBannerAd[id];
                this.showingBannerAd[id] = bannerAd;
                this.fixBannerTop(bannerAd);
                this.fixBannerLeft(bannerAd);
                console.warn("[wx]show banner by cached", id);
                return bannerAd;
            }
        }
        
        let width = Device.screenMode == 'horizontal' ? 300 : Laya.stage.width;
        try {
            console.warn("[wx]show banner by create")
            bannerAd = XHSdk.createBannerAd({
                adUnitId: id,
                adIntervals: 30,
                style: {
                    left: 0,
                    top: 0,
                    width: width,
                }
            });
            bannerAd["id"] = id;
            this.showingBannerAd[id] = bannerAd;
            // console.log("!! add banner to showing ", id, this.showingBannerAd);
        } catch(err) {
            return Promise.reject(err);
        }

        return new Promise((resolve, reject) => {
            bannerAd.onResize((res) => {
                this.fixBannerTop(bannerAd);
                this.fixBannerLeft(bannerAd);
                bannerAd.style.width = res.width;
            });

            bannerAd.onError((err) => {
                console.error("[wx]show banner ad,  onerror, ", err);
                this.checkNoAd(err);
                reject(err);
            });
    
            bannerAd.onLoad(() => {});

            bannerAd.show()
                .then(res => {
                    if (node != null && 
                        (node.visible == false || node.activeInHierarchy == false)){
                        this.destroyBanenr(bannerAd);
                        reject("unvisible");
                    } else {
                        console.log("[wx]show banner success ", id);
                        resolve(bannerAd);
                    }
                })
                .catch(err => {
                    this.destroyBanenr(bannerAd);
                    this.checkNoAd(err);
                    reject(err);
                });
        });
    }

    /**
     * 激励banner广告
     * @param id 
     * @param topValue 
     * @param dontCreate 
     */
    public static async showRewardBanner(id:string, topValue?:number, dontCreate=false){
        try {
            await this.showBanner(id, topValue);
            let isWaiting = false;
            return new Promise((resolve, reject) => {
                XHSdk.onHide(res => {
                    if (Device.isiOS){ // ios
                        if ((res.targetAction == 3 && res.mode == "back") ||
                            (res.targetAction == 9 && res.targetPagePath.indexOf("channelCode") != -1)){
    
                        } else {
                            isWaiting = true;
                        }
                    } else { // android
                        if (res.targetAction == 7 ||
                            res.targetAction == -1 ||
                            (res.targetAction == 9 && res.targetPagePath.indexOf("channelCode") != -1) ||
                            res.mode == "close"){
    
                        } else {
                            isWaiting = true;
                        }
                    }
                }, true);
    
                XHSdk.onShow(res => {
                    if (isWaiting){
                        console.warn("[wx]rewardbanner success");
                        resolve();
                        isWaiting = false;
                    } else {
                        reject();
                    }
                }, true);
            });
        } catch(err){
            console.error("[wx]create rewardbanner failed, ", err);
            this.checkNoAd(err);
            return Promise.reject(err);
        }
    }

    /**
     * 根据banner适配控件位置。
     * @param widget 
     * @param bannerAd 
     */
    public static fitBanner(widget: Laya.UIComponent, bannerAd: BannerAd, offset?:number) {
        if (!Laya.Browser.onWeiXin) {
            return;
        }

        let top = Device.systemInfo.windowHeight-130;
        if (bannerAd != null){
            top = bannerAd["style"]["top"] / Device.systemInfo.windowHeight*Laya.stage.height;
        }
        if (widget.anchorY != null && !isNaN(widget.anchorY)){
            widget.y = top - ((1.0-widget.anchorY)*widget.height);
        } else {
            widget.y = top - widget.height;
        }

        if (offset){
            widget.y += offset;
        }
        
        console.log("[wx]fit banner ", "widgetY="+widget.y, "stageHeight="+Laya.stage.height, "top="+top, "widgetHeight"+widget.height);
    }

    public static destroyBanenr(bannerAd:BannerAd){
        if (bannerAd == null || bannerAd["id"] == null){
            console.error("[wx]destroy banner failed, ", bannerAd);
            return;
        }
        let id = bannerAd["id"];
        console.warn("[wx]banner destroy ", id);
        delete this.showingBannerAd[id];

        let nowTime = Date.now();
        // 显示时间超过30秒，做销毁处理，否则缓存，等待下次显示，避免频繁显示
        let showTime = bannerAd["showTime"] as number;
        if (showTime != null && nowTime - showTime > 30000) {
            bannerAd.destroy();
            console.warn("[wx]destroy banner ", id);
        } else {
            bannerAd.hide();
            this.cachedBannerAd[id] = bannerAd;
            console.warn("[wx]hide banner ", id);
        }
        
    }

    /**
     * 清除banner广告
     */
    public static clearAllBanner() {
        if (!Laya.Browser.onWeiXin){
            return;
        }
        console.warn("[wx]clear all banner");

        for (let id in this.showingBannerAd) {
            this.destroyBanenr(this.showingBannerAd[id]);
        }
        this.showingBannerAd = {};
    }

    private static clearBanner() {
        for (let k in this.cachedBannerAd) {
            let banner = this.cachedBannerAd[k];
            if (banner) {
                banner.destroy();
                console.log("[wx]destroy banner by timeout ", k);
            }
        }

        this.cachedBannerAd = {};
    }

    private static getOrCreateVideo(id: string) {
        let data = this.cacheVideo[id];
        if (!data) {
            // 创建
            data = {
                video: XHSdk.createRewardedVideoAd({ adUnitId: id }),
                callback: null
            }
            this.cacheVideo[id] = data;

            // 视频关闭
            data.video.onClose((res: { isEnded: boolean }) => {
                console.log("[wx]video closed ", this.showingVideoId, id, res);
                wx.hideLoading();
                if (id != this.showingVideoId) {
                    console.warn("[wx]video id not equal, ignore");
                    return;
                }
                this.isShowingVideo = null;
                AudioManager.revertMutedState();
                data.callback.runWith(res && res.isEnded);
            });

            // 视频异常
            data.video.onError((err) => {
                wx.hideLoading();
                this.onShowVideoFailed(data.callback, err);
            })
        }
        return data;
    }

    /**
     * 加载并显示视频广告
     * @param id 广告ID
     * @param closeCallback 关闭回调
     * @param isRetry 是否重试（默认为true）
     * @return 正在显示中，无广告的情况下，返回false
     */
    public static showVideo(id: string, closeCallback: Laya.Handler, isRetry: boolean = true): boolean {
        if (!Laya.Browser.onWeiXin ||
            id == null ||
            !this.isHasAd()) {
            // closeCallback.runWith(true);
            return false;
        }

        if (this.isShowingVideo) {
            ViewFlyword.showTip("视频加载中");
            return false;
        }

        AudioManager.tempSetMuted(true);

        this.showingVideoId = id;
        if (Laya.Browser.onWeiXin) {
            wx.showLoading({ title: "加载视频中..." });
            Laya.timer.once(1000, null, wx.hideLoading);
        }
        
        let videoData = this.getOrCreateVideo(id);
        videoData.callback = closeCallback;

        // 创建视频句柄
        this.isShowingVideo = true;

        // 加载视频
        videoData.video.load()
            .then(() => {
                console.log("[wx]video loaded");
                // 显示
                videoData.video.show()
                    .then(() => {
                        console.log("[wx]video showed");
                        this.isShowingVideo = false;
                    }).catch(() => {
                        wx.hideLoading();
                        // 显示失败
                        console.error("[wx]show reward video failed");
                        if (isRetry)
                            this.showVideo(id, videoData.callback, false);
                        else
                            this.onShowVideoFailed(videoData.callback, { errMsg: "show fail" });
                    });
            }).catch((err) => {
                wx.hideLoading();
                // 加载失败，再次尝试，还是失败就当作没有广告
                console.error("[wx]load reward video failed");
                if (isRetry)
                    this.showVideo(id, videoData.callback, false);
                else {
                    this.onShowVideoFailed(videoData.callback, { errMsg: "load fail" });
                }
            });

        return true;
    }

    private static onShowVideoFailed(callback: Laya.Handler, err: { errCode?: number, errMsg: string }) {
        console.error("[wx]video reward failed, err ", err);

        this.isShowingVideo = false;
        AudioManager.revertMutedState();
        if (!callback) {
            console.warn("[wx]video callback is null");
            return;
        }

        callback.runWith(false);
        this.checkNoAd(err);
    }

    private static _lastShowVideoOrShareTime:number;
    public static showVideoOrShare(videoID, shareKey){
        if (this._lastShowVideoOrShareTime && this._lastShowVideoOrShareTime > Timer.curMs){
            return Promise.reject("exist");
        }

        this._lastShowVideoOrShareTime = Timer.curMs + 3000;
        return new Promise((resolve, reject) => {
            if (!WXSdk.showVideo(videoID, Laya.Handler.create(this, function(isEnd){
                if (isEnd){
                    resolve();
                } else {
                    reject('video');
                }
            }))) {
                XHSdk.shareAppMessage(shareKey)
                    .then(res => {
                        resolve();
                    })
                    .catch(err => {
                        reject('share');
                    });
            }
        })
    }

    public static loadSubpackage(name:string, onUpdate?:any){
        return new Promise((resolve, reject) => {
            let subTask = wx.loadSubpackage({
                name:name, 
                success:function(){
                    // console.log("!! subpackage success");
                    resolve();
                },
                fail:function(){
                    // console.log("!! subpackage fail");
                    reject();
                },
                complete:function(){
                    // console.log("!! subpackage complete");
                    resolve();
                }});
            if (onUpdate){
                subTask.onProgressUpdate(onUpdate);
            }
        });
    }
    
    public static widgetToWXPos(widget:Laya.Sprite){
        let point = ViewUtils.getWidgetGlobalPos(widget);

        let widthRate = Device.systemInfo.windowWidth/Laya.stage.width;
        let heightRate = Device.systemInfo.windowHeight/Laya.stage.height;

        let x = point.x * widthRate;
        let y = point.y * heightRate;
        let w = widget.width * widthRate;
        let h = widget.height * heightRate;

        return {x:x, y:y, w:w, h:h};
    }

    // 是否收藏了
    public static setCollected(res:{scene:number, query:any}){
        if (res.scene != 1104 && res.scene != 1103){
            return;
        }

        let isCollected = Laya.LocalStorage.getItem("isCollect");
        if (isCollected == null || isCollected == ""){
            // new collect
            Laya.LocalStorage.setItem("isCollect", "true");
        }
    }

    public static isCollected(){
        let isCollected = Laya.LocalStorage.getItem("isCollect");
        if (isCollected == null || isCollected == ""){
            return false;
        }

        return true;
    }

    // ===========  开放数据域 start  ===========
    private static sharedCanvas;
    public static sendOpenDataMessage(type, args?:any)
    {
        if(Laya.Browser.onWeiXin)
        {
            let openDataContext = wx.getOpenDataContext();
            openDataContext.postMessage({
                type,
                args
            })
        }
    }
    public static drawShareCanvas(width:number, height:number, callback?:Laya.Handler){
        this.refreshShareCanvas(width,height);
        this.sendOpenDataMessage('friendRank');
        Laya.timer.once(1000,this,this.checkRefreshShareCanvas,[callback]);
    }
    public static refreshShareCanvas(width:number,height:number){
        this.sharedCanvas = wx.getOpenDataContext().canvas;
        this.sharedCanvas.width = width;
        this.sharedCanvas.height = height;
    }
    public static checkRefreshShareCanvas(callback)
    {
        let texture = new Laya.Texture;
        texture.bitmap = new Laya["Texture2D"]();
        texture.bitmap.loadImageSource(this.sharedCanvas);
        callback.runWith(texture);
    }
    public static clearRefreshShareCanvas()
    {
        Laya.timer.clear(this, this.checkRefreshShareCanvas);
    }
    // ===========  开放数据域 end  ===========
}
