import BaseView, { ViewEffect } from "../frame/mvc/BaseView";
import { ViewFlyword } from "./ViewFlyword";
import Resource from "../resource/Resource";
import Timer from "../utils/Timer";
import AudioManager from "../audio/AudioManager";
import GlobalEvent from "../utils/GlobalEvent";

export enum ViewLayer{
    background=1,
    normal=2,
    popup=3,
    overlay=4,
    debug=5
}

export interface ViewTypeInfo{
    layout:string;
    atlas:string;
    type:any;
}

export interface ViewData{
    name:string;
    layout:string;
    clas:any
}

export const ViewEvent = {
    show:"viewShow",
    hide:"viewHide"
}

export default class ViewManager{
    // private static viewDataMap:{[id:string]:any} = {};
    private static root:Laya.Sprite;
    private static actives:{[id:string]:BaseView} = {};
    private static hides:BaseView[] = [];
    private static layers:{[layer:number]:Laya.Sprite} = {};
    private static commonOpenVoice:number;
    private static commonCloseVoice:number;

    public static setup(){
        // 创建根节点
        this.root = new Laya.Sprite();
        this.root.zOrder = 100;
        this.root.name = "view manager";
        this.root.width=Laya.stage.width;
        this.root.height=Laya.stage.height;
        
        Laya.stage.addChild(this.root);

        // 创建对应layer的节点。
        let layers = [
            ViewLayer.background,
            ViewLayer.normal,
            ViewLayer.popup,
            ViewLayer.overlay,
            ViewLayer.debug
        ]
        if (layers){
            for(let i in layers){
                // create
                let layer = new Laya.Sprite();
                layer.active = true;
                layer.mouseThrough=true;
                let id = layers[i];
                layer.name = "layer"+id.toString();
                layer.zOrder = id* 100;
                this.layers[id] = layer;
                this.root.addChild(layer);
            }
        }

        ViewFlyword.setup();

        Timer.frameLoop(1, this, this.update);
    }
    
    /**
     * 
     * @param viewData 
     * @param layer 
     * @param effect 
     * @param isShowMask 
     * @param args 
     * @param maskCallback 
     */
    public static async show(
        viewData:ViewData, 
        layer:ViewLayer=ViewLayer.normal, 
        effect:ViewEffect=ViewEffect.None, 
        isShowMask:boolean=false, 
        args?:any, 
        maskCallback?:boolean){
        console.log("[view]show ", "id="+viewData.name, "layer="+layer, "effect="+effect);
        let id = viewData.name;

        // 如果同级界面已经存在，关掉旧界面，暂时不支持多个同级界面。
        let layerObj = this.layers[layer];
        if (layerObj && layerObj.numChildren > 0){
            for (let i=0; i<layerObj.numChildren; i++){
                let childObj = layerObj.getChildAt(i);
                if (childObj["visible"] && !childObj["isClosing"] && childObj["id"] != id){
                    this.close(childObj["id"]);
                }
            }
        }

        // 已经在显示列表
        let existView = this.actives[id];
        if (existView){
            console.warn("view " + id + " already show");
            if (existView.active == false){
                existView.active = true;
            }
            return existView;
        }

        // 在隐藏界面的缓存列表，重新显示即可
        for (let i=0; i<this.hides.length; i++){
            let view = this.hides[i];
            if (view["id"] == id){
                this.hides.splice(i);
                view.args = args;
                await view.open(null, args, effect, this.commonOpenVoice);
                this.actives[id] = view;

                GlobalEvent.event(ViewEvent.show, id);

                return view;
            }
        }

        // 加载并显示界面
        let view = new viewData.clas() as BaseView;
        view.args = args;
        view["id"] = id;
        if (!viewData.layout){
            console.error("[View]show " + id + " faield, layout or atlas not defined");
            return;
        }
        view.name = viewData.name;
        await view.load(viewData.layout);

        // 添加到layer层节点下。
        if (!layerObj){
            console.warn("[view]layer not found ", layer);
            layerObj = this.root;
        }
        view.layer = layer;
        layerObj.addChild(view);

        // 添加遮挡
        if (isShowMask){
            let btnMask = new Laya.Button("view/common/black_bg.png");
            btnMask.tag = "mask";
            btnMask.y = -Laya.stage.height;
            btnMask.x = -Laya.stage.width;
            //btnMask.bottom=-35;
            btnMask.width = Laya.stage.width*3;
            btnMask.height = Laya.stage.height*3;
            btnMask.alpha=0;
            Laya.Tween.to(btnMask, {alpha:0.7}, 300);
            view.addChildAt(btnMask, 0);
            if (maskCallback){
                btnMask.on(Laya.Event.CLICK, view, view.close);
            }
        }

        // 
        await view.open(null, args, effect, this.commonOpenVoice);

        GlobalEvent.event(ViewEvent.show, id);

        this.actives[id] = view;
        return view;
    }

    /**
     * 关闭界面
     * @param id 界面id，对应register的id
     * @param effect 关闭效果
     */
    public static close(id:string, type?:string, effect: ViewEffect=ViewEffect.None){
        console.log("[view]close ", id);
        let view = this.actives[id];
        if (!view){
            console.warn("[view]view not found ", id);
            return;
        }

        view.close(type, effect, this.commonCloseVoice);
    }

    public static closeAll(exceptName?:string[], layer?:ViewLayer){
        for (let i in this.actives){
            let view = this.actives[i];
            if (exceptName != null){
                if (exceptName.indexOf(view.name) == -1){
                    view.close();
                }
            } else if (view.layer == layer){
                view.close();
            } else {
                view.close();
            }
        }
    }

    public static clear(){
        for (let i in this.actives){
            let view = this.actives[i];
            view.destroy();
            console.log("[view]destroy ", i);
        }
        this.actives={};

        for (let i in this.hides){
            let view = this.hides[i];
            view.destroy();
            console.log("[view]destroy ", i);
        }
        this.hides=[];
    }

    public static onViewClose(id:string){
        console.warn("[view]closebyview ", id);
        let view = this.actives[id];
        if (!view){
            console.warn("[view]view not found ", id);
            return;
        }

        this.hides.push(view);

        this.actives[id] = null;
        delete this.actives[id];

        GlobalEvent.event(ViewEvent.hide, id);
    }

    public static update(){
        let deltaMs = Timer.deltaMs;
        let curTime = Laya.timer.currTimer;
        // update actives
        for (let id in this.actives){
            let view = this.actives[id];
            view.update(deltaMs);
        }

        // check destroy
        for (let i=this.hides.length-1; i>=0; i--){
            let view = this.hides[i];
            if (view.time2Destroy && curTime > view.time2Destroy){
                console.log("[view]destroy ", view.id, i, this.hides.length);
                view.destroy();
                this.hides.splice(i, 1);
            }
        }
    }

    public static isShow(id:string){
        let view = this.actives[id];
        return view != null;
    }

    public static getLayer(layer:ViewLayer):Laya.Node{
        return this.layers[layer];
    }

    // 点击音效
    public static handleClickVoice(url:number){
        // Laya.stage.on(Laya.Event.CLICK, this, function(res:Laya.Event){
        //     if (res.target instanceof Laya.Button){
        //         AudioManager.playConfig(url);
        //     }
        // });
    }

    public static handleOpenVoice(url:number){
        this.commonOpenVoice = url;
    }

    public static handleCloseVoice(url:number){
        this.commonCloseVoice = url;
    }

    // 点击缩放效果
    public static enableClickEffect(){
        // 通用鼠标按下事件。
        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, function(res:Laya.Event){
            if (res.target instanceof Laya.Button){
                res.target.scale(1.1, 1.1);
            }
        })

        // 通用鼠标抬起事件。
        Laya.stage.on(Laya.Event.MOUSE_UP, this, function(res:Laya.Event){
            if (res.target instanceof Laya.Button){
                res.target.scale(1, 1);
            }
        });
    }


}
