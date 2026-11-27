/* =============================================
   SCRIPT.JS — All interactions & animations
   ============================================= */

// Next-chapter config: flip status/company/role to update Piko (and later the Journey/hero).
const NEXT_CHAPTER = { status: 'notice', company: '', role: '', start: '7 Dec 2026', logo: '' };

// ===== THEME TOGGLE =====
const THEME_KEY = 'ay-theme';

function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark', isDark);
    const desktopBtn = document.getElementById('theme-toggle');
    const mobileBtn  = document.getElementById('theme-toggle-mobile');
    if (desktopBtn) desktopBtn.setAttribute('aria-checked', String(isDark));
    if (mobileBtn)  mobileBtn.setAttribute('aria-checked', String(isDark));
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    const next = isDark ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
}

// Desktop toggle button
const desktopToggle = document.getElementById('theme-toggle');
if (desktopToggle) desktopToggle.addEventListener('click', toggleTheme);

// Apply saved / preferred theme on load
(function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
        applyTheme(saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark');
    }
})();


// ===== HAMBURGER MENU =====
function toggleMenu() {
    const menu = document.querySelector('.menu-links');
    const icon = document.querySelector('.hamburger-icon');
    menu.classList.toggle('open');
    icon.classList.toggle('open');
}


// ===== TYPING ANIMATION =====
(function initTyping() {
    const el = document.getElementById('typing-text');
    if (!el) return;

    const phrases = [
        'Full-Stack Engineer',
        'AI / GenAI Engineer',
        'RAG & Agentic Systems',
        'React + FastAPI Builder',
    ];
    let phraseIdx = 0;
    let charIdx   = 0;
    let deleting  = false;
    let pauseTicks = 0;

    function tick() {
        const phrase = phrases[phraseIdx];
        if (!deleting && charIdx <= phrase.length) {
            el.textContent = phrase.slice(0, charIdx++);
            if (charIdx > phrase.length) { pauseTicks = 28; deleting = true; }
            setTimeout(tick, 70);
        } else if (deleting && charIdx >= 0) {
            if (pauseTicks > 0) { pauseTicks--; setTimeout(tick, 60); return; }
            el.textContent = phrase.slice(0, charIdx--);
            if (charIdx < 0) {
                deleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                charIdx = 0;
                setTimeout(tick, 400);
            } else {
                setTimeout(tick, 40);
            }
        }
    }
    tick();
})();


// ===== SCROLL REVEAL (sections) =====
(function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.08 });
    els.forEach(el => observer.observe(el));
})();


// ===== RECOMMENDATIONS CAROUSEL =====
(function initCarousel() {
    const slides    = document.querySelectorAll('.rec-slide');
    const dots      = document.querySelectorAll('.rec-dot');
    if (!slides.length) return;

    let current   = 0;
    let autoTimer = null;
    let animating = false;
    const INTERVAL = 4500;

    // Ensure only the first slide is shown on init
    slides.forEach((s, i) => {
        s.style.display = i === 0 ? 'block' : 'none';
        s.classList.toggle('active', i === 0);
    });

    function showSlide(idx) {
        if (animating) return;
        const next = (idx + slides.length) % slides.length;
        if (next === current) return;
        animating = true;

        // Fade out current
        const outSlide = slides[current];
        outSlide.style.opacity = '0';
        outSlide.style.transform = 'translateX(-24px)';

        setTimeout(() => {
            outSlide.style.display = 'none';
            outSlide.classList.remove('active');
            dots[current] && dots[current].classList.remove('active');

            current = next;

            // Prepare next
            const inSlide = slides[current];
            inSlide.style.display = 'block';
            inSlide.style.opacity = '0';
            inSlide.style.transform = 'translateX(24px)';

            // Force reflow
            void inSlide.offsetWidth;

            inSlide.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            inSlide.style.opacity = '1';
            inSlide.style.transform = 'translateX(0)';
            inSlide.classList.add('active');
            dots[current] && dots[current].classList.add('active');

            setTimeout(() => { animating = false; }, 420);
        }, 380);
    }

    function startAuto() {
        stopAuto();
        autoTimer = setInterval(() => showSlide(current + 1), INTERVAL);
    }

    function stopAuto() {
        if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    window.moveRec = function(dir) { showSlide(current + dir); startAuto(); };
    window.goToRec = function(idx)  { showSlide(idx);           startAuto(); };

    // Pause on hover over the whole carousel wrapper
    const wrapper = document.querySelector('.rec-carousel-wrapper');
    if (wrapper) {
        wrapper.addEventListener('mouseenter', stopAuto);
        wrapper.addEventListener('mouseleave', startAuto);
    }

    startAuto();
})();


// ===== ACTIVE NAV HIGHLIGHT ON SCROLL =====
(function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('#desktop-nav .nav-links a');
    if (!links.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                links.forEach(l => l.style.fontWeight = '');
                const active = document.querySelector(`#desktop-nav .nav-links a[href="#${e.target.id}"]`);
                if (active) active.style.fontWeight = '700';
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => observer.observe(s));
})();


// ===== SCROLL PROGRESS BAR =====
(function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    function updateProgress() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
        bar.style.width = pct.toFixed(1) + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
})();


// ===== PIKO 2.0 — creature factory, states, blink, look-at =====
(function initPikoCreature() {
    const tpl = document.getElementById('piko-tpl');
    if (!tpl) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const instances = [];
    let uid = 0;
    let hold = null;       // 'thinking' | 'happy' | 'wave' — broadcast to every instance
    let hovering = false;  // FAB only
    let asleep = false;    // FAB only
    let looking = false;   // FAB + any instance flagged lookable
    let lookTimer = null;

    function stateFor(inst) {
        if (inst.pin) return inst.pin;
        if (hold) return hold;
        if (inst.isFab) {
            if (hovering) return 'hover';
            if (asleep) return 'sleepy';
        }
        if (looking && finePointer.matches && !reduced.matches) return 'look';
        return 'idle';
    }
    function refresh() {
        instances.forEach(inst => {
            const s = stateFor(inst);
            if (inst.svg.dataset.state !== s) inst.svg.dataset.state = s;
        });
    }

    function scheduleBlink(inst) {
        setTimeout(() => {
            const s = inst.svg.dataset.state;
            if (inst.svg.isConnected && s !== 'sleepy' && s !== 'happy') {
                inst.svg.classList.add('blink');
                setTimeout(() => inst.svg.classList.remove('blink'), 120);
            }
            scheduleBlink(inst);
        }, 3000 + Math.random() * 3000);
    }

    // Public: returns a fresh, independently animated Piko (used by FAB, chat avatar, Journey marker)
    window.createPiko = function (size) {
        const id = 'k' + (++uid);
        const wrap = document.createElement('div');
        wrap.innerHTML = tpl.innerHTML.replace(/\{\{u\}\}/g, id).trim();
        const svg = wrap.firstElementChild;
        if (size) { svg.setAttribute('width', size); svg.setAttribute('height', size); }
        const inst = { svg, isFab: false };
        instances.push(inst);
        svg.dataset.state = stateFor(inst);
        scheduleBlink(inst);
        svg._piko = inst;
        return svg;
    };

    // Global state API used by the chatbot
    window.pikoState = {
        hold(s) { hold = s; refresh(); },
        release() { hold = null; refresh(); },
        setHover(v) { hovering = v; refresh(); },
        setAsleep(v) { asleep = v; refresh(); },
        pin(svg, s) { if (svg._piko) { svg._piko.pin = s || null; refresh(); } },
        markFab(svg) { if (svg._piko) { svg._piko.isFab = true; refresh(); } }
    };

    // Look-at-pointer (desktop, rAF throttled)
    let raf = 0, px = 0, py = 0;
    function applyLook() {
        raf = 0;
        instances.forEach(inst => {
            if (!inst.svg.isConnected || inst.svg.dataset.state !== 'look') return;
            const r = inst.svg.getBoundingClientRect();
            if (!r.width) return;
            const nx = Math.max(-1, Math.min(1, (px - (r.left + r.width / 2)) / 220));
            const ny = Math.max(-1, Math.min(1, (py - (r.top + r.height / 2)) / 220));
            inst.svg.style.setProperty('--lx', (nx * 3).toFixed(2));
            inst.svg.style.setProperty('--ly', (ny * 2).toFixed(2));
            inst.svg.style.setProperty('--er', (nx * 4).toFixed(2));
        });
    }
    window.addEventListener('pointermove', (e) => {
        if (!finePointer.matches || reduced.matches || e.pointerType === 'touch') return;
        px = e.clientX; py = e.clientY;
        if (!looking) { looking = true; refresh(); }
        clearTimeout(lookTimer);
        lookTimer = setTimeout(() => { looking = false; refresh(); }, 1600);
        if (!raf) raf = requestAnimationFrame(applyLook);
    }, { passive: true });
})();


// ===== THE TRAIL — career journey path, Piko marker, year mini-map =====
(function initTrail() {
    const wrap   = document.getElementById('trail-wrap');
    const ol     = document.getElementById('trail');
    const svg    = document.getElementById('trail-svg');
    const past   = document.getElementById('trail-past');
    const future = document.getElementById('trail-future');
    const marker = document.getElementById('trail-marker');
    const here   = document.getElementById('trail-here');
    const map    = document.getElementById('trail-map');
    if (!wrap || !ol || !past || !future) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 1024px)');
    let stops = [], pts = [], curIdx = -1, pastLen = 0;
    let arrived = false, happyTimer = null, pikoEl = null, raf = 0;

    if (marker && window.createPiko) {
        pikoEl = window.createPiko(40);
        marker.appendChild(pikoEl);
    }

    function pathD(p) {
        if (p.length < 2) return '';
        let d = `M${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
        for (let i = 1; i < p.length; i++) {
            const a = p[i - 1], b = p[i], my = (a.y + b.y) / 2;
            d += ` C${a.x.toFixed(1)} ${my.toFixed(1)} ${b.x.toFixed(1)} ${my.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
        }
        return d;
    }

    function buildMap() {
        if (!map) return;
        map.innerHTML = '';
        stops.forEach((s) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.textContent = s.dataset.map || '';
            b.dataset.stop = s.id;
            map.appendChild(b);
        });
    }

    function build() {
        raf = 0;
        stops = Array.from(ol.querySelectorAll('.stop:not([hidden])')).filter(s => s.querySelector('.stop-dot'));
        stops.forEach((s, i) => { s.dataset.side = i % 2 ? 'r' : 'l'; });
        const wr = wrap.getBoundingClientRect();
        pts = stops.map(s => {
            const r = s.querySelector('.stop-dot').getBoundingClientRect();
            return { x: r.left + r.width / 2 - wr.left, y: r.top + r.height / 2 - wr.top };
        });
        curIdx = stops.findIndex(s => s.dataset.state === 'current');
        if (curIdx < 0) curIdx = Math.max(0, stops.length - 1);
        svg.setAttribute('viewBox', `0 0 ${wr.width.toFixed(1)} ${wr.height.toFixed(1)}`);
        past.setAttribute('d', pathD(pts.slice(0, curIdx + 1)));
        future.setAttribute('d', pathD(pts.slice(curIdx)));
        pastLen = past.getTotalLength() || 0;
        past.style.strokeDasharray = `${pastLen} ${pastLen}`;
        if (map && map.children.length !== stops.length) buildMap();
        update();
    }
    function schedule() { if (!raf) raf = requestAnimationFrame(build); }

    function tipLength(line) {
        if (reduced.matches || !pts.length) return pastLen;
        if (line <= pts[0].y) return 0;
        if (line >= pts[curIdx].y) return pastLen;
        let lo = 0, hi = pastLen;
        for (let i = 0; i < 18; i++) {
            const mid = (lo + hi) / 2;
            if (past.getPointAtLength(mid).y < line) lo = mid; else hi = mid;
        }
        return (lo + hi) / 2;
    }

    let ticking = false;
    function update() {
        ticking = false;
        if (!pts.length || !pastLen) return;
        const wr = wrap.getBoundingClientRect();
        const L = tipLength(window.innerHeight * 0.6 - wr.top);
        past.style.strokeDashoffset = String(pastLen - L);
        const tip = past.getPointAtLength(L);
        if (marker) marker.style.transform = `translate(${tip.x.toFixed(1)}px, ${tip.y.toFixed(1)}px)`;

        const now = pts[curIdx];
        if (here && now) {
            const flip = desktop.matches && stops[curIdx].dataset.side === 'r';
            here.classList.toggle('flip', flip);
            here.style.left = (now.x + (flip ? -26 : 26)) + 'px';
            here.style.top = (now.y - (desktop.matches ? 36 : 46)) + 'px';
        }
        const atNow = L >= pastLen - 1;
        if (atNow && !arrived) {
            arrived = true;
            if (here) here.classList.add('show');
            if (pikoEl && !reduced.matches) {
                window.pikoState.pin(pikoEl, 'happy');
                clearTimeout(happyTimer);
                happyTimer = setTimeout(() => window.pikoState.pin(pikoEl, null), 1200);
            }
        } else if (arrived && L < pastLen - 40) {
            arrived = false;
            if (here) here.classList.remove('show');
        }

        if (map && desktop.matches) {
            const mid = window.innerHeight / 2;
            let best = -1, bestD = Infinity;
            stops.forEach((s, i) => {
                const r = s.getBoundingClientRect();
                const d = Math.abs(r.top + Math.min(r.height, 120) / 2 - mid);
                if (d < bestD) { bestD = d; best = i; }
            });
            Array.from(map.children).forEach((b, i) => {
                const on = i === best;
                b.classList.toggle('active', on);
                if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
            });
        }
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

    // One stop open at a time
    ol.addEventListener('click', (e) => {
        const btn = e.target.closest('.stop-toggle');
        if (!btn) return;
        const wasOpen = btn.getAttribute('aria-expanded') === 'true';
        ol.querySelectorAll('.stop-toggle').forEach(b => {
            b.setAttribute('aria-expanded', 'false');
            b.firstElementChild.textContent = 'Details';
            const panel = document.getElementById(b.getAttribute('aria-controls'));
            if (panel) panel.hidden = true;
        });
        if (!wasOpen) {
            btn.setAttribute('aria-expanded', 'true');
            btn.firstElementChild.textContent = 'Less';
            const panel = document.getElementById(btn.getAttribute('aria-controls'));
            if (panel) panel.hidden = false;
        }
        schedule();
    });

    if (map) map.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-stop]');
        const target = b && document.getElementById(b.dataset.stop);
        if (target) target.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'center' });
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', schedule);
    if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(ol);
    if (desktop.addEventListener) desktop.addEventListener('change', schedule);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    document.addEventListener('trail:update', () => { if (map) map.innerHTML = ''; schedule(); });
    build();
})();


// ===== PIKO AI PET CHATBOT (REGEX + CURATED QA) =====
(function initPikoChatbot() {
    const widget   = document.getElementById('piko-widget');
    const fab      = document.getElementById('piko-fab');
    const win      = document.getElementById('piko-window');
    const closeBtn = document.getElementById('piko-close');
    const msgs     = document.getElementById('piko-messages');
    const form     = document.getElementById('piko-form');
    const input    = document.getElementById('piko-input');
    const backdrop = document.getElementById('piko-backdrop');
    const bubble   = document.getElementById('piko-bubble');
    const avatar   = document.getElementById('piko-avatar');
    const chips    = document.querySelectorAll('.piko-qchip');
    if (!fab || !win || !msgs || !window.createPiko) return;

    const sheetMQ = window.matchMedia('(max-width: 768px)');
    const reducedMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Mount creatures from the single template
    const fabPiko = window.createPiko(60);
    fab.insertBefore(fabPiko, fab.firstChild);
    window.pikoState.markFab(fabPiko);
    if (avatar) avatar.appendChild(window.createPiko(40));

    const EMAIL = 'ashishvickyadav@gmail.com';
    const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    function nextChapterReply() {
        const n = NEXT_CHAPTER;
        if (n.company) {
            const role = n.role ? ` as **${esc(n.role)}**` : '';
            if (n.status === 'joined') return `Ashish is now at **${esc(n.company)}**${role}, since **${esc(n.start)}**.`;
            return `Ashish is joining **${esc(n.company)}**${role} on **${esc(n.start)}**. He's wrapping up at **Pratham** first.`;
        }
        return `Ashish is wrapping up at **Pratham** and starts a new role on **${esc(n.start)}**. Details soon — I'm sworn to secrecy until then 🌱`;
    }

    const INTENTS = [
        {
            pattern: /\b(hi|hello|hey|yo|hola|namaste|greetings|good\s*(morning|afternoon|evening))\b/i,
            reply: "Hey there! I'm **Piko**, Ashish's desk pet 🌱 Ask me about his **AI/GenAI work**, **experience**, **tech stack**, **projects**, or **how to reach him**."
        },
        {
            pattern: /\b(thank|thanks|thx|cool|awesome|nice|great|bye|goodbye|see ya)\b/i,
            reply: "Anytime! Poke me whenever you want to know more about Ashish.",
            happy: true
        },
        {
            pattern: /\b(next|notice|joining|joined|available|availability)\b|new\s+(company|role|job|team)|what'?s\s+next/i,
            reply: nextChapterReply,
            actions: [{ label: 'See the journey', scrollTo: '#journey' }]
        },
        {
            pattern: /\b(cv|resume|résumé|download)\b/i,
            reply: "Here's Ashish's latest **CV** — one page of the good stuff.",
            actions: [{ label: 'Open CV (PDF)', href: './assets/Ashish_Yadav_CV.pdf' }]
        },
        {
            pattern: /\b(contact|email|mail|linkedin|github|hire|hiring|reach|talk|message)\b/i,
            reply: `Best way to reach Ashish is **${EMAIL}**, or connect on **LinkedIn**. He replies fast.`,
            actions: [
                { label: 'Copy email', copy: EMAIL },
                { label: 'LinkedIn', href: 'https://linkedin.com/in/avickyadav' },
                { label: 'GitHub', href: 'https://github.com/avickyadav' }
            ]
        },
        {
            pattern: /\b(journey|path|career|timeline|story)\b/i,
            reply: "Ashish's path runs from **ECE student** to **full-stack & GenAI engineer**. I'll take you to the journey section.",
            actions: [{ label: 'Go to journey', scrollTo: '#journey' }]
        },
        {
            pattern: /\b(college|education|jecrc|jaipur|btech|degree|gpa|university)\b/i,
            reply: "Ashish earned his **B.Tech in Electronics & Communication Engineering** from **Jaipur Engineering College and Research Centre (2018–2022)** with an **8.5 GPA**."
        },
        {
            pattern: /\b(award|cert|certification|ai-102|microsoft|emerging|prize|recognition|recommend|review)\b/i,
            reply: "Ashish is a **Microsoft Certified Azure AI Engineer Associate (AI-102)** and won **Emerging Employee of the Year (2026)** at Pratham. He also has LinkedIn recommendations from leaders at a top-3 consulting firm, Zenia Graph and Metacube.",
            actions: [{ label: 'Read recommendations', scrollTo: '#recommendations' }]
        },
        {
            pattern: /\b(pratham|current|currently|consulting|present)\b/i,
            reply: "At **Pratham Software** (Oct 2025 – Present), Ashish builds agentic GenAI products for **a top-3 management consulting firm** — cutting analyst research time ~**35%** via RAG and turnaround ~**40%** with Claude/OpenAI + FastAPI/React.",
            actions: [{ label: 'See experience', scrollTo: '#experience' }]
        },
        {
            pattern: /\b(metacube|zenia|rgm|graphdb|previous|past)\b/i,
            reply: "At **Metacube Software** (Oct 2021 – Sep 2025), Ashish built a React + GraphDB RAG UI (**80%** faster responses), shipped GPT-4.5 & Gemini microservices, and an AI revenue-growth tool (+**30%** engagement)."
        },
        {
            pattern: /\b(project|projects|built|best|mcp server|face|iot|portfolio)\b/i,
            reply: "Top picks: **Personal MCP Server** for autonomous Claude dev workflows, the **AI Revenue Growth tool** (+30% engagement), **Face Recognition** (95% accuracy) and **IoT Home Automation** (-30% energy). My favourite is the MCP server.",
            actions: [{ label: 'See projects', scrollTo: '#projects' }]
        },
        {
            pattern: /\b(ai|genai|llm|rag|mcp|claude|openai|gpt|gemini|langchain|vector|stack|tech|skills|python|react|fastapi|docker|cloud|aws|azure|gcp)\b/i,
            reply: "Core stack: **AI/GenAI** (Claude, OpenAI, Gemini, RAG, MCP, multi-agent, LangChain, vector DBs), **Frontend** (React, TypeScript), **Backend** (Python, FastAPI, Django, PostgreSQL, MongoDB) and **Cloud** (Docker, Kubernetes, AWS, Azure, GCP).",
            actions: [{ label: 'See skills', scrollTo: '#skills' }]
        },
        {
            pattern: /\b(who|about|ashish|intro|summary|background|years|bio)\b/i,
            reply: "Ashish Yadav is a **Full-Stack & AI-driven Software Engineer** with **5+ years** of experience. He builds production React/FastAPI apps and GenAI-native systems (agentic workflows, RAG, MCP) for global enterprise clients.",
            actions: [{ label: 'About him', scrollTo: '#about' }]
        }
    ];
    const FALLBACK = "Hmm, I only know about Ashish! Try **AI stack**, **best project**, **what's next for him**, or **hire / contact**.";

    function formatText(str) {
        return str.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    }

    function scrollMsgs() { msgs.scrollTop = msgs.scrollHeight; }

    function addMsg(text, sender) {
        const div = document.createElement('div');
        div.className = `piko-msg ${sender}`;
        if (sender === 'user') div.textContent = text;      // never innerHTML for user text
        else div.innerHTML = formatText(text);              // bot strings are trusted/escaped
        msgs.appendChild(div);
        scrollMsgs();
        return div;
    }

    function addActions(actions) {
        if (!actions || !actions.length) return;
        const row = document.createElement('div');
        row.className = 'piko-actions';
        actions.forEach(a => {
            let el;
            if (a.href) {
                el = document.createElement('a');
                el.href = a.href;
                el.target = '_blank';
                el.rel = 'noopener noreferrer';
            } else {
                el = document.createElement('button');
                el.type = 'button';
            }
            el.className = 'piko-act';
            el.textContent = a.label;
            if (a.copy) {
                el.addEventListener('click', () => {
                    const done = () => { el.textContent = 'Copied'; setTimeout(() => { el.textContent = a.label; }, 1600); };
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(a.copy).then(done, () => { fallbackCopy(a.copy); done(); });
                    } else { fallbackCopy(a.copy); done(); }
                });
            } else if (a.scrollTo) {
                el.addEventListener('click', () => {
                    const target = document.querySelector(a.scrollTo);
                    if (sheetMQ.matches) closeChat(false);
                    if (target) target.scrollIntoView({ behavior: reducedMQ.matches ? 'auto' : 'smooth', block: 'start' });
                });
            }
            row.appendChild(el);
        });
        msgs.appendChild(row);
        scrollMsgs();
    }

    function fallbackCopy(text) {
        const t = document.createElement('textarea');
        t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); } catch (e) { /* ignore */ }
        t.remove();
    }

    function matchIntent(query) {
        for (const item of INTENTS) {
            if (item.pattern.test(query)) {
                return { reply: typeof item.reply === 'function' ? item.reply() : item.reply, actions: item.actions, happy: item.happy };
            }
        }
        return { reply: FALLBACK };
    }

    let replyTimer = null, calmTimer = null;
    function handleQuery(text) {
        const trimmed = text.trim();
        if (!trimmed) return;
        hideBubble();
        addMsg(trimmed, 'user');
        const result = matchIntent(trimmed);
        const typing = document.createElement('div');
        typing.className = 'piko-msg bot piko-typing';
        typing.setAttribute('aria-hidden', 'true');
        typing.innerHTML = '<span></span><span></span><span></span>';
        msgs.appendChild(typing);
        scrollMsgs();
        window.pikoState.hold('thinking');
        clearTimeout(calmTimer);
        const delay = Math.min(900, Math.max(500, 380 + result.reply.length * 2));
        clearTimeout(replyTimer);
        replyTimer = setTimeout(() => {
            typing.remove();
            addMsg(result.reply, 'bot');
            addActions(result.actions);
            window.pikoState.hold('happy');
            calmTimer = setTimeout(() => window.pikoState.release(), 1300);
        }, delay);
    }

    // ----- Open / close, focus, scroll lock -----
    let lastActivity = Date.now();
    let opener = null;
    function isOpen() { return win.classList.contains('open'); }

    function openChat() {
        hideBubble();
        win.classList.add('open');
        win.setAttribute('aria-hidden', 'false');
        widget.classList.add('is-open');
        fab.setAttribute('aria-expanded', 'true');
        if (sheetMQ.matches) document.body.classList.add('piko-lock');
        window.pikoState.setAsleep(false);
        setTimeout(() => input && input.focus({ preventScroll: true }), 30);
    }
    function closeChat(returnFocus = true) {
        win.classList.remove('open');
        win.setAttribute('aria-hidden', 'true');
        widget.classList.remove('is-open');
        fab.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('piko-lock');
        lastActivity = Date.now();
        if (returnFocus) fab.focus({ preventScroll: true });
    }
    fab.addEventListener('click', () => { isOpen() ? closeChat() : openChat(); });
    closeBtn.addEventListener('click', () => closeChat());
    if (backdrop) backdrop.addEventListener('click', () => closeChat());
    sheetMQ.addEventListener && sheetMQ.addEventListener('change', () => {
        document.body.classList.toggle('piko-lock', isOpen() && sheetMQ.matches);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (isOpen()) closeChat();
            else if (!bubble.hidden) { hideBubble(); fab.focus(); }
            return;
        }
        // Focus trap while in bottom-sheet mode
        if (e.key === 'Tab' && isOpen() && sheetMQ.matches) {
            const f = win.querySelectorAll('button, a[href], input');
            if (!f.length) return;
            const first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleQuery(input.value);
        input.value = '';
    });
    chips.forEach(chip => {
        chip.addEventListener('click', () => handleQuery(chip.dataset.q || chip.textContent));
    });

    // ----- Hover + sleepy -----
    fab.addEventListener('pointerenter', () => { window.pikoState.setHover(true); window.pikoState.setAsleep(false); });
    fab.addEventListener('pointerleave', () => window.pikoState.setHover(false));
    fab.addEventListener('focus', () => { window.pikoState.setHover(true); window.pikoState.setAsleep(false); });
    fab.addEventListener('blur', () => window.pikoState.setHover(false));

    const wake = () => {
        lastActivity = Date.now();
        window.pikoState.setAsleep(false);
    };
    ['pointermove', 'pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(ev =>
        window.addEventListener(ev, wake, { passive: true }));
    setInterval(() => {
        if (!isOpen() && Date.now() - lastActivity >= 45000) window.pikoState.setAsleep(true);
    }, 2000);

    // ----- First-visit wave -----
    function hideBubble() {
        if (bubble.hidden) return;
        bubble.hidden = true;
        widget.classList.remove('has-bubble');
        window.pikoState.release();
    }
    document.getElementById('piko-bubble-no').addEventListener('click', () => { hideBubble(); fab.focus({ preventScroll: true }); });
    document.getElementById('piko-bubble-yes').addEventListener('click', () => {
        hideBubble();
        openChat();
        handleQuery('Who is Ashish?');
    });

    function safeSession(fn) { try { return fn(); } catch (e) { return null; } }
    setTimeout(() => {
        if (isOpen() || safeSession(() => sessionStorage.getItem('piko-waved'))) return;
        safeSession(() => sessionStorage.setItem('piko-waved', '1'));
        bubble.hidden = false;
        widget.classList.add('has-bubble');
        window.pikoState.hold('wave');
        setTimeout(() => { if (!bubble.hidden) window.pikoState.release(); }, 2600);
        setTimeout(hideBubble, 16000);
    }, 6000);

    // Initial welcome
    addMsg("Hi! I'm **Piko**, Ashish's desk pet 🌱 Ask me about his work, AI stack, or tap a topic below.", 'bot');
})();


// ===== NEXT CHAPTER — one config drives hero pill, Trail, Experience (and Piko replies) =====
function renderNextChapter() {
    const n = NEXT_CHAPTER;
    const esc = (v) => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const m = /(?:(\d{1,2})\s+)?([A-Za-z]{3})[A-Za-z]*\s+(\d{4})/.exec(n.start || '');
    const mi = m ? MON.findIndex(x => x.toLowerCase() === m[2].toLowerCase()) : -1;
    const parsed = m && mi >= 0 ? { day: m[1] || '', mon: mi, year: +m[3] } : null;
    const shortDate = parsed ? `${parsed.day ? parsed.day + ' ' : ''}${MON[parsed.mon]}` : (n.start || 'soon');
    const endMon = parsed ? (parsed.mon === 0 ? `Dec ${parsed.year - 1}` : `${MON[parsed.mon - 1]} ${parsed.year}`) : '';
    const joined = n.status === 'joined' && !!n.company;
    const hasCo = !!n.company;
    const $ = (sel) => document.querySelector(sel);
    const dot = '<span class="stop-dot" aria-hidden="true"></span>';
    const logo = n.logo ? `<img class="stop-logo" src="${esc(n.logo)}" alt="${esc(n.company)} logo">` : '';

    // Hero pill
    const pill = $('[data-nc="hero-pill-text"]');
    if (pill) {
        pill.textContent = joined ? `Now at ${n.company}`
            : hasCo ? `Serving notice · joining ${n.company} ${shortDate}`
            : `Serving notice · next chapter starts ${shortDate}`;
    }

    // Pratham dates (Experience + Trail)
    const range = joined && endMon ? `Oct 2025 — ${endMon}` : null;
    const expDate = $('[data-nc="exp-pratham-date"]');
    if (expDate) expDate.textContent = range || 'Oct 2025 — Present · serving notice';
    const trDate = $('[data-nc="trail-pratham-date"]');
    if (trDate) trDate.textContent = range || 'Oct 2025 — Present';

    const now = $('[data-slot="now"]'), next = $('[data-slot="next"]'), ghost = $('[data-slot="ghost"]');
    if (!now || !next || !ghost) return;

    if (joined) {
        now.hidden = true;
        next.dataset.state = 'current'; next.dataset.map = 'Now';
        next.innerHTML = `${dot}<div class="stop-card"><p class="stop-date">From ${esc(n.start)}</p>
            <div class="stop-head">${logo}<h3 class="stop-title">${esc(n.company)}</h3></div>
            ${n.role ? `<p class="stop-sum">${esc(n.role)}</p>` : ''}</div>`;
        ghost.hidden = false;
        ghost.innerHTML = `${dot}<div class="stop-card"><p class="stop-date">Next</p>
            <h3 class="stop-title">What&#8217;s next?</h3><p class="stop-sum">Not written yet.</p></div>`;
    } else {
        now.hidden = false; ghost.hidden = true; ghost.innerHTML = '';
        now.innerHTML = `${dot}<div class="stop-card"><p class="stop-date">Now</p>
            <h3 class="stop-title">Serving notice</h3><p class="stop-sum">Wrapping up handovers</p></div>`;
        next.dataset.state = 'next'; next.dataset.map = 'Next';
        next.innerHTML = hasCo
            ? `${dot}<div class="stop-card"><p class="stop-date">Next · from ${esc(n.start)}</p>
                <div class="stop-head">${logo}<h3 class="stop-title">Next: ${n.role ? esc(n.role) + ' at ' : ''}${esc(n.company)} · from ${esc(n.start)}</h3></div>
                <p class="stop-sum">Wrapping up at Pratham first.</p></div>`
            : `${dot}<div class="stop-card"><p class="stop-date">Next</p>
                <h3 class="stop-title">Next chapter — starting ${esc(n.start)}</h3>
                <p class="stop-sum">Wrapping up at Pratham · new team, new problems</p>
                <div class="stop-skel" aria-hidden="true"><i></i><i></i></div></div>`;
    }
    document.dispatchEvent(new Event('trail:update'));
}
// Handy for testing: window.__setNextChapter({ status: 'joined', company: 'Acme', role: 'Engineer', start: '7 Dec 2026' })
window.__setNextChapter = (obj) => { Object.assign(NEXT_CHAPTER, obj); renderNextChapter(); };
renderNextChapter();
