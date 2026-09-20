import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { PhishingVerdict } from '@/types/phishing';

const VERDICT_META: Record<PhishingVerdict, { label: string; color: string; tone: string }> = {
  safe: { label: 'LIKELY SAFE', color: '#3fb37f', tone: 'text-term' },
  suspicious: { label: 'SUSPICIOUS', color: '#d0a94f', tone: 'text-medium' },
  phishing: { label: 'POTENTIAL PHISHING', color: '#dd8a52', tone: 'text-high' },
  malicious: { label: 'MALICIOUS', color: '#de6375', tone: 'text-critical' },
  unreachable: { label: 'UNREACHABLE', color: '#97a2af', tone: 'text-ink-3' },
};

export interface RiskScoreProps {
  score: number;
  verdict: PhishingVerdict;
  confidence?: number;
  size?: number;
  animate?: boolean;
  className?: string;
}

/**
 * Circular arc risk gauge. The numeric score, the verdict text and the arc all
 * carry the assessment, so it never depends on colour alone.
 */
export function RiskScore({ score, verdict, confidence, size = 168, animate = true, className }: RiskScoreProps) {
  const meta = VERDICT_META[verdict];
  const stroke = 9;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // 270° arc, gap at the bottom.
  const arc = circumference * 0.75;
  const filled = arc * (Math.max(0, Math.min(100, score)) / 100);

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Risk score ${score} out of 100 — ${meta.label}`}>
          <g transform={`rotate(135 ${size / 2} ${size / 2})`}>
            <circle
              cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke}
              style={{ stroke: 'var(--color-raised)' }}
              strokeDasharray={`${arc} ${circumference}`} strokeLinecap="butt"
            />
            <motion.circle
              cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={meta.color} strokeWidth={stroke}
              strokeLinecap="butt"
              initial={animate ? { strokeDasharray: `0 ${circumference}` } : undefined}
              animate={{ strokeDasharray: `${filled} ${circumference}` }}
              transition={{ duration: animate ? 0.9 : 0, ease: [0.22, 1, 0.36, 1] }}
            />
            {Array.from({ length: 10 }).map((_, i) => {
              const angle = (i / 10) * 270;
              const rad = (angle * Math.PI) / 180;
              const inner = radius - stroke / 2 - 3;
              const outer = radius - stroke / 2 - 7;
              return (
                <line
                  key={i}
                  x1={size / 2 + inner * Math.cos(rad)} y1={size / 2 + inner * Math.sin(rad)}
                  x2={size / 2 + outer * Math.cos(rad)} y2={size / 2 + outer * Math.sin(rad)}
                  strokeWidth={1} style={{ stroke: 'var(--color-line-2)' }}
                />
              );
            })}
          </g>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="label-xs">Risk score</span>
          <div className="flex items-baseline gap-1">
            <motion.span
              key={score}
              initial={animate ? { opacity: 0, y: 4 } : undefined}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="mono tnum text-[34px] leading-none font-bold"
              style={{ color: meta.color }}
            >
              {score}
            </motion.span>
            <span className="mono text-[13px] text-ink-4">/ 100</span>
          </div>
          {typeof confidence === 'number' ? (
            <span className="mono tnum mt-1 text-[11px] tracking-[0.01em] text-ink-4 uppercase">
              CONFIDENCE {confidence.toFixed(2)}
            </span>
          ) : null}
        </div>
      </div>

      <div
        className="mt-1 inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-1"
        style={{ borderColor: `${meta.color}55`, backgroundColor: `${meta.color}14` }}
      >
        <span className="size-1.5 rounded-full" style={{ background: meta.color }} aria-hidden />
        <span className={cn('mono text-[10.5px] font-bold tracking-[0.02em] uppercase', meta.tone)}>{meta.label}</span>
      </div>
    </div>
  );
}

export { VERDICT_META };
