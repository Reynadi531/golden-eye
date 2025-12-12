import { useList } from "@/hooks/useList";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, GeoJSON, useMap } from "react-leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import { Icon, LatLngBounds } from "leaflet";

const FitBoundsToGeoJSON: React.FC<{ data: unknown }> = ({ data }) => {
  const map = useMap();
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!data || hasAnimated) return;

    const bounds = new LatLngBounds([]);

    const addCoordinates = (coords: number[] | number[][]) => {
      if (Array.isArray(coords[0])) {
        (coords as number[][]).forEach((coord) => addCoordinates(coord));
      } else {
        const [lng, lat] = coords as number[];
        bounds.extend([lat, lng]);
      }
    };

    if (data && typeof data === 'object' && 'features' in data) {
      const geoData = data as { features?: Array<{ geometry?: { coordinates?: unknown } }> };
      geoData.features?.forEach((feature) => {
        if (feature.geometry?.coordinates) {
          addCoordinates(feature.geometry.coordinates as number[] | number[][]);
        }
      });
    }

    if (bounds.isValid()) {
      // First show all of Indonesia
      map.setView([-2.5, 118], 5, { animate: false });
      
      // Then zoom to GeoJSON bounds after a short delay
      setTimeout(() => {
        map.flyToBounds(bounds, { 
          padding: [50, 50],
          duration: 2.5
        });
        setHasAnimated(true);
      }, 500);
    }
  }, [data, map, hasAnimated]);

  return null;
};

const MapsLoader: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isSatellite, setIsSatellite] = useState<boolean>(true);
  const {data} = useList();

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setIsDark(document.documentElement.classList.contains("dark"));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const getTileLayerUrl = () => {
    if (isSatellite) {
      // return "http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}";
      return "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}";
    }
    return isDark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  };

  const tileLayerUrl = getTileLayerUrl();

  const getAttribution = () => {
    if (isSatellite) {
      return '&copy; <a href="https://www.google.com/maps">Google Maps</a>';
    }
    return '&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors';
  };

  const [geoJsonData, setGeoJsonData] = useState(null);

  useEffect(() => {
    fetch('/tnks.geojson')
      .then(response => response.json())
      .then(data => setGeoJsonData(data))
      .catch(error => console.error('Error loading GeoJSON data:', error));
  }, []);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full bg-gray-200 dark:bg-gray-900">
      <MapContainer
        center={[-2.336230033294256, 101.67855424008344]}
        zoom={8}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          key={isSatellite ? "satellite" : (isDark ? "dark" : "light")}
          url={tileLayerUrl}
          attribution={getAttribution()}
        />
        {(geoJsonData && import.meta.env.VITE_BOUNDERIES_ENABLED === "true")  && (
          <>
            <GeoJSON data={geoJsonData} style={{ color: isDark ? '#ffffff' : '#000000', weight: 2, fillOpacity: 0.1 }} />
            <FitBoundsToGeoJSON data={geoJsonData} />
          </>
        )}
        {data?.data?.items.map((item, key) => (
          <Marker key={key} position={[item.lat, item.lon]} icon={new Icon({ iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41] })}>
            <Popup>
              <p className="text-md font-bold">{item.location}</p>
              <p>{item.lat}, {item.lon}</p>
              {item.imagePath.length < 2 ? (
                <img src={item.imagePath[0]} alt="Location" className="mt-2 rounded-md" />
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {item.imagePath.map((imgUrl, idx) => (
                    <img key={idx} src={imgUrl} alt={`Location ${idx + 1}`} className="rounded-md" />
                  ))}
                </div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <button
        onClick={() => setIsSatellite(!isSatellite)}
        className="absolute top-4 left-4 z-[1000] bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-300 dark:border-gray-700 font-medium"
        title={isSatellite ? "Switch to Map View" : "Switch to Satellite View"}
      >
        {isSatellite ? (
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Map
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Satellite
          </span>
        )}
      </button>
    </div>
  );
};

export default MapsLoader;