import React, { useCallback, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import Header from '../LayoutAssets/Header';
import Footer from '../LayoutAssets/Footer';
import { SectionHead, Button, Modal, Card } from '../components';
import { useFetch, useModal, useGeolocation } from '../hooks';
import { isWithinProximity } from '../utils';
import { API_ENDPOINTS, MESSAGES } from '../constants';
import { Location } from '../types';

// Icon components
const GeoIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const LoadingIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ animation: 'spin 1s linear infinite', width: '24px', height: '24px' }}>
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" opacity="1" strokeDasharray="15" strokeDashoffset="0" />
    </svg>
);

// Trail card component - reusable
interface TrailCardProps {
  location: Location;
  onSelect: (location: Location) => void;
}

const TrailCard: React.FC<TrailCardProps> = ({ location, onSelect }) => (
    <Card
        clickable
        onClick={() => onSelect(location)}
        style={{
            aspectRatio: 'auto',
            display: 'flex',
            flexDirection: 'column',
        }}
    >
        {/* Image */}
        <div
            style={{
                aspectRatio: '16/10',
                backgroundImage: `url(${location.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4) 100%)',
                }}
                aria-hidden="true"
            />
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--it-primary)', margin: '0 0 0.5rem' }}>
                {location.location}
            </p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--it-text)' }}>
                {location.title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--it-text-muted)', margin: 0, lineHeight: 1.5, flex: 1 }}>
                {location.description}
            </p>
            <Button
                variant="primary"
                fullWidth
                style={{ marginTop: '1.25rem' }}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                Guess this trail
            </Button>
        </div>
    </Card>
);

// Check-in form component - reusable
interface CheckInFormProps {
  selectedLocation: Location | null;
  onCheckIn: (playerId: string) => Promise<void>;
  loading: boolean;
}

const CheckInForm: React.FC<CheckInFormProps> = ({ onCheckIn, loading }) => {
    const [playerId, setPlayerId] = React.useState('');

    const handleSubmit = useCallback(async () => {
        await onCheckIn(playerId);
        if (!loading) setPlayerId('');
    }, [playerId, onCheckIn, loading]);

    return (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--it-primary)', margin: '0 0 0.75rem' }}>
                    Have you been here?
                </p>
                <p style={{ color: 'var(--it-text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                    Go to this location, then enter your Player ID and tap "Check In." We'll verify you're actually there using your phone's GPS.
                </p>
            </div>

            <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--it-text)' }}>
                    Your Player ID
                </label>
                <input
                    type="text"
                    placeholder="e.g., RPS1847"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value.toUpperCase())}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--it-radius)',
                        border: '1.5px solid var(--it-border)',
                        background: 'var(--it-bg)',
                        color: 'var(--it-text)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        boxSizing: 'border-box',
                        textTransform: 'uppercase',
                    }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--it-text-muted)', margin: '0.5rem 0 0' }}>
                    Don't have one? <a href="/join" style={{ color: 'var(--it-primary)', textDecoration: 'none' }}>Sign up first</a>
                </p>
            </div>

            <Button
                variant="primary"
                fullWidth
                loading={loading}
                onClick={handleSubmit}
                disabled={!playerId.trim()}
                icon={<GeoIcon />}
            >
                Check In
            </Button>
        </div>
    );
};

// Main Play page
const Play: React.FC = () => {
    const { data: locations, loading } = useFetch<Location[]>(API_ENDPOINTS.LOCATIONS);
    const { isOpen, open, close } = useModal();
    const { getLocation, loading: geoLoading } = useGeolocation();
    const [selectedLocation, setSelectedLocation] = React.useState<Location | null>(null);
    const [checkInLoading, setCheckInLoading] = React.useState(false);

    const handleSelectTrail = useCallback((location: Location) => {
        setSelectedLocation(location);
        open();
    }, [open]);

    const handleCheckIn = useCallback(async (playerId: string) => {
        if (!playerId.trim()) {
            toast.error(MESSAGES.ERROR.REQUIRED_PLAYER_ID);
            return;
        }
        if (!selectedLocation) return;

        setCheckInLoading(true);
        try {
            const coords = await getLocation();
            if (!coords) {
                toast.error(MESSAGES.ERROR.GEOLOCATION_NOT_SUPPORTED);
                return;
            }

            // Verify player exists
            const playerResp = await fetch(`${API_ENDPOINTS.PLAYER_RETRIEVE_ID}?playerID=${playerId}`);
            if (!playerResp.ok) {
                toast.error(MESSAGES.ERROR.INVALID_PLAYER_ID);
                setCheckInLoading(false);
                return;
            }

            // Check proximity
            if (isWithinProximity(coords, selectedLocation.coordinates)) {
                toast.success(MESSAGES.SUCCESS.CHECKED_IN);
                close();
            } else {
                toast.error(MESSAGES.ERROR.WRONG_LOCATION);
            }
        } catch (err) {
            toast.error(MESSAGES.ERROR.FETCH_FAILED);
            console.error(err);
        } finally {
            setCheckInLoading(false);
        }
    }, [selectedLocation, getLocation, close]);

    const trailCount = useMemo(
        () => locations?.length ?? 0,
        [locations]
    );

    if (loading) {
        return (
            <>
                <Header />
                <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <LoadingIcon />
                    <p style={{ color: 'var(--it-text-muted)' }}>Loading trails...</p>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="it-scope">
                <section className="it-section" style={{ paddingTop: '3rem' }}>
                    <SectionHead
                        eyebrow="Play Now"
                        title="Guess the trails"
                        subtitle={
                            <>
                                See a photo and riddle. Can you recognize the spot? Head there in person and check in to score points.
                                {trailCount > 0 && (
                                    <span style={{ display: 'block', marginTop: '0.75rem', color: 'var(--it-primary)', fontWeight: 600 }}>
                                        {trailCount} trails waiting to be discovered
                                    </span>
                                )}
                            </>
                        }
                    />

                    {locations && locations.length > 0 ? (
                        <div style={{
                            maxWidth: '1100px',
                            margin: '0 auto',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '1.25rem',
                        }}>
                            {locations.map((location) => (
                                <TrailCard
                                    key={location.id}
                                    location={location}
                                    onSelect={handleSelectTrail}
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                            <p style={{ color: 'var(--it-text-muted)' }}>No trails available yet. Check back soon!</p>
                        </div>
                    )}
                </section>
            </main>

            {/* Modal for riddle and check-in */}
            <Modal
                isOpen={isOpen}
                onClose={close}
                title={selectedLocation?.title}
                maxWidth="720px"
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                    {/* Left: Photo + Riddle */}
                    <div style={{ borderRight: '1.5px solid var(--it-border)' }}>
                        <div
                            style={{
                                aspectRatio: '1',
                                backgroundImage: selectedLocation ? `url(${selectedLocation.image})` : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                            aria-label={selectedLocation?.title}
                        />
                        {selectedLocation && (
                            <div style={{ padding: '1.5rem' }}>
                                <p style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--it-primary)', margin: '0 0 1rem' }}>
                                    Your riddle
                                </p>
                                <div style={{ color: 'var(--it-text)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    {selectedLocation.riddle.replace(/\\n/g, '\n')}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Check-in */}
                    <CheckInForm
                        selectedLocation={selectedLocation}
                        onCheckIn={handleCheckIn}
                        loading={checkInLoading || geoLoading}
                    />
                </div>
            </Modal>

            <ToastContainer position="bottom-right" />
            <Footer />
        </>
    );
};

export default Play;
