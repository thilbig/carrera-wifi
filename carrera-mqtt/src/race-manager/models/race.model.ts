import {FuelMode, GetRaceStatusResponse} from "../../messages/get-race-status.response";
import {CarModel, CarType} from "./car.model";
import {AUpdateableModel} from "./a-updateable-model";
import {AMessageWithUpdates} from "../../messages/a-message-with-updates";
import {MqttValue} from "../../mqtt/models/mqtt-value";
import {GetTimeResponse} from "../../messages/get-time-response";

export class RaceModel extends AUpdateableModel {
  private _signalLightState: number | undefined
  private _fuelMode: FuelMode | undefined
  private _isRaceActive: boolean | undefined

  private _cars: CarModel[] = [
    new CarModel(1, CarType.human),
    new CarModel(2, CarType.human),
    new CarModel(3, CarType.human),
    new CarModel(4, CarType.human),
    new CarModel(5, CarType.human),
    new CarModel(6, CarType.human),
    new CarModel(7, CarType.ghostCar),
    new CarModel(8, CarType.paceCar)
  ]

  public get signalLightState(): number | undefined {
    return this._signalLightState;
  }

  public get fuelMode(): FuelMode | undefined {
    return this._fuelMode;
  }

  public get isRaceActive(): boolean | undefined {
    return this._isRaceActive;
  }

  public get cars(): CarModel[] {
    return this._cars;
  }

  public get fastestCar(): CarModel | undefined {
    let fastestCar: CarModel | undefined

    for (const car of this.cars) {
      if (car.fastestLapTime) {
        if (!fastestCar || !fastestCar.fastestLapTime || fastestCar.fastestLapTime > car.fastestLapTime) {
          fastestCar = car
        }
      }
    }

    return fastestCar
  }

  public get fastestLapTime(): number | undefined {
    return this.fastestCar?.fastestLapTime
  }

  public get leadingCar(): CarModel | undefined {
    let leadingCar: CarModel | undefined = undefined

    //The leading car is the one with the highest number of laps but the minimal total race time
    for (const car of this.cars) {
      if (car.numberOfLaps > 0) {
        if (leadingCar === undefined || car.numberOfLaps >= leadingCar.numberOfLaps && car.totalTime < leadingCar.totalTime) {
          leadingCar = car
        }
      }
    }

    return leadingCar
  }

  public constructor(public readonly id: number) {
    super()
  }

  public update(message: AMessageWithUpdates): MqttValue[] {
    const ret: MqttValue[] = []

    if (message instanceof GetRaceStatusResponse) {
      this.updateRaceStatus(message, ret);
    } else if (message instanceof GetTimeResponse) {
      this.updateRaceTimes(message, ret);
    }

    return ret
  }

  private updateRaceStatus(message: GetRaceStatusResponse, ret: MqttValue[]) {
    const raceStatus: GetRaceStatusResponse = message as GetRaceStatusResponse

    if (this._fuelMode !== raceStatus.fuelMode) {
      this._fuelMode = raceStatus.fuelMode

      ret.push(new MqttValue(
        `Home/carrera/Race/${this.id}/FuelMode`,
        this._fuelMode !== undefined ? this._fuelMode + "" : ""))
    }

    if (this._signalLightState !== raceStatus.signalLigtsState) {
      this._signalLightState = raceStatus.signalLigtsState

      ret.push(new MqttValue(
        `Home/carrera/Race/${this.id}/SignalLightState`,
        this._signalLightState !== undefined ? this._signalLightState + "" : ""))
    }

    if (this._isRaceActive !== raceStatus.isRaceActive) {
      this._isRaceActive = raceStatus.isRaceActive

      ret.push(new MqttValue(
        `Home/carrera/Race/${this.id}/IsRaceActive`,
        this._isRaceActive ? "1" : "0"))
    }
  }

  private updateRaceTimes(message: GetTimeResponse, ret: MqttValue[]) {
    const timeMessage: GetTimeResponse = message as GetTimeResponse
    const car: CarModel | undefined = this.cars[timeMessage.carId - 1]
    const oldFastestCar: CarModel | undefined = this.fastestCar
    const oldFastestLapTime: number | undefined = this.fastestLapTime
    const oldLeadingCar: CarModel | undefined = this.leadingCar

    if (car) {
      ret.push(...car.update(message))
    }

    const newFastestCar: CarModel | undefined = this.fastestCar
    const newFastestLapTime: number | undefined = this.fastestLapTime
    const newLeadingCar: CarModel | undefined = this.leadingCar

    if (newFastestCar) {
      if (!oldFastestCar || oldFastestCar.id !== newFastestCar.id) {
        ret.push(new MqttValue(
          `Home/carrera/Race/${this.id}/FastestCar`,
          newFastestCar.id + ""
        ))
      }
    }

    if (newFastestLapTime) {
      if (!oldFastestLapTime || newFastestLapTime < oldFastestLapTime) {
        ret.push(new MqttValue(
          `Home/carrera/Race/${this.id}/FastestLapTime`,
          newFastestLapTime + ""
        ))
      }
    }

    if (newLeadingCar) {
      if (!oldLeadingCar || oldLeadingCar.id !== newLeadingCar.id) {
        ret.push(new MqttValue(
          `Home/carrera/Race/${this.id}/LeadingCar`,
          newLeadingCar.id + ""
        ))
      }
    }
  }

  public getCurrentValues(): MqttValue[] {
    const ret: MqttValue[] = [
      new MqttValue(`Home/carrera/Race/${this.id}/SignalLightState`, ""),
      new MqttValue(`Home/carrera/Race/${this.id}/FuelMode`, ""),
      new MqttValue(`Home/carrera/Race/${this.id}/IsRaceActive`, "0"),
      new MqttValue(`Home/carrera/Race/${this.id}/FastestCar`, "0"),
      new MqttValue(`Home/carrera/Race/${this.id}/FastestLapTime`, "0"),
      new MqttValue(`Home/carrera/Race/${this.id}/LeadingCar`, "0"),
    ]

    for (const car of this.cars) {
      ret.push(...car.getCurrentValues())
    }

    return ret
  }

  public reset(): void {
    this._signalLightState = undefined
    this._fuelMode = undefined
    this._isRaceActive = undefined

    for (const car of this.cars) {
      car.reset()
    }
  }
}
