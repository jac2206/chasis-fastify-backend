export interface RegisterUserRequestDTO {
  documentType: "CC" | "CE" | "NIT" | "PT";
  documentNumber: string;
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface RegisterUserResponseDTO {
  id: string;
  email: string;
  fullName: string;
  message: string;
}
