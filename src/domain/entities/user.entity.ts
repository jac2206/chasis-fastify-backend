export class User {
  constructor(
    public readonly documentType: "CC" | "CE" | "NIT" | "PT",
    public readonly documentNumber: string,
    public readonly fullName: string,
    public readonly email: string,
    public readonly phone: string | null,
    public readonly passwordHash: string,
    public readonly hasPin: boolean = false,
    public readonly status: boolean = true,
  ) {}

  toPersistence() {
    return {
      documentType: this.documentType,
      documentNumber: this.documentNumber,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      password_hash: this.passwordHash,
      has_pin: this.hasPin,
      status: this.status,
    };
  }
}
