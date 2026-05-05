import React from 'react';
import Header from '../LayoutAssets/Header';
import Footer from '../LayoutAssets/Footer';
import { SectionHead, FAQItem } from '../components';

// Info card component
interface InfoCardProps {
  emoji: string;
  title: string;
  description: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ emoji, title, description }) => (
  <div style={{
    padding: '1.5rem',
    borderRadius: 'var(--it-radius)',
    background: 'var(--it-bg-elev)',
    border: '1.5px solid var(--it-border)',
  }}>
    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--it-text)' }}>
      {emoji} {title}
    </h3>
    <p style={{ color: 'var(--it-text-muted)', margin: 0, lineHeight: 1.6 }}>
      {description}
    </p>
  </div>
);

// FAQ content
const FAQ_DATA = [
  {
    q: 'How do I get started?',
    a: 'Head to the "Get a Player ID" page and answer three quick questions. Your answers create a unique, memorable Player ID. That\'s all you need to start playing!',
  },
  {
    q: 'Do I need an app?',
    a: 'Nope! Everything works in your web browser. Just make sure location services are turned on so we can verify you\'re actually at each spot.',
  },
  {
    q: 'What if I get stuck on a riddle?',
    a: 'The riddle is a clue. Look carefully at the photo — trails have landmarks, trees, rock formations, signs. Study what you see and explore different spots around town until it clicks.',
  },
  {
    q: 'Do I have to do them in order?',
    a: 'Nope! Pick any trail, guess it, and check in when you\'re there. The riddles get harder, but there\'s no required sequence.',
  },
  {
    q: 'How close do I need to be?',
    a: 'Your phone will let us know when you\'re within the target zone. It\'s typically within a few hundred feet of the actual spot.',
  },
  {
    q: 'Is this a Leave No Trace event?',
    a: 'Absolutely. These are public lands and local favorites that belong to everyone. Please respect the area — pack out what you bring in, stay on trails, and leave each spot as beautiful as you found it.',
  },
];

// Main About page
const About: React.FC = () => {
  return (
    <>
      <Header />
      <main className="it-scope">
        <section className="it-section" style={{ paddingTop: '3rem' }}>
          <SectionHead
            eyebrow="About"
            title="Explore Itasca County"
          />

          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Intro box */}
            <div style={{
              padding: '2rem',
              borderRadius: 'var(--it-radius-lg)',
              background: 'var(--it-bg-muted)',
              border: '1.5px solid var(--it-border)',
              marginBottom: '3rem',
            }}>
              <p style={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'var(--it-text-muted)', margin: 0 }}>
                This is a free, community-driven scavenger hunt for Grand Rapids and the trails around Itasca County.
                It's designed to help you discover beautiful spots you might have missed, learn cool facts about the area,
                and connect with neighbors who share your love of exploring.
              </p>
            </div>

            {/* How it works */}
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 1.5rem', color: 'var(--it-text)', letterSpacing: '-0.01em' }}>
                How it works
              </h2>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <InfoCard
                  emoji="🎲"
                  title="Get a Player ID"
                  description="Answer three quick questions and we'll generate a unique, memorable Player ID. This is your player card for the entire game — share it, own it."
                />
                <InfoCard
                  emoji="🔍"
                  title="Pick a trail"
                  description="Browse the trail gallery. Each one has a photo, a riddle, and a hint about what makes it special. The photo is the clue — study it, recognize it, figure out where it is."
                />
                <InfoCard
                  emoji="🥾"
                  title="Walk there and check in"
                  description="Head to the spot, enter your Player ID, and tap 'Check In.' Your phone's GPS confirms you're actually there. You get points. You climb the leaderboard. Repeat."
                />
              </div>
            </div>

            {/* Trail etiquette */}
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 1.5rem', color: 'var(--it-text)', letterSpacing: '-0.01em' }}>
                Trail etiquette
              </h2>
              <div style={{
                padding: '1.5rem',
                borderRadius: 'var(--it-radius-lg)',
                background: 'var(--it-primary)',
                color: '#0d0d0d',
              }}>
                <p style={{ lineHeight: 1.8, margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>
                  <strong>Leave No Trace.</strong> These are public lands that belong to everyone. Pack out what you bring in,
                  stay on marked trails, respect wildlife, and leave each spot as beautiful as you found it.
                  If everyone follows this principle, these trails stay pristine for the next explorer.
                </p>
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 1.5rem', color: 'var(--it-text)', letterSpacing: '-0.01em' }}>
                Questions?
              </h2>
              <div style={{ maxWidth: '680px' }}>
                {FAQ_DATA.map((faq, idx) => (
                  <FAQItem key={idx} question={faq.q} answer={faq.a} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default About;
