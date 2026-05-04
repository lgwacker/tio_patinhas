'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, TrendingUp, TrendingDown, Plus, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate, calcularPrecoUnitario } from '@/lib/formatters';
import { getOperationTypeBadgeClasses, getProfitLossColorClasses } from '@/lib/ui-helpers';
import type { Position, Operation } from '@/types';

interface PositionDetailClientProps {
  position: Position & {
    valorInvestido: number;
    valorAtual: number;
    ganhoValor: number;
    ganhoPercentual: number;
    precoAtual: number;
  };
  operations: Operation[];
}

export function PositionDetailClient({ position, operations: initialOperations }: PositionDetailClientProps) {
  const [operations, setOperations] = useState<Operation[]>(initialOperations);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'compra' as 'compra' | 'venda',
    data: new Date().toISOString().split('T')[0],
    quantidade: '',
    valor_total: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const precoUnitario = calcularPrecoUnitario(formData.quantidade, formData.valor_total);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position_id: position.id,
          tipo: formData.tipo,
          data: formData.data,
          quantidade: parseInt(formData.quantidade, 10),
          valor_total: parseFloat(formData.valor_total),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.details) {
          setErrors(data.details.map((e: { message: string }) => e.message));
        } else {
          setErrors([data.error || 'Erro ao adicionar operação']);
        }
        return;
      }

      const result = await response.json();
      
      // Add new operation to list
      setOperations(prev => [result.operation, ...prev]);
      
      // Reset form
      setFormData({
        tipo: 'compra',
        data: new Date().toISOString().split('T')[0],
        quantidade: '',
        valor_total: '',
      });
      setShowForm(false);
      
      // Reload page to get updated position calculations
      window.location.reload();
    } catch (error) {
      setErrors(['Erro ao adicionar operação']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProfit = position.ganhoValor >= 0;
  const profitLossClasses = getProfitLossColorClasses(isProfit);
  const ganhoSign = isProfit ? '+' : '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/carteira">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{position.ticker}</h1>
            <p className="text-text-secondary">{position.nome}</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="mr-2" />
          Operação
        </Button>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-text-secondary mb-1">Quantidade</p>
              <p className="text-2xl font-bold text-text-primary">{position.quantidade}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary mb-1">Preço Médio</p>
              <p className="text-2xl font-bold text-text-primary">
                {formatCurrency(position.preco_medio)}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary mb-1">Valor Investido</p>
              <p className="text-2xl font-bold text-text-primary">
                {formatCurrency(position.valorInvestido)}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary mb-1">Ganho/Perda</p>
              <div className={`flex items-center gap-2 ${profitLossClasses}`}>
                {isProfit ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                <span className="text-2xl font-bold">
                  {formatCurrency(position.ganhoValor)}
                </span>
              </div>
              <p className={`text-sm ${profitLossClasses}`}>
                {ganhoSign}{position.ganhoPercentual.toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operation Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Operação</CardTitle>
          </CardHeader>
          <CardContent>
            {errors.length > 0 && (
              <div className="mb-4 p-4 bg-red-900/30 border border-red-500 rounded-md">
                <ul className="list-disc list-inside text-red-400 text-sm">
                  {errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Tipo
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'compra' | 'venda' })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="compra">Compra</option>
                    <option value="venda">Venda</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    <Calendar size={16} className="inline mr-2" />
                    Data
                  </label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    <DollarSign size={16} className="inline mr-2" />
                    Valor Total (R$)
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.valor_total}
                    onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="2500.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Preço Unitário (Preview)
                  </label>
                  <div className="px-3 py-2 bg-surface border border-border rounded-md text-text-primary">
                    {formatCurrency(parseFloat(precoUnitario) || 0)}
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Operations History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Operações</CardTitle>
        </CardHeader>
        <CardContent>
          {operations.length === 0 ? (
            <p className="text-text-secondary text-center py-8">
              Nenhuma operação registrada
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Data</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Tipo</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Quantidade</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Preço Unitário</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {operations.map((op) => (
                    <tr key={op.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 text-text-primary">{formatDate(op.data)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getOperationTypeBadgeClasses(op.tipo)}`}>
                          {op.tipo === 'compra' ? 'Compra' : 'Venda'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text-primary text-right">{op.quantidade}</td>
                      <td className="py-3 px-4 text-text-primary text-right">
                        {formatCurrency(op.preco_unitario)}
                      </td>
                      <td className="py-3 px-4 text-text-primary text-right">
                        {formatCurrency(op.valor_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
