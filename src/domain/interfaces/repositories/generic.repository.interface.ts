import { Generic } from "../../entities/generic.entity";

export interface IGenericRepository {
  save(entity: Generic): Promise<Generic>;
  findById(id: string): Promise<Generic | null>;
}
