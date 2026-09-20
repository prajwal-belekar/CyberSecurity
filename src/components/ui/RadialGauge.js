import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
/**
 * Shared 270° arc gauge. Value + label + caption are always rendered as text so
 * the reading never relies on colour alone.
 */
export function RadialGauge({ value, label, caption, color, size = 150, strokeWidth = 9, animate = true, ticks = 10, className, }) {
    const clamped = Math.max(0, Math.min(100, value));
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const arc = circumference * 0.75;
    const filled = arc * (clamped / 100);
    return (_jsx("div", { className: cn('flex flex-col items-center', className), children: _jsxs("div", { className: "relative", style: { width: size, height: size }, children: [_jsx("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, role: "img", "aria-label": `${label}: ${Math.round(clamped)} out of 100`, children: _jsxs("g", { transform: `rotate(135 ${size / 2} ${size / 2})`, children: [_jsx("circle", { cx: size / 2, cy: size / 2, r: radius, fill: "none", strokeWidth: strokeWidth, style: { stroke: 'var(--color-raised)' }, strokeDasharray: `${arc} ${circumference}` }), _jsx(motion.circle, { cx: size / 2, cy: size / 2, r: radius, fill: "none", stroke: color, strokeWidth: strokeWidth, initial: animate ? { strokeDasharray: `0 ${circumference}` } : undefined, animate: { strokeDasharray: `${filled} ${circumference}` }, transition: { duration: animate ? 0.9 : 0, ease: [0.22, 1, 0.36, 1] } }), Array.from({ length: ticks }).map((_, i) => {
                                const rad = ((i / ticks) * 270 * Math.PI) / 180;
                                const inner = radius - strokeWidth / 2 - 3;
                                const outer = radius - strokeWidth / 2 - 7;
                                return (_jsx("line", { x1: size / 2 + inner * Math.cos(rad), y1: size / 2 + inner * Math.sin(rad), x2: size / 2 + outer * Math.cos(rad), y2: size / 2 + outer * Math.sin(rad), strokeWidth: 1, style: { stroke: 'var(--color-line-2)' } }, i));
                            })] }) }), _jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center px-2 text-center", children: [_jsx("span", { className: "label-xs", children: label }), _jsx("span", { className: "mono tnum text-[30px] leading-none font-bold", style: { color }, children: Math.round(clamped) }), caption ? _jsx("span", { className: "mono mt-1 text-[11px] leading-tight tracking-[0.01em] text-ink-4 uppercase", children: caption }) : null] })] }) }));
}
