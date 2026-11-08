import { Generic } from "../../../domain/entities/generic.entity";
import { IGetGenericUseCase } from "../../../domain/interfaces/use-cases/generic/get-generic.usecase.interfaces";

export class GetGenericUseCase implements IGetGenericUseCase {
  constructor() {}

  async execute(): Promise<Generic> {
    const generic = new Generic("Julian", "Arango", 30);
    return generic;
  }
}
