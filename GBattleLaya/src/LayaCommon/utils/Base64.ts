export default class Base64{
    public static s64 = [];
    public static b64 = [];
        
    public static getLength(string) {
        var p = string.length;
        if (!p)
            return 0;
        var n = 0;
        while (--p % 4 > 1 && string.charAt(p) === "=")
            ++n;
        return Math.ceil(string.length * 3) / 4 - n;
    }

    public static encode(buffer, start, end) {
        var parts = null,
        chunk = [];
        var i = 0, // output index
            j = 0, // goto index
            t;     // temporary
        while (start < end) {
            var b = buffer[start++];
            switch (j) {
                case 0:
                    chunk[i++] = this.b64[b >> 2];
                    t = (b & 3) << 4;
                   j = 1;
                   break;
                case 1:
                   chunk[i++] = this.b64[t | b >> 4];
                   t = (b & 15) << 2;
                   j = 2;
                    break;
                case 2:
                    chunk[i++] = this.b64[t | b >> 6];
                    chunk[i++] = this.b64[b & 63];
                    j = 0;
                    break;
            }
            if (i > 8191) {
                (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
                i = 0;
            }
        }
        if (j) {
            chunk[i++] = this.b64[t];
            chunk[i++] = 61;
            if (j === 1)
                chunk[i++] = 61;
        }
        if (parts) {
            if (i)
                parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
            return parts.join("");
        }
        return String.fromCharCode.apply(String, chunk.slice(0, i));
    };

    public static decode(string, buffer, offset) {
        var start = offset;
        var j = 0, // goto index
        t;     // temporary
        for (var i = 0; i < string.length;) {
            var c = string.charCodeAt(i++);
            if (c === 61 && j > 1)
                break;
            if ((c = this.s64[c]) === undefined)
                throw Error("invalid encoding");
            switch (j) {
                case 0:
                    t = c;
                    j = 1;
                    break;
                case 1:
                    buffer[offset++] = t << 2 | (c & 48) >> 4;
                    t = c;
                    j = 2;
                    break;
                case 2:
                    buffer[offset++] = (t & 15) << 4 | (c & 60) >> 2;
                    t = c;
                    j = 3;
                    break;
                case 3:
                    buffer[offset++] = (t & 3) << 6 | c;
                    j = 0;
                    break;
                }
            }
        if (j === 1)
            throw Error("invalid encoding");
        return offset - start;
    };

    public static decodeToBuffer(string:string, offset:number):Uint8Array{
        if (offset>0)
            string=string.slice(offset);
        let buffer = new Uint8Array(this.getLength(string));
        this.decode(string, buffer, 0);
        return buffer;
    }

    protected static test(string) {
        return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string);
    };
}

let s64 = Base64.s64;
let b64 = Base64.b64;
for (var i = 0; i < 64;)
    s64[b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43] = i++;