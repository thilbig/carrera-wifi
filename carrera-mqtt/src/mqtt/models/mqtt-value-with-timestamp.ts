import {MqttValue} from "./mqtt-value";

export class MqttValueWithTimestamp extends MqttValue {
  public constructor(public readonly timeStamp: number, topic: string, value: string) {
    super(topic, value)
  }
}
