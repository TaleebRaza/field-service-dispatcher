'use client';

import { useEffect, useRef } from 'react';
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
  const positions: [number, number][] = [[startLat, startLng], [endLat, endLng]];

  useEffect(() => {
    // A slight delay ensures Leaflet has fully injected the SVG into the DOM
    const timeout = setTimeout(() => {
      if (polylineRef.current) {
        // Grab the raw SVG <path> element from Leaflet
        const pathElement = polylineRef.current.getElement();
        
        if (pathElement && pathElement.animate) {
          // Force the animation via the Web Animations API (JS native)
          pathElement.animate(
            [
              { strokeDashoffset: '0' },
              { strokeDashoffset: '-1000' }
            ],
            {
              duration: 30000, // 30 seconds for a steady flow
              iterations: Infinity,
              easing: 'linear'
            }
          );
        }
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Polyline 
      ref={polylineRef}
      positions={positions} 
      pathOptions={{ 
        color: color, 
        weight: 4, 
        opacity: 0.8,
        dashArray: '12, 12', // Defines the dashed pattern
        lineCap: 'round'
        // Notice we completely removed the className here!
      }} 
    />
  );
}