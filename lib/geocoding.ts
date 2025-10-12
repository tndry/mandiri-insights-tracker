export interface Coordinates {
  lat: number
  lng: number
}

// Sample coordinates for Bogor area (Bank Mandiri branch location)
const BOGOR_CENTER: Coordinates = { lat: -6.5971, lng: 106.806 }

// Generate random coordinates around Bogor for demo purposes
export function generateCoordinatesFromAddress(address: string): Coordinates {
  // Create a simple hash from address to ensure consistent coordinates
  let hash = 0
  for (let i = 0; i < address.length; i++) {
    const char = address.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Use hash to generate consistent but random-looking coordinates within Bogor area
  const latOffset = ((hash % 1000) / 10000) * 0.1 // ±0.01 degrees (~1km)
  const lngOffset = (((hash >> 10) % 1000) / 10000) * 0.1

  return {
    lat: BOGOR_CENTER.lat + latOffset,
    lng: BOGOR_CENTER.lng + lngOffset,
  }
}

export function getGoogleMapsDirectionsUrl(coordinates: Coordinates | null): string {
  if (!coordinates) {
    // Mengembalikan link ke lokasi default jika koordinat tidak ada
    return `https://www.google.com/maps`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
}

// In a real implementation, you would use a geocoding service like:
// - Google Maps Geocoding API
// - OpenStreetMap Nominatim
// - Mapbox Geocoding API
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  // For MVP, return generated coordinates
  // In production, implement actual geocoding API call
  return generateCoordinatesFromAddress(address)
}
