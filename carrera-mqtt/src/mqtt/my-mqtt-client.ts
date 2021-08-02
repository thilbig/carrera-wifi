import {connect, MqttClient} from "mqtt";
import {MqttValueWithTimestamp} from "./models/mqtt-value-with-timestamp";
import {MqttValue} from "./models/mqtt-value";

export class MyMqttClient {
  private mqttClient: MqttClient | undefined

  public constructor(private readonly brokerAddress: string = "192.168.2.150") {
  }

  public async connect(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.mqttClient = connect("mqtt://" + this.brokerAddress)

      this.mqttClient.on("connect", () => {
        resolve()
      })
    })
  }

  public async subscribe(topicToSubscribeTo: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.mqttClient) {
        this.mqttClient.subscribe(topicToSubscribeTo, {qos: 1}, (err => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        }))
      } else {
        reject("Client is not set, please call the connect method first")
      }
    })
  }

  public registerOnMessageCallback(onValueReceived: (receivedValue: MqttValueWithTimestamp) => void): void {
    if (this.mqttClient) {
      this.mqttClient.on("message", (topic: string, message: Buffer) => {
        onValueReceived(new MqttValueWithTimestamp(+new Date, topic, message.toString()))
      })
    } else {
      throw new Error("Client is not set, please call the connect method first")
    }
  }

  public publishUpdates(updates: MqttValue[]): void {
    if (this.mqttClient) {
      for (const update of updates) {
        this.mqttClient.publish(update.topic, update.value)
      }
    } else {
      throw new Error("Client is not set, please call the connect method first")
    }
  }
}
