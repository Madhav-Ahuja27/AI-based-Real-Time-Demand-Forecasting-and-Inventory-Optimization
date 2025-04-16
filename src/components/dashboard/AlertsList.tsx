
import { Alert } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, Info, Package, CloudLightning, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertsListProps {
  alerts: Alert[];
  onMarkAsRead?: (alertId: string) => void;
  className?: string;
  isLoading?: boolean; // Add isLoading prop to the interface
}

export function AlertsList({ alerts, onMarkAsRead, className, isLoading = false }: AlertsListProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Alerts & Notifications</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          Loading alerts...
        </CardContent>
      </Card>
    );
  }

  if (!alerts.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Alerts & Notifications</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          No alerts at this time
        </CardContent>
      </Card>
    );
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4" />;
      case 'overstock':
        return <Package className="h-4 w-4" />;
      case 'trending_product':
        return <MessageCircle className="h-4 w-4" />;
      case 'weather_alert':
        return <CloudLightning className="h-4 w-4" />;
      case 'reorder':
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityClass = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'low':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-lg">Alerts & Notifications</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={cn(
                "flex items-center p-3",
                alert.read ? "opacity-60" : ""
              )}
            >
              <div className={cn("mr-3 rounded-full p-2", getSeverityClass(alert.severity))}>
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{alert.message}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
              {onMarkAsRead && !alert.read && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onMarkAsRead(alert.id)}
                >
                  <Check className="h-4 w-4" />
                  <span className="sr-only">Mark as read</span>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
