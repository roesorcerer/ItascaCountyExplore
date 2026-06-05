import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../LayoutAssets/Header';
import Footer from '../LayoutAssets/Footer';
import { Button, SectionHead, Card } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks';
import { API_ENDPOINTS } from '../constants';
import { Location, LeaderboardEntry } from '../types';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: locations } = useFetch<Location[]>(API_ENDPOINTS.LOCATIONS);
  const { data: leaderboard } = useFetch<LeaderboardEntry[]>(API_ENDPOINTS.LEADERBOARD);

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const userStats = useMemo(() => {
    const playerEntry = leaderboard?.find(entry => entry.playerId === user?.playerId);
    return {
      rank: playerEntry?.rank || 0,
      visited: playerEntry?.points || 0,
      total: locations?.length || 0,
    };
  }, [leaderboard, locations, user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <>
      <Header />
      <main className="it-scope" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <section className="it-section" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
          <SectionHead
            eyebrow="Dashboard"
            title={`Welcome, ${user.playerId}!`}
            subtitle="Track your progress and continue your adventure"
          />

          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
            }}>
              <Card>
                <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--it-primary)', margin: '0 0 0.75rem' }}>
                    Trails Visited
                  </p>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--it-text)' }}>
                    {userStats.visited}/{userStats.total}
                  </div>
                </div>
              </Card>

              <Card>
                <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--it-primary)', margin: '0 0 0.75rem' }}>
                    Leaderboard Rank
                  </p>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--it-text)' }}>
                    {userStats.rank > 0 ? `#${userStats.rank}` : '—'}
                  </div>
                </div>
              </Card>

              <Card>
                <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--it-primary)', margin: '0 0 0.75rem' }}>
                    Completion
                  </p>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--it-text)' }}>
                    {userStats.total > 0 ? Math.round((userStats.visited / userStats.total) * 100) : 0}%
                  </div>
                </div>
              </Card>
            </div>

            {/* Profile Card */}
            <Card>
              <div style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.5rem', color: 'var(--it-text)' }}>
                  Your Profile
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--it-bg-muted)', borderRadius: 'var(--it-radius)' }}>
                    <span style={{ color: 'var(--it-text-muted)', fontWeight: 600 }}>Player ID</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--it-text)' }}>{user.playerId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--it-bg-muted)', borderRadius: 'var(--it-radius)' }}>
                    <span style={{ color: 'var(--it-text-muted)', fontWeight: 600 }}>Email</span>
                    <span style={{ color: 'var(--it-text)' }}>{user.email}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--it-bg-muted)', borderRadius: 'var(--it-radius)' }}>
                    <span style={{ color: 'var(--it-text-muted)', fontWeight: 600 }}>Favorites</span>
                    <span style={{ color: 'var(--it-text)' }}>
                      {user.favoriteColor} · {user.favoriteFood} · {user.favoriteAnimal}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" onClick={handleLogout} fullWidth>
                  Log out
                </Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button variant="primary" onClick={() => navigate('/play')} style={{ flex: 1, minWidth: '200px' }}>
                Continue playing →
              </Button>
              <Button variant="accent" onClick={() => navigate('/leaderboard')} style={{ flex: 1, minWidth: '200px' }}>
                View leaderboard
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Dashboard;
