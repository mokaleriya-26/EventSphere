import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { EventSphereLogo } from '../../components/common/EventSphereLogo';
import {
  Eye,
  EyeOff,
  LogIn,
  Building2,
  User,
  Shield,
  Loader2,
  AlertCircle,
  HelpCircle,
  Check,
  ChevronDown
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'attendee',
    role: 'attendee',
    title: 'User / Attendee',
    icon: User,
    description: 'Explore upcoming events, book tickets, and manage personal registrations',
    defaultEmail: 'attendee1@eventspear.local',
    accounts: [
      { email: 'attendee1@eventspear.local', name: 'Aarav Sharma' },
      { email: 'attendee2@eventspear.local', name: 'Diya Patel' },
      { email: 'attendee3@eventspear.local', name: 'Rohan Mehta' },
      { email: 'attendee4@eventspear.local', name: 'Ananya Iyer' },
      { email: 'attendee5@eventspear.local', name: 'Kabir Verma' }
    ]
  },
  {
    id: 'organizer',
    role: 'organizer',
    title: 'Organizer',
    icon: Building2,
    description: 'Publish events, control ticket capacities, and track attendee rosters',
    defaultEmail: 'organizer1@eventspear.local',
    accounts: [
      { email: 'organizer1@eventspear.local', name: 'TechNova Global Pvt Ltd' },
      { email: 'organizer2@eventspear.local', name: 'CulturePulse Arts Foundation' },
      { email: 'organizer3@eventspear.local', name: 'Momentum Sports League' },
      { email: 'organizer4@eventspear.local', name: 'VentureCatalyst Network' },
      { email: 'organizer5@eventspear.local', name: 'Harmony Soundscapes India' }
    ]
  },
  {
    id: 'admin',
    role: 'admin',
    title: 'Admin',
    icon: Shield,
    description: 'Manage users and organizers, oversee events, and inspect system reports',
    defaultEmail: 'admin@eventspear.local',
    accounts: [
      { email: 'admin@eventspear.local', name: 'EventSpear Platform Admin' }
    ]
  }
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  const { user, login } = useAuth();
  const { showToast } = useToast();

  const [selectedRole, setSelectedRole] = useState('attendee');
  const [email, setEmail] = useState('attendee1@eventspear.local');
  const [password, setPassword] = useState('EventSpearLocal!2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAccountList, setShowAccountList] = useState(false);

  const selectedCategory = CATEGORIES.find(c => c.role === selectedRole) || CATEGORIES[0];

  const isRouteAllowedForRole = (targetPath, role) => {
    if (!targetPath) return false;
    const cleanPath = targetPath.split('?')[0];

    // Admin can access everything
    if (role === 'admin') return true;

    // Organizer
    if (role === 'organizer') {
      if (cleanPath.startsWith('/admin') || cleanPath.startsWith('/attendee')) {
        return false;
      }
      return true;
    }

    // Attendee
    if (role === 'attendee') {
      if (cleanPath.startsWith('/admin') || cleanPath.startsWith('/organizer')) {
        return false;
      }
      return true;
    }

    return false;
  };

  const navigateAfterLogin = (loggedUser) => {
    if (redirectTarget && isRouteAllowedForRole(redirectTarget, loggedUser.role)) {
      navigate(redirectTarget, { replace: true });
      return;
    }
    if (loggedUser.role === 'organizer') {
      navigate('/organizer/events', { replace: true });
    } else if (loggedUser.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      // User / Attendee redirected to event discovery experience
      navigate('/', { replace: true });
    }
  };

  // If already authenticated, redirect
  useEffect(() => {
    if (user) {
      navigateAfterLogin(user);
    }
  }, [user]);

  const handleCategorySelect = (role) => {
    setSelectedRole(role);
    setError('');
    const cat = CATEGORIES.find(c => c.role === role);
    if (cat) {
      setEmail(cat.defaultEmail);
      setPassword('EventSpearLocal!2026');
    }
  };

  const handleSelectSpecificAccount = (accEmail) => {
    setEmail(accEmail);
    setPassword('EventSpearLocal!2026');
    setError('');
    setShowAccountList(false);
  };

  const validateForm = () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setError('Please enter your password.');
      return false;
    }
    return true;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const loggedUser = await login(email.trim(), password, selectedRole);
      showToast(`Welcome back, ${loggedUser.name}!`, 'success');
      navigateAfterLogin(loggedUser);
    } catch (err) {
      const errorMessage =
        err.message ||
        'Authentication failed. Please verify your credentials.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 160px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 20px',
        background: 'var(--bg-page)'
      }}
    >
      <div
        className="card-surface"
        style={{
          width: '100%',
          maxWidth: 620,
          borderRadius: 24,
          padding: '36px 32px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <EventSphereLogo size="lg" variant="dark" to="/" />
          </div>
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              marginBottom: 6
            }}
          >
            Welcome to EventSpear
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
            Select your account category below to access your account.
          </p>
        </div>

        {/* Phase 2: Category Selection Cards */}
        <div style={{ marginBottom: 20 }}>
          <label
            id="category-selection-label"
            style={{
              display: 'block',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            Choose Account Category
          </label>

          <div
            role="radiogroup"
            aria-labelledby="category-selection-label"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12
            }}
          >
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedRole === cat.role;
              return (
                <button
                  key={cat.role}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => handleCategorySelect(cat.role)}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      handleCategorySelect(cat.role);
                    }
                  }}
                  style={{
                    background: isSelected ? 'var(--accent-lavender)' : '#FFFFFF',
                    border: isSelected
                      ? '2px solid var(--primary-purple)'
                      : '1.5px solid var(--border-subtle)',
                    borderRadius: 16,
                    padding: '14px 10px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    position: 'relative',
                    transition: 'all 0.18s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(117, 65, 200, 0.15)' : 'none'
                  }}
                >
                  {/* Selected check indicator */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: 'var(--primary-purple)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      aria-hidden="true"
                    >
                      <Check size={11} strokeWidth={3} />
                    </div>
                  )}

                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: isSelected ? 'rgba(117, 65, 200, 0.15)' : 'var(--bg-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? 'var(--primary-purple)' : 'var(--text-secondary)'
                    }}
                  >
                    <IconComp size={20} aria-hidden="true" />
                  </div>

                  <span
                    style={{
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      color: isSelected ? 'var(--dark-purple)' : 'var(--text-main)',
                      lineHeight: 1.2
                    }}
                  >
                    {cat.title}
                  </span>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.25,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {cat.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Local Test Account Quick Fill Helper */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            borderRadius: 14,
            padding: '12px 14px',
            marginBottom: 20,
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
              <HelpCircle size={16} color="var(--primary-purple)" />
              <span>
                Selected Account: <strong style={{ color: 'var(--text-main)' }}>{email}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowAccountList(!showAccountList)}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--primary-purple)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>Switch {selectedCategory.title}</span>
              <ChevronDown size={13} />
            </button>
          </div>

          {showAccountList && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Seeded {selectedCategory.title} Accounts (Password: EventSpearLocal!2026):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {selectedCategory.accounts.map(acc => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectSpecificAccount(acc.email)}
                    style={{
                      background: email === acc.email ? 'var(--accent-lavender)' : '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      padding: '6px 10px',
                      fontSize: '0.78rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: 'var(--text-main)'
                    }}
                  >
                    <span><strong>{acc.email}</strong> ({acc.name})</span>
                    {email === acc.email && <Check size={13} color="var(--primary-purple)" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Validation / Error Message */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '12px 14px',
              borderRadius: 12,
              fontSize: '0.86rem',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              lineHeight: 1.4
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} noValidate>
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="login-email" className="form-label">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder={`e.g. ${selectedCategory.defaultEmail}`}
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6
              }}
            >
              <label htmlFor="login-password" className="form-label" style={{ margin: 0 }}>
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-required="true"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '0.96rem',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: isSubmitting ? 0.75 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <LogIn size={16} aria-hidden="true" />
                <span>Sign In as {selectedCategory.title}</span>
              </>
            )}
          </button>
        </form>

        <div
          style={{
            textAlign: 'center',
            fontSize: '0.88rem',
            color: 'var(--text-secondary)'
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{ color: 'var(--primary-purple)', fontWeight: 700 }}
          >
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
};
