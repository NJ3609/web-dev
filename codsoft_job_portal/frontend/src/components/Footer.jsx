import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'rgba(17, 24, 39, 0.4)',
      borderTop: '1px solid var(--border-color)',
      padding: '48px 0 24px 0',
      marginTop: '64px'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Brand Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link to="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.4rem',
              background: 'linear-gradient(135deg, #a5b4fc 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              <Briefcase size={24} style={{ stroke: 'url(#brand-grad-footer)' }} />
              <svg width="0" height="0" style={{ position: 'absolute' }}>
                <linearGradient id="brand-grad-footer" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </svg>
              HiredUp
            </Link>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px' }}>
              Connect with top employers, post job opportunities, and build your career on HiredUp. The next-generation career board.
            </p>
          </div>

          {/* Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Job Seekers
            </h4>
            <Link to="/jobs" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'var(--transition)' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
              Browse Jobs
            </Link>
            <Link to="/candidate" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'var(--transition)' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
              Candidate Profile
            </Link>
            <Link to="/jobs?type=Remote" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'var(--transition)' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
              Remote Openings
            </Link>
          </div>

          {/* Employers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Employers
            </h4>
            <Link to="/employer" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'var(--transition)' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
              Employer Console
            </Link>
            <Link to="/employer?tab=post-job" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'var(--transition)' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
              Post a Job
            </Link>
            <Link to="/register" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'var(--transition)' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
              Create Employer Account
            </Link>
          </div>

          {/* Support */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Platform Info
            </h4>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Status: Live</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Version: 1.0.0</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Built using: React & Express</span>
          </div>
        </div>

        {/* copyright and divider */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}>
          <p>© {new Date().getFullYear()} HiredUp. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#" style={{ transition: 'var(--transition)' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>Privacy Policy</a>
            <a href="#" style={{ transition: 'var(--transition)' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
