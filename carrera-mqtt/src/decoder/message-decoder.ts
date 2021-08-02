import {GetVersionNumberResponse} from "../messages/get-version-number.response";
import {GetRaceStatusResponse} from "../messages/get-race-status.response";
import {GetTimeResponse} from "../messages/get-time-response";
import {AMessageBase} from "../messages/a-message-base";
import {ResetLapAndPositionCounterResponse} from "../messages/reset-lap-and-position-counter.response";
import {StartRaceResponse} from "../messages/start-race.response";
import {StartRaceOrPaceCarButtonPressedResponse} from "../messages/start-race-or-pace-car-button-pressed.response";

export class MessageDecoder {
  public decodeMessage(encodedMessage: string, timestamp: number): AMessageBase {
    const validationError = MessageDecoder.validateMessage(encodedMessage)

    if (validationError) {
      throw new Error(validationError)
    } else {
      if (encodedMessage.startsWith("0")) {
        return MessageDecoder.decodeGetVersionNumberMessage(encodedMessage, timestamp)
      } else if (encodedMessage === "J$") {
        return MessageDecoder.decodeResetLapAndPositionCounterMessage(encodedMessage, timestamp)
      } else if (encodedMessage === "T$") {
        return MessageDecoder.decodeStartRaceOrPacecarButtonPressedResponseMessage(encodedMessage, timestamp)
      } else if (encodedMessage === "=$") {
        return MessageDecoder.decodeStartResponseMessage(encodedMessage, timestamp)
      } else if (encodedMessage.startsWith("?:")) {
        return MessageDecoder.decodeRaceStatusMessage(encodedMessage, timestamp)
      } else if (encodedMessage.startsWith("?")) {
        return MessageDecoder.decodeGetTimeMessage(encodedMessage, timestamp)
      } else {
        throw new Error(`Cannot decode message, it has an unknown type. '${encodedMessage}'`)
      }
    }
  }

  private static validateMessage(encodedMessage: string): string | undefined {
    if (!encodedMessage.endsWith("$")) {
      return `Invalid message, it is to short. ${encodedMessage}`
    }

    //todo validate checksum

    return undefined
  }

  private static decodeGetVersionNumberMessage(encodedMessage: string, timestamp: number): GetVersionNumberResponse {
    return new GetVersionNumberResponse(
      encodedMessage,
      timestamp,
      Number(encodedMessage.substr(1, encodedMessage.length - 3)))
  }

  private static decodeResetLapAndPositionCounterMessage(encodedMessage: string, timestamp: number): ResetLapAndPositionCounterResponse {
    return new ResetLapAndPositionCounterResponse(
      encodedMessage,
      timestamp)
  }

  private static decodeStartRaceOrPacecarButtonPressedResponseMessage(encodedMessage: string, timestamp: number) {
    return new StartRaceOrPaceCarButtonPressedResponse(
      encodedMessage,
      timestamp)
  }

  private static decodeStartResponseMessage(encodedMessage: string, timestamp: number) {
    return new StartRaceResponse(
      encodedMessage,
      timestamp
    )
  }

  private static decodeRaceStatusMessage(encodedMessage: string, timestamp: number): GetRaceStatusResponse {
    const signalLightState = Number(encodedMessage[10])
    const fuelMode = Number(encodedMessage[11])

    if (isNaN(signalLightState) || signalLightState < 0 || signalLightState > 8) {
      throw new Error(`The value '${signalLightState}' is an invalid signal light state. It has to be 0 < x < 9`)
    }

    if (isNaN(fuelMode) || fuelMode < 0 || fuelMode > 2) {
      throw new Error(`The value '${fuelMode}' is an invalid fuel mode. It has to be 0 < x < 3`)
    }

    return new GetRaceStatusResponse(
      encodedMessage,
      timestamp,
      MessageDecoder.decode4BitValue(encodedMessage[2], 0),
      MessageDecoder.decode4BitValue(encodedMessage[3], 0),
      MessageDecoder.decode4BitValue(encodedMessage[4], 0),
      MessageDecoder.decode4BitValue(encodedMessage[5], 0),
      MessageDecoder.decode4BitValue(encodedMessage[6], 0),
      MessageDecoder.decode4BitValue(encodedMessage[7], 0),
      encodedMessage[10] === "0",
      Number(encodedMessage[10]),
      Number(encodedMessage[11]))
  }

  private static decodeGetTimeMessage(encodedMessage: string, timestamp: number): GetTimeResponse {
    const carId: number = Number(encodedMessage[1])
    const measuringPoint: number = Number(encodedMessage[10])
    let time: number = 0

    if (isNaN(carId) || carId < 1 || carId > 8) {
      throw new Error(`The value '${carId}' is an invalid car id. It has to be 0 < x < 9`)
    }

    if (isNaN(measuringPoint) || measuringPoint < 1 || measuringPoint > 3) {
      throw new Error(`The value '${measuringPoint}' is an invalid measuring point id. It has to be 1 < x < 4`)
    }

    time += MessageDecoder.decode4BitValue(encodedMessage[3], 28)
    time += MessageDecoder.decode4BitValue(encodedMessage[2], 24)
    time += MessageDecoder.decode4BitValue(encodedMessage[5], 20)
    time += MessageDecoder.decode4BitValue(encodedMessage[4], 16)
    time += MessageDecoder.decode4BitValue(encodedMessage[7], 12)
    time += MessageDecoder.decode4BitValue(encodedMessage[6],  8)
    time += MessageDecoder.decode4BitValue(encodedMessage[9],  4)
    time += MessageDecoder.decode4BitValue(encodedMessage[8],  0)

    return new GetTimeResponse(
      encodedMessage,
      timestamp,
      carId,
      time,
      measuringPoint)
  }

  private static decode4BitValue(char: string, bitShift: number): number {
    const buffer: Buffer = Buffer.from(char, "ascii")

    return (buffer.readInt8(0) & 0xF) << bitShift
  }
}

