import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, ChevronRight, ArrowRight, Sparkles, Star } from 'lucide-react';
import { API_BASE_URL } from '../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [locationText, setLocationText] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch jobs for featured section (show top 3 recent jobs)
  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs`);
        if (response.ok) {
          const data = await response.json();
          // Take the first 3 jobs
          setFeaturedJobs(data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchText) query.append('search', searchText);
    if (locationText) query.append('location', locationText);
    navigate(`/jobs?${query.toString()}`);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
      
      {/* Hero Banner */}
      <section style={{
        position: 'relative',
        padding: '100px 0 60px 0',
        textAlign: 'center',
        background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 16px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#a5b4fc',
            marginBottom: '24px'
          }}>
            <Sparkles size={14} />
            <span>Discover Your Next Adventure</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '24px',
            color: 'white'
          }}>
            Find Your Dream Job<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Easier Than Ever
            </span>
          </h1>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            maxWidth: '650px',
            margin: '0 auto 48px auto',
            lineHeight: 1.6
          }}>
            HiredUp connects top tech talents with global employers offering the best packages. Post openings or apply in single click.
          </p>

          {/* Large Interactive Search Bar */}
          <form onSubmit={handleSearch} className="glass-card" style={{
            maxWidth: '850px',
            margin: '0 auto',
            padding: '12px',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '12px',
            borderRadius: 'var(--radius-lg)'
          }} className="search-form-grid">
            
            <div style={{ position: 'relative', flexGrow: 1 }}>
              <Search size={20} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="text"
                placeholder="Job title, keywords, or company..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid transparent',
                  padding: '16px 16px 16px 52px',
                  color: 'white',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  fontSize: '1rem',
                  transition: 'var(--transition)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                onBlur={(e) => e.target.style.borderColor = 'transparent'}
              />
            </div>

            <div style={{
              width: '1px',
              height: '32px',
              background: 'var(--border-color)',
              display: 'none'
            }} className="search-divider" />

            <div style={{ position: 'relative', flexGrow: 1 }}>
              <MapPin size={20} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="text"
                placeholder="City, state, or remote..."
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid transparent',
                  padding: '16px 16px 16px 52px',
                  color: 'white',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  fontSize: '1rem',
                  transition: 'var(--transition)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                onBlur={(e) => e.target.style.borderColor = 'transparent'}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{
              padding: '16px 28px',
              fontSize: '1rem',
              fontWeight: 600,
              gap: '8px'
            }}>
              <Search size={18} /> Find Jobs
            </button>
          </form>

          {/* Quick links */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '32px',
            flexWrap: 'wrap'
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', alignSelf: 'center' }}>Popular:</span>
            {['Remote', 'Full-time', 'Part-time', 'Contract'].map((type) => (
              <Link
                key={type}
                to={`/jobs?type=${type}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(99, 102, 241, 0.1)';
                  e.target.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.color = 'var(--text-secondary)';
                }}
              >
                {type}
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'between',
          alignItems: 'flex-end',
          marginBottom: '36px'
        }} className="section-header">
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--primary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <Star size={14} fill="var(--primary)" />
              <span>Latest Openings</span>
            </div>
            <h2 style={{ fontSize: '2.2rem', color: 'white', fontFamily: 'var(--font-heading)' }}>
              Featured Opportunities
            </h2>
          </div>
          <Link to="/jobs" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--primary)',
            fontWeight: 500,
            fontSize: '0.95rem',
            borderBottom: '1px solid transparent',
            transition: 'var(--transition)'
          }} onMouseEnter={(e) => e.target.style.borderBottomColor = 'var(--primary)'} onMouseLeave={(e) => e.target.style.borderBottomColor = 'transparent'}>
            See all jobs <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner" />
          </div>
        ) : featuredJobs.length === 0 ? (
          <div className="glass-card" style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--text-secondary)'
          }}>
            <Briefcase size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3>No Jobs Available</h3>
            <p style={{ marginTop: '8px' }}>There are no job postings at the moment. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1" style={{ gap: '20px' }}>
            {featuredJobs.map((job) => (
              <div key={job.id} className="glass-card" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'between',
                padding: '24px',
                gap: '24px',
                flexWrap: 'wrap'
              }} className="job-card-flex">
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  {/* Logo or placeholder */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-color)',
                    color: 'white',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    flexShrink: 0
                  }}>
                    {job.company.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                      <span className="badge badge-primary">{job.type}</span>
                      {job.salary && <span style={{ fontSize: '0.85rem', color: 'var(--success)' }}>{job.salary}</span>}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '4px' }}>{job.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {job.company} • <span style={{ color: 'var(--text-muted)' }}>{job.location}</span>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }} className="job-action-buttons">
                  <Link to={`/jobs/${job.id}`} className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Stats/Highlight Section */}
      <section style={{ background: 'rgba(17, 24, 39, 0.3)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '60px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            textAlign: 'center'
          }}>
            {[
              { number: '10,000+', label: 'Active Candidates' },
              { number: '2,500+', label: 'Premium Companies' },
              { number: '5,000+', label: 'Successful Matches' },
              { number: '98%', label: 'Retention Rate' }
            ].map((stat, i) => (
              <div key={i}>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #a5b4fc 0%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '8px'
                }}>
                  {stat.number}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Styled inline components for Search Form layout and flex elements */}
      <style>{`
        .search-form-grid {
          display: grid;
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .search-form-grid {
            grid-template-columns: 1fr auto 1fr auto;
            align-items: center;
          }
          .search-divider {
            display: block !important;
          }
        }
        
        .job-card-flex {
          flex-direction: column;
          align-items: flex-start !important;
        }
        @media (min-width: 768px) {
          .job-card-flex {
            flex-direction: row;
            align-items: center !important;
            justify-content: space-between !important;
          }
          .job-action-buttons {
            align-self: center !important;
          }
        }
        
        .section-header {
          flex-direction: column;
          align-items: flex-start !important;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .section-header {
            flex-direction: row;
            align-items: flex-end !important;
            justify-content: space-between !important;
          }
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(99, 102, 241, 0.1);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}
