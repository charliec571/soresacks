import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { courseData } from '../data/courseData';
import { HoleData, GPSCoord } from '../types';
import { NavigationIcon, MapPinIcon, InfoIcon } from './Icons';

interface CaddieMapProps {
  currentHoleNumber: number;
  onSelectHole: (holeNumber: number) => void;
}

// Haversine formula to compute distance in feet
function calculateDistanceFt(coord1: GPSCoord, coord2: GPSCoord): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (coord1.lat * Math.PI) / 180;
  const phi2 = (coord2.lat * Math.PI) / 180;
  const deltaPhi = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLambda = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const meters = R * c;
  return Math.round(meters * 3.28084);
}

export const CaddieMap: React.FC<CaddieMapProps> = ({ currentHoleNumber, onSelectHole }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const activeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [userLocation, setUserLocation] = useState<GPSCoord | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isTrackingGps, setIsTrackingGps] = useState<boolean>(false);
  const [mapType, setMapType] = useState<'satellite' | 'street'>('satellite');

  const currentHole: HoleData =
    courseData.holes.find((h) => h.number === currentHoleNumber) || courseData.holes[0];

  // Calculate distance from user to current basket
  const distanceToBasket = userLocation
    ? calculateDistanceFt(userLocation, currentHole.basket)
    : null;

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [courseData.propertyCoordinates.lat, courseData.propertyCoordinates.lng],
      zoom: 18,
      maxZoom: 21,
      minZoom: 16,
      zoomControl: false
    });

    // Satellite imagery tiles (Esri World Imagery)
    const satTiles = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Esri, Maxar, Earthstar Geographics',
        maxZoom: 21
      }
    );

    const streetTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 20
    });

    satTiles.addTo(map);
    mapRef.current = map;

    // Leaflet needs a moment after the DOM is visible to compute dimensions
    setTimeout(() => map.invalidateSize(), 50);

    // Zoom controls in top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    const activeGroup = L.layerGroup().addTo(map);
    activeLayerGroupRef.current = activeGroup;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map tiles when mapType changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current?.removeLayer(layer);
      }
    });

    if (mapType === 'satellite') {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 21 }
      ).addTo(mapRef.current);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}.png', { maxZoom: 20 }).addTo(
        mapRef.current
      );
    }
  }, [mapType]);

  // Render course markers and active hole path
  const renderCourseLayers = useCallback(() => {
    const map = mapRef.current;
    const activeGroup = activeLayerGroupRef.current;
    if (!map || !activeGroup) return;

    activeGroup.clearLayers();

    // 1. Draw inactive flight paths dimly for course context
    courseData.holes.forEach((hole) => {
      if (hole.number === currentHoleNumber) return;

      const pathCoords: [number, number][] = [
        [hole.tee.lat, hole.tee.lng],
        ...hole.doglegs.map((d) => [d.lat, d.lng] as [number, number]),
        [hole.basket.lat, hole.basket.lng]
      ];

      L.polyline(pathCoords, {
        color: '#ffffff',
        weight: 2,
        opacity: 0.25,
        dashArray: '4, 8'
      }).addTo(activeGroup);
    });

    // 2. Draw 3 Physical Axiom Lite Baskets
    courseData.baskets.forEach((b) => {
      const isCurrentTarget = currentHole.basket.basketNumber === b.basketNumber;

      const basketIconHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer">
          <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform ${
            isCurrentTarget
              ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 scale-125 ring-4 ring-emerald-400 ring-opacity-70 animate-pulse'
              : 'bg-emerald-800 bg-opacity-90 border border-emerald-400 border-opacity-40'
          }">
            <span class="text-white text-xs font-black">B${b.basketNumber}</span>
          </div>
          <div class="mt-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white whitespace-nowrap shadow">
            Basket ${b.basketNumber}
          </div>
        </div>
      `;

      const customBasketIcon = L.divIcon({
        html: basketIconHtml,
        className: 'custom-basket-marker',
        iconSize: [36, 48],
        iconAnchor: [18, 20]
      });

      const marker = L.marker([b.lat, b.lng], { icon: customBasketIcon });
      marker.bindPopup(`
        <div class="p-2 text-neutral-900">
          <p class="font-bold text-sm text-emerald-800">Basket ${b.basketNumber}</p>
          <p class="text-xs text-neutral-600 font-semibold">${b.model}</p>
          <p class="text-xs text-neutral-500 mt-1">Serves Holes: <span class="font-bold text-emerald-700">${b.servesHoles.join(', ')}</span></p>
        </div>
      `);
      marker.addTo(activeGroup);
    });

    // 3. Draw All Tees (Current tee highlighted)
    courseData.holes.forEach((hole) => {
      const isCurrentTee = hole.number === currentHoleNumber;

      const teeIconHtml = `
        <div class="relative flex flex-col items-center cursor-pointer">
          <div class="w-7 h-7 rounded-md flex items-center justify-center shadow-lg ${
            isCurrentTee
              ? 'bg-gradient-to-tr from-orange-500 to-amber-400 scale-125 ring-4 ring-orange-400 ring-opacity-70 font-black'
              : 'bg-neutral-800/90 border border-orange-400/40 text-neutral-300'
          }">
            <span class="text-white text-[11px] font-bold">T${hole.number}</span>
          </div>
        </div>
      `;

      const customTeeIcon = L.divIcon({
        html: teeIconHtml,
        className: 'custom-tee-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([hole.tee.lat, hole.tee.lng], { icon: customTeeIcon });
      marker.on('click', () => onSelectHole(hole.number));
      marker.addTo(activeGroup);
    });

    // 4. Draw Active Hole Flight Path (Glowing vibrant line)
    const activePathCoords: [number, number][] = [
      [currentHole.tee.lat, currentHole.tee.lng],
      ...currentHole.doglegs.map((d) => [d.lat, d.lng] as [number, number]),
      [currentHole.basket.lat, currentHole.basket.lng]
    ];

    // Background glow
    L.polyline(activePathCoords, {
      color: '#ea5826',
      weight: 8,
      opacity: 0.35,
      lineCap: 'round'
    }).addTo(activeGroup);

    // Primary fairway flight line
    L.polyline(activePathCoords, {
      color: '#f4b340',
      weight: 4,
      opacity: 0.95,
      dashArray: '6, 8',
      lineCap: 'round'
    }).addTo(activeGroup);

    // Dogleg turn indicator if present
    currentHole.doglegs.forEach((dogleg, idx) => {
      const doglegIcon = L.divIcon({
        html: `<div class="w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-md"></div>`,
        className: 'dogleg-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      L.marker([dogleg.lat, dogleg.lng], { icon: doglegIcon })
        .bindPopup(`<span class="text-xs font-bold text-neutral-800">Dogleg Turn ${idx + 1}</span>`)
        .addTo(activeGroup);
    });

    // Fit bounds to show current tee and basket
    const bounds = L.latLngBounds(activePathCoords);
    map.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: 19,
      animate: true
    });
  }, [currentHoleNumber, currentHole, onSelectHole]);

  useEffect(() => {
    renderCourseLayers();
  }, [renderCourseLayers]);

  // GPS Rangefinder Tracking
  const toggleGps = () => {
    if (isTrackingGps) {
      setIsTrackingGps(false);
      return;
    }

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsError(null);
    setIsTrackingGps(true);

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const userCoord: GPSCoord = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setUserLocation(userCoord);

        if (mapRef.current) {
          if (!userMarkerRef.current) {
            const userIcon = L.divIcon({
              html: `
                <div class="relative flex items-center justify-center">
                  <div class="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-xl animate-pulse"></div>
                  <div class="absolute w-10 h-10 rounded-full bg-blue-400 opacity-30 animate-ping"></div>
                </div>
              `,
              className: 'user-gps-marker',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
            userMarkerRef.current = L.marker([userCoord.lat, userCoord.lng], {
              icon: userIcon
            }).addTo(mapRef.current);
          } else {
            userMarkerRef.current.setLatLng([userCoord.lat, userCoord.lng]);
          }
        }
      },
      (err) => {
        console.warn('GPS error:', err);
        setGpsError('Could not acquire GPS position. Check permissions.');
        setIsTrackingGps(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  };

  const centerOnHole = () => {
    if (!mapRef.current) return;
    const activePathCoords: [number, number][] = [
      [currentHole.tee.lat, currentHole.tee.lng],
      ...currentHole.doglegs.map((d) => [d.lat, d.lng] as [number, number]),
      [currentHole.basket.lat, currentHole.basket.lng]
    ];
    mapRef.current.fitBounds(L.latLngBounds(activePathCoords), {
      padding: [60, 60],
      maxZoom: 19
    });
  };

  const centerOnUser = () => {
    if (!mapRef.current || !userLocation) return;
    mapRef.current.setView([userLocation.lat, userLocation.lng], 19);
  };

  return (
    <div
      style={{ height: 'calc(100dvh - 112px)' }}
      className="relative w-full flex flex-col bg-[#0c1f24] overflow-hidden"
    >
      {/* Top Rangefinder & Hole Info Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="bg-[#132d34]/95 backdrop-blur-md border border-[#f6eedb]/15 rounded-2xl p-3 shadow-2xl flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#ea5826] to-[#f4b340] flex flex-col items-center justify-center text-white shadow-md">
              <span className="text-[10px] font-extrabold uppercase tracking-wider leading-none">Hole</span>
              <span className="text-xl font-black leading-tight">{currentHole.number}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-[#f6eedb]">Par {currentHole.par}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#ea5826]/20 text-[#ea5826] text-xs font-bold border border-[#ea5826]/30">
                  {currentHole.distanceFt} ft
                </span>
                {currentHole.isSafari && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                    Safari
                  </span>
                )}
              </div>
              <p className="text-xs text-[#d1dfdb]/80 flex items-center gap-1 mt-0.5">
                Target: <span className="text-emerald-400 font-semibold">{currentHole.basket.name}</span>
                <span className="text-[10px] text-neutral-400">({currentHole.basket.color})</span>
              </p>
            </div>
          </div>

          {/* GPS Rangefinder Badge */}
          <div className="flex flex-col items-end">
            {distanceToBasket !== null ? (
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">To Pin</span>
                <div className="text-xl font-black text-[#5cc2d3] flex items-center gap-1">
                  <NavigationIcon size={16} className="text-[#5cc2d3] animate-pulse" />
                  <span>{distanceToBasket} ft</span>
                </div>
              </div>
            ) : (
              <button
                onClick={toggleGps}
                className="px-3 py-1.5 rounded-xl bg-[#5cc2d3]/20 hover:bg-[#5cc2d3]/30 border border-[#5cc2d3]/40 text-[#5cc2d3] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <NavigationIcon size={14} />
                <span>GPS Range</span>
              </button>
            )}
          </div>
        </div>

        {/* GPS Error Alert */}
        {gpsError && (
          <div className="bg-rose-900/90 border border-rose-500 text-rose-100 text-xs px-3 py-1.5 rounded-xl flex items-center justify-between shadow-lg pointer-events-auto">
            <span>{gpsError}</span>
            <button onClick={() => setGpsError(null)} className="ml-2 font-bold text-rose-300">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Action Floating Controls */}
      <div className="absolute right-3 bottom-24 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => setMapType(mapType === 'satellite' ? 'street' : 'satellite')}
          title="Toggle Satellite / Street Map"
          className="w-10 h-10 rounded-xl bg-[#132d34]/90 hover:bg-[#193840] border border-[#f6eedb]/20 text-[#f6eedb] flex items-center justify-center shadow-lg transition-transform active:scale-95"
        >
          <span className="text-[10px] font-black uppercase tracking-tight">
            {mapType === 'satellite' ? 'SAT' : 'MAP'}
          </span>
        </button>

        <button
          onClick={centerOnHole}
          title="Recenter on Current Hole"
          className="w-10 h-10 rounded-xl bg-[#132d34]/90 hover:bg-[#193840] border border-[#f6eedb]/20 text-[#ea5826] flex items-center justify-center shadow-lg transition-transform active:scale-95"
        >
          <MapPinIcon size={18} />
        </button>

        <button
          onClick={toggleGps}
          title={isTrackingGps ? 'GPS Tracking Active' : 'Start GPS Tracking'}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
            isTrackingGps
              ? 'bg-[#5cc2d3] text-neutral-900 border-[#5cc2d3]'
              : 'bg-[#132d34]/90 text-[#d1dfdb] border-[#f6eedb]/20'
          }`}
        >
          <NavigationIcon size={18} />
        </button>

        {userLocation && (
          <button
            onClick={centerOnUser}
            title="Center on My Location"
            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 border border-blue-400 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
          >
            <span className="text-[10px] font-black">ME</span>
          </button>
        )}
      </div>

      {/* Bottom Hole Selector Carousel */}
      <div className="absolute bottom-2 left-2 right-2 z-[1000] bg-[#132d34]/95 backdrop-blur-md border border-[#f6eedb]/15 rounded-2xl p-2 shadow-2xl">
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {courseData.holes.map((h) => {
            const isSelected = h.number === currentHoleNumber;
            return (
              <button
                key={h.number}
                onClick={() => onSelectHole(h.number)}
                className={`flex-1 min-w-[58px] py-1.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-gradient-to-tr from-[#ea5826] to-[#f4b340] text-white font-extrabold shadow-lg scale-105 ring-2 ring-[#ea5826]/50'
                    : 'bg-[#0c1f24]/70 hover:bg-[#193840] text-[#d1dfdb] border border-white/5'
                }`}
              >
                <span className="text-xs font-black leading-none">H{h.number}</span>
                <span className="text-[9px] opacity-80 mt-0.5 leading-none">
                  P{h.par} • {h.distanceFt}'
                </span>
              </button>
            );
          })}
        </div>

        {/* Hole Notes Subtitle */}
        <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px] text-[#d1dfdb]/90 px-1">
          <div className="truncate flex items-center gap-1.5">
            <InfoIcon size={13} className="text-[#f4b340] flex-shrink-0" />
            <span className="truncate">{currentHole.notes}</span>
          </div>
          <span className="flex-shrink-0 font-bold text-[#f4b340] ml-2">
            Axiom Lite (B{currentHole.basket.basketNumber})
          </span>
        </div>
      </div>
    </div>
  );
};
