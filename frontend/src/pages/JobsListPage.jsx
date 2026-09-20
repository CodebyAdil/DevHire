import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, X, Briefcase, ChevronRight, FolderPlus } from 'lucide-react';
import { api } from '../api/client.js';
import { PageContainer } from '../components/PageContainer.jsx';
import { Card, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Textarea } from '../components/ui/textarea.jsx';
import { Label } from '../components/ui/label.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { StatusBadge } from '../components/ui/status-badge.jsx';
import { Skeleton } from '../components/ui/skeleton.jsx';
import { ErrorState, EmptyState } from '../components/ui/states.jsx';

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
    <PageContainer>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Your jobs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Post roles and screen candidates against each one.
          </p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          variant={showForm ? 'secondary' : 'primary'}
        >
          {showForm ? (
            <>
              <X className="size-4" aria-hidden="true" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="size-4" aria-hidden="true" />
              New job
            </>
          )}
        </Button>
      </header>

      <AnimatePresence initial={false}>
        {showForm && (
          <motion.div
            key="create-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="pt-6">
              <CreateJobForm
                onCreated={() => {
                  setShowForm(false);
                  loadJobs();
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6">
        {loading && <JobsSkeleton />}

        {!loading && error && (
          <ErrorState message={error}>
            <Button variant="secondary" size="sm" onClick={loadJobs}>
              Try again
            </Button>
          </ErrorState>
        )}

        {!loading && !error && jobs.length === 0 && (
          <EmptyState
            icon={FolderPlus}
            title="No jobs yet"
            description="Create your first job to start uploading resumes and scoring candidates."
            action={
              !showForm && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="size-4" aria-hidden="true" />
                  Create your first job
                </Button>
              )
            }
          />
        )}

        {!loading && !error && jobs.length > 0 && (
          <ul className="space-y-3">
            {jobs.map((job, i) => (
              <motion.li
                key={job._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}
              >
                <Link
                  to={`/jobs/${job._id}`}
                  className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <Card className="transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Briefcase className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-base font-semibold text-foreground">
                          {job.title}
                        </h2>
                        {job.description && (
                          <p className="truncate text-sm text-muted-foreground">
                            {job.description}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={job.status} />
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
      </div>
    </PageContainer>
  );
}

function JobsSkeleton() {
  return (
    <ul className="space-y-3" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i}>
          <Card>
            <CardContent className="flex items-center gap-4 p-4 sm:p-5">
              <Skeleton className="size-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64 max-w-full" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
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
    <Card className="border-primary/20 shadow-md">
      <CardContent className="p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <Badge variant="info">New job</Badge>
          <span className="text-sm text-muted-foreground">
            Describe the role you&apos;re hiring for
          </span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <ErrorState message={error} />}
          <div className="space-y-2">
            <Label htmlFor="job-title">Title</Label>
            <Input
              id="job-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Senior Frontend Engineer"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-description">Description</Label>
            <Textarea
              id="job-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What the role involves and who it reports to…"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-requirements">Requirements</Label>
            <Textarea
              id="job-requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={3}
              placeholder="e.g. 3+ years React, familiarity with REST APIs…"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create job'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
