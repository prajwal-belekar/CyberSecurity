import type { ReactElement } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer,
  Tooltip as RTooltip, XAxis, YAxis,
} from 'recharts';
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

const AXIS_TICK = { fontSize: 10.5, fontFamily: 'var(--font-mono)', fill: '#828d9a' } as const;

export function ChartTooltip({
  active, payload, label, formatter, unit,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string; dataKey?: string | number }>;
  label?: string | number;
  formatter?: (value: number | string, name: string) => string;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="panel min-w-[150px] border-line-3 bg-base/97 px-2.5 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.7)]">
      <div className="mono mb-1 border-b border-line pb-1 text-[11px] tracking-[0.01em] text-ink-3 uppercase">{label}</div>
      <div className="space-y-0.5">
        {payload.map((entry, i) => (
          <div key={`${entry.dataKey ?? i}`} className="flex items-baseline justify-between gap-3">
            <span className="mono flex items-center gap-1.5 text-[10.5px] text-ink-3">
              <span className="size-1.5 rounded-[1px]" style={{ background: entry.color }} aria-hidden />
              {entry.name}
            </span>
            <span className="mono tnum text-[10.5px] font-semibold text-ink">
              {formatter ? formatter(entry.value ?? 0, String(entry.name ?? '')) : entry.value}
              {unit ? <span className="ml-0.5 text-ink-4">{unit}</span> : null}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface ChartFrameProps {
  height?: number;
  className?: string;
  children: ReactElement;
  ariaLabel: string;
}

export function ChartFrame({ height = 220, className, children, ariaLabel }: ChartFrameProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }} role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
    </div>
  );
}

export function AxisX({ dataKey = 'label', className, ...props }: { dataKey?: string; className?: string; [k: string]: unknown }) {
  return (
    <XAxis
      dataKey={dataKey}
      tick={AXIS_TICK}
      stroke={CHART_COLORS.grid}
      tickLine={false}
      axisLine={{ stroke: CHART_COLORS.grid }}
      minTickGap={18}
      className={className}
      {...props}
    />
  );
}

export function AxisY({ className, width = 34, ...props }: { className?: string; width?: number; [k: string]: unknown }) {
  return (
    <YAxis
      width={width}
      tick={AXIS_TICK}
      stroke={CHART_COLORS.grid}
      tickLine={false}
      axisLine={false}
      className={className}
      {...props}
    />
  );
}

export function Grid() {
  return <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="2 4" vertical={false} />;
}

export function SeverityAreaChart({ data, height = 240, ariaLabel }: { data: Array<Record<string, unknown>>; height?: number; ariaLabel: string }) {
  const series = [
    { key: 'critical', name: 'CRITICAL', color: CHART_COLORS.critical },
    { key: 'high', name: 'HIGH', color: CHART_COLORS.high },
    { key: 'medium', name: 'MEDIUM', color: CHART_COLORS.medium },
    { key: 'low', name: 'LOW', color: CHART_COLORS.low },
    { key: 'info', name: 'INFO', color: CHART_COLORS.info },
  ];
  return (
    <ChartFrame height={height} ariaLabel={ariaLabel}>
      <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -18 }} stackOffset="none">
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.42} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.03} />
            </linearGradient>
          ))}
        </defs>
        <Grid />
        <AxisX />
        <AxisY />
        <RTooltip content={<ChartTooltip />} cursor={{ stroke: '#3b4650', strokeDasharray: '3 3' }} />
        <Legend
          verticalAlign="top" height={22} iconType="square" iconSize={7}
          formatter={(value) => <span className="mono text-[11px] tracking-[0.02em] text-ink-4">{String(value)}</span>}
        />
        {series.map((s) => (
          <Area
            key={s.key} type="monotone" dataKey={s.key} name={s.name} stackId="1"
            stroke={s.color} strokeWidth={1.2} fill={`url(#grad-${s.key})`}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </ChartFrame>
  );
}

export function DualBarChart({
  data, keys, height = 220, ariaLabel, stacked = false,
}: {
  data: Array<Record<string, unknown>>;
  keys: Array<{ key: string; name: string; color: string }>;
  height?: number; ariaLabel: string; stacked?: boolean;
}) {
  return (
    <ChartFrame height={height} ariaLabel={ariaLabel}>
      <BarChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -20 }} barGap={2}>
        <Grid />
        <AxisX />
        <AxisY />
        <RTooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Legend
          verticalAlign="top" height={22} iconType="square" iconSize={7}
          formatter={(value) => <span className="mono text-[11px] tracking-[0.02em] text-ink-4">{String(value)}</span>}
        />
        {keys.map((k) => (
          <Bar
            key={k.key} dataKey={k.key} name={k.name} fill={k.color} radius={[1, 1, 0, 0]}
            stackId={stacked ? 'a' : undefined} isAnimationActive={false} maxBarSize={18}
          />
        ))}
      </BarChart>
    </ChartFrame>
  );
}

export function MultiLineChart({
  data, keys, height = 220, ariaLabel,
}: {
  data: Array<Record<string, unknown>>;
  keys: Array<{ key: string; name: string; color: string }>;
  height?: number; ariaLabel: string;
}) {
  return (
    <ChartFrame height={height} ariaLabel={ariaLabel}>
      <LineChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -20 }}>
        <Grid />
        <AxisX />
        <AxisY />
        <RTooltip content={<ChartTooltip />} cursor={{ stroke: '#3b4650', strokeDasharray: '3 3' }} />
        <Legend
          verticalAlign="top" height={22} iconType="square" iconSize={7}
          formatter={(value) => <span className="mono text-[11px] tracking-[0.02em] text-ink-4">{String(value)}</span>}
        />
        {keys.map((k) => (
          <Line
            key={k.key} type="monotone" dataKey={k.key} name={k.name} stroke={k.color}
            strokeWidth={1.5} dot={false} activeDot={{ r: 2.5, strokeWidth: 0 }} isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ChartFrame>
  );
}

export function SeverityDonut({
  data, height = 200, ariaLabel, innerRadius = 52, outerRadius = 76,
}: {
  data: Array<{ name: string; value: number; color: string }>;
  height?: number; ariaLabel: string; innerRadius?: number; outerRadius?: number;
}) {
  return (
    <ChartFrame height={height} ariaLabel={ariaLabel}>
      <PieChart>
        <RTooltip content={<ChartTooltip />} />
        <Pie
          data={data} dataKey="value" nameKey="name" innerRadius={innerRadius} outerRadius={outerRadius}
          paddingAngle={2} stroke={SURFACE.panel} strokeWidth={2} isAnimationActive={false}
        >
          {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
        </Pie>
      </PieChart>
    </ChartFrame>
  );
}

export function CapabilityRadar({
  data, height = 220, ariaLabel, color = CHART_COLORS.cyber,
}: {
  data: Array<{ subject: string; value: number }>; height?: number; ariaLabel: string; color?: string;
}) {
  return (
    <ChartFrame height={height} ariaLabel={ariaLabel}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={CHART_COLORS.grid} />
        <PolarAngleAxis dataKey="subject" tick={{ ...AXIS_TICK, fontSize: 10.5 }} />
        <RTooltip content={<ChartTooltip />} />
        <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.22} isAnimationActive={false} />
      </RadarChart>
    </ChartFrame>
  );
}
