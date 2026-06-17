/**
 * Tailwind CSS configuration file.
 * Theme: Blue, Red & Grey — 60-30-10 Color Rule
 *
 *  60% dominant:  #0F172A  slate-900 deep navy/grey (backgrounds, sidebars, text)
 *  30% secondary: #F8FAFC  slate-50 / cool light grey (surfaces, containers, cards)
 *  10% accent:
 *    ├─ Blue  #2563EB  royal blue-600 (primary CTAs, links, active states, focus)
 *    ├─ Red   #DC2626  red-600        (errors, overdue, delete, destructive)
 *    └─ Grey  #64748B  slate-500      (secondary text, borders, muted elements)
 */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./pages/**/*.html",
    "./js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        // ── 60% DOMINANT: Deep Navy / Dark Grey ─────────────────────────────
        "deep-pine":      "#0F172A",   // slate-900 – sidebar, navbars, headers, body text
        "soft-parchment": "#F8FAFC",   // slate-50  – page backgrounds, light surfaces

        // ── 10% ACCENT BLUE: Primary interactive ───────────────────────────
        "teal-blue":      "#2563EB",   // blue-600 – primary buttons, links, focus rings, active nav

        // ── 10% ACCENT RED: Alerts / Errors / Destructive ──────────────────
        "error":               "#DC2626",   // red-600    – error text, delete, overdue
        "error-container":     "#FEE2E2",   // red-100    – error badge backgrounds
        "on-error":            "#FFFFFF",   // white      – text on error bg
        "on-error-container":  "#991B1B",   // red-800    – text on error-container

        // ── GREY SCALE: Supporting tones ────────────────────────────────────
        "sage-green":     "#475569",   // slate-600  – secondary accents, icon fills
        "dusty-rose":     "#94A3B8",   // slate-400  – muted text, borders, sub-labels

        // ── 30% SECONDARY SURFACES ──────────────────────────────────────────
        "surface":                    "#F8FAFC",   // slate-50
        "surface-bright":             "#FFFFFF",
        "surface-dim":                "#E2E8F0",   // slate-200
        "surface-variant":            "#F1F5F9",   // slate-100
        "surface-container-lowest":   "#FFFFFF",
        "surface-container-low":      "#F8FAFC",   // slate-50
        "surface-container":          "#F1F5F9",   // slate-100
        "surface-container-high":     "#E2E8F0",   // slate-200
        "surface-container-highest":  "#CBD5E1",   // slate-300
        "background":                 "#F8FAFC",

        // ── PRIMARY SYSTEM (Navy / Dark) ─────────────────────────────────────
        "primary":                    "#0F172A",   // slate-900
        "primary-container":          "#1E293B",   // slate-800
        "primary-fixed":              "#CBD5E1",   // slate-300
        "primary-fixed-dim":          "#94A3B8",   // slate-400
        "on-primary":                 "#F8FAFC",
        "on-primary-container":       "#CBD5E1",
        "on-primary-fixed":           "#0F172A",
        "on-primary-fixed-variant":   "#1E293B",
        "inverse-primary":            "#2563EB",

        // ── SECONDARY SYSTEM (Medium Grey) ──────────────────────────────────
        "secondary":                  "#475569",   // slate-600
        "secondary-container":        "#E2E8F0",   // slate-200
        "secondary-fixed":            "#E2E8F0",
        "secondary-fixed-dim":        "#CBD5E1",
        "on-secondary":               "#F8FAFC",
        "on-secondary-container":     "#1E293B",
        "on-secondary-fixed":         "#1E293B",
        "on-secondary-fixed-variant": "#334155",

        // ── TERTIARY SYSTEM ──────────────────────────────────────────────────
        "tertiary":                   "#1E293B",
        "tertiary-container":         "#334155",
        "tertiary-fixed":             "#E2E8F0",
        "tertiary-fixed-dim":         "#CBD5E1",
        "on-tertiary":                "#F8FAFC",
        "on-tertiary-container":      "#CBD5E1",
        "on-tertiary-fixed":          "#0F172A",
        "on-tertiary-fixed-variant":  "#1E293B",

        // ── ON-SURFACE / TEXT ────────────────────────────────────────────────
        "on-surface":          "#0F172A",
        "on-surface-variant":  "#334155",
        "on-background":       "#0F172A",

        // ── OUTLINE / BORDERS ────────────────────────────────────────────────
        "outline":          "#94A3B8",   // slate-400
        "outline-variant":  "#CBD5E1",   // slate-300

        // ── INVERSE ──────────────────────────────────────────────────────────
        "inverse-surface":     "#0F172A",
        "inverse-on-surface":  "#F8FAFC",

        // ── MISC ─────────────────────────────────────────────────────────────
        "on-error-fixed":            "#FFFFFF",
        "on-secondary-fixed-alt":    "#1E293B",
        "on-tertiary-fixed":         "#0F172A",
        "on-tertiary-fixed-variant": "#1E293B",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg:      "0.25rem",
        xl:      "0.5rem",
        full:    "0.75rem",
      },
      spacing: {
        xs:              "4px",
        "container-max": "1280px",
        sm:              "12px",
        md:              "24px",
        lg:              "40px",
        xl:              "64px",
        base:            "8px",
        gutter:          "24px",
      },
      fontFamily: {
        "headline-sm": ["Roboto Flex"],
        "label-lg":    ["Roboto Flex"],
        "label-md":    ["Roboto Flex"],
        "body-sm":     ["Source Sans 3"],
        "display-lg":  ["Roboto Flex"],
        "body-md":     ["Source Sans 3"],
        "body-lg":     ["Source Sans 3"],
        "headline-md": ["Roboto Flex"],
        "headline-lg": ["Roboto Flex"],
      },
      fontSize: {
        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "500" }],
        "label-lg":    ["14px", { lineHeight: "20px", letterSpacing: "0.1px", fontWeight: "600" }],
        "label-md":    ["12px", { lineHeight: "16px", letterSpacing: "0.5px", fontWeight: "600" }],
        "body-sm":     ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "display-lg":  ["48px", { lineHeight: "56px", fontWeight: "700" }],
        "body-md":     ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-lg":     ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries"),
  ],
};
