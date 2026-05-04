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

  createPosition(input: CreatePositionInput): Position {
    const insertStmt = this.db.prepare(`
      INSERT INTO positions (ticker, nome, classe_ativo, setor, segmento, quantidade, preco_medio)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      input.ticker,
      input.nome,
      input.classe_ativo,
      input.setor ?? null,
      input.segmento ?? null,
      input.quantidade,
      input.preco_medio
    );

    const id = result.lastInsertRowid as number;
    const position = this.getPositionById(id);
    if (!position) {
      throw new Error(`Failed to create position: ${input.ticker}`);
    }
    return position;
  }

  getPositionById(id: number): Position | null {
    const row = this.db.prepare('SELECT * FROM positions WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    return row ? this.mapPosition(row) : null;
  }

  getPositionByTicker(ticker: string): Position | null {
    const row = this.db.prepare('SELECT * FROM positions WHERE ticker = ?').get(ticker) as Record<string, unknown> | undefined;
    return row ? this.mapPosition(row) : null;
  }

  getAllPositions(): Position[] {
    const rows = this.db.prepare('SELECT * FROM positions ORDER BY data_criacao DESC').all() as Record<string, unknown>[];
    return rows.map(this.mapPosition);
  }

  getPositionsByAssetClass(classe_ativo: AssetClass): Position[] {
    const rows = this.db.prepare('SELECT * FROM positions WHERE classe_ativo = ? ORDER BY data_criacao DESC').all(classe_ativo) as Record<string, unknown>[];
    return rows.map(this.mapPosition);
  }

  updatePosition(id: number, input: UpdatePositionInput): Position | null {
    if (!this.getPositionById(id)) return null;

    const fieldMap: Record<string, unknown> = {
      nome: input.nome,
      setor: input.setor,
      segmento: input.segmento,
      quantidade: input.quantidade,
      preco_medio: input.preco_medio,
    };

    const updates = Object.entries(fieldMap)
      .filter(([_, value]) => value !== undefined)
      .map(([key]) => `${key} = ?`);

    if (updates.length === 0) {
      return this.getPositionById(id);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    const values = Object.entries(fieldMap)
      .filter(([_, value]) => value !== undefined)
      .map(([_, value]) => value);
    values.push(id);

    const query = `UPDATE positions SET ${updates.join(', ')} WHERE id = ?`;
    this.db.prepare(query).run(...values);

    return this.getPositionById(id);
  }

  deletePosition(id: number): boolean {
    const result = this.db.prepare('DELETE FROM positions WHERE id = ?').run(id);
    return result.changes > 0;
  }

  createOperation(input: CreateOperationInput): Operation {
    const preco_unitario = input.valor_total / input.quantidade;

    const insertStmt = this.db.prepare(`
      INSERT INTO operations (position_id, tipo, data, quantidade, valor_total, preco_unitario)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      input.position_id,
      input.tipo,
      input.data,
      input.quantidade,
      input.valor_total,
      preco_unitario
    );

    const id = result.lastInsertRowid as number;
    const operation = this.getOperationById(id);
    if (!operation) {
      throw new Error(`Failed to create operation for position: ${input.position_id}`);
    }
    return operation;
  }

  getOperationById(id: number): Operation | null {
    const row = this.db.prepare('SELECT * FROM operations WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    return row ? this.mapOperation(row) : null;
  }

  getOperationsByPositionId(position_id: number): Operation[] {
    const rows = this.db
      .prepare('SELECT * FROM operations WHERE position_id = ? ORDER BY data DESC, id DESC')
      .all(position_id) as Record<string, unknown>[];
    return rows.map(this.mapOperation);
  }

  getAllOperations(): Operation[] {
    const rows = this.db.prepare('SELECT * FROM operations ORDER BY data DESC, id DESC').all() as Record<string, unknown>[];
    return rows.map(this.mapOperation);
  }

  deleteOperation(id: number): boolean {
    const result = this.db.prepare('DELETE FROM operations WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getConfig(chave: string): string | null {
    const row = this.db.prepare('SELECT valor FROM config WHERE chave = ?').get(chave) as { valor: string } | undefined;
    return row ? row.valor : null;
  }

  setConfig(chave: string, valor: string): void {
    this.db.prepare(`
      INSERT INTO config (chave, valor) VALUES (?, ?)
      ON CONFLICT(chave) DO UPDATE SET
        valor = excluded.valor,
        updated_at = CURRENT_TIMESTAMP
    `).run(chave, valor);
  }

  deleteConfig(chave: string): boolean {
    const result = this.db.prepare('DELETE FROM config WHERE chave = ?').run(chave);
    return result.changes > 0;
  }

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
