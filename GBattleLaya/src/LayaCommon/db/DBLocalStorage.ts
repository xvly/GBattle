import { DBBase } from "./DBBase";

export default class DBLocalStorage extends DBBase{
    public async get(key:string){
        return Laya.LocalStorage.getJSON(key);
    }

    public async add(key:string, data:any){
        Laya.LocalStorage.setItem(key, JSON.stringify(data));
    }
    
    public async update(key:string, data:any){
        Laya.LocalStorage.setItem(key, JSON.stringify(data));
    }

    public async remove(key:string){
        Laya.LocalStorage.removeItem(key);
    }

}