import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, User, LogOut, LogIn, Menu, X, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(11, 15, 25, 0.8)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '16px 0'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: '1.5rem',
          background: 'linear-gradient(135deg, #a5b4fc 0%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          <Briefcase size={28} style={{ stroke: 'url(#brand-grad)' }} />
          {/* SVG Gradient definition for Lucide icons */}
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </svg>
          HiredUp
        </Link>

        {/* Desktop Navigation */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '24px'
        }} className="desktop-menu">
          <Link to="/jobs" style={{
            color: 'var(--text-secondary)',
            fontWeight: 500,
            fontSize: '0.95rem',
            transition: 'var(--transition)'
          }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
            Find Jobs
          </Link>

          {user ? (
            <>
              {user.role === 'employer' ? (
                <>
                  <Link to="/employer" style={{
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    transition: 'var(--transition)'
                  }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
                    Employer Console
                  </Link>
                  <Link to="/employer?tab=post-job" className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
                    <PlusCircle size={16} /> Post a Job
                  </Link>
                </>
              ) : (
                <Link to="/candidate" style={{
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  transition: 'var(--transition)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
                  <User size={16} /> Dashboard
                </Link>
              )}

              <div style={{
                width: '1px',
                height: '20px',
                background: 'var(--border-color)'
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Hello, <strong style={{ color: 'white' }}>{user.name}</strong>
                </span>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ padding: '8px 12px' }}>
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ padding: '8px 16px' }}>
                <LogIn size={16} /> Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ padding: '8px 16px' }}>
                Join Now
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{
          display: 'block',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer'
        }} className="mobile-toggle">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'rgba(11, 15, 25, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 49
        }} className="mobile-menu">
          <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} style={{
            fontSize: '1.1rem',
            padding: '8px 0',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
          }}>
            Find Jobs
          </Link>
          
          {user ? (
            <>
              {user.role === 'employer' ? (
                <>
                  <Link to="/employer" onClick={() => setMobileMenuOpen(false)} style={{
                    fontSize: '1.1rem',
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    Employer Console
                  </Link>
                  <Link to="/employer?tab=post-job" onClick={() => setMobileMenuOpen(false)} style={{
                    fontSize: '1.1rem',
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <PlusCircle size={18} /> Post a Job
                  </Link>
                </>
              ) : (
                <Link to="/candidate" onClick={() => setMobileMenuOpen(false)} style={{
                  fontSize: '1.1rem',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <User size={18} /> Dashboard
                </Link>
              )}
              <div style={{ padding: '8px 0', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                Signed in as: <strong style={{ color: 'white' }}>{user.email}</strong>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', gap: '8px' }}>
                <LogOut size={18} /> Log Out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ width: '100%' }}>
                <LogIn size={18} /> Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>
                Join Now
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Inline styles for media queries inside React components (cleanest way without tailwind) */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-menu {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
