import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, Filter, RefreshCw, X, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../context/AuthContext';

export default function JobListings() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Local filter states (pre-populated from search params)
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [type, setType] = useState(searchParams.get('type') || 'All');
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch jobs whenever search query parameters change
  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError('');
      try {
        const query = new URLSearchParams();
        const searchVal = searchParams.get('search');
        const locVal = searchParams.get('location');
        const typeVal = searchParams.get('type');

        if (searchVal) query.append('search', searchVal);
        if (locVal) query.append('location', locVal);
        if (typeVal && typeVal !== 'All') query.append('type', typeVal);

        const response = await fetch(`${API_BASE_URL}/jobs?${query.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch job openings');
        }
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        setError(err.message || 'Something went wrong while loading jobs.');
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [searchParams]);

  // Sync inputs with search parameters if they are updated elsewhere
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setLocation(searchParams.get('location') || '');
    setType(searchParams.get('type') || 'All');
  }, [searchParams]);

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    const newParams = {};
    if (search) newParams.search = search;
    if (location) newParams.location = location;
    if (type && type !== 'All') newParams.type = type;
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearch('');
    setLocation('');
    setType('All');
    setSearchParams({});
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px' }}>
      
      {/* Page Title / Heading */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: 'white', marginBottom: '8px' }}>
          Explore Job Openings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Browse available positions, filter options, and find matching roles
        </p>
      </div>

      {/* Main Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '32px'
      }} className="listings-grid">
        
        {/* Filters Sidebar */}
        <aside style={{ height: 'fit-content' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '12px'
            }} className="sidebar-header">
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={18} style={{ color: 'var(--primary)' }} />
                <span>Filters</span>
              </h3>
              <button
                onClick={handleClearFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                <X size={14} /> Clear all
              </button>
            </div>

            <form onSubmit={handleApplyFilters} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Search Keywords */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Search Keywords</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Title, company, or key tech..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: '38px', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Location</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="City, remote, etc..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ paddingLeft: '38px', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Job Type Dropdown */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Job Type</label>
                <select
                  className="form-input"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={{
                    fontSize: '0.9rem',
                    background: 'rgba(17, 24, 39, 0.8)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="All">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}>
                Apply Filters
              </button>
            </form>
          </div>
        </aside>

        {/* Listings Section */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div className="spinner" />
            </div>
          ) : error ? (
            <div className="glass-card" style={{
              background: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              padding: '24px',
              textAlign: 'center'
            }}>
              <AlertCircle size={32} style={{ margin: '0 auto 12px auto' }} />
              <h3>Failed to Load Jobs</h3>
              <p style={{ marginTop: '8px' }}>{error}</p>
              <button onClick={() => setSearchParams(searchParams)} className="btn btn-secondary btn-sm" style={{ marginTop: '16px', gap: '6px' }}>
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass-card" style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: 'var(--text-secondary)'
            }}>
              <Briefcase size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3>No Jobs Match Your Criteria</h3>
              <p style={{ marginTop: '8px' }}>Try loosening your filters or searching for something else.</p>
              <button onClick={handleClearFilters} className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Results count */}
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', paddingLeft: '4px' }}>
                Showing <strong>{jobs.length}</strong> available job{jobs.length === 1 ? '' : 's'}
              </div>

              {/* Jobs List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {jobs.map((job) => (
                  <div key={job.id} className="glass-card job-item-hover" style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    transition: 'var(--transition)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'between',
                      alignItems: 'flex-start',
                      gap: '16px'
                    }} className="job-card-header">
                      
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        {/* Logo */}
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 700,
                          color: 'white',
                          fontSize: '1.1rem',
                          flexShrink: 0
                        }}>
                          {job.company.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '2px' }}>{job.title}</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            {job.company} • <span style={{ color: 'var(--text-muted)' }}>{job.location}</span>
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span className="badge badge-primary">{job.type}</span>
                      </div>
                    </div>

                    {/* Short Description snippet */}
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {job.description}
                    </p>

                    {/* Footer elements */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'between',
                      alignItems: 'center',
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '16px',
                      marginTop: '4px',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }} className="job-card-footer">
                      
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {job.salary && (
                          <span style={{ color: 'var(--success)' }}>
                            <strong>Salary:</strong> {job.salary}
                          </span>
                        )}
                        {job.experience_level && (
                          <span>
                            <strong>Exp:</strong> {job.experience_level}
                          </span>
                        )}
                      </div>

                      <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm" style={{ padding: '8px 16px' }}>
                        Apply Now
                      </Link>
                    </div>

                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      <style>{`
        .listings-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 992px) {
          .listings-grid {
            grid-template-columns: 300px 1fr;
          }
        }
        
        .job-card-header {
          flex-direction: column;
          align-items: flex-start;
        }
        @media (min-width: 576px) {
          .job-card-header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
        
        .job-card-footer {
          flex-direction: column;
          align-items: flex-start !important;
          gap: 12px;
        }
        @media (min-width: 576px) {
          .job-card-footer {
            flex-direction: row;
            align-items: center !important;
            justify-content: space-between !important;
          }
        }
        
        .sidebar-header {
          flex-direction: row !important;
          justify-content: space-between !important;
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
