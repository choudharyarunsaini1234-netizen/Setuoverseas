// src/components/WhatsAppButton.tsx
// ─────────────────────────────────────────────────────────────────
// Floating WhatsApp CTA — essential for MENA / SEA B2B buyers.
// Appears on all pages, bottom-right corner.
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react"

interface WhatsAppButtonProps {
  phone?: string
  message?: string
  /** Show after this many pixels of scroll (default: 300) */
  showAfterScroll?: number
}

export function WhatsAppButton({
  phone = "917836908406", // +91 prefix, no +
  message = "Hi Setu Overseas, I'm interested in getting a quote for some products.",
  showAfterScroll = 300,
}: WhatsAppButtonProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfterScroll)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [showAfterScroll])

  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact Setu Overseas on WhatsApp"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        background: "#25D366",
        color: "#fff",
        padding: "0.75rem 1.25rem",
        borderRadius: "9999px",
        fontFamily: "inherit",
        fontWeight: 600,
        fontSize: "0.875rem",
        textDecoration: "none",
        boxShadow: "0 4px 20px rgba(37, 211, 102, 0.4)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.3s ease",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0)" : "translateY(8px)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.transform = "translateY(-2px) scale(1.03)"
        el.style.boxShadow = "0 8px 28px rgba(37, 211, 102, 0.55)"
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = "translateY(0) scale(1)"
        el.style.boxShadow = "0 4px 20px rgba(37, 211, 102, 0.4)"
      }}
    >
      {/* WhatsApp SVG icon */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      <span>WhatsApp Us</span>
    </a>
  )
}
