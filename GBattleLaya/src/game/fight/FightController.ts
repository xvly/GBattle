// import BaseController from "../../../LayaCommon/gstd/frame/mvc/BaseController";
import SceneManager from "../../LayaCommon/scene/SceneManager";
import { SceneID } from "../common/CommonScene";
import FightModel from "./FightModel";
import FightScene from "./FightScene";
import BaseController from "../../LayaCommon/frame/mvc/BaseController";

export default class FightController extends BaseController{
    private model:FightModel;
    private scene:FightScene;

    constructor(){
        super();
        this.model = new FightModel;
    }

    public async show(){
        this.scene = await SceneManager.open(SceneID.fight) as FightScene;
    }

    public gameStart(){
        this.scene.gameStart();
    }
}