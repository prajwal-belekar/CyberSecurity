import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Tooltip } from './Tooltip';
/**
 * One-click clipboard control with explicit "Copied" confirmation — the
 * micro-interaction required for IPs, hashes and incident IDs.
 */
export function CopyButton({ value, label = 'Copy to clipboard', className, withValue, truncate }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(value);
            }
            else {
                // Sandboxed contexts may block the async clipboard API.
                const ta = document.createElement('textarea');
                ta.value = value;
                ta.setAttribute('readonly', '');
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        }
        catch {
            setCopied(false);
        }
    };
    const display = truncate && value.length > truncate[0] + truncate[1] + 1
        ? `${value.slice(0, truncate[0])}…${value.slice(-truncate[1])}`
        : value;
    return (_jsxs("span", { className: cn('inline-flex min-w-0 items-center gap-1.5', className), children: [withValue ? (_jsx("span", { className: "mono truncate text-[11px] text-ink-2", title: value, children: display })) : null, _jsx(Tooltip, { content: copied ? 'Copied to clipboard' : label, children: _jsx("button", { type: "button", onClick: copy, "aria-label": `${label}: ${value}`, className: cn('inline-flex size-5.5 shrink-0 items-center justify-center rounded-[2px] border transition-all duration-150', copied
                        ? 'border-term/50 bg-term/15 text-term'
                        : 'border-transparent text-ink-4 hover:border-line-2 hover:bg-raised hover:text-ink-2'), children: copied ? _jsx(Check, { className: "size-3", "aria-hidden": true }) : _jsx(Copy, { className: "size-3", "aria-hidden": true }) }) }), _jsx("span", { "aria-live": "polite", className: "sr-only", children: copied ? 'Copied to clipboard' : '' })] }));
}
