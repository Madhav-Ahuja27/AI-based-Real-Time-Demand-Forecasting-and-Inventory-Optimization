
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapProps {
  className?: string;
}

const Map: React.FC<MapProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  // Chandigarh, India coordinates - properly typed as [longitude, latitude]
  const chandigarhCoordinates: [number, number] = [76.7794, 30.7333];

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map with your Mapbox token
    mapboxgl.accessToken = 'pk.eyJ1Ijoic3RyYXJudiIsImEiOiJjbTkwcWp1YTAwMHduMmxwdjMxcmtqdG1sIn0.x3LzQoJ5-RXEYm6om7J3cw';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: chandigarhCoordinates,
      zoom: 10,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add marker for Chandigarh
    const markerEl = document.createElement('div');
    markerEl.innerHTML = `<div class="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>`;

    marker.current = new mapboxgl.Marker(markerEl)
      .setLngLat(chandigarhCoordinates)
      .addTo(map.current);

    // Add popup with location information
    new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 25
    })
      .setLngLat(chandigarhCoordinates)
      .setHTML('<h3 class="font-medium">Chandigarh Warehouse</h3><p>Main inventory location</p>')
      .addTo(map.current);

    // Cleanup
    return () => {
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
