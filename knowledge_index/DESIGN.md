---
name: Knowledge Index
colors:
  surface: '#f7f9ff'
  surface-dim: '#d7dae0'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4fa'
  surface-container: '#ebeef4'
  surface-container-high: '#e5e8ee'
  surface-container-highest: '#dfe3e9'
  on-surface: '#181c20'
  on-surface-variant: '#464554'
  inverse-surface: '#2d3135'
  inverse-on-surface: '#eef1f7'
  outline: '#777586'
  outline-variant: '#c7c4d7'
  surface-tint: '#4b4bd4'
  primary: '#0b0076'
  on-primary: '#ffffff'
  primary-container: '#1a0dab'
  on-primary-container: '#9091ff'
  inverse-primary: '#c1c1ff'
  secondary: '#005ac1'
  on-secondary: '#ffffff'
  secondary-container: '#4d8efe'
  on-secondary-container: '#00285c'
  tertiary: '#00260a'
  on-tertiary: '#ffffff'
  tertiary-container: '#003e16'
  on-tertiary-container: '#40b25c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1dfff'
  primary-fixed-dim: '#c1c1ff'
  on-primary-fixed: '#09006b'
  on-primary-fixed-variant: '#312ebc'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a41'
  on-secondary-fixed-variant: '#004494'
  tertiary-fixed: '#89fa9b'
  tertiary-fixed-dim: '#6ddd81'
  on-tertiary-fixed: '#002108'
  on-tertiary-fixed-variant: '#005320'
  background: '#f7f9ff'
  on-background: '#181c20'
  surface-variant: '#dfe3e9'
typography:
  headline-lg:
    fontFamily: Roboto Flex
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
  headline-md:
    fontFamily: Roboto Flex
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 26px
  link-title:
    fontFamily: Roboto Flex
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0.2px
  body-lg:
    fontFamily: Source Sans 3
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Source Sans 3
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Source Sans 3
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Source Sans 3
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max-width: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 60px
  stack-spacing-sm: 8px
  stack-spacing-md: 16px
  stack-spacing-lg: 32px
---

## Brand & Style

This design system is built upon the principles of **Utility, Clarity, and Information Density**, drawing direct inspiration from the most ubiquitous information retrieval interface on the web. It is designed for a Library Management System where the primary objective is to make vast amounts of data—books, authors, availability, and archives—instantly findable and readable.

The visual style is **Corporate / Modern** with a strong leaning toward functional minimalism. By stripping away unnecessary ornamentation and relying on a familiar, search-centric visual language, the system evokes a sense of trust and institutional reliability. The aesthetic prioritizes speed and accessibility, ensuring that librarians and patrons alike can navigate complex catalogs with zero friction.

## Colors

The color palette is derived from the iconic Google search ecosystem, optimized for high legibility on white backgrounds.

*   **Primary Blue (#1a0dab):** Reserved exclusively for interactive links and primary titles that lead to deeper content (e.g., Book Titles).
*   **Secondary Blue (#4285f4):** Used for primary action buttons, focus states, and the brand identity.
*   **Neutral Gray (#4d5156):** The standard color for body text and descriptions, providing high contrast without the harshness of pure black.
*   **The Quad-Color Accent:** Red (#ea4335), Yellow (#fbbc05), and Green (#34a853) are used functionally: Green for "Available," Red for "Overdue" or "Damaged," and Yellow for "Reserved" or "Internal Use."
*   **Backgrounds:** A strict white background (#ffffff) is used for the main content area to maximize the "paper" feel of a library catalog.

## Typography

This design system utilizes **Roboto Flex** for structural headings and **Source Sans 3** (a modern equivalent to Lato) for high-performance body text. 

The hierarchy mimics a search results page: titles are larger and set in the Primary Blue, while meta-data (Author, ISBN, Publisher) is set in smaller sizes using Neutral Gray. 

For mobile devices, headlines scale down to a maximum of 20px to ensure long book titles do not wrap excessively, maintaining the "single line" scanability essential for list-heavy library interfaces.

## Layout & Spacing

The design system utilizes a **Fixed Grid** approach for desktop to mirror the centered, readable column of a search engine, transitioning to a **Fluid Grid** for tablet and mobile.

*   **Desktop:** Content is centered with a max-width of 1280px. A specific left-aligned focus (approximately 650px wide) is used for search results to prevent eye strain during rapid scanning.
*   **Rhythm:** A 4px baseline grid ensures vertical consistency. 
*   **Breakpoints:** 
    *   **Mobile (<600px):** Single column, 16px side margins.
    *   **Tablet (600px - 1024px):** 12-column fluid grid, 24px margins.
    *   **Desktop (>1024px):** Fixed 12-column layout with generous white space on the peripheries to focus attention on the catalog data.

## Elevation & Depth

To maintain a flat, fast-loading aesthetic, this design system avoids heavy drop shadows. 

1.  **Low-Contrast Outlines:** Interactive elements like search bars and input fields use a 1px border (#dfe1e5) that darkens on hover.
2.  **Tonal Layers:** Subtle gray backgrounds (#f8f9fa) are used to distinguish header sections or sidebar navigation from the primary white content well.
3.  **Active Elevation:** Only the primary search bar and "sticky" headers may use a soft, diffused shadow (0px 1px 6px rgba(32,33,36,0.28)) to indicate they sit above the scrolling content.

## Shapes

The shape language is "Rounded," providing a modern, approachable feel that softens the data-heavy nature of library records.

*   **Standard Elements:** Input fields, cards, and buttons use a 0.5rem (8px) radius.
*   **Search Components:** The primary search bar uses a **Pill-shaped** (rounded-xl) radius to signify its role as the central hub of the user experience.
*   **Chips & Tags:** Status indicators (e.g., "New Arrival," "Reference Only") are fully pill-shaped to differentiate them from actionable buttons.

## Components

### Buttons & Links
*   **Primary Action:** Solid background (#4285f4) with white text and 8px rounded corners.
*   **Secondary/Ghost:** No background, #1a0dab text, with a subtle gray border on hover.
*   **Inline Links:** Primary Blue (#1a0dab) with an underline appearing only on hover to reduce visual noise in large lists.

### Input Fields & Search
*   **The Global Search Bar:** A large, pill-shaped input with a magnifying glass icon. It remains the most prominent element on the landing page.
*   **Standard Inputs:** Rectangular with 8px corners and #dfe1e5 borders. Focus state uses a 2px Blue (#4285f4) border.

### Cards & Result Items
*   **Catalog Results:** Not contained in boxes. Instead, they are separated by thin horizontal rules (#eff1f3) and generous vertical padding (16px - 24px), mimicking a list of search results.
*   **Book Cards (Grid View):** When in grid view, use a white background with a very subtle 1px border. Do not use shadows.

### Status Indicators (Chips)
*   **Available:** Green (#34a853) text on a light green tint.
*   **Reserved:** Yellow (#fbbc05) text on a light yellow tint.
*   **Overdue:** Red (#ea4335) text on a light red tint.