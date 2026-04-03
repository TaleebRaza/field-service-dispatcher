/**
 * Fetches a driving route between two points using the free OSRM public API.
 * Note: OSRM expects coordinates in [longitude, latitude] order.
 */
export async function getRoute(startLat: number, startLng: number, endLat: number, endLng: number) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch route');
    
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      // OSRM returns GeoJSON coordinates as [longitude, latitude]
      // Leaflet requires [latitude, longitude], so we must map and reverse them
      const coordinates = data.routes[0].geometry.coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
      );
      
      return {
        coordinates,
        distance: data.routes[0].distance, // in meters
        duration: data.routes[0].duration, // in seconds
      };
    }
    return null;
  } catch (error) {
    console.error("OSRM Routing Error:", error);
    return null;
  }
}