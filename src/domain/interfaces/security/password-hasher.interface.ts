export interface IPasswordHasher {
  hash(value: string, cost: number): Promise<string>;
  compare(value: string, hash: string): Promise<boolean>;
}
