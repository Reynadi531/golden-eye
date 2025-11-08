import { useList } from "@/hooks/useList";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import { Icon } from "leaflet";

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
      return "http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}";
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

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full bg-gray-200 dark:bg-gray-900">
      <MapContainer
        center={data?.data?.center ? [data.data.center.lat, data.data.center.lon] : [-6.930587, 107.616096]}
        zoom={14}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          key={isSatellite ? "satellite" : (isDark ? "dark" : "light")}
          url={tileLayerUrl}
          attribution={getAttribution()}
        />
        {data?.data?.items.map((item, key) => (
          <Marker key={key} position={[item.lat, item.lon]} icon={new Icon({ iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41] })}>
            <Popup>
              <p className="text-md font-bold">{item.location}</p>
              <p>{item.lat}, {item.lon}</p>
              <img src={item.imagePath} alt="Location" className="mt-2 rounded-md" />
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
