import { useState } from 'react';
import { MessageSquarePlus, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAddIncidentNote } from '@/hooks/useIncidents';
import { useToast } from '@/store/ToastContext';
import { formatTimestamp } from '@/utils/dates';
import type { IncidentNote } from '@/types/incident';

/** Investigation notes with an append-only composer (the audit trail is immutable). */
export function AnalystNotes({ incidentId, notes }: { incidentId: string; notes: IncidentNote[] }) {
  const [draft, setDraft] = useState('');
  const [composing, setComposing] = useState(false);
  const toast = useToast();
  const addNote = useAddIncidentNote(incidentId);

  const submit = () => {
    const body = draft.trim();
    if (body.length < 8) {
      toast.error('Note too short', 'Add at least a sentence so the entry is useful to the next analyst.');
      return;
    }
    addNote.mutate(body, {
      onSuccess: () => {
        setDraft('');
        setComposing(false);
        toast.success('Note recorded', `Appended to the ${incidentId} audit trail.`);
      },
      onError: (err: Error) => toast.error('Could not save note', err.message),
    });
  };

  return (
    <div className="min-w-0">
      {notes.length ? (
        <ol className="space-y-1.5">
          {notes.map((note) => (
            <li key={note.id} className="rounded-[2px] border border-line bg-base p-2">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="mono text-[11px] font-bold text-term">{note.author}</span>
                <span className="mono text-[11px] text-ink-4">{formatTimestamp(note.timestamp)}</span>
                <span className="mono ml-auto text-[10.5px] text-ink-4">{note.id}</span>
              </div>
              <p className="mt-1 text-[11.5px] leading-relaxed whitespace-pre-wrap text-ink-2">{note.body}</p>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState compact icon={<StickyNote className="size-4" aria-hidden />} title="No analyst notes" description="Record observations, decisions and hand-over context here." />
      )}

      {composing ? (
        <div className="mt-2 rounded-[2px] border border-line-2 bg-base p-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Observation, decision, or hand-over note for the next analyst…"
            aria-label="New analyst note"
            className="text-[11.5px]"
            autoFocus
          />
          <div className="mt-1.5 flex items-center gap-1.5">
            <Button variant="primary" size="xs" loading={addNote.isPending} onClick={submit}>Save note</Button>
            <Button variant="ghost" size="xs" onClick={() => { setComposing(false); setDraft(''); }} disabled={addNote.isPending}>Cancel</Button>
            <span className="mono ml-auto text-[10.5px] text-ink-4">{draft.trim().length} CHARS</span>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          size="xs"
          className="mt-2"
          icon={<MessageSquarePlus className="size-3" aria-hidden />}
          onClick={() => setComposing(true)}
        >
          Add note
        </Button>
      )}
    </div>
  );
}
