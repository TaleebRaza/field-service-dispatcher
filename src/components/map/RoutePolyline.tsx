'use client';

import { useEffect, useRef, useState } from 'react';
import { Polyline } from 'react-leaflet';
import { createClient } from '@/lib/supabase/client';
import L from 'leaflet';

interface RoutePolylineProps {
  startLat: number; startLng: number; endLat: number; endLng: number; color: string;
  job: any; tech: any;
}

export default function RoutePolyline({ startLat, startLng, endLat, endLng, color, job, tech }: RoutePolylineProps) {
  const polylineRef = useRef<L.Polyline>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  
  // LOCK ORIGIN: Prevents route recalculation while driving
  const [origin] = useState({ lat: startLat, lng: startLng });

  useEffect(() => {
    async function fetchRoute() {
      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${endLng},${endLat}?overview=full&geometries=geojson`);
        const data = await res.json();
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          setRouteCoords(coords);
        } else {
          setRouteCoords([[origin.lat, origin.lng], [endLat, endLng]]);
        }
      } catch (error) { setRouteCoords([[origin.lat, origin.lng], [endLat, endLng]]); }
    }
    fetchRoute();
  }, [origin.lat, origin.lng, endLat, endLng]);

  // The Dash Animation
  useEffect(() => {
    if (routeCoords.length === 0) return;
    const timeout = setTimeout(() => {
      if (polylineRef.current) {
        const pathElement = polylineRef.current.getElement();
        if (pathElement && pathElement.animate) {
          pathElement.animate(
            [{ strokeDashoffset: '0' }, { strokeDashoffset: '-1000' }],
            { duration: 30000, iterations: Infinity, easing: 'linear' }
          );
        }
      }
    }, 150);
    return () => clearTimeout(timeout);
  }, [routeCoords]);

  // THE PHYSICS ENGINE
  useEffect(() => {
    const handleSimulate = async (e: any) => {
      if (e.detail.id !== job.id) return;
      if (routeCoords.length === 0) return;

      const supabase = createClient();
      console.log("🏎️ Simulation Engine Engaged!");

      // Step 1: Fire Blue SMS and update DB
      window.dispatchEvent(new CustomEvent('TRIGGER_SMS', { detail: { type: 'en_route', customerName: job.customer_name } }));
      await supabase.from('jobs').update({ status: 'en_route', updated_at: new Date().toISOString() }).eq('id', job.id);

      // Step 2: Drive Sequence (60FPS DOM Bypass via React State)
      const steps = routeCoords.length;
      const totalSimulationTimeMs = 5000; 
      const delayPerFrame = totalSimulationTimeMs / steps;

      for (let i = 0; i < steps; i++) {
        const [lat, lng] = routeCoords[i];
        window.dispatchEvent(new CustomEvent('MOVE_MARKER', { detail: { techId: tech.id, lat, lng } }));
        await new Promise(resolve => setTimeout(resolve, delayPerFrame));
      }

      console.log("✅ Destination reached. Working...");
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Complete Job and fire Green SMS
      window.dispatchEvent(new CustomEvent('TRIGGER_SMS', { detail: { type: 'completed', customerName: job.customer_name } }));
      await supabase.from('jobs').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', job.id);
    };

    window.addEventListener('START_SIMULATION', handleSimulate);
    return () => window.removeEventListener('START_SIMULATION', handleSimulate);
  }, [routeCoords, job, tech]);

  if (routeCoords.length === 0) return null;

  return (
    <Polyline 
      ref={polylineRef}
      positions={routeCoords} 
      pathOptions={{ color: color, weight: 4, opacity: 0.8, dashArray: '12, 12', lineCap: 'round' }} 
    />
  );
}