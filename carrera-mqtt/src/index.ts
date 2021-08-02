import {DbManager} from "./database/db-manager";
import {MyMqttClient} from "./mqtt/my-mqtt-client";
import {MessageDecoder} from "./decoder/message-decoder"
import {AMessageBase} from "./messages/a-message-base";
import {MqttValueWithTimestamp} from "./mqtt/models/mqtt-value-with-timestamp";
import {AMessageWithUpdates} from "./messages/a-message-with-updates";
import {RaceManager} from "./race-manager/race-manager";
import {MqttValue} from "./mqtt/models/mqtt-value";

type mode = "demo" | "live"
let currentMode: mode = "live"

if (process.argv.length !== 3) {
  console.error("Missing args. Start with 'node index.js <'demo' or 'live'>' Assuming 'live'")
} else if (process.argv[2] === "demo" || process.argv[2] === "live")  {
  currentMode = process.argv[2] as mode
}

async function asyncMain(): Promise<void> {
  const dbManager = new DbManager()
  const mqttClient = new MyMqttClient()
  const decoder: MessageDecoder = new MessageDecoder()
  const raceManager: RaceManager = new RaceManager()

  let lastReceivedValue: MqttValueWithTimestamp | undefined

  await dbManager.init()
  await mqttClient.connect()
  await mqttClient.subscribe("Home/carrera/track/Encoded/#")

  mqttClient.registerOnMessageCallback((receivedValue: MqttValueWithTimestamp) => {
    if (!lastReceivedValue || lastReceivedValue.value !== receivedValue.value) {
      console.log(`Received a new value '${receivedValue.value} from topic '${receivedValue.topic}'`)

      dbManager.addMqttValue(receivedValue)
      lastReceivedValue = receivedValue

      handleReceivedMqttMessage(receivedValue, decoder, raceManager, mqttClient)
    }
  })
}

function handleReceivedMqttMessage(receivedValue: MqttValueWithTimestamp,
                                   decoder: MessageDecoder,
                                   raceManager: RaceManager,
                                   mqttClient: MyMqttClient): void {
  try {
    const decoded: AMessageBase = decoder.decodeMessage(receivedValue.value, receivedValue.timeStamp)

    if (decoded instanceof AMessageWithUpdates) {
      const updates: MqttValue[] = raceManager.update(decoded)

      mqttClient.publishUpdates(updates)
    }
  } catch (error) {
    console.error(error)
  }
}

async function runDemoFromDatabase(): Promise<void> {
  const dbManager = new DbManager("../demo-db.json")
  const mqttClient = new MyMqttClient()
  const decoder: MessageDecoder = new MessageDecoder()
  const raceManager: RaceManager = new RaceManager()

  await dbManager.init()
  await mqttClient.connect()

  const demoValues: MqttValueWithTimestamp[] = await dbManager.getAllValues()

  console.log(`Running demo with ${demoValues.length} values ...`)

  for (const demoValue of demoValues) {
    handleReceivedMqttMessage(demoValue, decoder, raceManager, mqttClient)
    await delay(100)
  }

  console.log("... done")
}

async function delay(timeMs: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(resolve, timeMs)
  })
}

function run(mode: "live" | "demo") {
  if (mode === "live") {
    asyncMain().then(() => console.log("RUNNING"), console.error)
  } else if (mode === "demo") {
    runDemoFromDatabase().then(() => console.log("RUNNING"), console.error)
  }
}

run(currentMode)
