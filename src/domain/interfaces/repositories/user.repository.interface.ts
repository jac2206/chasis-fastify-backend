import type { User } from "../../entities/user.entity";

export interface IUserRepository {
  save(entity: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findByDocument(documentNumber: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findPage(page: number, pageSize: number): Promise<{ users: User[]; total: number }>;
}
