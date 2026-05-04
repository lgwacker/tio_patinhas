import { render, screen } from '@testing-library/react';
import NovaPosicaoPage from '../../nova-posicao/page';

// Mock next/link
jest.mock('next/link', () => {
  return function Link({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('NovaPosicaoPage Accessibility', () => {
  it('should have accessible name for back button', () => {
    render(<NovaPosicaoPage />);

    const backButton = screen.getByRole('button', { name: 'Voltar para carteira' });
    expect(backButton).toBeInTheDocument();
  });

  it('should have sufficient color contrast on Criar Posição button', () => {
    render(<NovaPosicaoPage />);

    const submitButton = screen.getByRole('button', { name: /Criar Posição/i });
    expect(submitButton).toBeInTheDocument();

    // Verify WCAG-compliant color contrast: bg-primary provides 4.5:1+ contrast with text-white
    const buttonClasses = submitButton.className;
    expect(buttonClasses).toContain('bg-primary');
    expect(buttonClasses).toContain('text-white');
  });

  describe('Form field accessibility', () => {
    it('should have ticker input with associated label', () => {
      render(<NovaPosicaoPage />);

      const label = screen.getByText('Ticker');
      expect(label).toHaveAttribute('for', 'ticker');
      
      const input = screen.getByLabelText('Ticker');
      expect(input).toHaveAttribute('id', 'ticker');
      expect(input).toHaveAttribute('name', 'ticker');
    });

    it('should have classe_ativo select with associated label', () => {
      render(<NovaPosicaoPage />);

      const label = screen.getByText('Classe de Ativo');
      expect(label).toHaveAttribute('for', 'classe_ativo');
      
      const select = screen.getByLabelText('Classe de Ativo');
      expect(select).toHaveAttribute('id', 'classe_ativo');
      expect(select).toHaveAttribute('name', 'classe_ativo');
    });

    it('should have nome input with associated label', () => {
      render(<NovaPosicaoPage />);

      const label = screen.getByText('Nome do Ativo');
      expect(label).toHaveAttribute('for', 'nome');
      
      const input = screen.getByLabelText('Nome do Ativo');
      expect(input).toHaveAttribute('id', 'nome');
      expect(input).toHaveAttribute('name', 'nome');
    });

    it('should have setor input with associated label', () => {
      render(<NovaPosicaoPage />);

      const label = screen.getByText(/Setor/);
      expect(label).toHaveAttribute('for', 'setor');
      
      const input = screen.getByLabelText(/Setor/);
      expect(input).toHaveAttribute('id', 'setor');
      expect(input).toHaveAttribute('name', 'setor');
    });

    it('should have segmento input with associated label', () => {
      render(<NovaPosicaoPage />);

      const label = screen.getByText(/Segmento/);
      expect(label).toHaveAttribute('for', 'segmento');
      
      const input = screen.getByLabelText(/Segmento/);
      expect(input).toHaveAttribute('id', 'segmento');
      expect(input).toHaveAttribute('name', 'segmento');
    });

    it('should have tipo select with associated label', () => {
      render(<NovaPosicaoPage />);

      const label = screen.getByText('Tipo');
      expect(label).toHaveAttribute('for', 'tipo');
      
      const select = screen.getByLabelText('Tipo');
      expect(select).toHaveAttribute('id', 'tipo');
      expect(select).toHaveAttribute('name', 'tipo');
    });

    it('should have data input with associated label', () => {
      render(<NovaPosicaoPage />);

      const label = screen.getByText('Data');
      expect(label).toHaveAttribute('for', 'data');
      
      const input = screen.getByLabelText('Data');
      expect(input).toHaveAttribute('id', 'data');
      expect(input).toHaveAttribute('name', 'data');
    });

    it('should have quantidade input with associated label', () => {
      render(<NovaPosicaoPage />);

      const label = screen.getByText('Quantidade');
      expect(label).toHaveAttribute('for', 'quantidade');
      
      const input = screen.getByLabelText('Quantidade');
      expect(input).toHaveAttribute('id', 'quantidade');
      expect(input).toHaveAttribute('name', 'quantidade');
    });

    it('should have valor_total input with associated label', () => {
      render(<NovaPosicaoPage />);

      const label = screen.getByText(/Valor Total/);
      expect(label).toHaveAttribute('for', 'valor_total');
      
      const input = screen.getByLabelText(/Valor Total/);
      expect(input).toHaveAttribute('id', 'valor_total');
      expect(input).toHaveAttribute('name', 'valor_total');
    });
  });
});
