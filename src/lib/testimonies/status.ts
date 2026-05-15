export const TESTIMONY_STATUSES = [
  { value: 'draft',           label: 'Draft' },
  { value: 'submitted',       label: 'Submitted' },
  { value: 'in_review',       label: 'In review' },
  { value: 'needs_revision',  label: 'Needs revision' },
  { value: 'approved',        label: 'Approved' },
  { value: 'rejected',        label: 'Rejected' },
] as const;

export type TestimonyStatus = (typeof TESTIMONY_STATUSES)[number]['value'];

export const TESTIMONY_STATUS_VALUES: readonly TestimonyStatus[] =
  TESTIMONY_STATUSES.map((s) => s.value);
