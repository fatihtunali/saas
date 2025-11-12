import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SummaryCardData {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  change?: number;
  changeLabel?: string;
  format?: 'currency' | 'number' | 'percentage' | 'text';
  className?: string;
}

interface ReportSummaryCardsProps {
  cards: SummaryCardData[];
}

export const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({ cards }) => {
  const formatValue = (value: string | number, format?: string): string => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: 'TRY',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'number':
        return new Intl.NumberFormat('tr-TR').format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return String(value);
    }
  };

  const getChangeIcon = (change?: number) => {
    if (change === undefined || change === null) return null;
    if (change > 0) return <ArrowUp className="h-4 w-4" />;
    if (change < 0) return <ArrowDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getChangeColor = (change?: number) => {
    if (change === undefined || change === null) return 'text-muted-foreground';
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className={card.className}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-2">
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold">{formatValue(card.value, card.format)}</p>
                {card.change !== undefined && (
                  <div
                    className={cn(
                      'flex items-center gap-1 text-xs mt-1',
                      getChangeColor(card.change)
                    )}
                  >
                    {getChangeIcon(card.change)}
                    <span>{Math.abs(card.change).toFixed(1)}%</span>
                    {card.changeLabel && (
                      <span className="text-muted-foreground ml-1">{card.changeLabel}</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
