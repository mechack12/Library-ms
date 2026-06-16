/**
 * Tailwind CSS configuration file.
 * Theme: Blue and Grey only.
 *   60% dominant: slate-900 deep blue-grey / navy
 *   30% dominant: slate-50/100 cool grey light surface
 *   10% accent: blue-600 royal blue / slate-500
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
        // ── Brand tokens (Blue & Grey) ───────────────────────────────────────
        "deep-pine":      "#0F172A",   // 60% dominant dark (slate-900 / navy-grey)
        "soft-parchment": "#F8FAFC",   // 30% light surface / page background (slate-50)
        "teal-blue":      "#2563EB",   // 10% blue accent (blue-600 royal blue)
        "sage-green":     "#475569",   // 10% secondary accent (slate-600 dark grey)
        "dusty-rose":     "#94A3B8",   // cool slate-grey (slate-400) for borders/text

        // ── Error / Destructive / Alerts (Dark slate grey instead of red) ─────
        "error":               "#1E293B",   // slate-800
        "error-container":     "#E2E8F0",   // slate-200
        "on-error":            "#F8FAFC",   // slate-50
        "on-error-container":  "#1E293B",   // slate-800

        // ── Light surfaces (cool slate greys) ─────────────────────────────────
        "surface":                    "#F8FAFC",
        "surface-bright":             "#FFFFFF",
        "surface-dim":                "#E2E8F0",
        "surface-variant":            "#F1F5F9",
        "surface-container-lowest":   "#FFFFFF",
        "surface-container-low":      "#F8FAFC",
        "surface-container":          "#F1F5F9",
        "surface-container-high":     "#E2E8F0",
        "surface-container-highest":  "#CBD5E1",
        "background":                 "#F8FAFC",

        // ── Primary system ───────────────────────────────────────────────────
        "primary":                    "#0F172A",
        "primary-container":          "#1E293B",
        "primary-fixed":              "#CBD5E1",
        "primary-fixed-dim":          "#94A3B8",
        "on-primary":                 "#F8FAFC",
        "on-primary-container":       "#CBD5E1",
        "on-primary-fixed":           "#0F172A",
        "on-primary-fixed-variant":   "#1E293B",
        "inverse-primary":            "#2563EB",

        // ── Secondary system ─────────────────────────────────────────────────
        "secondary":                  "#475569",
        "secondary-container":        "#E2E8F0",
        "secondary-fixed":            "#E2E8F0",
        "secondary-fixed-dim":        "#CBD5E1",
        "on-secondary":               "#F8FAFC",
        "on-secondary-container":     "#1E293B",
        "on-secondary-fixed":         "#1E293B",
        "on-secondary-fixed-variant": "#334155",

        // ── Tertiary system ──────────────────────────────────────────────────
        "tertiary":                   "#1E293B",
        "tertiary-container":         "#334155",
        "tertiary-fixed":             "#E2E8F0",
        "tertiary-fixed-dim":         "#CBD5E1",
        "on-tertiary":                "#F8FAFC",
        "on-tertiary-container":      "#CBD5E1",
        "on-tertiary-fixed":          "#0F172A",
        "on-tertiary-fixed-variant":  "#1E293B",

        // ── On-surface / text ────────────────────────────────────────────────
        "on-surface":          "#0F172A",
        "on-surface-variant":  "#334155",
        "on-background":       "#0F172A",

        // ── Outline / borders ────────────────────────────────────────────────
        "outline":         "#94A3B8",
        "outline-variant":  "#CBD5E1",

        // ── Inverse ──────────────────────────────────────────────────────────
        "inverse-surface":     "#0F172A",
        "inverse-on-surface":  "#F8FAFC",

        // ── Misc compatibility tokens ────────────────────────────────────────
        "on-error-fixed":            "#F8FAFC",
        "on-secondary-fixed-alt":    "#1E293B",
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
        "label-lg":    ["14px", { lineHeight: "20px", letterSpacing: "0.1px",  fontWeight: "600" }],
        "label-md":    ["12px", { lineHeight: "16px", letterSpacing: "0.5px",  fontWeight: "600" }],
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
