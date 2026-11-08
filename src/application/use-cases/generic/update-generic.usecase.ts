import { IUpdateGenericUseCase } from "../../../domain/interfaces/use-cases/generic/update-generic.usecase.interface";
import { GenericRequestDto, GenericResponseDto } from "../../dto/get-generic.dto";
import { DomainException } from "../../../domain/exceptions/domain.exception";
import { DomainErrors } from "../../../domain/errors/domain-errors";
import { ILogger } from "../../../domain/interfaces/logger.interface";

export class UpdateGenericUseCase implements IUpdateGenericUseCase {
  constructor(private readonly logger: ILogger) {}

  async execute(
    genericRequest: GenericRequestDto,
    id: string,
  ): Promise<GenericResponseDto & { id: string }> {
    this.logger.info("CreateGenericUseCase", "Starting create generic", genericRequest);
    if (!id) {
      const error = DomainErrors.GENERIC_ID_REQUIRED;
      throw new DomainException(error.code, error.message, error.statusCode);
    }

    if (!genericRequest.name || genericRequest.name.trim().length < 3) {
      const error = DomainErrors.GENERIC_INVALID_NAME;
      throw new DomainException(error.code, error.message, error.statusCode);
    }
    const response = {
      name: genericRequest.name,
      lastName: genericRequest.lastName,
      age: genericRequest.age,
    } as GenericResponseDto;
    return {
      ...response,
      id,
    };
  }
}
