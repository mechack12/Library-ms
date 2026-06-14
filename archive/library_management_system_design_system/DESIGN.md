---
name: Library Management System Design System
colors:
  surface: '#fbf9f7'
  surface-dim: '#dbdad8'
  surface-bright: '#fbf9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f1'
  surface-container: '#efedeb'
  surface-container-high: '#eae8e6'
  surface-container-highest: '#e4e2e0'
  on-surface: '#1b1c1b'
  on-surface-variant: '#434843'
  inverse-surface: '#30302f'
  inverse-on-surface: '#f2f0ee'
  outline: '#737873'
  outline-variant: '#c3c8c2'
  surface-tint: '#526256'
  primary: '#0d1c13'
  on-primary: '#ffffff'
  primary-container: '#223127'
  on-primary-container: '#88998c'
  inverse-primary: '#b9cbbc'
  secondary: '#186c41'
  on-secondary: '#ffffff'
  secondary-container: '#a1f1bb'
  on-secondary-container: '#1f7045'
  tertiary: '#261415'
  on-tertiary: '#ffffff'
  tertiary-container: '#3d2829'
  on-tertiary-container: '#ac8e8f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e7d8'
  primary-fixed-dim: '#b9cbbc'
  on-primary-fixed: '#101f15'
  on-primary-fixed-variant: '#3b4a3f'
  secondary-fixed: '#a4f4bd'
  secondary-fixed-dim: '#88d7a3'
  on-secondary-fixed: '#00210f'
  on-secondary-fixed-variant: '#00522d'
  tertiary-fixed: '#fddadb'
  tertiary-fixed-dim: '#e0bfbf'
  on-tertiary-fixed: '#291617'
  on-tertiary-fixed-variant: '#584142'
  background: '#fbf9f7'
  on-background: '#1b1c1b'
  surface-variant: '#e4e2e0'
  deep-pine: '#223127'
  sage-green: '#68B684'
  teal-blue: '#56A3A6'
  soft-parchment: '#F1DAC4'
  dusty-rose: '#7C6C77'
typography:
  display-lg:
    fontFamily: Roboto Flex
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
  headline-lg:
    fontFamily: Roboto Flex
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Roboto Flex
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Roboto Flex
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Source Sans Three
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Source Sans Three
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Source Sans Three
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Roboto Flex
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.1px
  label-md:
    fontFamily: Roboto Flex
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.5px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1280px
  gutter: 24px
---

Design System & Technical Specifications: Library Management System
1. Project Overview
Project Name: Library Management System
Core Objective: Efficiently manage books, track borrowing activities, and organize library records for schools and universities.
Target Audience: School librarians, university students, teachers, and educational institutions.

2. Visual Identity
Color Palette
Color: Deep Pine, Hex Code: #223127, Role: Primary Branding, Navigation backgrounds, Headers
Color: Sage Green, Hex Code: #68B684, Role: Primary Action buttons (Borrow), Success states
Color: Teal Blue, Hex Code: #56A3A6, Role: Secondary Actions, Links, Accents
Color: Soft Parchment, Hex Code: #F1DAC4, Role: Application Background, Card backgrounds
Color: Dusty Rose, Hex Code: #7C6C77, Role: Neutral text, Borders, Muted UI elements

Typography
Primary Font: Roboto (Sans-serif) - Used for Headings and UI Controls for high legibility.
Secondary Font: Lato (Sans-serif) - Used for body text, book descriptions, and lists.

3. User Experience & Frontend (UI)
Key Layout Components
Global Search Bar: Persistent search functionality to find books by title, author, or category.
Dynamic Dashboard: Visual overview of available vs. borrowed books.
Action Hub: Simplified buttons and forms for borrowing or returning books.

Core Features
Authentication: Separate login portals for Librarians (Admin) and Students (User).
Categorization: Advanced filtering system based on book genres.
Overdue Alerts: Visual notification system for late returns.
Responsive Design: Fully mobile-friendly interface for on-the-go access.