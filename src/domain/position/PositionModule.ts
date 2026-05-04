import { Operacao, TipoOperacao } from '../types';
import { CarteiraCalculator } from '../calculator/CarteiraCalculator';
import { DatabaseModule } from '@/data/DatabaseModule';
import { VALID_ASSET_CLASSES } from '@/lib/constants';
import type { CreateOperationInput, Operation, Position, CreatePositionInput } from '@/types';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TICKER_REGEX = /^[A-Z0-9]{4,6}$/;

function toDomainTipo(tipo: string): TipoOperacao {
  return tipo.toUpperCase() as TipoOperacao;
}

function isValidTipo(tipo: string): boolean {
  return tipo === 'compra' || tipo === 'venda';
}

function toDomainOperation(op: Operation): Operacao {
  return {
    data: new Date(op.data),
    tipo: toDomainTipo(op.tipo),
    quantidade: op.quantidade,
    valorTotal: op.valor_total,
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PositionWithOperations extends Position {
  operations: Operation[];
}

export class PositionModule {
  constructor(private db: DatabaseModule) {}

  validateOperation(input: CreateOperationInput): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!input.tipo || !isValidTipo(input.tipo)) {
      errors.push({ field: 'tipo', message: 'Tipo deve ser compra ou venda' });
    }

    if (!input.data) {
      errors.push({ field: 'data', message: 'Data é obrigatória' });
    } else if (!DATE_REGEX.test(input.data)) {
      errors.push({ field: 'data', message: 'Data deve estar no formato YYYY-MM-DD' });
    }

    if (input.quantidade <= 0) {
      errors.push({ field: 'quantidade', message: 'Quantidade deve ser maior que zero' });
    }

    if (input.valor_total <= 0) {
      errors.push({ field: 'valor_total', message: 'Valor total deve ser maior que zero' });
    }

    if (!Number.isInteger(input.quantidade)) {
      errors.push({ field: 'quantidade', message: 'Quantidade deve ser um número inteiro' });
    }

    return errors;
  }

  validatePositionFromOperation(
    ticker: string,
    nome: string,
    classe_ativo: string,
    operation: CreateOperationInput
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!ticker || ticker.trim().length === 0) {
      errors.push({ field: 'ticker', message: 'Ticker é obrigatório' });
    } else if (!TICKER_REGEX.test(ticker.toUpperCase())) {
      errors.push({ field: 'ticker', message: 'Ticker deve conter 4-6 letras maiúsculas ou números' });
    }

    if (!nome || nome.trim().length === 0) {
      errors.push({ field: 'nome', message: 'Nome é obrigatório' });
    }

    if (!classe_ativo || !VALID_ASSET_CLASSES.includes(classe_ativo as typeof VALID_ASSET_CLASSES[number])) {
      errors.push({ field: 'classe_ativo', message: 'Classe de ativo inválida' });
    }

    const operationErrors = this.validateOperation(operation);
    errors.push(...operationErrors);

    return errors;
  }

  async createPositionWithFirstOperation(
    ticker: string,
    nome: string,
    classe_ativo: 'acao' | 'fii' | 'renda_fixa' | 'etf' | 'cripto',
    operation: CreateOperationInput,
    setor?: string | null,
    segmento?: string | null
  ): Promise<{ position: Position; operation: Operation }> {
    const errors = this.validatePositionFromOperation(ticker, nome, classe_ativo, operation);
    if (errors.length > 0) {
      throw new PositionValidationError(errors);
    }

    // Check if position already exists
    const existingPosition = this.db.getPositionByTicker(ticker.toUpperCase());
    if (existingPosition) {
      throw new PositionValidationError([
        { field: 'ticker', message: 'Posição já existe para este ticker' }
      ]);
    }

    // Calculate initial average price from operation
    const preco_unitario = operation.valor_total / operation.quantidade;

    // Create position with initial values from operation
    const positionInput: CreatePositionInput = {
      ticker: ticker.toUpperCase(),
      nome,
      classe_ativo,
      setor: setor ?? null,
      segmento: segmento ?? null,
      quantidade: operation.quantidade,
      preco_medio: preco_unitario,
    };

    const position = this.db.createPosition(positionInput);

    // Create operation linked to position
    const operationInput: CreateOperationInput = {
      position_id: position.id,
      tipo: operation.tipo,
      data: operation.data,
      quantidade: operation.quantidade,
      valor_total: operation.valor_total,
    };

    const createdOperation = this.db.createOperation(operationInput);

    return { position, operation: createdOperation };
  }

  async addOperationToPosition(
    positionId: number,
    operation: CreateOperationInput
  ): Promise<{ position: Position; operation: Operation }> {
    const errors = this.validateOperation(operation);
    if (errors.length > 0) {
      throw new PositionValidationError(errors);
    }

    const position = this.db.getPositionById(positionId);
    if (!position) {
      throw new PositionValidationError([
        { field: 'position_id', message: 'Posição não encontrada' }
      ]);
    }

    // Get all operations to recalculate position
    const operations = this.db.getOperationsByPositionId(positionId);

    // Create the new operation first
    const operationInput: CreateOperationInput = {
      position_id: positionId,
      tipo: operation.tipo,
      data: operation.data,
      quantidade: operation.quantidade,
      valor_total: operation.valor_total,
    };
    const createdOperation = this.db.createOperation(operationInput);

    // Convert to domain types for calculator
    const domainOperations: Operacao[] = [
      ...operations,
      createdOperation,
    ].map(toDomainOperation);

    // Use CarteiraCalculator for all position calculations
    const snapshot = CarteiraCalculator.calculateSnapshot(domainOperations);

    // Update position
    const updatedPosition = this.db.updatePosition(positionId, {
      quantidade: snapshot.quantidade,
      preco_medio: snapshot.precoMedio,
    });

    if (!updatedPosition) {
      throw new PositionValidationError([
        { field: 'position', message: 'Falha ao atualizar posição' }
      ]);
    }

    return { position: updatedPosition, operation: createdOperation };
  }

  getAllPositions(): Position[] {
    return this.db.getAllPositions();
  }

  getPositionById(positionId: number): Position | null {
    return this.db.getPositionById(positionId);
  }

  getPositionWithOperations(positionId: number): PositionWithOperations | null {
    const position = this.getPositionById(positionId);
    if (!position) return null;

    const operations = this.db.getOperationsByPositionId(positionId);
    return { ...position, operations };
  }

  getPositionWithCalculations(positionId: number, precoAtual: number): PositionWithOperations & {
    valorInvestido: number;
    valorAtual: number;
    ganhoValor: number;
    ganhoPercentual: number;
    precoAtual: number;
    precoAtualDisponivel: boolean;
  } | null {
    const positionWithOps = this.getPositionWithOperations(positionId);
    if (!positionWithOps) return null;

    // Convert operations to domain types for CarteiraCalculator
    const domainOperations: Operacao[] = positionWithOps.operations.map(toDomainOperation);

    // Use CarteiraCalculator for all position calculations
    const snapshot = CarteiraCalculator.calculateSnapshot(domainOperations, precoAtual);

    return {
      ...positionWithOps,
      valorInvestido: snapshot.valorInvestido,
      valorAtual: snapshot.valorAtual,
      ganhoValor: snapshot.ganhoPerda.valor,
      ganhoPercentual: snapshot.ganhoPerda.percentual,
      precoAtual,
      precoAtualDisponivel: snapshot.precoAtualDisponivel,
    };
  }
}

export class PositionValidationError extends Error {
  constructor(public errors: ValidationError[]) {
    super('Erro de validação na posição/operacão');
    this.name = 'PositionValidationError';
  }
}
