'use client'

import { Chart, MathGraph, MathGraph3D } from '@repo/math-viz'

/** Live demos for the /docs page — function props require a client boundary. */

export function MathGraphDemo() {
  return (
    <MathGraph
      title="f(x) = sin(x)"
      func={(x) => Math.sin(x)}
      xMin={-Math.PI * 2}
      xMax={Math.PI * 2}
      width={560}
      height={360}
    />
  )
}

export function MultiFunctionDemo() {
  return (
    <MathGraph
      title="sin(x) vs cos(x)"
      functions={[
        { func: (x) => Math.sin(x), label: 'sin(x)' },
        { func: (x) => Math.cos(x), label: 'cos(x)' },
      ]}
      xMin={-Math.PI}
      xMax={Math.PI}
      width={560}
      height={360}
    />
  )
}

export function MathGraph3DDemo() {
  return (
    <MathGraph3D
      title="z = sin(x) · cos(y)"
      func={(x, y) => Math.sin(x) * Math.cos(y)}
      xMin={-Math.PI}
      xMax={Math.PI}
      yMin={-Math.PI}
      yMax={Math.PI}
      gridSize={12}
      width={560}
      height={420}
    />
  )
}

export function ChartDemo() {
  return (
    <Chart
      title="Quarterly results"
      type="bar"
      data={[
        { x: 1, y: 12 },
        { x: 2, y: 19 },
        { x: 3, y: 14 },
        { x: 4, y: 22 },
      ]}
      width={480}
      height={320}
    />
  )
}
