export abstract class AMessageBase {
  public constructor(public readonly encodedData: string, public readonly timestamp: number) {
  }

  public abstract toString(): string
}
