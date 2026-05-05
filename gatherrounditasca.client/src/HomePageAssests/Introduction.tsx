import { Link } from 'react-router-dom';
import heroImg from '../assets/imgs/fashion/mn-gr-fall.jpg';
import featured1 from '../assets/imgs/slider/slider1.jpg';
import featured2 from '../assets/imgs/slider/slider2.jpg';
import featured3 from '../assets/imgs/slider/slider3.jpg';

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
    const featured = [
        { img: featured1, tag: 'Forest trail', title: 'Can you guess this lakeside loop?', hint: 'Pines, a footbridge, and a view that locals know well.' },
        { img: featured2, tag: 'Town gem', title: 'A historic spot near downtown', hint: 'Look for the building that has watched the river flow for a century.' },
        { img: featured3, tag: 'Hidden corner', title: 'A community favorite', hint: 'Quiet, easy to miss, and worth the walk.' },
    ];

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
                    {featured.map((f, i) => (
                        <article key={i} className="it-card">
                            <div className="it-card__img" style={{ backgroundImage: `url(${f.img})` }} role="img" aria-label={f.title} />
                            <div className="it-card__body">
                                <span className="it-card__tag">{f.tag}</span>
                                <h4>{f.title}</h4>
                                <p>{f.hint}</p>
                            </div>
                        </article>
                    ))}
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
        </main>
    );
};

export default Introduction;
