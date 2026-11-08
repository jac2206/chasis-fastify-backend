import {
  GenericRequestDto,
  GenericResponseDto,
} from "../../../../application/dto/get-generic.dto";

export interface IUpdateGenericUseCase {
  execute(
    genericRequest: GenericRequestDto,
    id: string,
  ): Promise<GenericResponseDto & { id: string }>;
}
