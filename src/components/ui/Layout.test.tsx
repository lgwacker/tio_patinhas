import { render, screen, fireEvent } from '@testing-library/react';
import { Layout } from './Layout';

describe('Layout', () => {
  it('renders sidebar with navigation items', () => {
    render(
      <Layout>
        <div>Page content</div>
      </Layout>
    );
    
    // Check for sidebar logo (the one with truncate class in desktop sidebar)
    const sidebarLogo = screen.getByText((content, element) => {
      return content === 'Tio Patinhas' && element?.classList.contains('truncate') === true;
    });
    expect(sidebarLogo).toBeInTheDocument();
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Carteira')).toBeInTheDocument();
    expect(screen.getByText('Histórico')).toBeInTheDocument();
    expect(screen.getByText('Configurações')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <Layout>
        <div data-testid="page-content">Page content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });

  it('toggles sidebar collapsed state', () => {
    render(
      <Layout>
        <div>Page content</div>
      </Layout>
    );
    
    const collapseButton = screen.getByLabelText('Collapse sidebar');
    fireEvent.click(collapseButton);
    
    // After collapsing, text labels should be hidden
    // The sidebar aside element should have w-16 class
    const navigation = screen.getByRole('navigation');
    const sidebar = navigation.closest('aside');
    expect(sidebar).toHaveClass('w-16');
  });

  it('sidebar is expandable by default', () => {
    render(
      <Layout>
        <div>Page content</div>
      </Layout>
    );
    
    const navigation = screen.getByRole('navigation');
    const sidebar = navigation.closest('aside');
    expect(sidebar).toHaveClass('w-64');
  });
});
