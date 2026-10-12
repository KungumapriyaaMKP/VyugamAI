"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react"
import { motion, useMotionValue, useSpring, type Variants } from "motion/react"
import "./motion-cursor-multifollow-utils/index.css"

function usePointerPosition() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    window.addEventListener("pointermove", onMove)
    return () => window.removeEventListener("pointermove", onMove)
  }, [x, y])

  return { x, y }
}

type Kind = "default" | "text" | "magnetic"

type CursorState = {
  stageRef: RefObject<HTMLDivElement | null>
  kind: Kind
  caret: number
  targetBoundingBox: DOMRect | null
  pressed: boolean
  zone: string | null
}

const CursorCtx = createContext<CursorState | null>(null)

export function useCursorState() {
  const ctx = useContext(CursorCtx)
  if (!ctx) throw new Error("Cursor must render inside Stage")
  return ctx
}

export function Stage({
  children,
  className = "cursor-stage",
  global = false,
}: {
  children: ReactNode
  className?: string
  global?: boolean
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [kind, setKind] = useState<Kind>("default")
  const [caret, setCaret] = useState(18)
  const [targetBoundingBox, setTarget] = useState<DOMRect | null>(null)
  const [pressed, setPressed] = useState(false)
  const [zone, setZone] = useState<string | null>(null)

  useEffect(() => {
    if (!global) return

    const handlePointerDown = () => setPressed(true)
    const handlePointerUp = () => setPressed(false)
    const handlePointerMove = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null
      if (!el) return
      const zoneEl = el.closest("[data-cursor-zone]") as HTMLElement | null
      setZone(zoneEl?.dataset.cursorZone ?? null)
      const mag = el.closest("[data-magnetic]") as HTMLElement | null
      if (mag) {
        setKind("magnetic")
        setTarget(mag.getBoundingClientRect())
        return
      }
      const text = el.closest("[data-cursor-text]") as HTMLElement | null
      if (text) {
        const lh = parseFloat(getComputedStyle(text).lineHeight)
        setCaret(Number.isFinite(lh) ? lh : 18)
        setKind("text")
        setTarget(text.getBoundingClientRect())
        return
      }
      setKind("default")
      setTarget(null)
    }

    window.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("pointermove", handlePointerMove)

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointermove", handlePointerMove)
    }
  }, [global])

  const defaultClasses = global
    ? "fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
    : className

  return (
    <CursorCtx.Provider
      value={{ stageRef, kind, caret, targetBoundingBox, pressed, zone }}
    >
      <div
        ref={stageRef}
        className={defaultClasses}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => {
          setPressed(false)
          setKind("default")
          setTarget(null)
          setZone(null)
        }}
        onPointerMove={(e) => {
          if (global) return
          const el = e.target as HTMLElement
          const zoneEl = el.closest("[data-cursor-zone]") as HTMLElement | null
          setZone(zoneEl?.dataset.cursorZone ?? null)
          const mag = el.closest("[data-magnetic]") as HTMLElement | null
          if (mag) {
            setKind("magnetic")
            setTarget(mag.getBoundingClientRect())
            return
          }
          const text = el.closest("[data-cursor-text]") as HTMLElement | null
          if (text) {
            const lh = parseFloat(getComputedStyle(text).lineHeight)
            setCaret(Number.isFinite(lh) ? lh : 18)
            setKind("text")
            setTarget(text.getBoundingClientRect())
            return
          }
          setKind("default")
          setTarget(null)
        }}
      >
        {children}
      </div>
    </CursorCtx.Provider>
  )
}

export function Cursor({
  follow = false,
  offset = { x: 0, y: 0 },
  spring: springCfg,
  magnetic,
  variants = {},
  style,
  className,
  children,
}: {
  follow?: boolean
  offset?: { x: number; y: number }
  spring?: { stiffness?: number; damping?: number }
  magnetic?: boolean | { morph?: boolean; snap?: number }
  variants?: Variants
  style?: CSSProperties
  className?: string
  children?: ReactNode
}) {
  const { stageRef, kind, caret, targetBoundingBox, pressed } = useCursorState()
  const pointer = usePointerPosition()
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const baseW = Number(style?.width ?? 16)
  const baseH = Number(style?.height ?? 16)
  const w = useMotionValue(baseW)
  const h = useMotionValue(baseH)
  const opts =
    springCfg ??
    (follow ? { stiffness: 140, damping: 18 } : { stiffness: 900, damping: 55 })
  const x = useSpring(rawX, opts)
  const y = useSpring(rawY, opts)
  const snap = typeof magnetic === "object" ? (magnetic.snap ?? 1) : 1
  const morph = typeof magnetic === "object" ? magnetic.morph !== false : Boolean(magnetic)
  const magneticOn = Boolean(magnetic)

  useEffect(() => {
    const sync = () => {
      const stage = stageRef.current
      if (!stage) return
      const sr = stage.getBoundingClientRect()
      const px = pointer.x.get() - sr.left + offset.x
      const py = pointer.y.get() - sr.top + offset.y
      if (magneticOn && kind === "magnetic" && targetBoundingBox) {
        const tx = targetBoundingBox.left + targetBoundingBox.width / 2 - sr.left
        const ty = targetBoundingBox.top + targetBoundingBox.height / 2 - sr.top
        rawX.set(px + (tx - px) * snap)
        rawY.set(py + (ty - py) * snap)
        if (morph) {
          w.set(targetBoundingBox.width)
          h.set(targetBoundingBox.height)
        } else {
          w.set(baseW)
          h.set(baseH)
        }
        return
      }
      if (kind === "text") {
        rawX.set(px)
        rawY.set(py)
        w.set(2)
        h.set(caret)
        return
      }
      rawX.set(pointer.x.get() ? px : sr.width / 2)
      rawY.set(pointer.y.get() ? py : sr.height / 2)
      w.set(baseW)
      h.set(baseH)
    }

    const stage = stageRef.current
    if (stage) {
      const sr = stage.getBoundingClientRect()
      rawX.set(sr.width / 2)
      rawY.set(sr.height / 2)
    }

    const ux = pointer.x.on("change", sync)
    const uy = pointer.y.on("change", sync)
    return () => {
      ux()
      uy()
    }
  }, [
    baseH,
    baseW,
    caret,
    kind,
    magneticOn,
    morph,
    offset.x,
    offset.y,
    pointer.x,
    pointer.y,
    rawX,
    rawY,
    snap,
    stageRef,
    targetBoundingBox,
    w,
    h,
  ])

  const variantKey =
    pressed && variants.pressed
      ? "pressed"
      : magneticOn && kind === "magnetic" && variants.magnetic
        ? "magnetic"
        : kind === "text" && variants.text
          ? "text"
          : "default"

  const { width: _ignoredW, height: _ignoredH, ...restStyle } = style ?? {}

  return (
    <motion.div
      className={className}
      data-cursor=""
      initial={false}
      animate={variantKey}
      variants={variants}
      style={{
        ...restStyle,
        position: "absolute",
        top: 0,
        left: 0,
        x,
        y,
        width: w,
        height: h,
        translateX: "-50%",
        translateY: "-50%",
        pointerEvents: "none",
        zIndex: 30,
      }}
    >
      {children}
    </motion.div>
  )
}

export function CursorMultifollow({ global = false }: { global?: boolean }) {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const desktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    setIsDesktop(desktop)

    if (global && desktop) {
      document.body.classList.add("custom-cursor-active")
      return () => {
        document.body.classList.remove("custom-cursor-active")
      }
    }
  }, [global])

  if (global && !isDesktop) return null

  return (
    <Stage global={global}>
      <Cursor
        style={{ backgroundColor: "#7e22ce", width: 6, height: 6, borderRadius: "50%" }}
        variants={{ pressed: { scale: 0.5 } }}
      />
      <Cursor
        style={{
          borderRadius: 20,
          border: "2px solid #a855f7",
          backgroundColor: "transparent",
          width: 14,
          height: 14,
        }}
        variants={{ pressed: { scale: 0.6, borderColor: "#c084fc" } }}
        spring={{ stiffness: 1000, damping: 50 }}
      />
      <Cursor
        style={{
          borderRadius: 20,
          border: "2px solid #c084fc",
          backgroundColor: "transparent",
          width: 22,
          height: 22,
        }}
        variants={{ pressed: { scale: 0.7, borderColor: "#e879f9" } }}
        spring={{ stiffness: 800, damping: 70 }}
      />
      <Cursor
        style={{
          borderRadius: 20,
          border: "2px solid #e879f9",
          backgroundColor: "transparent",
          width: 30,
          height: 30,
        }}
        variants={{ pressed: { scale: 0.8, borderColor: "#38bdf8" } }}
        spring={{ stiffness: 700, damping: 90 }}
      />
    </Stage>
  )
}

export default CursorMultifollow
