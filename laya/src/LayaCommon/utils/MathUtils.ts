export default class MathUtils{
    public static vecRad(vecA:Laya.Vector3, vecB:Laya.Vector3, isCheckNegative:boolean=false, isRad=true){
        let dotV = Laya.Vector3.dot(vecA, vecB);
        let rad = Math.acos(
            dotV/ (Laya.Vector3.scalarLength(vecA) * Laya.Vector3.scalarLength(vecB)));
        // if (isCheckNegative){
        //     Laya.Vector3.cross(vecA, vecB, globalVec3);
        // }

        if (isRad){
            return rad;
        } else {
            return this.radinToAgnle(rad);
        }
    }

    public static angleToRandin(angle:number){
        return angle / (180 / Math.PI);
    }

    public static radinToAgnle(rad:number){
        return rad * (180/Math.PI);
    }

    private static _seed:number;
    public static setSeed(seed){
        this._seed = seed;
    }

    public static random(){
        if (this._seed == null){
            this.setSeed(Laya.Browser.now());
        }

        this._seed = (this._seed*9301+49297)%233280;
        // console.info("!! random ", this._seed);
        return this._seed / 233280.0;
    }

    public static randomN(min: number, max: number = null): number {
        if (max == null) {
            max = min;
            min = 0;
        }
        return min + Math.floor(MathUtils.random() * (max - min + 1));
    }
}