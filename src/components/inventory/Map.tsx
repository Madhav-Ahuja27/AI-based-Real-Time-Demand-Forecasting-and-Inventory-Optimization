
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapProps {
  className?: string;
}

interface LocationMarker {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  description: string;
}

const Map: React.FC<MapProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  // Punjab region locations - properly typed as [longitude, latitude]
  const locations: LocationMarker[] = [
    { 
      name: "Chandigarh", 
      coordinates: [76.7794, 30.7333],
      description: "Main inventory location" 
    },
    { 
      name: "Delhi", 
      coordinates: [77.1025, 28.7041],
      description: "Regional distribution center" 
    },
    { 
      name: "Ludhiana", 
      coordinates: [75.8573, 30.9010],
      description: "Northern Punjab warehouse" 
    },
    { 
      name: "Jalandhar", 
      coordinates: [75.5762, 31.3260],
      description: "Secondary storage facility" 
    }
  ];

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map with your Mapbox token
    mapboxgl.accessToken = 'pk.eyJ1Ijoic3RyYXJudiIsImEiOiJjbTkwcWp1YTAwMHduMmxwdjMxcmtqdG1sIn0.x3LzQoJ5-RXEYm6om7J3cw';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [76.7794, 30.7333], // Center on Chandigarh initially
      zoom: 7, // Zoomed out more to show all locations
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add markers for all locations
    locations.forEach(location => {
      const markerEl = document.createElement('div');
      markerEl.innerHTML = `<div class="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>`;

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat(location.coordinates)
        .addTo(map.current!);
      
      // Add popup with location information
      new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 25
      })
        .setLngLat(location.coordinates)
        .setHTML(`<h3 class="font-medium">${location.name}</h3><p>${location.description}</p>`)
        .addTo(map.current!);
      
      markers.current.push(marker);
    });

    // Fit bounds to include all markers
    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach(location => {
      bounds.extend(location.coordinates);
    });
    
    map.current.fitBounds(bounds, {
      padding: 50, // Add some padding around the bounds
      maxZoom: 9  // Don't zoom in too far
    });

    // Cleanup
    return () => {
      markers.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, []);

  return (
    <div className={`relative rounded-md overflow-hidden shadow-md ${className}`}>
      <div ref={mapContainer} className="h-full w-full min-h-[300px]" />
    </div>
  );
};

export default Map;
