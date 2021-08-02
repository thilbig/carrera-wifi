import lowDb from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync';
import {MqttValueWithTimestamp} from "../mqtt/models/mqtt-value-with-timestamp";

type Schema = {
  receivedValues: MqttValueWithTimestamp[]
}

export class DbManager {
  private db: lowDb.LowdbAsync<Schema> | undefined

  public constructor(private readonly pathToDbFile: string = "../db.json") {
  }

  public async init(): Promise<void> {
    const adapter = new FileAsync(this.pathToDbFile)
    this.db = await lowDb(adapter)

    this.db.defaults({ receivedValues: [] }).write()
  }

  public async addMqttValue(receivedValue: MqttValueWithTimestamp): Promise<void> {
    if (this.db) {
      await this.db.get("receivedValues").push(receivedValue).write()
    } else {
      throw new Error("DB is not initialised!")
    }
  }

  public async getAllValues(): Promise<MqttValueWithTimestamp[]> {
    if (this.db) {
      return this.db.get("receivedValues").value()
    } else {
      throw new Error("DB is not initialised!")
    }
  }
}
