# Ashish Yadav — Portfolio (`vigilant-succotash`)

Personal portfolio website for **Ashish Yadav** (Full-Stack & AI-Driven Software Engineer), built with zero-dependency **HTML5, CSS3, and Vanilla JavaScript** for fast static hosting (Azure Static Web Apps / GitHub Pages).

---

## ✨ Features

- **Light & Dark Theme Switch** — Animated day/night pill toggle in the navbar with `localStorage` persistence (`ay-theme`) and `prefers-color-scheme` fallback.
- **Navigation & wayfinding** — Sliding-underline scrollspy top bar, desktop section rail (>=1200px), `Cmd/Ctrl+K` (or `/`) command palette with fuzzy search, actions and "Ask Piko", mobile bottom tab bar, full-screen menu sheet and sticky section labels. All driven by the `SECTIONS` array in `script.js`.
- **Scroll Progress Bar** — Fixed top reading-progress indicator (`#scroll-progress`).
- **Hero** — Static statement line, Download CV / Copy email, social links, mono proof strip, status pill driven by `NEXT_CHAPTER`, portrait card.
- **Tech Stack explorer** — Filter tabs with counts, a Core row, grayscale logo tiles and a "where I used it" popover (`STACK_USAGE` in `script.js`) that links to trail stops and projects and dims unrelated tiles.
- **Experience** — Scannable role cards with metric callouts and a Show details disclosure.
- **Projects** — Bento grid on desktop, scroll-snap carousel with dots on mobile.
- **Career Journey Trail** — A scroll-drawn path through eight milestones (education to *Emerging Employee of the Year 2026*), with Piko walking it and stopping at "You are here". A `NEXT_CHAPTER` config in `script.js` drives the next-chapter stop, hero status pill and Experience dates.
- **Recommendations wall** — Compact cards with verbatim pull quotes (no auto-advance), plus a keyboard-friendly reader dialog / mobile bottom sheet.
- **Contact** — Compose panel that opens a prefilled `mailto:` (nothing is sent from the page) and brand-aware channel cards.
- **Writing row** — LinkedIn posts at the end of Contact (`#posts`); each loads its iframe only on click.
- **Performance & a11y** — Resized JPEGs with explicit `width`/`height`, lazy images, fonts via preconnected `<link>`, pre-paint theme script (no dark-mode flash), skip link, landmarks, single `<h1>`, AA contrast tokens, full reduced-motion support, meta description, Open Graph / Twitter tags and an SVG favicon (mini Piko).
- **Piko AI Pet Chatbot (`#piko-widget`)** — Cute floating SVG mascot with curated quick-question chips and regex-based intent matching.

---

## 📁 Project Structure

```text
vigilant-succotash/
├── index.html                  # Semantic single-page structure (all 9 sections + Piko widget)
├── style.css                   # Design tokens (--bg, --text, --chip-*, etc.), layout & animations
├── mediaqueries.css            # Responsive breakpoints (≤1200px, ≤1024px, ≤768px, ≤480px)
├── script.js                   # Theme switch, nav chrome, scroll reveal, section interactions, Piko bot
├── AGENTS.md                   # Guide for AI coding agents (Claude Code, Codex, Antigravity, Cursor)
├── README.md                   # Project overview & maintenance guide
└── assets/
    ├── Ashish_Yadav_CV.pdf   # Active CV linked from "Download CV"
    ├── profile-pic.jpg / about-pic2.jpg   # resized (1080px / 640px wide), JPEG q80
    ├── favicon.svg / apple-touch-icon.png # mini Piko icons
    ├── logos/                  # Company logos (Pratham Software, Metacube)
    ├── tech-logos/             # Local SVG logos for Tech Stack items
    ├── rec-avatars/            # Cropped circular avatars for recommendation cards
    └── rec-screenshots/        # Original LinkedIn recommendation screenshots
```

---

## 🚀 Local Development

Serve locally with any static HTTP server (required for clean relative asset loading and local testing):

```bash
python -m http.server 7788
```

Then open [http://localhost:7788](http://localhost:7788).

> **Note on LinkedIn Embeds:** The `<iframe>` embeds in `#posts` (Writing row) load from `https://www.linkedin.com/embed/...` and require internet access + non-blocked third-party frames to render.

---

## 🛠️ Common Content Updates

- **Add a Tech Skill:** Place an `.svg` in `assets/tech-logos/` and add a `<li class="tech-item" data-cat data-tech><button class="tech-btn">` tile inside `#skills` (and, if the page evidences it, an entry in `STACK_USAGE`). Add class `dark-invert` to `<img>` if the SVG is pure black/monochrome.
- **Add a Recommendation:** Crop a square avatar into `assets/rec-avatars/`, duplicate a `.rec-card` in `#rec-wall` in `index.html` (set `data-rec` on its Read full button) and add a matching `<button class="rec-dot">` in `#rec-dots`.
- **Add a Chatbot Intent:** Add a `{ pattern: /.../i, reply: "..." }` entry to `INTENTS` inside `initPikoChatbot()` in `script.js`.
- **Update Resume PDF:** Replace the file in `assets/` and update the `href` of the CV links (hero, contact, menu sheet, palette action).

---

## 🚢 Deployment

Deployed automatically via GitHub Actions workflows in `.github/workflows/` to **Azure Static Web Apps** on push.
