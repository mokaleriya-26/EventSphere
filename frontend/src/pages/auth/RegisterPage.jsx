import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, UserPlus, Building2, User } from 'lucide-react';

import { EventSphereLogo } from '../../components/common/EventSphereLogo';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('attendee');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name or company name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newUser = await register({ name, email, role, password });
      showToast(`Welcome to EventSphere, ${newUser.name}!`, 'success');

      if (newUser.role === 'organizer') navigate('/organizer/events');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 180px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div
        className="card-surface"
        style={{
          width: '100%',
          maxWidth: 520,
          borderRadius: 24,
          padding: '40px 36px',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <EventSphereLogo size="lg" variant="dark" to="/" />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: 6 }}>
            Create Your Account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Join thousands of event creators and passionate attendees.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#FEE2E2',
              color: '#B91C1C',
              padding: '10px 14px',
              borderRadius: 12,
              fontSize: '0.86rem',
              marginBottom: 18
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          {/* Account Role Selection */}
          <div style={{ marginBottom: 20 }}>
            <label className="form-label">I want to:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                type="button"
                onClick={() => setRole('attendee')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: `2px solid ${role === 'attendee' ? 'var(--primary-purple)' : 'var(--border-subtle)'}`,
                  background: role === 'attendee' ? 'var(--accent-lavender)' : '#FFFFFF',
                  color: role === 'attendee' ? 'var(--dark-purple)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s'
                }}
              >
                <User size={18} /> Attend Events
              </button>

              <button
                type="button"
                onClick={() => setRole('organizer')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: `2px solid ${role === 'organizer' ? 'var(--primary-purple)' : 'var(--border-subtle)'}`,
                  background: role === 'organizer' ? 'var(--accent-lavender)' : '#FFFFFF',
                  color: role === 'organizer' ? 'var(--dark-purple)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s'
                }}
              >
                <Building2 size={18} /> Host & Organize
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">{role === 'organizer' ? 'Organization or Creator Name' : 'Full Name'}</label>
            <input
              type="text"
              placeholder={role === 'organizer' ? 'e.g. Apex Live Productions' : 'e.g. Alex Rivera'}
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="e.g. alex@example.com"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="At least 6 chars"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                placeholder="Repeat password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.96rem', marginBottom: 20 }}
          >
            <UserPlus size={16} />
            <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-purple)', fontWeight: 700 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
