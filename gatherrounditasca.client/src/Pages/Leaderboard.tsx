import React from 'react';
import Header from '../LayoutAssets/Header';
import Footer from '../LayoutAssets/Footer';
import { SectionHead, Podium } from '../components';
import { useFetch } from '../hooks';
import { API_ENDPOINTS } from '../constants';
import { LeaderboardEntry } from '../types';

// Leaderboard table row component
interface RankingRowProps {
  entry: LeaderboardEntry;
  isTopThree: boolean;
}

const RankingRow: React.FC<RankingRowProps> = ({ entry, isTopThree }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '60px 1fr 120px',
      gap: '1.5rem',
      alignItems: 'center',
      padding: '1.25rem 1.5rem',
      background: isTopThree ? 'var(--it-green-50)' : 'transparent',
    }}
  >
    {/* Rank */}
    <div style={{
      fontSize: '1.5rem',
      fontWeight: 900,
      color: isTopThree ? 'var(--it-primary)' : 'var(--it-text-muted)',
    }}>
      #{entry.ranking}
    </div>

    {/* Player ID */}
    <div>
      <h4 style={{
        margin: 0,
        fontSize: '1rem',
        fontWeight: 700,
        color: 'var(--it-text)',
        wordBreak: 'break-all',
      }}>
        {entry.playerId}
      </h4>
    </div>

    {/* Trails Found */}
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--it-primary)' }}>
        {entry.locationsVisited}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--it-text-muted)', margin: 0, fontWeight: 600 }}>
        trails
      </p>
    </div>
  </div>
);

// Full rankings table component
interface RankingsTableProps {
  entries: LeaderboardEntry[];
}

const RankingsTable: React.FC<RankingsTableProps> = ({ entries }) => (
  <div style={{
    background: 'var(--it-bg-elev)',
    border: '1.5px solid var(--it-border)',
    borderRadius: 'var(--it-radius-lg)',
    overflow: 'hidden',
  }}>
    {entries.map((entry, idx) => (
      <div
        key={entry.playerId}
        style={{
          borderBottom: idx < entries.length - 1 ? '1px solid var(--it-border)' : 'none',
        }}
      >
        <RankingRow entry={entry} isTopThree={idx < 3} />
      </div>
    ))}
  </div>
);

// Main Leaderboard page
const Leaderboard: React.FC = () => {
  const { data: leaderboard = [], loading } = useFetch<LeaderboardEntry[]>(
    API_ENDPOINTS.LEADERBOARD
  );

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <p style={{ color: 'var(--it-text-muted)' }}>Loading rankings...</p>
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
            eyebrow="Community"
            title="Leaderboard"
            subtitle="Who knows Itasca County's trails the best? See where you rank among local explorers."
          />

          {/* Podium */}
          {leaderboard.length > 0 && (
            <Podium entries={leaderboard} />
          )}

          {/* Full Rankings */}
          {leaderboard.length > 0 && (
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '2rem 0 1.5rem', color: 'var(--it-text)' }}>
                Full Rankings
              </h2>
              <RankingsTable entries={leaderboard} />
            </div>
          )}

          {/* Empty state */}
          {leaderboard.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <p style={{ fontSize: '1.1rem', color: 'var(--it-text-muted)' }}>
                No players yet. <a href="/join" style={{ color: 'var(--it-primary)', textDecoration: 'none' }}>Be the first!</a>
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Leaderboard;
