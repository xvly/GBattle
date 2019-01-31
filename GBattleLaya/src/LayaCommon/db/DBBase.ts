export abstract class DBBase{
    public abstract async get(key:string);

    public abstract update(key:string, data:any);

    public abstract async add(key:string, data:any);

    public abstract async remove(key:string);

}