'use client'

import { useState, useEffect } from 'react'

interface DataPoint {
  x: number
  y: number
}

interface DatasetDef {
  data: DataPoint[]
  type?: 'line' | 'bar' | 'area'
  color?: string
  label?: string
}

interface ChartProps {
  data?: DataPoint[] // Single-series form (backward compatible)
  type?: 'line' | 'bar' // Single-series style (backward compatible)
  datasets?: DatasetDef[] // Multiple series, mixable line/bar/area
  width?: number
  height?: number
  color?: string
  title?: string
}

const DEFAULT_SERIES_COLOR = '#3b82f6'
const DEFAULT_DATASET_COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

export default function Chart({
  data = [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 4 },
    { x: 3, y: 9 },
    { x: 4, y: 16 },
  ],
  type = 'line',
  datasets,
  width = 400,
  height = 300,
  color = DEFAULT_SERIES_COLOR,
  title,
}: ChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Normalize to an array of series (single-series props or explicit datasets)
  const seriesToPlot: DatasetDef[] = datasets || [{ data, type, color }]

  const seriesWithStyles = seriesToPlot.map((s, i) => ({
    ...s,
    type: s.type ?? 'line',
    color: s.color || DEFAULT_DATASET_COLORS[i % DEFAULT_DATASET_COLORS.length],
    label: s.label,
  }))

  const allPoints = seriesWithStyles.flatMap((s) => s.data)
  const maxX = allPoints.length > 0 ? Math.max(...allPoints.map((d) => d.x)) : 1
  const maxY = allPoints.length > 0 ? Math.max(...allPoints.map((d) => d.y)) : 1
  const minX = allPoints.length > 0 ? Math.min(...allPoints.map((d) => d.x)) : 0
  const minY = allPoints.length > 0 ? Math.min(...allPoints.map((d) => d.y)) : 0

  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const scaleX = (x: number) => ((x - minX) / (maxX - minX || 1)) * chartWidth + padding
  const scaleY = (y: number) =>
    height - (((y - minY) / (maxY - minY || 1)) * chartHeight + padding)

  // Baseline for bars and area fills: y = 0 when visible, else the chart floor
  const baselineY = Math.min(Math.max(scaleY(0), padding), height - padding)

  const buildLinePath = (points: DataPoint[]) =>
    points
      .map((point, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(point.x)} ${scaleY(point.y)}`)
      .join(' ')

  const buildAreaPath = (points: DataPoint[]) => {
    if (points.length === 0) return ''
    const line = points
      .map((point, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(point.x)} ${scaleY(point.y)}`)
      .join(' ')
    return `${line} L ${scaleX(points[points.length - 1].x)} ${baselineY} L ${scaleX(points[0].x)} ${baselineY} Z`
  }

  // Group bar series so they can be drawn side by side per x position
  const barSeries = seriesWithStyles.filter((s) => s.type === 'bar')
  const distinctXCount = Math.max(new Set(allPoints.map((d) => d.x)).size, 1)
  const barWidth = (chartWidth / distinctXCount) * 0.6

  const showLegend = seriesWithStyles.length > 1 && seriesWithStyles.some((s) => s.label)

  if (!mounted) {
    return (
      <div className="my-8">
        {title && <h3 className="mb-4 text-center text-xl font-bold">{title}</h3>}
        <div
          style={{ width, height }}
          className="flex items-center justify-center rounded-lg border border-gray-300 bg-white"
        >
          <span className="text-gray-400">Loading chart...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="my-8">
      {title && <h3 className="mb-4 text-center text-xl font-bold">{title}</h3>}
      <div className="flex flex-col items-center gap-3">
        <svg width={width} height={height} className="rounded-lg border border-gray-300 bg-white">
          {/* Grid lines */}
          <g className="grid-lines" stroke="#e5e7eb" strokeWidth="1">
            {[0, 1, 2, 3, 4].map((i) => {
              const y = padding + (i * chartHeight) / 4
              return <line key={`h-${i}`} x1={padding} y1={y} x2={width - padding} y2={y} />
            })}
            {[0, 1, 2, 3, 4].map((i) => {
              const x = padding + (i * chartWidth) / 4
              return <line key={`v-${i}`} x1={x} y1={padding} x2={x} y2={height - padding} />
            })}
          </g>

          {/* Axes */}
          <g className="axes" stroke="#374151" strokeWidth="2">
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} />
          </g>

          {/* Area fills (behind lines and bars) */}
          {seriesWithStyles.map((s, i) =>
            s.type === 'area' ? (
              <path
                key={`area-${i}`}
                d={buildAreaPath(s.data)}
                fill={s.color}
                fillOpacity={0.25}
                stroke="none"
              />
            ) : null,
          )}

          {/* Bars (grouped side by side when several bar series share x values) */}
          {seriesWithStyles.map((s, si) => {
            if (s.type !== 'bar') return null
            const barIndex = barSeries.indexOf(s)
            const slotWidth = barWidth / Math.max(barSeries.length, 1)
            return s.data.map((point, i) => {
              const x = scaleX(point.x) - barWidth / 2 + barIndex * slotWidth
              const y = scaleY(point.y)
              return (
                <rect
                  key={`bar-${si}-${i}`}
                  x={x}
                  y={y}
                  width={Math.max(slotWidth - 2, 1)}
                  height={Math.max(baselineY - y, 0)}
                  fill={s.color}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                />
              )
            })
          })}

          {/* Lines and points */}
          {seriesWithStyles.map((s, i) =>
            s.type === 'line' || s.type === 'area' ? (
              <g key={`line-${i}`}>
                <path
                  d={buildLinePath(s.data)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {s.data.map((point, j) => (
                  <circle
                    key={j}
                    cx={scaleX(point.x)}
                    cy={scaleY(point.y)}
                    r="5"
                    fill={s.color}
                    className="cursor-pointer transition-all"
                  />
                ))}
              </g>
            ) : null,
          )}

          {/* Labels */}
          <g className="labels" fill="#374151" fontSize="12">
            {[...new Set(allPoints.map((d) => d.x))]
              .sort((a, b) => a - b)
              .map((x) => (
                <text key={`x-${x}`} x={scaleX(x)} y={height - padding + 20} textAnchor="middle">
                  {x}
                </text>
              ))}
            {[0, 1, 2, 3, 4].map((i) => {
              const value = minY + ((maxY - minY) * i) / 4
              const y = height - (padding + (i * chartHeight) / 4)
              return (
                <text key={`y-${i}`} x={padding - 10} y={y + 4} textAnchor="end">
                  {value.toFixed(1)}
                </text>
              )
            })}
          </g>
        </svg>

        {/* Legend */}
        {showLegend && (
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg bg-white/80 px-4 py-2 shadow-md backdrop-blur-sm">
            {seriesWithStyles.map((s, i) =>
              s.label ? (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-1 w-6 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="font-mono text-sm font-semibold text-gray-700">{s.label}</span>
                </div>
              ) : null,
            )}
          </div>
        )}
      </div>
    </div>
  )
}
