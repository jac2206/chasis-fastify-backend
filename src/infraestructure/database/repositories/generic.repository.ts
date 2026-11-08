import { pool } from "../../database/postgres";
import { Generic } from "../../../domain/entities/generic.entity";
import { IGenericRepository } from "../../../domain/interfaces/repositories/generic.repository.interface";

export class GenericRepository implements IGenericRepository {
  async save(entity: Generic): Promise<Generic> {
    const data = entity.toPersistence();

    const result = await pool.query(
      `INSERT INTO generics (name, last_name, age)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.name, data.lastName, data.age],
    );

    const row = result.rows[0];

    return new Generic(row.name, row.last_name, row.age);
  }

  async findById(id: string): Promise<Generic | null> {
    const result = await pool.query("SELECT * FROM generics WHERE id = $1", [id]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];

    return new Generic(row.name, row.last_name, row.age);
  }
}
