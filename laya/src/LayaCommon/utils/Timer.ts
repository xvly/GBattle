export default class Timer {
    private static _serverTime:number;
    public static setServerTime(t:number){
        this._serverTime = t;
    }

    public static updateServerTime(deltaMs:number){
        this._serverTime += deltaMs;
    }

    public static get deltaMs(){
        if (Laya.timer.delta > 1000)
            return 33;
        else 
            return Laya.timer.delta;
    }

    public static get deltaS(){
        return this.deltaMs / 1000;
    }

    /**
     * 当前时间戳，毫秒
     */
    public static get curMs(){
        return this._serverTime;
        // return Laya.timer.currTimer;
    }

    public static clear(caller, method:Function){
        Laya.timer.clear(caller, method);
    }

    public static clearAll(caller){
        Laya.timer.clearAll(caller);
    }

    public static async loop(delay: number, caller: any, method: Function, args?: Array<any>, coverBefore?: boolean, jumpFrame?: boolean, duration?: number) {
        Laya.timer.loop(delay, caller, method, args, coverBefore, jumpFrame);
        if (duration != null) {
            return new Promise((resolve, reject) => {
                Laya.timer.once(duration, caller, function () {
                    Laya.timer.clear(caller, method);
                    resolve();
                });
            })
        } else {
            return Promise.resolve();
        }
    }

    public static async frameLoop(delay: number, caller: any, method: Function, args?: Array<any>, coverBefore?: boolean, jumpFrame?: boolean, count?: number) {
        if (count != null) {
            return new Promise((resolve, reject) => {
                let curCount = 0;
                let loopMethod = function () {
                    method(caller, args);
                    curCount++;
                    if (curCount >= count) {
                        Laya.timer.clear(caller, loopMethod);
                        resolve();
                    }
                }

                Laya.timer.loop(delay, caller, loopMethod, args, coverBefore, jumpFrame);
            })
        } else {
            Laya.timer.loop(delay, caller, method, args, coverBefore, jumpFrame);
            return Promise.resolve();
        }
    }

    public static frameOnce(
        delay: number, caller: any, method: Function, args?: Array<any>, coverBefore?: boolean){
        Laya.timer.frameOnce(delay, caller, method, args, coverBefore);
    }

    public static once(
        delay: number, caller: any, method: Function, args?: Array<any>, coverBefore?: boolean){
        Laya.timer.once(delay, caller, method, args, coverBefore);
    }
    public static async wait(delay: number) {
        return new Promise((resolve, reject) => {
            Timer.once(delay, this, function () {
                resolve();
            });
        });
    }

    /** 获取当天日期　YYYY-MM-DD */
    public static get getNowFormatDate () {
        let date = new Date();
        let seperator1 = "-";
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let monthTxt = (month >= 1 && month <= 9 ? '0' : '') + month;

        let strDate = date.getDate();
        let strDateTxt = (strDate >= 0 && strDate <= 9 ? '0' : '') + strDate;

        let currentdate = year + seperator1 + monthTxt + seperator1 + strDateTxt;
        return currentdate;
    }

    /**
     * 是否周末
     * 备注：true=>工作日(1-5)  false=>周末(0,6)
     */
    public static get isInWeekday () {
        const now = new Date();
        const isInWeekday = [0, 6].indexOf(now.getDay()) == -1;
        return isInWeekday;
    }

    // manual timer
    private static _manualTimers:{
        time?:number,
        timeOver?:number,
        frame?:number,
        frameOver?:number,
        caller:any,
        method:Function,
        loopCount:number,
        args?:Array<any>
    }[] = [];

    private static _manualTimestamp:number;
    private static _manualDeltaMs:number;
    private static _manualCurFrame:number;

    public static manualReset(){
        this._manualCurFrame = 0;
    }

    public static manualSetTime(timestamp:number){
        this._manualTimestamp = timestamp as number;
    }

    public static get manualCurMs(){
        return this._manualTimestamp;
    }

    public static get manualCurS(){
        return this.manualCurMs/1000;
    }

    public static get manualDeltaMs(){
        return this._manualDeltaMs;
    }

    public static get manualDeltaS(){
        return this.manualDeltaMs / 1000;    
    }

    public static manualUpdate(deltaMs:number){
        this._manualTimestamp += deltaMs;
        this._manualDeltaMs = deltaMs;

        this._manualCurFrame++;
        
        for (let i=this._manualTimers.length-1; i>=0; i--){
            let timer = this._manualTimers[i];

            let isCall = false;
            if (timer.frame != null){
                if (this._manualCurFrame >= timer.frameOver){
                    timer.frameOver = this._manualCurFrame + timer.frame;
                    isCall = true;
                }
            } else if (timer.time != null){
                if (this._manualTimestamp >= timer.timeOver){
                    timer.timeOver = this.manualCurMs + timer.time;
                    isCall = true;
                }
            }

            // call method
            if (isCall){
                // method
                if (timer.args){
                    timer.method.apply(timer.caller, timer.args);
                } else {
                    timer.method.call(timer.caller);
                }
                
                // loop
                if (timer.loopCount > 0){
                    timer.loopCount--;
                }
                if (timer.loopCount == 0){
                    this._manualTimers.splice(i, 1);
                }
            }
        }
    }

    public static manualOnce(delay: number, caller: any, method: Function, args?: Array<any>){
        if (delay <= 0){
            method.apply(caller, args);
        } else {
            let timer = {
                time:delay,
                timeOver:this.manualCurMs + delay,
                caller:caller,
                method:method,
                loopCount:1,
                args:args
            };
    
            this._manualTimers.push(timer);
        }
    }

    public static manualLoop(delay: number, caller: any, method: Function, args?: Array<any>){
        let timer = {
            time:delay,
            timeOver:this._manualTimestamp + delay,
            caller:caller,
            method:method,
            loopCount:-1,
            args:args
        };
        this._manualTimers.push(timer);
    }

    public static manualFrameLoop(frame: number, caller: any, method: Function, args?: Array<any>, count?:number){
        let timer = {
            frame:frame,
            frameOver:this._manualCurFrame + frame,
            caller:caller,
            method:method,
            loopCount:count || -1,
            args:args
        };
        this._manualTimers.push(timer);
    }

    public static manualFrameOnce(frame: number, caller: any, method: Function, args?: Array<any>){
        let timer = {
            frame:frame,
            frameOver:this._manualTimestamp + frame,
            caller:caller,
            method:method,
            loopCount:1,
            args:args
        }
        this._manualTimers.push(timer);
    }

    public static manualClear(caller:any, method:Function){
        for (let i=0,n=this._manualTimers.length; i<n; i++){
            let timer = this._manualTimers[i];
            if (timer.caller == caller && timer.method == method){
                this._manualTimers.splice(i, 1);
                break;
            }
        }
    }

    public static manualClearAll(caller?:any){
        if (caller){
            for (let i=this._manualTimers.length-1; i>=0; i--){
                let timer = this._manualTimers[i];
                if (timer.caller == caller){
                    this._manualTimers.splice(i, 1);
                }
            }
        } else {
            this._manualTimers = [];
        }
    }
}