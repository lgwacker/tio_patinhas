import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface GainLossIndicatorProps {
  value: number;
  showIcon?: boolean;
  className?: string;
}

/**
 * Displays a value with gain/loss coloring (dourado for gains, vermelho for losses)
 */
export function GainLossIndicator({
  value,
  showIcon = true,
  className = '',
}: GainLossIndicatorProps) {
  const isProfit = value >= 0;
  const colorClass = isProfit ? 'text-profit' : 'text-loss';
  const Icon = isProfit ? ArrowUp : ArrowDown;
  
  return (
    <span className={`${colorClass} ${className}`}>
      {showIcon && <Icon className="inline w-3 h-3 mr-1" />}
      {value >= 0 ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

/**
 * Displays a currency value with gain/loss coloring
 */
export function GainLossCurrency({
  value,
  showIcon = true,
  className = '',
}: GainLossIndicatorProps) {
  const isProfit = value >= 0;
  const colorClass = isProfit ? 'text-profit' : 'text-loss';
  const Icon = isProfit ? ArrowUp : ArrowDown;
  
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'always',
  }).format(value);
  
  return (
    <span className={`${colorClass} ${className}`}>
      {showIcon && <Icon className="inline w-3 h-3 mr-1" />}
      {formattedValue}
    </span>
  );
}