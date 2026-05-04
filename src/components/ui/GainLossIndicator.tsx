import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface GainLossIndicatorProps {
  value: number;
  showIcon?: boolean;
  className?: string;
}

function useGainLossStyle(value: number) {
  const isProfit = value >= 0;
  return {
    isProfit,
    colorClass: isProfit ? 'text-profit' : 'text-loss',
    Icon: isProfit ? ArrowUp : ArrowDown,
  };
}

export function GainLossIndicator({
  value,
  showIcon = true,
  className = '',
}: GainLossIndicatorProps) {
  const { colorClass, Icon } = useGainLossStyle(value);

  return (
    <span className={`${colorClass} ${className}`}>
      {showIcon && <Icon className="inline w-3 h-3 mr-1" />}
      {value >= 0 ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

export function GainLossCurrency({
  value,
  showIcon = true,
  className = '',
}: GainLossIndicatorProps) {
  const { colorClass, Icon } = useGainLossStyle(value);

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
