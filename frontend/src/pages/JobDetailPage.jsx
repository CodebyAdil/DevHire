import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  UploadCloud,
  Sparkles,
  Users,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { api } from '../api/client.js';
import { PageContainer } from '../components/PageContainer.jsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { StatusBadge } from '../components/ui/status-badge.jsx';
import { ScoreBadge } from '../components/ui/score-badge.jsx';
import { Skeleton } from '../components/ui/skeleton.jsx';
import { ErrorState, EmptyState } from '../components/ui/states.jsx';

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

  const backLink = (
    <Link
      to="/jobs"
      className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      All jobs
    </Link>
  );

  if (loading) {
    return (
      <PageContainer>
        {backLink}
        <div className="mt-4 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-56 w-full rounded-lg" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        {backLink}
        <div className="mt-4">
          <ErrorState message={error}>
            <Button variant="secondary" size="sm" onClick={loadAll}>
              Try again
            </Button>
          </ErrorState>
        </div>
      </PageContainer>
    );
  }

  if (!job) return null;

  const hasUnscored = candidates.some((c) => c.status !== 'scored');
  const fileCount = files?.length ?? 0;

  return (
    <PageContainer>
      {backLink}

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {job.title}
            </h1>
            <StatusBadge status={job.status} />
          </div>
          {job.description && (
            <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
              {job.description}
            </p>
          )}
        </div>
      </header>

      {job.requirements && (
        <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Requirements
          </p>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground">
            {job.requirements}
          </p>
        </div>
      )}

      {/* Upload resumes */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UploadCloud className="size-5 text-primary" aria-hidden="true" />
            Upload resumes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleUpload}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Input
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="sm:flex-1"
              aria-label="Select PDF resumes"
            />
            <Button type="submit" disabled={!files || uploading}>
              <UploadCloud className="size-4" aria-hidden="true" />
              {uploading
                ? 'Uploading…'
                : fileCount > 0
                  ? `Upload ${fileCount} file${fileCount > 1 ? 's' : ''}`
                  : 'Upload'}
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            PDF files only. You can select multiple at once.
          </p>

          {uploadStatus && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4 space-y-3"
            >
              <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/50 px-4 py-3">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium text-foreground">
                  {uploadStatus.summary}
                </p>
              </div>
              {uploadStatus.failed?.length > 0 && (
                <div className="rounded-lg border border-danger/25 bg-danger-muted px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-danger-foreground">
                    <AlertTriangle className="size-4" aria-hidden="true" />
                    {uploadStatus.failed.length} file
                    {uploadStatus.failed.length > 1 ? 's' : ''} failed
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-danger-foreground/90">
                    {uploadStatus.failed.map((f, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="font-medium">{f.filename}:</span>
                        <span>{f.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Candidates */}
      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Users className="size-5 text-muted-foreground" aria-hidden="true" />
            Candidates
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {candidates.length}
            </span>
          </h2>
          {hasUnscored && (
            <Button onClick={handleScoreAll} disabled={scoringAll}>
              <Sparkles className="size-4" aria-hidden="true" />
              {scoringAll ? 'Scoring…' : 'Score all unscored'}
            </Button>
          )}
        </div>

        {candidates.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No candidates yet"
            description="Upload PDF resumes above to add candidates and score them against this job."
          />
        ) : (
          <ul className="space-y-2.5">
            {candidates.map((c, i) => (
              <motion.li
                key={c._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: Math.min(i * 0.03, 0.3) }}
              >
                <Link
                  to={`/jobs/${jobId}/candidates/${c._id}`}
                  className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <Card className="transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-4">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground ring-1 ring-border">
                        {getInitials(c.name)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                        {c.name || (
                          <span className="italic text-muted-foreground">
                            (name pending)
                          </span>
                        )}
                      </span>
                      {c.status === 'scored' ? (
                        <ScoreBadge score={c.matchScore} />
                      ) : (
                        <StatusBadge status={c.status} />
                      )}
                      <ChevronRight
                        className="size-5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                        aria-hidden="true"
                      />
                    </CardContent>
                  </Card>
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </section>
    </PageContainer>
  );
}

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
