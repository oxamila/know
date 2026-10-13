'use client'

import { useState, useEffect, useRef } from 'react'

interface FunctionDef {
  func: (x: number, params: Record<string, number>) => number
  color?: string
  label?: string
  /** Shade the area between this curve and the x-axis (y = 0). */
  fill?: boolean
  /** Fill opacity when `fill` is true. Default 0.2. */
  fillOpacity?: number
}

interface ParamDef {
  /** Referenced in functions as `params[name]`. */
  name: string
  /** Slider caption; defaults to `name`. */
  label?: string
  min: number
  max: number
  /** Slider granularity; default 0.1. */
  step?: number
  /** Initial slider value. */
  default?: number
  /** Alias for `default`. */
  value?: number
}

/** Initial value for a param: default ?? value ?? min ?? 0, always finite and clamped. */
function resolveParamValue(p: ParamDef): number {
  const candidate = p.default ?? p.value ?? p.min ?? 0
  const n = typeof candidate === 'number' && Number.isFinite(candidate) ? candidate : 0
  if (typeof p.min === 'number' && n < p.min) return p.min
  if (typeof p.max === 'number' && n > p.max) return p.max
  return n
}

interface MathGraphProps {
  func?: (x: number, params: Record<string, number>) => number // Single function (backward compatible)
  functions?: FunctionDef[] // Multiple functions
  /** Interactive sliders whose values are passed to every function as `params`. */
  params?: ParamDef[]
  xMin?: number
  xMax?: number
  width?: number
  height?: number
  color?: string
  title?: string
  showGrid?: boolean
  points?: number
  showLegend?: boolean
}

export default function MathGraph({
  func,
  functions,
  params,
  xMin: initialXMin = -5,
  xMax: initialXMax = 5,
  width = 500,
  height = 400,
  color = '#10b981',
  title,
  showGrid = true,
  points = 200,
  showLegend = true,
}: MathGraphProps) {
  const [mounted, setMounted] = useState(false)

  // Pan and zoom state
  const [xMin, setXMin] = useState(initialXMin)
  const [xMax, setXMax] = useState(initialXMax)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  // Slider values (one entry per `params` definition)
  const [paramValues, setParamValues] = useState<Record<string, number>>(() =>
    Object.fromEntries((params ?? []).map((p) => [p.name, resolveParamValue(p)])),
  )

  // Curves hidden via legend checkboxes (indices into functionsWithColors)
  const [hidden, setHidden] = useState<Set<number>>(new Set())

  const toggleVisible = (index: number) => {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  // Normalize to array of functions
  const defaultColors = ['#10b981', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6', '#ef4444']
  const funcsToPlot: FunctionDef[] = functions || (func ? [{ func, color, label: 'f(x)' }] : [])

  // Ensure each function has a color
  const functionsWithColors = funcsToPlot.map((f, i) => ({
    ...f,
    color: f.color || defaultColors[i % defaultColors.length],
    label: f.label || `f${i + 1}(x)`,
  }))

  // Generate points for all functions
  const allData = functionsWithColors.map(({ func: f }) => {
    const data: { x: number; y: number }[] = []
    for (let i = 0; i <= points; i++) {
      const x = xMin + (i / points) * (xMax - xMin)
      try {
        const y = f(x, paramValues)
        if (isFinite(y)) {
          data.push({ x, y })
        }
      } catch {
        // Skip invalid points
      }
    }
    return data
  })

  // Calculate bounds across all functions (hidden curves still count so the
  // scale does not jump when a checkbox is toggled)
  const allYValues = allData.flat().map((d) => d.y)
  const maxY = allYValues.length > 0 ? Math.max(...allYValues) : 1
  const minY = allYValues.length > 0 ? Math.min(...allYValues) : -1

  const padding = 50
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const scaleX = (x: number) => ((x - xMin) / (xMax - xMin)) * chartWidth + padding
  const scaleY = (y: number) => height - (((y - minY) / (maxY - minY || 1)) * chartHeight + padding)

  // Generate paths for all functions
  const linePaths = allData.map((data) =>
    data
      .map((point, i) => {
        const x = scaleX(point.x)
        const y = scaleY(point.y)
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' '),
  )

  // Closed paths shading the area between each filled curve and the x-axis
  const fillPaths = functionsWithColors.map((f, i) => {
    if (!f.fill || allData[i].length === 0) return null
    const data = allData[i]
    // Baseline at y = 0, clamped to the chart area when 0 is off-screen.
    const baselineY = Math.min(Math.max(scaleY(0), padding), height - padding)
    const line = data
      .map((point, j) => `${j === 0 ? 'M' : 'L'} ${scaleX(point.x)} ${scaleY(point.y)}`)
      .join(' ')
    return `${line} L ${scaleX(data[data.length - 1].x)} ${baselineY} L ${scaleX(data[0].x)} ${baselineY} Z`
  })

  // Calculate axis positions
  const xAxisY = scaleY(0)
  const yAxisX = scaleX(0)

  // Pan handlers - use regular functions instead of useCallback to avoid hook issues
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const dx = e.clientX - dragStart.x
    const deltaX = -(dx / chartWidth) * (xMax - xMin)

    setXMin(xMin + deltaX)
    setXMax(xMax + deltaX)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return

    const dx = e.touches[0].clientX - dragStart.x
    const deltaX = -(dx / chartWidth) * (xMax - xMin)

    setXMin(xMin + deltaX)
    setXMax(xMax + deltaX)
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Zoom with mouse wheel — only with Ctrl/⌘ held (trackpad pinch reports as
  // ctrlKey). Plain scroll passes through so the page keeps scrolling when the
  // cursor happens to sit over a graph.
  const zoomBy = (factor: number) => {
    const center = (xMin + xMax) / 2
    const range = ((xMax - xMin) * factor) / 2

    setXMin(center - range)
    setXMax(center + range)
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    zoomBy(e.deltaY > 0 ? 1.1 : 0.9)
  }

  // Reset view
  const handleReset = () => {
    setXMin(initialXMin)
    setXMax(initialXMax)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="my-8">
        {title && (
          <h3 className="mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-center text-xl font-bold text-transparent">
            {title}
          </h3>
        )}
        <div className="flex justify-center">
          <div
            style={{ width, height }}
            className="flex items-center justify-center rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-lg"
          >
            <span className="text-gray-400">Loading graph...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="my-8">
      {title && (
        <h3 className="mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-center text-xl font-bold text-transparent">
          {title}
        </h3>
      )}
      <div className="flex flex-col items-center gap-3">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="cursor-grab rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-lg select-none active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          style={{ touchAction: 'pan-y' }}
        >
          {/* Grid lines */}
          {showGrid && (
            <g className="grid-lines" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2">
              {Array.from({ length: 11 }).map((_, i) => {
                const y = padding + (i * chartHeight) / 10
                return (
                  <line
                    key={`h-${i}`}
                    x1={padding}
                    y1={y}
                    x2={width - padding}
                    y2={y}
                    opacity="0.5"
                  />
                )
              })}
              {Array.from({ length: 11 }).map((_, i) => {
                const x = padding + (i * chartWidth) / 10
                return (
                  <line
                    key={`v-${i}`}
                    x1={x}
                    y1={padding}
                    x2={x}
                    y2={height - padding}
                    opacity="0.5"
                  />
                )
              })}
            </g>
          )}

          {/* Axes */}
          <g className="axes" stroke="#1f2937" strokeWidth="2">
            {/* X-axis */}
            {xAxisY >= padding && xAxisY <= height - padding && (
              <line x1={padding} y1={xAxisY} x2={width - padding} y2={xAxisY} />
            )}
            {/* Y-axis */}
            {yAxisX >= padding && yAxisX <= width - padding && (
              <line x1={yAxisX} y1={padding} x2={yAxisX} y2={height - padding} />
            )}
          </g>

          {/* Shaded areas (under filled curves, behind their lines) */}
          {fillPaths.map((fillPath, i) =>
            fillPath && !hidden.has(i) ? (
              <path
                key={`fill-${i}`}
                d={fillPath}
                fill={functionsWithColors[i].color}
                fillOpacity={functionsWithColors[i].fillOpacity ?? 0.2}
                stroke="none"
              />
            ) : null,
          )}

          {/* Function curves */}
          {linePaths.map((linePath, i) =>
            hidden.has(i) ? null : (
              <path
                key={i}
                d={linePath}
                fill="none"
                stroke={functionsWithColors[i].color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-md"
              />
            ),
          )}

          {/* Labels */}
          <g className="labels" fill="#374151" fontSize="12" fontFamily="monospace">
            {/* X-axis labels */}
            {Array.from({ length: 5 }).map((_, i) => {
              const value = xMin + (i / 4) * (xMax - xMin)
              const x = scaleX(value)
              return (
                <text
                  key={`x-${i}`}
                  x={x}
                  y={height - padding + 20}
                  textAnchor="middle"
                  className="font-semibold"
                >
                  {value.toFixed(1)}
                </text>
              )
            })}
            {/* Y-axis labels */}
            {Array.from({ length: 5 }).map((_, i) => {
              const value = minY + (i / 4) * (maxY - minY)
              const y = height - (padding + (i * chartHeight) / 4)
              return (
                <text
                  key={`y-${i}`}
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="font-semibold"
                >
                  {value.toFixed(1)}
                </text>
              )
            })}
          </g>

          {/* Axis labels */}
          <text
            x={width - padding + 10}
            y={
              xAxisY >= padding && xAxisY <= height - padding ? xAxisY - 10 : height - padding + 10
            }
            fontSize="14"
            fontWeight="bold"
            fill="#374151"
          >
            x
          </text>
          <text
            x={yAxisX >= padding && yAxisX <= width - padding ? yAxisX + 10 : padding + 10}
            y={padding - 10}
            fontSize="14"
            fontWeight="bold"
            fill="#374151"
          >
            y
          </text>
        </svg>

        {/* Parameter sliders */}
        {params && params.length > 0 && (
          <div className="flex w-full max-w-lg flex-col gap-2 rounded-lg bg-white/80 px-4 py-3 shadow-md backdrop-blur-sm">
            {params.map((p) => {
              const current = paramValues[p.name] ?? resolveParamValue(p)
              return (
                <label key={p.name} className="flex items-center gap-3 text-sm">
                  <span className="w-28 shrink-0 font-mono font-semibold text-gray-700">
                    {p.label ?? p.name}
                  </span>
                  <input
                    type="range"
                    min={p.min}
                    max={p.max}
                    step={p.step ?? 0.1}
                    value={current}
                    onChange={(e) =>
                      setParamValues((prev) => ({ ...prev, [p.name]: Number(e.target.value) }))
                    }
                    className="flex-1 accent-blue-600"
                    aria-label={p.label ?? p.name}
                  />
                  <span className="w-14 shrink-0 text-right font-mono text-xs text-gray-600">
                    {current.toFixed(2)}
                  </span>
                </label>
              )
            })}
          </div>
        )}

        {/* Legend (checkboxes toggle curve visibility when multiple functions) */}
        {showLegend && functionsWithColors.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg bg-white/80 px-4 py-2 shadow-md backdrop-blur-sm">
            {functionsWithColors.map((f, i) => (
              <label key={i} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={!hidden.has(i)}
                  onChange={() => toggleVisible(i)}
                  className="h-4 w-4 accent-blue-600"
                  aria-label={`Show ${f.label}`}
                />
                <span
                  className="h-1 w-6 rounded-full"
                  style={{ backgroundColor: f.color }}
                  aria-hidden="true"
                />
                <span className="font-mono text-sm font-semibold text-gray-700">{f.label}</span>
              </label>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => zoomBy(1.25)}
            aria-label="Zoom out"
            className="rounded-lg bg-gray-200 px-3 py-2 font-semibold text-gray-700 shadow-md transition-all hover:scale-105 hover:bg-gray-300 active:scale-95"
          >
            −
          </button>
          <button
            onClick={() => zoomBy(0.8)}
            aria-label="Zoom in"
            className="rounded-lg bg-gray-200 px-3 py-2 font-semibold text-gray-700 shadow-md transition-all hover:scale-105 hover:bg-gray-300 active:scale-95"
          >
            +
          </button>
          <button
            onClick={handleReset}
            className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95"
          >
            🔄 Reset View
          </button>
          <span className="font-mono text-sm text-gray-500">
            Range: [{xMin.toFixed(2)}, {xMax.toFixed(2)}]
          </span>
        </div>

        {/* Instructions */}
        <div className="max-w-md text-center text-xs text-gray-500">
          <p>
            💡 <strong>Tip:</strong> Drag to pan • Ctrl/⌘ + scroll (or +/−) to zoom — plain scroll
            moves the page
            {params && params.length > 0 ? ' • Use sliders to change parameters' : ''}
            {functionsWithColors.length > 1 ? ' • Untick legend items to hide curves' : ''} • Tap
            Reset to restore
          </p>
        </div>
      </div>
    </div>
  )
}
