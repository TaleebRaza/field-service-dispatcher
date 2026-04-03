'use client';

import { useEffect, useRef, useState } from 'react';
import { Polyline } from 'react-leaflet';
import L from 'leaflet';

interface RoutePolylineProps {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
}

export default function RoutePolyline({ startLat, startLng, endLat, endLng, color }: RoutePolylineProps) {
  const polylineRef = useRef<L.Polyline>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  // 1. Fetch the actual road geometry from OSRM
  useEffect(() => {
    async function fetchRoute() {
      try {
        // Ping the free OSRM public routing API
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`);
        const data = await res.json();
        
        if (data.routes && data.routes[0]) {
          // OSRM returns GeoJSON coordinates as [longitude, latitude]
          // Leaflet requires [latitude, longitude], so we map and flip them
          const coords = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          setRouteCoords(coords);
        } else {
          // Fallback to straight line if the API is overwhelmed
          setRouteCoords([[startLat, startLng], [endLat, endLng]]);
        }
      } catch (error) {
        console.error("OSRM Routing failed:", error);
        setRouteCoords([[startLat, startLng], [endLat, endLng]]);
      }
    }
    
    fetchRoute();
  }, [startLat, startLng, endLat, endLng]);

  // 2. Apply the Web Animations API once the complex road path is rendered
  useEffect(() => {
    // Wait until the route coordinates have been fetched
    if (routeCoords.length === 0) return;

    const timeout = setTimeout(() => {
      if (polylineRef.current) {
        const pathElement = polylineRef.current.getElement();
        
        if (pathElement && pathElement.animate) {
          pathElement.animate(
            [
              { strokeDashoffset: '0' },
              { strokeDashoffset: '-1000' }
            ],
            {
              duration: 30000, 
              iterations: Infinity,
              easing: 'linear'
            }
          );
        }
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [routeCoords]);

  // Don't render the line until we have the OSRM data
  if (routeCoords.length === 0) return null;

  return (
    <Polyline 
      ref={polylineRef}
      positions={routeCoords} 
      pathOptions={{ 
        color: color, 
        weight: 4, 
        opacity: 0.8,
        dashArray: '12, 12',
        lineCap: 'round'
      }} 
    />
  );
}