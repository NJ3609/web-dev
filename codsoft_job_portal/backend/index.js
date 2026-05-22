import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

import { query, initDb, getDbType } from './db.js';
import { authenticateToken, authorizeEmployer, authorizeCandidate } from './middleware/auth.js';
import { 
  sendApplicationSuccessEmail, 
  sendEmployerNotificationEmail, 
  sendStatusUpdateEmail 
} from './services/email.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjobboardtokenkey2026';

const app = express();

// Enable CORS
app.use(cors({
  origin: '*', // Allow all origins for the demo
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Set up upload directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// Serve frontend static build files (HTML/CSS/JS)
const frontendDistDir = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistDir)) {
  app.use(express.static(frontendDistDir));
}

// Multer config for resume uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx|png|jpg|jpeg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only documents (PDF, DOC, DOCX) and images are allowed!'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});


// -------------------------------------------------------------
// ROUTES: AUTHENTICATION
// -------------------------------------------------------------

// Register user
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (role !== 'employer' && role !== 'candidate') {
    return res.status(400).json({ message: 'Role must be employer or candidate' });
  }

  try {
    // Check if user already exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    let userResult;
    const dbType = getDbType();
    
    if (dbType === 'postgres') {
      userResult = await query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        [name, email.toLowerCase().trim(), passwordHash, role]
      );
    } else {
      // SQLite: RETURNING is supported in modern versions
      userResult = await query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        [name, email.toLowerCase().trim(), passwordHash, role]
      );
    }

    const newUser = userResult.rows[0];

    // Create blank profile
    await query('INSERT INTO profiles (user_id) VALUES ($1)', [newUser.id]);

    // Create token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user dashboard / profile data
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
              p.resume_url, p.bio, p.skills, p.experience, p.education,
              p.company_name, p.company_website, p.company_logo
       FROM users u 
       LEFT JOIN profiles p ON u.id = p.user_id 
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Fetch user details error:', err);
    res.status(500).json({ message: 'Server error fetching user details' });
  }
});


// -------------------------------------------------------------
// ROUTES: JOBS
// -------------------------------------------------------------

// Get jobs (supports search query, location, and type filters)
app.get('/api/jobs', async (req, res) => {
  const { search, location, type } = req.query;

  try {
    let sql = `
      SELECT j.*, u.name as employer_name, p.company_logo
      FROM jobs j
      JOIN users u ON j.employer_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (search) {
      sql += ` AND (LOWER(j.title) LIKE $${paramIndex} OR LOWER(j.company) LIKE $${paramIndex} OR LOWER(j.description) LIKE $${paramIndex})`;
      params.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    if (location) {
      sql += ` AND LOWER(j.location) LIKE $${paramIndex}`;
      params.push(`%${location.toLowerCase()}%`);
      paramIndex++;
    }

    if (type && type !== 'All') {
      sql += ` AND LOWER(j.type) = LOWER($${paramIndex})`;
      params.push(type);
      paramIndex++;
    }

    sql += ` ORDER BY j.created_at DESC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
});

// Get employer's posted jobs
app.get('/api/jobs/employer/my-jobs', authenticateToken, authorizeEmployer, async (req, res) => {
  try {
    // Count applications for each job as well
    const sql = `
      SELECT j.*, COUNT(a.id) as application_count
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE j.employer_id = $1
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `;
    const result = await query(sql, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching employer jobs:', err);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
});

// Get single job details
app.get('/api/jobs/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT j.*, u.name as employer_name, u.email as employer_email, 
              p.company_website, p.company_logo, p.bio as company_bio
       FROM jobs j
       JOIN users u ON j.employer_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE j.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching job detail:', err);
    res.status(500).json({ message: 'Server error fetching job details' });
  }
});

// Create job posting
app.post('/api/jobs', authenticateToken, authorizeEmployer, async (req, res) => {
  const { title, company, location, type, salary, experience_level, description, requirements } = req.body;

  if (!title || !company || !location || !type || !description || !requirements) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  try {
    const result = await query(
      `INSERT INTO jobs (employer_id, title, company, location, type, salary, experience_level, description, requirements)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [req.user.id, title, company, location, type, salary, experience_level, description, requirements]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating job posting:', err);
    res.status(500).json({ message: 'Server error creating job posting' });
  }
});

// Update job posting
app.put('/api/jobs/:id', authenticateToken, authorizeEmployer, async (req, res) => {
  const { id } = req.params;
  const { title, company, location, type, salary, experience_level, description, requirements } = req.body;

  try {
    // Check ownership
    const checkJob = await query('SELECT employer_id FROM jobs WHERE id = $1', [id]);
    if (checkJob.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (checkJob.rows[0].employer_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to update this job' });
    }

    const result = await query(
      `UPDATE jobs 
       SET title = $1, company = $2, location = $3, type = $4, salary = $5, 
           experience_level = $6, description = $7, requirements = $8
       WHERE id = $9 RETURNING *`,
      [title, company, location, type, salary, experience_level, description, requirements, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating job posting:', err);
    res.status(500).json({ message: 'Server error updating job posting' });
  }
});

// Delete job posting
app.delete('/api/jobs/:id', authenticateToken, authorizeEmployer, async (req, res) => {
  const { id } = req.params;

  try {
    // Check ownership
    const checkJob = await query('SELECT employer_id FROM jobs WHERE id = $1', [id]);
    if (checkJob.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (checkJob.rows[0].employer_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this job' });
    }

    await query('DELETE FROM jobs WHERE id = $1', [id]);
    res.json({ message: 'Job posting successfully deleted' });
  } catch (err) {
    console.error('Error deleting job:', err);
    res.status(500).json({ message: 'Server error deleting job posting' });
  }
});


// -------------------------------------------------------------
// ROUTES: PROFILE MANAGEMENT
// -------------------------------------------------------------

// Update user profile (supporting resume file upload)
app.put('/api/profile', authenticateToken, upload.single('resume'), async (req, res) => {
  const { bio, skills, experience, education, company_name, company_website } = req.body;
  const userId = req.user.id;

  try {
    // Check current profile
    const currentProfile = await query('SELECT resume_url FROM profiles WHERE user_id = $1', [userId]);
    
    let resumeUrl = currentProfile.rows[0]?.resume_url;
    if (req.file) {
      // Create path
      resumeUrl = `/uploads/${req.file.filename}`;
    }

    // Update profiles table
    await query(
      `UPDATE profiles 
       SET resume_url = $1, bio = $2, skills = $3, experience = $4, education = $5, 
           company_name = $6, company_website = $7
       WHERE user_id = $8`,
      [
        resumeUrl,
        bio || '',
        skills || '',
        experience || '',
        education || '',
        company_name || '',
        company_website || '',
        userId
      ]
    );

    // Fetch updated profile and user
    const updated = await query(
      `SELECT u.id, u.name, u.email, u.role,
              p.resume_url, p.bio, p.skills, p.experience, p.education,
              p.company_name, p.company_website, p.company_logo
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [userId]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});


// -------------------------------------------------------------
// ROUTES: APPLICATIONS
// -------------------------------------------------------------

// Apply for a job (candidate only, with optional new resume upload)
app.post('/api/applications', authenticateToken, authorizeCandidate, upload.single('resume'), async (req, res) => {
  const { jobId, coverLetter } = req.body;
  const candidateId = req.user.id;

  if (!jobId) {
    return res.status(400).json({ message: 'Job ID is required' });
  }

  try {
    // Check if candidate already applied for this job
    const checkApp = await query(
      'SELECT id FROM applications WHERE job_id = $1 AND candidate_id = $2',
      [jobId, candidateId]
    );

    if (checkApp.rows.length > 0) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Determine resume URL
    let resumeUrl = '';

    if (req.file) {
      resumeUrl = `/uploads/${req.file.filename}`;
      // Also update candidate's profile resume url for future applications
      await query('UPDATE profiles SET resume_url = $1 WHERE user_id = $2', [resumeUrl, candidateId]);
    } else {
      // Try to get resume from profile
      const profile = await query('SELECT resume_url FROM profiles WHERE user_id = $1', [candidateId]);
      resumeUrl = profile.rows[0]?.resume_url;

      if (!resumeUrl) {
        return res.status(400).json({ message: 'Resume is required. Please upload one.' });
      }
    }

    // Create the application
    const appResult = await query(
      `INSERT INTO applications (job_id, candidate_id, cover_letter, resume_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [jobId, candidateId, coverLetter || '', resumeUrl]
    );

    const application = appResult.rows[0];

    // Fetch information for email notifications
    const details = await query(
      `SELECT j.title as job_title, j.company as job_company, j.employer_id,
              u_cand.name as candidate_name, u_cand.email as candidate_email,
              u_emp.name as employer_name, u_emp.email as employer_email
       FROM jobs j
       JOIN users u_cand ON u_cand.id = $2
       JOIN users u_emp ON u_emp.id = j.employer_id
       WHERE j.id = $1`,
      [jobId, candidateId]
    );

    const info = details.rows[0];

    if (info) {
      // Send application confirmation email to candidate
      await sendApplicationSuccessEmail(
        info.candidate_email,
        info.candidate_name,
        info.job_title,
        info.job_company
      );

      // Send application alert email to employer
      await sendEmployerNotificationEmail(
        info.employer_email,
        info.employer_name,
        info.candidate_name,
        info.job_title
      );
    }

    res.status(201).json(application);
  } catch (err) {
    console.error('Error applying for job:', err);
    res.status(500).json({ message: 'Server error processing application' });
  }
});

// Get applications submitted by the logged-in candidate
app.get('/api/applications/candidate/my-applications', authenticateToken, authorizeCandidate, async (req, res) => {
  try {
    const result = await query(
      `SELECT a.id, a.cover_letter, a.resume_url, a.status, a.created_at,
              j.id as job_id, j.title as job_title, j.company as job_company, 
              j.location as job_location, j.type as job_type, j.salary
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.candidate_id = $1
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching candidate applications:', err);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
});

// Get applications for a specific job (employer only, owner checking)
app.get('/api/applications/job/:jobId', authenticateToken, authorizeEmployer, async (req, res) => {
  const { jobId } = req.params;

  try {
    // Check job ownership
    const checkJob = await query('SELECT employer_id FROM jobs WHERE id = $1', [jobId]);
    if (checkJob.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (checkJob.rows[0].employer_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to view applications for this job' });
    }

    const result = await query(
      `SELECT a.id, a.cover_letter, a.resume_url, a.status, a.created_at,
              u.id as candidate_id, u.name as candidate_name, u.email as candidate_email,
              p.bio as candidate_bio, p.skills as candidate_skills, 
              p.experience as candidate_experience, p.education as candidate_education
       FROM applications a
       JOIN users u ON a.candidate_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE a.job_id = $1
       ORDER BY a.created_at DESC`,
      [jobId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching job applications:', err);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
});

// Update application status (employer only, owner checking)
app.patch('/api/applications/:id/status', authenticateToken, authorizeEmployer, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Applied', 'Reviewed', 'Interviewing', 'Accepted', 'Rejected'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid application status' });
  }

  try {
    // Check ownership of the job related to this application
    const checkApp = await query(
      `SELECT a.id, j.employer_id, j.title as job_title, j.company as job_company,
              u_cand.name as candidate_name, u_cand.email as candidate_email
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN users u_cand ON a.candidate_id = u_cand.id
       WHERE a.id = $1`,
      [id]
    );

    if (checkApp.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (checkApp.rows[0].employer_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to manage this application' });
    }

    // Update status
    const result = await query(
      'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    // Send email notification to candidate
    const appInfo = checkApp.rows[0];
    await sendStatusUpdateEmail(
      appInfo.candidate_email,
      appInfo.candidate_name,
      appInfo.job_title,
      appInfo.job_company,
      status
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating application status:', err);
    res.status(500).json({ message: 'Server error updating application status' });
  }
});

// Wildcard fallback: Serve index.html for all non-API paths to support React Router refresh
if (fs.existsSync(frontendDistDir)) {
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(frontendDistDir, 'index.html'));
    }
  });
}


// Start server and initialize DB
app.listen(PORT, async () => {
  console.log(`🚀 Job Board Backend Server running on http://localhost:${PORT}`);
  await initDb();
});
