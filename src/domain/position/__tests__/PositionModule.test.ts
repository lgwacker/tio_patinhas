import Database from 'better-sqlite3';
import { DatabaseModule } from '@/data/DatabaseModule';
import { MigrationRunner } from '@/data/MigrationRunner';
import { PositionModule, PositionValidationError } from '../PositionModule';
import type { CreateOperationInput } from '@/types';

const testDbPath = ':memory:';

describe('PositionModule', () => {
  let db: Database.Database;
  let dbModule: DatabaseModule;
  let positionModule: PositionModule;

  beforeEach(() => {
    db = new Database(testDbPath);
    const migrations = new MigrationRunner(db);
    migrations.runMigrations();
    dbModule = new DatabaseModule(db);
    positionModule = new PositionModule(dbModule);
  });

  afterEach(() => {
    db.close();
  });

  describe('validateOperation', () => {
    it('should return no errors for valid operation', () => {
      const input: CreateOperationInput = {
        position_id: 1,
        tipo: 'compra',
        data: '2024-01-15',
        quantidade: 100,
        valor_total: 2500,
      };

      const errors = positionModule.validateOperation(input);

      expect(errors).toHaveLength(0);
    });

    it('should return error for invalid tipo', () => {
      const input = {
        position_id: 1,
        tipo: 'invalido' as 'compra',
        data: '2024-01-15',
        quantidade: 100,
        valor_total: 2500,
      };

      const errors = positionModule.validateOperation(input);

      expect(errors).toContainEqual({ field: 'tipo', message: 'Tipo deve ser compra ou venda' });
    });

    it('should return error for missing data', () => {
      const input = {
        position_id: 1,
        tipo: 'compra' as const,
        data: '',
        quantidade: 100,
        valor_total: 2500,
      };

      const errors = positionModule.validateOperation(input);

      expect(errors).toContainEqual({ field: 'data', message: 'Data é obrigatória' });
    });

    it('should return error for invalid data format', () => {
      const input = {
        position_id: 1,
        tipo: 'compra' as const,
        data: '15-01-2024',
        quantidade: 100,
        valor_total: 2500,
      };

      const errors = positionModule.validateOperation(input);

      expect(errors).toContainEqual({ field: 'data', message: 'Data deve estar no formato YYYY-MM-DD' });
    });

    it('should return error for zero quantity', () => {
      const input: CreateOperationInput = {
        position_id: 1,
        tipo: 'compra',
        data: '2024-01-15',
        quantidade: 0,
        valor_total: 2500,
      };

      const errors = positionModule.validateOperation(input);

      expect(errors).toContainEqual({ field: 'quantidade', message: 'Quantidade deve ser maior que zero' });
    });

    it('should return error for negative quantity', () => {
      const input: CreateOperationInput = {
        position_id: 1,
        tipo: 'compra',
        data: '2024-01-15',
        quantidade: -10,
        valor_total: 2500,
      };

      const errors = positionModule.validateOperation(input);

      expect(errors).toContainEqual({ field: 'quantidade', message: 'Quantidade deve ser maior que zero' });
    });

    it('should return error for non-integer quantity', () => {
      const input: CreateOperationInput = {
        position_id: 1,
        tipo: 'compra',
        data: '2024-01-15',
        quantidade: 100.5,
        valor_total: 2500,
      };

      const errors = positionModule.validateOperation(input);

      expect(errors).toContainEqual({ field: 'quantidade', message: 'Quantidade deve ser um número inteiro' });
    });

    it('should return error for zero valor_total', () => {
      const input: CreateOperationInput = {
        position_id: 1,
        tipo: 'compra',
        data: '2024-01-15',
        quantidade: 100,
        valor_total: 0,
      };

      const errors = positionModule.validateOperation(input);

      expect(errors).toContainEqual({ field: 'valor_total', message: 'Valor total deve ser maior que zero' });
    });
  });

  describe('createPositionWithFirstOperation', () => {
    it('should create position with first operation', async () => {
      const operation: CreateOperationInput = {
        position_id: 0, // Will be set by module
        tipo: 'compra',
        data: '2024-01-15',
        quantidade: 100,
        valor_total: 2500,
      };

      const result = await positionModule.createPositionWithFirstOperation(
        'PETR4',
        'Petrobras PN',
        'acao',
        operation
      );

      expect(result.position.ticker).toBe('PETR4');
      expect(result.position.nome).toBe('Petrobras PN');
      expect(result.position.classe_ativo).toBe('acao');
      expect(result.position.quantidade).toBe(100);
      expect(result.position.preco_medio).toBe(25.0);
      expect(result.operation.tipo).toBe('compra');
      expect(result.operation.preco_unitario).toBe(25.0);
    });

    it('should convert ticker to uppercase', async () => {
      const operation: CreateOperationInput = {
        position_id: 0,
        tipo: 'compra',
        data: '2024-01-15',
        quantidade: 100,
        valor_total: 2500,
      };

      const result = await positionModule.createPositionWithFirstOperation(
        'petr4',
        'Petrobras PN',
        'acao',
        operation
      );

      expect(result.position.ticker).toBe('PETR4');
    });

    it('should throw error for invalid ticker', async () => {
      const operation: CreateOperationInput = {
        position_id: 0,
        tipo: 'compra',
        data: '2024-01-15',
        quantidade: 100,
        valor_total: 2500,
      };

      await expect(
        positionModule.createPositionWithFirstOperation(
          '',
          'Petrobras PN',
          'acao',
          operation
        )
      ).rejects.toThrow(PositionValidationError);
    });

    it('should throw error for duplicate ticker', async () => {
      const operation: CreateOperationInput = {
        position_id: 0,
        tipo: 'compra',
        data: '2024-01-15',
        quantidade: 100,
        valor_total: 2500,
      };

      await positionModule.createPositionWithFirstOperation(
        'PETR4',
        'Petrobras PN',
        'acao',
        operation
      );

      // Try creating again with same ticker
      await expect(
        positionModule.createPositionWithFirstOperation(
          'PETR4',
          'Petrobras Outra',
          'acao',
          operation
        )
      ).rejects.toThrow(PositionValidationError);
    });

    it('should throw error for invalid asset class', async () => {
      const operation: CreateOperationInput = {
        position_id: 0,
        tipo: 'compra',
        data: '2024-01-15',
        quantidade: 100,
        valor_total: 2500,
      };

      await expect(
        positionModule.createPositionWithFirstOperation(
          'PETR4',
          'Petrobras PN',
          'invalido' as 'acao',
          operation
        )
      ).rejects.toThrow(PositionValidationError);
    });

    it('should include optional setor and segmento', async () => {
      const operation: CreateOperationInput = {
        position_id: 0,
        tipo: 'compra',
        data: '2024-01-15',
        quantidade: 100,
        valor_total: 2500,
      };

      const result = await positionModule.createPositionWithFirstOperation(
        'PETR4',
        'Petrobras PN',
        'acao',
        operation,
        'Energia',
        'Petróleo'
      );

      expect(result.position.setor).toBe('Energia');
      expect(result.position.segmento).toBe('Petróleo');
    });
  });

  describe('addOperationToPosition', () => {
    it('should add operation and update position values', async () => {
      // First create a position
      const operation1: CreateOperationInput = {
        position_id: 0,
        tipo: 'compra',
        data: '2024-01-15',
        quantidade: 100,
        valor_total: 2500,
      };

      const { position: initialPosition } = await positionModule.createPositionWithFirstOperation(
        'PETR4',
        'Petrobras PN',
        'acao',
        operation1
      );

      // Add another operation
      const operation2: CreateOperationInput = {
        position_id: initialPosition.id,
        tipo: 'compra',
        data: '2024-02-15',
        quantidade: 50,
        valor_total: 1500,
      };

      const result = await positionModule.addOperationToPosition(initialPosition.id, operation2);

      expect(result.position.quantidade).toBe(150); // 100 + 50
      expect(result.position.preco_medio).toBeCloseTo(26.67, 2); // (2500 + 1500) / 150
      expect(result.operation.tipo).toBe('compra');
    });

    it('should throw error for non-existent position', async () => {
      const operation: CreateOperationInput = {
        position_id: 9999,
        tipo: 'compra',
        data: '2024-01-15',
        quantidade: 100,
        valor_total: 2500,
      };

      await expect(
        positionModule.addOperationToPosition(9999, operation)
      ).rejects.toThrow(PositionValidationError);
    });

    it('should validate operation data', async () => {
      const operation1: CreateOperationInput = {
        position_id: 0,
        tipo: 'compra',
        data: '2024-01-15',
        quantidade: 100,
        valor_total: 2500,
      };

      const { position: initialPosition } = await positionModule.createPositionWithFirstOperation(
        'PETR4',
        'Petrobras PN',
        'acao',
        operation1
      );

      const invalidOperation: CreateOperationInput = {
        position_id: initialPosition.id,
        tipo: 'compra',
        data: 'invalid-date',
        quantidade: 0,
        valor_total: 0,
      };

      await expect(
        positionModule.addOperationToPosition(initialPosition.id, invalidOperation)
      ).rejects.toThrow(PositionValidationError);
    });
  });

  describe('getPositionWithOperations', () => {
    it('should return position with operations', async () => {
      const operation1: CreateOperationInput = {
        position_id: 0,
        tipo: 'compra',
        data: '2024-01-15',
        quantidade: 100,
        valor_total: 2500,
      };

      const { position } = await positionModule.createPositionWithFirstOperation(
        'PETR4',
        'Petrobras PN',
        'acao',
        operation1
      );

      const result = positionModule.getPositionWithOperations(position.id);

      expect(result).not.toBeNull();
      expect(result?.ticker).toBe('PETR4');
      expect(result?.operations).toHaveLength(1);
      expect(result?.operations[0].tipo).toBe('compra');
    });

    it('should return null for non-existent position', () => {
      const result = positionModule.getPositionWithOperations(9999);

      expect(result).toBeNull();
    });

    it('should return operations sorted by date descending', async () => {
      const operation1: CreateOperationInput = {
        position_id: 0,
        tipo: 'compra',
        data: '2024-01-15',
        quantidade: 100,
        valor_total: 2500,
      };

      const { position: initialPosition } = await positionModule.createPositionWithFirstOperation(
        'PETR4',
        'Petrobras PN',
        'acao',
        operation1
      );

      // Add more operations
      await positionModule.addOperationToPosition(initialPosition.id, {
        position_id: initialPosition.id,
        tipo: 'compra',
        data: '2024-03-15',
        quantidade: 50,
        valor_total: 1500,
      });

      await positionModule.addOperationToPosition(initialPosition.id, {
        position_id: initialPosition.id,
        tipo: 'venda',
        data: '2024-02-15',
        quantidade: 30,
        valor_total: 900,
      });

      const result = positionModule.getPositionWithOperations(initialPosition.id);

      expect(result?.operations).toHaveLength(3);
      expect(result?.operations[0].data).toBe('2024-03-15'); // Most recent first
      expect(result?.operations[1].data).toBe('2024-02-15');
      expect(result?.operations[2].data).toBe('2024-01-15');
    });
  });

  describe('getPositionWithCalculations', () => {
    it('should return position with calculated values', async () => {
      const operation1: CreateOperationInput = {
        position_id: 0,
        tipo: 'compra',
        data: '2024-01-15',
        quantidade: 100,
        valor_total: 2500,
      };

      const { position } = await positionModule.createPositionWithFirstOperation(
        'PETR4',
        'Petrobras PN',
        'acao',
        operation1
      );

      const precoAtual = 30.0;
      const result = positionModule.getPositionWithCalculations(position.id, precoAtual);

      expect(result).not.toBeNull();
      expect(result?.valorInvestido).toBe(2500); // 100 * 25
      expect(result?.valorAtual).toBe(3000); // 100 * 30
      expect(result?.ganhoValor).toBe(500);
      expect(result?.ganhoPercentual).toBe(20);
    });

    it('should return null for non-existent position', () => {
      const result = positionModule.getPositionWithCalculations(9999, 30.0);

      expect(result).toBeNull();
    });
  });
});
