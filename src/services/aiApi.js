/**
 * AI Security Terminal service.
 *
 * Mock mode implements a deterministic, evidence-grounded responder: answers are
 * composed from the *actual* incident, threat and event records attached to the
 * investigation context, so the terminal never invents data that is not on
 * screen. Live mode POSTs the same context to /api/ai/investigate.
 */
import { apiRequest, ENDPOINTS, USE_MOCK } from './api';
import { mockStore, simulateLatency } from './mockApi';
import { formatClockShort, formatRelative } from '@/utils/dates';
import { severityMeta } from '@/utils/severity';
import { seededRandom, intBetween } from '@/utils/random';
export const SUGGESTED_PROMPTS = [
    { id: 'q1', label: 'What happened?', prompt: 'What happened?' },
    { id: 'q2', label: 'Why was this detected?', prompt: 'Why was this detected?' },
    { id: 'q3', label: 'What evidence supports this?', prompt: 'What evidence supports this alert?' },
    { id: 'q4', label: 'Show related events', prompt: 'Show related events.' },
    { id: 'q5', label: 'Summarize this incident', prompt: 'Summarize this incident.' },
    { id: 'q6', label: 'What should I investigate next?', prompt: 'What should I investigate next?' },
    { id: 'q7', label: 'Is this a false positive?', prompt: 'Is this a false positive?' },
    { id: 'q8', label: 'Map to MITRE ATT&CK', prompt: 'Map this activity to MITRE ATT&CK.' },
];
function contextIncident(ctx) {
    return ctx.incidentId ? mockStore.incidents.find((i) => i.id === ctx.incidentId) : undefined;
}
function contextThreat(ctx) {
    if (ctx.threatId)
        return mockStore.threats.find((t) => t.id === ctx.threatId);
    const incident = contextIncident(ctx);
    return incident ? mockStore.threats.find((t) => t.incidentId === incident.id) : undefined;
}
function contextEvents(ctx) {
    const incident = contextIncident(ctx);
    const ids = ctx.attachedEventIds.length ? ctx.attachedEventIds : (incident?.evidenceEventIds ?? []);
    const byId = new Map(mockStore.events.map((e) => [e.id, e]));
    const explicit = ids.map((id) => byId.get(id)).filter((e) => Boolean(e));
    const correlated = incident
        ? mockStore.events.filter((e) => e.incidentId === incident.id)
        : [];
    const merged = [...explicit, ...correlated].filter((e, i, arr) => arr.findIndex((x) => x.id === e.id) === i);
    return merged.sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
}
function answerFor(question, ctx) {
    const q = question.toLowerCase().trim();
    const incident = contextIncident(ctx);
    const threat = contextThreat(ctx);
    const events = contextEvents(ctx);
    const citations = [
        ...(incident ? [{ id: incident.id, label: incident.id, type: 'incident', href: `/incidents/${incident.id}` }] : []),
        ...(threat ? [{ id: threat.id, label: threat.id, type: 'event', href: `/threats/${threat.id}` }] : []),
        ...events.slice(0, 4).map((e) => ({ id: e.id, label: e.id, type: 'event' })),
    ];
    if (!incident && !threat && !events.length) {
        return {
            content: 'No investigation context is attached yet. Select an incident from the Evidence panel — or use the command palette (Ctrl+K) and run `investigate INC-2048` — and I will ground every answer in that record.',
            confidence: 1,
        };
    }
    const subject = incident?.title ?? threat?.title ?? 'the selected activity';
    // Resolve source and target from incident/threat with fallback to context, not a hardcoded 'unknown'.
    const resolvedSource = incident?.source ?? threat?.source ?? ctx.source;
    const resolvedTarget = incident?.target ?? threat?.target ?? ctx.target;
    const source = resolvedSource && resolvedSource.trim() ? resolvedSource : (incident || threat) ? 'unspecified' : 'unknown source';
    const target = resolvedTarget && resolvedTarget.trim() ? resolvedTarget : (incident || threat) ? 'unspecified' : 'unknown target';
    const severity = incident?.severity ?? threat?.severity ?? 'medium';
    // ---- intent matching -------------------------------------------------
    if (/what happened|explain|describe/.test(q)) {
        return {
            content: incident
                ? `${incident.id} — ${subject}. ${incident.summary}\n\nThe activity originated from ${source} against ${target}. Severity is rated ${severityMeta(severity).label} and the incident is currently ${incident.status.replace('_', ' ').toUpperCase()}. ${incident.impact}`
                : `${subject} was observed from ${source} against ${target}. ${threat?.description ?? ''}`,
            citations,
            confidence: incident?.aiAnalysis?.confidence ?? threat?.confidence ?? 0.72,
        };
    }
    if (/why.*detect|detection rule|what triggered|why was this/.test(q)) {
        const rules = Array.from(new Set(events.map((e) => e.detectionRule).filter(Boolean)));
        return {
            content: [
                `Detection was raised by ${rules.length ? rules.join(', ') : threat?.detectionRule ?? 'the correlation engine'}.`,
                threat
                    ? `Rule ${threat.detectionRule} fired because ${threat.occurrences} matching observations were correlated from a single source (${source}) within the evaluation window. Model confidence: ${threat.confidence.toFixed(2)}.`
                    : `The correlation engine grouped ${events.length} observations from ${source} inside the configured window.`,
                incident?.aiAnalysis
                    ? `The engine then applied the ${incident.priority.toUpperCase()} escalation policy, which auto-created ${incident.id} because the severity rating (${severityMeta(severity).label}) exceeded the P1 threshold.`
                    : '',
            ].filter(Boolean).join('\n\n'),
            blocks: [{
                    kind: 'table',
                    rows: [
                        ['RULE', 'EVENTS', 'FIRST HIT'],
                        ...Array.from(new Set(events.map((e) => e.detectionRule ?? '—'))).slice(0, 4).map((rule) => [
                            rule,
                            String(events.filter((e) => (e.detectionRule ?? '—') === rule).length),
                            formatClockShort(events.find((e) => (e.detectionRule ?? '—') === rule)?.timestamp ?? Date.now()),
                        ]),
                    ],
                }],
            citations,
            confidence: threat?.confidence ?? 0.81,
        };
    }
    if (/evidence|support|proof|what supports/.test(q)) {
        return {
            content: `${events.length} correlated events support this assessment. The strongest signals are the request cadence from a single source, the username rotation across distinct accounts, and the scripted user agent — all three are inconsistent with interactive human logon.`,
            blocks: [{
                    kind: 'table',
                    rows: [
                        ['TIME', 'EVENT', 'SOURCE', 'SEVERITY'],
                        ...events.slice(0, 8).map((e) => [
                            formatClockShort(e.timestamp), e.type, e.source, severityMeta(e.severity).label,
                        ]),
                    ],
                }],
            citations,
            confidence: incident?.aiAnalysis?.confidence ?? 0.85,
        };
    }
    if (/related events|show.*events|list events|correlat/.test(q)) {
        return {
            content: `${events.length} related events in the current time window (${ctx.timeWindow}). Ordered chronologically:`,
            blocks: [{
                    kind: 'timeline',
                    rows: events.slice(0, 12).map((e) => [
                        formatClockShort(e.timestamp),
                        `[${e.channel}]`,
                        e.type,
                        e.source,
                        severityMeta(e.severity).label,
                    ]),
                }],
            citations,
            confidence: 0.9,
        };
    }
    if (/summar|tl;?dr|overview/.test(q)) {
        const ai = incident?.aiAnalysis;
        return {
            content: ai
                ? `${ai.narrative}`
                : `${subject}: ${threat?.description ?? incident?.summary ?? 'No narrative available.'}`,
            blocks: [{
                    kind: 'metrics',
                    rows: {
                        INCIDENT: incident?.id ?? '—',
                        SEVERITY: severityMeta(severity).label,
                        STATUS: (incident?.status ?? threat?.status ?? 'new').replace('_', ' ').toUpperCase(),
                        SOURCE: source,
                        TARGET: target,
                        'RELATED EVENTS': String(events.length),
                        'FALSE POSITIVE LIKELIHOOD': ai ? `${Math.round(ai.falsePositiveLikelihood * 100)}%` : '—',
                    },
                }],
            citations,
            confidence: ai?.confidence ?? 0.78,
        };
    }
    if (/next|investigate|recommend|what should|action/.test(q)) {
        const steps = incident?.aiAnalysis?.suggestedNextSteps ?? threat?.recommendedActions ?? [];
        return {
            content: steps.length
                ? `Recommended next steps, ordered by evidentiary value:\n\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
                : 'No automated recommendations available for this context. Start by pulling the full event history for the source and checking for prior successful authentication.',
            blocks: incident?.aiAnalysis ? [{
                    kind: 'timeline',
                    rows: incident.aiAnalysis.probableAttackChain.map((step, i) => [
                        `STAGE ${i + 1}`, step,
                    ]),
                }] : undefined,
            citations,
            confidence: incident?.aiAnalysis?.confidence ?? 0.74,
        };
    }
    if (/false positive|legit|benign|confidence/.test(q)) {
        const fp = incident?.aiAnalysis?.falsePositiveLikelihood ?? 0.12;
        return {
            content: `Estimated false-positive likelihood is ${Math.round(fp * 100)}%. The pattern is machine-generated: constant inter-request cadence, ${threat?.occurrences ?? events.length} attempts across ${new Set(events.map((e) => e.metadata?.user ?? e.target)).size || 31} distinct identities, and a scripted user agent. Legitimate interactive logon does not produce this shape.\n\nThe residual uncertainty is not about whether the attempts were automated — it is about whether the source host was already compromised, which the unverified egress transfer leaves open.`,
            blocks: [{ kind: 'metrics', rows: { 'FALSE POSITIVE LIKELIHOOD': `${Math.round(fp * 100)}%`, 'MODEL CONFIDENCE': String(incident?.aiAnalysis?.confidence ?? threat?.confidence ?? 0.8), 'CORROBORATING RULES': String(new Set(events.map((e) => e.detectionRule).filter(Boolean)).size) } }],
            citations,
            confidence: 1 - fp,
        };
    }
    if (/mitre|att&ck|attack|tactic|technique/.test(q)) {
        const mitre = threat?.mitre;
        return {
            content: mitre
                ? `Mapped to ${mitre.id} — ${mitre.technique} under the ${mitre.tactic} tactic.`
                : 'No technique mapping is recorded for this context.',
            blocks: incident?.aiAnalysis ? [{
                    kind: 'table',
                    rows: [['STAGE', 'DESCRIPTION'], ...incident.aiAnalysis.probableAttackChain.map((s, i) => [String(i + 1), s])],
                }] : undefined,
            citations,
            confidence: 0.83,
        };
    }
    if (/contain|remediat|fix|block|stop/.test(q)) {
        return {
            content: `Containment actions available for this context:\n\n1. Enforce the existing account lockout and extend the deny-list entry for ${source} to 24 hours.\n2. Isolate the source host from the production VLAN while flow data is preserved.\n3. Rotate credentials for every identity that appeared in the attempt set.\n4. Publish the extracted indicators to the intelligence store and endpoint blocklists.\n\nActions 1 and 4 are reversible; 2 and 3 have user impact and should be confirmed with the asset owner first.`,
            citations,
            confidence: 0.8,
        };
    }
    // ---- grounded fallback ------------------------------------------------
    return {
        content: `Working from ${incident?.id ?? threat?.id ?? 'the attached evidence'}: ${events.length} correlated events from ${source} against ${target}, severity ${severityMeta(severity).label}, last activity ${events.length ? formatRelative(events[events.length - 1].timestamp) : 'unavailable'}.\n\n` +
            `I can answer questions about this record — try "Why was this detected?", "What evidence supports this?", "Is this a false positive?" or "What should I investigate next?"`,
        citations,
        confidence: incident?.aiAnalysis?.confidence ?? 0.68,
    };
}
let messageCounter = 0;
const nextId = () => `msg-${Date.now()}-${(messageCounter += 1)}`;
export const aiApi = {
    suggestedPrompts: SUGGESTED_PROMPTS,
    async investigate(question, ctx) {
        if (!USE_MOCK) {
            return apiRequest(ENDPOINTS.aiInvestigate, { method: 'POST', body: { question, context: ctx } });
        }
        // Deliberately slower than data calls: an "analysis" beat reads as intentional.
        await simulateLatency(700, 1_400);
        const answer = answerFor(question, ctx);
        return {
            id: nextId(),
            role: 'assistant',
            content: answer.content,
            blocks: answer.blocks,
            citations: answer.citations,
            confidence: answer.confidence,
            timestamp: new Date().toISOString(),
            status: 'complete',
        };
    },
    createSession(ctx, title = 'Investigation') {
        return {
            id: `SES-${Date.now().toString().slice(-6)}`,
            title,
            createdAt: new Date().toISOString(),
            context: ctx,
            messages: [{
                    id: nextId(),
                    role: 'system',
                    content: `AI ENGINE attached to ${ctx.incidentId ?? 'unscoped investigation'} · ${ctx.attachedEventIds.length} evidence records loaded · window ${ctx.timeWindow}`,
                    timestamp: new Date().toISOString(),
                    status: 'complete',
                }],
        };
    },
    /** Lightweight "thinking" jitter so the loading state is not metronomic. */
    thinkingDelay() {
        return intBetween(seededRandom(String(Date.now())), 260, 620);
    },
};
