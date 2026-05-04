'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Plus, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency, calcularPrecoUnitario } from '@/lib/formatters';
import { ASSET_CLASSES } from '@/lib/constants';

export default function NovaPosicaoPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    ticker: '',
    nome: '',
    classe_ativo: 'acao' as 'acao' | 'fii' | 'renda_fixa' | 'etf' | 'cripto',
    setor: '',
    segmento: '',
    tipo: 'compra' as 'compra' | 'venda',
    data: new Date().toISOString().split('T')[0],
    quantidade: '',
    valor_total: '',
  });

  const precoUnitario = calcularPrecoUnitario(formData.quantidade, formData.valor_total);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: formData.ticker,
          nome: formData.nome,
          classe_ativo: formData.classe_ativo,
          setor: formData.setor || undefined,
          segmento: formData.segmento || undefined,
          operation: {
            position_id: 0, // Will be set by server
            tipo: formData.tipo,
            data: formData.data,
            quantidade: parseInt(formData.quantidade, 10),
            valor_total: parseFloat(formData.valor_total),
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.details) {
          setErrors(data.details.map((e: { message: string }) => e.message));
        } else {
          setErrors([data.error || 'Erro ao criar posição']);
        }
        return;
      }

      const result = await response.json();
      
      // Navigate to the new position detail page
      router.push(`/posicao/${result.position.id}`);
    } catch (error) {
      setErrors(['Erro ao criar posição']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/carteira">
          <Button variant="ghost" size="sm" aria-label="Voltar para carteira">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Nova Posição</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Ativo</CardTitle>
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
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Asset Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ticker" className="block text-sm font-medium text-text-secondary mb-2">
                  Ticker
                </label>
                <input
                  id="ticker"
                  name="ticker"
                  type="text"
                  value={formData.ticker}
                  onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="PETR4"
                  required
                  maxLength={6}
                />
                <p className="text-xs text-text-secondary mt-1">Ex: PETR4, VALE3, HGLG11</p>
              </div>
              <div>
                <label htmlFor="classe_ativo" className="block text-sm font-medium text-text-secondary mb-2">
                  Classe de Ativo
                </label>
                <select
                  id="classe_ativo"
                  name="classe_ativo"
                  value={formData.classe_ativo}
                  onChange={(e) => setFormData({ ...formData, classe_ativo: e.target.value as typeof formData.classe_ativo })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {ASSET_CLASSES.map((cls) => (
                    <option key={cls.value} value={cls.value}>{cls.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-text-secondary mb-2">
                Nome do Ativo
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Petrobras PN"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="setor" className="block text-sm font-medium text-text-secondary mb-2">
                  Setor (opcional)
                </label>
                <input
                  id="setor"
                  name="setor"
                  type="text"
                  value={formData.setor}
                  onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Energia"
                />
              </div>
              <div>
                <label htmlFor="segmento" className="block text-sm font-medium text-text-secondary mb-2">
                  Segmento (opcional)
                </label>
                <input
                  id="segmento"
                  name="segmento"
                  type="text"
                  value={formData.segmento}
                  onChange={(e) => setFormData({ ...formData, segmento: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Petróleo"
                />
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                <TrendingUp size={20} className="inline mr-2" />
                Primeira Operação
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-text-secondary mb-2">
                    Tipo
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'compra' | 'venda' })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="compra">Compra</option>
                    <option value="venda">Venda</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="data" className="block text-sm font-medium text-text-secondary mb-2">
                    <Calendar size={16} className="inline mr-2" />
                    Data
                  </label>
                  <input
                    id="data"
                    name="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label htmlFor="quantidade" className="block text-sm font-medium text-text-secondary mb-2">
                    Quantidade
                  </label>
                  <input
                    id="quantidade"
                    name="quantidade"
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
                  <label htmlFor="valor_total" className="block text-sm font-medium text-text-secondary mb-2">
                    <DollarSign size={16} className="inline mr-2" />
                    Valor Total (R$)
                  </label>
                  <input
                    id="valor_total"
                    name="valor_total"
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
                  <p className="text-xs text-text-secondary mt-1">
                    {formData.quantidade && formData.valor_total
                      ? `${precoUnitario} por unidade`
                      : 'Preencha quantidade e valor'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Criando...' : (
                  <>
                    <Plus size={20} className="mr-2" />
                    Criar Posição
                  </>
                )}
              </Button>
              <Link href="/carteira">
                <Button type="button" variant="secondary">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
