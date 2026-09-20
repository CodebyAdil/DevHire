import {
  CircleDot,
  CircleCheck,
  CircleX,
  FileUp,
  Archive,
} from 'lucide-react';
import { Badge } from './badge.jsx';

/*
  Maps the exact status strings the backend already uses to a visual style.
  Values are never renamed or reinterpreted here — only styled.
  Job status:       open | closed
  Candidate status: uploaded | scored | failed
*/
const STATUS_CONFIG = {
  open: { variant: 'success', Icon: CircleDot },
  closed: { variant: 'neutral', Icon: Archive },
  scored: { variant: 'success', Icon: CircleCheck },
  uploaded: { variant: 'info', Icon: FileUp },
  failed: { variant: 'danger', Icon: CircleX },
};

export function StatusBadge({ status, className }) {
  const config = STATUS_CONFIG[status] ?? { variant: 'neutral', Icon: CircleDot };
  const { variant, Icon } = config;
  return (
    <Badge variant={variant} className={className}>
      <Icon className="size-3" aria-hidden="true" />
      {status}
    </Badge>
  );
}
