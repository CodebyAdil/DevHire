import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';

export function CandidateDetailPage() {
  const { jobId, candidateId } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scoring, setScoring] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { candidate } = await api.getCandidate(jobId, candidateId);
      setCandidate(candidate);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, candidateId]);

  async function handleRescore() {
    setScoring(true);
    try {
      const { candidate } = await api.scoreCandidate(jobId, candidateId);
      setCandidate(candidate);
    } catch (err) {
      setError(err.message);
    } finally {
      setScoring(false);
    }
  }

  if (loading) return <p className="page">Loading…</p>;
  if (error) return <p className="page error-text">{error}</p>;
  if (!candidate) return null;

  return (
    <div className="page">
      <Link to={`/jobs/${jobId}`}>&larr; Back to job</Link>

      <div className="page-header">
        <h1>{candidate.name || '(name pending)'}</h1>
        {candidate.status === 'scored' ? (
          <span className="score-badge">{candidate.matchScore}/100</span>
        ) : (
          <span className={`badge badge-${candidate.status}`}>{candidate.status}</span>
        )}
      </div>

      {candidate.email && <p>{candidate.email}</p>}

      <button onClick={handleRescore} disabled={scoring}>
        {scoring ? 'Scoring…' : candidate.status === 'scored' ? 'Re-score' : 'Score this candidate'}
      </button>

      {candidate.matchSummary && (
        <section className="card">
          <h2>Match summary</h2>
          <p>{candidate.matchSummary}</p>
        </section>
      )}

      {candidate.parsedData?.skills?.length > 0 && (
        <section className="card">
          <h2>Skills</h2>
          <ul className="tag-list">
            {candidate.parsedData.skills.map((skill, i) => (
              <li key={i} className="tag">
                {skill}
              </li>
            ))}
          </ul>
        </section>
      )}

      {candidate.parsedData?.experience && (
        <section className="card">
          <h2>Experience</h2>
          <p>{candidate.parsedData.experience}</p>
        </section>
      )}

      {candidate.parsedData?.education && (
        <section className="card">
          <h2>Education</h2>
          <p>{candidate.parsedData.education}</p>
        </section>
      )}

      <section className="card">
        <h2>Resume</h2>
        <a href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${candidate.resumeFileUrl}`} target="_blank" rel="noreferrer">
          View original PDF
        </a>
      </section>
    </div>
  );
}