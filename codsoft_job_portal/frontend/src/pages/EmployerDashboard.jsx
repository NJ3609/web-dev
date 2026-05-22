import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth, API_BASE_URL, FILE_BASE_URL } from '../context/AuthContext';
import { Briefcase, Building, FileText, Send, User, Link as LinkIcon, PlusCircle, CheckCircle2, ChevronRight, Eye, Trash2, Mail, ExternalLink, Calendar, AlertCircle } from 'lucide-react';

export default function EmployerDashboard() {
  const { user, token, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected tab state (default: 'jobs')
  const currentTab = searchParams.get('tab') || 'jobs';

  // State arrays
  const [myJobs, setMyJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [selectedJobForApps, setSelectedJobForApps] = useState(null);
  const [jobApplications, setJobApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // Form states - Profile
  const [companyName, setCompanyName] = useState(user?.company_name || '');
  const [companyWebsite, setCompanyWebsite] = useState(user?.company_website || '');
  const [companyBio, setCompanyBio] = useState(user?.bio || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Form states - Create Job
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState(user?.company_name || '');
  const [jobLocation, setJobLocation] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [jobSalary, setJobSalary] = useState('');
  const [jobExpLevel, setJobExpLevel] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobReqs, setJobReqs] = useState('');
  const [postingJob, setPostingJob] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [postError, setPostError] = useState('');

  // Auto-sync form if user finishes loading
  useEffect(() => {
    if (user) {
      setCompanyName(user.company_name || '');
      setCompanyWebsite(user.company_website || '');
      setCompanyBio(user.bio || '');
      if (!jobCompany) setJobCompany(user.company_name || '');
    }
  }, [user]);

  // Load posted jobs
  const fetchMyJobs = async () => {
    if (!token) return;
    setLoadingJobs(true);
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/employer/my-jobs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMyJobs(data);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, [token, currentTab]);

  // Load applications for a specific job
  const handleViewApplications = async (job) => {
    setSelectedJobForApps(job);
    setLoadingApps(true);
    try {
      const response = await fetch(`${API_BASE_URL}/applications/job/${job.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setJobApplications(data);
      }
    } catch (err) {
      console.error('Error fetching job applications:', err);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleUpdateAppStatus = async (appId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local list
        setJobApplications(prev =>
          prev.map(app => app.id === appId ? { ...app, status: newStatus } : app)
        );
        // Refresh list counts
        fetchMyJobs();
      }
    } catch (err) {
      console.error('Error updating application status:', err);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMyJobs(prev => prev.filter(job => job.id !== jobId));
        if (selectedJobForApps?.id === jobId) {
          setSelectedJobForApps(null);
          setJobApplications([]);
        }
      }
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  // Submit Profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    setUpdatingProfile(true);

    try {
      const formData = new FormData();
      formData.append('company_name', companyName);
      formData.append('company_website', companyWebsite);
      formData.append('bio', companyBio);

      await updateProfile(formData);
      setProfileSuccess(true);
    } catch (err) {
      setProfileError(err.message || 'Failed to update company profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Submit Job posting
  const handlePostJob = async (e) => {
    e.preventDefault();
    setPostError('');
    setPostSuccess(false);
    setPostingJob(true);

    try {
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: jobTitle,
          company: jobCompany,
          location: jobLocation,
          type: jobType,
          salary: jobSalary,
          experience_level: jobExpLevel,
          description: jobDesc,
          requirements: jobReqs
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to post job');
      }

      setPostSuccess(true);
      // Clear forms
      setJobTitle('');
      setJobLocation('');
      setJobSalary('');
      setJobExpLevel('');
      setJobDesc('');
      setJobReqs('');
    } catch (err) {
      setPostError(err.message || 'Failed to publish job posting');
    } finally {
      setPostingJob(false);
    }
  };

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
    setSelectedJobForApps(null);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px' }}>
      
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'between',
        alignItems: 'center',
        marginBottom: '40px',
        flexWrap: 'wrap',
        gap: '20px'
      }} className="welcome-banner">
        <div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: 'white' }}>
            Employer Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage company openings, review applicants, and publish job vacancies
          </p>
        </div>
        <button onClick={() => handleTabChange('post-job')} className="btn btn-primary" style={{ gap: '6px' }}>
          <PlusCircle size={18} /> Post a Job
        </button>
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
              onClick={() => handleTabChange('jobs')}
              className="tab-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '14px 18px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: currentTab === 'jobs' ? 'rgba(99, 102, 241, 0.15)' : 'none',
                color: currentTab === 'jobs' ? '#a5b4fc' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'var(--transition)'
              }}
            >
              <Briefcase size={18} />
              <span>My Job Postings</span>
            </button>

            <button
              onClick={() => handleTabChange('post-job')}
              className="tab-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '14px 18px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: currentTab === 'post-job' ? 'rgba(99, 102, 241, 0.15)' : 'none',
                color: currentTab === 'post-job' ? '#a5b4fc' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'var(--transition)'
              }}
            >
              <PlusCircle size={18} />
              <span>Post New Job</span>
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
              <Building size={18} />
              <span>Company Profile</span>
            </button>
          </div>
        </aside>

        {/* Right Side: Tab Contents */}
        <main>
          
          {/* TAB 1: LISTING POSTED JOBS / APPLICATIONS */}
          {currentTab === 'jobs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {!selectedJobForApps ? (
                <>
                  <h2 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    Active Job Openings
                  </h2>

                  {loadingJobs ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                      <div className="spinner" />
                    </div>
                  ) : myJobs.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                      <Briefcase size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                      <h3>No Job Postings Yet</h3>
                      <p style={{ marginTop: '8px' }}>Get started by publishing your first job listing.</p>
                      <button onClick={() => handleTabChange('post-job')} className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
                        Post a Job Now
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {myJobs.map((job) => (
                        <div key={job.id} className="glass-card" style={{
                          display: 'flex',
                          justifyContent: 'between',
                          alignItems: 'center',
                          padding: '24px',
                          gap: '20px',
                          flexWrap: 'wrap'
                        }} className="job-item-row">
                          
                          <div>
                            <span className="badge badge-primary" style={{ marginBottom: '8px' }}>{job.type}</span>
                            <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '4px' }}>{job.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                              {job.location} • {job.salary || 'Competitive Salary'}
                            </p>
                          </div>

                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <button
                              onClick={() => handleViewApplications(job)}
                              className="btn btn-secondary"
                              style={{ gap: '8px', fontSize: '0.9rem', padding: '10px 18px' }}
                            >
                              <Eye size={16} /> 
                              <span>Candidates ({job.application_count || 0})</span>
                            </button>
                            
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '11px' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // VIEW APPLICATIONS SUBVIEW
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }} className="sub-header-row">
                    <div>
                      <button onClick={() => setSelectedJobForApps(null)} style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        ← Back to active postings
                      </button>
                      <h2 style={{ fontSize: '1.6rem', color: 'white' }}>
                        Applicants for "{selectedJobForApps.title}"
                      </h2>
                    </div>
                  </div>

                  {loadingApps ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                      <div className="spinner" />
                    </div>
                  ) : jobApplications.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                      <User size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                      <h3>No Applicants Yet</h3>
                      <p style={{ marginTop: '6px' }}>No candidates have applied for this position yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {jobApplications.map((app) => (
                        <div key={app.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          
                          {/* Applicant Header */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'between',
                            alignItems: 'flex-start',
                            borderBottom: '1px solid var(--border-color)',
                            paddingBottom: '16px',
                            flexWrap: 'wrap',
                            gap: '16px'
                          }} className="app-header-row">
                            
                            <div>
                              <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '4px' }}>{app.candidate_name}</h3>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Mail size={14} /> {app.candidate_email}
                              </p>
                            </div>

                            {/* Status and Action Dropdown */}
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                              
                              <span className={`badge ${
                                app.status === 'Accepted' ? 'badge-success' :
                                app.status === 'Rejected' ? 'badge-danger' :
                                app.status === 'Interviewing' ? 'badge-warning' : 'badge-primary'
                              }`}>
                                {app.status}
                              </span>

                              <select
                                value={app.status}
                                onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)}
                                className="form-input"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '0.85rem',
                                  background: 'rgba(17, 24, 39, 0.8)',
                                  width: 'auto',
                                  cursor: 'pointer'
                                }}
                              >
                                <option value="Applied">Status: Applied</option>
                                <option value="Reviewed">Status: Reviewed</option>
                                <option value="Interviewing">Status: Interviewing</option>
                                <option value="Accepted">Status: Accepted</option>
                                <option value="Rejected">Status: Rejected</option>
                              </select>
                            </div>

                          </div>

                          {/* Applicant Bio Details */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="candidate-detail-grid">
                            
                            <div>
                              <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                Candidate Profile Details
                              </h4>
                              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                <strong>Skills:</strong> {app.candidate_skills || 'Not specified'}
                              </p>
                              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                <strong>Experience:</strong> {app.candidate_experience || 'Not specified'}
                              </p>
                              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <strong>Education:</strong> {app.candidate_education || 'Not specified'}
                              </p>
                            </div>

                            <div>
                              <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                Cover Letter
                              </h4>
                              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                                {app.cover_letter || 'No cover letter provided.'}
                              </p>
                            </div>

                          </div>

                          {/* Resume download */}
                          <div style={{
                            borderTop: '1px solid var(--border-color)',
                            paddingTop: '16px',
                            display: 'flex',
                            justifyContent: 'between',
                            alignItems: 'center'
                          }} className="app-footer-row">
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              Applied on {new Date(app.created_at).toLocaleDateString()}
                            </span>
                            <a
                              href={`${FILE_BASE_URL}${app.resume_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary btn-sm"
                              style={{ gap: '6px' }}
                            >
                              <FileText size={14} /> 
                              <span>Review Resume</span>
                              <ExternalLink size={12} />
                            </a>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: POST NEW JOB FORM */}
          {currentTab === 'post-job' && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'white', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                Publish a New Job Listing
              </h2>

              {postSuccess && (
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
                  <span>Job opening has been published successfully! Job seekers can now view and apply.</span>
                </div>
              )}

              {postError && (
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
                  <span>{postError}</span>
                </div>
              )}

              <form onSubmit={handlePostJob} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="form-row-grid">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Job Title</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Acme Corp"
                      value={jobCompany}
                      onChange={(e) => setJobCompany(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }} className="form-row-three-grid">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. San Francisco, CA or Remote"
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Job Type</label>
                    <select
                      className="form-input"
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      style={{ background: 'rgba(17, 24, 39, 0.8)', cursor: 'pointer' }}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Salary Range</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. $120k - $150k"
                      value={jobSalary}
                      onChange={(e) => setJobSalary(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Experience Level Required</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 3+ years experience, Senior level"
                    value={jobExpLevel}
                    onChange={(e) => setJobExpLevel(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Job Description</label>
                  <textarea
                    className="form-input"
                    placeholder="Provide a comprehensive job description, responsibilities, daily duties..."
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Requirements</label>
                  <textarea
                    className="form-input"
                    placeholder="Provide skills, education, tools, or general experience requirements..."
                    value={jobReqs}
                    onChange={(e) => setJobReqs(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', gap: '8px' }} disabled={postingJob}>
                  <Send size={18} />
                  {postingJob ? 'Publishing job...' : 'Publish Job Listing'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: COMPANY PROFILE MANAGEMENT */}
          {currentTab === 'profile' && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'white', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                Manage Company Profile
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
                  <span>Company profile updated successfully!</span>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="form-row-grid">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Acme Corp"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Company Website URL</label>
                    <div style={{ position: 'relative' }}>
                      <LinkIcon size={16} style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)'
                      }} />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="www.acmecorp.com"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        style={{ paddingLeft: '38px' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Company Biography / Description</label>
                  <textarea
                    className="form-input"
                    placeholder="Tell candidates about your company culture, mission, technology stack, and values..."
                    value={companyBio}
                    onChange={(e) => setCompanyBio(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }} disabled={updatingProfile}>
                  {updatingProfile ? 'Saving profile...' : 'Save Profile Changes'}
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
        
        .form-row-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .form-row-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        
        .form-row-three-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .form-row-three-grid {
            grid-template-columns: 1fr 1fr 1fr;
          }
        }
        
        .job-item-row {
          flex-direction: column;
          align-items: flex-start !important;
          gap: 16px;
        }
        @media (min-width: 576px) {
          .job-item-row {
            flex-direction: row;
            align-items: center !important;
            justify-content: space-between !important;
          }
        }
        
        .sub-header-row {
          flex-direction: column;
          align-items: flex-start !important;
          gap: 12px;
        }
        @media (min-width: 576px) {
          .sub-header-row {
            flex-direction: row;
            align-items: center !important;
            justify-content: space-between !important;
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
        
        .candidate-detail-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .candidate-detail-grid {
            grid-template-columns: 1fr 1fr;
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
        
        .welcome-banner {
          flex-direction: column;
          align-items: flex-start !important;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .welcome-banner {
            flex-direction: row;
            align-items: center !important;
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
