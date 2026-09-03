import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet's default marker icon references image files by relative path, which
// bundlers (Vite) don't resolve automatically. Point the default icon at the
// bundled asset URLs so the pin actually renders.
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// Itasca County, MN — the map's default view when no coordinates are set yet.
const DEFAULT_CENTER: [number, number] = [47.5, -93.6];
const DEFAULT_ZOOM = 10;

// Parse a stored "lat, lon" string into a valid LatLng, or null if it isn't two
// finite, in-range numbers. Matches the format the check-in code parses (split on
// ',', trim). Kept lenient about surrounding whitespace.
function parseLatLon(value: string): [number, number] | null {
    const parts = value.split(',').map((v) => Number(v.trim()));
    if (parts.length !== 2) return null;
    const [lat, lon] = parts;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
    return [lat, lon];
}

// Canonical "lat, lon" string with a fixed precision (~0.1 m). This is what gets
// written back into the Stop's coordinates field.
function formatLatLon(lat: number, lon: number): string {
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
}

// Places / moves the marker on click.
function ClickToPlace({ onPick }: { onPick: (lat: number, lon: number) => void }) {
    useMapEvents({
        click(e) {
            onPick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Pans the map to the pin whenever the coordinates change from outside (e.g. the
// admin typed into the text field). Only pans — never changes zoom — so it doesn't
// fight the admin's own panning/zooming.
function PanToPin({ position }: { position: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.panTo(position);
        }
    }, [map, position?.[0], position?.[1]]);
    return null;
}

interface MapPickerProps {
    // The Stop's "lat, lon" coordinates string (the same field the text input edits).
    value: string;
    onChange: (coords: string) => void;
}

// A click-to-place / drag map for authoring a Stop's coordinates (docs/adr/0006:
// Google Maps was rejected as a *verification* source, but a map picker for
// *authoring* is exactly its blessed use — here on free OpenStreetMap tiles, no
// API key). It stays in sync with the plain text field: typing updates the pin,
// clicking/dragging updates the text.
function MapPicker({ value, onChange }: MapPickerProps) {
    const position = useMemo(() => parseLatLon(value), [value]);
    const center = position ?? DEFAULT_CENTER;

    return (
        <div className="mb-2">
            <MapContainer
                center={center}
                zoom={position ? 15 : DEFAULT_ZOOM}
                style={{ height: '260px', width: '100%', borderRadius: '0.375rem' }}
                scrollWheelZoom
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ClickToPlace onPick={(lat, lon) => onChange(formatLatLon(lat, lon))} />
                <PanToPin position={position} />
                {position && (
                    <Marker
                        position={position}
                        draggable
                        eventHandlers={{
                            dragend(e) {
                                const { lat, lng } = e.target.getLatLng();
                                onChange(formatLatLon(lat, lng));
                            },
                        }}
                    />
                )}
            </MapContainer>
            <small className="text-muted">
                Click the map or drag the pin to set the Stop location
                {position ? '.' : ' — no location set yet.'}
            </small>
        </div>
    );
}

export default MapPicker;
