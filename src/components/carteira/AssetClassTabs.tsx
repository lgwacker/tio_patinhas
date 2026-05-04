'use client';

import React from 'react';
import type { AssetClass } from '@/types';
import { ASSET_CLASS_TABS } from '@/lib/carteira-types';

interface AssetClassTabsProps {
  activeTab: AssetClass;
  onTabChange: (assetClass: AssetClass) => void;
}

export function AssetClassTabs({ activeTab, onTabChange }: AssetClassTabsProps) {
  return (
    <div className="border-b border-border">
      <nav className="flex gap-1 overflow-x-auto scrollbar-hide" aria-label="Asset class tabs">
        {ASSET_CLASS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`
              px-4 py-3 text-sm font-medium whitespace-nowrap
              border-b-2 transition-colors
              ${
                activeTab === tab.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              }
            `}
            aria-selected={activeTab === tab.value}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
