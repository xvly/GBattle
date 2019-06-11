import { DBBase } from "./DBBase";
import Net from "../net/Net";

/**
 * 使用星汉服务器提供的kvdata数据存储
 */
export default class DBXHServer extends DBBase{
    public async get(key:string){
        try{
            let res = await Net.httpGet("userData", {datatype:key});
            return JSON.parse(res.data);
        } catch(err){
            console.error("DBXHServer get data failed, key =", key);
            return null;
        }
    }

    public async add(key:string, data:any){
        if (typeof(data) === "string"){
            data = JSON.stringify(data);
        }
        await Net.httpPost("userData", {datatype:key, content:data});
    }
    
    public async update(key:string, data:any){
        if (typeof(data) !== "string"){
            data = JSON.stringify(data);
        }
        await Net.httpPost("userData", {datatype:key, content:data});
    }

    public async remove(key:string){
        await Net.httpPost("userData", {datatype:key, content:{}});
        // Laya.LocalStorage.removeItem(key);
    }
}