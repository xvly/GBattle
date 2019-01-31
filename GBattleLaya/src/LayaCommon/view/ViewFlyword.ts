import Tween from "../utils/Tween";

export enum FlyWordPos {
    High = 1,
    Middle = 2,
    Low = 3
}

export interface IFlywordOptions {
    text?: string;
    fromPos: { x: number, y: number };
    isAddBG?: boolean;
    toPos?: { x: number, y: number };
    fromRot?: number;
    color?: string;
    stroke?: number;
    strokeColor?: string;
    ease?: Function;
    complete?: Laya.Handler;
    fontSize?: number;
    bold?: boolean;
    duration?: number;
    iconUrl?: string;
}

class FlywordItem extends Laya.UIComponent {
    public constructor() {
        super();

        this.bg = new Laya.Image("https://cdn.kuaiyugo.com/xyx/t4/Common/Common_Cover.png");
        this.bg.centerX = 0;
        this.bg.centerY = 0;
        this.bg.width = Laya.stage.width;
        this.bg.height = 60;
        this.bg.visible = false;
        this.addChild(this.bg);

        this.text = new Laya.Label();
        this.text.font = "SimHei"
        this.text.anchorX = 0.5;
        this.text.anchorY = 0.5;
        this.text.centerX = 0;
        this.text.centerY = 0;
        this.text.align = "center";
        this.text.valign = "middle";
        this.addChild(this.text);

        this.icon = new Laya.Image();
        this.icon.centerX = 0;
        this.icon.centerY = 0;
        this.icon.width = 50;
        this.icon.height = 50;
        this.icon.visible = false;
        this.text.addChild(this.icon);
    }

    public bg: Laya.Image;
    public text: Laya.Label;
    public lastItem: FlywordItem;
    public icon: Laya.Image;

    public set(text?: string, fontSize?: number, isBold?: boolean, color?: string, stroke?: number, strokeColor?: string, isAddBG?: boolean, iconUrl?: string) {
        this.text.fontSize = fontSize || 38;
        this.text.bold = isBold;
        this.text.color = color || "#ffffff";//"#ef310c"
        this.text.text = text || "none";
        this.text.stroke = stroke || 0;
        this.text.strokeColor = strokeColor || "#000000";

        this.bg.visible = isAddBG;
        if (iconUrl) {
            this.icon.visible = true;
            this.icon.skin = iconUrl;
            this.icon.centerX = -this.text.width / 2 - 25;
        } else {
            this.icon.visible = false;
        }
    }

    public moveup(y) {
        this.y = y;
        if (this.lastItem && this.lastItem.visible) {
            this.lastItem.moveup(this.y - this.height - 5);
        }
    }
}

export class ViewFlyword {
    private static root: Laya.View;
    private static items: Array<FlywordItem>;

    public static setup() {
        this.root = Laya.stage.addChild(new Laya.View()) as Laya.View;
        this.root.zOrder = 999;
        this.items = new Array<FlywordItem>();
    }

    private static _createItem(data: IFlywordOptions): FlywordItem {
        let item: FlywordItem = null;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].visible == false) {
                item = this.items[i]
                item.visible = true;
                item.alpha = 1;
                break;
            }
        }

        if (item == null) {
            item = new FlywordItem();
            item.anchorX = 0.5;
            item.anchorY = 0.5;
            this.root.addChild(item);
            this.items.push(item);
        }

        item.set(data.text, data.fontSize, data.bold, data.color, data.stroke, data.strokeColor, data.isAddBG, data.iconUrl);
        item.pos(data.fromPos.x, data.fromPos.y);
        return item;
    }


    public static defaultPos(pos: FlyWordPos) {
        switch (pos) {
            case FlyWordPos.High: {
                return { x: Laya.stage.width / 2, y: Laya.stage.height / 4 };
            }
            case FlyWordPos.Middle: {
                return { x: Laya.stage.width / 2, y: Laya.stage.height / 2 };
            }
            case FlyWordPos.Middle: {
                return { x: Laya.stage.width / 2, y: Laya.stage.height / 4 * 3 };
            }
            default: {
                console.warn("[flyword]default pos unvalid")
            }
        }
    }

    private static lastTip: FlywordItem;
    public static showTip(text: string, iconUrl?: string) {
        let pos = this.defaultPos(FlyWordPos.High);
        if (this.lastTip && this.lastTip.y - pos.y < 60) {
            pos.y = this.lastTip.y + 65;
        }

        this.show({
            text: text,
            fromPos: pos,
            color: "#ffffff",
            isAddBG: true,
            iconUrl: iconUrl,
        })
    }


    // data : text, color, originPos, targetPos, color, stroke, strokeColor, ease, complete, fontSize, bold, duration
    public static async show(data: IFlywordOptions) {
        let item = this._createItem(data);
        this.lastTip = item;

        if (!data.toPos)
            data.toPos = { x: data.fromPos.x, y: data.fromPos.y - 50 };

        await Tween.to(item, { scaleX: 1.1, scaleY: 1.1 }, 100);
        await Tween.to(item, { scaleX: 1, scaleY: 1 }, 100);
        await Tween.to(item, { x: data.toPos.x, y: data.toPos.y }, data.duration || 1000);
        await Tween.to(item, { alpha: 0 }, 500);

        item.visible = false;
    }
}
