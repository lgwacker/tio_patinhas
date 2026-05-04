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
});
