import {RaceModel} from "./models/race.model";
import {AMessageWithUpdates} from "../messages/a-message-with-updates";
import {MqttValue} from "../mqtt/models/mqtt-value";
import {GetRaceStatusResponse} from "../messages/get-race-status.response";
import {GetTimeResponse} from "../messages/get-time-response";

export class RaceManager {
  public readonly race: RaceModel = new RaceModel(1)

  private lastMeasuredTime: number | undefined

  public update(message: AMessageWithUpdates): MqttValue[] {
    const ret: MqttValue[] = []

    if (message instanceof GetRaceStatusResponse) {
      const raceStatusMessage = message as GetRaceStatusResponse

      if (this.race.isRaceActive && !raceStatusMessage.isRaceActive) {
        //race status changed => it was restarted
        ret.push(...this.resetAndGetInitialValues())
      }
    } else if (message instanceof GetTimeResponse) {
      const getTimeMessage = message as GetTimeResponse

      if (this.lastMeasuredTime !== undefined && this.lastMeasuredTime > getTimeMessage.currentTime) {
        //our last stored time is gerater than the time from the current mesage => race was restarted
        ret.push(...this.resetAndGetInitialValues())
      }

      this.lastMeasuredTime = message.currentTime
    }

    ret.push(...this.race.update(message))

    return ret
  }

  public resetAndGetInitialValues(): MqttValue[] {
    this.race.reset()

    return this.race.getCurrentValues()
  }
}
