import BaseSprite3D from "../scene/BaseSprite3D";

export default class Resource {

    public static enableVersionControl(
        manifestFile: string,
        callback?: Laya.Handler,
        type?: number,
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            Laya.ResourceVersion.enable(
                manifestFile,
                Laya.Handler.create(this, function() {
                    if (callback) {
                        callback.run();
                    }
                    resolve();
                }),
                type,
            );
        });
    }

    public static is3DUrl(url: string) {
        return url.endsWith(".ls") || url.endsWith(".lh");
    }

    public static load(
        url: any,
        complete?: Laya.Handler,
        progress?: Laya.Handler,
        type?: string,
        priority?: number,
        cache?: boolean,
        group?: string,
        ignoreCache?: boolean,
    ): Promise<any> {
        // console.log("[res]load ", url);
        const cachedObj = this._resCaches[url];
        if (cachedObj && !cachedObj.destroyed) {
            if (complete) {
                complete.runWith(cachedObj);
            }
            return Promise.resolve(cachedObj);
        }

        return new Promise((resolve, reject) => {
            Laya.loader.load(
                url,
                Laya.Handler.create(this, function(res) {
                    if (complete) { complete.runWith(res); }
                    this._resCaches[url] = res;
                    resolve(res);
                }),
                progress,
                type,
                priority,
                cache,
                group,
                ignoreCache,
            );
        });
    }

    public static load3D(
        url: any,
        complete?: Laya.Handler,
        progress?: Laya.Handler,
        type?: string,
        constructParams?: any[],
        propertyParams?: any,
        priority?: number,
        cache?: boolean,
        isCompileShader = false,
    ): Promise<Laya.Node> {
        const cachedObj = this._resCaches[url];
        if (cachedObj && !cachedObj.destroyed) {
            if (complete) {
                complete.runWith(cachedObj);
            }
            return Promise.resolve(cachedObj);
        }

        return new Promise((resolve, reject) => {
            Laya.loader.create(
                url,
                Laya.Handler.create(this, function(obj: Laya.Node) {
                    if (obj == undefined) {
                        reject("load failed " + url);
                    } else {
                        if (isCompileShader) {
                            this.compileShader(obj);
                        }

                        if (complete) {
                            complete.runWith(obj);
                        }

                        this._resCaches[url] = obj;
                        resolve(obj);
                    }
                }),
                progress,
                type,
                constructParams,
                propertyParams,
                priority,
                cache,
            );
        });
    }

    public static getRes(url) {
        const cachedObj = this._resCaches[url];
        if (cachedObj) {
            return cachedObj;
        }

        return Laya.loader.getRes(url);
    }

    public static async loadPrefab(url) {
        const prefab = new Laya.Prefab();
        const obj = await Resource.load(url);
        prefab.json = obj;
        return Laya.Pool.getItemByCreateFun(url, prefab.create, prefab);
    }

    public static compileShader(obj: Laya.Sprite3D) {
        if (obj instanceof Laya.ShuriKenParticle3D) {
            const particleObj = obj as Laya.ShuriKenParticle3D;
            const renderer = obj.particleRenderer;
            const materials = renderer.materials;
            const spriteDefine = renderer._defineDatas.value;
            for (const material of materials) {
                if (material._shader) {
                    const materialData = material._defineDatas;
                    const publicDefine = 1 & ~material._disablePublicDefineDatas.value;
                    Laya.Shader3D.compileShader(
                        material._shader._name,
                        0,
                        0,
                        publicDefine,
                        spriteDefine,
                        material._defineDatas.value,
                    );
                }
            }
        }

        for (let i = 0, n = obj.numChildren; i < n; i++) {
            this.compileShader(obj.getChildAt(i) as Laya.Sprite3D);
        }
    }
    private static _resCaches: { [id: string]: any } = {};
}
