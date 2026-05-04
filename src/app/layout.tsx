import './globals.css';
import { Layout } from '@/components/ui/Layout';

export const metadata = {
  title: 'Tio Patinhas - Gestão de Investimentos',
  description: 'Sistema pessoal de gestão de investimentos e finanças',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
