
import { useMemo } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps
} from "recharts";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DataPoint {
  [key: string]: any;
}

interface LineChartProps {
  data: DataPoint[];
  lines: {
    key: string;
    name: string;
    color: string;
    strokeWidth?: number;
    dashed?: boolean;
  }[];
  xAxisKey: string;
  xAxisFormatter?: (value: any) => string;
  title?: string;
  description?: string;
  height?: number | string;
  className?: string;
}

function defaultDateFormatter(dateString: string): string {
  try {
    return format(parseISO(dateString), "MMM d");
  } catch (e) {
    return dateString;
  }
}

export function LineChart({
  data,
  lines,
  xAxisKey,
  xAxisFormatter = defaultDateFormatter,
  title,
  description,
  height = 300,
  className
}: LineChartProps) {
  const chartLines = useMemo(() => {
    return lines.map((line) => (
      <Line
        key={line.key}
        type="monotone"
        dataKey={line.key}
        name={line.name}
        stroke={line.color}
        strokeWidth={line.strokeWidth || 2}
        dot={false}
        activeDot={{ r: 6, strokeWidth: 2 }}
        strokeDasharray={line.dashed ? "5 5" : ""}
      />
    ));
  }, [lines]);

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
          <RechartsLineChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: 0,
              bottom: 5,
            }}
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
              tickFormatter={(value) => (typeof value === "number" ? value.toFixed(0) : value)}
            />
            <Tooltip content={renderTooltip} />
            <Legend />
            {chartLines}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
