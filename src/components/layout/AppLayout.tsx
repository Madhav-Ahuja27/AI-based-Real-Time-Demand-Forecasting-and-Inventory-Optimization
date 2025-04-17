
import React from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarFooter } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { 
  Package, 
  Boxes, 
  LineChart, 
  TrendingUp, 
  CloudSun, 
  MessageCircle,
  FileBarChart, 
  Settings, 
  LayoutDashboard,
  Bell,
  Search,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function AppLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-sidebar-border">
          <SidebarHeader className="flex h-16 items-center border-b border-sidebar-border px-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-sidebar-foreground">InventoryPro</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-2">
            <SidebarGroup className="pt-2">
              <SidebarGroupLabel className="px-4 text-xs font-medium text-muted-foreground">MAIN</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Dashboard" className="h-10">
                      <Link to="/">
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Inventory" className="h-10">
                      <Link to="/inventory-monitoring">
                        <Boxes className="h-5 w-5" />
                        <span className="font-medium">Inventory</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Forecasting" className="h-10">
                      <Link to="/demand-forecasting">
                        <LineChart className="h-5 w-5" />
                        <span className="font-medium">Demand Forecasting</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Reordering" className="h-10">
                      <Link to="/reordering-system">
                        <TrendingUp className="h-5 w-5" />
                        <span className="font-medium">Reordering</span>
                        <Badge variant="secondary" className="ml-auto">New</Badge>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup className="pt-4">
              <SidebarGroupLabel className="px-4 text-xs font-medium text-muted-foreground">ADVANCED</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Weather Impact" className="h-10">
                      <Link to="/weather-impact">
                        <CloudSun className="h-5 w-5" />
                        <span className="font-medium">Weather Impact</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Market Sentiment" className="h-10">
                      <Link to="/sentiment-tracking">
                        <MessageCircle className="h-5 w-5" />
                        <span className="font-medium">Market Sentiment</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Reports" className="h-10">
                      <Link to="/reports">
                        <FileBarChart className="h-5 w-5" />
                        <span className="font-medium">Reports & Analytics</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="flex items-center justify-between border-t border-sidebar-border p-4 mt-auto">
            <ThemeToggle />
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
            <SidebarTrigger />
            <div className="flex-1 flex items-center gap-4 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search inventory..." 
                  className="w-full bg-background pl-8 focus-visible:ring-primary"
                />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">3</span>
              </Button>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium">Admin User</span>
                  <span className="text-xs text-muted-foreground">admin@inventory.pro</span>
                </div>
                <Avatar>
                  <AvatarImage src="" alt="Admin User" />
                  <AvatarFallback className="bg-primary/10 text-primary">AU</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="app-background">
              <div className="content-container">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default AppLayout;
