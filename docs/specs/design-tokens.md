# CivicActions Homesite Design Tokens

Status: Active public visual specification
Audience: Contributors and designers working on the CivicActions homesite rebuild
Last reviewed: 2026-10-08

This document records the visual identity system, brand tokens, and CSS custom property definitions for the CivicActions homesite rebuild. All tokens are implemented in [web/themes/omnichannel/css/global.css](../../web/themes/omnichannel/css/global.css) and exposed through the theme's global stylesheet.

For component styling standards and progressive-enhancement CSS scoping, see [canon.md](canon.md).

---

## 1. Color Palette

### Primary Colors

| Token Name | Value | Purpose |
| :--- | :--- | :--- |
| `--primary-red` | `#d83933` | Brand accent, primary buttons, links |
| `--primary-blue` | `#162e51` | Primary brand color, headings, dark surfaces |
| `--light-blue` | `#73b3e7` | Supporting accent, highlights |
| `--accent-gold` | `#fa9441` | Warm accent, focus rings |
| `--accent-light-gold` | `#ffbc78` | Secondary warm tint |

### Secondary Colors

| Token Name | Value | Purpose |
| :--- | :--- | :--- |
| `--sec-red` | `#8b0a03` | Dark red variant |
| `--sec-blue` | `#1a4480` | Mid-blue surface tint |
| `--sec-alt-blue` | `#005ea2` | Accessible alternative blue |

### Grayscale

| Token Name | Value | Purpose |
| :--- | :--- | :--- |
| `--white` | `#ffffff` | Backgrounds, inverted text |
| `--gray-05` | `#f0f0f0` | Subtle background tint |
| `--gray-10` | `#e6e6e6` | Card borders, light dividers |
| `--gray-30` | `#adadad` | Mid-light gray, borders |
| `--gray-50` | `#757575` | Subtle text, metadata |
| `--gray-70` | `#454545` | Secondary text, summary copy |
| `--gray-90` | `#171717` | Primary body text |
| `--black` | `#000000` | Pure black |

---

## 2. Typography

### Typefaces

- **Headings (`--font-heading`):** Merriweather, Georgia, serif. Used for page titles, section headings, and display labels.
- **Body (`--font-body`):** Nunito, "Helvetica Neue", sans-serif. Used for body text, UI components, navigation, and captions.

### Typography Scale & Hierarchy

All styles use `1.15` base line height (`--line-height-base`) unless specifically styled for long-form reading (`--line-height-body-large: 1.7`).

#### Headings (Merriweather)

| Level | Size | Weight | Line Height | Color Token | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Display / H1 | 36px / 48px | Regular (400) | 1.25 - 1.4 | `--primary-blue` | Responsive scaling via media query |
| H2 | 28px / 32px | Regular (400) | 1.3 | `--primary-blue` | Section headers |
| H3 | 24px | Regular (400) | 1.3 | `--primary-blue` | Sub-sections, card titles |
| H4 | 20px | Regular (400) | 1.35 | `--primary-blue` | Component headings |
| H5 | 16px | Bold (700) | 1.3 | `--gray-90` | Minor headings |

#### Body Copy (Nunito)

| Variant | Size | Weight | Line Height | Color Token | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Body Default | 16px | Light (300) | 1.6 | `--gray-90` | Standard paragraph text |
| Body Large | 20px (`--size-5`) | Light (300) | 1.7 | `--gray-70` | Hero summaries, lead paragraphs |
| Eyebrow | 16px | Bold (700) | 1.3 | `--primary-red` | Uppercase section taglines |
| Caption | 14px | Light (300) | 1.4 | `--gray-70` | Image and media captions |
| Link | Inherit | Inherit | Inherit | `--link-internal` | Underlined; `--primary-red` |

---

## 3. Spacing System

Spacing tokens follow a strict 4px increment scale:

| Token | Rem Value | Pixel Equivalent | Typical Usage |
| :--- | :--- | :--- | :--- |
| `--size-1` | `0.25rem` | 4px | Inline element offsets, borders |
| `--size-2` | `0.5rem` | 8px | Tight gaps, list item margins |
| `--size-3` | `0.75rem` | 12px | Compact padding, button margins |
| `--size-4` | `1rem` | 16px | Standard padding, card body spacing |
| `--size-5` | `1.25rem` | 20px | Large body font size, medium gap |
| `--size-6` | `1.5rem` | 24px | Container spacing (small), column gap |
| `--size-8` | `2rem` | 32px | Section header spacing, icon size |
| `--size-9` | `2.25rem` | 36px | Component margins |
| `--size-10` | `2.5rem` | 40px | Large element gaps |
| `--size-12` | `3rem` | 48px | Medium container padding |
| `--size-14` | `3.5rem` | 56px | Hero and banner padding |
| `--size-20` | `5rem` | 80px | Standard section container spacing |
| `--size-24` | `6rem` | 96px | Large layout bands |

---

## 4. Container Sizing & Layout

| Token | Value | Purpose |
| :--- | :--- | :--- |
| `--container-max-width` | `1200px` | Maximum full-width page content container |
| `--container-narrow-width` | `45rem` (720px) | Editorial and prose reading column width |
| `--container-wide-width` | `90rem` (1440px) | Expanded layout container |
| `--container-spacing-sm` | `var(--size-6)` (24px) | Compact container horizontal padding |
| `--container-spacing-md` | `var(--size-12)` (48px) | Tablet/medium container padding |
| `--container-spacing-lg` | `var(--size-20)` (80px) | Desktop container padding |

---

## 5. Focus & Elevation

| Token | Value | Purpose |
| :--- | :--- | :--- |
| `--focus-outline-width` | `3px` | Accessible focus ring width (WCAG 2.1 AA) |
| `--focus-outline-offset` | `3px` | Focus ring offset from interactive edge |
| `--shadow-card` | `0 5px 25px -10px rgb(0 0 0 / 0.3)` | Card elevation and hover depth |

---

## 6. Implementation Notes

- Component stylesheets must consume tokens using fallback syntax: `var(--token-name, #fallback-value)`.
- Never introduce bare HTML selectors in component CSS; apply styling strictly under the `.ca-<component>` namespace and `@scope (.ca-<component>)`.
- Hardcode a property value only when no token matches exactly, reporting near-matches rather than silently rounding.
