import "mocha"
import { expect } from "chai"
import {MessageDecoder} from "./message-decoder";
import {GetVersionNumberResponse} from "../messages/get-version-number.response";
import {ResetLapAndPositionCounterResponse} from "../messages/reset-lap-and-position-counter.response";
import {FuelMode, GetRaceStatusResponse} from "../messages/get-race-status.response";
import {GetTimeResponse, MeasuringPoint} from "../messages/get-time-response";
import {AMessageBase} from "../messages/a-message-base";
import {StartRaceResponse} from "../messages/start-race.response";
import {StartRaceOrPaceCarButtonPressedResponse} from "../messages/start-race-or-pace-car-button-pressed.response";

describe("Message decoder", () => {
  let decoder: MessageDecoder

  beforeEach(() => {
    decoder = new MessageDecoder()
  })

  it("should throw an error if message is to short", () => {
    expect(() => decoder.decodeMessage("T", 0)).to.throw
  })

  it("should throw an error when trying to decode an unknown message", () => {
    expect(() => decoder.decodeMessage("invalid$", 0)).to.throw
  })

  it("should throw an error when checksum does not match", () => {
    //TODO
  })

  it("should decode get version response", () => {
    const decoded: AMessageBase = decoder.decodeMessage("053372$", 0)

    expect(decoded.encodedData).to.be.eql("053372$")
    expect(decoded.timestamp).to.be.eql(0)
    expect(decoded).to.be.instanceOf(GetVersionNumberResponse)
    expect((decoded as GetVersionNumberResponse).versionNumber).to.be.eql(5337)
  })

  it("should decode reset round and position counter message", () => {
    const decoded: AMessageBase = decoder.decodeMessage("J$", 0)

    expect(decoded.encodedData).to.be.eql("J$")
    expect(decoded.timestamp).to.be.eql(0)
    expect(decoded).to.be.instanceOf(ResetLapAndPositionCounterResponse)
  })

  it("should decode start race or pacecar button pressed  message", () => {
    const decoded: AMessageBase = decoder.decodeMessage("T$", 0)

    expect(decoded.encodedData).to.be.eql("T$")
    expect(decoded.timestamp).to.be.eql(0)
    expect(decoded).to.be.instanceOf(StartRaceOrPaceCarButtonPressedResponse)
  })

  it("should decode start race message", () => {
    const decoded: AMessageBase = decoder.decodeMessage("=$", 0)

    expect(decoded.encodedData).to.be.eql("=$")
    expect(decoded.timestamp).to.be.eql(0)
    expect(decoded).to.be.instanceOf(StartRaceResponse)
  })

  it("should decode race status message if race is not active", () => {
    const decoded: AMessageBase = decoder.decodeMessage("?:0000000010008003$", 0)

    expect(decoded.encodedData).to.be.eql("?:0000000010008003$")
    expect(decoded.timestamp).to.be.eql(0)
    expect(decoded).to.be.instanceOf(GetRaceStatusResponse)
    expect((decoded as GetRaceStatusResponse).isRaceActive).to.be.eql(false)
    expect((decoded as GetRaceStatusResponse).fuelCar1).to.be.eql(0) //TODO add test for different fuel states
    expect((decoded as GetRaceStatusResponse).fuelCar2).to.be.eql(0)
    expect((decoded as GetRaceStatusResponse).fuelCar3).to.be.eql(0)
    expect((decoded as GetRaceStatusResponse).fuelCar4).to.be.eql(0)
    expect((decoded as GetRaceStatusResponse).fuelCar5).to.be.eql(0)
    expect((decoded as GetRaceStatusResponse).fuelCar6).to.be.eql(0)
    expect((decoded as GetRaceStatusResponse).signalLigtsState).to.be.eql(1)
    expect((decoded as GetRaceStatusResponse).fuelMode).to.be.eql(FuelMode.noFuel)
  })

  it("should decode race status message if race is starting", () => {
    const decoded: AMessageBase = decoder.decodeMessage("?:0000000041008004$", 0)

    expect(decoded.encodedData).to.be.eql("?:0000000041008004$")
    expect(decoded.timestamp).to.be.eql(0)
    expect(decoded).to.be.instanceOf(GetRaceStatusResponse)
    expect((decoded as GetRaceStatusResponse).isRaceActive).to.be.eql(false)
    expect((decoded as GetRaceStatusResponse).fuelCar1).to.be.eql(0)
    expect((decoded as GetRaceStatusResponse).fuelCar2).to.be.eql(0)
    expect((decoded as GetRaceStatusResponse).fuelCar3).to.be.eql(0)
    expect((decoded as GetRaceStatusResponse).fuelCar4).to.be.eql(0)
    expect((decoded as GetRaceStatusResponse).fuelCar5).to.be.eql(0)
    expect((decoded as GetRaceStatusResponse).fuelCar6).to.be.eql(0)
    expect((decoded as GetRaceStatusResponse).signalLigtsState).to.be.eql(4)
    expect((decoded as GetRaceStatusResponse).fuelMode).to.be.eql(FuelMode.normalMode)
  })

  it("should decode race status message if race is active", () => {
    const decoded: AMessageBase = decoder.decodeMessage("?:0000000002008004$", 0)

    expect(decoded.encodedData).to.be.eql("?:0000000002008004$")
    expect(decoded.timestamp).to.be.eql(0)
    expect(decoded).to.be.instanceOf(GetRaceStatusResponse)
    expect((decoded as GetRaceStatusResponse).isRaceActive).to.be.eql(true)
    expect((decoded as GetRaceStatusResponse).fuelCar1).to.be.eql(0)
    expect((decoded as GetRaceStatusResponse).fuelCar2).to.be.eql(0)
    expect((decoded as GetRaceStatusResponse).fuelCar3).to.be.eql(0)
    expect((decoded as GetRaceStatusResponse).fuelCar4).to.be.eql(0)
    expect((decoded as GetRaceStatusResponse).fuelCar5).to.be.eql(0)
    expect((decoded as GetRaceStatusResponse).fuelCar6).to.be.eql(0)
    expect((decoded as GetRaceStatusResponse).signalLigtsState).to.be.eql(0)
    expect((decoded as GetRaceStatusResponse).fuelMode).to.be.eql(FuelMode.realMode)
  })

  it("should throw an error when signal light is invalid", () => {
    expect(() => decoder.decodeMessage("?:0000000091008004$", 0)).to.throw()
    expect(() => decoder.decodeMessage("?:00000000x1008004$", 0)).to.throw()
  })

  it("should throw an error when fuel mode invalid", () => {
    expect(() => decoder.decodeMessage("?:0000000044008004$", 0)).to.throw()
    expect(() => decoder.decodeMessage("?:000000004x008004$", 0)).to.throw()
  })

  it("should decode time for the first car measured on start/finish", () => {
    const decoded: AMessageBase = decoder.decodeMessage("?1000003:111$", 0)

    expect(decoded.encodedData).to.be.eql("?1000003:111$")
    expect(decoded.timestamp).to.be.eql(0)
    expect(decoded).to.be.instanceOf(GetTimeResponse)
    expect((decoded as GetTimeResponse).carId).to.be.eql(1)
    expect((decoded as GetTimeResponse).currentTime).to.be.eql(12314)
    expect((decoded as GetTimeResponse).measuringPoint).to.be.eql(MeasuringPoint.startFinish)
  })

  it("should decode time for the second car measured on start/finish", () => {
    const decoded: AMessageBase = decoder.decodeMessage("?20000<4551=$", 0)

    expect(decoded.encodedData).to.be.eql("?20000<4551=$")
    expect(decoded.timestamp).to.be.eql(0)
    expect(decoded).to.be.instanceOf(GetTimeResponse)
    expect((decoded as GetTimeResponse).carId).to.be.eql(2)
    expect((decoded as GetTimeResponse).currentTime).to.be.eql(19541)
    expect((decoded as GetTimeResponse).measuringPoint).to.be.eql(MeasuringPoint.startFinish)
  })

  it("should decode time for the second car measured on a checklane", () => {
    const decoded: AMessageBase = decoder.decodeMessage("?30000:8702<$", 0)

    expect(decoded.encodedData).to.be.eql("?30000:8702<$")
    expect(decoded.timestamp).to.be.eql(0)
    expect(decoded).to.be.instanceOf(GetTimeResponse)
    expect((decoded as GetTimeResponse).carId).to.be.eql(3)
    expect((decoded as GetTimeResponse).currentTime).to.be.eql(35335)
    expect((decoded as GetTimeResponse).measuringPoint).to.be.eql(MeasuringPoint.checkLane1)
  })

  it("should throw an error when car id is invalid", () => {
    expect(() => decoder.decodeMessage("?90000:8702<$", 0)).to.throw()
    expect(() => decoder.decodeMessage("?x0000:8702<$", 0)).to.throw()
  })

  it("should throw an error when measuring point is invalid", () => {
    expect(() => decoder.decodeMessage("?90000:8704<$", 0)).to.throw()
    expect(() => decoder.decodeMessage("?90000:870x<$", 0)).to.throw()
  })
})
