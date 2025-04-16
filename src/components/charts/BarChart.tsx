
import { useMemo } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps,
  Cell
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DataPoint {
  [key: string]: any;
}

interface BarChartProps {
  data: DataPoint[];
  bars: {
    key: string;
    name: string;
    color: string;
    colorByValue?: boolean;
  }[];
  xAxisKey: string;
  xAxisFormatter?: (value: any) => string;
  stacked?: boolean;
  title?: string;
  description?: string;
  height?: number | string;
  className?: string;
}

function defaultDateFormatter(dateString: string): string {
  try {
    return format(parseISO(dateString), 'MMM d');
  } catch (e) {
    return dateString;
  }
}

export function BarChart({
  data,
  bars,
  xAxisKey,
  xAxisFormatter = defaultDateFormatter,
  stacked = false,
  title,
  description,
  height = 300,
  className
}: BarChartProps) {
  const chartBars = useMemo(() => {
    return bars.map((bar) => {
      if (bar.colorByValue) {
        return (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            fill={bar.color}
            radius={[4, 4, 0, 0]}
          >
            {data.map((_, index) => {
              const value = data[index][bar.key];
              let barColor = bar.color;
              
              if (typeof value === 'number') {
                // Example: positive green, negative red
                if (value < 0) barColor = '#f43f5e';
                else if (value > 0) barColor = '#10b981';
              }
              
              return <Cell key={`cell-${index}`} fill={barColor} />;
            })}
          </Bar>
        );
      }
      
      return (
        <Bar
          key={bar.key}
          dataKey={bar.key}
          name={bar.name}
          fill={bar.color}
          radius={[4, 4, 0, 0]}
        />
      );
    });
  }, [bars, data]);

  const renderTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
          <p className="text-xs font-bold text-muted-foreground">{xAxisFormatter(label)}</p>
          <div className="mt-1 space-y-0.5">
            {payload.map((entry, index) => (
              <div
                key={`tooltip-${index}`}
                className="flex items-center font-mono text-xs"
              >
                <div
                  className="mr-1 h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="mr-2 text-muted-foreground">{entry.name}:</span>
                <span className="font-medium">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: 0,
              bottom: 5,
            }}
            barGap={4}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              tickFormatter={xAxisFormatter}
              axisLine={false}
              tickLine={false}
              minTickGap={30}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => (typeof value === 'number' ? value.toFixed(0) : value)}
            />
            <Tooltip content={renderTooltip} />
            <Legend />
            {chartBars}
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
