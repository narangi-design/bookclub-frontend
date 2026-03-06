import { useState } from 'react'
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis,
  RadialBarChart, RadialBar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  FunnelChart, Funnel, LabelList,
  Sankey,
  Treemap,
  SunburstChart,
  XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'
import type { Book, Poll, PollVote } from '@/types'
import { votesForPoll, sortedPolls } from '@/utils'

// ── Visual constants ─────────────────────────────────────────────────────────
// All chart styling lives here. To change the look of all charts — change here.

export const diagramColors = ['#c0394f', '#d4826a', '#c9a96e', '#7a9e7e', '#5b8db8', '#9b6eb0', '#c07850', '#6aab9e']

export const TT_STYLE = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  color: 'var(--color-text)',
  fontSize: 12,
}

const TICK    = { fontSize: 11, fontWeight: 600, fill: 'var(--color-text-muted)' }  // standard axis labels
const TICK_SM = { fontSize: 10, fontWeight: 600, fill: 'var(--color-text-muted)' }  // dense axes (dates, numbers)

const GRID_V  = { stroke: 'var(--color-border)', vertical: false }   // CartesianGrid, no vertical lines
const GRID_H  = { stroke: 'var(--color-border)', horizontal: false } // CartesianGrid, no horizontal lines
const GRID    = { stroke: 'var(--color-border)' }                    // CartesianGrid, both directions

const AXIS    = { tickLine: false, axisLine: false, tick: TICK }    // standard axis
const AXIS_SM = { tickLine: false, axisLine: false, tick: TICK_SM } // axis with smaller labels

const LEGEND    = { iconSize: 10, wrapperStyle: { fontSize: 12 } }
const LEGEND_SM = { iconSize: 8,  wrapperStyle: { fontSize: 11 } }

// ── Horizontal Bar Chart ──────────────────────────────────────────────────────


interface HBarChartProps {
  data: Record<string, unknown>[]
  dataKey: string
  color?: string
  height?: number
  barSize?: number
  yWidth?: number
  valueLabel?: string
}

export function HBarChart({
  data, dataKey, color = diagramColors[0], height, barSize, yWidth = 200, valueLabel = '',
}: HBarChartProps) {
  const bs = barSize ?? 12
  const h  = height  ?? (data.length * 24 + 12)

  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={data} layout="vertical" barSize={bs}>
        <CartesianGrid {...GRID_H} />
        <XAxis type="number" {...AXIS_SM} />
        <YAxis
          type="category"
          dataKey="name"
          {...AXIS}
          width={yWidth}
          interval={0}
          tick={({ x, y, payload }: { x: string | number; y: string | number; payload: { value: string } }) => {
            const sx = Number(x) - yWidth + 4
            const sy = Number(y)
            const label = String(payload.value)
            // truncate to fit yWidth (~7px per char at font-size 11)
            const maxChars = Math.floor(yWidth / 7)
            const truncated = label.length > maxChars ? label.slice(0, maxChars - 1) + '…' : label
            return (
              <text x={sx} y={sy} dy={4} textAnchor="start" fill={TICK.fill} fontSize={TICK.fontSize} fontWeight={TICK.fontWeight}>
                {truncated}
              </text>
            )
          }}
        />
        <Tooltip contentStyle={TT_STYLE} formatter={((v: number) => [v, valueLabel]) as never} />
        <Bar dataKey={dataKey} fill={color} name={valueLabel} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Simple Line Chart ─────────────────────────────────────────────────────────

interface SimpleLineChartProps {
  data: Record<string, unknown>[]
  xKey: string
  yKey: string
  color?: string
  height?: number
  xInterval?: number
  yWidth?: number
  name?: string
  tooltipLabelFormatter?: (label: unknown) => string
  tooltipFormatter?: (value: number) => [number, string]
}

export function SimpleLineChart({
  data, xKey, yKey, color = diagramColors[0], height = 180, xInterval, yWidth = 24, name = '',
  tooltipLabelFormatter, tooltipFormatter,
}: SimpleLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid {...GRID_V} />
        <XAxis dataKey={xKey} {...AXIS_SM} interval={xInterval} />
        <YAxis {...AXIS} width={yWidth} />
        <Tooltip
          contentStyle={TT_STYLE}
          labelFormatter={tooltipLabelFormatter as ((label: unknown) => string) | undefined}
          formatter={tooltipFormatter as never}
        />
        <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={false} name={name} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Donut / Pie Chart ─────────────────────────────────────────────────────────

interface DonutChartProps {
  data: { name: string; value: number; color?: string }[]
  height?: number
  innerRadius?: number
  outerRadius?: number
}

export function DonutChart({ data, height = 180, innerRadius = 50, outerRadius = 75 }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={outerRadius} paddingAngle={3}>
          {data.map((e, i) => <Cell key={i} fill={e.color ?? diagramColors[i % diagramColors.length]} />)}
        </Pie>
        <Tooltip contentStyle={TT_STYLE} />
        <Legend {...LEGEND} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ── Stacked Area Chart ────────────────────────────────────────────────────────

interface AreaSeries { key: string; name: string; color?: string }

interface StackedAreaChartProps {
  data: Record<string, unknown>[]
  xKey: string
  series: AreaSeries[]
  height?: number
}

export function StackedAreaChart({ data, xKey, series, height = 180 }: StackedAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <CartesianGrid {...GRID_V} />
        <XAxis dataKey={xKey} {...AXIS} />
        <YAxis {...AXIS} width={24} />
        <Tooltip contentStyle={TT_STYLE} />
        {series.map((s, i) => (
          <Area key={s.key} type="monotone" dataKey={s.key} stackId="1"
            stroke={s.color ?? diagramColors[i % diagramColors.length]} fill={s.color ?? diagramColors[i % diagramColors.length]} fillOpacity={0.6} name={s.name} />
        ))}
        <Legend {...LEGEND} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Simple Bar Chart (vertical) ───────────────────────────────────────────────

interface SimpleBarChartProps {
  data: Record<string, unknown>[]
  xKey: string
  dataKey: string
  color?: string
  height?: number
  barSize?: number
  refY?: number
  refLabel?: string
  valueLabel?: string
}

export function SimpleBarChart({
  data, xKey, dataKey, color = diagramColors[0], height = 180, barSize = 40,
  refY, refLabel, valueLabel = '',
}: SimpleBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barSize={barSize}>
        <CartesianGrid {...GRID_V} />
        <XAxis dataKey={xKey} {...AXIS} interval={0} />
        <YAxis {...AXIS} width={24} />
        <Tooltip contentStyle={TT_STYLE} formatter={((v: number) => [v, valueLabel]) as never} />
        {refY != null && (
          <ReferenceLine y={refY} stroke={diagramColors[1]} strokeDasharray="4 3"
            label={{ value: refLabel, fill: 'var(--color-text-muted)', fontSize: 10 }} />
        )}
        <Bar dataKey={dataKey} fill={color} name={valueLabel} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Win Rate Scatter ──────────────────────────────────────────────────────────

interface WinRateScatterProps {
  data: { title: string; nominations: number; totalVotes: number; won: boolean }[]
  height?: number
}

export function WinRateScatter({ data, height = 220 }: WinRateScatterProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart>
        <CartesianGrid {...GRID} />
        <XAxis type="number" dataKey="nominations" name="Номинаций" {...AXIS_SM}
          label={{ value: 'Номинаций', position: 'insideBottom', offset: -2, fontSize: 10, fill: 'var(--color-text-muted)' }} />
        <YAxis type="number" dataKey="totalVotes" name="Голосов" {...AXIS_SM} width={30} />
        <ZAxis range={[30, 30]} />
        <Tooltip contentStyle={TT_STYLE} cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
          if (!payload?.length) return null
          const d = payload[0].payload as { title: string; nominations: number; totalVotes: number }
          return (
            <div style={{ ...TT_STYLE, padding: '6px 10px' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 12 }}>{d.title.slice(0, 30)}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-muted)' }}>Номинаций: {d.nominations} · Голосов: {d.totalVotes}</p>
            </div>
          )
        }} />
        <Scatter data={data.filter(d => !d.won)} fill="var(--color-border)" name="Не победили" />
        <Scatter data={data.filter(d => d.won)}  fill={diagramColors[0]}    name="Победители" />
        <Legend {...LEGEND} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

// ── Poll Pie Chart (with tab selector) ───────────────────────────────────────

interface PollPieChartProps {
  polls: Poll[]
  votes: PollVote[]
  bookById: Record<number, Book>
  height?: number
}

export function PollPieChart({ polls, votes, bookById, height = 180 }: PollPieChartProps) {
  const recentPolls = sortedPolls(polls).slice(-5).reverse()
  const [selectedPollId, setSelectedPollId] = useState(recentPolls[0]?.id ?? 0)
  const pieData = votesForPoll(selectedPollId, votes, bookById)

  return (
    <>
      <div className="poll-tabs">
        {recentPolls.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPollId(p.id)}
            className={`poll-tab${selectedPollId === p.id ? ' poll-tab--active' : ''}`}
          >
            {p.date.slice(0, 7)}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} paddingAngle={2}>
            {pieData.map((_, i) => <Cell key={i} fill={diagramColors[i % diagramColors.length]} />)}
          </Pie>
          <Tooltip contentStyle={TT_STYLE} formatter={((v: number) => [v, 'Голосов']) as never} />
          <Legend {...LEGEND_SM} />
        </PieChart>
      </ResponsiveContainer>
    </>
  )
}

// ── Competitiveness Chart (RadialBar) ────────────────────────────────────────

interface CompetitivenessChartProps {
  data: { ratio: number; date: string; pollId: number }[]
  height?: number
}

export function CompetitivenessChart({ data, height = 220 }: CompetitivenessChartProps) {
  const chartData = data.slice(-12).map((d, i) => ({ ...d, fill: diagramColors[i % diagramColors.length] }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadialBarChart innerRadius={20} outerRadius={100} data={chartData} startAngle={180} endAngle={0}>
        <RadialBar dataKey="ratio" background={{ fill: 'var(--color-border)' }} label={false} />
        <Tooltip contentStyle={TT_STYLE} formatter={((v: number) => [`${v}%`, 'Конкурентность']) as never} />
      </RadialBarChart>
    </ResponsiveContainer>
  )
}

// ── Stage Depth Funnel ───────────────────────────────────────────────────────

interface StageDepthFunnelProps {
  data: { label: string; value: number }[]
  height?: number
}

export function StageDepthFunnel({ data, height = 180 }: StageDepthFunnelProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <FunnelChart>
        <Tooltip contentStyle={TT_STYLE} formatter={((v: number) => [v, 'Голосований']) as never} />
        <Funnel dataKey="value" data={data} isAnimationActive>
          {data.map((_, i) => <Cell key={i} fill={diagramColors[i]} />)}
          <LabelList dataKey="label" position="center" style={{ fill: '#fff', fontSize: 13, fontWeight: 600 }} />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  )
}

// ── Nomination Sankey ────────────────────────────────────────────────────────

interface NominationSankeyProps {
  data: { nodes: { name: string }[]; links: { source: number; target: number; value: number }[] }
  height?: number
}

export function NominationSankey({ data, height = 220 }: NominationSankeyProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <Sankey data={data} nodePadding={20} nodeWidth={12}
        link={{ stroke: 'var(--color-border)', strokeOpacity: 0.6 }}
        node={{ fill: diagramColors[0] }}
      >
        <Tooltip contentStyle={TT_STYLE} />
      </Sankey>
    </ResponsiveContainer>
  )
}

// ── Grouped Bar Chart ────────────────────────────────────────────────────────

interface BarSeries { key: string; name: string; color: string }

interface GroupedBarChartProps {
  data: Record<string, unknown>[]
  xKey: string
  bars: BarSeries[]
  height?: number
  barSize?: number
  xInterval?: number
  stacked?: boolean
}

export function GroupedBarChart({ data, xKey, bars, height = 200, barSize = 36, xInterval, stacked }: GroupedBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barGap={4} barSize={barSize}>
        <CartesianGrid {...GRID_V} />
        <XAxis dataKey={xKey} {...AXIS} interval={xInterval ?? 0} />
        <YAxis {...AXIS} width={24} />
        <Tooltip contentStyle={TT_STYLE} />
        <Legend {...LEGEND} />
        {bars.map(b => (
          <Bar key={b.key} dataKey={b.key} fill={b.color} name={b.name}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Sunburst User Chart ──────────────────────────────────────────────────────

interface SunburstUserChartProps {
  data: unknown
  height?: number
}

export function SunburstUserChart({ data, height = 300 }: SunburstUserChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <SunburstChart data={data as never} dataKey="value">
        <Tooltip contentStyle={TT_STYLE} formatter={((v: number) => [v, 'Книг']) as never} />
      </SunburstChart>
    </ResponsiveContainer>
  )
}

// ── Simple Area Chart ────────────────────────────────────────────────────────

interface SimpleAreaChartProps {
  data: Record<string, unknown>[]
  xKey: string
  yKey: string
  color?: string
  height?: number
  xInterval?: number
  yWidth?: number
  valueLabel?: string
}

export function SimpleAreaChart({
  data, xKey, yKey, color = diagramColors[4], height = 180, xInterval, yWidth = 28, valueLabel = '',
}: SimpleAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <CartesianGrid {...GRID_V} />
        <XAxis dataKey={xKey} {...AXIS_SM} interval={xInterval} />
        <YAxis {...AXIS} width={yWidth} />
        <Tooltip contentStyle={TT_STYLE} formatter={((v: number) => [v, valueLabel]) as never} />
        <Area type="monotone" dataKey={yKey} stroke={color} fill={color} fillOpacity={0.3} name={valueLabel} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Treemap Chart ────────────────────────────────────────────────────────────

interface TreemapChartProps {
  data: { name: string; children?: { name: string; size: number }[] }[]
  height?: number
}

export function TreemapChart({ data, height = 280 }: TreemapChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <Treemap data={data} dataKey="size" aspectRatio={4 / 3} stroke="var(--color-surface)"
        content={({ x, y, width, height: h, name }: { x?: number; y?: number; width?: number; height?: number; name?: string }) => {
          if (!width || !h || width < 30 || h < 20) return <g />
          const groupIdx = data.findIndex(g => g.children?.some(c => c.name === name))
          return (
            <g>
              <rect x={x} y={y} width={width} height={h} fill={diagramColors[groupIdx % diagramColors.length] ?? diagramColors[0]} fillOpacity={0.8} stroke="var(--color-surface)" strokeWidth={2} />
              {width > 45 && h > 24 && (
                <text x={(x ?? 0) + 6} y={(y ?? 0) + 16} fill="#fff" fontSize={11} fontWeight={500}>{String(name ?? '').slice(0, 18)}</text>
              )}
            </g>
          )
        }}
      >
        <Tooltip contentStyle={TT_STYLE} formatter={((v: number) => [v, 'Голосов']) as never} />
      </Treemap>
    </ResponsiveContainer>
  )
}

// ── Radar Multi Chart ────────────────────────────────────────────────────────

interface RadarMultiChartProps {
  data: Record<string, unknown>[]
  keys: string[]
  height?: number
}

export function RadarMultiChart({ data, keys, height = 280 }: RadarMultiChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius={100}>
        <PolarGrid stroke="var(--color-border)" />
        <PolarAngleAxis dataKey="subject" tick={TICK} />
        {keys.map((key, i) => (
          <Radar key={key} name={key} dataKey={key} stroke={diagramColors[i % diagramColors.length]} fill={diagramColors[i % diagramColors.length]} fillOpacity={0.15} />
        ))}
        <Tooltip contentStyle={TT_STYLE} />
        <Legend {...LEGEND_SM} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
