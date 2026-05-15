import React, { useRef, useEffect, useState } from 'react'
import type { TurtleCommand } from '../types'

interface TurtleCanvasProps {
  commands: TurtleCommand[]
  width?: number
  height?: number
}

interface TurtleState {
  x: number
  y: number
  heading: number   // degrees, 0 = east, counter-clockwise
  penDown: boolean
  color: string
  penSize: number
  bgColor: string
  filling: boolean
  fillColor: string
  fillPath: [number, number][]  // canvas coords
}

const CANVAS_W = 500
const CANVAS_H = 380
// How many commands to process per animation frame
const BATCH = 5

function initState(): TurtleState {
  return {
    x: 0, y: 0, heading: 0,
    penDown: true, color: '#000000', penSize: 1,
    bgColor: '#ffffff',
    filling: false, fillColor: '#000000', fillPath: [],
  }
}

/** Convert turtle coords (origin=center, y-up) → canvas coords (origin=top-left, y-down). */
function tx(turtle_x: number, w: number) { return w / 2 + turtle_x }
function ty(turtle_y: number, h: number) { return h / 2 - turtle_y }

function applyCommand(
  ctx: CanvasRenderingContext2D,
  cmd: TurtleCommand,
  st: TurtleState,
  w: number,
  h: number,
): void {
  switch (cmd.cmd) {
    case 'forward':
    case 'backward': {
      const dist = (cmd.cmd === 'backward' ? -1 : 1) * (cmd.n ?? 0)
      const rad = (st.heading * Math.PI) / 180
      const nx = st.x + dist * Math.cos(rad)
      const ny = st.y + dist * Math.sin(rad)
      if (st.penDown) {
        ctx.beginPath()
        ctx.strokeStyle = st.color
        ctx.lineWidth = st.penSize
        ctx.lineCap = 'round'
        ctx.moveTo(tx(st.x, w), ty(st.y, h))
        ctx.lineTo(tx(nx, w), ty(ny, h))
        ctx.stroke()
      }
      if (st.filling) st.fillPath.push([tx(nx, w), ty(ny, h)])
      st.x = nx
      st.y = ny
      break
    }
    case 'right':
      st.heading = ((st.heading - (cmd.n ?? 0)) % 360 + 360) % 360
      break
    case 'left':
      st.heading = ((st.heading + (cmd.n ?? 0)) % 360 + 360) % 360
      break
    case 'setheading':
      st.heading = ((cmd.n ?? 0) % 360 + 360) % 360
      break
    case 'goto': {
      const nx = cmd.x ?? 0, ny = cmd.y ?? 0
      if (st.penDown) {
        ctx.beginPath()
        ctx.strokeStyle = st.color
        ctx.lineWidth = st.penSize
        ctx.moveTo(tx(st.x, w), ty(st.y, h))
        ctx.lineTo(tx(nx, w), ty(ny, h))
        ctx.stroke()
      }
      if (st.filling) st.fillPath.push([tx(nx, w), ty(ny, h)])
      st.x = nx
      st.y = ny
      break
    }
    case 'pendown': st.penDown = true; break
    case 'penup':   st.penDown = false; break
    case 'color':
      st.color = cmd.c ?? '#000000'
      st.fillColor = cmd.c ?? '#000000'
      break
    case 'pensize': st.penSize = Math.max(0.5, cmd.n ?? 1); break
    case 'bgcolor':
      st.bgColor = cmd.c ?? '#ffffff'
      ctx.fillStyle = st.bgColor
      ctx.fillRect(0, 0, w, h)
      break
    case 'begin_fill':
      st.filling = true
      st.fillPath = [[tx(st.x, w), ty(st.y, h)]]
      break
    case 'end_fill':
      if (st.filling && st.fillPath.length > 1) {
        ctx.beginPath()
        ctx.moveTo(st.fillPath[0][0], st.fillPath[0][1])
        for (const [px, py] of st.fillPath.slice(1)) ctx.lineTo(px, py)
        ctx.closePath()
        ctx.fillStyle = st.fillColor
        ctx.fill()
      }
      st.filling = false
      st.fillPath = []
      break
    case 'clear':
      ctx.fillStyle = st.bgColor
      ctx.fillRect(0, 0, w, h)
      break
    default: break
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save()
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h)
  ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2)
  ctx.stroke()
  ctx.restore()
}

export const TurtleCanvas: React.FC<TurtleCanvasProps> = ({
  commands,
  width = CANVAS_W,
  height = CANVAS_H,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<TurtleState>(initState())
  const [cursor, setCursor] = useState(0)  // how many commands drawn so far

  // When a new run arrives: clear the canvas and reset
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    drawGrid(ctx, width, height)
    stateRef.current = initState()
    setCursor(0)
  }, [commands, width, height])

  // Incremental animation: process BATCH commands per rAF
  useEffect(() => {
    if (cursor >= commands.length) return
    const id = requestAnimationFrame(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')!
      const end = Math.min(cursor + BATCH, commands.length)
      for (let i = cursor; i < end; i++) {
        applyCommand(ctx, commands[i], stateRef.current, width, height)
      }
      setCursor(end)
    })
    return () => cancelAnimationFrame(id)
  }, [cursor, commands, width, height])

  const done = cursor >= commands.length

  return (
    <div className="flex flex-col items-center bg-gray-950 border-b border-gray-700">
      {/* Header */}
      <div className="w-full flex items-center gap-2 px-4 py-1 border-b border-gray-800">
        <span className="text-xs text-gray-400 font-medium">Canvas</span>
        {!done && (
          <span className="text-xs text-green-400 animate-pulse">drawing…</span>
        )}
        {done && commands.length > 0 && (
          <span className="text-xs text-gray-600">{commands.length} commands</span>
        )}
      </div>
      {/* Canvas */}
      <div className="overflow-auto w-full flex justify-center py-2 px-2">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="rounded border border-gray-700"
          style={{ background: '#ffffff' }}
        />
      </div>
    </div>
  )
}
