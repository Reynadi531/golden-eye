import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";

const MapsLoader: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(false);

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

  const tileLayerUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="h-[calc(100vh-4rem)] w-full bg-gray-200 dark:bg-gray-900">
      <MapContainer
        center={[-6.930587, 107.616096]}
        zoom={10}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          key={isDark ? "dark" : "light"}
          url={tileLayerUrl}
          attribution='&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    </div>
  );
};

export default MapsLoader;
