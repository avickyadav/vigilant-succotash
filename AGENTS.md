# AGENTS.md — Agentic Coding Guide

This repository is a zero-build static portfolio site (`HTML` + `CSS` + `Vanilla JS`). No bundler, package manager install, or compilation step is required.

## Architecture & Conventions

1. **Single-Page Layout (`index.html`)**
   - Sections in order: `#profile`, `#about`, `#skills`, `#experience`, `#projects`, `#journey`, `#certifications`, `#recommendations`, `#posts`, `#contact`.
   - Navigation links appear in 3 places: `#desktop-nav`, `#hamburger-nav`, and `footer nav`. Keep all 3 synchronized when adding/renaming sections.
   - Use inline `<svg>` with `currentColor` for UI icons so they adapt automatically to light/dark themes.

2. **Theming & Design Tokens (`style.css`)**
   - All colors are defined as CSS custom properties in `:root` (light) and `body.dark` (dark).
   - Never hardcode `#000` or `#fff` for text/backgrounds; use `var(--text)`, `var(--muted)`, `var(--bg)`, `var(--bg-alt)`, `var(--card-bg)`, `var(--border)`, `var(--accent-soft)`.
   - Reusable chip color classes: `.chip-indigo`, `.chip-violet`, `.chip-sky`, `.chip-emerald`, `.chip-amber`, `.chip-rose`, `.chip-gold`.
   - For monochrome dark SVG logos in `assets/tech-logos/`, add `.dark-invert` so they invert in `body.dark`.

3. **Responsive Rules (`mediaqueries.css`)**
   - Breakpoints: `1200px`, `1024px`, `768px` (switches to `#hamburger-nav`), `480px`.
   - Maintain `overflow-x: hidden` on `body` and `section` to prevent horizontal scrollbars.

4. **Interactivity (`script.js`)**
   - Self-contained IIFEs: `initTheme`, `initTyping`, `initReveal`, `initTimeline`, `initCarousel`, `initActiveNav`, `initScrollProgress`, `initPikoChatbot`.
   - **Piko Chatbot (`initPikoChatbot`)**: Client-side regex intent matcher (`INTENTS` array) + quick-question chips (`.piko-qchip`). Keep replies concise and use `**bold**` markdown (auto-converted to `<strong>`).

## Verification Checklist for Agents

Before finishing any edit:
1. Verify all `src="./..."` asset paths in `index.html` exist on disk.
2. Serve locally (`python -m http.server 7788`) and check in a browser at desktop (`1280x800`) and mobile (`390x844`) widths in both light and dark modes.
3. Confirm `document.documentElement.scrollWidth <= window.innerWidth` (no horizontal overflow).
4. Do not modify `.github/workflows/` unless deployment configuration changes are requested.
