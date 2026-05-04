'use client';

import type { AssetClass } from '@/types';
import { ASSET_CLASS_TABS } from '@/types';

interface AssetClassTabsProps {
  activeTab: AssetClass;
  onTabChange: (assetClass: AssetClass) => void;
  counts?: Record<AssetClass, number>;
}

export function AssetClassTabs({ activeTab, onTabChange, counts }: AssetClassTabsProps) {
  return (
    <div className="border-b border-border">
      <nav className="flex gap-1 overflow-x-auto scrollbar-hide" aria-label="Asset class tabs" role="tablist">
        {ASSET_CLASS_TABS.map((tab) => {
          const count = counts?.[tab.value] ?? 0;
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={`
                px-4 py-3 text-sm font-medium whitespace-nowrap
                border-b-2 transition-colors
                ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                }
              `}
              aria-selected={isActive}
              role="tab"
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-1.5 text-xs ${isActive ? 'text-text-primary' : 'opacity-70'}`}>
                  ({count})
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
