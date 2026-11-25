/* =============================================
   SCRIPT.JS — All interactions & animations
   ============================================= */

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


// ===== CAREER TIMELINE ANIMATION =====
(function initTimeline() {
    const wrapper = document.getElementById('staircase-wrapper');
    const steps   = document.querySelectorAll('.stair-step');
    if (!wrapper) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                // Stagger-animate each step bottom → top
                steps.forEach((step, i) => {
                    setTimeout(() => step.classList.add('step-visible'), i * 230);
                });
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });
    observer.observe(wrapper);
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


// ===== PIKO AI PET CHATBOT (REGEX + CURATED QA) =====
(function initPikoChatbot() {
    const fab      = document.getElementById('piko-fab');
    const win      = document.getElementById('piko-window');
    const closeBtn = document.getElementById('piko-close');
    const msgs     = document.getElementById('piko-messages');
    const form     = document.getElementById('piko-form');
    const input    = document.getElementById('piko-input');
    const chips    = document.querySelectorAll('.piko-qchip');
    if (!fab || !win || !msgs) return;

    const INTENTS = [
        {
            pattern: /\b(hi|hello|hey|yo|hola|namaste|greetings|good\s*(morning|afternoon|evening))\b/i,
            reply: "Hey there! 🐾 I'm **Piko**, Ashish's AI sidekick! Ask me anything about his **AI/GenAI work**, **Pratham & BCGX experience**, **tech stack**, **awards**, or **how to reach him**."
        },
        {
            pattern: /\b(who|about|ashish|intro|summary|background|years|bio)\b/i,
            reply: "Ashish Yadav is a **Full-Stack & AI-driven Software Engineer** with **5+ years** of experience. He builds production React/FastAPI apps and GenAI-native systems (agentic workflows, RAG pipelines, MCP integrations) for global enterprise clients."
        },
        {
            pattern: /\b(ai|genai|llm|rag|mcp|claude|openai|gpt|gemini|langchain|vector|stack|tech|skills|python|react|fastapi|docker|cloud|aws|azure|gcp)\b/i,
            reply: "Ashish's core stack spans **AI/GenAI** (Claude, OpenAI GPT, Gemini, RAG, MCP & Multi-Agent Workflows, LangChain, Vector DBs), **Frontend** (React, TypeScript, Redux, MUI), **Backend** (Python, FastAPI, Django, PostgreSQL, MongoDB, GraphQL), and **Cloud/DevOps** (Docker, Kubernetes, Jenkins, AWS, Azure, GCP)."
        },
        {
            pattern: /\b(pratham|bcg|bcgx|current|consulting|present)\b/i,
            reply: "At **Pratham Software Pvt. Ltd.** (Oct 2025 – Present), Ashish builds agentic GenAI products for a **Global Top-3 Management Consulting Firm (BCGX)** — cutting analyst research time by ~35% via RAG and turnaround by ~40% with Claude/OpenAI + FastAPI/React. He also won **Emerging Employee of the Year 2026**! 🏆"
        },
        {
            pattern: /\b(metacube|zenia|rgm|graphdb|previous|past)\b/i,
            reply: "At **Metacube Software** (Oct 2021 – Sep 2025, 4 years), Ashish built a React + GraphDB RAG UI (improving response time by **80%**), deployed GPT-4.5 & Gemini microservices, and created an AI Revenue Growth Management tool (+30% engagement)."
        },
        {
            pattern: /\b(award|cert|certification|ai-102|microsoft|emerging|prize|recognition|recommend|review)\b/i,
            reply: "Ashish is a **Microsoft Certified Azure AI Engineer Associate (AI-102)** and won **Emerging Employee of the Year (2026)** at Pratham Software. He also has 4 glowing LinkedIn recommendations from leaders at BCGX, Zenia Graph, and Metacube!"
        },
        {
            pattern: /\b(project|projects|built|mcp server|face|iot|portfolio)\b/i,
            reply: "Featured projects include: 1) **Personal MCP Server** for autonomous Claude developer workflows, 2) **AI Revenue Growth Management Tool** (+30% engagement), 3) **Face Recognition System** (95% accuracy), and 4) **IoT Home Automation** (-30% energy)."
        },
        {
            pattern: /\b(college|education|jecrc|jaipur|btech|degree|gpa|university)\b/i,
            reply: "Ashish earned his **B.Tech in Electronics & Communication Engineering** from **Jaipur Engineering College and Research Centre (2018–2022)** with an **8.5 GPA**."
        },
        {
            pattern: /\b(contact|email|mail|linkedin|github|hire|reach|cv|resume|download)\b/i,
            reply: "You can reach Ashish at **ashishvickyadav@gmail.com**, connect on **linkedin.com/in/avickyadav**, check his code on **github.com/avickyadav**, or grab his latest CV using the **Download CV** button at the top!"
        },
        {
            pattern: /\b(thank|thanks|thx|cool|awesome|nice|great|bye|goodbye|see ya)\b/i,
            reply: "You're very welcome! 🐾 Feel free to explore the sections or ping me anytime. Have an awesome day!"
        }
    ];

    function formatText(str) {
        return str.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    }

    function addMsg(text, sender) {
        const div = document.createElement('div');
        div.className = `piko-msg ${sender}`;
        div.innerHTML = formatText(text);
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function matchIntent(query) {
        for (const item of INTENTS) {
            if (item.pattern.test(query)) return item.reply;
        }
        return "Hmm, I'm a lightweight portfolio pet so I only know about Ashish! 🐾 Try asking about his **AI stack**, **Pratham / BCGX**, **awards**, **projects**, or click one of the quick chips below.";
    }

    function handleQuery(text) {
        const trimmed = text.trim();
        if (!trimmed) return;
        addMsg(trimmed, 'user');
        setTimeout(() => {
            addMsg(matchIntent(trimmed), 'bot');
        }, 240);
    }

    // Initial welcome
    addMsg("Hi! I'm **Piko** 🐾 — Ashish's AI sidekick. Ask me anything about his work, AI stack, or click a quick topic below!", 'bot');

    fab.addEventListener('click', () => {
        const open = win.classList.toggle('open');
        win.setAttribute('aria-hidden', String(!open));
        if (open && input) input.focus();
    });

    closeBtn.addEventListener('click', () => {
        win.classList.remove('open');
        win.setAttribute('aria-hidden', 'true');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleQuery(input.value);
        input.value = '';
    });

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            handleQuery(chip.dataset.q || chip.textContent);
        });
    });
})();
