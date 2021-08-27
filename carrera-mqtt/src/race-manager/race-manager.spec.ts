import "mocha"
import {expect} from "chai"
import {RaceManager} from "./race-manager"
import {MqttValue} from "../mqtt/models/mqtt-value"
import {FuelMode, GetRaceStatusResponse} from "../messages/get-race-status.response";
import {GetTimeResponse} from "../messages/get-time-response";

const initialMqttMessages: MqttValue[] = [
  new MqttValue("Home/carrera/Race/1/SignalLightState", ""),
  new MqttValue("Home/carrera/Race/1/FuelMode", ""),
  new MqttValue("Home/carrera/Race/1/IsRaceActive", "0"),
  new MqttValue("Home/carrera/Race/1/FastestCar", "0"),
  new MqttValue("Home/carrera/Race/1/FastestLapTime", "0"),
  new MqttValue("Home/carrera/Race/1/LeadingCar", "0"),

  new MqttValue("Home/carrera/Car/1/NumberOfLaps", "0"),
  new MqttValue("Home/carrera/Car/1/LastLapTime", "0"),
  new MqttValue("Home/carrera/Car/1/TimeOfFastestLap", "0"),
  new MqttValue("Home/carrera/Car/1/NumberOfFastestLap", "0"),

  new MqttValue("Home/carrera/Car/2/NumberOfLaps", "0"),
  new MqttValue("Home/carrera/Car/2/LastLapTime", "0"),
  new MqttValue("Home/carrera/Car/2/TimeOfFastestLap", "0"),
  new MqttValue("Home/carrera/Car/2/NumberOfFastestLap", "0"),

  new MqttValue("Home/carrera/Car/3/NumberOfLaps", "0"),
  new MqttValue("Home/carrera/Car/3/LastLapTime", "0"),
  new MqttValue("Home/carrera/Car/3/TimeOfFastestLap", "0"),
  new MqttValue("Home/carrera/Car/3/NumberOfFastestLap", "0"),

  new MqttValue("Home/carrera/Car/4/NumberOfLaps", "0"),
  new MqttValue("Home/carrera/Car/4/LastLapTime", "0"),
  new MqttValue("Home/carrera/Car/4/TimeOfFastestLap", "0"),
  new MqttValue("Home/carrera/Car/4/NumberOfFastestLap", "0"),

  new MqttValue("Home/carrera/Car/5/NumberOfLaps", "0"),
  new MqttValue("Home/carrera/Car/5/LastLapTime", "0"),
  new MqttValue("Home/carrera/Car/5/TimeOfFastestLap", "0"),
  new MqttValue("Home/carrera/Car/5/NumberOfFastestLap", "0"),

  new MqttValue("Home/carrera/Car/6/NumberOfLaps", "0"),
  new MqttValue("Home/carrera/Car/6/LastLapTime", "0"),
  new MqttValue("Home/carrera/Car/6/TimeOfFastestLap", "0"),
  new MqttValue("Home/carrera/Car/6/NumberOfFastestLap", "0"),

  new MqttValue("Home/carrera/Car/ghostcar/NumberOfLaps", "0"),
  new MqttValue("Home/carrera/Car/ghostcar/LastLapTime", "0"),
  new MqttValue("Home/carrera/Car/ghostcar/TimeOfFastestLap", "0"),
  new MqttValue("Home/carrera/Car/ghostcar/NumberOfFastestLap", "0"),

  new MqttValue("Home/carrera/Car/pacecar/NumberOfLaps", "0"),
  new MqttValue("Home/carrera/Car/pacecar/LastLapTime", "0"),
  new MqttValue("Home/carrera/Car/pacecar/TimeOfFastestLap", "0"),
  new MqttValue("Home/carrera/Car/pacecar/NumberOfFastestLap", "0"),
]

describe("race manager", () => {
  describe("initial values", () => {
    const raceManager: RaceManager = new RaceManager()

    it("should generate initial mqtt values", () => {
      const mqttMessages: MqttValue[] = raceManager.resetAndGetInitialValues()

      expect(mqttMessages).to.be.eql(initialMqttMessages)
    })
  })

  describe("update race status", () => {
    const raceManager: RaceManager = new RaceManager()

    it("should not have an active race when receiving race update", () => {
      expect(raceManager.update(
        new GetRaceStatusResponse("does not matter", 0, 0, 0, 0, 0, 0, 0, false, 0, FuelMode.noFuel))
      ).to.be.eql([
        new MqttValue("Home/carrera/Race/1/FuelMode", "0"),
        new MqttValue("Home/carrera/Race/1/SignalLightState", "0"),
        new MqttValue("Home/carrera/Race/1/IsRaceActive", "0")
      ])
      expect(raceManager.race.fuelMode).to.be.eql(FuelMode.noFuel)
      expect(raceManager.race.signalLightState).to.be.eql(0)
      expect(raceManager.race.isRaceActive).to.be.eql(false)
    })

    it("should start race when receiving a message with active race", () => {
      expect(raceManager.update(
        new GetRaceStatusResponse("does not matter", 0, 0, 0, 0, 0, 0, 0, true, 0, FuelMode.noFuel))
      ).to.be.eql([
        new MqttValue("Home/carrera/Race/1/IsRaceActive", "1")
      ])
      expect(raceManager.race.fuelMode).to.be.eql(FuelMode.noFuel)
      expect(raceManager.race.signalLightState).to.be.eql(0)
      expect(raceManager.race.isRaceActive).to.be.eql(true)
    })

    it("should update signal light state", () => {
      expect(raceManager.update(
        new GetRaceStatusResponse("does not matter", 0, 0, 0, 0, 0, 0, 0, true, 1, FuelMode.noFuel))
      ).to.be.eql([
        new MqttValue("Home/carrera/Race/1/SignalLightState", "1")
      ])
      expect(raceManager.race.fuelMode).to.be.eql(FuelMode.noFuel)
      expect(raceManager.race.signalLightState).to.be.eql(1)
      expect(raceManager.race.isRaceActive).to.be.eql(true)
    })

    it("should update fuel mode", () => {
      expect(raceManager.update(
        new GetRaceStatusResponse("does not matter", 0, 0, 0, 0, 0, 0, 0, true, 1, FuelMode.normalMode))
      ).to.be.eql([
        new MqttValue("Home/carrera/Race/1/FuelMode", "1")
      ])
      expect(raceManager.race.fuelMode).to.be.eql(FuelMode.normalMode)
      expect(raceManager.race.signalLightState).to.be.eql(1)
      expect(raceManager.race.isRaceActive).to.be.eql(true)
    })
  })

  describe("lap times and number of laps", () => {
    const raceManager: RaceManager = new RaceManager()

    it("should not generate updates when car 1 crosses line after 1000ms", () => {
      expect(raceManager.update(
        new GetTimeResponse("car 1 crosses line", 0, 1, 1000, 1)
      )).to.be.eql([
      ])
      expect(raceManager.race.cars[0].lastMeasuredTime).to.be.eql(1000)
      expect(raceManager.race.cars[0].lastLapTime).to.be.undefined
      expect(raceManager.race.cars[0].numberOfLaps).to.be.eql(0)
      expect(raceManager.race.cars[0].fastestLapTime).to.be.undefined
      expect(raceManager.race.cars[0].fastestLapNumber).to.be.undefined

      expect(raceManager.race.cars[6].lastMeasuredTime).to.be.undefined
      expect(raceManager.race.cars[6].numberOfLaps).to.be.eql(0)
      expect(raceManager.race.cars[6].lastLapTime).to.be.undefined
      expect(raceManager.race.cars[6].fastestLapTime).to.be.undefined
      expect(raceManager.race.cars[6].fastestLapNumber).to.be.undefined

      expect(raceManager.race.fastestCar).to.be.undefined
      expect(raceManager.race.fastestLapTime).to.be.undefined
      expect(raceManager.race.leadingCar).to.be.undefined
    })

    it("should not generate updates when car 7 crosses line after 2000ms", () => {
      expect(raceManager.update(
        new GetTimeResponse("car 7 crosses line", 0, 7, 2000, 1)
      )).to.be.eql([
      ])
      expect(raceManager.race.cars[0].lastMeasuredTime).to.be.eql(1000)
      expect(raceManager.race.cars[0].lastLapTime).to.be.undefined
      expect(raceManager.race.cars[0].numberOfLaps).to.be.eql(0)
      expect(raceManager.race.cars[0].fastestLapTime).to.be.undefined
      expect(raceManager.race.cars[0].fastestLapNumber).to.be.undefined

      expect(raceManager.race.cars[6].lastMeasuredTime).to.be.eql(2000)
      expect(raceManager.race.cars[6].numberOfLaps).to.be.eql(0)
      expect(raceManager.race.cars[6].lastLapTime).to.be.undefined
      expect(raceManager.race.cars[6].fastestLapTime).to.be.undefined
      expect(raceManager.race.cars[6].fastestLapNumber).to.be.undefined

      expect(raceManager.race.fastestCar).to.be.undefined
      expect(raceManager.race.fastestLapTime).to.be.undefined
      expect(raceManager.race.leadingCar).to.be.undefined
    })


    it("should have car 1 with the fastest lap and as the leading car when car 1 crossing the line a second time after 5000ms", () => {
      expect(raceManager.update(
        new GetTimeResponse("car 1 crosses line the second time", 0, 1, 5000, 1)
      )).to.be.eql([
        new MqttValue("Home/carrera/Car/1/NumberOfLaps", "1"),
        new MqttValue("Home/carrera/Car/1/LastLapTime", "4000"),
        new MqttValue("Home/carrera/Car/1/TimeOfFastestLap", "4000"),
        new MqttValue("Home/carrera/Car/1/NumberOfFastestLap", "1"),
        new MqttValue("Home/carrera/Race/1/FastestCar", "1"),
        new MqttValue("Home/carrera/Race/1/FastestLapTime", "4000"),
        new MqttValue("Home/carrera/Race/1/LeadingCar", "1"),
      ])
      expect(raceManager.race.cars[0].lastMeasuredTime).to.be.eql(5000)
      expect(raceManager.race.cars[0].lastLapTime).to.be.eql(4000)
      expect(raceManager.race.cars[0].numberOfLaps).to.be.eql(1)
      expect(raceManager.race.cars[0].fastestLapTime).to.be.eql(4000)
      expect(raceManager.race.cars[0].fastestLapNumber).to.be.eql(1)

      expect(raceManager.race.cars[6].lastMeasuredTime).to.be.eql(2000)
      expect(raceManager.race.cars[6].numberOfLaps).to.be.eql(0)
      expect(raceManager.race.cars[6].lastLapTime).to.be.undefined
      expect(raceManager.race.cars[6].fastestLapTime).to.be.undefined
      expect(raceManager.race.cars[6].fastestLapNumber).to.be.undefined

      expect(raceManager.race.fastestCar).to.be.not.undefined
      expect(raceManager.race.fastestCar!.id).to.be.eql(1)
      expect(raceManager.race.fastestLapTime).to.be.eql(4000)
      expect(raceManager.race.leadingCar).to.be.not.undefined
      expect(raceManager.race.leadingCar!.id).to.be.eql(1)
    })

    it("should have also car 1 with the fastest lap and the leading car when car 7 crossing the line a second time after 6000ms", () => {
      expect(raceManager.update(
        new GetTimeResponse("car 7 crosses line the second time", 0, 7, 6000, 1)
      )).to.be.eql([
        new MqttValue("Home/carrera/Car/ghostcar/NumberOfLaps", "1"),
        new MqttValue("Home/carrera/Car/ghostcar/LastLapTime", "4000"),
        new MqttValue("Home/carrera/Car/ghostcar/TimeOfFastestLap", "4000"),
        new MqttValue("Home/carrera/Car/ghostcar/NumberOfFastestLap", "1"),
      ])
      expect(raceManager.race.cars[0].lastMeasuredTime).to.be.eql(5000)
      expect(raceManager.race.cars[0].lastLapTime).to.be.eql(4000)
      expect(raceManager.race.cars[0].numberOfLaps).to.be.eql(1)
      expect(raceManager.race.cars[0].fastestLapTime).to.be.eql(4000)
      expect(raceManager.race.cars[0].fastestLapNumber).to.be.eql(1)

      expect(raceManager.race.cars[6].lastMeasuredTime).to.be.eql(6000)
      expect(raceManager.race.cars[6].numberOfLaps).to.be.eql(1)
      expect(raceManager.race.cars[6].lastLapTime).to.be.eql(4000)
      expect(raceManager.race.cars[6].fastestLapTime).to.be.eql(4000)
      expect(raceManager.race.cars[6].fastestLapNumber).to.be.eql(1)

      expect(raceManager.race.fastestCar).to.be.not.undefined
      expect(raceManager.race.fastestCar!.id).to.be.eql(1)
      expect(raceManager.race.fastestLapTime).to.be.eql(4000)
      expect(raceManager.race.leadingCar).to.be.not.undefined
      expect(raceManager.race.leadingCar!.id).to.be.eql(1)
    })

    it("should have car 7 with the fastest lap and leading car when crossing the line a third time after 8000ms", () => {
      expect(raceManager.update(
        new GetTimeResponse("car 7 crosses line the third time", 0, 7, 8000, 1)
      )).to.be.eql([
        new MqttValue("Home/carrera/Car/ghostcar/NumberOfLaps", "2"),
        new MqttValue("Home/carrera/Car/ghostcar/LastLapTime", "2000"),
        new MqttValue("Home/carrera/Car/ghostcar/TimeOfFastestLap", "2000"),
        new MqttValue("Home/carrera/Car/ghostcar/NumberOfFastestLap", "2"),
        new MqttValue("Home/carrera/Race/1/FastestCar", "7"),
        new MqttValue("Home/carrera/Race/1/FastestLapTime", "2000"),
        new MqttValue("Home/carrera/Race/1/LeadingCar", "7")
      ])
      expect(raceManager.race.cars[0].lastMeasuredTime).to.be.eql(5000)
      expect(raceManager.race.cars[0].lastLapTime).to.be.eql(4000)
      expect(raceManager.race.cars[0].numberOfLaps).to.be.eql(1)
      expect(raceManager.race.cars[0].fastestLapTime).to.be.eql(4000)
      expect(raceManager.race.cars[0].fastestLapNumber).to.be.eql(1)

      expect(raceManager.race.cars[6].lastMeasuredTime).to.be.eql(8000)
      expect(raceManager.race.cars[6].numberOfLaps).to.be.eql(2)
      expect(raceManager.race.cars[6].lastLapTime).to.be.eql(2000)
      expect(raceManager.race.cars[6].fastestLapTime).to.be.eql(2000)
      expect(raceManager.race.cars[6].fastestLapNumber).to.be.eql(2)

      expect(raceManager.race.fastestCar).to.be.not.undefined
      expect(raceManager.race.fastestCar!.id).to.be.eql(7)
      expect(raceManager.race.fastestLapTime).to.be.eql(2000)
      expect(raceManager.race.leadingCar).to.be.not.undefined
      expect(raceManager.race.leadingCar!.id).to.be.eql(7)
    })
  })

  describe("reseting race because of status message", () => {
    const raceManager: RaceManager = new RaceManager()

    it("should have initial values", () => {
      expect(raceManager.update(
        new GetRaceStatusResponse("does not matter", 0, 0, 0, 0, 0, 0, 0, false, 0, FuelMode.noFuel))
      ).to.be.eql([
        new MqttValue("Home/carrera/Race/1/FuelMode", "0"),
        new MqttValue("Home/carrera/Race/1/SignalLightState", "0"),
        new MqttValue("Home/carrera/Race/1/IsRaceActive", "0")
      ])
    })

    it("should have an active race", () => {
      expect(raceManager.update(
        new GetRaceStatusResponse("does not matter", 0, 0, 0, 0, 0, 0, 0, true, 0, FuelMode.noFuel))
      ).to.be.eql([
        new MqttValue("Home/carrera/Race/1/IsRaceActive", "1")
      ])
    })

    it("should reset when race is stopped again", () => {
      const afterRaceStopped: MqttValue[] = []

      afterRaceStopped.push(...initialMqttMessages)
      afterRaceStopped.push(new MqttValue("Home/carrera/Race/1/FuelMode", "0"))
      afterRaceStopped.push(new MqttValue("Home/carrera/Race/1/SignalLightState", "0"))
      afterRaceStopped.push(new MqttValue("Home/carrera/Race/1/IsRaceActive", "0"))

      expect(raceManager.update(
        new GetRaceStatusResponse("does not matter", 0, 0, 0, 0, 0, 0, 0, false, 0, FuelMode.noFuel))
      ).to.be.eql(afterRaceStopped)
    })
  })

  describe("resetting race because of invalid time measurements", () => {
    const raceManager: RaceManager = new RaceManager()

    it("should not generate updates when car 1 crosses line after 1000ms", () => {
      expect(raceManager.update(
        new GetTimeResponse("car 1 crosses line", 0, 1, 1000, 1)
      )).to.be.eql([
      ])
    })

    it("should generate reset updates when car 1 crosses line after 500ms", () => {
      expect(raceManager.update(
        new GetTimeResponse("car 1 crosses line a second time with invalid time measurement", 0, 1, 500, 1)
      )).to.be.eql(initialMqttMessages)
    })
  })

  describe("leading car", () => {
    const raceManager: RaceManager = new RaceManager()

    it("should not have a leading car when car two crosses line after 1000ms", () => {
      expect(raceManager.update(
        new GetTimeResponse("car 2 crosses line", 0, 2, 1000, 1)
      )).to.be.eql([])

      expect(raceManager.race.leadingCar).to.be.undefined
    })

    it("should not have a leading car when car one crosses line after 1500ms", () => {
      expect(raceManager.update(
        new GetTimeResponse("car 1 crosses line", 0, 1, 1500, 1)
      )).to.be.eql([])

      expect(raceManager.race.leadingCar).to.be.undefined
    })

    it("should have car two as leading car when car two crosses line after 2000ms", () => {
      expect(raceManager.update(
        new GetTimeResponse("car 2 crosses line", 0, 2, 2000, 1)
      )).to.be.eql([
        new MqttValue("Home/carrera/Car/2/NumberOfLaps", "1"),
        new MqttValue("Home/carrera/Car/2/LastLapTime", "1000"),
        new MqttValue("Home/carrera/Car/2/TimeOfFastestLap", "1000"),
        new MqttValue("Home/carrera/Car/2/NumberOfFastestLap", "1"),
        new MqttValue("Home/carrera/Race/1/FastestCar", "2"),
        new MqttValue("Home/carrera/Race/1/FastestLapTime", "1000"),
        new MqttValue("Home/carrera/Race/1/LeadingCar", "2"),
      ])

      expect(raceManager.race.leadingCar?.id).to.be.eql(2)
    })

    it("should still have car two as leading car when car one crosses line after 3000ms", () => {
      expect(raceManager.update(
        new GetTimeResponse("car 1 crosses line", 0, 1, 3000, 1)
      )).to.be.eql([
        new MqttValue("Home/carrera/Car/1/NumberOfLaps", "1"),
        new MqttValue("Home/carrera/Car/1/LastLapTime", "1500"),
        new MqttValue("Home/carrera/Car/1/TimeOfFastestLap", "1500"),
        new MqttValue("Home/carrera/Car/1/NumberOfFastestLap", "1"),
      ])

      expect(raceManager.race.leadingCar?.id).to.be.eql(2)
    })

    it("should have car one as leading car when car one crosses line after 4500ms", () => {
      expect(raceManager.update(
        new GetTimeResponse("car 1 crosses line", 0, 1, 4500, 1)
      )).to.be.eql([
        new MqttValue("Home/carrera/Car/1/NumberOfLaps", "2"),
        new MqttValue("Home/carrera/Car/1/LastLapTime", "1500"),
        new MqttValue("Home/carrera/Race/1/LeadingCar", "1"),
      ])

      expect(raceManager.race.leadingCar?.id).to.be.eql(1)
    })
  })
})
