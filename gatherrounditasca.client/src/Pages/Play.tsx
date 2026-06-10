import React, { useCallback, useEffect, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import Header from '../LayoutAssets/Header';
import Footer from '../LayoutAssets/Footer';
import { SectionHead, Button, Modal, Card } from '../components';
import { useFetch, useModal, useGeolocation } from '../hooks';
import { isWithinProximity } from '../utils';
import { API_ENDPOINTS, MESSAGES } from '../constants';
import { Trail, TrailDetail, CheckinResult } from '../types';
import { useAuth } from '../contexts/AuthContext';

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

// Trail card — one curated Trail in the grid.
interface TrailCardProps {
  trail: Trail;
  onSelect: (trail: Trail) => void;
}

const TrailCard: React.FC<TrailCardProps> = ({ trail, onSelect }) => (
    <Card
        clickable
        onClick={() => onSelect(trail)}
        style={{ aspectRatio: 'auto', display: 'flex', flexDirection: 'column' }}
    >
        <div
            style={{
                aspectRatio: '16/10',
                backgroundImage: `url(${trail.coverImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <div
                style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4) 100%)' }}
                aria-hidden="true"
            />
        </div>

        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--it-primary)', margin: '0 0 0.5rem' }}>
                {trail.region}
            </p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--it-text)' }}>
                {trail.name}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--it-text-muted)', margin: 0, lineHeight: 1.5, flex: 1 }}>
                {trail.description}
            </p>
            <span style={{ marginTop: '1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--it-text-muted)' }}>
                {trail.stopCount} {trail.stopCount === 1 ? 'stop' : 'stops'}
            </span>
            <Button variant="primary" fullWidth style={{ marginTop: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                Start this trail
            </Button>
        </div>
    </Card>
);

// Progress bar across a Trail's Stops.
const ProgressBar: React.FC<{ completed: number; total: number }> = ({ completed, total }) => {
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--it-text-muted)', marginBottom: '0.4rem' }}>
                <span>Progress</span>
                <span>{completed} / {total} stops</span>
            </div>
            <div style={{ height: '8px', borderRadius: '999px', background: 'var(--it-bg-muted)', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'var(--it-primary)', transition: 'width 0.3s ease' }} />
            </div>
        </div>
    );
};

// Main Play page — the Trail walker.
const Play: React.FC = () => {
    const { data: trails, loading } = useFetch<Trail[]>(API_ENDPOINTS.TRAILS);
    const { isOpen, open, close } = useModal();
    const { getLocation, loading: geoLoading } = useGeolocation();
    const { user } = useAuth();

    const [detail, setDetail] = React.useState<TrailDetail | null>(null);
    const [detailLoading, setDetailLoading] = React.useState(false);
    const [checkInLoading, setCheckInLoading] = React.useState(false);
    const [playerId, setPlayerId] = React.useState(user?.playerId ?? '');

    useEffect(() => {
        if (user?.playerId) setPlayerId(user.playerId);
    }, [user?.playerId]);

    // Fetch one Trail as seen by this Player — progress + the single revealed Stop.
    const loadDetail = useCallback(async (trailId: string, pid?: string) => {
        setDetailLoading(true);
        try {
            const query = pid ? `?playerId=${encodeURIComponent(pid)}` : '';
            const resp = await fetch(`${API_ENDPOINTS.TRAILS}/${trailId}${query}`);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            setDetail(await resp.json());
        } catch (err) {
            toast.error(MESSAGES.ERROR.FETCH_FAILED);
            console.error(err);
        } finally {
            setDetailLoading(false);
        }
    }, []);

    const handleSelectTrail = useCallback((trail: Trail) => {
        setDetail(null);
        open();
        void loadDetail(trail.id, playerId.trim() || user?.playerId);
    }, [open, loadDetail, playerId, user?.playerId]);

    const handleCheckIn = useCallback(async () => {
        const pid = playerId.trim();
        if (!pid) {
            toast.error(MESSAGES.ERROR.REQUIRED_PLAYER_ID);
            return;
        }
        if (!detail?.currentStop) return;

        setCheckInLoading(true);
        try {
            // Confirm the Player exists before spending a geolocation fix.
            const playerResp = await fetch(`${API_ENDPOINTS.PLAYER_RETRIEVE_ID}?playerID=${encodeURIComponent(pid)}`);
            if (!playerResp.ok) {
                toast.error(MESSAGES.ERROR.INVALID_PLAYER_ID);
                return;
            }

            const coords = await getLocation();
            if (!coords) {
                toast.error(MESSAGES.ERROR.GEOLOCATION_NOT_SUPPORTED);
                return;
            }

            // Client-side proximity gate (docs/adr/0006 lives here, on the client).
            if (!isWithinProximity(coords, detail.currentStop.coordinates)) {
                toast.error(MESSAGES.ERROR.WRONG_LOCATION);
                return;
            }

            const resp = await fetch(API_ENDPOINTS.CHECKIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: pid, stopId: detail.currentStop.id }),
            });

            if (resp.status === 409) {
                toast.error("That isn't your current stop yet.");
                return;
            }
            if (!resp.ok) {
                toast.error(MESSAGES.ERROR.FETCH_FAILED);
                return;
            }

            const result = (await resp.json()) as CheckinResult;
            if (result.awarded > 0) {
                toast.success(MESSAGES.SUCCESS.CHECKED_IN_POINTS(result.awarded));
            } else {
                toast.info(MESSAGES.SUCCESS.ALREADY_CHECKED_IN);
            }
            if (result.trailComplete) {
                toast.success(MESSAGES.SUCCESS.TRAIL_COMPLETE);
            }

            // Reload so the next Stop is revealed (or the trail shows complete).
            await loadDetail(detail.id, pid);
        } catch (err) {
            toast.error(MESSAGES.ERROR.FETCH_FAILED);
            console.error(err);
        } finally {
            setCheckInLoading(false);
        }
    }, [playerId, detail, getLocation, loadDetail]);

    const trailCount = useMemo(() => trails?.length ?? 0, [trails]);
    const busy = checkInLoading || geoLoading;

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
                        title="Walk the trails"
                        subtitle={
                            <>
                                Pick a trail, read the riddle for its first stop, and head there in person to check in.
                                Each check-in reveals the next stop and scores you points.
                                {trailCount > 0 && (
                                    <span style={{ display: 'block', marginTop: '0.75rem', color: 'var(--it-primary)', fontWeight: 600 }}>
                                        {trailCount} trails waiting to be discovered
                                    </span>
                                )}
                            </>
                        }
                    />

                    {trails && trails.length > 0 ? (
                        <div style={{
                            maxWidth: '1100px',
                            margin: '0 auto',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '1.25rem',
                        }}>
                            {trails.map((trail) => (
                                <TrailCard key={trail.id} trail={trail} onSelect={handleSelectTrail} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                            <p style={{ color: 'var(--it-text-muted)' }}>No trails available yet. Check back soon!</p>
                        </div>
                    )}
                </section>
            </main>

            <Modal isOpen={isOpen} onClose={close} title={detail?.name} maxWidth="720px">
                {detailLoading || !detail ? (
                    <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <LoadingIcon />
                        <p style={{ color: 'var(--it-text-muted)' }}>Loading trail...</p>
                    </div>
                ) : (
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <ProgressBar completed={detail.completed} total={detail.total} />

                        {detail.trailComplete ? (
                            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                                <div style={{ fontSize: '3rem' }}>🏆</div>
                                <h3 style={{ color: 'var(--it-text)', margin: '0.5rem 0' }}>Trail complete!</h3>
                                <p style={{ color: 'var(--it-text-muted)', margin: 0 }}>
                                    You've checked in at every stop on {detail.name}. Pick another trail to keep climbing the leaderboard.
                                </p>
                            </div>
                        ) : detail.currentStop ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                {/* Left: the revealed current Stop */}
                                <div>
                                    {detail.currentStop.image && (
                                        <div
                                            style={{
                                                aspectRatio: '1',
                                                backgroundImage: `url(${detail.currentStop.image})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                borderRadius: 'var(--it-radius)',
                                                marginBottom: '1rem',
                                            }}
                                            aria-label={detail.currentStop.title}
                                        />
                                    )}
                                    <p style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--it-primary)', margin: '0 0 0.5rem' }}>
                                        Stop {detail.currentStop.order} · {detail.currentStop.points} pts
                                    </p>
                                    <div style={{ color: 'var(--it-text)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                        {detail.currentStop.riddle.replace(/\\n/g, '\n')}
                                    </div>
                                </div>

                                {/* Right: check-in */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--it-primary)', margin: '0 0 0.5rem' }}>
                                            Are you here?
                                        </p>
                                        <p style={{ color: 'var(--it-text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                                            Go to this stop, then check in. We'll confirm you're there with your phone's GPS.
                                        </p>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--it-text)' }}>
                                            Your Player ID
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., PurpleTacosOtter"
                                            value={playerId}
                                            onChange={(e) => setPlayerId(e.target.value)}
                                            disabled={busy}
                                            style={{
                                                width: '100%',
                                                padding: '0.85rem 1rem',
                                                borderRadius: 'var(--it-radius)',
                                                border: '1.5px solid var(--it-border)',
                                                background: 'var(--it-bg)',
                                                color: 'var(--it-text)',
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                letterSpacing: '0.04em',
                                                boxSizing: 'border-box',
                                            }}
                                        />
                                        <p style={{ fontSize: '0.75rem', color: 'var(--it-text-muted)', margin: '0.5rem 0 0' }}>
                                            Don't have one? <a href="/join" style={{ color: 'var(--it-primary)', textDecoration: 'none' }}>Sign up first</a>
                                        </p>
                                    </div>

                                    <Button
                                        variant="primary"
                                        fullWidth
                                        loading={busy}
                                        onClick={handleCheckIn}
                                        disabled={!playerId.trim()}
                                        icon={<GeoIcon />}
                                    >
                                        Check In
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                                <p style={{ color: 'var(--it-text-muted)', margin: 0 }}>This trail has no stops yet. Check back soon!</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <ToastContainer position="bottom-right" />
            <Footer />
        </>
    );
};

export default Play;
