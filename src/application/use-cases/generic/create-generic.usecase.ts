import { GenericRequestDto, GenericResponseDto } from "../../dto/get-generic.dto";
import { ICreateGenericUseCase } from "../../../domain/interfaces/use-cases/generic/create-generic.usecase.interface";
import { DomainException } from "../../../domain/exceptions/domain.exception";
import { DomainErrors } from "../../../domain/errors/domain-errors";

export class CreateGenericUseCase implements ICreateGenericUseCase {
  constructor() {}

  async execute(genericRequest: GenericRequestDto): Promise<GenericResponseDto> {
    if (!genericRequest.name || genericRequest.name.trim().length < 3) {
      const error = DomainErrors.GENERIC_INVALID_NAME;
      throw new DomainException(error.code, error.message, error.statusCode);
    }

    const response = {
      name: genericRequest.name,
      lastName: genericRequest.lastName,

      age: genericRequest.age,
    } as GenericResponseDto;
    return response;
  }
}
