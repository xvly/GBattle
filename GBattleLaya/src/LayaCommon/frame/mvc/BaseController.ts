import Base64 from "../../utils/Base64";
import Net from "../../net/Net";
import GlobalEvent, { GlobalEventType } from "../../utils/GlobalEvent";

export interface ProtoRes{
    code:number;
    data:any;
}

export default class BaseController{
    constructor(){
        this.on(GlobalEventType.gameStart, this.onGameStart);
    }

    protected async onGameStart(){}

    protected async request(
        cmd:number, 
        proto:any,
        data:any,
        caller?:any,
        method?:(code:number, msg:Uint8Array) => void){

        try{
            let msg = proto.create(data);
            let buffer = proto.encode(msg).finish();
    
            let req = Base64.encode(buffer, 0, buffer.length);
            let dataURI = encodeURIComponent(req);//url不支持!@#$&()=:+

            let resBuffer = await Net.httpGet( "cmdhandle", {cmd:cmd, protoData:dataURI});
            let res:ProtoRes = {
                code:parseInt(resBuffer.slice(0, 3)),
                data:Base64.decodeToBuffer(resBuffer, 3)
            }

            if (caller && method)
                method.call(caller, res.code, res.data);
            return res;
        } catch(err){
            console.error("request failed", "err="+err);
            return "err";
        }
    }

    public update(deltaMs:number){}

    public on(eventType:string, callback:Function){
        GlobalEvent.on(eventType, this, callback);
    }
}