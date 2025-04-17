import { useQuery } from "@tanstack/react-query";
import { WeatherData } from "@/lib/mock-data";
import { toast } from "sonner";

// Initialize mock data for fallback
const mockWeatherData = (locationId: string): WeatherData[] => {
  const today = new Date();
  const weatherConditions: Array<WeatherData['condition']> = ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy'];
  
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    const temperature = condition === 'snowy' ? 
      Math.floor(Math.random() * 5) : 
      Math.floor(Math.random() * 30) + (condition === 'sunny' ? 15 : 5);
    
    const precipitation = condition === 'rainy' || condition === 'stormy' ? 
      Math.random() * 30 + 10 : 
      condition === 'snowy' ? Math.random() * 15 + 5 : Math.random() * 5;
    
    // Calculate impact based on condition and temperature
    let impact = 0;
    if (condition === 'sunny' && temperature > 25) impact = Math.random() * 0.3 + 0.1;  // Positive impact for sunny warm days
    else if (condition === 'rainy') impact = Math.random() * -0.3 - 0.1;  // Negative impact for rainy days
    else if (condition === 'stormy') impact = Math.random() * -0.5 - 0.2;  // Larger negative impact for stormy days
    else if (condition === 'snowy') impact = Math.random() * -0.4 - 0.1;  // Negative impact for snowy days
    else impact = (Math.random() * 0.4) - 0.2;  // Mixed impact for cloudy days
    
    return {
      date: date.toISOString().split('T')[0],
      locationId,
      condition,
      temperature,
      precipitation,
      humidity: Math.floor(Math.random() * 60) + 30,
      windSpeed: Math.floor(Math.random() * 20) + 1,
      impact
    };
  });
};

interface OpenWeatherResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      humidity: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
    }>;
    wind: {
      speed: number;
    };
    pop: number; // Probability of precipitation
    dt_txt: string;
  }>;
  city: {
    name: string;
    id: number;
  };
}

const mapWeatherCondition = (weatherId: number): WeatherData['condition'] => {
  // Weather condition codes: https://openweathermap.org/weather-conditions
  if (weatherId >= 200 && weatherId < 300) return 'stormy'; // Thunderstorm
  if (weatherId >= 300 && weatherId < 600) return 'rainy';  // Drizzle and Rain
  if (weatherId >= 600 && weatherId < 700) return 'snowy';  // Snow
  if (weatherId >= 700 && weatherId < 800) return 'cloudy'; // Atmosphere (fog, haze)
  if (weatherId === 800) return 'sunny';                    // Clear
  return 'cloudy';                                          // Clouds
};

const calculateSalesImpact = (condition: WeatherData['condition'], temp: number): number => {
  // Simulate sales impact based on weather conditions
  switch(condition) {
    case 'sunny':
      return temp > 25 ? 0.25 : 0.15; // Higher positive impact on hotter sunny days
    case 'cloudy':
      return 0.05;
    case 'rainy':
      return -0.15;
    case 'snowy':
      return temp < 0 ? -0.3 : -0.1; // Higher negative impact for colder snow
    case 'stormy':
      return -0.4;
    default:
      return 0;
  }
};

// Location IDs to city mappings for the API
export const locationCityMap: Record<string, { city: string, country: string, displayName: string }> = {
  'store-001': { city: 'New Delhi', country: 'IN', displayName: 'Delhi Store' },
  'store-002': { city: 'Mumbai', country: 'IN', displayName: 'Mumbai Store' },
  'store-003': { city: 'Chandigarh', country: 'IN', displayName: 'Chandigarh Store' },
  'store-004': { city: 'Ludhiana', country: 'IN', displayName: 'Ludhiana Store' },
  'store-005': { city: 'Jalandhar', country: 'IN', displayName: 'Jalandhar Store' },
  'warehouse-main': { city: 'Chandigarh', country: 'IN', displayName: 'Main Warehouse' }
};

// API key for OpenWeatherMap - using a free public key for demo purposes
const API_KEY = "1635890035cbba097fd5c26c8ea672a1";

export const useRealWeatherData = (locationId: string = 'store-001') => {
  // Get city info for the location
  const location = locationCityMap[locationId] || locationCityMap['store-001'];
  
  return useQuery({
    queryKey: ['weather', locationId],
    queryFn: async () => {
      try {
        // Fetch 5-day forecast with 3-hour steps
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${location.city},${location.country}&units=metric&appid=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          console.warn(`Weather API returned status ${response.status}`);
          throw new Error(`Weather API error: ${response.statusText}`);
        }
        
        const data: OpenWeatherResponse = await response.json();
        console.log("Weather API response:", data);
        
        // Process the forecast data into our format
        // Group by day to get daily forecasts
        const dailyForecasts = new Map<string, WeatherData>();
        
        data.list.forEach((item) => {
          const date = item.dt_txt.split(' ')[0]; // Extract date part
          
          if (!dailyForecasts.has(date)) {
            const condition = mapWeatherCondition(item.weather[0].id);
            const temperature = item.main.temp;
            
            dailyForecasts.set(date, {
              date,
              locationId,
              condition,
              temperature,
              precipitation: item.pop * 100, // Convert probability to percentage
              humidity: item.main.humidity,
              windSpeed: item.wind.speed,
              impact: calculateSalesImpact(condition, temperature)
            });
          }
        });
        
        // Convert map to array and sort by date
        const result = Array.from(dailyForecasts.values())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        return result;
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
        // Fall back to mock data
        toast.error("Couldn't fetch real weather data, using simulated data instead");
        return mockWeatherData(locationId);
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 30, // Refetch every 30 minutes
    staleTime: 1000 * 60 * 15, // Consider data stale after 15 minutes
  });
};

// This is a wrapper to maintain compatibility with existing code
export const useWeatherForecast = (locationId: string = 'store-001') => {
  const { data, isLoading, isError, refetch } = useRealWeatherData(locationId);
  
  return {
    weatherData: data || [],
    isLoading,
    isError,
    refetch
  };
};
