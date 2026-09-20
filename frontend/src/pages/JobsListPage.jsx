import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

export function JobsListPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function loadJobs() {
    setLoading(true);
    setError(null);
    try {
      const { jobs } = await api.listJobs();
      setJobs(jobs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Your jobs</h1>
        <button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : '+ New job'}</button>
      </div>

      {showForm && (
        <CreateJobForm
          onCreated={() => {
            setShowForm(false);
            loadJobs();
          }}
        />
      )}

      {loading && <p>Loading…</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && jobs.length === 0 && <p>No jobs yet — create your first one above.</p>}

      <ul className="job-list">
        {jobs.map((job) => (
          <li key={job._id} className="job-list-item">
            <Link to={`/jobs/${job._id}`}>
              <strong>{job.title}</strong>
              <span className={`badge badge-${job.status}`}>{job.status}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CreateJobForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.createJob({ title, description, requirements });
      onCreated();
    } catch (err) {
      setError(err.details?.[0]?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      {error && <p className="error-text">{error}</p>}
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label>
        Description
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} />
      </label>
      <label>
        Requirements
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          rows={3}
          placeholder="e.g. 3+ years React, familiarity with REST APIs…"
        />
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating…' : 'Create job'}
      </button>
    </form>
  );
}