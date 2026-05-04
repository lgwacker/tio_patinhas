'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface FABProps {
  onClick?: () => void;
  href?: string;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function FAB({ 
  onClick, 
  href, 
  label = 'Adicionar', 
  icon = <Plus size={24} />,
  className = '' 
}: FABProps) {
  const baseClasses = `
    fixed bottom-6 right-6 z-40
    flex items-center gap-2
    bg-primary hover:bg-blue-600
    text-white font-medium
    rounded-full shadow-lg
    transition-all duration-200
    hover:shadow-xl hover:scale-105
    active:scale-95
    focus:outline-none focus:ring-4 focus:ring-primary/30
    min-h-[56px] min-w-[56px]
    px-4 py-3
    md:bottom-8 md:right-8
    touch-manipulation
  `;

  const combinedClasses = `${baseClasses} ${className}`.trim();

  const content = (
    <>
      <span className="shrink-0">{icon}</span>
      <span className="hidden sm:inline pr-1">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClasses} aria-label={label}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={combinedClasses} aria-label={label} type="button">
      {content}
    </button>
  );
}
