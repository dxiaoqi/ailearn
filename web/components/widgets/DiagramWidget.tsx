"use client"

import { useEffect, useRef } from "react"
import type { DiagramConfig } from "@/lib/types"

function makeResponsiveSvg(svg: string): string {
  let processed = svg
    .replace(/\s+width=["'][^"']*["']/gi, "")
    .replace(/\s+height=["'][^"']*["']/gi, "")
  processed = processed.replace(/^<svg/, '<svg width="100%"')
  return processed
}

/**
 * For each <g> that contains a direct-child <rect> alongside direct-child <text> elements,
 * measure the union BBox of all the texts (using the browser's actual font metrics via getBBox()),
 * then update the rect's x/y/width/height to snugly wrap the text with the given padding.
 *
 * The rect's rx (border-radius), class, and other attributes are preserved.
 * Any hardcoded width/height in the source SVG acts as a safe fallback if getBBox() is unavailable.
 */
function autoFitRects(
  svgEl: SVGSVGElement,
  padding = { x: 14, y: 10 }
) {
  svgEl.querySelectorAll("g").forEach((g) => {
    const rect = g.querySelector<SVGRectElement>(":scope > rect")
    const texts = Array.from(g.querySelectorAll<SVGTextElement>(":scope > text"))
    // Skip container groups (those that nest other <g> elements — they act as layout wrappers
    // whose bounds are determined by their children, not by their own direct text).
    const hasChildGroups = g.querySelector(":scope > g") !== null

    if (!rect || texts.length === 0 || hasChildGroups) return

    let minX = Infinity, minY = Infinity
    let maxX = -Infinity, maxY = -Infinity

    texts.forEach((text) => {
      try {
        const b = text.getBBox()
        // Skip degenerate boxes (e.g. hidden or not-yet-laid-out elements)
        if (b.width === 0 && b.height === 0) return
        minX = Math.min(minX, b.x)
        minY = Math.min(minY, b.y)
        maxX = Math.max(maxX, b.x + b.width)
        maxY = Math.max(maxY, b.y + b.height)
      } catch {
        // getBBox is unavailable in some environments (e.g. non-SVG namespace)
      }
    })

    if (minX === Infinity) return

    rect.setAttribute("x", String(Math.round(minX - padding.x)))
    rect.setAttribute("y", String(Math.round(minY - padding.y)))
    rect.setAttribute("width", String(Math.round(maxX - minX + padding.x * 2)))
    rect.setAttribute("height", String(Math.round(maxY - minY + padding.y * 2)))
  })
}

/**
 * After rects are auto-fitted, shrink-wrap the SVG viewBox to the actual content bounds
 * so there's no extra whitespace around the diagram.
 */
function fitViewBox(svgEl: SVGSVGElement, margin = 12) {
  try {
    const bbox = svgEl.getBBox()
    if (bbox.width === 0 && bbox.height === 0) return
    svgEl.setAttribute(
      "viewBox",
      `${Math.round(bbox.x - margin)} ${Math.round(bbox.y - margin)} ${Math.round(bbox.width + margin * 2)} ${Math.round(bbox.height + margin * 2)}`
    )
  } catch {
    // noop
  }
}

export function DiagramWidget({ config }: { config: DiagramConfig }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const responsiveSvg = makeResponsiveSvg(config.svg)

  useEffect(() => {
    if (!containerRef.current) return

    // 1. Inject raw SVG string (client-only to avoid hydration mismatch)
    containerRef.current.innerHTML = responsiveSvg

    // 2. Wait one animation frame so the browser has laid out the SVG
    //    and getBBox() returns real font-based measurements.
    requestAnimationFrame(() => {
      const svgEl = containerRef.current?.querySelector("svg") as SVGSVGElement | null
      if (!svgEl) return
      autoFitRects(svgEl)
      fitViewBox(svgEl)
    })
  }, [responsiveSvg])

  return (
    <div
      className="my-6 rounded-xl overflow-hidden animate-fade-in"
      style={{
        border: "0.5px solid var(--color-border-tertiary)",
        background: "var(--color-background-secondary)",
      }}
    >
      {config.title && (
        <div
          className="px-4 py-2.5 text-xs"
          style={{
          fontWeight: 500,
          color: "var(--color-text-secondary)",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          {config.title}
        </div>
      )}

      {/* Empty on SSR; SVG injected + auto-fitted after mount */}
      <div
        ref={containerRef}
        className="p-5"
        style={{ lineHeight: 0 }}
      />

      {config.caption && (
        <div
          className="px-4 py-2.5 text-xs text-center"
          style={{
          color: "var(--color-text-tertiary)",
          borderTop: "0.5px solid var(--color-border-tertiary)",
            lineHeight: 1.5,
          }}
        >
          {config.caption}
        </div>
      )}
    </div>
  )
}
