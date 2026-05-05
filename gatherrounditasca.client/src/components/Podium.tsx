import React from 'react';
import { LeaderboardEntry } from '../types';

interface PodiumProps {
  entries: LeaderboardEntry[];
}

const MedalIcon = ({ rank }: { rank: 1 | 2 | 3 }) => {
  const medals: Record<1 | 2 | 3, string> = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
  };
  return <span style={{ fontSize: '2.5rem' }}>{medals[rank]}</span>;
};

const Podium: React.FC<PodiumProps> = ({ entries }) => {
  const top3 = entries.slice(0, 3);

  if (top3.length === 0) return null;

  return (
    <div style={{
      maxWidth: '1100px',
      margin: '0 auto 4rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1.5rem',
      alignItems: 'flex-end',
    }}>
      {/* 2nd Place */}
      {top3[1] && (
        <article
          style={{
            background: 'var(--it-bg-elev)',
            border: '1.5px solid var(--it-border)',
            borderRadius: 'var(--it-radius-lg)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            position: 'relative',
            order: 1,
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <MedalIcon rank={2} />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--it-text)', wordBreak: 'break-all' }}>
            {top3[1].playerId}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.9rem', color: 'var(--it-text-muted)' }}>
            <div>
              <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: 'var(--it-text)' }}>
                {top3[1].locationsVisited}
              </span>
              trails found
            </div>
          </div>
        </article>
      )}

      {/* 1st Place (larger) */}
      {top3[0] && (
        <article
          style={{
            background: 'linear-gradient(135deg, var(--it-green-500), var(--it-green-600))',
            border: '2px solid var(--it-amber-400)',
            borderRadius: 'var(--it-radius-lg)',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            color: '#fff',
            position: 'relative',
            transform: 'scale(1.08)',
            order: 0,
            boxShadow: '0 20px 40px rgba(47, 109, 58, 0.25)',
          }}
        >
          <div style={{ marginBottom: '1rem', fontSize: '3rem' }}>🥇</div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 900, margin: '0 0 0.75rem', letterSpacing: '-0.02em', wordBreak: 'break-all' }}>
            {top3[0].playerId}
          </h2>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 1rem', opacity: 0.9 }}>
            Current Champion
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.95rem' }}>
            <div>
              <span style={{ display: 'block', fontSize: '2rem', fontWeight: 900 }}>
                {top3[0].locationsVisited}
              </span>
              trails found
            </div>
          </div>
        </article>
      )}

      {/* 3rd Place */}
      {top3[2] && (
        <article
          style={{
            background: 'var(--it-bg-elev)',
            border: '1.5px solid var(--it-border)',
            borderRadius: 'var(--it-radius-lg)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            position: 'relative',
            order: 2,
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <MedalIcon rank={3} />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--it-text)', wordBreak: 'break-all' }}>
            {top3[2].playerId}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.9rem', color: 'var(--it-text-muted)' }}>
            <div>
              <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: 'var(--it-text)' }}>
                {top3[2].locationsVisited}
              </span>
              trails found
            </div>
          </div>
        </article>
      )}
    </div>
  );
};

export default Podium;
