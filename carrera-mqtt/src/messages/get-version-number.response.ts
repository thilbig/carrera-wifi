import {AMessageWithUpdates} from "./a-message-with-updates";

export class GetVersionNumberResponse extends AMessageWithUpdates {
  public constructor(encodedMessage: string, timestamp: number, public readonly versionNumber: number) {
    super(encodedMessage, timestamp)
  }

  public toString(): string {
    return `Version: ${this.versionNumber}`
  }
}
