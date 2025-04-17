
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import DemandForecasting from "./pages/DemandForecasting";
import InventoryMonitoring from "./pages/InventoryMonitoring";
import ReorderingSystem from "./pages/ReorderingSystem";
import WeatherImpact from "./pages/WeatherImpact";
import SentimentTracking from "./pages/SentimentTracking";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const App = () => (
  <ThemeProvider defaultTheme="light">
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="demand-forecasting" element={<DemandForecasting />} />
            <Route path="inventory-monitoring" element={<InventoryMonitoring />} />
            <Route path="reordering-system" element={<ReorderingSystem />} />
            <Route path="weather-impact" element={<WeatherImpact />} />
            <Route path="sentiment-tracking" element={<SentimentTracking />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
