export default class Utils {
    /**
     * 数字前置补零
     * @param num 数字
     * @param length 长度
     */
    public static numPrefix(num:number, length:number):string{
        return (Array(length).join('0') + num).slice(-length);
    }

    /**
    * 格式化输出
    * @param str 源字符串
    * @param args 格式化参数，支持两种方式
    */
    public static strFormat(str:string, args){
        if (arguments.length > 0) {    
            if (arguments.length == 1 && typeof (args) == "object") {
                for (var key in args) {
                    if(args[key]!=undefined){
                        var reg = new RegExp("({" + key + "})", "g");
                        str = str.replace(reg, args[key]);
                    }
                }
            }
            else {
                for (var i = 0; i < arguments.length; i++) {
                    if (arguments[i] != undefined) {
                        //var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题，谢谢何以笙箫的指出
    　　　　　　　　　　　var reg= new RegExp("({)" + i + "(})", "g");
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
    public static strLen(str:string){
        let ret=0;
        for (let i=0; i<this.length; i++){
            let c = str.charCodeAt(i);
            if (c >= 0 && c <= 128)
                ret++;
            else
                ret += 2;
        }
        return ret;
    }

     /**
     * 对比版本号，例如：1.0.0
     * @param v1 对比值
     * @param v2 对比值
     * @return 对比结果， 1：大于， 0：等于， -1：小于
     */
    public static strVersionCompare(v1:string, v2:string):number{
        let v1Arr = v1.split('.');
        let v2Arr = v2.split('.');
        
        var len = Math.max(v1.length, v2.length);
        while (v1.length < len) {
            v1Arr.push('0');
        }
    
        while (v2.length < len) {
            v2Arr.push('0');
        }
    
        for (var i = 0; i < len; i++) {
            var num1 = parseInt(v1Arr[i]);
            var num2 = parseInt(v2Arr[i]);
            if (num1 > num2) {
                return 1;
            } else if (num1 < num2) {
                return -1;
            }
        }
    
        return 0;
    }

    /**
     * 是否是同一天，时间戳单位秒
     * @param oldTime 
     * @param newTime 
     */
    public static IsSameDay(oldTime, newTime) {
        var oldDate = new Date(oldTime * 1000);
        var oldY = oldDate.getFullYear();
        var oldM = oldDate.getMonth() + 1;
        var oldD = oldDate.getDate();

        var newDate = new Date(newTime * 1000);
        var newY = newDate.getFullYear();
        var newM = newDate.getMonth() + 1;
        var newD = newDate.getDate();

        if (newY != oldY || newM != oldM || newD != oldD) {
            return false;
        }

        return true;
    }
}