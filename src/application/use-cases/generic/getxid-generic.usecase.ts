import { Generic } from "../../../domain/entities/generic.entity";
import { IGenericRepository } from "../../../domain/interfaces/repositories/generic.repository.interface";
import { IGetXIdGenericUseCase } from "../../../domain/interfaces/use-cases/generic/getxid-generic.usecase.interface";

export class GetXIdGenericUseCase implements IGetXIdGenericUseCase {
  constructor(readonly genericRepository: IGenericRepository) {}

  async execute(id: string): Promise<Generic | null> {
    const result = this.genericRepository.findById(id);
    return result;
  }
}
