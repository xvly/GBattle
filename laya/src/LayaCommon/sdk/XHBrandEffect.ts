namespace RG{
    const IPhoneBannerHeight = 35;

    /**
     * 尺寸数据
     */
    const BrandSize = {
        width:750,
        height:350,
        ratioWH:750/350,
        bannerH:285, // banner在圣诞场景需要显示的高度
        bannerWHRatio:2.87,
        wGapScale:0.04,
    }

    /** 效果开关配置文件 */
    const BrandUrl = "https://cdn.kuaiyugo.com/xyx/extern/BrandChris/WXBrandChris.json";

    /**
     * 图片资源路径
     */
    const BrandResource = {
        /** 雪花 */
        SnowFlake:
            "https://cdn.kuaiyugo.com/xyx/t1/BrandPromotion/common/snowflake.png",
        /** 底图 */
        bg: "https://cdn.kuaiyugo.com/xyx/t1/BrandPromotion/common/brand_xx_bg.png",
        /** 方块） */
        white: "https://cdn.kuaiyugo.com/xyx/t1/BrandPromotion/common/white.png"
    };

    /** 雪花配置 */
    const SnowConfig = [
        {
            beginY: 0,
            endY: 0.8,
            beginXRange: [0, 0.2],
            sizeRange: [12, 18],
            /** 单位秒 */
            delay: 0.1,
            /** 单位秒 */
            durationRange: [6, 10]
        },
        {
            beginY: 0,
            endY: 0.4,
            beginXRange: [0.3, 0.6],
            sizeRange: [18, 20],
            /** 单位秒 */
            delay: 0.2,
            /** 单位秒 */
            durationRange: [3, 10]
        },
        {
            beginY: 0,
            endY: 0.3,
            beginXRange: [0.2, 0.5],
            sizeRange: [22, 25],
            /** 单位秒 */
            delay: 0.12,
            /** 单位秒 */
            durationRange: [2, 10]
        },
        {
            beginY: 0,
            endY: 0.6,
            beginXRange: [0.5, 0.7],
            sizeRange: [20, 25],
            /** 单位秒 */
            delay: 0.23,
            /** 单位秒 */
            durationRange: [6, 10]
        },
        {
            beginY: 0,
            endY: 0.8,
            beginXRange: [0.5, 1.0],
            sizeRange: [20, 25],
            /** 单位秒 */
            delay: 0.2,
            /** 单位秒 */
            durationRange: [6, 10]
        },
        {
            beginY: 0,
            endY: 0.9,
            beginXRange: [0, 0.2],
            sizeRange: [17, 25],
            /** 单位秒 */
            delay: 0.6,
            /** 单位秒 */
            durationRange: [8, 10]
        },
        {
            beginY: 0,
            endY: 0.65,
            beginXRange: [0.8, 1.0],
            sizeRange: [22, 25],
            /** 单位秒 */
            delay: 0.15,
            /** 单位秒 */
            durationRange: [6, 10]
        },
        {
            beginY: 0,
            endY: 0.3,
            beginXRange: [0.4, 0.8],
            sizeRange: [20, 25],
            /** 单位秒 */
            delay: 0.3,
            /** 单位秒 */
            durationRange: [2, 5]
        }
    ]

    /**
     * 圣诞节效果
     */
    export class BrandEffect{
        /** 默认配置信息 */
        private static config={
             /** 特效开始的时间 yyyy-MM-ddTHH:mm:ss */
            begin_time: "2018-12-03T00:00",
            /** 特效结束的时间 yyyy-MM-ddTHH:mm:ss */
            end_time: "2018-12-25T23:59:59",
            /** 是否开启特效 */
            is_open: true
        }

        private static node:Laya.Sprite;
        private static shouldShow:boolean;
        private static snowCached:Laya.Image[];
        private static isShowing:boolean;
        private static recordParent:Laya.Node;
        private static bannerAd;
        private static imgBottom:Laya.Image;
        private static _systeminfo;
        private static get systeminfo(){
            if (this._systeminfo == null){
                this._systeminfo = wx.getSystemInfoSync();
            }
            return this._systeminfo;
        }

        /**
         * 初始化
         * 用于获取配置文件，并且算出当前是否处于活动期间。
         */
        public static setup(){
            this.shouldShow = false;

            let req = new Laya.HttpRequest();
            req.send(BrandUrl);
            console.log("[brand]request brand", BrandUrl);
            req.once(Laya.Event.COMPLETE, this, function(res){
                this.config = JSON.parse(res);
                // console.log("[brand]config=", this.config);
                if (this.config.is_open==false){
                    console.log("[brand]not open");
                    return;
                }
                
                let nowTime = Date.now();

                // date.gettime拿到的是标准时间，需要改为北京时间
                let deltaTime = 0;
                if (this.isiOS())
                    deltaTime = 8*60*60*1000;
                let beginTime = new Date(this.config.begin_time).getTime()-deltaTime;
                let endTime = new Date(this.config.end_time).getTime()-deltaTime;

                let beginInterval = nowTime - beginTime;
                let endInterval = endTime - nowTime;

                console.log("[brand]interval", 
                    "beginInterval="+beginInterval, 
                    "endInterval="+endInterval, 
                    "nowTime="+nowTime, 
                    "beginTime="+beginTime, 
                    "endTime="+endTime, 
                    this.config.begin_time, 
                    this.config.end_time
                );

                // 处于显示时间段
                if (beginInterval >= 0 && endInterval >= 0){
                    console.log("[brand]in show time");
                    this.shouldShow = true;
                }

                // 一段时间后显示
                if (beginInterval < 0){
                    Laya.timer.once(-beginInterval, this, function(){
                        console.log("[brand]timer to show");
                        this.shouldShow=true;
                        this.show(this.recordParent);
                    })
                }

                // 一段时间后消失
                if (endInterval > 0){
                    Laya.timer.once(endInterval, this, function(){
                        console.log("[brand]timer to hide");
                        this.shouldShow=false;
                        this.hide();
                    });
                }
            });
        }

        /**
         * 显示
         * @param parent 根节点，不设置会自动取Laya.stage
         */
        public static show(parent?:Laya.Node){
            console.log("[brand]call show, ", "shouldShow="+this.shouldShow);
            if (this.shouldShow == false){
                this.recordParent=parent;
                return;
            }

            if (parent == null)
                parent = Laya.stage;

            if (this.node != null ){
                this.node.visible=true;
                Laya.stage.setChildIndex(this.node, Laya.stage.numChildren-1);
            } else {
                this.node = new Laya.Sprite();
                parent.addChild(this.node);
                this.createBottom();
            }

            this.createSnow();
            this.fitBanner();

            console.log("[brand]show");
        }

        /**
         * 隐藏
         */
        public static hide(){
            if (this.node != null){ 
                Laya.timer.clearAll(this.node);
                this.node.visible=false;
            }
            this.snowCached=null;

            this.fitBanner();

            console.log("[brand]hide");
        }

        /**
         * 绑定banner句柄，在show和hide的时候调整位置宽高
         * @param bannerAd bannerAd句柄
         */
        public static bindBannerAd(bannerAd):boolean{
            this.bannerAd = bannerAd;
            return this.fitBanner();
        }

        private static isiOS(){
            if (!Laya.Browser.onWeiXin)
                return false;
            return this.systeminfo.system.indexOf("iOS") != -1;
        }

        private static isIphoneX(){
            let systeminfo = this.systeminfo;
            let model = systeminfo.model;
            if (model.indexOf("iPhone X") != -1)
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

        private static fitBanner():boolean{
            if (this.node == null || this.bannerAd == null)
                return false;

            let systeminfo = this.systeminfo;
            let winWidth = systeminfo.windowWidth;
            let winHeight = systeminfo.windowHeight;

            if (this.node.visible){
                let width = winWidth * (1-BrandSize.wGapScale-BrandSize.wGapScale);
                let height = BrandSize.bannerH / (BrandSize.width/winWidth);
                this.bannerAd.style.left = winWidth * BrandSize.wGapScale; 
                this.bannerAd.style.top = winHeight - height;
                this.bannerAd.style.width =  width;

                if (this.isIphoneX()){
                    this.bannerAd.style.top -= IPhoneBannerHeight;

                    let iphonexRatio = IPhoneBannerHeight/winHeight;
                    this.imgBottom.y = this.getBrandStyle().top - iphonexRatio*Laya.stage.height;
                }
            } else {
                this.bannerAd.style.left = 0;
                this.bannerAd.style.width = winWidth;
                this.bannerAd.style.top = winHeight - winWidth/BrandSize.bannerWHRatio;
                if (this.isIphoneX()){
                    this.bannerAd.style.top -= IPhoneBannerHeight;
                }
            }

            console.log("brand fit banner");
            return true;
        }

        /**
         * 创建底部Banner
         * @param height 
         */
        private static createBottom(height:number=250){
            this.imgBottom = new Laya.Image();
            this.imgBottom.loadImage(BrandResource.bg, Laya.Handler.create(this, function(){
                this.node.addChild(this.imgBottom);
                let style = this.getBrandStyle();
                this.imgBottom.x = style.left;

                if (this.isIphoneX()){
                    let iphonexRatio = IPhoneBannerHeight/this.systeminfo.windowHeight;
                    this.imgBottom.y = style.top - iphonexRatio*Laya.stage.height;
                } else {
                    this.imgBottom.y = style.top;
                }

                // temp
                console.log("[brand]create bottom ", this.isIphoneX(), style);
                
                this.createSmoke(this.imgBottom);
            }));
        }

         /**
         * 创建烟囱效果
         */
        private static createSmoke(bottom:Laya.Image){
            let img = new Laya.Image();
            img.loadImage(BrandResource.SnowFlake, Laya.Handler.create(this, function(){
                bottom.addChild(img);
                
                img.x=bottom.width*0.87;
                img.y=-bottom.height*0.05;
                img.width=img.height=36;
                img.scale(0.5,0.5);

                let timeline = new Laya.TimeLine();
                timeline.to(img, {x:img.x+30, y:img.y-30, scaleX:1.1, scaleY:1.1, alpha:0.8}, 1000);
                timeline.to(img, {alpha:0}, 300);
                timeline.play(null, true);
            }));
        }
        
        /**
         * 创建飘雪效果
         * @param count 数量
         */
        private static createSnow(count?:number){
            // 随机配置
            let configs:any[];
            if (count == null){
                configs = SnowConfig;
            } else {
                configs = [];
                let indexs:number[] = [];
                for (let i=0, n=SnowConfig.length; i<n; i++){
                    indexs.push(i);
                }
                for (let i =0; i<count; i++){
                    let randomIndex = Math.floor(Math.random()*indexs.length);
                    let index:number = indexs.splice(randomIndex)[0];
                    configs.push(SnowConfig[index]);
                }
            }

            // 
            configs.forEach((config) => {
                let gap = config.durationRange[0] + config.delay;
                gap *= 1000;
                let _config = config;
                Laya.timer.loop(gap, this.node, () => {
                    this.createSingleSnow(_config);
                });
            });
        }

        /** 当个雪花效果，循环播放 */
        private static createSingleSnow(config){
            let winWidth = Laya.stage.width;
            let winHeight = Laya.stage.height;
            let designWidth = Laya.stage.designWidth;
            let size = Math.floor(Math.random()*(config.sizeRange[1]-config.sizeRange[0])+config.sizeRange[0]);
            size *= winWidth/designWidth;

            let beginX = Math.random()*(config.beginXRange[1]-config.beginXRange[0])+config.beginXRange[0];
            beginX *= winWidth;

            let beginY = winHeight*config.beginY;

            let endY = winHeight*config.endY;
                
            let duration = Math.random()*(config.durationRange[1]-config.durationRange[0])+config.durationRange[0];
            duration *= 1000;

            if (this.snowCached == null){
                this.snowCached = [];
            }

            let img:Laya.Image=null;
            if (this.snowCached.length > 0){
                img=this.snowCached.pop();
                img.visible = true;
                img.alpha = 1;
            } else {
                img = new Laya.Image(BrandResource.SnowFlake);
                this.node.addChild(img);
            }

            img.width=size;
            img.height=size;
            img.x=beginX;
            img.y=beginY;

            let timeline = new Laya.TimeLine();
            timeline.to(img, {y:endY, alpha:0}, duration);
            timeline.play(null);
            
            timeline.on(Laya.Event.COMPLETE, this, function(arg){
                
                img.visible=false;

                if (this.node == null || this.node.visible==false){
                    return;
                }

                if (this.snowCached != null)
                    this.snowCached.push(img);
            })
        }
        
        /**
         * 
         */
        private static getBrandStyle() {
            let winWidth = Laya.stage.width;
            let winHeight = Laya.stage.height;

            let width = winWidth;
            let height = width / BrandSize.ratioWH;
            let top = winHeight-height;
            let left = 0;

            let result = {
                width:width,
                height:height,
                left:left,
                top:top
            }

            return result;
        }
    }
}

