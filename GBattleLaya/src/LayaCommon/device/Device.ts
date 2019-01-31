import WXSystemInfo = wx.types.SystemInfo;

interface Switch{
    isVibrate:boolean;
}

export default class Device{
    public static isFirstOpen=false;
    public static switch:Switch;
    public static _systemInfo:WXSystemInfo;

    public static setup(){
        // 调试信息
        if (this.isDev){
            console.log("[device]systeminfo=", this.systemInfo);
        }

        // first open
        let firstOpenItem = Laya.LocalStorage.getItem("firstOpen");
        if (firstOpenItem == null || firstOpenItem == "")
        {
            this.isFirstOpen = true;
            Laya.LocalStorage.setItem("firstOpen", "true");
        }
    }

    public static vibrateShort(){
        if (Laya.Browser.onWeiXin){
            wx.vibrateShort()
        }
    }

    public static get systemInfo():WXSystemInfo{
        if (this._systemInfo == null){
            if (Laya.Browser.onWeiXin){
                // let systemInfo = wx.getSystemInfoSync();
                // for (let i in this._systemInfo){
                //     let wxInfo = systemInfo[i];
                //     if (wxInfo)
                //         this._systemInfo[i] = wxInfo;
                // }
                this._systemInfo = wx.getSystemInfoSync();
            } else {
                this._systemInfo = {
                    brand:"",
                    model:"",
                    pixelRatio:0,
                    screenWidth:0,
                    screenHeight:0,
                    windowWidth:0,
                    windowHeight:0,
                    language:"",
                    version:"",
                    system:"",
                    platform:"",
                    fontSizeSetting:"",
                    SDKVersion:"",
                    benchmarkLevel:0,
                    battery:0,
                    wifiSignal:0
                };    
            }
        }
        return this._systemInfo;
    }

    public static get isDev():boolean {
        let brand = this.systemInfo.brand
        return brand == null || brand == "" || brand == "devtools";
    }

    public static get isiOS():boolean{
        return this.systemInfo.system.indexOf("iOS") != -1;   
    }

    /**
     * 是否刘海屏
     */
    public static isBangsScreen():boolean{
        let model = this.systemInfo.model;
        if (model.indexOf("iPhone X") != -1 
        || model.indexOf("PBAM00") != -1)
            return true;

        let lastIndex = model.lastIndexOf("iPhone");
        if (lastIndex > 0){
            let index = model.slice(lastIndex, lastIndex+2);
            if (parseInt(index) > 10){
                return true;
            }
        }

        return false;
    }
}