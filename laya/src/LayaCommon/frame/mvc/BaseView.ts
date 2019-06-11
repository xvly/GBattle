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
import ViewManager, { ViewLayer } from "../../view/ViewManager";
import AudioManager from "../../audio/AudioManager";

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
    public layer:ViewLayer;
    public time2Destroy:number;
    public isOpen = false;
    public isClosing=false;
    private showEffect:ViewEffect;

    public args:any;

    protected get isFitBang(){
        return false;
    }

    /**
     * 加载界面
     * @param layout 布局文件
     */
    public async load(layout:string){
        console.log("[baseview]load ", layout);
        try {
            // 加载资源并显示
            let layoutData = await Resource.load(layout, null, null, Laya.Loader.JSON);
            this.createView(layoutData);

            // // 根据是否iphonex做屏幕调整
            if (this.isFitBang && Device.isBangsScreen()){
                if (Device.screenMode == "horizontal"){
                    // laya2.0beta4 马上设置不生效
                    this.width = Laya.stage.width-70;
                    Laya.timer.once(1, this, function(){
                        this.x = 35 + this.fixX;
                    });
                } else {
                    // laya2.0beta4 马上设置不生效
                    this.height = Laya.stage.height-70;
                    Laya.timer.once(1, this, function(){
                        this.y = 35 + this.fixY;
                    });
                }
            } else {
                this.height = Laya.stage.height;
                this.width = Laya.stage.width;

                this.y = this.fixY;
                this.x = this.fixX;
            }
            
            //
            this.fitLayout(this);
        } catch(e){
            console.error("[baseview]load fail ", e);
        }
    }

    private get fixX(){
        return (this.anchorX || 0) * this.width;
    }

    private get fixY(){
        return (this.anchorY || 0) * this.height;
    }

    public async processOpenEffect(effect:ViewEffect = ViewEffect.None){
        switch(effect){
            case ViewEffect.Alpha:{
                this.alpha = 0;
                await Tween.to(this, {alpha:1}, 300);
            }break;
            case ViewEffect.MoveLeft:{
                this.x = this.fixX +  Laya.stage.width;
                let toX = 0;
                if (this.isFitBang && Device.isBangsScreen() && Device.screenMode == "horizontal"){
                    toX = 35;
                }
                toX += this.fixX;
                await Tween.to(this, {x:toX}, 300, Laya.Ease.cubicOut);
            }break;
            case ViewEffect.MoveRight:{
                this.x = this.fixX -Laya.stage.width;
                let toX = 0;
                if (this.isFitBang && Device.isBangsScreen() && Device.screenMode == "horizontal")
                    toX = 35;
                toX += this.fixX;
                await Tween.to(this, {x:toX}, 300, Laya.Ease.cubicOut);
            }break;
            case ViewEffect.MoveUp:{
                this.y = Laya.stage.height + this.fixY;
                let toY = 0;
                if (this.isFitBang && Device.isBangsScreen() && Device.screenMode == "vertical")
                    toY = 35;
                toY += this.fixY;
                await Tween.to(this, {y:toY}, 300, Laya.Ease.cubicOut);
            }break;
            case ViewEffect.MoveDown:{
                this.y = -Laya.stage.height + this.fixY;
                let toY = 0;
                if (this.isFitBang && Device.isBangsScreen() && Device.screenMode == "vertical")
                    toY = 35;
                toY += this.fixY;
                await Tween.to(this, {y:toY}, 300, Laya.Ease.cubicOut);
            }break;
            case ViewEffect.Scale:{
                this.scale(0,0);
                await Tween.to(this, {scaleX:1, scaleY:1}, 200);
            }break;
            default:{
                if (this.isFitBang && Device.isBangsScreen()){
                    if (Device.screenMode == "vertical"){
                        this.y = 35 + this.fixY;
                    } else {
                        this.x = 35 + this.fixX;
                    }
                }
                else {
                    this.y = this.fixY;
                    this.x = this.fixX;
                }
            };
        }
    }

    /**
     * 
     * @param effect 
     * @param args 
     */
    public async open(
        closeOther?: boolean, 
        param?: any, 
        effect:ViewEffect = ViewEffect.None,
        voice?:number){
        this.active = true;
        this.visible = true;
        this.showEffect = effect;

        if (voice){
            // AudioManager.playConfig(voice);
        }
        
        await this.processOpenEffect(effect);
       
        this.isOpen = true;
    }

    public async processCloseEffect(type?:string, effect?:ViewEffect){
        if (!effect){
            switch(this.showEffect){
                case ViewEffect.MoveRight:effect = ViewEffect.MoveLeft;break;
                case ViewEffect.MoveLeft:effect = ViewEffect.MoveRight;break;
                case ViewEffect.Scale:effect = ViewEffect.Scale;break;
                case ViewEffect.MoveUp:effect = ViewEffect.MoveDown;break;
                case ViewEffect.MoveDown:effect = ViewEffect.MoveUp;break;
                case ViewEffect.Alpha:effect = ViewEffect.Alpha;break;
                default:effect = ViewEffect.None;break;
            }
        }

        switch(effect){
            case ViewEffect.Alpha:{
                await Tween.to(this, {alpha:0}, 300);
            }break;
            case ViewEffect.MoveRight:{
                await Tween.to(this, {x:Laya.stage.width+this.fixX}, 300, Laya.Ease.cubicIn);
            }break;
            case ViewEffect.MoveLeft:{
                await Tween.to(this, {x:-Laya.stage.width+this.fixX}, 300, Laya.Ease.cubicIn);
            }break;
            case ViewEffect.MoveUp:{
                await Tween.to(this, {y:-Laya.stage.height+this.fixY}, 300, Laya.Ease.cubicIn);
            }break;
            case ViewEffect.MoveDown:{
                await Tween.to(this, {y:Laya.stage.height+this.fixY}, 300, Laya.Ease.cubicIn);
            }break;
            case ViewEffect.Scale:{
                await Tween.to(this, {scaleX:0, scaleY:0}, 200);
            }break;
            default:{
                this.onClosed();
            }break;
        }
    }
    
    public async close(type?:string, effect?:ViewEffect, voice?:number){
        if (!this.isOpen){
            return Promise.resolve();
        }

        // if (voice){
        //     AudioManager.playConfig(voice);
        // }

        this.onBeforeClose();

        ViewManager.onViewClose(this.id);
        this.time2Destroy = Laya.timer.currTimer+10000;
        this.isClosing=true;
        this.isOpen = false;

        await this.processCloseEffect(type, effect);
        this.onClosed();
    }

    public onBeforeClose(){}

    public onClosed(){
        super.onClosed();

        this.visible = false;
        this.active =false;
    }

    public onEnable(){}

    public onDisable(){
        this.isClosing=false;
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
