export interface ServiceClient {
  clientId: string;
  clientSecretHash: string;
  scopes: string[];
  status: boolean;
}

export interface IServiceClientRepository {
  findByClientId(clientId: string): Promise<ServiceClient | null>;
  create(client: Omit<ServiceClient, "status">): Promise<ServiceClient>;
  updateSecret(clientId: string, clientSecretHash: string): Promise<void>;
  updateStatus(clientId: string, status: boolean): Promise<void>;
}
