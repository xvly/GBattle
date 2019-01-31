export default class MainCamera{
    private static _camera:Laya.Camera;

    private static findCamera(node:Laya.Node):Laya.Camera{
        for (let i=0, n=node.numChildren; i<n; i++){
            let child = node.getChildAt(i);
            // if (child instanceof Laya.Camera){
            if (child.name == "Main Camera"){
                return child as Laya.Camera;
            } else {
                let camera = this.findCamera(child);
                if (camera != null){
                    return camera;
                }
            }
        }

        return null;
    }

    public static get camera(){
        if (this._camera == null){
            this._camera = this.findCamera(Laya.stage);
        }
        return this._camera;
    }

    public static set camera(camera:Laya.Camera){
        this._camera = camera;
    }
}