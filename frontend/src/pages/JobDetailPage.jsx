import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';

export function JobDetailPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [files, setFiles] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null); // { summary, failed } | null
  const [uploading, setUploading] = useState(false);
  const [scoringAll, setScoringAll] = useState(false);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [jobRes, candidatesRes] = await Promise.all([
        api.getJob(jobId),
        api.listCandidates(jobId),
      ]);
      setJob(jobRes.job);
      setCandidates(candidatesRes.candidates);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  async function handleUpload(e) {
    e.preventDefault();
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadStatus(null);
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('resumes', file));

    try {
      const result = await api.uploadResumes(jobId, formData);
      setUploadStatus(result);
      setFiles(null);
      await loadAll();
    } catch (err) {
      setUploadStatus({ summary: err.message, failed: [] });
    } finally {
      setUploading(false);
    }
  }

  async function handleScoreAll() {
    setScoringAll(true);
    try {
      await api.scoreAllCandidates(jobId);
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setScoringAll(false);
    }
  }

  if (loading) return <p className="page">Loading…</p>;
  if (error) return <p className="page error-text">{error}</p>;
  if (!job) return null;

  const hasUnscored = candidates.some((c) => c.status !== 'scored');

  return (
    <div className="page">
      <Link to="/jobs">&larr; All jobs</Link>
      <div className="page-header">
        <h1>{job.title}</h1>
        <span className={`badge badge-${job.status}`}>{job.status}</span>
      </div>
      <p>{job.description}</p>
      {job.requirements && (
        <p className="requirements">
          <strong>Requirements:</strong> {job.requirements}
        </p>
      )}

      <section className="card">
        <h2>Upload resumes</h2>
        <form onSubmit={handleUpload}>
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => setFiles(e.target.files)}
          />
          <button type="submit" disabled={!files || uploading}>
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </form>
        {uploadStatus && (
          <div className="upload-status">
            <p>{uploadStatus.summary}</p>
            {uploadStatus.failed?.length > 0 && (
              <ul className="error-list">
                {uploadStatus.failed.map((f, i) => (
                  <li key={i}>
                    {f.filename}: {f.reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section>
        <div className="page-header">
          <h2>Candidates ({candidates.length})</h2>
          {hasUnscored && (
            <button onClick={handleScoreAll} disabled={scoringAll}>
              {scoringAll ? 'Scoring…' : 'Score all unscored'}
            </button>
          )}
        </div>

        {candidates.length === 0 && <p>No candidates yet — upload some resumes above.</p>}

        <ul className="candidate-list">
          {candidates.map((c) => (
            <li key={c._id} className="candidate-list-item">
              <Link to={`/jobs/${jobId}/candidates/${c._id}`}>
                <span className="candidate-name">{c.name || '(name pending)'}</span>
                {c.status === 'scored' ? (
                  <span className="score-badge">{c.matchScore}/100</span>
                ) : (
                  <span className={`badge badge-${c.status}`}>{c.status}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}