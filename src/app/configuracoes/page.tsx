import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Configurações</h1>
        <p className="text-text-secondary">Preferências do sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary">
            Configurações do sistema serão implementadas em versões futuras.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
