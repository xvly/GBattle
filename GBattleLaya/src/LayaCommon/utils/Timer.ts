export default class Timer {
    public static once() {

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
}