
import { useEffect, useState } from "react";
import { fetchProducts, fetchSocialSentiment } from "@/lib/mock-api";
import { Product, SocialSentiment } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageCircle, TrendingUp, Twitter, Facebook, Instagram } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function SentimentTracking() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sentimentData, setSentimentData] = useState<SocialSentiment[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [productsData, socialData] = await Promise.all([
          fetchProducts(),
          fetchSocialSentiment()
        ]);
        
        setProducts(productsData);
        setSentimentData(socialData);
        
        if (productsData.length > 0) {
          setSelectedProduct(productsData[0].id);
        }
      } catch (error) {
        console.error("Error loading sentiment data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filter sentiment data for the selected product
  const productSentiment = selectedProduct 
    ? sentimentData.filter(s => s.productId === selectedProduct) 
    : [];
  
  // Create chart data
  const sentimentChartData = productSentiment.map(data => ({
    date: data.date,
    sentiment: parseFloat((data.sentiment * 100).toFixed(1)), // Convert to percentage
    volume: data.volume
  }));

  // Get sources breakdown for latest sentiment
  const latestSentiment = productSentiment[productSentiment.length - 1];
  const sourcesData = latestSentiment ? [
    { name: 'Twitter', value: latestSentiment.sources.twitter },
    { name: 'Facebook', value: latestSentiment.sources.facebook },
    { name: 'Instagram', value: latestSentiment.sources.instagram },
    { name: 'TikTok', value: latestSentiment.sources.tiktok },
  ] : [];

  // Calculate trending products
  const trendingProducts = products
    .map(product => {
      const productData = sentimentData.filter(s => s.productId === product.id);
      if (productData.length === 0) return null;
      
      const recent = productData.slice(-5);
      const avgSentiment = recent.reduce((sum, item) => sum + item.sentiment, 0) / recent.length;
      const avgVolume = recent.reduce((sum, item) => sum + item.volume, 0) / recent.length;
      const trending = recent.some(item => item.trending);
      
      return {
        ...product,
        sentiment: avgSentiment,
        volume: avgVolume,
        trending
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a!.trending && !b!.trending) return -1;
      if (!a!.trending && b!.trending) return 1;
      return (b!.sentiment * b!.volume) - (a!.sentiment * a!.volume);
    })
    .slice(0, 5);

  const getSentimentClass = (sentiment: number) => {
    if (sentiment > 0.2) return "text-emerald-500";
    if (sentiment > 0) return "text-emerald-400";
    if (sentiment > -0.2) return "text-amber-500";
    return "text-rose-500";
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.5) return "Very Positive";
    if (sentiment > 0.2) return "Positive";
    if (sentiment > 0) return "Slightly Positive";
    if (sentiment > -0.2) return "Slightly Negative";
    if (sentiment > -0.5) return "Negative";
    return "Very Negative";
  };

  return (
    <div className="container p-6">
      <h1 className="text-3xl font-bold mb-6">Social Sentiment Tracking</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Sentiment Analysis</CardTitle>
                <CardDescription>Track social media sentiment for your products</CardDescription>
              </div>
              <Select 
                value={selectedProduct || ""} 
                onValueChange={setSelectedProduct}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <span className="text-muted-foreground">Loading sentiment data...</span>
              </div>
            ) : (
              <LineChart
                data={sentimentChartData}
                xAxisKey="date"
                height={350}
                lines={[
                  { key: "sentiment", name: "Sentiment Score (%)", color: "#8b5cf6" },
                  { key: "volume", name: "Mention Volume", color: "#ec4899" }
                ]}
              />
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Trending Products</CardTitle>
            <CardDescription>Products with rising social media activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trendingProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between pb-2 border-b last:border-0">
                  <div>
                    <div className="flex items-center">
                      <p className="font-medium">{product!.name}</p>
                      {product!.trending && (
                        <Badge className="ml-2 bg-rose-100 text-rose-800 border-rose-300 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(product!.volume)} mentions
                    </p>
                  </div>
                  <div className={`flex items-center ${getSentimentClass(product!.sentiment)}`}>
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span className="font-medium">
                      {(product!.sentiment * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Breakdown</CardTitle>
            <CardDescription>Mentions by social platform</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <span className="text-muted-foreground">Loading platform data...</span>
              </div>
            ) : (
              <BarChart
                data={sourcesData}
                xAxisKey="name"
                height={300}
                bars={[
                  { key: "value", name: "Mentions", color: "#6366f1" }
                ]}
              />
            )}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sentiment Details</CardTitle>
            <CardDescription>
              {selectedProduct && products.find(p => p.id === selectedProduct)?.name} - Last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {latestSentiment && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Current Sentiment</p>
                    <p className={`text-2xl font-bold ${getSentimentClass(latestSentiment.sentiment)}`}>
                      {(latestSentiment.sentiment * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs font-medium mt-1">
                      {getSentimentLabel(latestSentiment.sentiment)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Mention Volume</p>
                    <p className="text-2xl font-bold">
                      {latestSentiment.volume.toLocaleString()}
                    </p>
                    <p className="text-xs font-medium mt-1">
                      {latestSentiment.trending ? "Trending Up" : "Stable"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Top Platform</p>
                    <p className="text-2xl font-bold flex items-center justify-center">
                      <Twitter className="h-6 w-6 mr-2 text-blue-400" />
                      Twitter
                    </p>
                    <p className="text-xs font-medium mt-1">
                      {latestSentiment.sources.twitter} mentions
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Social Media Sources</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Platform</TableHead>
                        <TableHead>Mentions</TableHead>
                        <TableHead>% of Total</TableHead>
                        <TableHead>Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="flex items-center">
                          <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                          Twitter
                        </TableCell>
                        <TableCell>{latestSentiment.sources.twitter.toLocaleString()}</TableCell>
                        <TableCell>
                          {((latestSentiment.sources.twitter / latestSentiment.volume) * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-emerald-500">+12%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="flex items-center">
                          <Instagram className="h-4 w-4 mr-2 text-rose-400" />
                          Instagram
                        </TableCell>
                        <TableCell>{latestSentiment.sources.instagram.toLocaleString()}</TableCell>
                        <TableCell>
                          {((latestSentiment.sources.instagram / latestSentiment.volume) * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-emerald-500">+8%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="flex items-center">
                          <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                          Facebook
                        </TableCell>
                        <TableCell>{latestSentiment.sources.facebook.toLocaleString()}</TableCell>
                        <TableCell>
                          {((latestSentiment.sources.facebook / latestSentiment.volume) * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-rose-500">-3%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="flex items-center">
                          <svg className="h-4 w-4 mr-2 text-black" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                          </svg>
                          TikTok
                        </TableCell>
                        <TableCell>{latestSentiment.sources.tiktok.toLocaleString()}</TableCell>
                        <TableCell>
                          {((latestSentiment.sources.tiktok / latestSentiment.volume) * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-emerald-500">+21%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Sentiment-Based Inventory Recommendations</CardTitle>
          <CardDescription>Leverage social media trends to optimize inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Recommendation</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trendingProducts.slice(0, 3).map((product, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{product!.name}</TableCell>
                  <TableCell>
                    <div className={`flex items-center ${getSentimentClass(product!.sentiment)}`}>
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span>{(product!.sentiment * 100).toFixed(0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product!.trending ? (
                      <Badge className="bg-rose-100 text-rose-800 border-rose-300 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Rising Fast
                      </Badge>
                    ) : product!.sentiment > 0 ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                        Positive
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                        Stable
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {product!.sentiment > 0.2 && product!.trending ? (
                      "Increase stock by 50%, create prominent displays"
                    ) : product!.sentiment > 0 ? (
                      "Maintain optimal stock levels, monitor trend"
                    ) : (
                      "Consider discounting to clear inventory"
                    )}
                  </TableCell>
                  <TableCell>
                    {product!.sentiment > 0.2 && product!.trending ? (
                      <Badge className="bg-rose-100 text-rose-800 border-rose-300">High</Badge>
                    ) : product!.sentiment > 0 ? (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300">Medium</Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-300">Low</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
