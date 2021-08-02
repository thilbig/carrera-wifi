import {AMessageWithUpdates} from "./a-message-with-updates";

export enum MeasuringPoint {
  startFinish = 1,
  checkLane1 = 2,
  checkLane2 = 3
}

export class GetTimeResponse extends AMessageWithUpdates {
  public constructor(
    encodedMessage: string,
    timestamp: number,
    public readonly carId: number,
    public readonly currentTime: number,
    public readonly measuringPoint: MeasuringPoint) {
    super(encodedMessage, timestamp);
  }

  public toString(): string {
    return `Car: ${this.carId} time: ${this.currentTime} measured: ${this.measuringPoint}`
  }
}
