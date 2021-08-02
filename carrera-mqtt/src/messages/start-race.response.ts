import {AMessageBase} from "./a-message-base";

export class StartRaceResponse extends AMessageBase {
  public toString(): string {
    return "start race"
  }
}
