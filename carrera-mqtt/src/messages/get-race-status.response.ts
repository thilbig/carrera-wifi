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
    public readonly fuelCar1: number,
    public readonly fuelCar2: number,
    public readonly fuelCar3: number,
    public readonly fuelCar4: number,
    public readonly fuelCar5: number,
    public readonly fuelCar6: number,
    public readonly isRaceActive: boolean,
    public readonly signalLigtsState: number,
    public readonly fuelMode: FuelMode) {
    super(encodedMessage, timestamp);
  }

  public toString(): string {
    return `race active: ${this.isRaceActive}, signals: ${this.signalLigtsState}, fuel mode: ${this.fuelMode} fuels: [${this.fuelCar1}, ${this.fuelCar2}, ${this.fuelCar3}, ${this.fuelCar4}, ${this.fuelCar5}, ${this.fuelCar6}]`
  }
}
