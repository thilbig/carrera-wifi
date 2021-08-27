import {MqttValue} from "../../mqtt/models/mqtt-value";
import {AMessageWithUpdates} from "../../messages/a-message-with-updates";
import {GetTimeResponse} from "../../messages/get-time-response";
import {AUpdateableModel} from "./a-updateable-model";

export enum CarType {
  human,
  ghostCar,
  paceCar
}

export type Lap = {
  lapNumber: number
  time: number
}

export class CarModel extends AUpdateableModel {
  private _laps: Lap[] = []
  private _lastMeasuredTime: number | undefined

  public get laps(): Lap[] {
    return this._laps;
  }

  public get lastMeasuredTime(): number | undefined {
    return this._lastMeasuredTime;
  }

  public get numberOfLaps(): number {
    return this.laps.length
  }

  public get lastLapTime(): number | undefined {
    if (this.numberOfLaps > 0) {
      return this.laps[this.laps.length - 1].time
    } else {
      return undefined
    }
  }

  public get fastestLapNumber(): number | undefined {
    return this.getFastestLap()?.lapNumber
  }

  public get fastestLapTime(): number | undefined {
    return this.getFastestLap()?.time
  }

  public get totalTime(): number {
    return this.laps.map(x => x.time).reduce((acc: number, curr: number) => acc + curr)
  }

  public constructor(public readonly id: number, public readonly type: CarType) {
    super()
  }

  public update(message: AMessageWithUpdates): MqttValue[] {
    const ret: MqttValue[] = []

    //TODO handle fuel changes

    if (message instanceof GetTimeResponse) {
      const time = (message as GetTimeResponse).currentTime

      if (this._lastMeasuredTime !== undefined) { //a full lap was driven
        const id: string = this.generateMqttId()
        const lapTime: number = time - this._lastMeasuredTime
        const lap: Lap = {lapNumber: this.numberOfLaps + 1, time: lapTime}
        const oldFastestLap: Lap | undefined = this.getFastestLap()

        this._laps.push(lap)
        this._lastMeasuredTime = time

        const newFastestLap: Lap | undefined = this.getFastestLap()

        ret.push(new MqttValue(
          `Home/carrera/Car/${id}/NumberOfLaps`,
          this.numberOfLaps + ""))
        ret.push(new MqttValue(
          `Home/carrera/Car/${id}/LastLapTime`,
          this.lastLapTime !== undefined ? this.lastLapTime + "" : ""))

        if (newFastestLap) {
          if (!oldFastestLap || newFastestLap.time < oldFastestLap.time) {
            ret.push(new MqttValue(
              `Home/carrera/Car/${id}/TimeOfFastestLap`,
              newFastestLap.time + ""))

            ret.push(new MqttValue(
              `Home/carrera/Car/${id}/NumberOfFastestLap`,
              newFastestLap.lapNumber + ""))
          }
        }
      }

      this._lastMeasuredTime = time
    }

    return ret;
  }

  public getCurrentValues(): MqttValue[] {
    const id: string = this.generateMqttId()

    return [
      new MqttValue(`Home/carrera/Car/${id}/NumberOfLaps`, "0"),
      new MqttValue(`Home/carrera/Car/${id}/LastLapTime`, "0"),
      new MqttValue(`Home/carrera/Car/${id}/TimeOfFastestLap`, "0"),
      new MqttValue(`Home/carrera/Car/${id}/NumberOfFastestLap`, "0")
    ]
  }

  public reset(): void {
    this._laps = []
    this._lastMeasuredTime = undefined
  }

  public getFastestLap(): Lap | undefined {
    if (this.numberOfLaps > 0) {
      return this.laps.reduce((prev: Lap, cur: Lap) => {
        return prev.time <= cur.time ? prev : cur
      })
    } else {
      return undefined
    }
  }

  private generateMqttId(): string {
    if (this.type === CarType.human) {
      return this.id + ""
    } else if (this.type === CarType.ghostCar) {
      return "ghostcar"
    } else if (this.type === CarType.paceCar) {
      return "pacecar"
    } else {
      throw new Error(`The car type '${this.type} is invalid'`)
    }
  }
}
