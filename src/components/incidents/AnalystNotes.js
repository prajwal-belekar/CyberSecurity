import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { MessageSquarePlus, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAddIncidentNote } from '@/hooks/useIncidents';
import { useToast } from '@/store/ToastContext';
import { formatTimestamp } from '@/utils/dates';
/** Investigation notes with an append-only composer (the audit trail is immutable). */
export function AnalystNotes({ incidentId, notes }) {
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
            onError: (err) => toast.error('Could not save note', err.message),
        });
    };
    return (_jsxs("div", { className: "min-w-0", children: [notes.length ? (_jsx("ol", { className: "space-y-1.5", children: notes.map((note) => (_jsxs("li", { className: "rounded-[2px] border border-line bg-base p-2", children: [_jsxs("div", { className: "flex flex-wrap items-baseline gap-x-2 gap-y-0.5", children: [_jsx("span", { className: "mono text-[11px] font-bold text-term", children: note.author }), _jsx("span", { className: "mono text-[11px] text-ink-4", children: formatTimestamp(note.timestamp) }), _jsx("span", { className: "mono ml-auto text-[10.5px] text-ink-4", children: note.id })] }), _jsx("p", { className: "mt-1 text-[11.5px] leading-relaxed whitespace-pre-wrap text-ink-2", children: note.body })] }, note.id))) })) : (_jsx(EmptyState, { compact: true, icon: _jsx(StickyNote, { className: "size-4", "aria-hidden": true }), title: "No analyst notes", description: "Record observations, decisions and hand-over context here." })), composing ? (_jsxs("div", { className: "mt-2 rounded-[2px] border border-line-2 bg-base p-2", children: [_jsx(Textarea, { value: draft, onChange: (e) => setDraft(e.target.value), rows: 3, placeholder: "Observation, decision, or hand-over note for the next analyst\u2026", "aria-label": "New analyst note", className: "text-[11.5px]", autoFocus: true }), _jsxs("div", { className: "mt-1.5 flex items-center gap-1.5", children: [_jsx(Button, { variant: "primary", size: "xs", loading: addNote.isPending, onClick: submit, children: "Save note" }), _jsx(Button, { variant: "ghost", size: "xs", onClick: () => { setComposing(false); setDraft(''); }, disabled: addNote.isPending, children: "Cancel" }), _jsxs("span", { className: "mono ml-auto text-[10.5px] text-ink-4", children: [draft.trim().length, " CHARS"] })] })] })) : (_jsx(Button, { variant: "secondary", size: "xs", className: "mt-2", icon: _jsx(MessageSquarePlus, { className: "size-3", "aria-hidden": true }), onClick: () => setComposing(true), children: "Add note" }))] }));
}
