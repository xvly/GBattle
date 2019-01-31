export enum InputEvent{
    click = 0,
    slide = 1,
    dragStart = 10,
    dragMove = 11,
    dragEnd = 12
}

export default class Input{
    private static dispatcher:Laya.EventDispatcher;

    public static setup(){
        this.dispatcher = new Laya.EventDispatcher();

        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onDragStart);
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onDragMove);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onDragEnd);
    }

    public static on(type:InputEvent, caller:any, method:Function, args?:any[]){
        this.dispatcher.on(type.toString(), caller, method, args);
    }

    public static off(type:InputEvent, caller:any, method:Function){
        this.dispatcher.off(type.toString(), caller, method);
    }

    private static onDragStart(res:Laya.Event){
        this.dispatcher.event(InputEvent.dragStart.toString(), res);
    }

    private static onDragMove(res:Laya.Event){
        this.dispatcher.event(InputEvent.dragMove.toString(), res);
    }

    private static onDragEnd(res:Laya.Event){
        this.dispatcher.event(InputEvent.dragEnd.toString(), res);
    }
}