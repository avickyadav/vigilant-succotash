# DESIGN.md — Design standards

Source of truth for visual decisions. Rationale and roadmap live in `docs/UX_PLAN.md`. Direction: *an engineer's field notebook* — calm, editorial, monochrome-first with one signature accent, mono-type metadata, and two moments of delight (Piko and the Journey trail).

## 1. Colour (tokens in `style.css`: `:root` light, `body.dark` dark)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#FAFAF7` | `#1F1E1D` | page |
| `--bg-alt` | `#F3F2EE` | `#262624` | alternating sections, rails, nav |
| `--card-bg` | `#FFFFFF` | `#2B2A27` | cards |
| `--highlight` | `#F3F2EE` | `#33322F` | hover surfaces |
| `--text` | `#161614` | `#F5F4EF` | body/headings |
| `--muted` | `#5E5E57` | `#A3A199` | secondary text (>= 4.5:1) |
| `--border` | `#E4E2DC` | `#3A3935` | hairlines |
| `--accent` | `#E8590C` | `#FF8A3D` | the only brand colour: links, active states, "now" markers, primary buttons |
| `--accent-inv` | `#FFFFFF` | `#1F1E1D` | text on an accent fill |
| `--accent-fill` | `#C2410C` | `#FF8A3D` | solid button fills (keeps `--accent-inv` text at AA contrast) |
| `--accent-soft` | `#FFF1E8` | `rgba(255,138,61,.12)` | accent *backgrounds* only |
| `--success` | `#2F9E44` | `#51CF66` | status dot only |

Rules:
- Dark mode is neutral warm charcoal, never blue: every dark surface/border/text value has R >= B. No Tailwind slate/gray blue-greys anywhere (shadows, nav blur, chips, Piko window included).
- Layering in dark is by lightness: bg -> alt -> card -> hover -> border.
- No pure `#000`/`#fff` for text or backgrounds; use tokens (`--white`/`--logo-bg` exist for logo tiles and text on brand colours).
- Default chip is neutral (`--bg-alt` bg, `--muted` text, `--border`). `.chip-*` classes add a calm tint; use at most one coloured chip per card.
- No multi-stop gradients in UI chrome (allowed only inside Piko's shading). Brand logos keep their own colours.
- Accent is one variable; swapping it re-themes the site.

## 2. Typography
- Display: **Poppins** 600–700 (`--font-display`) for `.title`, `h1`, the logo and trail stop titles (owner preference — the serif felt stretched).
- UI/body: **Geist** (`--font-body`). Meta/labels/dates/metrics: **Geist Mono** (`--font-mono`), uppercase, `letter-spacing: .06em`, `.75rem`.
- Scale: `--fs-xs .75rem`, `--fs-sm .875rem`, `--fs-base 1rem`, `--fs-lg 1.125rem`, `--fs-xl clamp(1.25rem,2vw,1.5rem)`, `--fs-2xl clamp(1.75rem,3.5vw,2.5rem)`, `--fs-hero clamp(2.5rem,7vw,5rem)`.
- Section header pattern: mono numbered label (`01 — ABOUT`) above a Poppins statement heading.

## 3. Spacing, radius, elevation
- 4-pt scale `--sp-1 … --sp-16`; section padding `--section-y` (`clamp(4rem,10vw,8rem)`); content `--max-w 72rem`, reading `--read-w 40rem`.
- Radius: `--r-sm 8px` (chips/buttons), `--r-md 14px` (cards), `--r-lg 22px` (sheets/modals), `999px` pills.
- Elevation: borders first; shadow only on hover/floating layers (`--shadow-float`).

## 4. Iconography & emoji
- No emoji in UI chrome, chips or badges. Emoji allowed only in Piko chat replies, max one per reply.
- Inline SVG, ~1.75 stroke, `currentColor`, 16/20/24 px.

## 5. Motion
- Tokens: `--ease-out`, `--ease-spring`, `--dur-fast/base/slow` (120/220/420ms).
- Reveal: 12px rise + fade, once. No looping animations except Piko idle.
- Everything respects `prefers-reduced-motion: reduce` (global block at the end of `style.css`).

## 6. Voice
First person, concrete, numbers first. Banned in UI copy: *leverage, cutting-edge, passionate, seamless, synergy, robust*.

## 7. Accessibility baseline
- Interactive elements are `<a>`/`<button>`; global `:focus-visible` ring (2px `--accent`, offset 3px).
- Tap targets >= 44x44px. Carousel and Piko are keyboard operable; `Esc` closes overlays; focus is trapped in sheets and returned on close.
