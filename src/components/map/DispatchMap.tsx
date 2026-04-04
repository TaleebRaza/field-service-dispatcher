'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import { useDroppable } from '@dnd-kit/core';
import RoutePolyline from './RoutePolyline';
import { useRealtimeJobs } from '@/hooks/useRealtimeJobs';
import { useTheme } from '@/components/layout/ThemeProvider'; // <-- Import Theme
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

function TechMarker({ tech, accent, isDark }: { tech: any, accent: string, isDark: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: tech.id });

  // Dynamically generate the icon HTML so it uses the chosen accent color
  const techIcon = L.divIcon({
    className: 'clear-marker-styles',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <span class="absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping" style="background-color: ${accent};"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 border-2" style="background-color: ${accent}; border-color: ${isDark ? '#0d0f11' : '#ffffff'};"></span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <Marker position={[tech.current_lat, tech.current_lng]} icon={techIcon}>
      <Popup>
        <div className="font-sans">
          <p className="font-bold text-sm m-0" style={{ color: 'var(--text-main)' }}>{tech.profiles?.full_name}</p>
          <p className="text-[10px] uppercase font-mono mt-1 m-0" style={{ color: accent }}>{tech.status.replace('_', ' ')}</p>
        </div>
      </Popup>
      
      <Tooltip permanent direction="center" className="custom-drop-zone-tooltip">
        <div
          ref={setNodeRef}
          className="w-20 h-20 rounded-full transition-all duration-300 flex items-center justify-center backdrop-blur-[1px]"
          style={{
            // Apply dynamic accent color to the Drop Zone Radar!
            backgroundColor: isOver ? `${accent}4D` : 'transparent', // 4D = ~30% opacity
            borderColor: isOver ? accent : `${accent}80`, // 80 = 50% opacity
            borderWidth: '2px',
            borderStyle: isOver ? 'solid' : 'dashed',
            transform: isOver ? 'scale(1.05)' : 'scale(1)'
          }}
        />
      </Tooltip>
    </Marker>
  );
}

export default function DispatchMap() {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const { jobs } = useRealtimeJobs(); 
  const { isDark, accent } = useTheme(); // <-- Consume Theme

  useEffect(() => {
    async function fetchTechs() {
      try {
        const res = await fetch('/api/technicians');
        const data = await res.json();
        setTechnicians(data);
      } catch (error) { console.error(error); }
    }
    fetchTechs();

    // THE NATIVE REACT MOVEMENT RECEIVER
    const handleMove = (e: any) => {
      const { techId, lat, lng } = e.detail;
      setTechnicians(prev => prev.map(t => 
        t.id === techId ? { ...t, current_lat: lat, current_lng: lng } : t
      ));
    };

    window.addEventListener('MOVE_MARKER', handleMove);
    return () => window.removeEventListener('MOVE_MARKER', handleMove);
  }, []);

  const activeRoutes = jobs
    .filter(j => ['in_progress', 'en_route'].includes(j.status) && j.assigned_to)
    .map(job => {
      const tech = technicians.find(t => t.id === job.assigned_to);
      return { job, tech };
    })
    .filter(route => route.tech !== undefined);

  const center: [number, number] = [33.7744, 72.7128];

  // Dynamically swap map tiles based on Light/Dark mode
  const tileUrl = isDark 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%', zIndex: 10 }} zoomControl={false}>
      <TileLayer key={tileUrl} url={tileUrl} />
      
      {technicians.map((tech) => (
        <TechMarker key={tech.id} tech={tech} accent={accent} isDark={isDark} />
      ))}

      {activeRoutes.map(({ tech, job }) => (
        <RoutePolyline 
          key={job.id} 
          job={job}   // PASS FULL JOB
          tech={tech} // PASS FULL TECH
          startLat={tech.current_lat} startLng={tech.current_lng} 
          endLat={job.lat} endLng={job.lng} 
          color={accent}
        />
      ))}
    </MapContainer>
  );
}