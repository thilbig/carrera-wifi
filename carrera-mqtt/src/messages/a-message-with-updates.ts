import {AMessageBase} from "./a-message-base";

export abstract class AMessageWithUpdates extends AMessageBase {
  public readonly hasUpdates: boolean = true
}
