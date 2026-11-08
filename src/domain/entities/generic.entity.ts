export class Generic {
  constructor(
    public readonly name: string,
    public readonly lastName: string,
    public readonly age: number,
  ) {}

  toPersistence() {
    return {
      name: this.name,
      lastName: this.lastName,
      age: this.age,
    };
  }
}
