import { useEffect } from 'react';
function isTypingTarget(target) {
    if (!(target instanceof HTMLElement))
        return false;
    const tag = target.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
}
/** Declarative keyboard shortcut registration. */
export function useHotkey(combo, handler, { ignoreInInputs = true, enabled = true } = {}) {
    useEffect(() => {
        if (!enabled)
            return;
        const parts = combo.toLowerCase().split('+');
        const key = parts[parts.length - 1];
        const needsCtrl = parts.includes('ctrl') || parts.includes('meta') || parts.includes('mod');
        const needsShift = parts.includes('shift');
        const needsAlt = parts.includes('alt');
        const listener = (event) => {
            const ctrl = event.ctrlKey || event.metaKey;
            if (needsCtrl !== ctrl)
                return;
            if (needsShift !== event.shiftKey)
                return;
            if (needsAlt !== event.altKey)
                return;
            if (event.key.toLowerCase() !== key && event.code.toLowerCase() !== `key${key}`)
                return;
            if (ignoreInInputs && isTypingTarget(event.target) && key !== 'escape')
                return;
            handler(event);
        };
        window.addEventListener('keydown', listener);
        return () => window.removeEventListener('keydown', listener);
    }, [combo, handler, ignoreInInputs, enabled]);
}
