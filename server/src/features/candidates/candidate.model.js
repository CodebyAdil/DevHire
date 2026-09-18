import { Schema, model, Types } from 'mongoose';

/**
 * Candidate model — matches the "Candidate" entity in PROJECT_SPEC.md:
 *   id, jobId (ref Job), name, email, resumeFileUrl, parsedData
 *   (skills, experience, education), matchScore, matchSummary, createdAt
 *
 * IMPORTANT SPLIT ACROSS PHASES — read this before Phase 5:
 * TASKS.md's Phase 4 only covers "PDF → text extraction", while Phase 5
 * ("AI Matching") is where the Claude API runs. So at upload time (this
 * phase) we only have the RAW extracted text — we don't yet know the
 * candidate's name, email, skills, etc. Those get filled in once Phase 5's
 * AI step parses + scores the resume. That's why `name`, `email`,
 * `parsedData`, `matchScore`, and `matchSummary` are all optional here,
 * and `status` tracks where each candidate is in that pipeline.
 *
 * - `resumeText`: the raw text pulled out of the PDF in this phase. This is
 *   what Phase 5's AI prompt will be built from — kept separate from
 *   `parsedData` (which is the AI's *structured* output) so you always
 *   have the original text to re-parse or debug against.
 * - `status`: lets the UI show "still processing" vs. "ready" without
 *   depending on the presence/absence of matchScore alone.
 */
const candidateSchema = new Schema(
  {
    jobId: {
      type: Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: null, // filled in by Phase 5's AI parsing step
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null, // filled in by Phase 5's AI parsing step
    },
    resumeFileUrl: {
      type: String,
      required: true, // path/URL used to retrieve the original PDF later
    },
    resumeText: {
      type: String,
      required: true, // raw text extracted from the PDF (this phase's output)
    },
    parsedData: {
      skills: { type: [String], default: [] },
      experience: { type: String, default: null },
      education: { type: String, default: null },
    },
    matchScore: {
      type: Number,
      default: null, // set by Phase 5
      min: 0,
      max: 100,
    },
    matchSummary: {
      type: String,
      default: null, // set by Phase 5
    },
    status: {
      type: String,
      enum: ['uploaded', 'scored', 'failed'],
      default: 'uploaded',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

const Candidate = model('Candidate', candidateSchema);

export default Candidate;