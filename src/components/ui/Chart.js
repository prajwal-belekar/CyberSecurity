import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis, } from 'recharts';
import { cn } from '@/utils/cn';
import { SURFACE } from '@/styles/tokens';
/**
 * Chart primitives pre-themed for the dark operator console: hairline axes,
 * monospace tick labels, and a terminal-styled tooltip. Keeping the theming
 * here means no page re-declares colours or fonts.
 */
export const CHART_COLORS = {
    critical: '#de6375',
    high: '#dd8a52',
    medium: '#d0a94f',
    low: '#5fae7a',
    info: '#4f9ac4',
    term: '#3fb37f',
    cyber: '#4a9ec4',
    volt: '#5d8bd7',
    ai: '#9481c6',
    grid: '#242c35',
    axis: '#828d9a',
};
const AXIS_TICK = { fontSize: 10.5, fontFamily: 'var(--font-mono)', fill: '#828d9a' };
export function ChartTooltip({ active, payload, label, formatter, unit, }) {
    if (!active || !payload?.length)
        return null;
    return (_jsxs("div", { className: "panel min-w-[150px] border-line-3 bg-base/97 px-2.5 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.7)]", children: [_jsx("div", { className: "mono mb-1 border-b border-line pb-1 text-[11px] tracking-[0.01em] text-ink-3 uppercase", children: label }), _jsx("div", { className: "space-y-0.5", children: payload.map((entry, i) => (_jsxs("div", { className: "flex items-baseline justify-between gap-3", children: [_jsxs("span", { className: "mono flex items-center gap-1.5 text-[10.5px] text-ink-3", children: [_jsx("span", { className: "size-1.5 rounded-[1px]", style: { background: entry.color }, "aria-hidden": true }), entry.name] }), _jsxs("span", { className: "mono tnum text-[10.5px] font-semibold text-ink", children: [formatter ? formatter(entry.value ?? 0, String(entry.name ?? '')) : entry.value, unit ? _jsx("span", { className: "ml-0.5 text-ink-4", children: unit }) : null] })] }, `${entry.dataKey ?? i}`))) })] }));
}
export function ChartFrame({ height = 220, className, children, ariaLabel }) {
    return (_jsx("div", { className: cn('w-full', className), style: { height }, role: "img", "aria-label": ariaLabel, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: children }) }));
}
export function AxisX({ dataKey = 'label', className, ...props }) {
    return (_jsx(XAxis, { dataKey: dataKey, tick: AXIS_TICK, stroke: CHART_COLORS.grid, tickLine: false, axisLine: { stroke: CHART_COLORS.grid }, minTickGap: 18, className: className, ...props }));
}
export function AxisY({ className, width = 34, ...props }) {
    return (_jsx(YAxis, { width: width, tick: AXIS_TICK, stroke: CHART_COLORS.grid, tickLine: false, axisLine: false, className: className, ...props }));
}
export function Grid() {
    return _jsx(CartesianGrid, { stroke: CHART_COLORS.grid, strokeDasharray: "2 4", vertical: false });
}
export function SeverityAreaChart({ data, height = 240, ariaLabel }) {
    const series = [
        { key: 'critical', name: 'CRITICAL', color: CHART_COLORS.critical },
        { key: 'high', name: 'HIGH', color: CHART_COLORS.high },
        { key: 'medium', name: 'MEDIUM', color: CHART_COLORS.medium },
        { key: 'low', name: 'LOW', color: CHART_COLORS.low },
        { key: 'info', name: 'INFO', color: CHART_COLORS.info },
    ];
    return (_jsx(ChartFrame, { height: height, ariaLabel: ariaLabel, children: _jsxs(AreaChart, { data: data, margin: { top: 6, right: 8, bottom: 0, left: -18 }, stackOffset: "none", children: [_jsx("defs", { children: series.map((s) => (_jsxs("linearGradient", { id: `grad-${s.key}`, x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: s.color, stopOpacity: 0.42 }), _jsx("stop", { offset: "100%", stopColor: s.color, stopOpacity: 0.03 })] }, s.key))) }), _jsx(Grid, {}), _jsx(AxisX, {}), _jsx(AxisY, {}), _jsx(RTooltip, { content: _jsx(ChartTooltip, {}), cursor: { stroke: '#3b4650', strokeDasharray: '3 3' } }), _jsx(Legend, { verticalAlign: "top", height: 22, iconType: "square", iconSize: 7, formatter: (value) => _jsx("span", { className: "mono text-[11px] tracking-[0.02em] text-ink-4", children: String(value) }) }), series.map((s) => (_jsx(Area, { type: "monotone", dataKey: s.key, name: s.name, stackId: "1", stroke: s.color, strokeWidth: 1.2, fill: `url(#grad-${s.key})`, isAnimationActive: false }, s.key)))] }) }));
}
export function DualBarChart({ data, keys, height = 220, ariaLabel, stacked = false, }) {
    return (_jsx(ChartFrame, { height: height, ariaLabel: ariaLabel, children: _jsxs(BarChart, { data: data, margin: { top: 6, right: 8, bottom: 0, left: -20 }, barGap: 2, children: [_jsx(Grid, {}), _jsx(AxisX, {}), _jsx(AxisY, {}), _jsx(RTooltip, { content: _jsx(ChartTooltip, {}), cursor: { fill: 'rgba(255,255,255,0.03)' } }), _jsx(Legend, { verticalAlign: "top", height: 22, iconType: "square", iconSize: 7, formatter: (value) => _jsx("span", { className: "mono text-[11px] tracking-[0.02em] text-ink-4", children: String(value) }) }), keys.map((k) => (_jsx(Bar, { dataKey: k.key, name: k.name, fill: k.color, radius: [1, 1, 0, 0], stackId: stacked ? 'a' : undefined, isAnimationActive: false, maxBarSize: 18 }, k.key)))] }) }));
}
export function MultiLineChart({ data, keys, height = 220, ariaLabel, }) {
    return (_jsx(ChartFrame, { height: height, ariaLabel: ariaLabel, children: _jsxs(LineChart, { data: data, margin: { top: 6, right: 8, bottom: 0, left: -20 }, children: [_jsx(Grid, {}), _jsx(AxisX, {}), _jsx(AxisY, {}), _jsx(RTooltip, { content: _jsx(ChartTooltip, {}), cursor: { stroke: '#3b4650', strokeDasharray: '3 3' } }), _jsx(Legend, { verticalAlign: "top", height: 22, iconType: "square", iconSize: 7, formatter: (value) => _jsx("span", { className: "mono text-[11px] tracking-[0.02em] text-ink-4", children: String(value) }) }), keys.map((k) => (_jsx(Line, { type: "monotone", dataKey: k.key, name: k.name, stroke: k.color, strokeWidth: 1.5, dot: false, activeDot: { r: 2.5, strokeWidth: 0 }, isAnimationActive: false }, k.key)))] }) }));
}
export function SeverityDonut({ data, height = 200, ariaLabel, innerRadius = 52, outerRadius = 76, }) {
    return (_jsx(ChartFrame, { height: height, ariaLabel: ariaLabel, children: _jsxs(PieChart, { children: [_jsx(RTooltip, { content: _jsx(ChartTooltip, {}) }), _jsx(Pie, { data: data, dataKey: "value", nameKey: "name", innerRadius: innerRadius, outerRadius: outerRadius, paddingAngle: 2, stroke: SURFACE.panel, strokeWidth: 2, isAnimationActive: false, children: data.map((entry) => _jsx(Cell, { fill: entry.color }, entry.name)) })] }) }));
}
export function CapabilityRadar({ data, height = 220, ariaLabel, color = CHART_COLORS.cyber, }) {
    return (_jsx(ChartFrame, { height: height, ariaLabel: ariaLabel, children: _jsxs(RadarChart, { data: data, outerRadius: "72%", children: [_jsx(PolarGrid, { stroke: CHART_COLORS.grid }), _jsx(PolarAngleAxis, { dataKey: "subject", tick: { ...AXIS_TICK, fontSize: 10.5 } }), _jsx(RTooltip, { content: _jsx(ChartTooltip, {}) }), _jsx(Radar, { dataKey: "value", stroke: color, fill: color, fillOpacity: 0.22, isAnimationActive: false })] }) }));
}
