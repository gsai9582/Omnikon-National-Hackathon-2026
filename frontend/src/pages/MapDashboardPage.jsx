import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { casesAPI } from '../services/api';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapDashboardPage() {
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMapData = async () => {
            try {
                const res = await casesAPI.getMapData();
                setMarkers(res.data);
            } catch (err) {
                console.error("Failed to load map data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMapData();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'REPORTED': return '#3b82f6'; // blue
            case 'UNDER_VERIFICATION': return '#eab308'; // yellow
            case 'VERIFIED': return '#f97316'; // orange
            case 'SEARCHING': return '#ef4444'; // red
            case 'FOUND': return '#22c55e'; // green
            default: return '#64748b'; // slate
        }
    };

    const defaultCenter = [40.7128, -74.0060]; // Default to NY if no markers
    const center = markers.length > 0 && markers[0].latitude && markers[0].longitude 
        ? [markers[0].latitude, markers[0].longitude] 
        : defaultCenter;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] relative">
            {/* Disclaimer Banner */}
            <div className="bg-orange-500/90 text-white text-center py-2 px-4 text-sm font-medium z-10 shadow-md">
                ⚠️ Prototype search-zone radius. This is a configurable demonstration model and not a scientifically validated prediction.
            </div>

            <div className="flex-grow relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                ) : (
                    <MapContainer center={center} zoom={11} className="w-full h-full z-0">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {markers.map((marker) => {
                            if (!marker.latitude || !marker.longitude) return null;
                            
                            const position = [marker.latitude, marker.longitude];
                            const radiusMeters = (marker.radiusKm || 0) * 1000;
                            const color = getStatusColor(marker.status);

                            return (
                                <React.Fragment key={marker.id}>
                                    <Marker position={position}>
                                        <Popup>
                                            <div className="text-slate-800">
                                                <h3 className="font-bold text-lg mb-1">{marker.shortName}</h3>
                                                <p className="text-sm mb-1"><strong>Case ID:</strong> {marker.caseId}</p>
                                                <p className="text-sm mb-1"><strong>Age:</strong> {marker.age} | <strong>Gender:</strong> {marker.gender}</p>
                                                <p className="text-sm mb-2">
                                                    <strong>Status:</strong> 
                                                    <span className="ml-1 px-2 py-0.5 rounded text-xs text-white" style={{ backgroundColor: color }}>
                                                        {marker.status}
                                                    </span>
                                                </p>
                                                {marker.priorityLevel && (
                                                    <p className="text-xs text-slate-500 border-t pt-2 mt-2">
                                                        Priority: {marker.priorityLevel} | Search Radius: {marker.radiusKm}km
                                                    </p>
                                                )}
                                            </div>
                                        </Popup>
                                    </Marker>
                                    
                                    {radiusMeters > 0 && (
                                        <Circle 
                                            center={position} 
                                            radius={radiusMeters} 
                                            pathOptions={{ 
                                                color: color, 
                                                fillColor: color, 
                                                fillOpacity: 0.1,
                                                weight: 2,
                                                dashArray: '5, 5'
                                            }} 
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </MapContainer>
                )}
            </div>

            {/* Legend */}
            <div className="absolute bottom-6 right-6 bg-white/95 p-4 rounded-lg shadow-lg z-10 border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2 text-sm">Status Legend</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-slate-700">Reported</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span className="text-slate-700">Under Verification</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span className="text-slate-700">Verified</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-slate-700">Searching</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-slate-700">Found</span></div>
                </div>
            </div>
        </div>
    );
}

export default MapDashboardPage;
