import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth, API_BASE_URL, FILE_BASE_URL } from '../context/AuthContext';
import { User, FileText, Briefcase, Mail, Upload, CheckCircle2, ChevronRight, BookOpen, Star, AlertCircle, FileUp } from 'lucide-react';

export default function CandidateDashboard() {
  const { user, token, updateProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active tab state (default: 'applications')
  const currentTab = searchParams.get('tab') || 'applications';

  // Applications list states
  const [myApplications, setMyApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);

  // Profile forms states
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState(user?.skills || '');
  const [experience, setExperience] = useState(user?.experience || '');
  const [education, setEducation] = useState(user?.education || '');
  const [resumeFile, setResumeFile] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Sync profile state when user finishes loading
  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setSkills(user.skills || '');
      setExperience(user.experience || '');
      setEducation(user.education || '');
    }
  }, [user]);

  // Load applicant history
  useEffect(() => {
    async function fetchMyApplications() {
      if (!token) return;
      setLoadingApps(true);
      try {
        const response = await fetch(`${API_BASE_URL}/applications/candidate/my-applications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setMyApplications(data);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoadingApps(false);
      }
    }

    if (currentTab === 'applications') {
      fetchMyApplications();
    }
  }, [token, currentTab]);

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    setUpdatingProfile(true);

    try {
      const formData = new FormData();
      formData.append('bio', bio);
      formData.append('skills', skills);
      formData.append('experience', experience);
      formData.append('education', education);
      
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      await updateProfile(formData);
      setProfileSuccess(true);
      setResumeFile(null); // Clear selected file input
    } catch (err) {
      setProfileError(err.message || 'Failed to save changes');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px' }}>
      
      {/* Dashboard header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: 'white', marginBottom: '8px' }}>
          Candidate Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your professional profile, resume, and track your active job applications
        </p>
      </div>

      {/* Grid: Nav tabs on the left, details on the right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '32px'
      }} className="dashboard-grid">
        
        {/* Left Side: Navigation Tabs */}
        <aside>
          <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }} className="nav-card-tabs">
            <button
              onClick={() => handleTabChange('applications')}
              className="tab-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '14px 18px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: currentTab === 'applications' ? 'rgba(99, 102, 241, 0.15)' : 'none',
                color: currentTab === 'applications' ? '#a5b4fc' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'var(--transition)'
              }}
            >
              <Briefcase size={18} />
              <span>My Applications ({myApplications.length})</span>
            </button>

            <button
              onClick={() => handleTabChange('profile')}
              className="tab-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '14px 18px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: currentTab === 'profile' ? 'rgba(99, 102, 241, 0.15)' : 'none',
                color: currentTab === 'profile' ? '#a5b4fc' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'var(--transition)'
              }}
            >
              <User size={18} />
              <span>Professional Profile</span>
            </button>
          </div>
        </aside>

        {/* Right Side: Tab Contents */}
        <main>
          
          {/* TAB 1: APPLICATIONS TRACKING */}
          {currentTab === 'applications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'white', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                Job Applications Tracker
              </h2>

              {loadingApps ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                  <div className="spinner" />
                </div>
              ) : myApplications.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                  <Briefcase size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                  <h3>No Applications Yet</h3>
                  <p style={{ marginTop: '8px' }}>You haven't applied to any job postings yet.</p>
                  <button onClick={() => navigate('/jobs')} className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
                    Browse Jobs Now
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {myApplications.map((app) => (
                    <div key={app.id} className="glass-card" style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      padding: '24px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: '16px'
                      }} className="app-header-row">
                        <div>
                          <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '2px' }}>
                            {app.job_title}
                          </h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            <strong>{app.job_company}</strong> • <span style={{ color: 'var(--text-muted)' }}>{app.job_location}</span>
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className={`badge ${
                            app.status === 'Accepted' ? 'badge-success' :
                            app.status === 'Rejected' ? 'badge-danger' :
                            app.status === 'Interviewing' ? 'badge-warning' : 'badge-primary'
                          }`} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                            {app.status}
                          </span>
                        </div>
                      </div>

                      {/* Display Cover letter they submitted */}
                      {app.cover_letter && (
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Cover Letter Sent</span>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                            {app.cover_letter}
                          </p>
                        </div>
                      )}

                      <div style={{
                        display: 'flex',
                        justifyContent: 'between',
                        alignItems: 'center',
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '16px',
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }} className="app-footer-row">
                        <span>Applied on {new Date(app.created_at).toLocaleDateString()}</span>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <a href={`${FILE_BASE_URL}${app.resume_url}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                            View Resume Submitted
                          </a>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE MANAGEMENT */}
          {currentTab === 'profile' && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'white', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                Your Professional Profile
              </h2>

              {profileSuccess && (
                <div style={{
                  background: 'var(--success-bg)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  color: '#a7f3d0',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={18} />
                  <span>Your changes and documents have been saved successfully!</span>
                </div>
              )}

              {profileError && (
                <div style={{
                  background: 'var(--danger-bg)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  color: '#fca5a5',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={18} />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Resume Upload Box */}
                <div className="form-group">
                  <label className="form-label">Resume Document</label>
                  
                  {user?.resume_url && (
                    <div style={{
                      padding: '12px 16px',
                      background: 'rgba(99, 102, 241, 0.05)',
                      border: '1px dashed rgba(99, 102, 241, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '14px',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={18} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontSize: '0.9rem', color: 'white', fontWeight: 500 }}>Saved Resume Document</span>
                      </div>
                      <a
                        href={`${FILE_BASE_URL}${user.resume_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        View Resume
                      </a>
                    </div>
                  )}

                  <div style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px',
                    textAlign: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }} onMouseEnter={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.4)'} onMouseLeave={(e) => e.target.style.borderColor = 'var(--border-color)'}>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                    <FileUp size={28} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                    <div style={{ fontSize: '0.95rem', color: 'white', fontWeight: 500 }}>
                      {resumeFile ? resumeFile.name : 'Upload new resume document (PDF or Word)'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Replaces existing resume document. Max 5MB file limit.
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Professional Summary (Bio)</label>
                  <textarea
                    className="form-input"
                    placeholder="Short introduction about yourself, career goals, etc..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Skills</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. React, Node.js, PostgreSQL, JavaScript (comma separated)"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Employment Experience</label>
                  <textarea
                    className="form-input"
                    placeholder="List companies, job titles, years, and your main duties/achievements..."
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Education Background</label>
                  <textarea
                    className="form-input"
                    placeholder="List degrees, universities, certifications, graduation dates..."
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }} disabled={updatingProfile}>
                  {updatingProfile ? 'Saving updates...' : 'Save Profile Details'}
                </button>

              </form>
            </div>
          )}

        </main>
      </div>

      <style>{`
        .dashboard-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 992px) {
          .dashboard-grid {
            grid-template-columns: 280px 1fr;
          }
        }
        
        .app-header-row {
          flex-direction: column;
          align-items: flex-start !important;
          gap: 12px;
        }
        @media (min-width: 576px) {
          .app-header-row {
            flex-direction: row;
            align-items: center !important;
            justify-content: space-between !important;
          }
        }
        
        .app-footer-row {
          flex-direction: column;
          align-items: flex-start !important;
          gap: 12px;
        }
        @media (min-width: 576px) {
          .app-footer-row {
            flex-direction: row;
            align-items: center !important;
            justify-content: space-between !important;
          }
        }
        
        .nav-card-tabs {
          flex-direction: row !important;
          overflow-x: auto;
          gap: 12px;
        }
        @media (min-width: 992px) {
          .nav-card-tabs {
            flex-direction: column !important;
            overflow-x: visible;
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
