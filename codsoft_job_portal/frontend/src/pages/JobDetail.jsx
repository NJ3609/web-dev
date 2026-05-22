import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth, API_BASE_URL, FILE_BASE_URL } from '../context/AuthContext';
import { ArrowLeft, Calendar, MapPin, DollarSign, Briefcase, FileText, ChevronRight, CheckCircle, AlertCircle, Upload } from 'lucide-react';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Application form states
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [useProfileResume, setUseProfileResume] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    async function fetchJobDetail() {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
        if (!response.ok) {
          throw new Error('Job posting not found');
        }
        const data = await response.json();
        setJob(data);

        // If candidate is logged in, check if they already applied
        if (user && user.role === 'candidate') {
          const appsRes = await fetch(`${API_BASE_URL}/applications/candidate/my-applications`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (appsRes.ok) {
            const apps = await appsRes.json();
            const alreadyApplied = apps.some(app => app.job_id === parseInt(id));
            setApplied(alreadyApplied);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    }
    fetchJobDetail();
  }, [id, user, token]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyError('');
    setSubmitting(true);

    if (!useProfileResume && !resumeFile) {
      setApplyError('Please upload a resume file');
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('jobId', id);
      formData.append('coverLetter', coverLetter);
      
      if (!useProfileResume && resumeFile) {
        formData.append('resume', resumeFile);
      }

      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application');
      }

      setApplied(true);
    } catch (err) {
      setApplyError(err.message || 'Something went wrong while applying');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: '600px' }}>
        <div className="glass-card" style={{ textAlign: 'center', background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle size={40} style={{ color: '#fca5a5', marginBottom: '16px' }} />
          <h2 style={{ color: '#fca5a5' }}>Job Details Unretrievable</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{error || 'This job opening could not be loaded.'}</p>
          <Link to="/jobs" className="btn btn-secondary btn-sm" style={{ marginTop: '20px' }}>
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px', maxWidth: '1000px' }}>
      
      {/* Back Button */}
      <Link to="/jobs" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: 'var(--text-secondary)',
        fontSize: '0.95rem',
        marginBottom: '32px',
        transition: 'var(--transition)'
      }} onMouseEnter={(e) => e.target.style.color = '#white'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
        <ArrowLeft size={16} /> Back to Job Search
      </Link>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '32px'
      }} className="detail-layout-grid">
        
        {/* Left Side: Job Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Header Card */}
          <div className="glass-card" style={{ display: 'flex', gap: '24px', alignItems: 'center' }} className="detail-header-card">
            {/* Logo */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'white',
              fontSize: '1.5rem',
              flexShrink: 0
            }}>
              {job.company.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                {job.title}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <strong style={{ color: 'white' }}>{job.company}</strong>
                {job.company_website && (
                  <a href={job.company_website.startsWith('http') ? job.company_website : `https://${job.company_website}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>
                    Website
                  </a>
                )}
                • <span>{job.location}</span>
              </p>
            </div>
          </div>

          {/* Job Overview Grid Details */}
          <div className="glass-card" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', borderRadius: 'var(--radius-sm)' }}>
                <Briefcase size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Job Type</div>
                <div style={{ fontWeight: 600 }}>{job.type}</div>
              </div>
            </div>

            {job.salary && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#a7f3d0', borderRadius: 'var(--radius-sm)' }}>
                  <DollarSign size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Salary Offer</div>
                  <div style={{ fontWeight: 600, color: 'var(--success)' }}>{job.salary}</div>
                </div>
              </div>
            )}

            {job.experience_level && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', background: 'rgba(6, 182, 212, 0.1)', color: '#cffafe', borderRadius: 'var(--radius-sm)' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Experience</div>
                  <div style={{ fontWeight: 600 }}>{job.experience_level}</div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', background: 'rgba(236, 72, 153, 0.1)', color: '#fbcfe8', borderRadius: 'var(--radius-sm)' }}>
                <Calendar size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Posted On</div>
                <div style={{ fontWeight: 600 }}>{new Date(job.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'white', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              Job Description
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {job.description}
            </p>
          </div>

          {/* Requirements Section */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'white', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              Job Requirements
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {job.requirements}
            </p>
          </div>

        </div>

        {/* Right Side: Apply Section */}
        <aside style={{ height: 'fit-content' }}>
          <div className="glass-card" style={{ padding: '30px' }}>
            {applied ? (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', py: '20px' }}>
                <div style={{ display: 'inline-flex', alignSelf: 'center', padding: '12px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: '50%' }}>
                  <CheckCircle size={40} />
                </div>
                <div>
                  <h3 style={{ color: 'white', marginBottom: '8px' }}>Application Submitted!</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    You have successfully applied for this position. A confirmation email has been logged by the system.
                  </p>
                </div>
                {user && user.role === 'candidate' && (
                  <Link to="/candidate" className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>
                    View Status in Dashboard
                  </Link>
                )}
              </div>
            ) : !user ? (
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <h3 style={{ color: 'white', marginBottom: '12px' }}>Interested in this Role?</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
                  Log in or register to submit your resume and apply to this job opening.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link to={`/login?redirect=/jobs/${id}`} className="btn btn-primary" style={{ width: '100%' }}>
                    Log In to Apply
                  </Link>
                  <Link to={`/register?redirect=/jobs/${id}`} className="btn btn-secondary" style={{ width: '100%' }}>
                    Create Account
                  </Link>
                </div>
              </div>
            ) : user.role === 'employer' ? (
              <div style={{ textAlign: 'center', padding: '10px', color: 'var(--text-secondary)' }}>
                <Briefcase size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <h3 style={{ color: 'white', marginBottom: '8px' }}>Employer Account</h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                  This is an Employer account. Employers cannot apply to job postings. 
                </p>
                {job.employer_id === user.id ? (
                  <Link to="/employer" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                    Manage This Listing
                  </Link>
                ) : (
                  <Link to="/employer" className="btn btn-secondary" style={{ width: '100%', marginTop: '16px' }}>
                    Go to Dashboard
                  </Link>
                )}
              </div>
            ) : (
              // Candidate Application Form
              <div>
                <h3 style={{ color: 'white', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  Submit Application
                </h3>

                {applyError && (
                  <div style={{
                    background: 'var(--danger-bg)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    color: '#fca5a5',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{applyError}</span>
                  </div>
                )}

                <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Cover Letter */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Cover Letter</label>
                    <textarea
                      className="form-input"
                      placeholder="Explain why you are a great fit for this role..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      required
                    />
                  </div>

                  {/* Resume Choice */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Resume Document</label>
                    
                    {user.resume_url ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                          <input
                            type="checkbox"
                            checked={useProfileResume}
                            onChange={(e) => setUseProfileResume(e.target.checked)}
                            style={{ accentColor: 'var(--primary)' }}
                          />
                          <span>Use profile resume on file</span>
                        </label>
                        {useProfileResume && (
                          <div style={{
                            padding: '8px 12px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px dashed var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <FileText size={14} style={{ color: 'var(--primary)' }} />
                            <a href={`${FILE_BASE_URL}${user.resume_url}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                              View Saved Resume
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      // If no resume, force upload
                      <div style={{ fontSize: '0.85rem', color: 'var(--warning)', marginBottom: '8px' }}>
                        You don't have a saved resume. Please upload one below.
                      </div>
                    )}

                    {(!useProfileResume || !user.resume_url) && (
                      <div style={{
                        marginTop: '10px',
                        border: '2px dashed var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '20px',
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
                          required={!useProfileResume || !user.resume_url}
                        />
                        <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                        <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: 500 }}>
                          {resumeFile ? resumeFile.name : 'Upload PDF/Word document'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Max file size 5MB
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting Application...' : 'Send Application'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </aside>

      </div>

      <style>{`
        .detail-layout-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 992px) {
          .detail-layout-grid {
            grid-template-columns: 1fr 340px;
          }
        }
        
        .detail-header-card {
          flex-direction: column;
          align-items: flex-start !important;
          gap: 16px;
        }
        @media (min-width: 576px) {
          .detail-header-card {
            flex-direction: row;
            align-items: center !important;
            gap: 24px;
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
