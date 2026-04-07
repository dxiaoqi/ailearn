"use client"

import { useEffect, useState } from "react"
import type { TocItem } from "@/lib/types"

interface Props {
  items: TocItem[]
  heading: string
}

export function TableOfContents({ items, heading }: Props) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const headings = items.map((item) => document.getElementById(item.id)).filter(Boolean)
    if (!headings.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    )

    headings.forEach((el) => observer.observe(el!))
    return () => observer.disconnect()
  }, [items])

  if (!items.length) return null

  return (
    <nav className="sticky top-8">
      <p
        className="text-xs uppercase tracking-wider mb-3"
        style={{ fontWeight: 500, color: "var(--color-text-tertiary)" }}
      >
        {heading}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="block py-1 text-xs leading-snug rounded-md transition-colors"
              style={{
                paddingLeft: item.level === 3 ? "1.25rem" : "0.625rem",
                paddingRight: "0.5rem",
                color:
                  activeId === item.id ? "var(--color-accent)" : "var(--color-text-secondary)",
                background:
                  activeId === item.id ? "var(--color-accent-light)" : "transparent",
                fontWeight: activeId === item.id ? 500 : 400,
                transition: "color var(--transition-fast), background var(--transition-fast)",
              }}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
