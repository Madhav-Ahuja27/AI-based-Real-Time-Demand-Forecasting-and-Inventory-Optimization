
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description: string;
  colorScheme?: "default" | "warning" | "success" | "danger" | "primary" | "secondary";
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  colorScheme = "default",
  className
}: StatCardProps) {
  const colorClasses = {
    default: "bg-card",
    primary: "bg-gradient-to-br from-primary/10 to-primary/5",
    secondary: "bg-gradient-to-br from-secondary/10 to-secondary/5",
    warning: "bg-gradient-to-br from-warning/10 to-warning/5",
    success: "bg-gradient-to-br from-success/10 to-success/5",
    danger: "bg-gradient-to-br from-destructive/10 to-destructive/5"
  };

  return (
    <Card 
      className={cn(
        "border overflow-hidden transition-all", 
        colorClasses[colorScheme],
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-muted/50">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
