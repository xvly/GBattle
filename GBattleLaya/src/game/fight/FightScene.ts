import BaseScene from "../../LayaCommon/scene/BaseScene";

export default class FightScene extends BaseScene{
    public isRunning:boolean;

    public onAwake(){
        super.onAwake();

        // create elements
        this.createElements();
    }

    private createPlayer(){

    }

    private async createElements(){
    }
    
    public gameStart(){
        this.isRunning = true;
    }

    public gameRestart(){
        this.gameStart();
    }

    public gameOver(){
        this.isRunning = false;
    }

    public onUpdate(){
        if (!this.isRunning)
            return;
    }
}