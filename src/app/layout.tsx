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
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
