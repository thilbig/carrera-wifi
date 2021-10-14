import {AMessageWithUpdates} from "./a-message-with-updates";

export enum FuelMode {
  noFuel = 0,
  normalMode = 1,
  realMode = 2
}

export class GetRaceStatusResponse extends AMessageWithUpdates {
  public constructor(
    encodedMessage: string,
    timestamp: number,
    public readonly carFuels: [number, number, number, number, number, number, number, number],
    public readonly isRaceActive: boolean,
    public readonly signalLigtsState: number,
    public readonly fuelMode: FuelMode) {
    super(encodedMessage, timestamp);
  }

  public toString(): string {
    return `race active: ${this.isRaceActive}, signals: ${this.signalLigtsState}, fuel mode: ${this.fuelMode} fuels: [${this.carFuels[0]}, ${this.carFuels[1]}, ${this.carFuels[2]}, ${this.carFuels[3]}, ${this.carFuels[4]}, ${this.carFuels[5]}]`
  }
}
