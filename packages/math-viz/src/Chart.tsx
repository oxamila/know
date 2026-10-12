'use client'

import { useState, useEffect } from 'react'

interface ChartProps {
  data?: { x: number; y: number }[]
  type?: 'line' | 'bar'
  width?: number
  height?: number
  color?: string
  title?: string
}

export default function Chart({
  data = [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 4 },
    { x: 3, y: 9 },
    { x: 4, y: 16 },
  ],
  type = 'line',
  width = 400,
  height = 300,
  color = '#3b82f6',
  title,
}: ChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  // Calculate scales
  const maxX = Math.max(...data.map((d) => d.x))
  const maxY = Math.max(...data.map((d) => d.y))
  const minX = Math.min(...data.map((d) => d.x))
  const minY = Math.min(...data.map((d) => d.y))

  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const scaleX = (x: number) => ((x - minX) / (maxX - minX)) * chartWidth + padding
  const scaleY = (y: number) => height - (((y - minY) / (maxY - minY)) * chartHeight + padding)

  // Generate path for line chart
  const linePath = data
    .map((point, i) => {
      const x = scaleX(point.x)
      const y = scaleY(point.y)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <div className="my-8">
      {title && <h3 className="mb-4 text-center text-xl font-bold">{title}</h3>}
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

        {/* Data */}
        {type === 'line' ? (
          <>
            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Points */}
            {data.map((point, i) => (
              <circle
                key={i}
                cx={scaleX(point.x)}
                cy={scaleY(point.y)}
                r="5"
                fill={color}
                className="hover:r-7 cursor-pointer transition-all"
              />
            ))}
          </>
        ) : (
          // Bar chart
          data.map((point, i) => {
            const x = scaleX(point.x)
            const y = scaleY(point.y)
            const barWidth = (chartWidth / data.length) * 0.6
            return (
              <rect
                key={i}
                x={x - barWidth / 2}
                y={y}
                width={barWidth}
                height={height - padding - y}
                fill={color}
                className="cursor-pointer transition-opacity hover:opacity-80"
              />
            )
          })
        )}

        {/* Labels */}
        <g className="labels" fill="#374151" fontSize="12">
          {data.map((point, i) => (
            <text key={`x-${i}`} x={scaleX(point.x)} y={height - padding + 20} textAnchor="middle">
              {point.x}
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
    </div>
  )
}
