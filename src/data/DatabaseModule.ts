import type Database from 'better-sqlite3';
import type {
  Position,
  Operation,
  CreatePositionInput,
  CreateOperationInput,
  UpdatePositionInput,
  AssetClass,
} from '@/types';

export class DatabaseModule {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  // =====================
  // Positions CRUD
  // =====================

  createPosition(input: CreatePositionInput): Position {
    const stmt = this.db.prepare(`
      INSERT INTO positions (ticker, nome, classe_ativo, setor, segmento, quantidade, preco_medio)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      input.ticker,
      input.nome,
      input.classe_ativo,
      input.setor ?? null,
      input.segmento ?? null,
      input.quantidade,
      input.preco_medio
    );

    const id = result.lastInsertRowid as number;
    return this.getPositionById(id)!;
  }

  getPositionById(id: number): Position | null {
    const stmt = this.db.prepare('SELECT * FROM positions WHERE id = ?');
    const row = stmt.get(id) as Record<string, unknown> | undefined;
    return row ? this.mapPosition(row) : null;
  }

  getPositionByTicker(ticker: string): Position | null {
    const stmt = this.db.prepare('SELECT * FROM positions WHERE ticker = ?');
    const row = stmt.get(ticker) as Record<string, unknown> | undefined;
    return row ? this.mapPosition(row) : null;
  }

  getAllPositions(): Position[] {
    const stmt = this.db.prepare('SELECT * FROM positions ORDER BY data_criacao DESC');
    const rows = stmt.all() as Record<string, unknown>[];
    return rows.map(this.mapPosition);
  }

  getPositionsByAssetClass(classe_ativo: AssetClass): Position[] {
    const stmt = this.db.prepare('SELECT * FROM positions WHERE classe_ativo = ? ORDER BY data_criacao DESC');
    const rows = stmt.all(classe_ativo) as Record<string, unknown>[];
    return rows.map(this.mapPosition);
  }

  updatePosition(id: number, input: UpdatePositionInput): Position | null {
    // Check if position exists
    const existing = this.getPositionById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: unknown[] = [];

    if (input.nome !== undefined) {
      fields.push('nome = ?');
      values.push(input.nome);
    }
    if (input.setor !== undefined) {
      fields.push('setor = ?');
      values.push(input.setor);
    }
    if (input.segmento !== undefined) {
      fields.push('segmento = ?');
      values.push(input.segmento);
    }
    if (input.quantidade !== undefined) {
      fields.push('quantidade = ?');
      values.push(input.quantidade);
    }
    if (input.preco_medio !== undefined) {
      fields.push('preco_medio = ?');
      values.push(input.preco_medio);
    }

    if (fields.length === 0) {
      return existing;
    }

    // Always update updated_at
    fields.push('updated_at = CURRENT_TIMESTAMP');

    const query = `UPDATE positions SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    const stmt = this.db.prepare(query);
    stmt.run(...values);

    return this.getPositionById(id);
  }

  deletePosition(id: number): boolean {
    // Due to ON DELETE CASCADE, operations will be automatically deleted
    const stmt = this.db.prepare('DELETE FROM positions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // =====================
  // Operations CRUD
  // =====================

  createOperation(input: CreateOperationInput): Operation {
    // Calculate preco_unitario
    const preco_unitario = input.valor_total / input.quantidade;

    const stmt = this.db.prepare(`
      INSERT INTO operations (position_id, tipo, data, quantidade, valor_total, preco_unitario)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      input.position_id,
      input.tipo,
      input.data,
      input.quantidade,
      input.valor_total,
      preco_unitario
    );

    const id = result.lastInsertRowid as number;
    return this.getOperationById(id)!;
  }

  getOperationById(id: number): Operation | null {
    const stmt = this.db.prepare('SELECT * FROM operations WHERE id = ?');
    const row = stmt.get(id) as Record<string, unknown> | undefined;
    return row ? this.mapOperation(row) : null;
  }

  getOperationsByPositionId(position_id: number): Operation[] {
    const stmt = this.db.prepare(
      'SELECT * FROM operations WHERE position_id = ? ORDER BY data DESC, id DESC'
    );
    const rows = stmt.all(position_id) as Record<string, unknown>[];
    return rows.map(this.mapOperation);
  }

  getAllOperations(): Operation[] {
    const stmt = this.db.prepare('SELECT * FROM operations ORDER BY data DESC, id DESC');
    const rows = stmt.all() as Record<string, unknown>[];
    return rows.map(this.mapOperation);
  }

  deleteOperation(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM operations WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // =====================
  // Config CRUD
  // =====================

  getConfig(chave: string): string | null {
    const stmt = this.db.prepare('SELECT valor FROM config WHERE chave = ?');
    const row = stmt.get(chave) as { valor: string } | undefined;
    return row ? row.valor : null;
  }

  setConfig(chave: string, valor: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO config (chave, valor) VALUES (?, ?)
      ON CONFLICT(chave) DO UPDATE SET
        valor = excluded.valor,
        updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(chave, valor);
  }

  deleteConfig(chave: string): boolean {
    const stmt = this.db.prepare('DELETE FROM config WHERE chave = ?');
    const result = stmt.run(chave);
    return result.changes > 0;
  }

  // =====================
  // Mappers
  // =====================

  private mapPosition(row: Record<string, unknown>): Position {
    return {
      id: row.id as number,
      ticker: row.ticker as string,
      nome: row.nome as string,
      classe_ativo: row.classe_ativo as AssetClass,
      setor: row.setor as string | null,
      segmento: row.segmento as string | null,
      quantidade: row.quantidade as number,
      preco_medio: row.preco_medio as number,
      data_criacao: row.data_criacao as string,
      updated_at: row.updated_at as string,
    };
  }

  private mapOperation(row: Record<string, unknown>): Operation {
    return {
      id: row.id as number,
      position_id: row.position_id as number,
      tipo: row.tipo as 'compra' | 'venda',
      data: row.data as string,
      quantidade: row.quantidade as number,
      valor_total: row.valor_total as number,
      preco_unitario: row.preco_unitario as number,
      created_at: row.created_at as string,
    };
  }
}
