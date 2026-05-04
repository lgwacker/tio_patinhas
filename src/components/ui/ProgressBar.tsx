import React from 'react';

interface ProgressBarProps {
  percentage: number;
  className?: string;
}

/**
 * Visual bar showing percentage of portfolio
 */
export function ProgressBar({ percentage, className = '' }: ProgressBarProps) {
  // Clamp percentage between 0 and 100 for display
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${clampedPercentage}%` }}
          aria-valuenow={clampedPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
      <span className="text-xs text-text-secondary w-10 text-right">
        {percentage.toFixed(1)}%
      </span>
    </div>
  );
}