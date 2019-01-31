export default class Resource{
    public static enableVersionControl(manifestFile: string, callback?: Laya.Handler, type?: number):Promise<any>{
        return new Promise((resolve, reject) => {
            Laya.ResourceVersion.enable(manifestFile, Laya.Handler.create(this, function(){
                if (callback){
                    callback.run();
                }
                resolve();
            }), type);
        });
    }

    public static load(
        url: any, 
        complete?:Laya.Handler,
        progress?: Laya.Handler, 
        type?: string, 
        priority?: number, 
        cache?: boolean, 
        group?: string, 
        ignoreCache?: boolean):Promise<any>{
        // console.log("[res]load ", url);
        return new Promise((resolve, reject) => {
            Laya.loader.load(url, Laya.Handler.create(this, function(res){
                if (complete)
                    complete.runWith(res);
                resolve(res);
            }), progress, type, priority, cache, group, ignoreCache);
        });
    }

    public static load3D(
        url: any, 
        complete?: Laya.Handler, 
        progress?: Laya.Handler, 
        type?: string, 
        constructParams?: Array<any>, 
        propertyParams?: any, 
        priority?: number, 
        cache?: boolean):Promise<Laya.Node>{
        // console.log("[res]load 3d ", url);
        return new Promise((resolve, reject) => {
            Laya.loader.create(url, Laya.Handler.create(this, function(res:Laya.Node){
                if (complete)
                    complete.runWith(res);
                resolve(res);
            }), progress, type, constructParams, propertyParams, priority, cache);
        });
    }

    public static getRes(url){
        return Laya.loader.getRes(url);
    }
}