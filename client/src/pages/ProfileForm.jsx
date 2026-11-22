import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfileForm = () => {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const [education, setEducation] = useState([
    { institution: '', degree: '', fieldOfStudy: '', startYear: 2020, endYear: 2024 }
  ]);

  const [experience, setExperience] = useState([
    {
      company: '',
      role: '',
      duration: '',
      responsibilities: ''
    }
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch current user profile
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await authFetch('/api/profile');
        const json = await res.json();

        if (json.success && json.data && isMounted) {
          if (json.data.skills && json.data.skills.length > 0) {
            setSkills(json.data.skills);
          }
          if (json.data.education && json.data.education.length > 0) {
            setEducation(json.data.education);
          }
          if (json.data.experience && json.data.experience.length > 0) {
            setExperience(json.data.experience);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [authFetch]);

  // Skill tag handlers
  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Education handlers
  const handleAddEducation = () => {
    setEducation([
      ...education,
      { institution: '', degree: '', fieldOfStudy: '', startYear: 2021, endYear: 2025 }
    ]);
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = field.includes('Year') ? Number(value) : value;
    setEducation(updated);
  };

  // Experience handlers
  const handleAddExperience = () => {
    setExperience([
      ...experience,
      { company: '', role: '', duration: '', responsibilities: '' }
    ]);
  };

  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (index, field, value) => {
    const updated = [...experience];
    updated[index][field] = value;
    setExperience(updated);
  };

  // Submit profile to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (skills.length === 0) {
      setErrorMsg('Please specify at least one skill in your profile');
      return;
    }

    try {
      setSaving(true);
      const res = await authFetch('/api/profile', {
        method: 'POST',
        body: JSON.stringify({
          skills,
          education,
          experience
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to save profile');
      }

      setSuccessMsg('Profile saved successfully! You are ready to generate tailored resumes and interview prep.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMsg(err.message || 'Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  // Pre-fill sample profile for fast onboarding / demonstration
  const handleFillSampleData = () => {
    setSkills(['JavaScript', 'React.js', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'Git', 'System Design']);
    setEducation([
      {
        institution: 'Stanford University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startYear: 2019,
        endYear: 2023
      }
    ]);
    setExperience([
      {
        company: 'Apex Cloud Innovations',
        role: 'Full Stack Software Engineer',
        duration: '2023 - Present',
        responsibilities: 'Built scalable backend microservices, optimized database query latency by 35%, and developed real-time dashboard components in React.'
      },
      {
        company: 'NexGen Digital Labs',
        role: 'Junior Frontend Developer Intern',
        duration: '2022 - 2023',
        responsibilities: 'Engineered responsive user interfaces, integrated RESTful APIs, and maintained unit test suites achieving 88% code coverage.'
      }
    ]);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="spinner spinner-dark" style={{ width: '2rem', height: '2rem' }}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading your profile data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>Candidate Career Profile</h2>
          <p className="card-subtitle">
            Keep your skills, educational qualifications, and work history updated so our AI model can tailor your resumes and mock interviews.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleFillSampleData}
          >
            ⚡ Load Sample Data
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard →
          </button>
        </div>
      </div>

      {location.state?.welcome && (
        <div className="alert alert-info">
          👋 Welcome to CareerCoach! Please complete your career profile below before generating resumes or mock interviews.
        </div>
      )}

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <form onSubmit={handleSubmit}>
        {/* Skills Section */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">1. Technical & Professional Skills</h3>
              <p className="card-subtitle">Enter your core competencies, technologies, frameworks, and domains.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Node.js, React, Docker, Python..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddSkill}
            >
              Add Skill
            </button>
          </div>

          <div className="tags-container">
            {skills.map((skill) => (
              <span key={skill} className="tag-pill">
                {skill}
                <button
                  type="button"
                  className="tag-remove-btn"
                  onClick={() => handleRemoveSkill(skill)}
                  title="Remove skill"
                >
                  &times;
                </button>
              </span>
            ))}
            {skills.length === 0 && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                No skills added yet. Type a skill and click "Add Skill" or press Enter.
              </span>
            )}
          </div>
        </div>

        {/* Education Section */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">2. Education & Academic Background</h3>
              <p className="card-subtitle">Add your degrees, institutions, and graduation timelines.</p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleAddEducation}
            >
              + Add Education
            </button>
          </div>

          {education.map((edu, idx) => (
            <div key={idx} className="sub-card">
              <div className="sub-card-header">
                <span className="sub-card-title">Education #{idx + 1}</span>
                {education.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleRemoveEducation(idx)}
                  >
                    Delete Entry
                  </button>
                )}
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Institution / University *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Stanford University"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Degree *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Bachelor of Science"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Field of Study *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Computer Science"
                    value={edu.fieldOfStudy}
                    onChange={(e) => handleEducationChange(idx, 'fieldOfStudy', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Year *</label>
                  <input
                    type="number"
                    className="form-control"
                    min={1960}
                    max={2099}
                    value={edu.startYear}
                    onChange={(e) => handleEducationChange(idx, 'startYear', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Year (or Expected)</label>
                  <input
                    type="number"
                    className="form-control"
                    min={1960}
                    max={2099}
                    value={edu.endYear || ''}
                    onChange={(e) => handleEducationChange(idx, 'endYear', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Work Experience Section */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">3. Professional Experience</h3>
              <p className="card-subtitle">List your employment history, roles, key achievements, and responsibilities.</p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleAddExperience}
            >
              + Add Experience
            </button>
          </div>

          {experience.map((exp, idx) => (
            <div key={idx} className="sub-card">
              <div className="sub-card-header">
                <span className="sub-card-title">Experience #{idx + 1}</span>
                {experience.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleRemoveExperience(idx)}
                  >
                    Delete Entry
                  </button>
                )}
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Apex Cloud Solutions"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Role / Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Full Stack Engineer"
                    value={exp.role}
                    onChange={(e) => handleExperienceChange(idx, 'role', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 2022 - Present or 2 years"
                    value={exp.duration}
                    onChange={(e) => handleExperienceChange(idx, 'duration', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Core Responsibilities & Achievements *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Detail the technologies leveraged, systems developed, and measurable impacts achieved..."
                  value={exp.responsibilities}
                  onChange={(e) => handleExperienceChange(idx, 'responsibilities', e.target.value)}
                  required
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ minWidth: '180px' }}
          >
            {saving ? (
              <>
                <span className="spinner"></span> Saving Profile...
              </>
            ) : (
              'Save Profile Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
