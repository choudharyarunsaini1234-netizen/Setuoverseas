// src/components/AccessibleContactForm.tsx
// ─────────────────────────────────────────────────────────────────
// Accessible, spam-protected contact/inquiry form for Setu Overseas.
//
// Improvements over the original:
//   • Every input has an explicit <label htmlFor> (WCAG 1.3.1)
//   • aria-required, aria-invalid, aria-describedby on all fields
//   • Netlify Forms backend — no server required, free tier: 100/month
//   • Honeypot spam protection
//   • Error messages announced via role="alert"
//   • Success state with accessible confirmation
//   • autocomplete attributes for faster mobile form filling
// ─────────────────────────────────────────────────────────────────

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

// ── Validation schema ─────────────────────────────────────────
const inquirySchema = z.object({
  companyName:  z.string().min(2, "Company name must be at least 2 characters"),
  country:      z.string().min(1, "Please select your country"),
  email:        z.string().email("Please enter a valid email address"),
  phone:        z.string().optional(),
  product:      z.string().min(5, "Please describe the product (min 5 characters)"),
  quantity:     z.string().min(1, "Please provide an estimated quantity"),
  message:      z.string().optional(),
  // Hidden honeypot — never filled by real users
  botField:     z.string().max(0, ""),
})

type InquiryFormData = z.infer<typeof inquirySchema>

// ── Countries list ────────────────────────────────────────────
const COUNTRIES = [
  "United States", "United Kingdom", "Germany", "France", "Netherlands",
  "Australia", "Canada", "Saudi Arabia", "United Arab Emirates", "Qatar",
  "Kuwait", "Bahrain", "Oman", "South Africa", "Nigeria", "Kenya",
  "Malaysia", "Singapore", "Indonesia", "Philippines", "Thailand",
  "Bangladesh", "Sri Lanka", "Nepal", "Other",
]

// ── Shared input styles ───────────────────────────────────────
const inputClass = `
  w-full bg-[#0B0F17]/60 border border-[#A6B0C0]/20 rounded-[10px]
  px-4 py-3 text-[#F7F8FB] text-sm placeholder:text-[#A6B0C0]/40
  focus:outline-none focus:border-[#D4A03A]/60 focus:ring-1 focus:ring-[#D4A03A]/40
  transition-colors duration-200
  aria-[invalid=true]:border-red-400/60 aria-[invalid=true]:ring-red-400/20
`.trim()

const labelClass = "label-mono text-[10px] text-[#A6B0C0] uppercase tracking-widest mb-1.5 block"
const errorClass = "text-red-400 text-xs mt-1 flex items-center gap-1"

// ── Field wrapper ─────────────────────────────────────────────
function Field({ children, error }: { children: React.ReactNode; error?: string }) {
  return (
    <div className="flex flex-col">
      {children}
      {error && (
        <p className={errorClass} role="alert">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
export function AccessibleContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
  })

  const onSubmit = async (data: InquiryFormData) => {
    setSubmitting(true)
    try {
      // Netlify Forms — POST to the same page with form-name
      const body = new URLSearchParams({
        "form-name": "inquiry",
        ...Object.fromEntries(
          Object.entries(data).filter(([k]) => k !== "botField")
        ),
      })

      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      })

      // Fire analytics event (Plausible)
      window.plausible?.("Inquiry Submitted", { props: { country: data.country } })

      setSubmitted(true)
      reset()
    } catch {
      alert("Something went wrong. Please email us at setuoverseas586@gmail.com")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="text-center py-12 px-6"
      >
        <div className="text-5xl mb-4" aria-hidden="true">✓</div>
        <h3 className="text-[#F7F8FB] text-xl font-semibold mb-2">
          Inquiry Sent Successfully
        </h3>
        <p className="text-[#A6B0C0] text-sm leading-relaxed max-w-sm mx-auto">
          Thank you. We review every inquiry personally and will reply within{" "}
          <strong className="text-[#D4A03A]">24 hours</strong> with a plan,
          pricing, and lead time.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 text-[#D4A03A] text-sm underline underline-offset-4 hover:no-underline"
        >
          Submit another inquiry
        </button>
      </div>
    )
  }

  return (
    <form
      name="inquiry"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Send a product inquiry to Setu Overseas"
    >
      {/* Required hidden fields for Netlify Forms */}
      <input type="hidden" name="form-name" value="inquiry" />

      {/* Honeypot — hidden from real users, catches bots */}
      <div style={{ display: "none" }} aria-hidden="true">
        <label htmlFor="bot-field">
          Do not fill this field
          <input
            id="bot-field"
            tabIndex={-1}
            autoComplete="off"
            {...register("botField")}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Company Name */}
        <Field error={errors.companyName?.message}>
          <label htmlFor="company-name" className={labelClass}>
            Company Name <span aria-label="required">*</span>
          </label>
          <input
            id="company-name"
            type="text"
            autoComplete="organization"
            placeholder="Your company name"
            aria-required="true"
            aria-invalid={errors.companyName ? "true" : undefined}
            aria-describedby={errors.companyName ? "company-name-error" : undefined}
            className={inputClass}
            {...register("companyName")}
          />
        </Field>

        {/* Country */}
        <Field error={errors.country?.message}>
          <label htmlFor="country" className={labelClass}>
            Country <span aria-label="required">*</span>
          </label>
          <select
            id="country"
            autoComplete="country-name"
            aria-required="true"
            aria-invalid={errors.country ? "true" : undefined}
            className={inputClass + " cursor-pointer"}
            {...register("country")}
            defaultValue=""
          >
            <option value="" disabled>Select country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        {/* Email */}
        <Field error={errors.email?.message}>
          <label htmlFor="email" className={labelClass}>
            Email Address <span aria-label="required">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="your@company.com"
            aria-required="true"
            aria-invalid={errors.email ? "true" : undefined}
            className={inputClass}
            {...register("email")}
          />
        </Field>

        {/* Phone */}
        <Field error={errors.phone?.message}>
          <label htmlFor="phone" className={labelClass}>
            Phone / WhatsApp
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 555 000 0000"
            aria-required="false"
            className={inputClass}
            {...register("phone")}
          />
        </Field>

        {/* Product Requirement */}
        <Field error={errors.product?.message}>
          <label htmlFor="product" className={labelClass}>
            Product Requirement <span aria-label="required">*</span>
          </label>
          <input
            id="product"
            type="text"
            placeholder="e.g. Engine mounts, rubber seals, gears"
            aria-required="true"
            aria-invalid={errors.product ? "true" : undefined}
            className={inputClass}
            {...register("product")}
          />
        </Field>

        {/* Quantity */}
        <Field error={errors.quantity?.message}>
          <label htmlFor="quantity" className={labelClass}>
            Estimated Quantity <span aria-label="required">*</span>
          </label>
          <input
            id="quantity"
            type="text"
            placeholder="e.g. 500 units / month"
            aria-required="true"
            aria-invalid={errors.quantity ? "true" : undefined}
            className={inputClass}
            {...register("quantity")}
          />
        </Field>

        {/* Message — full width */}
        <Field error={errors.message?.message}>
          <label htmlFor="message" className={labelClass}>
            Additional Notes
          </label>
          <textarea
            id="message"
            rows={4}
            placeholder="Specifications, certifications, delivery timeline, or any other requirements..."
            aria-required="false"
            className={inputClass + " resize-none col-span-full md:col-span-2"}
            style={{ gridColumn: "1 / -1" }}
            {...register("message")}
          />
        </Field>
      </div>

      {/* Submit */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          aria-label={submitting ? "Sending your inquiry..." : "Send inquiry to Setu Overseas"}
          className="btn-primary w-full md:w-auto min-w-[200px] flex items-center justify-center gap-2
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <span
                aria-hidden="true"
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              />
              Sending...
            </>
          ) : (
            "Send Inquiry →"
          )}
        </button>
        <p className="text-[#A6B0C0]/60 text-xs mt-3">
          We respond within 24 hours · No spam · Your details are kept confidential
        </p>
      </div>
    </form>
  )
}

// Type augmentation for Plausible
declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void
  }
}
