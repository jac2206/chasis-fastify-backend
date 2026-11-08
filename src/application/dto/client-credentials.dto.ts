export interface ClientCredentialsRequestDTO {
  clientId: string;
  clientSecret: string;
}

export interface ClientCredentialsResponseDTO {
  token: string;
  tokenType: "Bearer";
  expiresIn: number;
}
