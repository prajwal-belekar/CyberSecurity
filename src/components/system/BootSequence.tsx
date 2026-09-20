import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { systemApi } from '@/services/systemApi';
import { useSettings } from '@/store/SettingsContext';
import { useUI } from '@/store/UIContext';
import { useHotkey } from '@/hooks/useHotkey';

/** Boot copy is static presentation data — resolve it once, outside render. */
const BOOT_LINES = systemApi.bootLines();

/**
 * Short boot sequence shown once per browser session.
 * Skippable with Escape / click, disabled entirely via Settings → Appearance.
 */
export function BootSequence() {
  const { settings } = useSettings();
  const { booted, completeBoot } = useUI();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (booted || !settings.bootSequence) return;
    setVisible(true);
  }, [booted, settings.bootSequence]);

  useEffect(() => {
    if (!visible) return;
    if (step >= BOOT_LINES.length) {
      const finish = window.setTimeout(() => { setVisible(false); completeBoot(); }, 320);
      return () => window.clearTimeout(finish);
    }
    const id = window.setTimeout(() => setStep((s) => s + 1), 150);
    return () => window.clearTimeout(id);
  }, [visible, step, completeBoot]);

  const skip = () => { setVisible(false); completeBoot(); };
  useHotkey('escape', skip, { enabled: visible, ignoreInInputs: false });

  const done = step >= BOOT_LINES.length;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-void px-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={skip}
          role="status"
          aria-live="polite"
          aria-label="CyberSentinel starting up"
        >
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h1 className="mono flex items-baseline gap-2 text-[13px] font-bold tracking-[0.02em] text-ink uppercase">
                <span className="text-term" aria-hidden>◈</span>
                <span>CyberSentinel <span className="text-term">Security Platform</span></span>
              </h1>
              <button
                type="button"
                onClick={skip}
                className="mono rounded-[2px] border border-line-2 px-2 py-0.5 text-[11px] tracking-[0.02em] text-ink-4 transition-colors hover:border-term/40 hover:text-term"
              >
                Skip [Esc]
              </button>
            </div>
            <div className="mb-3 h-px w-full bg-line" aria-hidden />

            <div className="term-line space-y-1 text-[12px]">
              {BOOT_LINES.slice(0, step).map((line) => (
                <motion.div
                  key={line.label}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.12 }}
                  className="flex items-baseline gap-2"
                >
                  <span className="text-term">[ {line.state} ]</span>
                  <span className="text-ink-2">{line.label}</span>
                  <span className="h-px flex-1 bg-line" aria-hidden />
                  <span className="mono text-[11px] text-ink-4">done</span>
                </motion.div>
              ))}

              {done ? (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="pt-2"
                >
                  <div className="mono text-[13px] font-semibold tracking-[0.02em] text-term uppercase">
                    SYSTEM ONLINE
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="prompt">root@cybersentinel:~$</span>
                    <span className="caret" aria-hidden />
                  </div>
                </motion.div>
              ) : null}
            </div>

            <div className="mt-4 h-px w-full overflow-hidden bg-line">
              <motion.div
                className="h-full bg-term"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.round((step / BOOT_LINES.length) * 100)}%` }}
                transition={{ duration: 0.15 }}
              />
            </div>
            <p className="mono mt-2 text-[11px] tracking-[0.02em] text-ink-4">
              Initializing operator workstation
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
