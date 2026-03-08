// src/components/LazyImage.tsx
// ─────────────────────────────────────────────────────────────────
// Drop-in replacement for <img> across the site.
//
// Features:
//   • WebP with JPG/PNG fallback (via <picture>)
//   • loading="lazy" — browser-native lazy loading
//   • Aspect-ratio placeholder — prevents layout shift (CLS = 0)
//   • Fade-in on load — smooth visual experience
//   • fetchPriority prop for above-fold hero images
//
// USAGE:
//
//   // Below-fold image (default — lazy loaded)
//   <LazyImage
//     src="/images/quality_lab_inspection.jpg"
//     alt="Quality inspector examining automotive parts"
//     width={800}
//     height={533}
//   />
//
//   // Above-fold hero (preload, high priority)
//   <LazyImage
//     src="/images/hero_container_ship.jpg"
//     alt="Container ship representing Setu Overseas export network"
//     width={1920}
//     height={1080}
//     priority
//     className="absolute inset-0 w-full h-full object-cover"
//   />
// ─────────────────────────────────────────────────────────────────

import { useState, CSSProperties } from "react"

interface LazyImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  /** If true: eager loading + high fetchpriority (use for hero/above-fold images only) */
  priority?: boolean
  style?: CSSProperties
  objectFit?: "cover" | "contain" | "fill" | "none"
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  style,
  objectFit = "cover",
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)

  // Derive WebP path from JPG/PNG path
  // e.g. /images/hero.jpg → /images/hero.webp
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, ".webp")
  const hasWebp  = webpSrc !== src

  const aspectRatio = `${width} / ${height}`

  return (
    <div
      style={{
        aspectRatio,
        overflow: "hidden",
        position: "relative",
        background: "rgba(11, 15, 23, 0.4)", // matches site dark bg — prevents flash
        ...style,
      }}
      className={className}
    >
      {/* Shimmer placeholder while image loads */}
      {!loaded && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, #0b0f17 25%, #1a2235 50%, #0b0f17 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
          }}
        />
      )}

      <picture>
        {hasWebp && (
          <source srcSet={webpSrc} type="image/webp" />
        )}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "low"}
          onLoad={() => setLoaded(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit,
            display: "block",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />
      </picture>
    </div>
  )
}

// ─── Shimmer keyframes — inject once ──────────────────────────
// (You can move this into your global CSS if preferred)
if (typeof document !== "undefined") {
  const id = "lazy-image-styles"
  if (!document.getElementById(id)) {
    const style = document.createElement("style")
    style.id = id
    style.textContent = `
      @keyframes shimmer {
        0%   { background-position: -200% center; }
        100% { background-position:  200% center; }
      }
    `
    document.head.appendChild(style)
  }
}
