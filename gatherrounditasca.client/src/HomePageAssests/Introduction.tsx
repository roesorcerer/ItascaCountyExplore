import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import heroImg from '../assets/imgs/fashion/mn-gr-fall.jpg';
import { useFetch, useModal } from '../hooks';
import { Trail } from '../types';
import { API_ENDPOINTS } from '../constants';
import { Modal } from '../components';

const PlayerIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const RiddleIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
        <path d="M9.5 11h.01M11 9.5v.01M12.5 11h.01M11 12.5v.01" />
    </svg>
);

const PinIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const ArrowRight = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
);

const Introduction = () => {
    const navigate = useNavigate();
    const { data: allTrails, loading } = useFetch<Trail[]>(API_ENDPOINTS.TRAILS);
    const [featured, setFeatured] = useState<Trail[]>([]);
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
    const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null);
    const { isOpen, open, close } = useModal();

    useEffect(() => {
        if (allTrails && allTrails.length > 0) {
            const shuffled = [...allTrails].sort(() => Math.random() - 0.5);
            setFeatured(shuffled.slice(0, 3));
        }
    }, [allTrails]);

    const getImagePath = (imagePath: string) => {
        const cleanPath = imagePath.replace(/^public\//, '/');
        return cleanPath.replace(/\.jpg$/i, '.JPG');
    };

    const handleImageError = (id: string) => {
        setFailedImages(prev => new Set(prev).add(id));
    };

    const handleCardClick = (trail: Trail) => {
        setSelectedTrail(trail);
        open();
    };

    return (
        <main className="it-scope">
            {/* HERO */}
            <section className="it-hero">
                <div className="it-hero__bg" style={{ backgroundImage: `url(${heroImg})` }} aria-hidden="true" />
                <div className="it-hero__inner">
                    <span className="it-eyebrow">
                        <span className="dot" />
                        Grand Rapids, Minnesota
                    </span>
                    <h1>
                        A real-world scavenger hunt for <span className="accent">Itasca County trails</span>
                    </h1>
                    <p className="it-hero__sub">
                        We show you a photo and a riddle. You figure out which local trail or hidden gem it is — then go there.
                        Check in on location, score points, and climb the leaderboard while learning what makes our community special.
                    </p>
                    <div className="it-hero__ctas">
                        <Link to="/join" className="it-btn it-btn-primary">
                            Get your Player ID <ArrowRight />
                        </Link>
                        <a href="#how" className="it-btn it-btn-ghost">See how it works</a>
                    </div>

                    <div className="it-hero__stats">
                        <div className="it-stat"><strong>20+</strong><span>local trails &amp; landmarks</span></div>
                        <div className="it-stat"><strong>Free</strong><span>to play, all ages</span></div>
                        <div className="it-stat"><strong>Leave no trace</strong><span>respect the land</span></div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how" className="it-section">
                <div className="it-section__head">
                    <span className="it-section__eyebrow">How it works</span>
                    <h2>Three steps to your next adventure</h2>
                    <p>No app to install, no fees. Just a phone with location turned on and a sense of curiosity.</p>
                </div>

                <div className="it-steps">
                    <article className="it-step">
                        <span className="it-step__num">1</span>
                        <div className="it-step__icon"><PlayerIcon /></div>
                        <h3>Get your Player ID</h3>
                        <p>Answer three quick questions and we'll generate a memorable Player ID. That's all you need to start scoring points.</p>
                    </article>

                    <article className="it-step">
                        <span className="it-step__num">2</span>
                        <div className="it-step__icon"><RiddleIcon /></div>
                        <h3>Pick a trail &amp; read the riddle</h3>
                        <p>Browse photos of local trails and landmarks. Each one comes with a riddle and a fact about the place — your only clue is what you can recognize.</p>
                    </article>

                    <article className="it-step">
                        <span className="it-step__num">3</span>
                        <div className="it-step__icon"><PinIcon /></div>
                        <h3>Walk there to check in</h3>
                        <p>Got it? Head to the spot in person. When your phone confirms you're there, we add the points to your tally. Climb the leaderboard.</p>
                    </article>
                </div>
            </section>

            {/* FEATURED PREVIEW */}
            <section className="it-featured it-section">
                <div className="it-section__head">
                    <span className="it-section__eyebrow">Now playing</span>
                    <h2>A few trails waiting to be guessed</h2>
                    <p>Recognize one? Sign up, head out, and prove it.</p>
                </div>

                <div className="it-featured__grid">
                    {loading ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>Loading trails...</div>
                    ) : featured.length > 0 ? (
                        featured.map((f: Trail) => (
                            <article
                                key={f.id}
                                className="it-card"
                                onClick={() => handleCardClick(f)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div
                                    className="it-card__img"
                                    style={{
                                        backgroundImage: failedImages.has(String(f.id)) ? 'none' : `url(${getImagePath(f.coverImage)})`,
                                        backgroundColor: failedImages.has(String(f.id)) ? 'var(--it-bg-muted)' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    role="img"
                                    aria-label={f.name}
                                >
                                    {failedImages.has(String(f.id)) && (
                                        <span style={{ color: 'var(--it-text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                                            Image unavailable
                                        </span>
                                    )}
                                    <img
                                        src={getImagePath(f.coverImage)}
                                        style={{ display: 'none' }}
                                        onError={() => handleImageError(String(f.id))}
                                        alt=""
                                    />
                                </div>
                                <div className="it-card__body">
                                    <span className="it-card__tag">{f.region}</span>
                                    <h4>{f.name}</h4>
                                    <p>{f.description}</p>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>No trails available</div>
                    )}
                </div>

                <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                    <Link to="/play" className="it-btn it-btn-ghost">See all trails <ArrowRight /></Link>
                </div>
            </section>

            {/* CTA BANNER */}
            <section className="it-cta">
                <h2>Ready to explore Itasca?</h2>
                <p>Get your Player ID in under a minute. The trails aren't going anywhere — but the leaderboard moves fast.</p>
                <Link to="/join" className="it-btn it-btn-accent">Start playing <ArrowRight /></Link>
            </section>

            {/* TRAIL DETAIL MODAL */}
            {selectedTrail && (
                <Modal isOpen={isOpen} onClose={close}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2>{selectedTrail.name}</h2>
                        <div
                            style={{
                                aspectRatio: '16/10',
                                backgroundImage: `url(${getImagePath(selectedTrail.coverImage)})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: 'var(--it-radius)',
                                marginBottom: '1.5rem',
                                filter: 'blur(8px)'
                            }}
                        />
                        <p><strong>Location:</strong> {selectedTrail.region}</p>
                        <p><strong>Description:</strong> {selectedTrail.description}</p>
                        <p style={{ color: 'var(--it-text-muted)' }}>
                            {selectedTrail.stopCount} {selectedTrail.stopCount === 1 ? 'stop' : 'stops'} to discover. Head to Play to see the first riddle.
                        </p>
                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <button
                                className="it-btn it-btn-primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/play');
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                Try this trail
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </main>
    );
};

export default Introduction;
