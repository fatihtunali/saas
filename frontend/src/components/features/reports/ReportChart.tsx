import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type ChartType = 'line' | 'bar' | 'area' | 'pie';

interface ReportChartProps {
  title?: string;
  type: ChartType;
  data: any[];
  dataKey: string | string[];
  xAxisKey?: string;
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  format?: 'currency' | 'number' | 'percentage';
}

const DEFAULT_COLORS = [
  '#4472C4',
  '#ED7D31',
  '#A5A5A5',
  '#FFC000',
  '#5B9BD5',
  '#70AD47',
  '#264478',
  '#9E480E',
  '#636363',
  '#997300',
];

export const ReportChart: React.FC<ReportChartProps> = ({
  title,
  type,
  data,
  dataKey,
  xAxisKey,
  height = 300,
  colors = DEFAULT_COLORS,
  showLegend = true,
  showGrid = true,
  format = 'number',
}) => {
  const formatValue = (value: number): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: 'TRY',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('tr-TR').format(value);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid gap-2">
            <div className="flex flex-col">
              {label && (
                <span className="text-[0.70rem] uppercase text-muted-foreground">{label}</span>
              )}
              {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm font-medium">
                    {entry.name}: {formatValue(entry.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const dataKeys = Array.isArray(dataKey) ? dataKey : [dataKey];

    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            {xAxisKey && <XAxis dataKey={xAxisKey} />}
            <YAxis tickFormatter={formatValue} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            {xAxisKey && <XAxis dataKey={xAxisKey} />}
            <YAxis tickFormatter={formatValue} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            {xAxisKey && <XAxis dataKey={xAxisKey} />}
            <YAxis tickFormatter={formatValue} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        );

      case 'pie':
        const pieDataKey = dataKeys[0];
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={pieDataKey}
              nameKey={xAxisKey || 'name'}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
