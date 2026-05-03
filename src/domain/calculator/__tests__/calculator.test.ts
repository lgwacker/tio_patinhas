/**
 * Tests for Domain/Calculator module
 * 
 * Functions tested:
 * - calculateAveragePrice(operations[])
 * - calculateGainLoss(position, currentPrice)
 * - calculatePositionValue(quantidade, preco_medio, preco_atual)
 */

import {
  calculateAveragePrice,
  calculateGainLoss,
  calculatePositionValue,
} from '../calculator';
import { Operacao, Posicao } from '../../types';

describe('calculateAveragePrice', () => {
  it('should calculate average price for single buy operation', () => {
    const operations: Operacao[] = [
      { data: new Date('2024-01-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 1000 },
    ];
    
    const result = calculateAveragePrice(operations);
    
    expect(result).toBe(10.0); // 1000 / 100 = 10.0
  });

  it('should calculate average price for multiple buy operations', () => {
    const operations: Operacao[] = [
      { data: new Date('2024-01-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 1000 },
      { data: new Date('2024-02-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 1200 },
    ];
    
    const result = calculateAveragePrice(operations);
    
    expect(result).toBe(11.0); // (1000 + 1200) / (100 + 100) = 2200 / 200 = 11.0
  });

  it('should calculate average price with partial sell', () => {
    // Buy 100 at 10, then sell 50, then buy 50 at 12
    const operations: Operacao[] = [
      { data: new Date('2024-01-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 1000 },
      { data: new Date('2024-02-01'), tipo: 'VENDA', quantidade: 50, valorTotal: 600 },
      { data: new Date('2024-03-01'), tipo: 'COMPRA', quantidade: 50, valorTotal: 650 },
    ];
    
    const result = calculateAveragePrice(operations);
    
    // After sell: 50 shares at avg 10 = 500 cost basis
    // After second buy: (500 + 650) / (50 + 50) = 1150 / 100 = 11.5
    expect(result).toBe(11.5);
  });

  it('should return 0 for empty operations array', () => {
    const result = calculateAveragePrice([]);
    expect(result).toBe(0);
  });

  it('should handle zero quantity gracefully', () => {
    const operations: Operacao[] = [
      { data: new Date('2024-01-01'), tipo: 'COMPRA', quantidade: 0, valorTotal: 0 },
    ];
    
    const result = calculateAveragePrice(operations);
    expect(result).toBe(0);
  });

  it('should handle only sell operations (return 0)', () => {
    const operations: Operacao[] = [
      { data: new Date('2024-01-01'), tipo: 'VENDA', quantidade: 100, valorTotal: 1000 },
    ];
    
    const result = calculateAveragePrice(operations);
    expect(result).toBe(0);
  });

  it('should ignore negative quantities and values', () => {
    const operations: Operacao[] = [
      { data: new Date('2024-01-01'), tipo: 'COMPRA', quantidade: -100, valorTotal: -1000 },
    ];
    
    const result = calculateAveragePrice(operations);
    expect(result).toBe(0);
  });

  it('should handle sell all and rebuy scenario', () => {
    const operations: Operacao[] = [
      { data: new Date('2024-01-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 1000 },
      { data: new Date('2024-02-01'), tipo: 'VENDA', quantidade: 100, valorTotal: 1200 },
      { data: new Date('2024-03-01'), tipo: 'COMPRA', quantidade: 100, valorTotal: 1500 },
    ];
    
    const result = calculateAveragePrice(operations);
    
    // After sell all, cost basis resets
    // New buy: 1500 / 100 = 15.0
    expect(result).toBe(15.0);
  });
});

describe('calculateGainLoss', () => {
  it('should calculate gain when current price is higher than average price', () => {
    const position: Posicao = {
      ticker: 'PETR4',
      quantidade: 100,
      precoMedio: 10.0,
    };
    const currentPrice = 15.0;
    
    const result = calculateGainLoss(position, currentPrice);
    
    expect(result.valor).toBe(500); // (15 - 10) * 100 = 500
    expect(result.percentual).toBe(50); // (15 - 10) / 10 * 100 = 50%
  });

  it('should calculate loss when current price is lower than average price', () => {
    const position: Posicao = {
      ticker: 'PETR4',
      quantidade: 100,
      precoMedio: 10.0,
    };
    const currentPrice = 8.0;
    
    const result = calculateGainLoss(position, currentPrice);
    
    expect(result.valor).toBe(-200); // (8 - 10) * 100 = -200
    expect(result.percentual).toBe(-20); // (8 - 10) / 10 * 100 = -20%
  });

  it('should return zero gain/loss when prices are equal', () => {
    const position: Posicao = {
      ticker: 'PETR4',
      quantidade: 100,
      precoMedio: 10.0,
    };
    const currentPrice = 10.0;
    
    const result = calculateGainLoss(position, currentPrice);
    
    expect(result.valor).toBe(0);
    expect(result.percentual).toBe(0);
  });

  it('should return zero for zero quantity position', () => {
    const position: Posicao = {
      ticker: 'PETR4',
      quantidade: 0,
      precoMedio: 10.0,
    };
    const currentPrice = 15.0;
    
    const result = calculateGainLoss(position, currentPrice);
    
    expect(result.valor).toBe(0);
    expect(result.percentual).toBe(0);
  });

  it('should return zero for zero average price', () => {
    const position: Posicao = {
      ticker: 'PETR4',
      quantidade: 100,
      precoMedio: 0,
    };
    const currentPrice = 15.0;
    
    const result = calculateGainLoss(position, currentPrice);
    
    expect(result.valor).toBe(0);
    expect(result.percentual).toBe(0);
  });

  it('should handle zero current price', () => {
    const position: Posicao = {
      ticker: 'PETR4',
      quantidade: 100,
      precoMedio: 10.0,
    };
    const currentPrice = 0;
    
    const result = calculateGainLoss(position, currentPrice);
    
    expect(result.valor).toBe(-1000); // (0 - 10) * 100 = -1000
    expect(result.percentual).toBe(-100); // (0 - 10) / 10 * 100 = -100%
  });

  it('should handle fractional percentual calculation correctly', () => {
    const position: Posicao = {
      ticker: 'PETR4',
      quantidade: 100,
      precoMedio: 33.33,
    };
    const currentPrice = 35.0;
    
    const result = calculateGainLoss(position, currentPrice);
    
    expect(result.valor).toBeCloseTo(167, 0); // (35 - 33.33) * 100 = 167
    expect(result.percentual).toBeCloseTo(5.01, 2); // (35 - 33.33) / 33.33 * 100 = 5.01%
  });
});

describe('calculatePositionValue', () => {
  it('should calculate position value correctly', () => {
    const quantidade = 100;
    const precoMedio = 10.0;
    const precoAtual = 15.0;
    
    const result = calculatePositionValue(quantidade, precoMedio, precoAtual);
    
    expect(result.valorInvestido).toBe(1000); // 100 * 10
    expect(result.valorAtual).toBe(1500); // 100 * 15
    expect(result.ganhoPerda.valor).toBe(500); // 1500 - 1000
    expect(result.ganhoPerda.percentual).toBe(50); // (500 / 1000) * 100
  });

  it('should calculate loss scenario correctly', () => {
    const quantidade = 100;
    const precoMedio = 10.0;
    const precoAtual = 8.0;
    
    const result = calculatePositionValue(quantidade, precoMedio, precoAtual);
    
    expect(result.valorInvestido).toBe(1000);
    expect(result.valorAtual).toBe(800);
    expect(result.ganhoPerda.valor).toBe(-200);
    expect(result.ganhoPerda.percentual).toBe(-20);
  });

  it('should return zeros for zero quantity', () => {
    const quantidade = 0;
    const precoMedio = 10.0;
    const precoAtual = 15.0;
    
    const result = calculatePositionValue(quantidade, precoMedio, precoAtual);
    
    expect(result.valorInvestido).toBe(0);
    expect(result.valorAtual).toBe(0);
    expect(result.ganhoPerda.valor).toBe(0);
    expect(result.ganhoPerda.percentual).toBe(0);
  });

  it('should handle zero average price', () => {
    const quantidade = 100;
    const precoMedio = 0;
    const precoAtual = 15.0;
    
    const result = calculatePositionValue(quantidade, precoMedio, precoAtual);
    
    expect(result.valorInvestido).toBe(0);
    expect(result.valorAtual).toBe(1500);
    expect(result.ganhoPerda.valor).toBe(0); // 0 because precoMedio is 0 (invalid state)
    expect(result.ganhoPerda.percentual).toBe(0);
  });

  it('should handle zero current price', () => {
    const quantidade = 100;
    const precoMedio = 10.0;
    const precoAtual = 0;
    
    const result = calculatePositionValue(quantidade, precoMedio, precoAtual);
    
    expect(result.valorInvestido).toBe(1000);
    expect(result.valorAtual).toBe(0);
    expect(result.ganhoPerda.valor).toBe(-1000);
    expect(result.ganhoPerda.percentual).toBe(-100);
  });

  it('should handle negative quantities by returning zeros', () => {
    const quantidade = -100;
    const precoMedio = 10.0;
    const precoAtual = 15.0;
    
    const result = calculatePositionValue(quantidade, precoMedio, precoAtual);
    
    expect(result.valorInvestido).toBe(0);
    expect(result.valorAtual).toBe(0);
    expect(result.ganhoPerda.valor).toBe(0);
    expect(result.ganhoPerda.percentual).toBe(0);
  });

  it('should handle negative prices by returning zeros', () => {
    const quantidade = 100;
    const precoMedio = -10.0;
    const precoAtual = 15.0;
    
    const result = calculatePositionValue(quantidade, precoMedio, precoAtual);
    
    expect(result.valorInvestido).toBe(0);
    expect(result.valorAtual).toBe(0);
    expect(result.ganhoPerda.valor).toBe(0);
    expect(result.ganhoPerda.percentual).toBe(0);
  });
});
