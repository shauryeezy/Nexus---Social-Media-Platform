import React, { useState } from 'react';
import { X, Sparkles, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register({ name, username, email, password, bio });
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoUsername) => {
    setError('');
    setLoading(true);
    try {
      await login(demoUsername, 'password123');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--accent-primary)" />
            <h2 className="modal-title">
              {tab === 'login' ? 'Sign In to Nexus' : 'Create Your Account'}
            </h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Quick Demo Login Bar */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: '18px',
              border: '1px solid var(--border-color)'
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: '700',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <KeyRound size={14} />
              1-CLICK DEMO TEST LOGINS:
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                onClick={() => handleDemoLogin('sarahc')}
                disabled={loading}
              >
                Sarah Connor
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                onClick={() => handleDemoLogin('alexdev')}
                disabled={loading}
              >
                Alex Rivera
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                onClick={() => handleDemoLogin('mayatech')}
                disabled={loading}
              >
                Maya Patel
              </button>
            </div>
          </div>

          {/* Tab Selector */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-input)',
              borderRadius: 'var(--radius-full)',
              padding: '4px',
              marginBottom: '18px'
            }}
          >
            <button
              className={`feed-tab ${tab === 'login' ? 'active' : ''}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '6px 12px', fontSize: '0.9rem' }}
              onClick={() => {
                setTab('login');
                setError('');
              }}
            >
              Sign In
            </button>
            <button
              className={`feed-tab ${tab === 'register' ? 'active' : ''}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '6px 12px', fontSize: '0.9rem' }}
              onClick={() => {
                setTab('register');
                setError('');
              }}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '14px',
                fontSize: '0.88rem'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {tab === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Linus Torvalds"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. linusdev"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bio (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Brief intro about yourself"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">
                {tab === 'login' ? 'Email or Username' : 'Email Address'}
              </label>
              <input
                type={tab === 'login' ? 'text' : 'email'}
                required
                className="form-input"
                placeholder={tab === 'login' ? 'alex@example.com or alexdev' : 'you@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Please wait...
                </>
              ) : tab === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

