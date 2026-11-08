export interface GetUsersResponseDTO {
  documentType: "CC" | "CE" | "NIT" | "PT";
  documentNumber: string;
  fullName: string;
  email: string;
  phone: string | null;
  hasPin: boolean;
  status: boolean;
}
