import Observer from "./Observer";

// 被观察者
export default abstract class Observerable{
    private observers:Array<Observer>;
    public register(obj:Observer){
        this.observers.push(obj);
    }

    public unregister(obj:Observer){
        let index = this.observers.indexOf(obj);
        if (index >= 0){
            this.observers.splice(index, 1);
        }
    }

    public notify(){
        for (let i in this.observers){
            let observer = this.observers[i];
            observer.update(this);
        }
    }
}