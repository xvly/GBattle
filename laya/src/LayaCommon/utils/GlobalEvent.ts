export const GlobalEventType = {
    appStart: "appStart",
    gameStart: "gameStart",
    onShow: "onShow",
    onHide: "onHide"
}

export default class GlobalEvent {
    private static dispatcher: Laya.EventDispatcher = new Laya.EventDispatcher();
    public static event(type: string, data?: any): boolean {
        return this.dispatcher.event(type, data);
    }

    public static hasListener(type: string): boolean {
        return this.dispatcher.hasListener(type);
    }

    public static on(type: string, caller: any, listener: Function, args?: Array<any>): Laya.EventDispatcher {
        return this.dispatcher.on(type, caller, listener, args);
    }

    public static once(type: string, caller: any, listener: Function, args?: Array<any>): Laya.EventDispatcher {
        return this.dispatcher.once(type, caller, listener, args);
    }

    public static off(type: string, caller: any, listener: Function, onceOnly?: boolean): Laya.EventDispatcher {
        return this.dispatcher.off(type, caller, listener, onceOnly);
    }
}
