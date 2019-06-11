import { DBBase } from "./DBBase";
import DBLocalStorage from "./DBLocalStorage";
import DBXHServer from "./DBXHServer";

export enum DBType {
    localStorage,
    wechat,
    XHServer
}

export default class DB {
    private static _db: DBBase;

    private static _data: { [id: string]: any } = {};
    private static _dataCache: { [id: string]: any } = null;

    public static setup(dbType: DBType, defaultData?: any, saveDelta: number = 1000) {
        switch (dbType) {
            case DBType.localStorage: {
                this._db = new DBLocalStorage();
            } break;
            case DBType.XHServer: {
                this._db = new DBXHServer();
            } break;
        }
    }

    public static async get(key: string) {
        let ret = await this._db.get(key);
        if (ret == ""){
            return null;
        } else {
            return ret;
        }
    }

    public static update(key: string, data: any) {
        if (!key || !data) {
            console.error("[db]update failed, key or data is null");
            return;
        }

        if (typeof (data) == "string") {
            data = JSON.parse(data);
        }

        // cache data
        if (this._dataCache == null)
            this._dataCache = {};

        if (this._dataCache[key]) {
            let cache = this._dataCache[key];
            for (let i in data) {
                cache[i] = data[i];
            }
            this._dataCache[key] = cache;
        } else {
            this._dataCache[key] = data;
        }

        // timer
        Laya.stage.clearTimer(this, this.delayUpdate);
        Laya.stage.timerOnce(3000, this, this.delayUpdate);
    }

    private static delayUpdate() {
        if (!this._dataCache)
            return;

        console.log("[db]real save ", this._dataCache);
        for (let key in this._dataCache) {
            this._db.update(key, this._dataCache[key]);
        }
        this._dataCache = null;

        
    }
}
