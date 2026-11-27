# Portfolio UX Overhaul — Plan & Design Standards

> Author: UX review (planning pass). Implementation is meant to be done **phase by phase** in separate sessions (e.g. Sonnet), each phase small enough to verify on its own.
> Stack stays the same: zero-build HTML + CSS + vanilla JS. No frameworks, no bundler.

---

## 0. Diagnosis — why it currently reads as "generic AI portfolio"

| Symptom | Where | Why it hurts |
|---|---|---|
| "Hello, I'm / Name / typing effect / Download CV + Contact Info" hero with a ring photo | `#profile` | This is the single most-cloned portfolio template on the web. Recruiters recognise it in 1 second. |
| Indigo → violet → sky gradient, glowing dots, "AI Buddy" badge | progress bar, Piko, chips | The default "AI product" palette of 2024–26. Zero personality. |
| Dark mode is navy/blue-slate (`#0b0e14`, `#151b28`, `#94a3b8`) | `body.dark` | Feels cold and "template-y"; owner wants a neutral black/grey charcoal like the Claude app. |
| Emoji in almost every chip (🤖 ⚡ 🚀 🧠 🐇 …) and 6-colour rainbow chips per card | Experience, Journey, Projects | Visual noise; reads like LLM output. Nothing is emphasised because everything is. |
| Piko = visor-robot with antenna, ear-nubs, chest LEDs | `#piko-widget` | The literal stock "AI robot" icon. Flat SVG, no life (only a float animation). |
| Staircase = 3 cards of different heights | `#journey` | The metaphor isn't legible: on desktop the risers sit hidden under tall cards; on mobile the stairs are removed entirely so it's just 3 stacked cards. No sense of *movement*, no "where am I now", no future. |
| Down-arrow button after every section, 10 sections, 7 nav links | everywhere | Long single scroll with no wayfinding beyond a thin progress bar. Active nav = only `font-weight: 700`. |
| Mobile: plain dropdown hamburger; Piko window is fixed width and overflows the screen (send button cut off); `scrollWidth` 417 at a 375 viewport | mobile | Feels like a shrunk desktop site, not a mobile experience. |
| Content duplication: Experience, Journey, Certifications and About cards repeat the same facts | multiple | Readers scroll past the same info 3 times. |
| Inconsistent confidentiality: Experience says "Global Top-3 Consulting Firm", Piko + recommendation say "BCGX" | Experience vs Piko | Resolved: anonymous everywhere (§5.3). |

**Design direction in one line:** *an engineer's field notebook* — calm, editorial, monochrome-first with one signature accent, precise mono-type metadata, and exactly two moments of delight (Piko and the Journey trail). Minimal everywhere else.

---

## 1. Design standards (extract into `DESIGN.md` in Phase 0)

### 1.1 Colour
Keep the token architecture (`:root` + `body.dark`), change the values. One accent, neutrals do the rest.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#FAFAF7` (warm paper) | `#1F1E1D` (warm charcoal) | page |
| `--bg-alt` | `#F3F2EE` | `#262624` | alternating sections, rails, nav |
| `--card-bg` | `#FFFFFF` | `#2B2A27` | cards |
| `--text` | `#161614` | `#F5F4EF` | body/headings |
| `--muted` | `#5E5E57` | `#A3A199` | secondary text (≥ 4.5:1 on bg) |
| `--border` | `#E4E2DC` | `#3A3935` | hairlines |
| `--accent` | `#E8590C` (signal orange) | `#FF8A3D` | **the only brand colour**: links, active states, "now" markers, Piko's sprout |
| `--accent-soft` | `#FFF1E8` | `rgba(255,138,61,.12)` | accent backgrounds |
| `--success` | `#2F9E44` | `#51CF66` | "available", status dot only |

**Dark mode = neutral charcoal, never blue.** The current dark theme (`#0b0e14`, `#151b28`, `#242d3f`, slate `#94a3b8`) is blue-tinted; replace it with warm black/grey surfaces in the spirit of the Claude app's dark UI. Rules:
- Every dark surface/border/text value must have **R ≥ B** (zero or slightly warm hue, saturation < 6%). No Tailwind `slate-*`/`gray-*` blue-greys anywhere, including `--shadow`, `--nav-blur` (`rgba(31,30,29,.85)`), chip dark backgrounds, Piko's window and the scroll/progress elements.
- Layering is by lightness only: bg `#1F1E1D` → alt `#262624` → card `#2B2A27` → hover `#33322F` → border `#3A3935`. Shadows are mostly replaced by these steps in dark mode.
- Dark chips: neutral `rgba(255,255,255,.06)` bg + `--muted` text; the single accent chip uses `--accent-soft`.
- Avoid pure `#000` (too harsh against the warm text) and pure `#FFF` text (use `#F5F4EF`).

Rules:
- Keep the `.chip-*` classes for backward compatibility but **use at most one coloured chip per card**; default chip = neutral (`--bg-alt` bg, `--muted` text, `--border` border).
- No multi-stop gradients in UI chrome. Gradients are allowed only inside Piko's shading.
- Brand logos keep their own colours (they're content, not chrome).

> If the user prefers to keep the indigo identity, swap `--accent` to `#4F46E5`/`#818CF8` — everything else in this plan still applies. Accent is one variable.

### 1.2 Typography
- Display: **Poppins** 600–700 for headings (owner kept the original heading font; Instrument Serif was tried and rejected as looking stretched).
- UI/body: **Geist** (fallback Inter, system-ui).
- Meta/labels/dates/metrics: **Geist Mono**, uppercase, `letter-spacing: .06em`, `font-size: .75rem`.
- Replace Poppins. Load all three in one Google Fonts request with `display=swap`.

Type scale (fluid with `clamp`):
`--fs-xs .75rem` · `--fs-sm .875rem` · `--fs-base 1rem` · `--fs-lg 1.125rem` · `--fs-xl clamp(1.25rem,2vw,1.5rem)` · `--fs-2xl clamp(1.75rem,3.5vw,2.5rem)` · `--fs-hero clamp(2.5rem,7vw,5rem)`.

Section header pattern (replaces "Get To Know More / About Me"):
```
01 — ABOUT          ← mono, muted, numbered
A full-stack engineer who ships *AI that people actually use*.   ← Poppins (--font-display), statement, not a label
```

### 1.3 Spacing, radius, elevation
- 4-pt scale: `--sp-1 4px … --sp-16 64px`, section padding `clamp(4rem, 10vw, 8rem)` vertical.
- Radius: `--r-sm 8px` (chips/buttons), `--r-md 14px` (cards), `--r-lg 22px` (sheets/modals), `999px` pills.
- Elevation: borders first, shadow only on hover/floating layers. `--shadow-float: 0 12px 32px -12px rgb(0 0 0 / .18)`.
- Content max-width `72rem`; reading width `40rem`.

### 1.4 Iconography & emoji
- **No emoji in UI chrome or chips.** Emoji allowed only in Piko's chat replies (sparingly, max one per reply).
- Inline SVG, 1.75 stroke, `currentColor`, 16/20/24 px (Lucide-style geometry).

### 1.5 Motion
- Tokens: `--ease-out: cubic-bezier(.2,.8,.2,1)`, `--ease-spring: cubic-bezier(.34,1.56,.64,1)`, durations `120 / 220 / 420ms`.
- Reveal: 12px rise + fade, once. No looping animations except Piko idle.
- Everything wrapped in `@media (prefers-reduced-motion: reduce)` → no transforms, instant states, Piko stays still (blink only).

### 1.6 Voice
- First person, concrete, numbers-first. "Cut analyst research time 35%" > "Leveraged cutting-edge RAG".
- Banned words in UI copy: *leverage, cutting-edge, passionate, seamless, synergy, robust*.

### 1.7 Accessibility baseline
- All interactive elements are `<a>` or `<button>` (no `onclick` on `<span>`/`<div>`), visible `:focus-visible` ring in `--accent`.
- Tap targets ≥ 44×44 px.
- Carousel and Piko are keyboard operable; `Esc` closes overlays; focus is trapped in open sheets and returned on close.

---

## 2. Information architecture

Current order (10 sections): Profile → About → Skills → Experience → Projects → Journey → Certifications → Recommendations → Posts → Contact.

Proposed order (8 sections, story-first):

| # | id | Content | Change |
|---|---|---|---|
| 00 | `#profile` | Hero + status pill + proof strip | rewritten |
| 01 | `#about` | Short bio + photo + "how I work" (3 principles) | slimmer; the 3 stat cards move into hero proof strip |
| 02 | `#journey` | **The Trail** (signature section) | moved up, rebuilt, absorbs Certifications as milestones |
| 03 | `#experience` | Role detail cards | progressive disclosure |
| 04 | `#projects` | Project cards | bento layout |
| 05 | `#skills` | Tech stack | compact, filterable |
| 06 | `#recommendations` | Testimonials | swipeable |
| 07 | `#contact` | Big CTA + copy email + links; LinkedIn posts become a small "Writing" row here | merged |

`#certifications` and `#posts` are removed as standalone sections (content preserved inside Journey and Contact). Keep anchors working: add `<span id="certifications"></span>` and `<span id="posts"></span>` inside the new homes so old links don't break.

Update AGENTS.md section list + the 3 nav lists accordingly.

---

## 3. Feature specs

### 3.1 Hero (`#profile`) — de-genericise
Layout (desktop): left = text, right = small portrait (not a pulsing ring; a 4:5 rounded rectangle, slight grayscale → colour on hover).

```
[● Serving notice · Joining {Company} in {Month YYYY}]       ← status pill, driven by NEXT_CHAPTER config
Ashish Yadav                                                  ← Poppins, --fs-hero
Full-stack engineer building *agentic AI* products            ← one static line, no typing effect
for enterprise teams — from React to RAG to MCP.

[Download CV ↓]  [Copy email ⧉]        in  gh                 ← primary = accent filled, secondary = ghost

5+ yrs  ·  2 enterprise AI products in client use  ·  Employee of the Year '26  ·  AI-102   ← mono proof strip
```
- Remove `initTyping` (and the cursor element).
- "Copy email" copies to clipboard and shows a toast "Email copied" (3s, `aria-live="polite"`).
- Mobile: portrait goes above text at 120px, left-aligned text (not centred), buttons full-width stacked.

### 3.2 Piko 2.0 — a cute, original, "3D-feeling" pet

**Concept:** not a robot. Piko is a small round **mochi creature** — a soft clay-like dumpling body with two little cat-like ears, oversized glossy eyes, tiny blush, stubby feet, and a single **sprout/leaf antenna** on its head that glows in `--accent` when it's thinking. Think "desk companion", not "AI assistant icon". It must be an original character — do not imitate the Claude or ChatGPT mascots, only the *quality bar* (soft volume, personality, reactive states).

**How to get the 3D look without a 3D engine** (inline SVG, ~6 KB):
1. Body: ellipse with a `radialGradient` (light at 35%/30%, base colour, darker rim) → reads as a sphere.
2. Rim light: thin lighter arc on the lower-right edge (`stroke`, 30% opacity).
3. Specular highlight: small white ellipse top-left, 70% opacity, slight blur (`feGaussianBlur stdDeviation=.6`).
4. Ambient occlusion: darker ellipse under the ears and where feet meet the body.
5. Contact shadow: blurred ellipse under the character that **scales opposite to the bounce** (shrinks when Piko is up).
6. Eyes: dark ellipse + 2 white catch-lights (big + small) → instant "cute".
7. Body colour: warm cream `#FFF4E6` → `#F5D9B8` rim in light; slightly toned-down in dark mode with a soft accent rim-light. Sprout = `--accent`.

SVG structure (ids/classes used by CSS/JS):
```
<svg class="piko" data-state="idle">
  <ellipse class="piko-shadow"/>
  <g class="piko-rig">            ← bounce/squash transforms here (transform-origin: bottom center)
    <g class="piko-ear l"/><g class="piko-ear r"/>
    <path class="piko-body"/>      ← gradient + rim + spec
    <g class="piko-face">          ← translated toward cursor (max 3px)
      <g class="piko-eye l"><ellipse/><circle class="glint"/></g>
      <g class="piko-eye r">…</g>
      <path class="piko-mouth"/>
      <ellipse class="piko-blush l"/><ellipse class="piko-blush r"/>
    </g>
    <g class="piko-sprout"/>
    <g class="piko-feet"/>
  </g>
</svg>
```
Define it **once** in a `<template id="piko-tpl">` and clone it for: FAB, chat header avatar, and the Journey trail marker. Gradients need unique ids per clone (suffix with index in JS).

States (`data-state` on the root, CSS keyframes, all disabled under reduced motion except blink):
| State | Trigger | Animation |
|---|---|---|
| `idle` | default | breathe: `scaleY 1 → 1.03`, 3.6s; random blink every 3–6s (eyes `scaleY .1` for 120ms) |
| `look` | pointer moves (throttled rAF) | `.piko-face` translates toward pointer, max 3px; ears counter-rotate ±4° |
| `hover` | FAB hover/focus | ears wiggle + small hop (squash 0.92 → stretch 1.06 → 1) |
| `thinking` | after user sends a message, until reply | eyes look up-right, sprout glow pulses, 3-dot bubble |
| `happy` | bot reply lands / "thanks" intent | eyes become `^ ^` arcs, hop, blush opacity up |
| `sleepy` | 45s no interaction & chat closed | eyes closed lines, slow breathe, tiny "z" floats; wakes on hover |
| `wave` | first visit, 6s after load, once per session (`sessionStorage`) | one ear-wave + speech bubble: *"Psst — want the 30-second version of Ashish?"* with [Sure] [Later] |

Chat window:
- Header: Piko avatar (clone) + "Piko" + mono subline "Ashish's desk pet · knows his CV". Remove the "AI Buddy" badge and green "Online" dot.
- Typing indicator: three dots inside a bot bubble for 500–900ms (scaled by reply length) while Piko is `thinking`.
- Messages: bot bubbles `--bg-alt`, user bubbles `--text` bg / `--bg` text. Max-width 85%.
- Quick chips become a horizontally scrollable single row (no wrapping), text-only: `Who is Ashish?` `What's next for him?` `AI stack` `Best project` `Hire / contact`.
- New intents: `next|notice|joining|new company|available` → answers from `NEXT_CHAPTER`; `resume|cv` → reply includes a real link button; `journey` → scrolls page to `#journey` and closes chat on mobile.
- Replies may include action buttons: support `{ reply, actions: [{label, href|scrollTo|copy}] }` in INTENTS.
- **Mobile (≤768px): chat opens as a bottom sheet** — `position: fixed; inset: auto 0 0 0; height: 85dvh; border-radius: var(--r-lg) var(--r-lg) 0 0`, drag-handle bar, backdrop, body scroll locked. Fixes the current overflow bug.
- Desktop: `width: min(380px, calc(100vw - 32px))`.
- `Esc` closes; focus returns to FAB.

### 3.3 The Trail — Career Journey rebuild (`#journey`)

**Metaphor:** a hand-drawn path that the visitor *walks* by scrolling. Piko travels along it and sits at "You are here". The path continues past "now" as a dashed line into a **Next Chapter** card — the notice-period provision.

**Single source of truth (top of `script.js`):**
```js
const NEXT_CHAPTER = {
  status: 'notice',          // 'notice' | 'announced' | 'joined'
  company: '',               // e.g. 'Acme Corp' — empty = keep it a teaser
  role: '',                  // e.g. 'Senior Software Engineer — GenAI'
  start: '',                 // e.g. 'Jan 2027'
  logo: ''                   // './assets/logos/<file>' optional
};
```
Renders:
- `notice` + no company → Next card: *"Next chapter — loading…"*, subline *"Serving notice at Pratham · new role starting {start} (see §5.1)"*, shimmer skeleton lines.
- `notice` + company → *"Next: {role} at {company} · from {start}"*, company logo appears, Pratham stop shows "Serving notice".
- `joined` → the Next card becomes a normal `current` stop, Pratham becomes `past`, a fresh dashed "What's next?" ghost stop is appended. **Flipping one field updates hero pill, Trail, Experience "Present" label, and Piko.**

**Stops (semantic `<ol class="trail">`, each `<li class="stop" data-state="past|current|next" data-year>`):**
1. 2018–22 · B.Tech ECE, JECRC Jaipur — 8.5 GPA; first builds (face recognition 95%, IoT home automation)
2. Oct 2021 · Joined Metacube as graduate engineer
3. 2023–24 · Pivot to GenAI — RGM tool (+30% engagement), GraphDB RAG UI (−80% latency) *(confirm dates)*
4. {date} · Microsoft AI-102 certified *(absorbs Certifications section — confirm date)*
5. Oct 2025 · Pratham Software — agentic GenAI for a top-3 consulting firm
6. 2026 · Emerging Employee of the Year
7. **Now** · `current` — "Serving notice · wrapping up handovers" + Piko sits here
8. **Next** · `next` — driven by `NEXT_CHAPTER`

Each stop is compact by default (mono date, Poppins title, one line, ≤2 neutral chips). Clicking/tapping a stop expands details inline (`<details>`/`<button aria-expanded>`), only one open at a time.

**Layout:**
- Desktop (≥1024): path is an SVG drawn behind the list; stops alternate left/right of a gently curving S-line. JS computes the path through each stop's dot (`getBoundingClientRect` relative to the wrapper), using cubic Béziers; recompute on `ResizeObserver`.
- Tablet/mobile (<1024): straight vertical rail 24px from the left; stops on the right; same SVG technique with a straight line (simpler + robust).
- Past segment: solid `--text` 2px. Future segment (now → next): dashed `--muted`.
- **Scroll-linked drawing:** `stroke-dasharray = length; stroke-dashoffset` mapped to how far the section has scrolled through the viewport (rAF-throttled scroll listener). The tip position = `path.getPointAtLength(progress*len)`; the Piko marker (40px clone) is translated to that point, but **clamped at the "Now" stop** — it never walks into the future. When it reaches Now it switches to `happy` once, then `idle`, and a mono label "YOU ARE HERE" fades in.
- Stop dots: past = filled; current = accent with a pulsing ring; next = dashed outline.
- Reduced motion: path fully drawn, Piko static at Now.
- Remove the old staircase markup, CSS (`.stair-*`) and the person figurine SVG.

**Mini-map (bonus, desktop):** a sticky horizontal year scale at the top of the section (`2018 ─ 2021 ─ 2023 ─ 2025 ─ now ─ next`) highlighting the current stop; clicking a year scrolls to that stop.

### 3.4 Navigation & wayfinding

Desktop:
1. **Top bar**: name (Poppins) left; links centre; right = theme toggle + `⌘K` button. Active link = accent text + 2px underline that **slides** between links (one absolutely positioned indicator element, moved by `initActiveNav`). Bar gets a border-bottom only after scrolling 8px.
2. **Section rail**: fixed at right edge (≥1200px), vertical list of 8 small ticks with section numbers; active tick extends + shows label; hover shows label; click scrolls. Replaces all the between-section down-arrow buttons (delete `.arrow-btn` everywhere).
3. **Command palette (⌘K / Ctrl+K, also `/`)** — the "developer portfolio" signature:
   - Modal with search input + list: *Go to …* (each section), *Download CV*, *Copy email*, *Open LinkedIn*, *Open GitHub*, *Toggle theme*, *Ask Piko …* (pipes the query into Piko), *What's next for Ashish?*.
   - Fuzzy filter (simple subsequence match), ↑/↓/Enter/Esc, focus trap, `role="dialog"` + `aria-modal`, listbox semantics.
   - Small hint in hero: mono "Press ⌘K to navigate" (hidden on touch devices).
4. Back-to-top: becomes a palette item + the rail's top tick; no separate floating button on desktop.

Mobile (≤768):
1. **Bottom tab bar** (thumb zone), fixed, 64px + `env(safe-area-inset-bottom)`, blurred bg: `Home · Journey · Work · Reviews · Contact` with 20px icons + 11px labels, active = accent. Hides on scroll-down, shows on scroll-up.
2. Top bar shrinks to name + theme toggle + "menu" (opens a **full-screen sheet** with the full list, big 24px Poppins links, and the CV/email/social actions). Replace the current dropdown hamburger.
3. Piko FAB sits **above** the tab bar (bottom: `calc(64px + 16px + safe-area)`), 52px.
4. Section headers: the mono "02 — JOURNEY" label is `position: sticky` under the top bar while inside its section (cheap contextual wayfinding).

Keep the 3 nav lists in sync per AGENTS.md (desktop, mobile sheet, footer) — plus the rail, the tab bar and the palette now. **Generate rail + palette items from one `SECTIONS` array in JS** to avoid a 6th hand-maintained list.

### 3.5 Section polish

- **About**: one paragraph (≤ 70 words) + 3 "how I work" principles (e.g. *Architecture before code · Security from day one · Demos that sell*) — these echo what recommenders actually said, which is more credible than self-description. Photo 4:5, max 320px.
- **Experience**: card per role; header (logo, company, role, mono dates, location), 1-line summary, 3 metric callouts (big number + label, e.g. `35% ↓ research time`), then "Show details" toggles the full bullet list. Pratham card reflects `NEXT_CHAPTER` ("Oct 2025 — Feb 2027" / "Serving notice").
- **Projects**: bento grid (first/featured project spans 2 cols with its impact metric large). Cards: mono year, title, 2-line desc, neutral tags, metric. Mobile: horizontal **scroll-snap** carousel with peeking next card (`scroll-snap-type: x mandatory`, card width 85vw).
- **Tech stack**: filter tabs `All · AI · Frontend · Backend · Cloud` above a single logo grid (one grid, not four panels). Logos monochrome (`filter: grayscale(1)`), colour on hover. Mobile: tabs scroll horizontally, grid 3 columns.
- **Recommendations**: one card visible + swipe on touch (pointer events, 40px threshold), arrows on desktop only, dots become real `<button>`s. Show the short "pull quote" (1 bold sentence) by default with "Read full recommendation". Pause auto-advance on hover, focus, and when tab hidden; disable autoplay under reduced motion.
- **Contact**: large Poppins "Let's build something *useful*." + status pill (from `NEXT_CHAPTER`) + three actions (Email with copy, LinkedIn, Download CV) + "Writing" row with the 2 LinkedIn posts as compact link cards (lazy-load iframes only on click — iframes are heavy on mobile).
- **Footer**: mono, minimal: © year · "Built by hand, no framework" · "Press ⌘K" · back to top.

---

## 4. Implementation phases (one session each)

Each phase ends with the AGENTS.md verification checklist (asset paths, 1280×800 + 390×844, light + dark, `scrollWidth <= innerWidth`). Commit at the end of each phase.

| Phase | Scope | Files | Done when |
|---|---|---|---|
| **P0 Foundations** | New tokens incl. **neutral charcoal dark mode (no blue tints, §1.1)**, fonts, type scale, spacing, focus ring, reduced-motion block; neutral default chip; strip emoji from chips; delete `.arrow-btn`s; create `DESIGN.md` from §1; update AGENTS.md (section order, new standards, new IIFEs) | style.css, index.html, DESIGN.md, AGENTS.md | Site renders with new look, no layout regressions, no emoji in chips |
| **P1 Piko 2.0** | `<template>` mochi SVG, states + blink + look-at, chat restyle, typing indicator, intents with actions, `NEXT_CHAPTER` intent, mobile bottom sheet, focus management | index.html, style.css, script.js | All 7 states triggerable; mobile sheet has no overflow; Esc/focus work |
| **P2 The Trail** | `NEXT_CHAPTER` config, new `#journey` markup, SVG path builder, scroll-linked draw, Piko marker clamped at Now, expandable stops, year mini-map; remove staircase + certifications section | index.html, style.css, script.js | Flip `status` to `announced`/`joined` and every dependent UI updates; works at 390px |
| **P3 Navigation** | `SECTIONS` array; sliding active indicator; section rail; ⌘K palette; mobile bottom tab bar + full-screen menu sheet; sticky section labels; reorder sections per §2 | all | Keyboard-only user can reach everything; palette fully operable |
| **P4 Sections** | Hero rewrite, About, Experience disclosure, Projects bento/snap, Tech filter, Recommendations swipe, Contact + Writing row, footer | all | Content matches §3.1, §3.5 |
| **P5 QA & perf** (DONE: images resized to JPEG q80, meta/OG/favicon, head theme script, a11y pass, perf hygiene; Lighthouse unavailable offline) | Lighthouse (target ≥95 perf/a11y on mobile), lazy images (`loading="lazy"`, width/height attrs), compress `profile-pic.jpg`/`about-pic2.jpg` to WebP, meta description + Open Graph tags + favicon (mini Piko), README update | all | Checklist green |

Suggested prompt for each implementation session:
> "Implement **Phase Pn** of `docs/UX_PLAN.md`. Follow `DESIGN.md` and AGENTS.md. Don't touch other phases' scope. Verify with the checklist, then summarise what changed and anything you couldn't verify."

---

## 5. Decisions (confirmed by Ashish, 27 Nov 2026)

1. **Next company → teaser mode.** Joining the new company on **7 Dec 2026**; don't name it yet. Ship with:
   ```js
   const NEXT_CHAPTER = { status: 'notice', company: '', role: '', start: '7 Dec 2026', logo: '' };
   ```
   Teaser copy: *"Next chapter — starting 7 Dec 2026"*, subline *"Wrapping up at Pratham · new team, new problems"*. Hero pill: *"Serving notice · next chapter starts 7 Dec"*. Piko's `next|notice|joining` intent says he starts a new role on 7 Dec and will share details soon, and never guesses a company.
   **On/after 7 Dec:** set `status: 'joined'` plus company, role and logo. That's the only edit needed.
   (Done: CV renamed to `assets/Ashish_Yadav_CV.pdf` so the filename does not leak a company name.)
2. **Accent = signal orange** `#E8590C` light / `#FF8A3D` dark.
3. **Client = anonymous everywhere:** "a top-3 management consulting firm" in Experience, Journey, Piko and meta tags. Remove "BCG/BCGX" from Piko's replies and quick chips (e.g. chip "Pratham & BCGX" → "Current work"). The LinkedIn recommendation text stays verbatim (it's the recommender's words).
4. **Piko = mochi creature** (cat ears + sprout), as specced in §3.2.
5. *Still to confirm (use these defaults until then):* AI-102 date → show the stop as "Microsoft AI-102" with no month; GenAI pivot → "2023–24".
6. Fonts → **Poppins (headings) + Geist (body) + Geist Mono (labels)**. Instrument Serif was tried in P0 and dropped.

---

## 6. Revisions after owner review (27 Nov 2026)

- **Tech stack → "where I used it":** tiles open a popover listing where each tech was used (Pratham, Metacube, projects), with links that jump there. Tiles used in the same context stay lit and the rest dim. A "Core" AI row comes first. Usage data lives in `STACK_USAGE` and is derived only from on-page facts.
- **Recommendations → no autoplay, ever.** Desktop shows a 2×2 wall of compact cards with highlighted pull quotes. "Read full" opens a reader (a dialog on desktop, a bottom sheet on mobile) with user-controlled prev/next and a "View on LinkedIn" link. Mobile uses a swipe-only scroll-snap row.
- **Contact → compose + channels:** a mailto composer with reason chips (no backend), plus channel cards for LinkedIn (official "in" mark and a mini profile preview), GitHub, Email (copy) and CV. Each card's border turns that channel's colour on hover.
- Headings use Poppins; the serif was dropped (see §5.6).

### 6.1 Hero refinement (owner request, queued after P5)
- **Portrait back in a circle**, sized about 340px on desktop and 160px on mobile, cropped on the face. It gets a thin ring with a slowly rotating accent arc (conic gradient, about 20s per turn) and a faint radial glow behind it.
- **Orbiting badges (desktop only):** 3–4 small tech badges (Claude, OpenAI, React, Python) sit on an orbit around the portrait and bob gently, each on its own delay.
- **Moving role line, refined:** a line reading "I build ___". The word cycles through *agentic AI products → RAG pipelines → MCP integrations → full-stack web apps*. Each change is a vertical slide with a blur/fade. The word is accent-coloured and its width animates smoothly. It cycles every ~2.6s and pauses on hover or when the tab is hidden. Screen readers get a static sentence listing all of them.
- **Structure, left column:**
  1. status pill
  2. name
  3. rotating role line
  4. a one-line description
  5. buttons
  6. proof strip as 4 stat items with dividers
  7. ⌘K hint
- **Entrance:** the left column fades up line by line, 60ms apart, and the portrait scales in. A subtle "scroll" cue sits at the bottom.
- **Reduced motion:** the first phrase stays fixed, and there is no orbit, rotation or entrance animation.
