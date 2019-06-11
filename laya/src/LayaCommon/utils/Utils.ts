import { isObject } from "./TypeCheck";
import Device from "../device/Device";
import GameConfig from "../../GameConfig";

export default class Utils {
    /**
     * 数字前置补零
     * @param num 数字
     * @param length 长度
     */
    public static numPrefix(num: number, length: number): string {
        return (Array(length).join("0") + num).slice(-length);
    }

    /**
     * 格式化输出
     * @param str 源字符串
     * @param args 格式化参数，支持两种方式
     */
    public static strFormat(str: string, args) {
        if (arguments.length > 0) {
            if (arguments.length == 1 && typeof args == "object") {
                for (const key in args) {
                    if (args[key] != undefined) {
                        const reg = new RegExp("({" + key + "})", "g");
                        str = str.replace(reg, args[key]);
                    }
                }
            } else {
                for (let i = 0; i < arguments.length; i++) {
                    if (arguments[i] != undefined) {
                        // var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题，谢谢何以笙箫的指出
                        const reg = new RegExp("({)" + i + "(})", "g");
                        str = str.replace(reg, arguments[i]);
                    }
                }
            }
        }
        return str;
    }

    /**
     * 字符串长度
     * @param str 源数据
     */
    public static strLen(str: string) {
        let ret = 0;
        for (let i = 0; i < this.length; i++) {
            const c = str.charCodeAt(i);
            if (c >= 0 && c <= 128) {
                ret++;
            } else {
                ret += 2;
            }
        }
        return ret;
    }

    /**
     * 文本裁剪，中文表示2个字符，英文表示1个字符
     *
     * @export
     * @param {string} origin 原始字符串
     * @param {number} [length=8] 文本限制的长度，超过该长度使用省略号
     */
    public static adaptString(origin: string, length: number = 8): string {
        let currentLength = 0;
        let ret = "";
        for (let i of origin) {
            // console.log(i)
            // console.log(i.match(/[\u4e00-\u9fa5]/))
            const isChinese = i.match(/[\u4e00-\u9fa5]/);
            if (isChinese) {
                currentLength += 2;
            } else {
                currentLength += 1;
            }
            ret += i;

            if (currentLength >= length) {
                break;
            }
        }
        if (ret != origin) {
            ret += "...";
        }
        return ret;
    }

    /**
     * 对比版本号，例如：1.0.0
     * @param v1 对比值
     * @param v2 对比值
     * @return 对比结果， 1：大于， 0：等于， -1：小于
     */
    public static strVersionCompare(v1: string, v2: string): number {
        const v1Arr = v1.split(".");
        const v2Arr = v2.split(".");

        const len = Math.max(v1.length, v2.length);
        while (v1.length < len) {
            v1Arr.push("0");
        }

        while (v2.length < len) {
            v2Arr.push("0");
        }

        for (let i = 0; i < len; i++) {
            const num1 = parseInt(v1Arr[i]);
            const num2 = parseInt(v2Arr[i]);
            if (num1 > num2) {
                return 1;
            } else if (num1 < num2) {
                return -1;
            }
        }

        return 0;
    }

    /**
     * 是否是同一天，时间戳单位毫秒
     * @param oldTime
     * @param newTime
     */
    public static IsSameDay(oldTime: number, newTime: number): boolean {
        const oldDate = new Date(oldTime);
        const oldY = oldDate.getFullYear();
        const oldM = oldDate.getMonth() + 1;
        const oldD = oldDate.getDate();

        const newDate = new Date(newTime);
        const newY = newDate.getFullYear();
        const newM = newDate.getMonth() + 1;
        const newD = newDate.getDate();

        if (newY != oldY || newM != oldM || newD != oldD) {
            return false;
        }

        return true;
    }

    /**
     * 获取json的键
     * @param data
     */
    public static getJsonKey(data: object) {
        const keys = [];
        for (const key in data) {
            keys.push(key);
        }
        return keys;
    }

    /**
     * 获取json的值
     * @param data
     */
    public static getJsonValue(data: object) {
        const values = [];
        for (const key in data) {
            values.push(data[key]);
        }
        return values;
    }

    /**
     * 格式化，hour:minute:second
     * @param remainMs
     */
    public static formatTime(remainMs: number) {
        const second = this.numPrefix(Math.floor(remainMs / 1000) % 60, 2);
        const minute = this.numPrefix(Math.floor(remainMs / 1000 / 60) % 60, 2);
        const hour = this.numPrefix(Math.floor(remainMs / 1000 / 60 / 60), 2);
        return hour + ":" + minute + ":" + second;
    }

    /**
     * 随机 min 到 max 的数字，包括 min 和 max，整型。
     * 如果不传 max 则是 0到 min 的数字，包括 0和 min
     * @param min
     * @param max
     */
    public static randomN(min: number, max: number = null): number {
        if (max == null) {
            max = min;
            min = 0;
        }
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    public static isEmptyObject(obj: any): boolean {
        return !obj || (isObject(obj) && JSON.stringify(obj) === "{}");
    }

    /**
     * 转换为微信的坐标系，单位为点
     * 返回x，y，width，height
     */
    private static tempPoint1: Laya.Point = new Laya.Point();
    private static tempPoint2: Laya.Point = new Laya.Point();
    public static toWXCoordinateFromNode(
        node: Laya.Sprite
    ): { x: number; y: number; width: number; height: number } {
        Utils.tempPoint1.x = 0;
        Utils.tempPoint2.x = 0;
        const globalP = node.localToGlobal(Utils.tempPoint1);
        const globalX = globalP.x;
        const globalY = globalP.y;
        const radio = (() => {
            if (GameConfig.scaleMode == "fixedheight") {
                return Device.systemInfo.windowHeight / GameConfig.height;
            } else {
                return Device.systemInfo.windowWidth / GameConfig.width;
            }
        })();
        return {
            x: (globalX * radio) << 0,
            y: (globalY * radio) << 0,
            width: (node.width * radio) << 0,
            height: (node.height * radio) << 0
        };
    }

    /**
     * 二分查找
     * @param list 原始数组，必须是升序排列的
     * @param item 需要查找的item
     * @param compare 如果t比u小，返回-1，相等返回1，否则返回1
     */
    public static binarySearch<T, U>(list: T[], item: U, compare: (t: T, u: U) => 1 | -1 | 0): T | null {
        if (list.length == 0) return null;
        if (list.length == 1) {
            return compare(list[0], item) == 0 ? list[0] : null;
        } else {
            const middleIndex = Math.floor(list.length / 2);
            const middle = list[middleIndex];
            const compareRet = compare(middle, item);
            if (compareRet == 0) {
                return middle;
            } else if (compareRet == 1) {
                return Utils.binarySearch(list.slice(0, middleIndex - 1), item, compare);
            } else {
                return Utils.binarySearch(list.slice(middleIndex + 1), item, compare);
            }
        }
    }

    /** 数组的并集，这里要求 arr1和arr2本身就已经是非重复的了 */
    public static unionArray<T>(
        arr1: T[],
        arr2: T[],
        isEqual: (a: T, b: T) => boolean = (a: T, b: T) => {
            return a === b;
        }
    ): T[] {
        if (!arr1 || arr1.length == 0) {
            return arr2;
        }
        if (!arr2 || arr2.length == 0) {
            return arr1;
        }
        const tmp = arr1.slice();
        for (let index = 0; index < arr1.length || index < arr2.length; index++) {
            if (index < arr1.length && index < arr2.length) {
                if (!isEqual(arr1[index], arr2[index])) {
                    tmp.push(arr2[index]);
                }
            } else if (index < arr1.length) {
            } else if (index < arr2.length) {
                tmp.push(arr2[index]);
            }
        }
        return tmp;
    }

    /**
     * 获取矩阵中当前元素的下一个元素，都是归一化的坐标
     * @param cur 当前点
     * @param row 矩阵的行数
     * @param column 矩阵的列数
     * @param loop 是否循环整个矩阵，是的话，矩阵最后一个元素的下一个元素是{0, 0}
     */
    public static matrixNextItem(
        cur: { r: number; c: number },
        row: number,
        column: number,
        loop: boolean = false
    ): { r: number; c: number } | null {
        const next1D = cur.r * column + cur.c + 1;
        if (next1D >= row * column) {
            if (loop) {
                return { r: 0, c: 0 };
            } else {
                return null;
            }
        } else {
            return { r: Math.floor(next1D / column), c: next1D % column };
        }
    }

    public static pointInRect(
        p: { x: number; y: number },
        rect: { x: number; y: number; width: number; height: number }
    ): boolean {
        const minX = rect.x;
        const minY = rect.y;
        const maxX = rect.x + rect.width;
        const maxY = rect.y + rect.height;
        if (p.x >= minX && p.x < maxX && p.y >= minY && p.y < maxY) {
            return true;
        }
        return false;
    }
}
