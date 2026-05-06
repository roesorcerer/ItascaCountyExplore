import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../LayoutAssets/Header';
import Footer from '../LayoutAssets/Footer';
import { Button, SectionHead } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS, MESSAGES } from '../constants';

const Login: React.FC = () => {
  const [playerId, setPlayerId] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerId.trim() || !pin.trim()) {
      toast.error('Enter your Player ID and PIN');
      return;
    }

    if (pin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.PLAYER_RETRIEVE_ID}?playerID=${playerId}`);
      if (!response.ok) {
        toast.error(MESSAGES.ERROR.INVALID_PLAYER_ID);
        return;
      }

      const userData = await response.json();

      // Verify PIN (backend should handle this)
      const loginResponse = await fetch('/api/player/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, pin }),
      });

      if (!loginResponse.ok) {
        toast.error('Invalid PIN');
        return;
      }

      login({
        playerId: userData.PlayerId,
        email: userData.Email || '',
        favoriteColor: userData.FavoriteColor || '',
        favoriteFood: userData.FavoriteFood || '',
        favoriteAnimal: userData.FavoriteAnimal || '',
      });

      toast.success('Welcome back!');
      navigate('/play');
    } catch (error) {
      toast.error('Login failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [playerId, pin, login, navigate]);

  return (
    <>
      <Header />
      <main className="it-scope" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <section className="it-section" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
          <SectionHead
            eyebrow="Welcome Back"
            title="Log in to your account"
            subtitle="Enter your Player ID and PIN to continue your adventure"
          />

          <div style={{ maxWidth: '420px', margin: '0 auto' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  Player ID
                </label>
                <input
                  type="text"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value.toUpperCase())}
                  placeholder="e.g., RPI1234"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--it-radius)',
                    border: '1.5px solid var(--it-border)',
                    background: 'var(--it-bg-elev)',
                    color: 'var(--it-text)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  PIN (4 digits)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--it-radius)',
                    border: '1.5px solid var(--it-border)',
                    background: 'var(--it-bg-elev)',
                    color: 'var(--it-text)',
                    fontSize: '1.25rem',
                    letterSpacing: '0.5em',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <Button variant="primary" type="submit" loading={loading} fullWidth>
                Log in
              </Button>
            </form>

            <div style={{
              margin: '2rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: 'var(--it-text-muted)',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--it-border)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>New here?</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--it-border)' }} />
            </div>

            <a href="/join" className="it-btn it-btn-ghost" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              Create account
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Login;
