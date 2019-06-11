import Sprite3D = Laya.Sprite3D;

import Timer from "../utils/Timer";
import Resource from "../resource/Resource";
import SceneManager from "./SceneManager";
import BaseSprite3D from "./BaseSprite3D";

class SinglePool{
    public root:Laya.Sprite;
    public originObj:Laya.Sprite3D;

    private insts:Sprite3D[];
    private hides:Sprite3D[];
    private actives:Sprite3D[];

    constructor(root:Laya.Sprite,obj:Laya.Sprite3D){
        this.root = new Laya.Sprite();
        this.root.name = "single pool";
        root.addChild(this.root);

        this.originObj = obj;

        this.insts = [];
        this.hides = [];
        this.actives = [];
    }

    public spawn(parent?:Laya.Node, pos?:Laya.Vector3, rot?:Laya.Quaternion):Laya.Sprite3D{
        let inst:Sprite3D;
        if (this.hides.length > 0){
            inst = this.hides.shift();
            inst.active = true;
        } else {
            inst = Laya.Sprite3D.instantiate(this.originObj, undefined, false);
            this.insts.push(inst);
            inst["pool"] = this;
        }

        if (inst.destroyed){
            console.warn("inst destroyed");
            return;
        }

        if (parent){
            if (parent.destroyed){
                console.warn("parent destroyed");
                return;
            }

            parent.addChild(inst);
        } else {
            SceneManager.curScene.scene3D.addChild(inst);
        }

        if (pos){
            if (inst instanceof BaseSprite3D){
                (inst as BaseSprite3D).setPosition(pos.clone(), true);
            } else {
                inst.transform.position = pos.clone();
            }
        } else {
            inst.transform.localPosition = new Laya.Vector3();
        }

        if (rot){
            if (inst instanceof BaseSprite3D){
                (inst as BaseSprite3D).setRotation(rot.clone(), true);
            } else {
                inst.transform.rotation = rot.clone();
            }
        } else {
            inst.transform.rotation = new Laya.Quaternion();
        }


        this.actives.push(inst);
        return inst;
    }

    public despawn(inst:Sprite3D){
        let index = this.actives.indexOf(inst);
        if (index == -1){
            console.warn("[pool]despawn fail, not found");
            return;
        }

        inst.active = false;

        this.root.addChild(inst);

        inst["timeToDestroy"] = Timer.curMs + 5000;

        this.actives.splice(index, 1);
        this.hides.push(inst);
    }

    public onUpdate(deltaMs:number){
        let curMs = Timer.curMs;
        for (let i=this.hides.length-1; i>=0; i--){
            let inst = this.hides[i];
            if (inst["timeToDestroy"] <= Timer.curMs){
                inst.destroy();
                this.hides.splice(i, 1);
                let index = this.insts.indexOf(inst);
                if (index != -1){
                    this.insts.splice(index,1);
                }
            }
        }    
    }

    public clear(){
        for (let inst of this.insts){
            if (!inst.destroyed){
                inst.destroy();
            }
        }
        this.insts =[];
        this.actives=[];
        this.hides=[];
    }
}

export default class Pool{
    private static root:Laya.Sprite;
    private static prefabPool:{[url:string]:Laya.Sprite3D};
    private static pools:Array<SinglePool>;

    public static setup(){
        this.root = new Laya.Sprite();
        this.root.name = "pool";
        this.root.zOrder = 0;

        this.prefabPool = {};
        this.pools = new Array<SinglePool>();
        Laya.timer.frameLoop(1, Pool, Pool.onUpdate);
    }

    public static async spawn(url:string, parent?:Laya.Node, pos?:Laya.Vector3, rot?:Laya.Quaternion){
        let prefab = this.prefabPool[url];
        if (!prefab){
            try {
                // if (url.endsWith(".lh")){
                    prefab = (await Resource.load3D(url)) as Laya.Sprite3D;
                    // } else {
                    //     prefab = (await Resource.load(url)) as Laya.Sprite;
                    // }
            } catch(err){
                console.error(err);
                return;
            }
            
            this.prefabPool[url] = prefab;
        }
        let inst = this.spawnByObj(prefab, parent, pos, rot);
        return inst;
    }

    /**
     * 
     * @param obj 
     * @param parent 
     * @param pos 
     */
    public static spawnByObj(obj:Laya.Sprite3D, parent?:Laya.Node, pos?:Laya.Vector3, rot?:Laya.Quaternion):Laya.Sprite3D{
        let pool:SinglePool=null;
        for (let v of this.pools){
            if (v.originObj == obj){
                pool = v;
                break;
            }
        }

        if (pool == null){
            pool = new SinglePool(this.root, obj);
            this.pools.push(pool);
        }
        return pool.spawn(parent, pos, rot);
    }

    public static despawn(inst:Sprite3D){
        if (!inst){
            console.warn("[pool]despawn null obj");
            return;
        }
        
        let pool = inst["pool"];
        if (pool == null){
            console.warn("[pool]despawn failed, pool not exist ", inst["resUrl"]);
            return;
        }
        pool.despawn(inst);
    }

    public static onUpdate(deltaMs:number){
        for(let pool of this.pools) {
            pool.onUpdate(deltaMs);
        }
    }

    public static clear(){
        for (let pool of this.pools){
            pool.clear();
        }
        this.pools=[];
    }
}