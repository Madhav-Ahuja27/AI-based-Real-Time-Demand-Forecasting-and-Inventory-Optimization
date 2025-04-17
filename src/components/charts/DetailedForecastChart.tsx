
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailedForecastData } from "@/lib/data-parser";

interface DetailedForecastChartProps {
  data: DetailedForecastData[];
  className?: string;
}

export function DetailedForecastChart({ data, className }: DetailedForecastChartProps) {
  const [chartType, setChartType] = useState<"stock" | "impact" | "revenue">("stock");
  
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const renderTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
          <p className="text-xs font-bold text-muted-foreground">
            {format(parseISO(label), "MMM d, yyyy")}
          </p>
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
                <span className="font-medium">
                  {typeof entry.value === 'number' 
                    ? entry.name === 'Revenue' 
                      ? `$${entry.value.toLocaleString()}`
                      : entry.value.toLocaleString() 
                    : entry.value}
                </span>
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
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start justify-between">
          <div>
            <CardTitle>Detailed Forecast Analysis</CardTitle>
            <CardDescription>
              Visualization of stock levels, impacts, and revenue predictions
            </CardDescription>
          </div>
          <Tabs
            value={chartType}
            onValueChange={(value) => setChartType(value as "stock" | "impact" | "revenue")}
            className="w-full md:w-auto mt-4 md:mt-0"
          >
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="stock">Stock Levels</TabsTrigger>
              <TabsTrigger value="impact">Impact Factors</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={sortedData}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(dateStr) => format(parseISO(dateStr), "MM/dd")}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => value.toFixed(0)}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => chartType === "revenue" ? `$${(value/1000).toFixed(0)}k` : value.toFixed(0)}
                hide={chartType !== "revenue"}
              />
              <Tooltip content={renderTooltip} />
              <Legend />

              {chartType === "stock" && (
                <>
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="stockLevel"
                    name="Current Stock"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="predictedStock"
                    name="Predicted Stock"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </>
              )}

              {chartType === "impact" && (
                <>
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="weatherImpact"
                    name="Weather Impact"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="socialImpact"
                    name="Social Impact"
                    stroke="#ec4899"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </>
              )}

              {chartType === "revenue" && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              )}
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
