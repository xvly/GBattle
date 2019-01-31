import Resource from "../../LayaCommon/resource/Resource";

// import Resource from "../../../LayaCommon/gstd/resource/Resource";

export default class ConfigManager{
    public static item:{
        [id:string]:{
            id:string, 
            name:string, 
            desc:string, 
            icon:string,
            maxCount:number}};

    public static async setup(){
        // this.item = await Resource.load("config/Item.json", null, null, Laya.Loader.JSON);
        // this.global = await Resource.load("config/Global.json");
        // this.data = await Resource.load("config/Data.json");
        // this.balks = await Resource.load("config/Blaks.json");
        // this.huan = await Resource.load("config/Huan.json");
        // this.jimuColors = await Resource.load("config/JimuColors.json");
        // this.jimuDic = await Resource.load("config/JimuDic.json");
        // this.speedInfo = await Resource.load("config/SpeedInfo.json");
        // this.item = await Resource.load("config/Item.json");
    }
}