import type {
  IServiceClientRepository,
  ServiceClient,
} from "../../../domain/interfaces/repositories/service-client.repository.interface";
import { prisma } from "../prisma";

export class ServiceClientPrismaRepository implements IServiceClientRepository {
  async create(client: Omit<ServiceClient, "status">): Promise<ServiceClient> {
    const row = await prisma.service_clients.create({
      data: {
        client_id: client.clientId,
        client_secret_hash: client.clientSecretHash,
        scopes: client.scopes,
      },
    });
    return {
      clientId: row.client_id,
      clientSecretHash: row.client_secret_hash,
      scopes: row.scopes,
      status: row.status,
    };
  }

  async findByClientId(clientId: string): Promise<ServiceClient | null> {
    const row = await prisma.service_clients.findUnique({
      where: { client_id: clientId },
    });

    if (!row) return null;

    return {
      clientId: row.client_id,
      clientSecretHash: row.client_secret_hash,
      scopes: row.scopes,
      status: row.status,
    };
  }

  async updateSecret(clientId: string, clientSecretHash: string): Promise<void> {
    await prisma.service_clients.update({
      where: { client_id: clientId },
      data: { client_secret_hash: clientSecretHash },
    });
  }

  async updateStatus(clientId: string, status: boolean): Promise<void> {
    await prisma.service_clients.update({
      where: { client_id: clientId },
      data: { status },
    });
  }
}
