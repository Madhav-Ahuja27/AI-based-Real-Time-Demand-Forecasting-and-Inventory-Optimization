
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Download, FileText, FilePlus, FileBarChart, Mail, Settings } from "lucide-react";

export default function Reports() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Sample data for reports
  const salesTrendData = [
    { date: "2023-07", sales: 12500, forecast: 12300 },
    { date: "2023-08", sales: 14200, forecast: 14000 },
    { date: "2023-09", sales: 16800, forecast: 16500 },
    { date: "2023-10", sales: 18500, forecast: 18200 },
    { date: "2023-11", sales: 21000, forecast: 20500 },
    { date: "2023-12", sales: 24200, forecast: 23500 }
  ];
  
  const categoryData = [
    { category: "Electronics", sales: 45600 },
    { category: "Clothing", sales: 32800 },
    { category: "Food", sales: 28900 },
    { category: "Home Goods", sales: 22100 },
    { category: "Sports", sales: 17500 }
  ];
  
  const supplierPerformanceData = [
    { supplier: "Acme Inc", onTime: 94, quality: 92, costIndex: 105 },
    { supplier: "Global Supply Co", onTime: 87, quality: 90, costIndex: 98 },
    { supplier: "Quality Products Ltd", onTime: 98, quality: 96, costIndex: 112 },
    { supplier: "Prime Distributors", onTime: 91, quality: 89, costIndex: 96 },
    { supplier: "Mega Wholesale", onTime: 88, quality: 94, costIndex: 92 }
  ];

  return (
    <div className="container p-6">
      <h1 className="text-3xl font-bold mb-6">Reports & Insights</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Generate Reports</CardTitle>
              <CardDescription>Create on-demand reports for business analysis</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[240px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sales">
            <TabsList className="mb-4">
              <TabsTrigger value="sales">Sales Reports</TabsTrigger>
              <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
              <TabsTrigger value="supplier">Supplier Reports</TabsTrigger>
              <TabsTrigger value="custom">Custom Reports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sales" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Type</label>
                  <Select defaultValue="monthly">
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Sales Summary</SelectItem>
                      <SelectItem value="product">Sales by Product</SelectItem>
                      <SelectItem value="category">Sales by Category</SelectItem>
                      <SelectItem value="location">Sales by Location</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <Select defaultValue="last6months">
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last30days">Last 30 Days</SelectItem>
                      <SelectItem value="last3months">Last 3 Months</SelectItem>
                      <SelectItem value="last6months">Last 6 Months</SelectItem>
                      <SelectItem value="ytd">Year to Date</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Format</label>
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="text-lg font-medium mb-4">Preview</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <LineChart
                    title="Sales Trend vs Forecast"
                    data={salesTrendData}
                    xAxisKey="date"
                    lines={[
                      { key: "sales", name: "Actual Sales", color: "#3b82f6" },
                      { key: "forecast", name: "Forecast", color: "#94a3b8", dashed: true }
                    ]}
                  />
                  <BarChart
                    title="Sales by Category"
                    data={categoryData}
                    xAxisKey="category"
                    bars={[
                      { key: "sales", name: "Sales ($)", color: "#3b82f6" }
                    ]}
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Schedule Email Delivery
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="inventory" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Type</label>
                  <Select defaultValue="status">
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="status">Inventory Status Summary</SelectItem>
                      <SelectItem value="movement">Inventory Movement</SelectItem>
                      <SelectItem value="turnover">Inventory Turnover</SelectItem>
                      <SelectItem value="age">Inventory Age Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="store-001">Downtown Store</SelectItem>
                      <SelectItem value="store-002">Westside Location</SelectItem>
                      <SelectItem value="warehouse">Main Warehouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Format</label>
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="text-lg font-medium mb-4">Options</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="include-valuation"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="include-valuation" className="ml-2 text-sm">
                      Include inventory valuation
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="include-forecasts"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="include-forecasts" className="ml-2 text-sm">
                      Include demand forecasts
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="highlight-issues"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="highlight-issues" className="ml-2 text-sm">
                      Highlight low stock and overstock issues
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Advanced Options
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="supplier" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Type</label>
                  <Select defaultValue="performance">
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Supplier Performance</SelectItem>
                      <SelectItem value="orders">Purchase Orders</SelectItem>
                      <SelectItem value="delivery">Delivery Analysis</SelectItem>
                      <SelectItem value="price">Price Trend Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Supplier</label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Suppliers</SelectItem>
                      <SelectItem value="acme">Acme Inc</SelectItem>
                      <SelectItem value="global">Global Supply Co</SelectItem>
                      <SelectItem value="quality">Quality Products Ltd</SelectItem>
                      <SelectItem value="prime">Prime Distributors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Period</label>
                  <Select defaultValue="lastquarter">
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lastquarter">Last Quarter</SelectItem>
                      <SelectItem value="lastyear">Last Year</SelectItem>
                      <SelectItem value="ytd">Year to Date</SelectItem>
                      <SelectItem value="custom">Custom Period</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="text-lg font-medium mb-4">Preview</h3>
                <BarChart
                  title="Supplier Performance Metrics"
                  data={supplierPerformanceData}
                  xAxisKey="supplier"
                  bars={[
                    { key: "onTime", name: "On-Time Delivery %", color: "#3b82f6" },
                    { key: "quality", name: "Quality Score %", color: "#10b981" },
                    { key: "costIndex", name: "Cost Index", color: "#f59e0b" }
                  ]}
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Share with Team
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Custom Report Builder</h3>
                <Button variant="outline" size="sm">
                  <FilePlus className="mr-2 h-4 w-4" />
                  Save Template
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Report Parameters</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Report Title</label>
                      <Input placeholder="Enter report title" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Date</label>
                        <Input type="date" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <textarea 
                        className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Enter report description"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Data Sources</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Primary Data</label>
                      <Select defaultValue="sales">
                        <SelectTrigger>
                          <SelectValue placeholder="Select data source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Sales Data</SelectItem>
                          <SelectItem value="inventory">Inventory Data</SelectItem>
                          <SelectItem value="forecast">Forecast Data</SelectItem>
                          <SelectItem value="supplier">Supplier Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Filters</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Add filters" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="category">Product Category</SelectItem>
                          <SelectItem value="location">Location</SelectItem>
                          <SelectItem value="supplier">Supplier</SelectItem>
                          <SelectItem value="stocklevel">Stock Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Visualizations</label>
                      <Select defaultValue="charts">
                        <SelectTrigger>
                          <SelectValue placeholder="Select visualizations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="charts">Charts & Tables</SelectItem>
                          <SelectItem value="chartsonly">Charts Only</SelectItem>
                          <SelectItem value="tablesonly">Tables Only</SelectItem>
                          <SelectItem value="raw">Raw Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button>
                  <FileBarChart className="mr-2 h-4 w-4" />
                  Generate Custom Report
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Reports</CardTitle>
            <CardDescription>Automated report generation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <p className="font-medium">Weekly Sales Summary</p>
                  <p className="text-xs text-muted-foreground">Every Monday at 8:00 AM</p>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <p className="font-medium">Monthly Inventory Report</p>
                  <p className="text-xs text-muted-foreground">1st of every month</p>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <p className="font-medium">Quarterly Supplier Performance</p>
                  <p className="text-xs text-muted-foreground">End of each quarter</p>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
              <Button variant="outline" className="w-full">
                <FilePlus className="mr-2 h-4 w-4" />
                Schedule New Report
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Report Templates</CardTitle>
            <CardDescription>Saved report configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <p className="font-medium">Executive Dashboard</p>
                  <p className="text-xs text-muted-foreground">Key metrics overview</p>
                </div>
                <Button variant="ghost" size="sm">Use</Button>
              </div>
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <p className="font-medium">Detailed Inventory Analysis</p>
                  <p className="text-xs text-muted-foreground">Complete stock level breakdown</p>
                </div>
                <Button variant="ghost" size="sm">Use</Button>
              </div>
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <p className="font-medium">Product Performance Report</p>
                  <p className="text-xs text-muted-foreground">Sales and stock analysis by product</p>
                </div>
                <Button variant="ghost" size="sm">Use</Button>
              </div>
              <Button variant="outline" className="w-full">
                <FilePlus className="mr-2 h-4 w-4" />
                Create New Template
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Recently generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <p className="font-medium">Weekly Sales (Apr 8-14)</p>
                  <p className="text-xs text-muted-foreground">Generated April 15, 2025</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </div>
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <p className="font-medium">Stock Status Report</p>
                  <p className="text-xs text-muted-foreground">Generated April 10, 2025</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </div>
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <p className="font-medium">Q1 Performance Summary</p>
                  <p className="text-xs text-muted-foreground">Generated April 2, 2025</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </div>
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                View All Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
