export interface CreateServiceClientRequestDTO {
  clientId: string;
  scopes: string[];
}

export interface CreateServiceClientResponseDTO {
  clientId: string;
  clientSecret: string;
  scopes: string[];
}

export interface RotateServiceClientResponseDTO {
  clientId: string;
  clientSecret: string;
}

export interface ServiceClientStatusResponseDTO {
  clientId: string;
  status: boolean;
}
