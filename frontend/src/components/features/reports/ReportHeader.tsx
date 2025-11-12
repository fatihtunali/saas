import React from 'react';
import { HelpCircle } from 'lucide-react';

interface ReportHeaderProps {
  title: string;
  description: string;
  helpText?: string;
  lastUpdated?: Date | string;
  actions?: React.ReactNode;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  title,
  description,
  helpText,
  lastUpdated,
  actions,
}) => {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {helpText && (
            <div className="group relative">
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              <div className="absolute left-0 top-6 hidden group-hover:block z-50 w-64 rounded-md border bg-popover p-3 text-sm shadow-md">
                {helpText}
              </div>
            </div>
          )}
        </div>
        <p className="text-muted-foreground mt-2">{description}</p>
        {lastUpdated && (
          <p className="text-sm text-muted-foreground mt-1">
            Last updated: {new Date(lastUpdated).toLocaleString('tr-TR')}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};
