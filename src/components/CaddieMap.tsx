import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { courseData } from '../data/courseData';
import { HoleData, GPSCoord, Round } from '../types';
import { NavigationIcon, MapPinIcon, InfoIcon, DiscIcon, UsersIcon } from './Icons';
import { syncService } from '../services/syncService';

interface CaddieMapProps {
  currentHoleNumber: number;
  onSelectHole: (holeNumber: number) => void;
  round?: Round | null;
  onOpenThrowTracker?: () => void;
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

export const CaddieMap: React.FC<CaddieMapProps> = ({
  currentHoleNumber,
  onSelectHole,
  round,
  onOpenThrowTracker
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const activeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const playerLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [viewMode, setViewMode] = useState<'hole' | 'all'>('hole');
  const [userLocation, setUserLocation] = useState<GPSCoord | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isTrackingGps, setIsTrackingGps] = useState<boolean>(false);
  const [mapType, setMapType] = useState<'satellite' | 'street'>('satellite');

  const lastBroadcastRef = useRef<number>(0);

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

    satTiles.addTo(map);
    mapRef.current = map;

    // Leaflet needs a moment after the DOM is visible to compute dimensions
    setTimeout(() => map.invalidateSize(), 50);

    // Zoom controls in top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    const activeGroup = L.layerGroup().addTo(map);
    activeLayerGroupRef.current = activeGroup;

    const playerGroup = L.layerGroup().addTo(map);
    playerLayerGroupRef.current = playerGroup;

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

  // Render course markers and flight paths based on viewMode
  const renderCourseLayers = useCallback(() => {
    const map = mapRef.current;
    const activeGroup = activeLayerGroupRef.current;
    if (!map || !activeGroup) return;

    activeGroup.clearLayers();

    const isAllMode = viewMode === 'all';

    // 1. Draw Fairways / Flight Paths
    courseData.holes.forEach((hole) => {
      const isCurrentHole = hole.number === currentHoleNumber;

      const pathCoords: [number, number][] = [
        [hole.tee.lat, hole.tee.lng],
        ...hole.doglegs.map((d) => [d.lat, d.lng] as [number, number]),
        [hole.basket.lat, hole.basket.lng]
      ];

      if (isCurrentHole) {
        // Glowing background for active hole
        L.polyline(pathCoords, {
          color: '#10b981',
          weight: 8,
          opacity: 0.35,
          lineCap: 'round'
        }).addTo(activeGroup);

        // Vibrant active fairway line
        L.polyline(pathCoords, {
          color: '#34d399',
          weight: 4,
          opacity: 0.95,
          dashArray: '6, 8',
          lineCap: 'round'
        }).addTo(activeGroup);
      } else if (isAllMode) {
        // In All-Holes mode, render all fairways with subtle color lines
        L.polyline(pathCoords, {
          color: '#ffffff',
          weight: 2.5,
          opacity: 0.45,
          dashArray: '5, 7'
        }).addTo(activeGroup);
      } else {
        // In single hole mode, other fairways are very dim
        L.polyline(pathCoords, {
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.18,
          dashArray: '4, 8'
        }).addTo(activeGroup);
      }

      // Dogleg turns
      if (isCurrentHole || isAllMode) {
        hole.doglegs.forEach((dogleg, idx) => {
          const doglegIcon = L.divIcon({
            html: `<div class="w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white shadow-md"></div>`,
            className: 'dogleg-marker',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });
          L.marker([dogleg.lat, dogleg.lng], { icon: doglegIcon })
            .bindPopup(`<span class="text-xs font-bold text-neutral-800">Hole ${hole.number} Dogleg ${idx + 1}</span>`)
            .addTo(activeGroup);
        });
      }
    });

    // 2. Draw 3 Physical Axiom Lite Baskets
    courseData.baskets.forEach((b) => {
      const isCurrentTarget = currentHole.basket.basketNumber === b.basketNumber;

      const basketIconHtml = `
        <div class="relative flex flex-col items-center cursor-pointer group">
          <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-xl transition-all ${
            isCurrentTarget
              ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 scale-125 ring-4 ring-emerald-400/80 ring-offset-1 ring-offset-black animate-pulse'
              : 'bg-emerald-900/90 border-2 border-emerald-400/50'
          }">
            <span class="text-white text-xs font-black">B${b.basketNumber}</span>
          </div>
          <div class="mt-1 px-1.5 py-0.5 rounded-md bg-black/85 text-[9px] font-black text-white whitespace-nowrap shadow border border-white/10">
            Basket ${b.basketNumber}
          </div>
        </div>
      `;

      const customBasketIcon = L.divIcon({
        html: basketIconHtml,
        className: 'custom-basket-marker',
        iconSize: [36, 46],
        iconAnchor: [18, 20]
      });

      const marker = L.marker([b.lat, b.lng], { icon: customBasketIcon });
      marker.bindPopup(`
        <div class="p-2 text-neutral-900">
          <p class="font-black text-sm text-emerald-800">Basket ${b.basketNumber}</p>
          <p class="text-xs text-neutral-600 font-bold">${b.model}</p>
          <p class="text-xs text-neutral-600 mt-1">Serves: <strong class="text-emerald-700">Holes ${b.servesHoles.join(', ')}</strong></p>
        </div>
      `);
      marker.addTo(activeGroup);
    });

    // 3. Draw All Tees (T1 - T9)
    courseData.holes.forEach((hole) => {
      const isCurrentTee = hole.number === currentHoleNumber;

      const teeIconHtml = `
        <div class="relative flex flex-col items-center cursor-pointer">
          <div class="w-7 h-7 rounded-xl flex items-center justify-center shadow-lg transition-transform ${
            isCurrentTee
              ? 'bg-gradient-to-tr from-amber-400 to-orange-500 scale-125 ring-4 ring-amber-400/80 font-black'
              : 'bg-[#111827]/90 border border-white/20 text-neutral-300'
          }">
            <span class="text-white text-[11px] font-black">T${hole.number}</span>
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

    // Fit Bounds depending on viewMode
    if (isAllMode) {
      // Fit to entire course property coordinates
      const allCoords: [number, number][] = [];
      courseData.holes.forEach((h) => {
        allCoords.push([h.tee.lat, h.tee.lng]);
        allCoords.push([h.basket.lat, h.basket.lng]);
      });
      map.fitBounds(L.latLngBounds(allCoords), {
        padding: [50, 50],
        maxZoom: 18,
        animate: true
      });
    } else {
      // Fit to active hole
      const activePathCoords: [number, number][] = [
        [currentHole.tee.lat, currentHole.tee.lng],
        ...currentHole.doglegs.map((d) => [d.lat, d.lng] as [number, number]),
        [currentHole.basket.lat, currentHole.basket.lng]
      ];
      map.fitBounds(L.latLngBounds(activePathCoords), {
        padding: [65, 65],
        maxZoom: 19,
        animate: true
      });
    }
  }, [currentHoleNumber, currentHole, viewMode, onSelectHole]);

  useEffect(() => {
    renderCourseLayers();
  }, [renderCourseLayers]);

  // Render multi-player live GPS locations from round
  const renderPlayerMarkers = useCallback(() => {
    const playerGroup = playerLayerGroupRef.current;
    if (!playerGroup || !round) return;

    playerGroup.clearLayers();

    round.players.forEach((p) => {
      // If player has a location reported within the last 30 minutes
      if (p.location && p.location.lat && p.location.lng) {
        const initials = p.name.substring(0, 2).toUpperCase();

        const playerIconHtml = `
          <div class="relative flex flex-col items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shadow-xl border-2 border-white ring-2 ring-black/40 animate-pulse" style="background-color: ${p.color};">
              ${initials}
            </div>
            <div class="mt-1 px-1.5 py-0.5 rounded bg-black/90 border border-white/15 text-[9px] font-black text-white whitespace-nowrap shadow">
              ${p.name}
            </div>
          </div>
        `;

        const playerIcon = L.divIcon({
          html: playerIconHtml,
          className: 'player-gps-marker',
          iconSize: [36, 48],
          iconAnchor: [18, 20]
        });

        L.marker([p.location.lat, p.location.lng], { icon: playerIcon })
          .bindPopup(`
            <div class="p-1.5 text-xs text-neutral-900">
              <p class="font-black text-sm" style="color: ${p.color};">${p.name}</p>
              <p class="text-neutral-600 mt-0.5">Live on course</p>
            </div>
          `)
          .addTo(playerGroup);
      }
    });
  }, [round]);

  useEffect(() => {
    renderPlayerMarkers();
  }, [renderPlayerMarkers]);

  // GPS Rangefinder Tracking & Broadcast
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

        // Update local user marker
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

        // Broadcast user's location to the group every 5 seconds
        const now = Date.now();
        if (round && round.players.length > 0 && now - lastBroadcastRef.current > 5000) {
          lastBroadcastRef.current = now;
          const myPlayer = round.players[0];
          if (myPlayer) {
            syncService.updatePlayerLocation(
              myPlayer.id,
              userCoord.lat,
              userCoord.lng,
              Math.round(pos.coords.accuracy * 3.28084)
            );
          }
        }
      },
      (err) => {
        console.warn('GPS error:', err);
        setGpsError('Could not acquire GPS position. Check browser permissions.');
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

  const centerOnCurrentHole = () => {
    if (!mapRef.current) return;
    const activePathCoords: [number, number][] = [
      [currentHole.tee.lat, currentHole.tee.lng],
      ...currentHole.doglegs.map((d) => [d.lat, d.lng] as [number, number]),
      [currentHole.basket.lat, currentHole.basket.lng]
    ];
    mapRef.current.fitBounds(L.latLngBounds(activePathCoords), {
      padding: [65, 65],
      maxZoom: 19
    });
  };

  const centerOnCourse = () => {
    if (!mapRef.current) return;
    const allCoords: [number, number][] = [];
    courseData.holes.forEach((h) => {
      allCoords.push([h.tee.lat, h.tee.lng]);
      allCoords.push([h.basket.lat, h.basket.lng]);
    });
    mapRef.current.fitBounds(L.latLngBounds(allCoords), {
      padding: [50, 50],
      maxZoom: 18
    });
  };

  const centerOnUser = () => {
    if (!mapRef.current || !userLocation) return;
    mapRef.current.setView([userLocation.lat, userLocation.lng], 19);
  };

  return (
    <div
      style={{ height: 'calc(100dvh - 112px)' }}
      className="relative w-full flex flex-col bg-[#090d16] overflow-hidden"
    >
      {/* Top Rangefinder & View Switcher Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="bg-[#111827]/95 backdrop-blur-md border border-white/15 rounded-3xl p-3 shadow-2xl flex flex-col gap-2.5 pointer-events-auto">
          {/* Main Info Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex flex-col items-center justify-center text-neutral-950 shadow-md">
                <span className="text-[10px] font-black uppercase tracking-wider leading-none">
                  Hole
                </span>
                <span className="text-xl font-black leading-tight">
                  {currentHole.number}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-white">Par {currentHole.par}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/30">
                    {currentHole.distanceFt} ft
                  </span>
                  {currentHole.isSafari && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black border border-purple-500/30">
                      Safari
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                  Target:{' '}
                  <strong className="text-emerald-400 font-bold">
                    Basket {currentHole.basket.basketNumber}
                  </strong>
                  <span className="text-[10px] text-neutral-500">({currentHole.basket.color})</span>
                </p>
              </div>
            </div>

            {/* GPS Rangefinder / Live Pin Distance */}
            <div className="flex flex-col items-end">
              {distanceToBasket !== null ? (
                <div className="text-right">
                  <span className="text-[10px] uppercase font-black text-neutral-400 tracking-wider">
                    To Pin
                  </span>
                  <div className="text-xl font-black text-emerald-400 flex items-center gap-1">
                    <NavigationIcon size={16} className="text-emerald-400 animate-pulse" />
                    <span>{distanceToBasket} ft</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={toggleGps}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <NavigationIcon size={14} />
                  <span>GPS Range</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions & Map View Mode Selector */}
          <div className="flex items-center gap-2 pt-1 border-t border-white/10">
            {/* View Mode Toggle */}
            <div className="flex-1 flex p-1 bg-white/5 rounded-xl border border-white/5">
              <button
                onClick={() => {
                  setViewMode('hole');
                  centerOnCurrentHole();
                }}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${
                  viewMode === 'hole'
                    ? 'bg-emerald-500 text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Hole {currentHole.number} View
              </button>
              <button
                onClick={() => {
                  setViewMode('all');
                  centerOnCourse();
                }}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 ${
                  viewMode === 'all'
                    ? 'bg-emerald-500 text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>All Holes</span>
                {round && round.players.some((p) => p.location) && (
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                )}
              </button>
            </div>

            {/* Measure Drive Button */}
            {onOpenThrowTracker && (
              <button
                onClick={onOpenThrowTracker}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-neutral-950 font-black text-xs flex items-center gap-1.5 shadow transition-transform active:scale-95"
                title="Measure Drive Distance"
              >
                <DiscIcon size={15} />
                <span>Measure Drive</span>
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

      {/* Map Floating Actions */}
      <div className="absolute right-3 bottom-24 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => setMapType(mapType === 'satellite' ? 'street' : 'satellite')}
          title="Toggle Satellite / Street Map"
          className="w-10 h-10 rounded-xl bg-[#111827]/90 hover:bg-[#1f2937] border border-white/20 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
        >
          <span className="text-[10px] font-black uppercase tracking-tight">
            {mapType === 'satellite' ? 'SAT' : 'MAP'}
          </span>
        </button>

        <button
          onClick={viewMode === 'all' ? centerOnCourse : centerOnCurrentHole}
          title="Recenter Map"
          className="w-10 h-10 rounded-xl bg-[#111827]/90 hover:bg-[#1f2937] border border-white/20 text-emerald-400 flex items-center justify-center shadow-lg transition-transform active:scale-95"
        >
          <MapPinIcon size={18} />
        </button>

        <button
          onClick={toggleGps}
          title={isTrackingGps ? 'GPS Tracking Active' : 'Start GPS Tracking'}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
            isTrackingGps
              ? 'bg-emerald-500 text-neutral-950 border-emerald-400 font-bold'
              : 'bg-[#111827]/90 text-neutral-300 border-white/20'
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
      <div className="absolute bottom-2 left-2 right-2 z-[1000] bg-[#111827]/95 backdrop-blur-md border border-white/15 rounded-2xl p-2 shadow-2xl">
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {courseData.holes.map((h) => {
            const isSelected = h.number === currentHoleNumber;
            return (
              <button
                key={h.number}
                onClick={() => onSelectHole(h.number)}
                className={`flex-1 min-w-[58px] py-1.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-neutral-950 font-black shadow-lg scale-105 ring-2 ring-emerald-400/50'
                    : 'bg-[#090d16] hover:bg-white/5 text-neutral-300 border border-white/5'
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
        <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-300 px-1">
          <div className="truncate flex items-center gap-1.5">
            <InfoIcon size={13} className="text-amber-400 flex-shrink-0" />
            <span className="truncate">{currentHole.notes}</span>
          </div>
          <span className="flex-shrink-0 font-bold text-amber-400 ml-2">
            Axiom Lite (B{currentHole.basket.basketNumber})
          </span>
        </div>
      </div>
    </div>
  );
};
