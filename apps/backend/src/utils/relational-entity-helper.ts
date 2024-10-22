import { instanceToPlain } from "class-transformer";

export class EntityRelationalHelper {
  __entity?: string;

  constructor() {
    this.setEntityName();
  }

  setEntityName() {
    this.__entity = this.constructor.name;
  }

  toJSON() {
    return instanceToPlain(this);
  }
}
