import { Generic } from "../../../entities/generic.entity";

export interface IGetXIdGenericUseCase {
  execute(id: string): Promise<Generic | null>;
}
