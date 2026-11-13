import { useMemo, useState } from 'react';
import { SAMPLE_CONTENT, SOURCES } from '@/data/demoBrand';
import { runReview } from '@/lib/reviewEngine';
import type {
  Approver,
  Audience,
  Channel,
  Dismissal,
  Finding,
  LogEntry,
  Role,
  WorkflowStatus,
} from '@/types';

const timeNow = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export function useReviewWorkflow() {
  const [text, setText] = useState(SAMPLE_CONTENT);
  const [channel, setChannel] = useState<Channel>('Blog post');
  const [audience, setAudience] = useState<Audience>('General public');
  const [revision, setRevision] = useState(1);
  const [role, setRole] = useState<Role>('Creator');
  const [status, setStatus] = useState<WorkflowStatus>('draft');
  const [routedTo, setRoutedTo] = useState<Approver | null>(null);
  const [dismissals, setDismissals] = useState<Dismissal[]>([]);
  const [log, setLog] = useState<LogEntry[]>([
    { id: crypto.randomUUID(), time: timeNow(), actor: 'System', message: 'Draft created as revision 1.' },
  ]);

  const append = (actor: LogEntry['actor'], message: string) =>
    setLog((previous) => [{ id: crypto.randomUUID(), time: timeNow(), actor, message }, ...previous]);

  const review = useMemo(() => runReview(text, SOURCES), [text]);
  const dismissedKeys = useMemo(() => new Set(dismissals.map((item) => item.key)), [dismissals]);
  const findings: Finding[] = review.findings.filter((finding) => !dismissedKeys.has(finding.dismissKey));

  const requiredApprover: Approver = dismissals.some(
    (item) => item.category === 'Claims' || item.category === 'Facts'
  )
    ? 'Reviewer'
    : 'Manager';

  const canEdit = role === 'Creator' && (status === 'draft' || status === 'changes-requested' || status === 'rejected');
  const canSubmit = canEdit && findings.length === 0 && text.trim().length > 0;

  const acceptFix = (finding: Finding, replacement: string) => {
    if (!canEdit || finding.fix === null || replacement.trim() === '') return;
    setText(text.slice(0, finding.start) + replacement + text.slice(finding.end));
    setRevision(revision + 1);
    append('Creator', `Accepted a fix: "${finding.matched}" changed to "${replacement}". Now revision ${revision + 1}.`);
  };

  const dismissFinding = (finding: Finding, reason: string) => {
    if (!canEdit || reason.trim() === '') return;
    setDismissals((previous) => [
      ...previous,
      { key: finding.dismissKey, category: finding.category, reason: reason.trim() },
    ]);
    setRevision(revision + 1);
    append('Creator', `Dismissed "${finding.matched}" (${finding.category}). Reason: ${reason.trim()}. Now revision ${revision + 1}.`);
  };

  const submitForApproval = () => {
    if (!canSubmit) return;
    const submittedRevision = status === 'changes-requested' || status === 'rejected' ? revision + 1 : revision;
    setRevision(submittedRevision);
    setStatus('in-review');
    setRoutedTo(requiredApprover);
    append('Creator', `Submitted revision ${submittedRevision} for approval. Routed to ${requiredApprover}.`);
  };

  const decide = (decision: 'approve' | 'request-changes' | 'reject', comment: string) => {
    if (status !== 'in-review' || routedTo === null || role !== routedTo) return;
    if (decision === 'approve') {
      setStatus('approved');
      append(role, `Approved revision ${revision}.${comment.trim() ? ` Note: ${comment.trim()}` : ''}`);
      return;
    }
    if (decision === 'reject') {
      if (comment.trim() === '') return;
      setStatus('rejected');
      append(role, `Rejected revision ${revision}: ${comment.trim()}`);
      return;
    }
    if (comment.trim() === '') return;
    setStatus('changes-requested');
    append(role, `Requested changes on revision ${revision}: ${comment.trim()}`);
  };

  return {
    text,
    channel,
    audience,
    revision,
    role,
    status,
    routedTo,
    requiredApprover,
    findings,
    dismissals,
    log,
    canEdit,
    canSubmit,
    setText,
    setChannel,
    setAudience,
    setRole,
    acceptFix,
    dismissFinding,
    submitForApproval,
    decide,
  };
}

export type ReviewWorkflow = ReturnType<typeof useReviewWorkflow>;
