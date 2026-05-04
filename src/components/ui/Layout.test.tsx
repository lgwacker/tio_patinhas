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

  it('renders navigation links with correct hrefs', () => {
    render(
      <Layout>
        <div>Page content</div>
      </Layout>
    );

    const navLinks = screen.getAllByRole('link');
    expect(navLinks).toHaveLength(4);

    expect(navLinks[0]).toHaveAttribute('href', '/');
    expect(navLinks[1]).toHaveAttribute('href', '/carteira');
    expect(navLinks[2]).toHaveAttribute('href', '/historico');
    expect(navLinks[3]).toHaveAttribute('href', '/configuracoes');
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

  describe('Mobile Menu', () => {
    it('opens mobile menu when hamburger button is clicked', () => {
      render(
        <Layout>
          <div>Page content</div>
        </Layout>
      );

      // Find and click the hamburger menu button
      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      // Verify the mobile overlay (backdrop) is rendered
      const overlay = document.querySelector('.bg-black.bg-opacity-50');
      expect(overlay).toBeInTheDocument();
    });

    it('closes mobile menu when backdrop is clicked', () => {
      render(
        <Layout>
          <div>Page content</div>
        </Layout>
      );

      // Open the menu
      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      // Verify overlay is present
      let overlay = document.querySelector('.bg-black.bg-opacity-50');
      expect(overlay).toBeInTheDocument();

      // Click the overlay to close
      fireEvent.click(overlay!);

      // Verify overlay is removed
      overlay = document.querySelector('.bg-black.bg-opacity-50');
      expect(overlay).not.toBeInTheDocument();
    });

    it('closes mobile menu when navigation link is clicked', () => {
      render(
        <Layout>
          <div>Page content</div>
        </Layout>
      );

      // Open the menu
      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      // Verify overlay is present
      let overlay = document.querySelector('.bg-black.bg-opacity-50');
      expect(overlay).toBeInTheDocument();

      // Click a navigation link
      const dashboardLink = screen.getByText('Dashboard');
      fireEvent.click(dashboardLink);

      // Verify overlay is removed (menu closed)
      overlay = document.querySelector('.bg-black.bg-opacity-50');
      expect(overlay).not.toBeInTheDocument();
    });

    it('renders mobile header with hamburger button', () => {
      render(
        <Layout>
          <div>Page content</div>
        </Layout>
      );

      // Mobile header should have the menu button
      const menuButton = screen.getByLabelText('Open menu');
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAttribute('aria-label', 'Open menu');
    });

    it('sidebar has correct transition classes for animation', () => {
      render(
        <Layout>
          <div>Page content</div>
        </Layout>
      );

      const navigation = screen.getByRole('navigation');
      const sidebar = navigation.closest('aside');
      
      // Verify animation classes are present
      expect(sidebar).toHaveClass('transition-all');
      expect(sidebar).toHaveClass('duration-300');
      expect(sidebar).toHaveClass('ease-in-out');
    });

    it('disables body scroll when menu is open', () => {
      render(
        <Layout>
          <div>Page content</div>
        </Layout>
      );

      // Body should not have overflow-hidden initially
      expect(document.body).not.toHaveClass('overflow-hidden');

      // Open the menu
      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      // Body should now have overflow-hidden
      expect(document.body).toHaveClass('overflow-hidden');

      // Close the menu
      const overlay = document.querySelector('.bg-black.bg-opacity-50');
      fireEvent.click(overlay!);

      // Body should no longer have overflow-hidden
      expect(document.body).not.toHaveClass('overflow-hidden');
    });

    it('closes mobile menu with close button', () => {
      render(
        <Layout>
          <div>Page content</div>
        </Layout>
      );

      // Open the menu
      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      // Verify overlay is present
      let overlay = document.querySelector('.bg-black.bg-opacity-50');
      expect(overlay).toBeInTheDocument();

      // Click the close button
      const closeButton = screen.getByLabelText('Close menu');
      fireEvent.click(closeButton);

      // Verify overlay is removed
      overlay = document.querySelector('.bg-black.bg-opacity-50');
      expect(overlay).not.toBeInTheDocument();
    });
  });
});
