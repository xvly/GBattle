import ViewUtils from "../view/ViewUtils";
import Utils from "./Utils";
import MathUtils from "./MathUtils";
import GlobalEvent from "./GlobalEvent";

export const JoyEvent = {
    moving: "moving",
    moveEnd: "moveEnd",
    reset: "reset"
};

export default class JoyStick extends Laya.Script {
    private get isVisible() {
        return (this.owner as Laya.UIComponent).visible;
    }
    public static viewDirToCameraDir(viewDir, cameraTransform: Laya.Transform3D): Laya.Vector3 {
        if (cameraTransform == null) {
            return;
        }

        if (this.tempVec3 == null) {
            this.tempVec3 = new Laya.Vector3();
        }

        if (this.tempQuaternion == null) {
            this.tempQuaternion = new Laya.Quaternion();
        }

        const cameraFoward = cameraTransform.forward;
        cameraFoward.y = 0;

        this.tempVec3.x = viewDir.x;
        this.tempVec3.y = 0;
        this.tempVec3.z = viewDir.y;

        let rad = MathUtils.vecRad(this.tempVec3, Laya.Vector3.ForwardLH);
        if (viewDir.x > 0) {
            rad *= -1;
        }

        Laya.Quaternion.createFromAxisAngle(Laya.Vector3.Up, rad, this.tempQuaternion);
        Laya.Vector3.transformQuat(cameraFoward, this.tempQuaternion, this.tempVec3);

        return this.tempVec3;
    }

    private static tempVec3: Laya.Vector3;
    private static tempQuaternion: Laya.Quaternion;
    // public static onMoving:Laya.Handler;
    // public static onMoveEnd:Laya.Handler;

    private imgThumb: Laya.Image;
    private imgPoint: Laya.Image;
    private imgPointDeco: Laya.Image;

    private originX: number;
    private originY: number;

    private center: Laya.Vector2;

    private curPos: Laya.Vector2;
    private _cacheKeyList: number[] = [];

    public onAwake() {
        this.imgThumb = this.owner.getChildByName("imgThumb") as Laya.Image;
        this.imgPoint = this.imgThumb.getChildByName("imgPoint") as Laya.Image;
        this.imgPointDeco = this.imgThumb.getChildByName("imgPointDeco") as Laya.Image;
        this.imgPointDeco.visible = false;

        const point = ViewUtils.getWidgetGlobalPos(this.imgThumb);
        this.originX = point.x;
        this.originY = point.y;

        GlobalEvent.on(JoyEvent.reset, this, this.reset);

        if (Laya.Browser.onPC) {
        }
    }

    public onDestroy() {
        GlobalEvent.off(JoyEvent.reset, this, this.reset);
    }

    public reset() {
        ViewUtils.setWidgetGlobalPos(this.originX, this.originY, this.imgThumb);
        ViewUtils.setWidgetGlobalPos(this.originX, this.originY, this.imgPoint);
        this.imgPointDeco.visible = false;

        this._validTouchId = null;
        this.center = null;
        this.curPos = null;
    }
    private _validTouchId?: number = null;
    public onMouseDown(event: Laya.Event) {
        if (!this.isVisible) {
            return;
        }

        const x = event.stageX;
        const y = event.stageY;
        if (x > Laya.stage.width / 2 || y < Laya.stage.height / 2) {
            return;
        }
        this._validTouchId = event.touchId;
        this.center = new Laya.Vector2(x, y);
        this.curPos = null;

        ViewUtils.setWidgetGlobalPos(x, y, this.imgThumb);
        ViewUtils.setWidgetGlobalPos(x, y, this.imgPoint);
    }

    public onMouseOut(event: Laya.Event) {
        this.onMouseUp(event);
    }

    public onMouseUp(event: Laya.Event) {
        if (!this.isVisible || this.center == null || this._validTouchId != event.touchId) {
            return;
        }

        // const x = event.stageX;
        // const y = event.stageY;
        // if (x > Laya.stage.width / 2 || y < Laya.stage.height / 2) {
        //     return;
        // }

        this.reset();
        // this.imgThumb.visible = false;

        GlobalEvent.event(JoyEvent.moveEnd, event);
    }
    public onMouseMove(event: Laya.Event) {
        if (!this.isVisible || this._validTouchId != event.touchId) {
            return;
        }
        // const x = event.stageX;
        // const y = event.stageY;
        // if (x > Laya.stage.width / 2 || y < Laya.stage.height / 2) {
        //     return;
        // }

        if (this.center == null) {
            return;
        }

        if (this.curPos == null) {
            this.curPos = new Laya.Vector2();
        }

        this.curPos.x = event.stageX;
        this.curPos.y = event.stageY;
    }

    public onUpdate() {
        if (!this.isVisible) {
            return;
        }

        if (this.center == null || this.curPos == null) {
            return;
        }

        const x = this.curPos.x;
        const y = this.curPos.y;

        const deltaX = x - this.center.x;
        const deltaY = y - this.center.y;

        if (Math.abs(deltaX) <= 0.01 && Math.abs(deltaY) <= 0.01) {
            this.imgPointDeco.visible = false;
            return;
        }

        const dis = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (dis <= 0.01) {
            this.imgPointDeco.visible = false;
            return;
        }

        const dirX = deltaX / dis;
        const dirY = deltaY / dis;
        GlobalEvent.event(JoyEvent.moving, { x: dirX, y: -dirY });

        // 处理朝向
        this.imgPointDeco.visible = true;
        const pointRadForDeco = Math.atan2(dirY, dirX) - Math.atan2(-1, 0);
        // 这里加上90度，是因为默认的箭头朝向是-90度的
        this.imgPointDeco.rotation = MathUtils.radinToAgnle(pointRadForDeco) + 90;

        const r = this.imgThumb.width / 2 - this.imgPoint.width / 2 - 32;
        if (dis > r) {
            ViewUtils.setWidgetGlobalPos(this.center.x + r * dirX, this.center.y + r * dirY, this.imgPoint);
        } else {
            ViewUtils.setWidgetGlobalPos(x, y, this.imgPoint);
        }
    }

    public onKeyPress(event: Laya.Event) {
        if (!this.isVisible || !Laya.Browser.onPC) {
            return;
        }
        if (this._cacheKeyList.indexOf(event.keyCode) == -1) {
            this._cacheKeyList.push(event.keyCode);
        }

        let x = 0;
        let y = 0;
        this._cacheKeyList.forEach(keyCode => {
            if (keyCode - 32 == Laya.Keyboard.W) {
                // up
                y -= 10;
            } else if (keyCode - 32 == Laya.Keyboard.S) {
                // down
                y += 10;
            } else if (keyCode - 32 == Laya.Keyboard.A) {
                // left
                x -= 10;
            } else if (keyCode - 32 == Laya.Keyboard.D) {
                // right
                x += 10;
            }
        });

        this.center = new Laya.Vector2(0, 0);

        if (this.curPos == null) {
            this.curPos = new Laya.Vector2();
        }

        this.curPos.x = x;
        this.curPos.y = y;
    }

    public onKeyUp(event: Laya.Event) {
        if (!Laya.Browser.onPC) {
            return;
        }
        this._cacheKeyList.splice(this._cacheKeyList.indexOf(event.keyCode + 32), 1);
        if (this._cacheKeyList.length <= 0) {
            this.onMouseUp(event);
        }
    }
}
