import LoadingController from "../loading/LoadingController";
import FightController from "../fight/FightController";
import LoginController from "../login/LoginController";

export default class ModuleManager {
    public static loading = new LoadingController();
    public static login = new LoginController();
    public static fight = new FightController();

    public static update(deltaMs:number){
        // for (let i in this.modules){
        //     let module = this.modules[i];
        //     module.update(deltaMs);
        // }   
    }
}