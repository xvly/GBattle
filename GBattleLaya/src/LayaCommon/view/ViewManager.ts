import BaseView, { ViewEffect } from "../frame/mvc/BaseView";
import { ViewFlyword } from "./ViewFlyword";
import Resource from "../resource/Resource";

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

export default class ViewManager{
    // private static viewDataMap:{[id:string]:any} = {};
    private static root:Laya.View;
    private static actives:{[id:string]:BaseView} = {};
    private static hides:BaseView[] = [];
    private static layers:{[layer:number]:Laya.View} = {};
    
    // public static register(id:string, viewCLass:any){
    //     console.log("[view]register ", id);
    //     this.viewDataMap[id] = viewCLass;
    // }

    public static setup(){
        // 创建根节点
        this.root = new Laya.View();
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
                let layer = new Laya.View();
                layer.mouseThrough=true;
                this.root.addChild(layer);

                // add
                let id = layers[i];
                // layer.name = id;
                this.layers[id] = layer;
                console.log("[view]add layer ", i, id);
            }
        }

        ViewFlyword.setup();
    }
    
    /**
     * 显示界面
     * @param id 界面标识，对应register的id
     * @param layer 显示层
     * @param effect 显示效果
     */
    public static async show(viewData:ViewData, layer:ViewLayer=ViewLayer.normal, effect:ViewEffect=ViewEffect.None, isShowMask:boolean=false, args?:any, maskCallback?:boolean){
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
            return this.actives[id];
        }

        // 在隐藏界面的缓存列表，重新显示即可
        for (let i=0; i<this.hides.length; i++){
            let view = this.hides[i];
            if (view["id"] == id){
                this.hides.splice(i);
                await view.open(false, args, effect);
                this.actives[id] = view;
                return view;
            }
        }

        // 加载并显示界面
        let view = new viewData.clas() as BaseView;
        view["id"] = id;
        if (!viewData.layout){
            console.error("[View]show " + id + " faield, layout or atlas not defined");
            return;
        }
        await view.load(viewData.layout);

        // 添加到layer层节点下。
        if (!layerObj){
            console.warn("[view]layer not found ", layer);
            layerObj = this.root;
        }
        view["layer"] = layer;
        layerObj.addChild(view);

        // 添加遮挡
        if (isShowMask){
            let btnMask = new Laya.Button("game/cover.png");
            btnMask.tag = "mask";
            btnMask.y=-35;
            //btnMask.bottom=-35;
            btnMask.width = Laya.stage.width*2;
            btnMask.height = Laya.stage.height*2;
            btnMask.alpha=0;
            Laya.Tween.to(btnMask, {alpha:1}, 300);
            view.addChildAt(btnMask, 0);
            if (maskCallback){
                btnMask.on(Laya.Event.CLICK, view, view.close);
            }
        }

        // 
        await view.open(false, args, effect);

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

        view.close(type, effect);
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

    public static onViewClose(id){
        console.log("[view]closebyview ", id);
        let view = this.actives[id];
        if (!view){
            console.warn("[view]view not found ", id);
            return;
        }

        this.hides.push(view);

        this.actives[id] = null;
        delete this.actives[id];
    }

    public static update(delta:number){
        let curTime = Laya.timer.currTimer;
        // update actives
        for (let id in this.actives){
            let view = this.actives[id];
            view.update(delta);
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
}
