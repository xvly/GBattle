import Observerable from "../observer/Observerable";

export abstract class BaseModel extends Observerable {
    constructor() {
        super();
    }
}