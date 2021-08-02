import {AMessageBase} from "./a-message-base";

export class ResetLapAndPositionCounterResponse extends AMessageBase {
  public toString(): string {
    return "round and position counter reset"
  }
}
