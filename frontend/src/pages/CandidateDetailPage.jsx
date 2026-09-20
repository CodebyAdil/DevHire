import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Mail,
  FileText,
  Briefcase,
  GraduationCap,
  ExternalLink,
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
import { StatusBadge } from '../components/ui/status-badge.jsx';
import { ScoreBadge } from '../components/ui/score-badge.jsx';
import { Skeleton } from '../components/ui/skeleton.jsx';
import { ErrorState } from '../components/ui/states.jsx';

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

  const backLink = (
    <Link
      to={`/jobs/${jobId}`}
      className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Back to job
    </Link>
  );

  if (loading) {
    return (
      <PageContainer>
        {backLink}
        <div className="mt-4 space-y-6">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
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
            <Button variant="secondary" size="sm" onClick={load}>
              Try again
            </Button>
          </ErrorState>
        </div>
      </PageContainer>
    );
  }

  if (!candidate) return null;

  const isScored = candidate.status === 'scored';
  const resumeHref = `${
    import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
  }${candidate.resumeFileUrl}`;

  return (
    <PageContainer>
      {backLink}

      {/* Candidate header */}
      <Card className="mt-4 overflow-hidden">
        <CardContent className="flex flex-wrap items-center gap-4 p-5 sm:p-6">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary ring-1 ring-primary/15">
            {getInitials(candidate.name)}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold tracking-tight">
              {candidate.name || (
                <span className="italic text-muted-foreground">
                  (name pending)
                </span>
              )}
            </h1>
            {candidate.email && (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="size-3.5" aria-hidden="true" />
                {candidate.email}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-3">
            {isScored ? (
              <ScoreBadge score={candidate.matchScore} size="lg" />
            ) : (
              <StatusBadge status={candidate.status} />
            )}
            <Button
              onClick={handleRescore}
              disabled={scoring}
              variant={isScored ? 'secondary' : 'primary'}
              size="sm"
            >
              {isScored ? (
                <RefreshCw
                  className={scoring ? 'size-4 animate-spin' : 'size-4'}
                  aria-hidden="true"
                />
              ) : (
                <Sparkles className="size-4" aria-hidden="true" />
              )}
              {scoring
                ? 'Scoring…'
                : isScored
                  ? 'Re-score'
                  : 'Score this candidate'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-6">
        {candidate.matchSummary && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" aria-hidden="true" />
                Match summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-pretty text-sm leading-relaxed text-foreground">
                {candidate.matchSummary}
              </p>
            </CardContent>
          </Card>
        )}

        {candidate.parsedData?.skills?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-wrap gap-2">
                {candidate.parsedData.skills.map((skill, i) => (
                  <li
                    key={i}
                    className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground ring-1 ring-inset ring-border"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {candidate.parsedData?.experience && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-pretty text-sm leading-relaxed text-foreground">
                {candidate.parsedData.experience}
              </p>
            </CardContent>
          </Card>
        )}

        {candidate.parsedData?.education && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-pretty text-sm leading-relaxed text-foreground">
                {candidate.parsedData.education}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              Resume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={resumeHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              View original PDF
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </CardContent>
        </Card>
      </div>
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
