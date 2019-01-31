import Observerable from "./Observerable";

// 观察者
export default abstract class Observer{
    public abstract update(args:Observerable);
}