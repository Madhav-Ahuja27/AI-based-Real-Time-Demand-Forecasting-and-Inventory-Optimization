
import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: number;
  className?: string;
  colorScheme?: 'default' | 'success' | 'warning' | 'danger';
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  colorScheme = 'default'
}: StatCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
        </div>
        <div className="flex items-center pt-1">
          {trend !== undefined && (
            <span
              className={cn(
                "mr-1 text-xs",
                trend > 0 && "text-emerald-500",
                trend < 0 && "text-rose-500"
              )}
            >
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
          {description && (
            <CardDescription className="text-xs text-muted-foreground">{description}</CardDescription>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
