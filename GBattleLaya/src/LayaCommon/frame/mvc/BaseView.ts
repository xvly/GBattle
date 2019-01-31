/**
 * view 生命周期
 * onAwake
 * onEnable
 * onDisable
 * onDestroy
 * 
 * update
 */

import Resource from "./../../resource/Resource"
import Tween from "./../../utils/Tween"

import Device from "../../device/Device";
import ViewManager from "../../view/ViewManager";
import Observer from "../observer/Observer";
// import {} from "../../view/ViewManager";

export enum ViewEffect{
    None=1,
    Scale=2,
    Alpha=3,
    MoveLeft=11,
    MoveRight=12,
    MoveUp=13,
    MoveDown=14,
}

export default class BaseView extends Laya.View{
    public id:string;
    public time2Destroy:number;
    public isOpen = false;

    /**
     * 加载界面
     * @param layout 布局文件
     */
    public async load(layout:string){
        console.log("[baseview]load ", layout);
        try {
            // 加载资源并显示
            this.createView(await Resource.load(layout, null, null, Laya.Loader.JSON));
            // // this.createChildren();

            // // 根据是否iphonex做屏幕调整
            if (Device.isBangsScreen()){
                // laya2.0beta4 马上设置不生效
                Laya.timer.once(1, this, function(){
                    this.y = 35;
                });
                this.height = Laya.stage.height-70;
            } else {
                this.y = 0;
                this.height = Laya.stage.height;
            }
            this.width = Laya.stage.width;
            
            //
            this.fitLayout(this);
        } catch(e){
            console.error("[baseview]load fail ", e);
        }
    }

    private openEffect:ViewEffect;
    /**
     * 
     * @param effect 
     * @param args 
     */
    public async open(closeOther?: boolean, param?: any, effect:ViewEffect = ViewEffect.None){
        super.open(closeOther, param);
        // super.show(false, false)
        this.visible = true;
        this.openEffect = effect;
        
        switch(effect){
            case ViewEffect.Alpha:{
                this.alpha = 0;
                await Tween.to(this, {alpha:1}, 300);
            }break;
            case ViewEffect.MoveLeft:{
                this.x = Laya.stage.width;
                await Tween.to(this, {x:0}, 300, Laya.Ease.cubicOut);
            }break;
            case ViewEffect.MoveRight:{
                this.x = -Laya.stage.width;
                await Tween.to(this, {x:0}, 300, Laya.Ease.cubicOut);
            }break;
            case ViewEffect.MoveUp:{
                this.y = Laya.stage.height;
                let toY = 0;
                if (Device.isBangsScreen())
                    toY = 35;
                await Tween.to(this, {y:toY}, 300, Laya.Ease.cubicOut);
            }break;
            case ViewEffect.MoveDown:{
                this.y = -Laya.stage.height;
                let toY = 0;
                if (Device.isBangsScreen())
                    toY = 35;
                await Tween.to(this, {y:toY}, 300, Laya.Ease.cubicOut);
            }break;
            case ViewEffect.Scale:{
                this.scale(0,0);
                await Tween.to(this, {scaleX:1, scaleY:1}, 300);
            }break;
            default:{
                this.x = 0;
                if (Device.isBangsScreen())
                    this.y = 35;
                else 
                    this.y = 0;
            };
        }
        this.isOpen = true;
    }

    public isClosing=false;
    public close(type?:string, effect?:ViewEffect){
        if (!this.isOpen){
            return;
        }
        ViewManager.onViewClose(this.id);
        this.isClosing=true;

        if (!effect){
            switch(this.openEffect){
                case ViewEffect.MoveRight:effect = ViewEffect.MoveLeft;break;
                case ViewEffect.MoveLeft:effect = ViewEffect.MoveRight;break;
                case ViewEffect.Scale:effect = ViewEffect.Scale;break;
                case ViewEffect.MoveUp:effect = ViewEffect.MoveDown;break;
                case ViewEffect.MoveDown:effect = ViewEffect.MoveUp;break;
                default:effect = ViewEffect.None;break;
            }
        }

        switch(effect){
            case ViewEffect.Alpha:{
                Tween.to(this, {alpha:0}, 300)
                .then(() => {
                    this.onClosed();
                });
            }break;
            case ViewEffect.MoveRight:{
                Tween.to(this, {x:Laya.stage.width}, 300, Laya.Ease.cubicIn)
                .then(() => {
                    this.onClosed();
                });
            }break;
            case ViewEffect.MoveLeft:{
                Tween.to(this, {x:-Laya.stage.width}, 300, Laya.Ease.cubicIn)
                .then(() => {
                    this.onClosed();
                });
            }break;
            case ViewEffect.MoveUp:{
                Tween.to(this, {y:-Laya.stage.height}, 300, Laya.Ease.cubicIn)
                .then(() => {
                    this.onClosed();
                });
            }break;
            case ViewEffect.MoveDown:{
                Tween.to(this, {y:Laya.stage.height}, 300, Laya.Ease.cubicIn)
                .then(() => {
                    this.onClosed();
                });
            }break;
            case ViewEffect.Scale:{
                Tween.to(this, {scaleX:0, scaleY:0}, 300)
                .then(() => {
                    this.onClosed();
                });
            }break;
            default:{
                this.onClosed();
            }break;
        }
        this.isOpen = false;
    }

    public onDisable(){
        this.isClosing=false;
        this.visible = false;
        this.time2Destroy = Laya.timer.currTimer+10000;
    }

    public update(delta:number){}

    /**
     * laya2.0beta4版本布局不生效，通过该函数手动设置一次
     */
    protected fitLayout(node:Laya.Node){
        for (let i=0, n=node.numChildren; i<n; i++){
            let child = node.getChildAt(i);
            if (child instanceof Laya.UIComponent){
                if (child.top !== null ||
                    child.left !== null ||
                    child.right !== null ||
                    child.bottom !== null ||
                    child.centerX !== null ||
                    child.centerY !== null){
                        (child["_widget"] as Laya.Widget).resetLayout();
                    }
            }

            this.fitLayout(child);
        }
    }
}    
