import bcrypt from "bcrypt";
import type { IPasswordHasher } from "../../domain/interfaces/security/password-hasher.interface";

export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(value: string, cost: number): Promise<string> {
    return bcrypt.hash(value, cost);
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }
}
