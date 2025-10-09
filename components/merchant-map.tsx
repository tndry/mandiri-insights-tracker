"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import MarkerClusterGroup from "react-leaflet-markercluster"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Map, MapPin, Navigation, Phone, Building } from "lucide-react"
import { useMerchants } from "@/contexts/merchant-context"
import type { MerchantData } from "@/lib/types"
import { generateCoordinatesFromAddress, getGoogleMapsDirectionsUrl, type Coordinates } from "@/lib/geocoding"

// Import leaflet fix dinamis untuk client-side only
if (typeof window !== "undefined") {
  import("@/lib/leaflet-fix");
}

// ...existing code...

interface MerchantMarker {
  merchant: MerchantData
  coordinates: Coordinates
  hasEDC: boolean
}

// Helper component to get map instance
function MapInstanceHandler({ setMap, selectedMerchant }: { setMap: (map: any) => void, selectedMerchant: MerchantData | null }) {
  const map = useMap();
  
  useEffect(() => {
    setMap(map);
  }, [map, setMap]);

  useEffect(() => {
    if (selectedMerchant && map) {
      const coords = generateCoordinatesFromAddress(selectedMerchant.alamat || "Bogor");
      if (coords) {
        map.flyTo([coords.lat, coords.lng], 20);
      }
    }
  }, [selectedMerchant, map]);

  return null;
}

export function MerchantMap() {
  const { filteredMerchants, hoveredMerchantId, selectedMerchant } = useMerchants()
  const [merchantMarkers, setMerchantMarkers] = useState<MerchantMarker[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [map, setMap] = useState<any>(null)

  // Load Leaflet CSS and create custom icons
  useEffect(() => {
    setLeafletLoaded(true);
  }, []);

  // Process merchants and generate coordinates
  useEffect(() => {
    if (filteredMerchants.length > 0) {
      setIsLoading(true)

      const processedMarkers: MerchantMarker[] = filteredMerchants.map((merchant) => ({
        merchant,
        coordinates: generateCoordinatesFromAddress(merchant.alamat || "Bogor"),
        hasEDC: !!(merchant["tgl pasang edc"] && merchant["tgl pasang edc"].trim() !== ""),
      }))

      setMerchantMarkers(processedMarkers)
      setIsLoading(false)
    } else {
      setMerchantMarkers([])
    }
  }, [filteredMerchants])

  useEffect(() => {
    if (map) {
      setTimeout(() => {
        try {
          map.invalidateSize();
        } catch (e) {
          // ignore error if map is not ready
        }
      }, 100);
    }
  }, [map, merchantMarkers]);

  if (!leafletLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Merchant Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading map...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredMerchants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Merchant Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Upload merchant data to view locations on map</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  

  // ...existing code...

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Merchant Locations ({merchantMarkers.length})
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>With EDC ({merchantMarkers.filter((m) => m.hasEDC).length})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Without EDC ({merchantMarkers.filter((m) => !m.hasEDC).length})</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Processing merchant locations...</p>
            </div>
          </div>
        ) : (
          <div className="h-96 rounded-lg overflow-hidden border">
            <MapContainer
              center={[-6.5971, 106.806]}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
              className="z-0"
            >
              <MapInstanceHandler setMap={setMap} selectedMerchant={selectedMerchant} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <MarkerClusterGroup>
                {merchantMarkers.map((markerData, index) => {
                  // Create custom icon using leaflet's L.icon
                  const customIcon = L.icon({
                    iconUrl:
                      markerData.merchant.mid_new === hoveredMerchantId || markerData.merchant.mid_new === selectedMerchant?.mid_new
                        ? "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDRMMTcuODUgMTIuMzZMMjYgMTMuNUwxNy44NSAyMS42NEwxNiAzMkwxNC4xNSAyMS42NEw2IDEzLjVMMTQuMTUgMTIuMzZMMTYgNFoiIGZpbGw9IiMwMDY2ZGIiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPgo="
                        : markerData.hasEDC
                        ? "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMTBiOTgxIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K"
                        : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjZWYzNDM4IiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K",
                    iconSize: markerData.merchant.mid_new === hoveredMerchantId || markerData.merchant.mid_new === selectedMerchant?.mid_new ? [32, 32] : [24, 24],
                    iconAnchor: markerData.merchant.mid_new === hoveredMerchantId || markerData.merchant.mid_new === selectedMerchant?.mid_new ? [16, 32] : [12, 24],
                    popupAnchor: [0, -24],
                  });
                 
                  return (
                    <Marker
                      key={`${markerData.merchant.mid_new}-${index}`}
                      position={[markerData.coordinates.lat, markerData.coordinates.lng]}
                      icon={customIcon}
                    >
                      <Popup>
                        <div className="max-h-64 overflow-y-auto p-1">
                          <div className="p-2 space-y-3">
                            <div className="border-b pb-2">
                              <h3 className="font-semibold text-base text-gray-900">
                                {markerData.merchant.merchantofficialname || markerData.merchant.commonname}
                              </h3>
                              <Badge variant={markerData.hasEDC ? "default" : "destructive"} className="mt-1">
                                {markerData.hasEDC ? "EDC Installed" : "No EDC"}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-start gap-2">
                                <Building className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">{markerData.merchant.merchantofficialname}</p>
                                  <p className="text-gray-600">{markerData.merchant.alamat}</p>
                                </div>
                              </div>
                              {markerData.merchant.contactperson && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-500" />
                                  <span>{markerData.merchant.contactperson}</span>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="font-medium">Segment:</span>
                                  <br />
                                  {markerData.merchant.segmen}
                                </div>
                                <div>
                                  <span className="font-medium">Area:</span>
                                  <br />
                                  {markerData.merchant.cd_cbg}
                                </div>
                              </div>
                              {markerData.hasEDC && (
                                <div className="text-xs">
                                  <span className="font-medium">EDC Count:</span> {markerData.merchant["jml edc"] || "N/A"}
                                  <br />
                                  <span className="font-medium">Install Date:</span> {markerData.merchant["tgl pasang edc"]}
                                </div>
                              )}
                            </div>
                            <div className="pt-2 border-t">
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  const url = getGoogleMapsDirectionsUrl(markerData.coordinates)
                                  window.open(url, "_blank")
                                }}
                              >
                                <Navigation className="w-4 h-4 mr-2" />
                                Get Directions
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MarkerClusterGroup>
            </MapContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
