'use client';

import { useEffect, useState } from 'react';
import { Polyline } from 'react-leaflet';
import { getRoute } from '@/lib/osrm';

interface RoutePolylineProps {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color?: string;
}

export default function RoutePolyline({ startLat, startLng, endLat, endLng, color = '#378ADD' }: RoutePolylineProps) {
  const [positions, setPositions] = useState<[number, number][]>([]);

  useEffect(() => {
    async function fetchAndSetRoute() {
      const route = await getRoute(startLat, startLng, endLat, endLng);
      if (route) {
        setPositions(route.coordinates);
      }
    }

    // Only fetch if we have valid coordinates
    if (startLat && startLng && endLat && endLng) {
      fetchAndSetRoute();
    }
  }, [startLat, startLng, endLat, endLng]);

  if (positions.length === 0) return null;

  return (
    <Polyline 
      positions={positions} 
      pathOptions={{ 
        color: color, 
        weight: 4, 
        opacity: 0.8,
        dashArray: '12, 12', // Critical: defines the length of dash and gap
        lineCap: 'round',
        className: 'animated-route-line' // Injects our new flowing CSS animation
      }} 
    />
  );
}