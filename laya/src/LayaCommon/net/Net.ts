export class NetResponseType {
    public static text = "text";
    public static json = "json";
    public static xml = "xml";
    public static arraybuffer = "arraybuffer";
}

export class NetMethod {
    public static post = "post";
    public static get = "get";
    public static delete = "delete";
    public static patch = "patch";

}

export default class Net {
    private static _httpDefaultKVs = null;
    public static setHttpDefaultKV(k: string, v: any) {
        if (this._httpDefaultKVs == null){
            this._httpDefaultKVs = {};
        }
        console.log("[net]set http default kv = ", k, v);
        this._httpDefaultKVs[k] = v;
    }

    private static _httpHeaders = {};
    public static setHeaders(k: string, v: string) {
        console.log("[net]set headers ", k, v);
        this._httpHeaders[k] = v;
    }

    private static _baseUrl: string;
    public static setBaseUrl(url: string) {
        this._baseUrl = url;
    }

    public static httpDelete(
        url: string, 
        body?: any, 
        responseType: string = NetResponseType.text, 
        header?: any, 
        success?: Function, 
        fail?: Function,
        baseUrl?:string): Promise<any> {
        return this.http(NetMethod.delete, url, body, responseType, header, success, fail, baseUrl);
    }

    // public static httpPatch(
    //     url: string, 
    //     body?: any, 
    //     responseType: string = NetResponseType.text, 
    //     header?: any, 
    //     success?: Function, 
    //     fail?: Function,
    //     baseUrl?:string): Promise<any> {
    //     if (body == null){
    //         body = {};
    //     }
    //     return this.http(NetMethod.patch, url, body, responseType, header, success, fail, baseUrl);
    // }

    public static httpPost(
        url: string, 
        body?: any, 
        responseType: string = NetResponseType.text, 
        header?: any, 
        success?: Function, 
        fail?: Function,
        baseUrl?:string): Promise<any> {

        if (body == null){
            body = {};
        }

        return this.http(NetMethod.post, url, body, responseType, header, success, fail, baseUrl);
    }

    public static httpGet(
        url: string, body?: any, 
        responseType: string = NetResponseType.text, 
        header?: any, 
        success?: Function, 
        fail?: Function,
        baseUrl?:string): Promise<any> {
        return this.http(NetMethod.get, url, body, responseType, header, success, fail, baseUrl);
    }

    private static genHeader(headers: any) {
        let _headers = [];
        if (headers) {
            let hasContentType = false;
            for (var _key in headers) {
                if (headers.hasOwnProperty(_key)) {
                    if (_key == "Content-Type") {
                        hasContentType = true;
                    }
                    _headers.push(_key);
                    _headers.push(headers[_key]);
                }
            }
            if (!hasContentType) {
                _headers.push("Content-Type");
                _headers.push("application/json");
            }
        } else {
            _headers.push("Content-Type");
            _headers.push("application/json");
        }
        return _headers;
    }

    private static http(
        method: string, 
        url: string, 
        body: any, 
        responseType: string = NetResponseType.text, 
        headers?: any[], 
        success?: Function, 
        fail?: Function,
        baseUrl?:string): Promise<any> {
        // default kv
        if (this._httpDefaultKVs != null){
            if (!body){
                body = {};
            }
            for (let k in this._httpDefaultKVs) {
                let v = this._httpDefaultKVs[k];

                if (body) {
                    body[k] = v;
                }
            }
        }

        // 
        if (baseUrl){
            url = baseUrl + "/" + url;
        } else if (this._baseUrl) {
            url = this._baseUrl + "/" + url;
        }

        // 
        if (!url.startsWith("http")) {
            url = "https://" + url;
        }

        let req = new Laya.HttpRequest();
        let _headers = this.genHeader(headers || this._httpHeaders);
        console.log("[net]http ", method, url, JSON.stringify(body), _headers);
        if (method == NetMethod.get || method == NetMethod.delete) {
            if (body) {
                let count = 0;
                for (var key in body) {
                    if (count == 0){
                        if (url.indexOf("?") < 0) {
                            url += "?";
                        }
                    }
                    count ++;
                    if (body.hasOwnProperty(key)) {
                        url += ("&" + key + "=" + body[key]);
                    }
                }
            }

            req.send(url, null, method, responseType, _headers);
        } else {
            if (typeof (body) != "string")
                body = JSON.stringify(body);
            req.send(url, body, method, responseType, _headers);
        }

        return new Promise((resolve, reject) => {
            req.once(
                Laya.Event.COMPLETE, req, function (res: any) {
                    if (res != null) res = JSON.parse(res);
                    console.log("[net]complete ", res);
                    if (success)
                        success(res);
                    resolve(res);
                }
            );

            req.once(
                Laya.Event.ERROR, req, function (err: string) {
                    console.log("[net]error ", err);
                    if (fail)
                        fail(err);
                    reject(err);
                }
            );
        });
    }
}
