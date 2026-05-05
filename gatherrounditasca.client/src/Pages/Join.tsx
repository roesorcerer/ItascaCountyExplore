import React, { useCallback, useMemo } from 'react';
import Header from '../LayoutAssets/Header';
import Footer from '../LayoutAssets/Footer';
import { Button, Modal, SectionHead } from '../components';
import { useModal } from '../hooks';
import { useForm } from '../hooks/useForm';
import { generatePlayerId, copyToClipboard } from '../utils';
import { API_ENDPOINTS, MESSAGES, FORM_OPTIONS } from '../constants';
import { toast } from 'react-toastify';

// Icons
const CopyIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
);

// Form field component
interface FormFieldProps {
  label: string;
  type?: 'email' | 'text' | 'select';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  options?: string[];
  placeholder?: string;
  disabled?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  options,
  placeholder,
  disabled,
}) => (
  <div>
    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
      {label}
    </label>
    {type === 'select' && options ? (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--it-radius)',
          border: `1.5px solid ${error ? '#e74c3c' : 'var(--it-border)'}`,
          background: 'var(--it-bg-elev)',
          color: 'var(--it-text)',
          fontSize: '0.95rem',
          boxSizing: 'border-box',
        }}
      >
        <option value="">— Select —</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--it-radius)',
          border: `1.5px solid ${error ? '#e74c3c' : 'var(--it-border)'}`,
          background: 'var(--it-bg-elev)',
          color: 'var(--it-text)',
          fontSize: '0.95rem',
          boxSizing: 'border-box',
        }}
      />
    )}
    {error && <p style={{ fontSize: '0.8rem', color: '#e74c3c', margin: '0.5rem 0 0' }}>{error}</p>}
  </div>
);

// Retrieve section component
interface RetrieveSectionProps {
  onRetrieve: (email: string) => Promise<void>;
  loading: boolean;
}

const RetrieveSection: React.FC<RetrieveSectionProps> = ({ onRetrieve, loading }) => {
  const [email, setEmail] = React.useState('');

  const handleRetrieve = useCallback(async () => {
    if (!email) {
      toast.error('Enter your email');
      return;
    }
    await onRetrieve(email);
  }, [email, onRetrieve]);

  return (
    <div style={{
      padding: '1.5rem',
      borderRadius: 'var(--it-radius-lg)',
      background: 'var(--it-bg-elev)',
      border: '1.5px solid var(--it-border)',
    }}>
      <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}>Retrieve your ID</p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--it-radius)',
            border: '1.5px solid var(--it-border)',
            background: 'var(--it-bg)',
            color: 'var(--it-text)',
            fontSize: '0.95rem',
            boxSizing: 'border-box',
          }}
        />
        <Button variant="ghost" onClick={handleRetrieve} loading={loading}>
          Find it
        </Button>
      </div>
    </div>
  );
};

// Main Join page
const Join: React.FC = () => {
  const { isOpen, open, close } = useModal();
  const [copied, setCopied] = React.useState(false);
  const [retrieveLoading, setRetrieveLoading] = React.useState(false);

  const form = useForm(
    { email: '', color: '', food: '', animal: '' },
    {
      onSubmit: async (values) => {
        // Register player
        const playerId = generatePlayerId(values.color, values.food, values.animal);
        const response = await fetch(API_ENDPOINTS.PLAYER_REGISTER, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: values.email,
            favoriteColor: values.color,
            favoriteFood: values.food,
            favoriteAnimal: values.animal,
            playerId,
          }),
        });
        if (!response.ok) throw new Error('Registration failed');
        form.values.playerId = playerId;
        open();
      },
      onError: (err) => toast.error('Failed to register'),
    }
  );

  const previewId = useMemo(
    () => form.values.color && form.values.food && form.values.animal
      ? generatePlayerId(form.values.color, form.values.food, form.values.animal)
      : '??????',
    [form.values]
  );

  const validateForm = useCallback(() => {
    if (!form.values.email || !form.values.color || !form.values.food || !form.values.animal) {
      toast.error(MESSAGES.ERROR.REQUIRED_FIELD);
      return false;
    }
    return true;
  }, [form.values]);

  const handleRetrieve = useCallback(async (email: string) => {
    setRetrieveLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.PLAYER_RETRIEVE}?email=${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error('Not found');
      const data = await response.json();
      if (data?.PlayerId) {
        form.values.playerId = data.PlayerId;
        open();
        toast.success(MESSAGES.SUCCESS.PLAYER_FOUND);
      }
    } catch {
      toast.error(MESSAGES.ERROR.PLAYER_NOT_FOUND);
    } finally {
      setRetrieveLoading(false);
    }
  }, [form, open]);

  const handleCopy = useCallback(async () => {
    if (await copyToClipboard(form.values.playerId || '')) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [form.values.playerId]);

  return (
    <>
      <Header />
      <main className="it-scope" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <section className="it-section" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
          <SectionHead
            eyebrow="Get Started"
            title="Create your Player ID"
            subtitle="Three simple questions. Your answers create a memorable Player ID that only you'll have. Ready to join the hunt?"
          />

          <div style={{ maxWidth: '620px', margin: '0 auto' }}>
            {/* Sign up form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(validateForm);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

              <FormField
                label="Your email"
                type="email"
                value={form.values.email}
                onChange={(val) => form.setFieldValue('email', val)}
                placeholder="name@example.com"
              />

              <FormField
                label="🎨 What's your favorite color?"
                type="select"
                value={form.values.color}
                onChange={(val) => form.setFieldValue('color', val)}
                options={FORM_OPTIONS.colors}
              />

              <FormField
                label="🍽️ What's your favorite food?"
                type="select"
                value={form.values.food}
                onChange={(val) => form.setFieldValue('food', val)}
                options={FORM_OPTIONS.foods}
              />

              <FormField
                label="🦌 What's your favorite animal?"
                type="select"
                value={form.values.animal}
                onChange={(val) => form.setFieldValue('animal', val)}
                options={FORM_OPTIONS.animals}
              />

              {/* Live preview */}
              {form.values.color && form.values.food && form.values.animal && (
                <div style={{
                  padding: '1.5rem',
                  borderRadius: 'var(--it-radius-lg)',
                  background: 'var(--it-bg-muted)',
                  border: '1.5px solid var(--it-primary)',
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--it-primary)', margin: '0 0 0.75rem' }}>
                    Your Player ID will be
                  </p>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '1.85rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    color: 'var(--it-text)',
                  }}>
                    {previewId}
                  </div>
                </div>
              )}

              <Button variant="primary" type="submit" loading={form.loading} fullWidth>
                Create my Player ID
              </Button>
            </form>

            {/* Divider */}
            <div style={{
              margin: '2.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: 'var(--it-text-muted)',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--it-border)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Already have a Player ID?</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--it-border)' }} />
            </div>

            {/* Retrieve section */}
            <RetrieveSection onRetrieve={handleRetrieve} loading={retrieveLoading} />
          </div>
        </section>
      </main>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={close} title="🎉 You're in!">
        <p style={{ color: 'var(--it-text-muted)', marginBottom: '1.75rem' }}>
          Your Player ID is ready. Copy it and use it to log in and start playing.
        </p>

        <div style={{
          padding: '1.5rem',
          borderRadius: 'var(--it-radius)',
          background: 'var(--it-bg-muted)',
          border: '2px solid var(--it-primary)',
          textAlign: 'center',
          marginBottom: '1.75rem',
        }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--it-text-muted)', margin: '0 0 0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Your Player ID
          </p>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '1.75rem',
            fontWeight: 900,
            color: 'var(--it-text)',
            letterSpacing: '0.12em',
          }}>
            {form.values.playerId}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Button
            variant="accent"
            fullWidth
            onClick={handleCopy}
            icon={copied ? <CheckIcon /> : <CopyIcon />}
          >
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </Button>
          <a href="/play" className="it-btn it-btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            Start playing →
          </a>
        </div>
      </Modal>

      <Footer />
    </>
  );
};

export default Join;
