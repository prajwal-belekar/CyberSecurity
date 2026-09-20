import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, CheckCircle2, FileText, ShieldCheck, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { SectionRule } from '@/components/ui/KeyValue';
import { Badge } from '@/components/ui/Badge';
import { useAssignIncident, useUpdateIncidentStatus } from '@/hooks/useIncidents';
import { useToast } from '@/store/ToastContext';
import { INCIDENT_STATUS_ORDER, statusMetaFor } from '@/utils/incidentMeta';
import { cn } from '@/utils/cn';
import type { Incident, IncidentStatus } from '@/types/incident';

const ANALYSTS = ['a.reyes', 'k.nakamura', 'm.okafor', 'j.lindqvist', 'd.mensah'];

/**
 * Case actions: status transition (with confirmation), reassignment, and
 * hand-off links into evidence, reporting and the AI console.
 */
export function IncidentActions({ incident }: { incident: Incident }) {
  const [pendingStatus, setPendingStatus] = useState<IncidentStatus | null>(null);
  const toast = useToast();
  const updateStatus = useUpdateIncidentStatus(incident.id);
  const assign = useAssignIncident(incident.id);

  const applyStatus = () => {
    if (!pendingStatus) return;
    updateStatus.mutate(pendingStatus, {
      onSuccess: () => {
        toast.success('Status updated', `${incident.id} → ${statusMetaFor(pendingStatus).label}.`);
        setPendingStatus(null);
      },
      onError: (err: Error) => toast.error('Status change failed', err.message),
    });
  };

  const target = pendingStatus ? statusMetaFor(pendingStatus) : null;

  return (
    <div className="min-w-0">
      <SectionRule className="mb-1.5"><span className="flex items-center gap-1.5"><ShieldCheck className="size-3" aria-hidden />Status transition</span></SectionRule>

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {INCIDENT_STATUS_ORDER.map((status) => {
          const meta = statusMetaFor(status);
          const current = incident.status === status;
          return (
            <Button
              key={status}
              size="xs"
              variant={current ? 'primary' : 'secondary'}
              disabled={current || updateStatus.isPending}
              aria-pressed={current}
              onClick={() => setPendingStatus(status)}
              className={cn('justify-start', !current && meta.text)}
            >
              <span className="truncate">{meta.label}</span>
              {current ? <CheckCircle2 className="ml-auto size-3 shrink-0" aria-hidden /> : null}
            </Button>
          );
        })}
      </div>

      <div className="mt-2.5">
        <SectionRule className="mb-1.5"><span className="flex items-center gap-1.5"><UserCheck className="size-3" aria-hidden />ASSIGNMENT</span></SectionRule>
        <Select
          compact
          aria-label="Reassign incident"
          value={incident.assignedTo ?? ''}
          disabled={assign.isPending}
          onChange={(e) => {
            const analyst = e.target.value;
            assign.mutate(analyst, {
              onSuccess: () => toast.success('Reassigned', `${incident.id} is now assigned to ${analyst}.`),
              onError: (err: Error) => toast.error('Assignment failed', err.message),
            });
          }}
          options={[
            { value: '', label: 'UNASSIGNED' },
            ...ANALYSTS.map((analyst) => ({ value: analyst, label: analyst })),
          ]}
        />
        <p className="mono mt-1 text-[11px] text-ink-4">
          {assign.isPending ? 'UPDATING ASSIGNMENT…' : incident.assignedTo ? `CURRENT OWNER ${incident.assignedTo}` : 'NO OWNER — FIRST RESPONDER WILL CLAIM THIS CASE'}
        </p>
      </div>

      <div className="mt-2.5">
        <SectionRule className="mb-1.5"><span>Hand-off</span></SectionRule>
        <div className="flex flex-col gap-1.5">
          <Link to="/reports" className="block">
            <Button variant="secondary" size="xs" className="w-full justify-start" icon={<FileText className="size-3" aria-hidden />}>
              Generate incident report
            </Button>
          </Link>
          <Link to={`/ai-assistant?incident=${incident.id}`} className="block">
            <Button variant="secondary" size="xs" className="w-full justify-start" icon={<ArrowUpRight className="size-3" aria-hidden />}>
              Investigate with AI assistant
            </Button>
          </Link>
          <Link to="/threat-intelligence" className="block">
            <Button variant="ghost" size="xs" className="w-full justify-start" icon={<AlertTriangle className="size-3" aria-hidden />}>
              Check indicators against intel
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <Badge tone={incident.priority === 'p1' ? 'err' : incident.priority === 'p2' ? 'warn' : 'neutral'}>{incident.priority.toUpperCase()}</Badge>
        <Badge tone="neutral">{incident.timeline.length} TIMELINE</Badge>
        <Badge tone="neutral">{incident.evidenceEventIds.length} EVIDENCE</Badge>
        <Badge tone="neutral">{incident.affectedAssets.length} ASSETS</Badge>
        <Badge tone="neutral">{incident.notes.length} NOTES</Badge>
      </div>

      <Modal
        open={Boolean(pendingStatus)}
        onClose={() => setPendingStatus(null)}
        title={`Move ${incident.id} to ${target?.label ?? ''}?`}
        description="Status changes are written to the incident audit trail with your analyst identity."
        tone={pendingStatus === 'false_positive' ? 'danger' : 'default'}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setPendingStatus(null)} disabled={updateStatus.isPending}>Cancel</Button>
            <Button variant="primary" size="sm" loading={updateStatus.isPending} onClick={applyStatus}>Confirm transition</Button>
          </>
        }
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={cn('mono rounded-[2px] border px-1.5 py-[1px] text-[11px] font-bold tracking-[0.01em] uppercase', statusMetaFor(incident.status).className)}>
              {statusMetaFor(incident.status).label}
            </span>
            <span className="mono text-ink-4" aria-hidden>→</span>
            {target ? (
              <span className={cn('mono rounded-[2px] border px-1.5 py-[1px] text-[11px] font-bold tracking-[0.01em] uppercase', target.className)}>
                {target.label}
              </span>
            ) : null}
          </div>
          <p className="text-[11.5px] leading-relaxed text-ink-2">{incident.title}</p>
          {pendingStatus === 'resolved' ? (
            <p className="mono rounded-[2px] border border-medium/30 bg-medium/[0.06] px-2 py-1.5 text-[10.5px] leading-relaxed text-ink-2">
              Confirm containment and remediation are complete before resolving — the resolution clock stops and the
              case moves to post-incident review.
            </p>
          ) : null}
          {pendingStatus === 'false_positive' ? (
            <p className="mono rounded-[2px] border border-info/30 bg-info/[0.06] px-2 py-1.5 text-[10.5px] leading-relaxed text-ink-2">
              Mark as benign only when evidence rules out compromise. Detection rules will be tuned so the same
              pattern stops alerting.
            </p>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
