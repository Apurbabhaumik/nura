# Frontend Design System - TeachStack

This document outlines the core design tokens, layout hierarchy, component guides, and accessibility rules for the TeachStack Next.js frontend.

---

## 1. Visual Identity & Colors

TeachStack uses a premium, modern dark-first design system with subtle glassmorphic shadows, vibrant gradients, and precise borders.

### Color Palette (HSL System)
* **Backgrounds**:
  - Primary Dark: `hsl(222, 47%, 11%)` (#090D1A)
  - Card Surface: `hsl(217, 33%, 17%)` (#1C253B)
  - Glass Border: `hsla(217, 33%, 90%, 0.08)`
* **Accents**:
  - Primary Indigo: `hsl(245, 75%, 60%)` (#5046E5)
  - Secondary Teal: `hsl(175, 70%, 45%)` (#14B8A6)
* **Status**:
  - Success (Green): `hsl(142, 70%, 45%)`
  - Warning (Amber): `hsl(37, 90%, 50%)`
  - Error (Rose): `hsl(350, 80%, 55%)`

---

## 2. Typography

* **Fonts**:
  - Primary: **Inter** (Geared towards readability of dense code/text chunks)
  - Display: **Outfit** (Modern display styling for landing, titles, headers)
* **Hierarchy**:
  - `h1`: 32px / line-height 1.2 / Bold / Outfit
  - `h2`: 24px / line-height 1.3 / SemiBold / Outfit
  - `h3`: 20px / line-height 1.4 / Medium / Outfit
  - `body`: 16px / line-height 1.6 / Regular / Inter
  - `code`: 14px / Monospace / JetBrains Mono

---

## 3. UI Component Blueprint

### A. The Ingester (Drag-and-Drop)
- **Default State**: Dotted border (`hsl(217, 19%, 27%)`), SVG cloud upload icon, helper texts.
- **Drag-over State**: Indigo border pulse animation, background becomes slightly translucent (`hsla(245, 75%, 60%, 0.05)`).
- **Processing State**: Circular infinite spinner, progress bar transitioning to upload endpoint confirm signals.

### B. Interactive Flashcard Deck
- **Perspective Setup**: 3D transform card rotation.
- **Front Side**: Centered textual concept, bold display typography.
- **Back Side**: Explanation detail text in light gray, rating buttons: `Easy`, `Medium`, `Hard`.
- **Interaction**: Triggering rotation on spacebar or click.

### C. Tutor Chat Console
- **Layout**: Fixed right sidebar or split pane viewport.
- **Message Bubbles**:
  - User: Dark slate gray, aligned right.
  - Tutor: Subtle translucent indigo tint, markdown renderer, expandable footnote citations.
- **Floating Controls**: PDF page preview links popping up inline tooltips when clicked.

---

## 4. Accessibility (WCAG 2.1 AA)

- **Contrast**: All text must maintain a minimum contrast ratio of 4.5:1 against the background surface.
- **Keyboard Navigation**:
  - Focus Ring: `2px solid hsl(245, 75%, 60%)` with `offset-2px` for clear visibility.
  - Shortcuts: Spacebar to flip flashcards, Arrow keys to navigate modules.
- **Semantic HTML**: Buttons must have distinct aria-labels, upload inputs must link to relevant labels using `id` and `for`.
