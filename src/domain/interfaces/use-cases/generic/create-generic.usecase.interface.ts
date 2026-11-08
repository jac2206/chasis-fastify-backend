import {
  GenericRequestDto,
  GenericResponseDto,
} from "../../../../application/dto/get-generic.dto";

export interface ICreateGenericUseCase {
  execute(genericRequest: GenericRequestDto): Promise<GenericResponseDto>;
}
