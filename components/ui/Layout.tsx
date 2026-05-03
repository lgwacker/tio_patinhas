'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  History, 
  Settings, 
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Carteira', href: '/carteira', icon: Wallet },
  { name: 'Histórico', href: '/historico', icon: History },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
];

export function Layout({ children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-surface border-r border-border
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className={`
            flex items-center justify-between 
            h-16 px-4 border-b border-border
            ${isCollapsed ? 'justify-center' : ''}
          `}>
            {!isCollapsed && (
              <span className="text-xl font-bold text-profit truncate">
                Tio Patinhas
              </span>
            )}
            {isCollapsed && (
              <span className="text-xl font-bold text-profit">TP</span>
            )}
            
            {/* Desktop toggle button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-md hover:bg-border text-text-secondary"
              aria-label="Toggle sidebar"
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1" role="navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-md
                    text-text-secondary hover:text-text-primary hover:bg-border
                    transition-colors group
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon size={20} className="shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={`
            p-4 border-t border-border text-xs text-text-secondary
            ${isCollapsed ? 'text-center' : ''}
          `}>
            {!isCollapsed ? 'v0.1.0' : 'v0.1'}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 h-16 px-4 bg-surface border-b border-border">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-md hover:bg-border text-text-secondary"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="text-lg font-bold text-profit">Tio Patinhas</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
