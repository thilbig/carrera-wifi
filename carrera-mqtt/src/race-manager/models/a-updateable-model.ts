import {AMessageWithUpdates} from "../../messages/a-message-with-updates";
import {MqttValue} from "../../mqtt/models/mqtt-value";

export abstract class AUpdateableModel {
  public abstract getCurrentValues(): MqttValue[]
  public abstract update(message: AMessageWithUpdates): MqttValue[]
  public abstract reset(): void
}
