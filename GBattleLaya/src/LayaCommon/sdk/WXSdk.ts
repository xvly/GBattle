import Device from "../device/Device";
import Utils from "../utils/Utils";
import { ViewFlyword } from "../view/ViewFlyword";
import AudioManager from "../audio/AudioManager";
import XHSdk from "./XHSdk";

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
        if (err.errCode == 1005) {
            this._isHasAD = false;
        }
    }

    private static bannerTopValue;
    private static fixBannerTop(bannerAd:BannerAd){
        let top = 0;
        let maxTop = Device.systemInfo.windowHeight - bannerAd["style"]["realHeight"]
        if (this.bannerTopValue != null){
            top = this.bannerTopValue;
            if (top > maxTop){
                top = maxTop;
            }
        } else {
            top = maxTop;
            if (Device.isBangsScreen()){
                top -= 20;
            }
        }
        bannerAd["style"]["top"] = top;
    }

    public static calcWidgetY(widget:Laya.UIComponent){
        let y = 0;

        if (widget.anchorY != null && !isNaN(widget.anchorY)){
            y = (widget.y - widget.anchorY*widget.height*2.5)/Laya.stage.height*Device.systemInfo.windowHeight;
        } else {
            y = (widget.y - widget.height*1.5)/Laya.stage.height*Device.systemInfo.windowHeight;
        }

        return y;
    }

    private static loadingBanner:number[] = [];
    /**
     * 显示banner广告
     * @param id 广告ID
     */
    public static async showBanner(id: string, topValue?:number, dontCreate=false){
        if (!Laya.Browser.onWeiXin) {
            return null;
        }

        if (!id || id == "") {
            return null;
        }

        if (!this.isHasAd()) {
            return null;
        }

        // console.warn("!! banner show");

        this.bannerTopValue = topValue;

        // 已经显示，或者缓存已经存在，直接显示
        let nowTime = Date.now();
        let bannerAd = this.showingBannerAd[id];
        if (bannerAd != null  && !dontCreate && nowTime - bannerAd["showTime"] < 30000) {
            console.log("[wx]show banner by still showing");

            this.fixBannerTop(bannerAd);
            return bannerAd;
        } else {
            bannerAd = this.cachedBannerAd[id];
            if (bannerAd != null && nowTime - bannerAd["showTime"] < 30000) {
                bannerAd.show();
                delete this.cachedBannerAd[id];
                this.showingBannerAd[id] = bannerAd;
                this.fixBannerTop(bannerAd);

                console.log("[wx]show banner by cached", id);
                return bannerAd;
            }
        }

        // destroy if already loaded
        this.destroyBanner();

        let createTime = Date.now();
        if (this.loadingBanner.indexOf(createTime) == -1){
            this.loadingBanner.push(createTime);
        } else {
            // console.warn("!! banner return ", createTime);
            return;
        }

        let windowHeight = Device.systemInfo.windowHeight;
        let windowWidth = Device.systemInfo.windowWidth;
        try {
            bannerAd = XHSdk.createBannerAd({
                adUnitId: id,
                adIntervals: 30,
                style: {
                    left: 0,
                    top: 0,
                    width: Laya.stage.width,
                }
            });
        } catch(err) {
            return null;
        }

        return new Promise((resolve, reject) => {
            bannerAd.onResize((res) => {
                this.fixBannerTop(bannerAd);
    
                bannerAd.style.left = (windowWidth - res.width) / 2;
                bannerAd.style.width = res.width;
            });

            bannerAd.onError((err) => {
                console.error("[wx]show banner ad,  onerror, ", err);
                this.checkNoAd(err);
                reject();
            });
    
            bannerAd.onLoad(() => {
                // if (RG.BrandEffect.bindBannerAd(bannerAd) == false) {
                //     bannerAd.style.top = windowHeight - 0.347 * windowWidth;
                // if (Device.isBangsScreen()) {
                //     bannerAd.style.top -= 20;
                // }
            });

            bannerAd.show()
                .then(res => {
                    let loadingIndex = this.loadingBanner.indexOf(createTime);
                    if (loadingIndex == this.loadingBanner.length-1){
                        bannerAd["showTime"] = Date.now();
                        this.showingBannerAd[id] = bannerAd;
                        this.loadingBanner.splice(loadingIndex)
                        resolve(bannerAd);
                    } else{
                        this.loadingBanner.splice(loadingIndex)
                        bannerAd.destroy();
                        reject();
                    }
                })
                .catch(err => {
                    this.loadingBanner.splice(this.loadingBanner.indexOf(createTime))
                    bannerAd.destroy();
                    reject();
                });
        });
    }

    /**
     * 根据banner适配控件位置。
     * @param widget 
     * @param bannerAd 
     */
    public static fitBanner(widget: Laya.UIComponent, bannerAd: BannerAd) {
        if (!Laya.Browser.onWeiXin) {
            return;
        }

        let top = Device.systemInfo.windowHeight-130;
        if (bannerAd != null){
            top = bannerAd["style"]["top"] / Device.systemInfo.windowHeight*Laya.stage.height;
        }
        if (widget.anchorY != null && !isNaN(widget.anchorY)){
            widget.y = top - ((1.0-widget.anchorY)*widget.height/2);
        } else {
            widget.y = top - widget.height/2;
        }
        
        console.log("[wx]fit banner ", "widgetY="+widget.y, "stageHeight="+Laya.stage.height, "top="+top, "widgetHeight"+widget.height);
    }

    /**
     * 清除banner广告
     */
    public static destroyBanner() {
        if (!Laya.Browser.onWeiXin)
            return;

        let nowTime = Date.now();
        for (let id in this.showingBannerAd) {
            let banner = this.showingBannerAd[id];

            // 显示时间超过30秒，做销毁处理，否则缓存，等待下次显示，避免频繁显示
            let showTime = banner["showTime"] as number;
            if (showTime != null && nowTime - showTime > 30000) {
                banner.destroy();
                console.warn("[wx]destroy bannerad ", id);
            } else {
                banner.hide();
                this.cachedBannerAd[id] = banner;
                console.warn("[wx]hide bannerad ", id);
            }
        }
        this.showingBannerAd = {};

        // 30秒后清除缓存的banner
        Laya.timer.once(30000, this, this.clearBanner);
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
                if (id != this.showingVideoId) {
                    console.warn("[wx]video id not equal, ignore");
                    return;
                }
                this.isShowingVideo = null;
                AudioManager.revertMutedState();
                data.callback.runWith(res && res.isEnded);
            })

            // 视频异常
            data.video.onError((err) => {
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
                        // 显示失败
                        console.error("[wx]show reward video failed");
                        if (isRetry)
                            this.showVideo(id, videoData.callback, false);
                        else
                            this.onShowVideoFailed(videoData.callback, { errMsg: "show fail" });
                    });
            }).catch((err) => {
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

    public static showVideoOrShare(videoID, shareKey){
        return new Promise((resolve, reject) => {
            if (!WXSdk.showVideo(videoID, Laya.Handler.create(this, function(isEnd){
                if (isEnd){
                    resolve();
                } else {
                    reject();
                }
            }))) {
                XHSdk.shareAppMessage(shareKey)
                    .then(res => {
                        resolve();
                    })
                    .catch(err => {
                        reject();
                    });
            }
        })
    }
}