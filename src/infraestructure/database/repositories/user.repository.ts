import { User } from "../../../domain/entities/user.entity";
import type { IUserRepository } from "../../../domain/interfaces/repositories/user.repository.interface";
import { pool } from "../../database/postgres";

export class UserRepository implements IUserRepository {
  async findPage(
    page: number,
    pageSize: number,
  ): Promise<{ users: User[]; total: number }> {
    const [result, count] = await Promise.all([
      pool.query(
        "SELECT * FROM loyalty.users ORDER BY document_number ASC LIMIT $1 OFFSET $2",
        [pageSize, (page - 1) * pageSize],
      ),
      pool.query("SELECT COUNT(*) AS total FROM loyalty.users"),
    ]);
    return {
      users: result.rows.map(
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
      ),
      total: Number(count.rows[0].total),
    };
  }
  async save(entity: User): Promise<User> {
    const data = entity.toPersistence();

    const result = await pool.query(
      `INSERT INTO loyalty.users
      (document_type, document_number, full_name, email, phone, password_hash, has_pin, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        data.documentType,
        data.documentNumber,
        data.fullName,
        data.email,
        data.phone,
        data.password_hash,
        data.has_pin,
        data.status,
      ],
    );

    const row = result.rows[0];

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
    const result = await pool.query(`SELECT * FROM loyalty.users WHERE email = $1`, [
      email,
    ]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];

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
    const result = await pool.query(
      `SELECT * FROM loyalty.users WHERE document_number = $1`,
      [documentNumber],
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];

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
    const result = await pool.query(`
      SELECT 
        document_type,
        document_number,
        full_name,
        email,
        phone,
        password_hash,
        has_pin,
        status
      FROM loyalty.users
    `);

    return result.rows.map(
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
