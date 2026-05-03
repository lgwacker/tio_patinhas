import { Layout } from '@/components/ui/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <Button>Adicionar Operação</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-text-secondary font-normal">
                Valor Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">
                R$ 0,00
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Sua carteira está vazia
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-text-secondary font-normal">
                Total Investido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">
                R$ 0,00
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-text-secondary font-normal">
                Lucro/Prejuízo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-profit">
                R$ 0,00
              </div>
              <p className="text-xs text-profit mt-1">
                +0.00%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-text-secondary font-normal">
                Posições
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">
                0
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Nenhuma posição
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao Tio Patinhas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-text-secondary">
              Seu sistema pessoal de gestão de investimentos. 
              Comece adicionando suas operações para acompanhar sua carteira.
            </p>
            <div className="flex gap-3">
              <Button>Adicionar primeira operação</Button>
              <Button variant="secondary">Ver Carteira</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
