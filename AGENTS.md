# AGENTS.md — Agentic Coding Guide

This repository is a zero-build static portfolio site (`HTML` + `CSS` + `Vanilla JS`). No bundler, package manager install, or compilation step is required.

## Read first
- `DESIGN.md` — design standards (colour, type, spacing, motion, a11y). Follow it for every UI change.
- `docs/UX_PLAN.md` — the phased UX overhaul plan (P0–P5). Implement one phase at a time; don't touch other phases' scope.

## Architecture & Conventions

1. **Single-Page Layout (`index.html`)**
   - Sections in order: `#profile`, `#about`, `#journey`, `#experience`, `#projects`, `#skills`, `#recommendations`, `#contact`. `#posts` (LinkedIn "Writing" row, lazy iframes) lives at the end of `#contact`; `#certifications` is an anchor inside the Trail.
   - **`SECTIONS` array (top of `script.js`) is the source of truth** for the section rail, mobile tab bar and command palette (id, label, short label, icon key, tab mapping). Adding/renaming a section = edit `SECTIONS` once.
   - Three hand-written nav lists must stay in sync with `SECTIONS` (labels: About, Journey, Experience, Projects, Stack, Reviews, Contact): `#desktop-nav` (`.nav-links`), the mobile menu sheet `#menu-sheet` (`.menu-sheet-links`), and `footer nav`. Generated surfaces (do not hand-edit): `#rail`, `#tabbar`, `#palette` items.
   - Use inline `<svg>` with `currentColor` for UI icons so they adapt automatically to light/dark themes.

2. **Theming & Design Tokens (`style.css`)**
   - All colors/type/spacing/radius/motion are CSS custom properties in `:root` (light) and `body.dark` (dark). See `DESIGN.md`.
   - Accent is signal orange (`--accent`); `--accent-soft` is a *background tint only* and `--accent-inv` is text on an accent fill. Dark mode is neutral warm charcoal — never introduce blue/slate tints (every dark colour must have R >= B).
   - Never hardcode `#000` or `#fff` for text/backgrounds; use `var(--text)`, `var(--muted)`, `var(--bg)`, `var(--bg-alt)`, `var(--card-bg)`, `var(--border)`, `var(--accent-soft)`.
   - Fonts: Poppins (`--font-display`, headings), Geist (`--font-body`), Geist Mono (`--font-mono`). Use the `--fs-*`, `--sp-*`, `--r-*` and `--ease-*`/`--dur-*` tokens.
   - Chips: default is neutral; `.chip-indigo|violet|sky|emerald|amber|rose|gold` add a tint — at most one coloured chip per card. **No emoji in chips, badges or UI chrome** (emoji only in Piko chat replies).
   - For monochrome dark SVG logos in `assets/tech-logos/`, add `.dark-invert` so they invert in `body.dark`.

3. **Responsive Rules (`mediaqueries.css`)**
   - Breakpoints: `1200px`, `1024px`, `768px` (switches to `#mobile-nav` + `#tabbar`), `480px`.
   - Maintain `overflow-x: hidden` on `body` and `section` to prevent horizontal scrollbars. On mobile `section` uses `overflow-x: clip` (when supported) so the sticky `.section__text__p1` labels work; `hidden` would make each section a scroll container.
   - Fixed chrome stacking: top bars z100, tab bar z150, Piko widget z250, menu sheet z300, palette z400, toast z500. The tab bar hides while the menu sheet, palette or Piko sheet is open (`body.menu-open|palette-open|piko-lock`). Only `nav.topbar` gets the sticky top-bar styling; other `<nav>`s (rail, tab bar, footer) must not inherit it.

4. **Interactivity (`script.js`)**
   - Self-contained IIFEs: `initTheme`, `initTyping`, `initReveal`, `initTrail`, `initCarousel`, `initScrollProgress`, `initPikoChatbot`, plus navigation: `initScrollspy` (one IntersectionObserver band + bottom-of-page check, publishes to `navSpy.onChange`), `initTopbar` (sliding 2px indicator, scrolled hairline, `Cmd K`/`Ctrl K` labels), `initRail` (>=1200px), `initTabbar` (hide on scroll-down), `initMenuSheet` (full-screen mobile menu, focus trap, scroll lock), `initPalette` (Cmd/Ctrl+K and `/`; `window.commandPalette`), `initWritingRow`. Shared helpers: `showToast(msg)`, `copyText`, `copyEmail`, `scrollToSection`, `trapTab`. No inline `onclick` in new code.
   - **The Trail (`initTrail`, `#journey`)**: semantic `<ol class="trail">` of `<li class="stop" data-state="past|current|next">`; an SVG path (past = solid, scroll-drawn; future = dashed) is rebuilt from the dot positions on resize/font load/expand. A Piko marker follows the drawn tip and is clamped at the "Now" dot. Desktop >=1024px alternates stops around the path and shows a sticky year mini-map; below that it is a straight left rail. `#certifications` is only an anchor inside the AI-102 stop (the standalone section is gone). `#journey` uses `overflow-x: clip` so the sticky mini-map works.
   - **Trail card variants** (all static markup in `index.html`, `data-type` on each `<li>` picks the dot): `.stop--role` (Metacube, Pratham: logo tile, `.stop-metrics` 3-up strip, `.key-work` bullets, `.growth` mini-timeline, `.stop-tech` grayscale logos, Details = full Experience bullets), `.stop--award` (AI-102 cert badge with azure logo, Emerging Employee award with gold-token trophy badge; hover sheen), `.stop--edu`. Now/Next cards are generated by `renderNextChapter()`. Metric numbers keep their final text in HTML (`data-count/prefix/suffix/dec`); `initTrailFx` replays them from 0 once and drives the `--mx/--my` card spotlight (both skipped under reduced motion / touch). Dots are sized by `--dot`/`--dot-y` per type; `.stop-dot` must stay the path anchor. Card metrics/bullets must come from numbers already in `#experience`.
   - **`NEXT_CHAPTER` (top of `script.js`)** is the single source of truth: `renderNextChapter()` updates the hero status pill, the Trail's Now/Next stops, the Experience "Pratham" date (all marked `data-nc` / `data-slot`), and Piko's next-chapter replies. After joining the new company, set `status: 'joined'` plus `company`, `role`, `start` (and `logo` if wanted): the Now stop is replaced by the new company, Pratham gets an end date (month before `start`), and a "What's next?" ghost stop is appended. `window.__setNextChapter({...})` re-renders live for testing.
   - **Piko 2.0 (`initPikoCreature` + `initPikoChatbot`)**: mochi creature SVG lives once in `<template id="piko-tpl">` (gradient ids use `{{u}}`, uniquified per clone); `window.createPiko(size)` returns a new instance (FAB, chat avatar, Journey marker). States via `data-state` (`idle|look|hover|thinking|happy|sleepy|wave`), driven by `window.pikoState`. Colours come from `--piko-*` tokens. Chat uses a regex `INTENTS` array (specific before generic); intents may have `actions:[{label, href|scrollTo|copy}]` and `reply` may be a function. `NEXT_CHAPTER` at the top of `script.js` feeds the next-chapter intent. Keep replies concise, `**bold**` markdown, no client names ("a top-3 management consulting firm"). Mobile ≤768px = bottom sheet. `window.pikoChat.open()` / `.ask(text)` open Piko and send a question programmatically (used by the command palette).

## Verification Checklist for Agents

Before finishing any edit:
1. Verify all `src="./..."` asset paths in `index.html` exist on disk.
2. Serve locally (`python -m http.server 7788`) and check in a browser at desktop (`1280x800`) and mobile (`390x844`) widths in both light and dark modes.
3. Confirm `document.documentElement.scrollWidth <= window.innerWidth` (no horizontal overflow).
4. Do not modify `.github/workflows/` unless deployment configuration changes are requested.
