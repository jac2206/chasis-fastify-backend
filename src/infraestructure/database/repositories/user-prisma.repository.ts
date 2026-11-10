import { User } from "../../../domain/entities/user.entity";
import type { IUserRepository } from "../../../domain/interfaces/repositories/user.repository.interface";
import { prisma } from "../prisma";

export class UserPrismaRepository implements IUserRepository {
  async findPage(
    page: number,
    pageSize: number,
  ): Promise<{ users: User[]; total: number }> {
    const [rows, total] = await Promise.all([
      prisma.users.findMany({
        orderBy: { document_number: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.users.count(),
    ]);
    const users = rows.map(
      (row) =>
        new User(
          row.document_type,
          row.document_number,
          row.full_name,
          row.email,
          row.phone,
          row.password_hash,
          row.has_pin,
          row.status,
        ),
    );
    return { users, total };
  }
  async save(entity: User): Promise<User> {
    const data = entity.toPersistence();

    const row = await prisma.users.create({
      data: {
        document_number: data.documentNumber,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        password_hash: data.password_hash,
        has_pin: data.has_pin,
        status: data.status,
        document_type: data.documentType,
      },
    });

    return new User(
      row.document_type,
      row.document_number,
      row.full_name,
      row.email,
      row.phone,
      row.password_hash,
      row.has_pin,
      row.status,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (!row) {
      return null;
    }

    return new User(
      row.document_type,
      row.document_number,
      row.full_name,
      row.email,
      row.phone,
      row.password_hash,
      row.has_pin,
      row.status,
    );
  }

  async findByDocument(documentNumber: string): Promise<User | null> {
    const row = await prisma.users.findUnique({
      where: {
        document_number: documentNumber,
      },
    });

    if (!row) {
      return null;
    }

    return new User(
      row.document_type,
      row.document_number,
      row.full_name,
      row.email,
      row.phone,
      row.password_hash,
      row.has_pin,
      row.status,
    );
  }

  async findAll(): Promise<User[]> {
    const rows = await prisma.users.findMany();

    return rows.map(
      (row) =>
        new User(
          row.document_type,
          row.document_number,
          row.full_name,
          row.email,
          row.phone,
          row.password_hash,
          row.has_pin,
          row.status,
        ),
    );
  }
}
