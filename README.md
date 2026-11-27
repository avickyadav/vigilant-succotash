# Ashish Yadav — Portfolio (`vigilant-succotash`)

Personal portfolio website for **Ashish Yadav** (Full-Stack & AI-Driven Software Engineer), built with zero-dependency **HTML5, CSS3, and Vanilla JavaScript** for fast static hosting (Azure Static Web Apps / GitHub Pages).

---

## ✨ Features

- **Light & Dark Theme Switch** — Animated day/night pill toggle in the navbar with `localStorage` persistence (`ay-theme`) and `prefers-color-scheme` fallback.
- **Scroll Progress Bar** — Fixed top reading-progress indicator (`#scroll-progress`).
- **Hero & Typing Effect** — Animated role subtitle cycling and pulsing profile ring.
- **Tech Stack with Real SVG Logos** — 4 categorized panels (`AI & GenAI`, `Frontend`, `Backend & Databases`, `DevOps & Cloud`) using local SVGs in `assets/tech-logos/` with automatic dark-mode inversion (`.dark-invert`) for monochrome logos.
- **Work Experience + Focus Chips** — Company cards with logos, scannable colorful focus chips, and impact bullets.
- **Projects Grid** — Text-focused project cards with tech tags and measurable impact metrics.
- **Career Journey Trail** — A scroll-drawn path through eight milestones (education to *Emerging Employee of the Year 2026*), with Piko walking it and stopping at "You are here". A `NEXT_CHAPTER` config in `script.js` drives the next-chapter stop, hero status pill and Experience dates.
- **LinkedIn-Style Recommendations Carousel** — Decorated quote cards with cropped profile avatars (`assets/rec-avatars/`), verified badges, opening/closing quotes, auto-advance, pause-on-hover, arrows, and pagination dots.
- **LinkedIn Posts** — Embedded LinkedIn post iframes (`#posts`).
- **Piko AI Pet Chatbot (`#piko-widget`)** — Cute floating SVG mascot with curated quick-question chips and regex-based intent matching.

---

## 📁 Project Structure

```text
vigilant-succotash/
├── index.html                  # Semantic single-page structure (all 9 sections + Piko widget)
├── style.css                   # Design tokens (--bg, --text, --chip-*, etc.), layout & animations
├── mediaqueries.css            # Responsive breakpoints (≤1200px, ≤1024px, ≤768px, ≤480px)
├── script.js                   # Theme switch, typing effect, scroll reveal, progress bar, carousel, Piko bot
├── AGENTS.md                   # Guide for AI coding agents (Claude Code, Codex, Antigravity, Cursor)
├── README.md                   # Project overview & maintenance guide
└── assets/
    ├── Ashish_Yadav_CV.pdf   # Active CV linked from "Download CV"
    ├── profile-pic.jpg / about-pic2.jpg
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

> **Note on LinkedIn Embeds:** The `<iframe>` embeds in `#posts` load from `https://www.linkedin.com/embed/...` and require internet access + non-blocked third-party frames to render.

---

## 🛠️ Common Content Updates

- **Add a Tech Skill:** Place an `.svg` in `assets/tech-logos/` and add a `.tech-item` block inside `#skills` in `index.html`. Add class `dark-invert` to `<img>` if the SVG is pure black/monochrome.
- **Add a Recommendation:** Crop a square avatar into `assets/rec-avatars/`, duplicate a `.rec-slide` in `index.html`, and add a matching `<span class="rec-dot" onclick="goToRec(N)"></span>` in `#rec-dots`.
- **Add a Chatbot Intent:** Add a `{ pattern: /.../i, reply: "..." }` entry to `INTENTS` inside `initPikoChatbot()` in `script.js`.
- **Update Resume PDF:** Replace the file in `assets/` and update the `window.open(...)` path in `#profile` in `index.html`.

---

## 🚢 Deployment

Deployed automatically via GitHub Actions workflows in `.github/workflows/` to **Azure Static Web Apps** on push.
