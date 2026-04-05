'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents } from 'react-leaflet'; // <-- ADDED useMapEvents
import { useDroppable } from '@dnd-kit/core';
import RoutePolyline from './RoutePolyline';
import { useRealtimeJobs } from '@/hooks/useRealtimeJobs';
import { useTheme } from '@/components/layout/ThemeProvider';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 1. THE NEW INTERACTION HANDLER
// This invisibly listens to the map canvas and fires the global close event
function MapInteractionHandler() {
  useMapEvents({
    dragstart: () => window.dispatchEvent(new CustomEvent('HIDE_BOARD')),
    click: () => window.dispatchEvent(new CustomEvent('HIDE_BOARD')),
  });
  return null;
}

// 1. THE MARKER FIX: Accept setSelectedTech and strip the Popup
function TechMarker({ tech, accent, isDark, setSelectedTech }: { tech: any, accent: string, isDark: boolean, setSelectedTech: (tech: any) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: tech.id });

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
    <Marker 
      position={[tech.current_lat, tech.current_lng]} 
      icon={techIcon}
      // 2. THE TRIGGER: Open the Slide-Over when clicked!
      eventHandlers={{
        click: () => setSelectedTech(tech)
      }}
    >
      {/* Notice the Popup is completely gone, but the dropzone Tooltip stays perfectly intact */}
      <Tooltip permanent direction="center" className="custom-drop-zone-tooltip">
        <div
          ref={setNodeRef}
          className="w-20 h-20 rounded-full transition-all duration-300 flex items-center justify-center backdrop-blur-[1px]"
          style={{
            backgroundColor: isOver ? `${accent}4D` : 'transparent',
            borderColor: isOver ? accent : `${accent}80`,
            borderWidth: '2px',
            borderStyle: isOver ? 'solid' : 'dashed',
            transform: isOver ? 'scale(1.05)' : 'scale(1)'
          }}
        />
      </Tooltip>
    </Marker>
  );
}

// 3. THE MAP FIX: Accept setSelectedTech and pass it to the loop
export default function DispatchMap({ setSelectedTech }: { setSelectedTech: (tech: any) => void }) {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const { jobs } = useRealtimeJobs(); 
  const { isDark, accent } = useTheme(); 

  useEffect(() => {
    async function fetchTechs() {
      try {
        const res = await fetch('/api/technicians');
        const data = await res.json();
        setTechnicians(data);
      } catch (error) { console.error(error); }
    }
    fetchTechs();

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
  const tileUrl = isDark 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%', zIndex: 10 }} zoomControl={false}>
      <MapInteractionHandler /> {/* <-- ADDED THIS LINE HERE */}
      <TileLayer key={tileUrl} url={tileUrl} />
      
      {technicians.map((tech) => (
        <TechMarker 
          key={tech.id} 
          tech={tech} 
          accent={accent} 
          isDark={isDark} 
          setSelectedTech={setSelectedTech} // Passed down to the marker
        />
      ))}

      {activeRoutes.map(({ tech, job }) => (
        <RoutePolyline 
          key={job.id} 
          job={job}   
          tech={tech} 
          startLat={tech.current_lat} startLng={tech.current_lng} 
          endLat={job.lat} endLng={job.lng} 
          color={accent}
        />
      ))}
    </MapContainer>
  );
}