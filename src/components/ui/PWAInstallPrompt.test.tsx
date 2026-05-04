import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { PWAInstallPrompt } from './PWAInstallPrompt';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('PWAInstallPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage mock
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('renders nothing initially', () => {
    const { container } = render(<PWAInstallPrompt />);
    expect(container.firstChild).toBeNull();
  });

  it('shows install prompt when beforeinstallprompt event fires', async () => {
    render(<PWAInstallPrompt />);

    // Simulate the beforeinstallprompt event wrapped in act()
    const event = new Event('beforeinstallprompt', { bubbles: true });
    Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
    Object.defineProperty(event, 'prompt', { value: jest.fn().mockResolvedValue(undefined) });
    Object.defineProperty(event, 'userChoice', { value: Promise.resolve({ outcome: 'accepted' }) });

    act(() => {
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(screen.getByText('Instalar Tio Patinhas')).toBeInTheDocument();
    });
  });

  it('shows dismiss button', async () => {
    render(<PWAInstallPrompt />);

    const event = new Event('beforeinstallprompt', { bubbles: true });
    Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
    Object.defineProperty(event, 'prompt', { value: jest.fn() });
    Object.defineProperty(event, 'userChoice', { value: Promise.resolve({ outcome: 'dismissed' }) });

    act(() => {
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Fechar')).toBeInTheDocument();
    });
  });

  it('dismisses prompt when close button is clicked', async () => {
    render(<PWAInstallPrompt />);

    const event = new Event('beforeinstallprompt', { bubbles: true });
    Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
    Object.defineProperty(event, 'prompt', { value: jest.fn() });
    Object.defineProperty(event, 'userChoice', { value: Promise.resolve({ outcome: 'dismissed' }) });

    act(() => {
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(screen.getByText('Instalar Tio Patinhas')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Fechar'));

    await waitFor(() => {
      expect(screen.queryByText('Instalar Tio Patinhas')).not.toBeInTheDocument();
    });
  });

  it('saves dismissal timestamp to localStorage', async () => {
    render(<PWAInstallPrompt />);

    const event = new Event('beforeinstallprompt', { bubbles: true });
    Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
    Object.defineProperty(event, 'prompt', { value: jest.fn() });
    Object.defineProperty(event, 'userChoice', { value: Promise.resolve({ outcome: 'dismissed' }) });

    act(() => {
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(screen.getByText('Instalar Tio Patinhas')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Agora não'));

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'pwa-install-dismissed',
      expect.any(String)
    );
  });

  it('does not show if previously dismissed within a week', () => {
    const recentTime = (Date.now() - 1000).toString(); // 1 second ago
    localStorageMock.getItem.mockReturnValue(recentTime);

    const { container } = render(<PWAInstallPrompt />);
    expect(container.firstChild).toBeNull();
  });
});
