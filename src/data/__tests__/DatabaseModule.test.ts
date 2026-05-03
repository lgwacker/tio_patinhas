import Database from 'better-sqlite3';
import { DatabaseModule } from '../DatabaseModule';
import { MigrationRunner } from '../MigrationRunner';
import type { CreatePositionInput, CreateOperationInput, AssetClass, OperationType } from '@/types';

// Use in-memory database for tests
const testDbPath = ':memory:';

describe('DatabaseModule', () => {
  let db: Database.Database;
  let module: DatabaseModule;

  beforeEach(() => {
    db = new Database(testDbPath);
    const migrations = new MigrationRunner(db);
    migrations.runMigrations();
    module = new DatabaseModule(db);
  });

  afterEach(() => {
    db.close();
  });

  describe('Positions', () => {
    describe('createPosition', () => {
      it('should create a position with valid data', () => {
        const input: CreatePositionInput = {
          ticker: 'PETR4',
          nome: 'Petrobras PN',
          classe_ativo: 'acao' as AssetClass,
          setor: 'Energia',
          segmento: 'Petróleo',
          quantidade: 100,
          preco_medio: 25.5,
        };

        const position = module.createPosition(input);

        expect(position.id).toBeDefined();
        expect(position.ticker).toBe('PETR4');
        expect(position.nome).toBe('Petrobras PN');
        expect(position.classe_ativo).toBe('acao');
        expect(position.quantidade).toBe(100);
        expect(position.preco_medio).toBe(25.5);
        expect(position.data_criacao).toBeDefined();
        expect(position.updated_at).toBeDefined();
      });

      it('should create a position without optional fields', () => {
        const input: CreatePositionInput = {
          ticker: 'VALE3',
          nome: 'Vale SA',
          classe_ativo: 'acao' as AssetClass,
          quantidade: 50,
          preco_medio: 65.0,
        };

        const position = module.createPosition(input);

        expect(position.ticker).toBe('VALE3');
        expect(position.setor).toBeNull();
        expect(position.segmento).toBeNull();
      });
    });

    describe('getPositionById', () => {
      it('should return a position by id', () => {
        const created = module.createPosition({
          ticker: 'ITUB4',
          nome: 'Itaú Unibanco',
          classe_ativo: 'acao',
          quantidade: 200,
          preco_medio: 30.0,
        });

        const found = module.getPositionById(created.id);

        expect(found).not.toBeNull();
        expect(found?.id).toBe(created.id);
        expect(found?.ticker).toBe('ITUB4');
      });

      it('should return null for non-existent id', () => {
        const found = module.getPositionById(9999);
        expect(found).toBeNull();
      });
    });

    describe('getPositionByTicker', () => {
      it('should return a position by ticker', () => {
        module.createPosition({
          ticker: 'BBDC4',
          nome: 'Bradesco',
          classe_ativo: 'acao',
          quantidade: 150,
          preco_medio: 15.0,
        });

        const found = module.getPositionByTicker('BBDC4');

        expect(found).not.toBeNull();
        expect(found?.ticker).toBe('BBDC4');
      });

      it('should return null for non-existent ticker', () => {
        const found = module.getPositionByTicker('XXXX99');
        expect(found).toBeNull();
      });
    });

    describe('getAllPositions', () => {
      it('should return all positions', () => {
        module.createPosition({
          ticker: 'PETR4',
          nome: 'Petrobras',
          classe_ativo: 'acao',
          quantidade: 100,
          preco_medio: 25.0,
        });
        module.createPosition({
          ticker: 'VALE3',
          nome: 'Vale',
          classe_ativo: 'acao',
          quantidade: 50,
          preco_medio: 65.0,
        });

        const positions = module.getAllPositions();

        expect(positions).toHaveLength(2);
      });

      it('should return empty array when no positions', () => {
        const positions = module.getAllPositions();
        expect(positions).toEqual([]);
      });
    });

    describe('getPositionsByAssetClass', () => {
      it('should return positions filtered by asset class', () => {
        module.createPosition({
          ticker: 'PETR4',
          nome: 'Petrobras',
          classe_ativo: 'acao',
          quantidade: 100,
          preco_medio: 25.0,
        });
        module.createPosition({
          ticker: 'HGLG11',
          nome: 'CSHG Logística',
          classe_ativo: 'fii',
          quantidade: 10,
          preco_medio: 150.0,
        });

        const acoes = module.getPositionsByAssetClass('acao');
        const fiis = module.getPositionsByAssetClass('fii');

        expect(acoes).toHaveLength(1);
        expect(acoes[0].ticker).toBe('PETR4');
        expect(fiis).toHaveLength(1);
        expect(fiis[0].ticker).toBe('HGLG11');
      });
    });

    describe('updatePosition', () => {
      it('should update position fields', () => {
        const created = module.createPosition({
          ticker: 'WEGE3',
          nome: 'WEG',
          classe_ativo: 'acao',
          quantidade: 100,
          preco_medio: 30.0,
        });

        const updated = module.updatePosition(created.id, {
          quantidade: 150,
          preco_medio: 32.0,
        });

        expect(updated).not.toBeNull();
        expect(updated?.quantidade).toBe(150);
        expect(updated?.preco_medio).toBe(32.0);
        expect(updated?.ticker).toBe('WEGE3'); // unchanged
      });

      it('should return null for non-existent id', () => {
        const updated = module.updatePosition(9999, { quantidade: 100 });
        expect(updated).toBeNull();
      });
    });

    describe('deletePosition', () => {
      it('should delete a position', () => {
        const created = module.createPosition({
          ticker: 'MGLU3',
          nome: 'Magazine Luiza',
          classe_ativo: 'acao',
          quantidade: 100,
          preco_medio: 5.0,
        });

        const deleted = module.deletePosition(created.id);

        expect(deleted).toBe(true);
        expect(module.getPositionById(created.id)).toBeNull();
      });

      it('should return false for non-existent id', () => {
        const deleted = module.deletePosition(9999);
        expect(deleted).toBe(false);
      });

      it('should cascade delete related operations', () => {
        const position = module.createPosition({
          ticker: 'BBAS3',
          nome: 'Banco do Brasil',
          classe_ativo: 'acao',
          quantidade: 100,
          preco_medio: 40.0,
        });

        module.createOperation({
          position_id: position.id,
          tipo: 'compra',
          data: '2024-01-15',
          quantidade: 100,
          valor_total: 4000,
        });

        module.deletePosition(position.id);

        const operations = module.getOperationsByPositionId(position.id);
        expect(operations).toHaveLength(0);
      });
    });
  });

  describe('Operations', () => {
    let positionId: number;

    beforeEach(() => {
      const position = module.createPosition({
        ticker: 'PETR4',
        nome: 'Petrobras',
        classe_ativo: 'acao',
        quantidade: 100,
        preco_medio: 25.0,
      });
      positionId = position.id;
    });

    describe('createOperation', () => {
      it('should create a compra operation', () => {
        const input: CreateOperationInput = {
          position_id: positionId,
          tipo: 'compra' as OperationType,
          data: '2024-01-15',
          quantidade: 100,
          valor_total: 2500,
        };

        const operation = module.createOperation(input);

        expect(operation.id).toBeDefined();
        expect(operation.position_id).toBe(positionId);
        expect(operation.tipo).toBe('compra');
        expect(operation.data).toBe('2024-01-15');
        expect(operation.quantidade).toBe(100);
        expect(operation.valor_total).toBe(2500);
        expect(operation.preco_unitario).toBe(25.0); // valor_total / quantidade
      });

      it('should create a venda operation', () => {
        const input: CreateOperationInput = {
          position_id: positionId,
          tipo: 'venda' as OperationType,
          data: '2024-02-20',
          quantidade: 50,
          valor_total: 1500,
        };

        const operation = module.createOperation(input);

        expect(operation.tipo).toBe('venda');
        expect(operation.preco_unitario).toBe(30.0); // 1500 / 50
      });
    });

    describe('getOperationById', () => {
      it('should return an operation by id', () => {
        const created = module.createOperation({
          position_id: positionId,
          tipo: 'compra',
          data: '2024-01-15',
          quantidade: 100,
          valor_total: 2500,
        });

        const found = module.getOperationById(created.id);

        expect(found).not.toBeNull();
        expect(found?.id).toBe(created.id);
      });

      it('should return null for non-existent id', () => {
        const found = module.getOperationById(9999);
        expect(found).toBeNull();
      });
    });

    describe('getOperationsByPositionId', () => {
      it('should return operations for a position', () => {
        module.createOperation({
          position_id: positionId,
          tipo: 'compra',
          data: '2024-01-15',
          quantidade: 100,
          valor_total: 2500,
        });
        module.createOperation({
          position_id: positionId,
          tipo: 'compra',
          data: '2024-02-15',
          quantidade: 50,
          valor_total: 1200,
        });

        const operations = module.getOperationsByPositionId(positionId);

        expect(operations).toHaveLength(2);
      });

      it('should return empty array when no operations', () => {
        const operations = module.getOperationsByPositionId(positionId);
        expect(operations).toEqual([]);
      });

      it('should return operations sorted by date descending', () => {
        module.createOperation({
          position_id: positionId,
          tipo: 'compra',
          data: '2024-01-15',
          quantidade: 100,
          valor_total: 2500,
        });
        module.createOperation({
          position_id: positionId,
          tipo: 'compra',
          data: '2024-03-15',
          quantidade: 50,
          valor_total: 1200,
        });
        module.createOperation({
          position_id: positionId,
          tipo: 'compra',
          data: '2024-02-15',
          quantidade: 30,
          valor_total: 900,
        });

        const operations = module.getOperationsByPositionId(positionId);

        expect(operations[0].data).toBe('2024-03-15');
        expect(operations[1].data).toBe('2024-02-15');
        expect(operations[2].data).toBe('2024-01-15');
      });
    });

    describe('getAllOperations', () => {
      it('should return all operations across positions', () => {
        const position2 = module.createPosition({
          ticker: 'VALE3',
          nome: 'Vale',
          classe_ativo: 'acao',
          quantidade: 50,
          preco_medio: 65.0,
        });

        module.createOperation({
          position_id: positionId,
          tipo: 'compra',
          data: '2024-01-15',
          quantidade: 100,
          valor_total: 2500,
        });
        module.createOperation({
          position_id: position2.id,
          tipo: 'compra',
          data: '2024-02-15',
          quantidade: 50,
          valor_total: 3250,
        });

        const operations = module.getAllOperations();

        expect(operations).toHaveLength(2);
      });
    });

    describe('deleteOperation', () => {
      it('should delete an operation', () => {
        const created = module.createOperation({
          position_id: positionId,
          tipo: 'compra',
          data: '2024-01-15',
          quantidade: 100,
          valor_total: 2500,
        });

        const deleted = module.deleteOperation(created.id);

        expect(deleted).toBe(true);
        expect(module.getOperationById(created.id)).toBeNull();
      });

      it('should return false for non-existent id', () => {
        const deleted = module.deleteOperation(9999);
        expect(deleted).toBe(false);
      });
    });
  });

  describe('Config', () => {
    describe('getConfig', () => {
      it('should return config value by key', () => {
        db.prepare("INSERT INTO config (chave, valor) VALUES (?, ?)").run('theme', 'dark');

        const value = module.getConfig('theme');

        expect(value).toBe('dark');
      });

      it('should return null for non-existent key', () => {
        const value = module.getConfig('nonexistent');
        expect(value).toBeNull();
      });
    });

    describe('setConfig', () => {
      it('should set a new config value', () => {
        module.setConfig('currency', 'BRL');

        const value = module.getConfig('currency');
        expect(value).toBe('BRL');
      });

      it('should update existing config value', () => {
        module.setConfig('theme', 'light');
        module.setConfig('theme', 'dark');

        const value = module.getConfig('theme');
        expect(value).toBe('dark');
      });
    });

    describe('deleteConfig', () => {
      it('should delete a config value', () => {
        module.setConfig('key1', 'value1');

        const deleted = module.deleteConfig('key1');

        expect(deleted).toBe(true);
        expect(module.getConfig('key1')).toBeNull();
      });

      it('should return false for non-existent key', () => {
        const deleted = module.deleteConfig('nonexistent');
        expect(deleted).toBe(false);
      });
    });
  });
});
