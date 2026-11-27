/* =============================================
   SCRIPT.JS — All interactions & animations
   ============================================= */

// Next-chapter config: flip status/company/role to update Piko (and later the Journey/hero).
const NEXT_CHAPTER = { status: 'notice', company: '', role: '', start: '7 Dec 2026', logo: '' };

// ===== SECTIONS — single source for the rail, tab bar and command palette =====
// `tab`: label if this section has its own mobile tab; `tabOf`: which tab it highlights otherwise.
const SECTIONS = [
    { id: 'profile',         label: 'Home',            short: 'Home',     icon: 'home',      tab: 'Home' },
    { id: 'about',           label: 'About',           short: 'About',    icon: 'user',      tabOf: 'profile' },
    { id: 'journey',         label: 'Journey',         short: 'Journey',  icon: 'route',     tab: 'Journey' },
    { id: 'experience',      label: 'Experience',      short: 'Work',     icon: 'briefcase', tab: 'Work' },
    { id: 'projects',        label: 'Projects',        short: 'Projects', icon: 'folder',    tabOf: 'experience' },
    { id: 'skills',          label: 'Tech Stack',      short: 'Stack',    icon: 'layers',    tabOf: 'experience' },
    { id: 'recommendations', label: 'Recommendations', short: 'Reviews',  icon: 'quote',     tab: 'Reviews' },
    { id: 'contact',         label: 'Contact',         short: 'Contact',  icon: 'mail',      tab: 'Contact' }
];

const ICONS = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    quote: '<path d="M4 5h16v11H9l-5 4z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/>',
    download: '<path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 21h14"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>',
    theme: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    up: '<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17v4M17 19h4"/>',
    arrow: '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>'
};
const icon = (key, size = 20) =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[key] || ''}</svg>`;

const CONTACT_EMAIL = 'ashishvickyadav@gmail.com';
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== TOAST + clipboard helpers =====
let _toastTimer = null;
function showToast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    clearTimeout(_toastTimer);
    el.classList.remove('show');
    el.textContent = '';
    // Re-set text on the next frame so repeated identical messages are re-announced
    requestAnimationFrame(() => {
        el.textContent = msg;
        el.classList.add('show');
        _toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
    });
}
function copyText(text) {
    return new Promise((resolve) => {
        const fallback = () => {
            const ta = document.createElement('textarea');
            ta.value = text; ta.setAttribute('readonly', '');
            ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
            document.body.appendChild(ta); ta.select();
            let ok = false;
            try { ok = document.execCommand('copy'); } catch (e) { /* ignore */ }
            ta.remove(); resolve(ok);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => resolve(true), fallback);
        } else fallback();
    });
}
function copyEmail() {
    return copyText(CONTACT_EMAIL).then(ok => showToast(ok ? 'Email copied' : 'Copy failed. ' + CONTACT_EMAIL));
}
function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === 'profile') window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    try { history.replaceState(null, '', '#' + id); } catch (e) { /* ignore */ }
}
function focusableIn(root) {
    return Array.from(root.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter(el => el.offsetParent !== null || el === document.activeElement);
}
function trapTab(e, root) {
    const f = focusableIn(root);
    if (!f.length) { e.preventDefault(); return; }
    const first = f[0], last = f[f.length - 1];
    if (!root.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

// ===== THEME TOGGLE =====
const THEME_KEY = 'ay-theme';

function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    const desktopBtn = document.getElementById('theme-toggle');
    const mobileBtn  = document.getElementById('theme-toggle-mobile');
    if (desktopBtn) desktopBtn.setAttribute('aria-checked', String(isDark));
    if (mobileBtn)  mobileBtn.setAttribute('aria-checked', String(isDark));
}

function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const next = isDark ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
}

// Desktop toggle button
const desktopToggle = document.getElementById('theme-toggle');
if (desktopToggle) desktopToggle.addEventListener('click', toggleTheme);
const mobileToggle = document.getElementById('theme-toggle-mobile');
if (mobileToggle) mobileToggle.addEventListener('click', toggleTheme);

// Apply saved / preferred theme on load
(function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
        applyTheme(saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark');
    }
})();


// ===== SCROLL REVEAL (sections) =====
(function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    let left = els.length;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                observer.unobserve(e.target);
                if (--left <= 0) observer.disconnect();
            }
        });
    }, { threshold: 0.08 });
    els.forEach(el => observer.observe(el));
})();


// ===== SCROLLSPY — one IntersectionObserver drives top bar, rail, tab bar and menu sheet =====
const navSpy = {
    active: null,
    subs: [],
    onChange(fn) { this.subs.push(fn); if (this.active) fn(this.active); },
    set(id) { if (id && id !== this.active) { this.active = id; this.subs.forEach(fn => fn(id)); } }
};
(function initScrollspy() {
    const els = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);
    if (!els.length) return;
    let inBand = 'profile';
    let raf = 0;

    function resolve() {
        raf = 0;
        const doc = document.documentElement;
        const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 4;
        navSpy.set(atBottom ? SECTIONS[SECTIONS.length - 1].id : inBand);
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(resolve); };

    // A thin band across the viewport (40% from top); whichever section crosses it is "current"
    const io = new IntersectionObserver((entries) => {
        const hit = entries.filter(e => e.isIntersecting).pop();
        if (hit) { inBand = hit.target.id; schedule(); }
    }, { rootMargin: '-40% 0px -55% 0px' });
    els.forEach(el => io.observe(el));

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
})();


// ===== TOP BAR — sliding underline indicator, scrolled hairline, shortcut label =====
(function initTopbar() {
    const wrap = document.getElementById('nav-links-wrap');
    const ind  = document.getElementById('nav-indicator');
    const links = wrap ? Array.from(wrap.querySelectorAll('a')) : [];
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '');
    document.querySelectorAll('[data-cmdk-key]').forEach(el => { el.textContent = isMac ? '⌘K' : 'Ctrl K'; });

    const cmdk = document.getElementById('cmdk-btn');
    if (cmdk) cmdk.addEventListener('click', () => window.commandPalette && window.commandPalette.open());

    if (wrap && ind) {
        let placed = false;
        const place = (instant) => {
            const a = links.find(l => l.classList.contains('active'));
            if (!a || !wrap.offsetWidth) { ind.style.opacity = '0'; return; }
            const wr = wrap.getBoundingClientRect(), r = a.getBoundingClientRect();
            if (instant || !placed || prefersReducedMotion()) ind.classList.add('no-anim');
            ind.style.width = r.width + 'px';
            ind.style.transform = `translateX(${(r.left - wr.left).toFixed(1)}px)`;
            ind.style.opacity = '1';
            if (ind.classList.contains('no-anim')) { void ind.offsetWidth; ind.classList.remove('no-anim'); }
            placed = true;
        };
        navSpy.onChange((id) => {
            links.forEach(l => {
                const on = l.getAttribute('href') === '#' + id;
                l.classList.toggle('active', on);
                if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
            });
            place(false);
        });
        window.addEventListener('resize', () => place(true));
        if ('ResizeObserver' in window) new ResizeObserver(() => place(true)).observe(wrap);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => place(true));
    }

    // Hairline under the bars only after scrolling 8px
    let raf = 0;
    const onScroll = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => { raf = 0; document.body.classList.toggle('is-scrolled', window.scrollY > 8); });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();


// ===== SECTION RAIL (>= 1200px) — rendered from SECTIONS =====
(function initRail() {
    const ol = document.querySelector('#rail ol');
    if (!ol) return;
    ol.innerHTML = SECTIONS.map((s, i) =>
        `<li><a href="#${s.id}" data-id="${s.id}"><span class="rail-label">${s.label}</span><span class="rail-num">${String(i).padStart(2, '0')}</span><span class="rail-line" aria-hidden="true"></span></a></li>`
    ).join('');
    const links = Array.from(ol.querySelectorAll('a'));
    links.forEach(a => a.setAttribute('aria-label', a.querySelector('.rail-label').textContent));
    navSpy.onChange((id) => links.forEach(a => {
        const on = a.dataset.id === id;
        a.classList.toggle('active', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    }));
})();


// ===== MOBILE TAB BAR (<= 768px) — rendered from SECTIONS, hides on scroll-down =====
(function initTabbar() {
    const bar = document.getElementById('tabbar');
    if (!bar) return;
    const tabs = SECTIONS.filter(s => s.tab);
    bar.innerHTML = tabs.map(s =>
        `<a class="tab" href="#${s.id}" data-id="${s.id}">${icon(s.icon, 20)}<span>${s.tab}</span></a>`
    ).join('');
    const links = Array.from(bar.querySelectorAll('a'));
    navSpy.onChange((id) => {
        const sec = SECTIONS.find(s => s.id === id);
        const tabId = sec ? (sec.tab ? sec.id : sec.tabOf) : null;
        links.forEach(a => {
            const on = a.dataset.id === tabId;
            a.classList.toggle('active', on);
            if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
    });

    let lastY = window.scrollY, raf = 0, holdUntil = 0;
    const show = () => bar.classList.remove('is-hidden');
    function update() {
        raf = 0;
        const y = window.scrollY;
        const dy = y - lastY;
        if (y < 64 || Date.now() < holdUntil) { show(); lastY = y; return; }
        if (Math.abs(dy) < 8) return;
        bar.classList.toggle('is-hidden', dy > 0);
        lastY = y;
    }
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    // Tapping a tab smooth-scrolls; keep the bar visible during that scroll
    bar.addEventListener('click', () => { holdUntil = Date.now() + 1000; show(); });
})();


// ===== MOBILE MENU SHEET (replaces the old dropdown hamburger) =====
(function initMenuSheet() {
    const btn = document.getElementById('menu-btn');
    const sheet = document.getElementById('menu-sheet');
    const closeBtn = document.getElementById('menu-close');
    if (!btn || !sheet) return;
    const mq = window.matchMedia('(max-width: 768px)');
    let lastFocus = null;
    const isOpen = () => sheet.classList.contains('open');

    function open() {
        lastFocus = document.activeElement;
        sheet.classList.add('open');
        document.body.classList.add('menu-open');
        btn.setAttribute('aria-expanded', 'true');
        closeBtn.focus({ preventScroll: true });
    }
    function close(restore = true) {
        if (!isOpen()) return;
        sheet.classList.remove('open');
        document.body.classList.remove('menu-open');
        btn.setAttribute('aria-expanded', 'false');
        if (restore) (lastFocus && lastFocus.focus ? lastFocus : btn).focus({ preventScroll: true });
    }
    btn.addEventListener('click', () => (isOpen() ? close() : open()));
    closeBtn.addEventListener('click', () => close());
    sheet.querySelectorAll('.menu-sheet-links a').forEach(a => a.addEventListener('click', () => close(false)));
    sheet.querySelectorAll('.menu-sheet-actions a').forEach(a => a.addEventListener('click', () => close(false)));
    const copyBtn = document.getElementById('menu-copy-email');
    if (copyBtn) copyBtn.addEventListener('click', () => { copyEmail(); close(); });
    document.addEventListener('keydown', (e) => {
        if (!isOpen()) return;
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        else if (e.key === 'Tab') trapTab(e, sheet);
    });
    const links = Array.from(sheet.querySelectorAll('.menu-sheet-links a'));
    navSpy.onChange((id) => links.forEach(a => {
        if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    }));
    if (mq.addEventListener) mq.addEventListener('change', () => { if (!mq.matches) close(false); });
})();


// ===== COMMAND PALETTE — Ctrl/Cmd+K or "/" =====
(function initPalette() {
    const root = document.getElementById('palette');
    const input = document.getElementById('palette-input');
    const list = document.getElementById('palette-list');
    const backdrop = document.getElementById('palette-backdrop');
    if (!root || !input || !list) return;

    const escHtml = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const askPiko = (q) => { if (window.pikoChat) window.pikoChat.ask(q); };
    const openUrl = (url) => window.open(url, '_blank', 'noopener');

    const NAVIGATE = SECTIONS.map((s, i) => ({
        group: 'Navigate', label: s.label, kw: s.short + ' ' + s.id, hint: String(i).padStart(2, '0'), icon: s.icon,
        run: () => scrollToSection(s.id)
    }));
    const ACTIONS = [
        { group: 'Actions', label: 'Download CV', kw: 'resume pdf', icon: 'download', run: () => openUrl('./assets/Ashish_Yadav_CV.pdf') },
        { group: 'Actions', label: 'Copy email', kw: 'contact mail address', icon: 'copy', hint: CONTACT_EMAIL, run: () => copyEmail() },
        { group: 'Actions', label: 'Open LinkedIn', kw: 'social profile', icon: 'link', run: () => openUrl('https://linkedin.com/in/avickyadav') },
        { group: 'Actions', label: 'Open GitHub', kw: 'code repos social', icon: 'link', run: () => openUrl('https://github.com/avickyadav') },
        { group: 'Actions', label: 'Toggle theme', kw: 'dark light mode', icon: 'theme', run: () => toggleTheme() },
        { group: 'Actions', label: 'Back to top', kw: 'scroll up home', icon: 'up', run: () => scrollToSection('profile') }
    ];
    const PIKO = [
        { group: 'Piko', label: "What's next for Ashish?", kw: 'ask piko notice joining new role', icon: 'sparkle', run: () => askPiko("What's next for Ashish?") }
    ];
    const ALL = NAVIGATE.concat(ACTIONS, PIKO);

    // Simple subsequence fuzzy match: contiguous hits and word-start hits score higher
    function fuzzy(q, text) {
        const t = text.toLowerCase();
        const sub = t.indexOf(q);
        if (sub >= 0) return { score: 100 - sub + (sub === 0 ? 40 : 0), idx: Array.from({ length: q.length }, (_, k) => sub + k), good: true };
        let ti = 0, score = 0, prev = -2;
        const idx = [];
        for (const ch of q) {
            const j = t.indexOf(ch, ti);
            if (j < 0) return null;
            idx.push(j);
            score += (j === prev + 1 ? 5 : 1) + ((j === 0 || t[j - 1] === ' ') ? 3 : 0);
            prev = j; ti = j + 1;
        }
        return { score, idx, good: false };
    }

    let visible = [];   // flat list of rendered options
    let active = 0;
    let lastFocus = null;
    const isOpen = () => root.classList.contains('open');

    function build(query) {
        const q = query.trim().toLowerCase();
        if (!q) {
            return [
                { name: 'Navigate', items: NAVIGATE },
                { name: 'Actions', items: ACTIONS },
                { name: 'Piko', items: PIKO.concat([{ group: 'Piko', label: 'Ask Piko anything', icon: 'sparkle', hint: 'chat', run: () => window.pikoChat && window.pikoChat.open() }]) }
            ];
        }
        let anyGood = false;
        const scored = [];
        ALL.forEach(item => {
            const l = fuzzy(q, item.label);
            const k = fuzzy(q, item.kw || '');
            const best = l && (!k || l.score >= k.score) ? l : k;
            if (!best) return;
            if (best.good) anyGood = true;
            scored.push({ item, score: best.score + (l ? 20 : 0), idx: l ? l.idx : [] });
        });
        scored.sort((a, b) => b.score - a.score);
        const groups = ['Navigate', 'Actions', 'Piko'].map(name => ({
            name,
            items: scored.filter(s => s.item.group === name).map(s => Object.assign({}, s.item, { _idx: s.idx }))
        }));
        const ask = { group: 'Piko', label: 'Ask Piko: ' + query.trim(), icon: 'sparkle', hint: 'chat', _plain: true, run: () => askPiko(query.trim()) };
        const pikoGroup = groups.find(g => g.name === 'Piko');
        pikoGroup.items.unshift(ask);
        if (!anyGood) { groups.splice(groups.indexOf(pikoGroup), 1); groups.unshift(pikoGroup); }
        return groups.filter(g => g.items.length);
    }

    function labelHtml(item) {
        if (!item._idx || !item._idx.length) return escHtml(item.label);
        const set = new Set(item._idx);
        return Array.from(item.label).map((c, i) => set.has(i) ? `<mark>${escHtml(c)}</mark>` : escHtml(c)).join('');
    }

    function render() {
        const groups = build(input.value);
        visible = [];
        let n = 0;
        list.innerHTML = groups.map((g, gi) => {
            const gid = 'pal-g' + gi;
            const opts = g.items.map(item => {
                const id = 'pal-opt-' + (n++);
                visible.push(item);
                return `<div class="palette-opt" role="option" id="${id}" aria-selected="false">${icon(item.icon, 18)}<span class="opt-text">${labelHtml(item)}</span>${item.hint ? `<span class="opt-hint">${escHtml(item.hint)}</span>` : ''}</div>`;
            }).join('');
            return `<div class="palette-group" role="group" aria-labelledby="${gid}"><div class="palette-group-label" id="${gid}" role="presentation">${g.name}</div>${opts}</div>`;
        }).join('') || '<div class="palette-empty">No matches</div>';
        setActive(0);
    }

    function setActive(i, scroll = true) {
        const opts = list.querySelectorAll('.palette-opt');
        if (!opts.length) { input.removeAttribute('aria-activedescendant'); return; }
        active = (i + opts.length) % opts.length;
        opts.forEach((o, k) => o.setAttribute('aria-selected', String(k === active)));
        input.setAttribute('aria-activedescendant', opts[active].id);
        if (scroll) opts[active].scrollIntoView({ block: 'nearest' });
    }

    function open() {
        if (isOpen()) return;
        lastFocus = document.activeElement;
        input.value = '';
        render();
        root.classList.add('open');
        document.body.classList.add('palette-open');
        input.focus({ preventScroll: true });
    }
    function close(restore = true) {
        if (!isOpen()) return;
        root.classList.remove('open');
        document.body.classList.remove('palette-open');
        if (restore && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
    function choose(i) {
        const item = visible[i];
        if (!item) return;
        const toPiko = item.group === 'Piko';
        close(!toPiko);
        // Let focus settle (or Piko take it) before running the command
        setTimeout(() => item.run(), 0);
    }
    window.commandPalette = { open, close };

    input.addEventListener('input', render);
    list.addEventListener('mousedown', (e) => e.preventDefault()); // keep focus in the input
    list.addEventListener('click', (e) => {
        const o = e.target.closest('.palette-opt');
        if (o) choose(Array.from(list.querySelectorAll('.palette-opt')).indexOf(o));
    });
    list.addEventListener('mousemove', (e) => {
        const o = e.target.closest('.palette-opt');
        if (!o) return;
        const i = Array.from(list.querySelectorAll('.palette-opt')).indexOf(o);
        if (i !== active) setActive(i, false);
    });
    if (backdrop) backdrop.addEventListener('click', () => close());

    // Capture phase so Esc/shortcuts here win over Piko's own document handler
    window.addEventListener('keydown', (e) => {
        const key = e.key;
        if ((e.metaKey || e.ctrlKey) && !e.altKey && key.toLowerCase() === 'k') {
            e.preventDefault(); e.stopPropagation();
            isOpen() ? close() : open();
            return;
        }
        if (!isOpen()) {
            const t = e.target;
            const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
            if (key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !typing) { e.preventDefault(); open(); }
            return;
        }
        if (key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
        else if (key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
        else if (key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
        else if (key === 'Enter') { e.preventDefault(); choose(active); }
        else if (key === 'Tab') { e.preventDefault(); input.focus(); } // focus trap: input is the only tab stop
    }, true);
})();


// ===== WRITING ROW — LinkedIn posts load only on click =====
(function initWritingRow() {
    document.querySelectorAll('.post-card').forEach(card => {
        const btn = card.querySelector('.post-load');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const src = card.dataset.embed;
            if (!src || card.classList.contains('is-loaded')) return;
            const wrap = document.createElement('div');
            wrap.className = 'post-embed';
            const f = document.createElement('iframe');
            f.src = src;
            f.title = 'Embedded LinkedIn post';
            f.loading = 'lazy';
            f.setAttribute('allowfullscreen', '');
            wrap.appendChild(f);
            card.insertBefore(wrap, card.querySelector('.post-actions'));
            card.classList.add('is-loaded');
        });
    });
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

    let progRaf = 0;
    window.addEventListener('scroll', () => { if (!progRaf) progRaf = requestAnimationFrame(() => { progRaf = 0; updateProgress(); }); }, { passive: true });
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
            here.style.left = (now.x + (flip ? -16 : 26)) + 'px';
            here.style.top = (now.y + (desktop.matches ? 12 : -46)) + 'px';
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


// ===== TRAIL FX — card spotlight + one-time metric count-up (pointer / motion permitting) =====
(function initTrailFx() {
    const ol = document.getElementById('trail');
    if (!ol) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hover = window.matchMedia('(hover: hover)');

    let fxRaf = 0, fxEv = null;
    ol.addEventListener('pointermove', (e) => {
        if (!hover.matches || reduced.matches || e.pointerType === 'touch') return;
        const card = e.target.closest && e.target.closest('.stop-card');
        if (!card) return;
        fxEv = { card, x: e.clientX, y: e.clientY };
        if (fxRaf) return;
        fxRaf = requestAnimationFrame(() => {
            fxRaf = 0;
            const r = fxEv.card.getBoundingClientRect();
            fxEv.card.style.setProperty('--mx', (fxEv.x - r.left).toFixed(0) + 'px');
            fxEv.card.style.setProperty('--my', (fxEv.y - r.top).toFixed(0) + 'px');
        });
    }, { passive: true });

    // Final numbers live in the HTML; JS only replays them from 0 once, when allowed.
    const nums = Array.from(ol.querySelectorAll('.metric-num[data-count]'));
    if (!nums.length || reduced.matches || !('IntersectionObserver' in window)) return;
    const fmt = (el, v) => {
        const dec = +(el.dataset.dec || 0);
        return (el.dataset.prefix || '') + v.toFixed(dec) + (el.dataset.suffix || '');
    };
    nums.forEach(el => { el.textContent = fmt(el, 0); });
    const cards = new Set(nums.map(n => n.closest('.stop-card')).filter(Boolean));
    let cardsLeft = cards.size;
    const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
            if (!en.isIntersecting) return;
            const card = en.target;
            io.unobserve(card);
            if (--cardsLeft <= 0) io.disconnect();
            card.querySelectorAll('.metric-num[data-count]').forEach((el) => {
                const to = parseFloat(el.dataset.count), t0 = performance.now(), dur = 900;
                (function tick(now) {
                    const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
                    el.textContent = fmt(el, to * e);
                    if (k < 1) requestAnimationFrame(tick); else el.textContent = fmt(el, to);
                })(t0);
            });
        });
    }, { threshold: 0.35 });
    cards.forEach(c => io.observe(c));
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

    // Programmatic API for the command palette
    window.pikoChat = { open: openChat, ask(text) { openChat(); handleQuery(text); } };

    // Initial welcome
    addMsg("Hi! I'm **Piko**, Ashish's desk pet 🌱 Ask me about his work, AI stack, or tap a topic below.", 'bot');
})();


// ===== SECTION POLISH (P4) =====

// Hero: entrance, rotating role phrase, scroll cue
(function initHero() {
    const hero = document.getElementById('profile');
    const rotor = document.getElementById('hero-rotor');
    if (!hero) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Entrance (once). The class is added by JS so content is never hidden if JS fails.
    if (!reduce.matches) {
        hero.querySelectorAll('[data-hero-item]').forEach((el, i) => el.style.setProperty('--i', i));
        hero.classList.add('hero-anim');
        requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('hero-in')));
        setTimeout(() => hero.classList.remove('hero-anim', 'hero-in'), 2600);
    }

    // Rotating phrase
    if (rotor) {
        const PHRASES = ['agentic AI products', 'RAG pipelines', 'MCP integrations', 'full-stack web apps'];
        const sizer = rotor.querySelector('.hero-rotor-sizer');
        const role = rotor.closest('.hero-role');
        let idx = 0, timer = null, paused = false;
        const measure = (text) => { sizer.textContent = text; return sizer.getBoundingClientRect().width; };
        const fit = () => { rotor.style.width = Math.ceil(measure(PHRASES[idx])) + 'px'; };
        fit();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { rotor.style.transition = 'none'; fit(); void rotor.offsetWidth; rotor.style.transition = ''; });
        window.addEventListener('resize', fit);

        const step = () => {
            const old = rotor.querySelector('.hero-rotor-word:not(.is-out)');
            idx = (idx + 1) % PHRASES.length;
            const next = document.createElement('span');
            next.className = 'hero-rotor-word accent is-in';
            next.textContent = PHRASES[idx];
            old.classList.add('is-out');
            rotor.appendChild(next);
            rotor.style.width = Math.ceil(measure(PHRASES[idx])) + 'px';
            setTimeout(() => { old.remove(); next.classList.remove('is-in'); }, 520);
        };
        const stop = () => { clearInterval(timer); timer = null; };
        const start = () => { if (!timer && !paused && !document.hidden && !reduce.matches) timer = setInterval(step, 2600); };
        const setPaused = (v) => { paused = v; v ? stop() : start(); };
        role.addEventListener('mouseenter', () => setPaused(true));
        role.addEventListener('mouseleave', () => setPaused(false));
        hero.addEventListener('focusin', (e) => { if (role.contains(e.target)) setPaused(true); });
        hero.addEventListener('focusout', () => setPaused(false));
        document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
        reduce.addEventListener && reduce.addEventListener('change', () => (reduce.matches ? stop() : start()));
        start();
    }

    // Scroll cue
    const cue = hero.querySelector('.scroll-cue');
    if (cue) cue.addEventListener('click', (e) => { e.preventDefault(); scrollToSection('about'); });
})();

// Hero + contact: copy email, back to top
(function initQuickActions() {
    ['hero-copy-email', 'contact-copy-email', 'channel-copy-email'].forEach((id) => {
        const b = document.getElementById(id);
        if (b) b.addEventListener('click', () => copyEmail());
    });
    const top = document.getElementById('back-to-top');
    if (top) top.addEventListener('click', () => scrollToSection('profile'));
})();

// Cursor spotlight on cards (pointer devices only)
(function initCardFx() {
    const hover = window.matchMedia('(hover: hover)');
    let raf = 0, ev = null;
    document.addEventListener('pointermove', (e) => {
        if (!hover.matches || prefersReducedMotion() || e.pointerType === 'touch') return;
        const card = e.target.closest && e.target.closest('.xp-card, .project-card, .rec-card');
        if (!card) return;
        ev = { card, x: e.clientX, y: e.clientY };
        if (raf) return;
        raf = requestAnimationFrame(() => {
            raf = 0;
            const r = ev.card.getBoundingClientRect();
            ev.card.style.setProperty('--mx', (ev.x - r.left).toFixed(0) + 'px');
            ev.card.style.setProperty('--my', (ev.y - r.top).toFixed(0) + 'px');
        });
    }, { passive: true });
})();

// Experience: show / hide details
(function initExperience() {
    document.querySelectorAll('.xp-toggle').forEach((btn) => {
        btn.addEventListener('click', () => {
            const open = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!open));
            btn.firstElementChild.textContent = open ? 'Show details' : 'Hide details';
            const panel = document.getElementById(btn.getAttribute('aria-controls'));
            if (panel) panel.hidden = open;
        });
    });
})();

// Shared: dots synced to a horizontal scroll-snap track
function bindSnapDots(track, dotsWrap, itemSel) {
    if (!track || !dotsWrap) return;
    const items = Array.from(track.querySelectorAll(itemSel));
    const dots = Array.from(dotsWrap.querySelectorAll('button'));
    let raf = 0;
    const pad = () => parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    function mark(i) {
        dots.forEach((d, k) => {
            d.classList.toggle('active', k === i);
            if (k === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
        });
    }
    function sync() {
        raf = 0;
        if (track.scrollWidth <= track.clientWidth + 1) return;
        const max = track.scrollWidth - track.clientWidth;
        if (track.scrollLeft >= max - 4) return mark(items.length - 1);
        let best = 0, bd = Infinity;
        items.forEach((it, i) => { const d = Math.abs(it.offsetLeft - pad() - track.scrollLeft); if (d < bd) { bd = d; best = i; } });
        mark(best);
    }
    track.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(sync); }, { passive: true });
    dots.forEach((d, i) => d.addEventListener('click', () => {
        track.scrollTo({ left: items[i].offsetLeft - pad(), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }));
    window.addEventListener('resize', sync);
    sync();
}

// Projects: 2-line clamp with "More", snap dots on mobile
(function initProjects() {
    const track = document.getElementById('projects-track');
    if (!track) return;
    const descs = Array.from(track.querySelectorAll('.project-desc'));
    function measure() {
        descs.forEach((p) => {
            const btn = track.querySelector('.project-more[aria-controls="' + p.id + '"]');
            if (!btn) return;
            if (p.classList.contains('is-open')) { btn.hidden = false; return; }
            btn.hidden = !(p.scrollHeight > p.clientHeight + 1);
        });
    }
    track.addEventListener('click', (e) => {
        const btn = e.target.closest('.project-more');
        if (!btn) return;
        const p = document.getElementById(btn.getAttribute('aria-controls'));
        const open = p.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(open));
        btn.textContent = open ? 'Less' : 'More';
    });
    window.addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    measure();
    bindSnapDots(track, document.getElementById('project-dots'), '.project-card');
})();

// ===== TECH STACK — filters + "where I used it" popover =====
const STACK_CONTEXTS = {
    pratham:  { label: 'Pratham',                  target: 'stop-4' },
    metacube: { label: 'Metacube',                 target: 'stop-2' },
    mcp:      { label: 'MCP Server project',       target: 'proj-mcp' },
    rgm:      { label: 'RGM tool',                 target: 'proj-rgm' },
    face:     { label: 'Face Recognition project', target: 'proj-face' },
    iot:      { label: 'IoT project',              target: 'proj-iot' },
    ai102:    { label: 'AI-102 certification',     target: 'stop-3' }
};
// Only techs with evidence on this page (Experience bullets, trail cards, project tags, certification).
const STACK_USAGE = {
    claude:     ['pratham', 'mcp'],
    openai:     ['pratham', 'metacube'],
    gemini:     ['pratham', 'metacube'],
    mcp:        ['pratham', 'mcp'],
    rag:        ['pratham', 'metacube', 'mcp'],
    vector:     ['mcp'],
    react:      ['pratham', 'metacube', 'rgm'],
    redux:      ['metacube', 'rgm'],
    mui:        ['metacube', 'rgm'],
    python:     ['pratham', 'mcp', 'face', 'iot'],
    fastapi:    ['pratham', 'metacube', 'rgm'],
    django:     ['face'],
    postgresql: ['metacube', 'rgm'],
    graphql:    ['metacube'],
    jenkins:    ['metacube'],
    rabbitmq:   ['metacube'],
    azure:      ['ai102']
};
const STACK_CATS = { ai: 'AI & GenAI', frontend: 'Frontend & UI', backend: 'Backend & databases', cloud: 'DevOps & cloud' };

// Scroll to a trail stop / project card and pulse it briefly
function goToContext(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const card = el.querySelector('.stop-card') || el;
    const reduced = prefersReducedMotion();
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center', inline: 'center' });
    if (reduced) return;
    setTimeout(() => {
        card.classList.remove('is-pulse');
        void card.offsetWidth;
        card.classList.add('is-pulse');
        setTimeout(() => card.classList.remove('is-pulse'), 1250);
    }, 450);
}

(function initStack() {
    const body = document.getElementById('stack-body');
    const pop = document.getElementById('tech-pop');
    const tabs = Array.from(document.querySelectorAll('.stack-tab'));
    if (!body || !pop) return;
    const cells = Array.from(body.querySelectorAll('.tech-item'));
    const coreWrap = document.getElementById('stack-core-wrap');
    const sheetMq = window.matchMedia('(max-width: 768px), (hover: none)');
    const isSheet = () => sheetMq.matches;

    // Counts + filter
    tabs.forEach((t) => {
        const f = t.dataset.filter;
        const n = f === 'all' ? cells.length : cells.filter(c => c.dataset.cat === f).length;
        const out = t.querySelector('.stack-count');
        if (out) out.textContent = n;
    });
    function applyFilter(f) {
        closePop(false);
        const swap = () => {
            cells.forEach((c) => { c.hidden = f !== 'all' && c.dataset.cat !== f; });
            if (coreWrap) coreWrap.hidden = !cells.some(c => c.closest('.stack-core') && !c.hidden);
            body.classList.remove('is-filtering');
        };
        if (prefersReducedMotion()) return swap();
        body.classList.add('is-filtering');
        setTimeout(swap, 140);
    }
    tabs.forEach((t) => t.addEventListener('click', () => {
        tabs.forEach(o => o.setAttribute('aria-pressed', String(o === t)));
        applyFilter(t.dataset.filter);
    }));

    // Popover
    let active = null, pinned = false, closeT = 0, quiet = false;
    const esc = (v) => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    function render(cell) {
        const key = cell.dataset.tech;
        const name = cell.querySelector('.tech-label').textContent;
        const used = STACK_USAGE[key] || [];
        pop.innerHTML =
            `<h3 class="pop-name">${esc(name)}</h3><p class="pop-cat">${esc(STACK_CATS[cell.dataset.cat] || '')}</p>` +
            (used.length
                ? `<p class="pop-label">Used at</p><ul class="pop-chips">${used.map(k =>
                    `<li><a class="pop-chip" href="#${STACK_CONTEXTS[k].target}" data-target="${STACK_CONTEXTS[k].target}">${esc(STACK_CONTEXTS[k].label)}</a></li>`).join('')}</ul>`
                : '<p class="pop-none">Not tied to a role or project on this page.</p>') +
            '<button class="pop-close" type="button" aria-label="Close"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
        return name;
    }
    function place(cell) {
        const sheet = pop.classList.contains('is-sheet');
        if (sheet) { pop.style.left = pop.style.top = ''; return; }
        const r = cell.getBoundingClientRect();
        const w = pop.offsetWidth, h = pop.offsetHeight;
        let left = r.left + r.width / 2 - w / 2;
        left = Math.max(12, Math.min(left, document.documentElement.clientWidth - w - 12));
        let top = r.bottom + 8;
        if (r.bottom + h + 16 > window.innerHeight && r.top > h + 16) top = r.top - h - 8;
        pop.style.left = (left + window.scrollX) + 'px';
        pop.style.top = (top + window.scrollY) + 'px';
    }
    function related(cell) {
        const mine = STACK_USAGE[cell.dataset.tech] || [];
        return new Set(cells.filter(c => c !== cell && !c.hidden && (STACK_USAGE[c.dataset.tech] || []).some(k => mine.includes(k))));
    }
    function openPop(cell, pin) {
        clearTimeout(closeT);
        if (active && active !== cell) active.classList.remove('is-active');
        active = cell;
        pinned = !!pin || isSheet();
        const name = render(cell);
        const sheet = isSheet();
        pop.classList.toggle('is-sheet', sheet);
        pop.hidden = false;
        pop.setAttribute('role', pinned ? 'dialog' : 'tooltip');
        if (pinned) pop.setAttribute('aria-label', name); else pop.removeAttribute('aria-label');
        place(cell);
        const rel = related(cell);
        cells.forEach((c) => { c.classList.toggle('is-active', c === cell); c.classList.toggle('is-related', rel.has(c)); });
        body.classList.toggle('has-focus', (STACK_USAGE[cell.dataset.tech] || []).length > 0);
    }
    function closePop(restoreFocus) {
        clearTimeout(closeT);
        const was = active;
        active = null; pinned = false;
        pop.hidden = true;
        body.classList.remove('has-focus');
        cells.forEach(c => c.classList.remove('is-active', 'is-related'));
        if (restoreFocus && was) { quiet = true; was.querySelector('.tech-btn').focus(); quiet = false; }
    }
    const softClose = () => { clearTimeout(closeT); closeT = setTimeout(() => { if (!pinned) closePop(false); }, 140); };

    cells.forEach((cell) => {
        const btn = cell.querySelector('.tech-btn');
        cell.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && !isSheet() && !pinned) openPop(cell, false); });
        cell.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !pinned) softClose(); });
        btn.addEventListener('focus', () => { if (!quiet && !isSheet() && !pinned && btn.matches(':focus-visible')) openPop(cell, false); });
        btn.addEventListener('blur', () => setTimeout(() => {
            if (!pinned && active === cell && !pop.contains(document.activeElement)) closePop(false);
        }, 0));
        btn.addEventListener('click', (e) => {
            if (active === cell && pinned) return closePop(true);
            openPop(cell, true);
            if (e.detail === 0) { const first = pop.querySelector('.pop-chip') || pop.querySelector('.pop-close'); if (first) first.focus(); }
        });
    });
    pop.addEventListener('pointerenter', () => clearTimeout(closeT));
    pop.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !pinned) softClose(); });
    pop.addEventListener('click', (e) => {
        if (e.target.closest('.pop-close')) return closePop(true);
        const chip = e.target.closest('.pop-chip');
        if (!chip) return;
        e.preventDefault();
        const target = chip.dataset.target;
        closePop(false);
        goToContext(target);
    });
    pop.addEventListener('focusout', (e) => {
        if (pinned && !pop.contains(e.relatedTarget) && !(active && active.contains(e.relatedTarget))) closePop(false);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && active) { e.stopPropagation(); closePop(true); } }, true);
    document.addEventListener('pointerdown', (e) => {
        if (active && pinned && !pop.contains(e.target) && !active.contains(e.target)) closePop(false);
    });
    window.addEventListener('resize', () => { if (active) closePop(false); });
})();

// ===== RECOMMENDATIONS — wall + reader (no auto-advance) =====
(function initRecommendations() {
    const wall = document.getElementById('rec-wall');
    const root = document.getElementById('rec-reader');
    if (!wall || !root) return;
    const cards = Array.from(wall.querySelectorAll('.rec-card'));
    const box = document.getElementById('reader-box');
    const person = document.getElementById('reader-person');
    const bodyEl = document.getElementById('reader-body');
    const pos = document.getElementById('reader-pos');
    let idx = 0, trigger = null;

    // Summary from the real relationship lines
    const sum = document.getElementById('rec-summary');
    const managed = cards.filter(c => c.dataset.rel === 'managed').length;
    if (sum) sum.textContent = `${cards.length} recommendations · ${managed} managed Ashish directly`;

    function show(i) {
        idx = (i + cards.length) % cards.length;
        const c = cards[idx];
        person.innerHTML = c.querySelector('.li-rec-header').innerHTML;
        const img = person.querySelector('img'); if (img) img.removeAttribute('loading');
        bodyEl.innerHTML = c.querySelector('.rec-full').innerHTML;
        bodyEl.scrollTop = 0;
        pos.textContent = `${idx + 1} of ${cards.length}`;
        const nm = c.querySelector('.li-name');
        box.setAttribute('aria-label', 'Recommendation from ' + (nm ? nm.textContent : ''));
    }
    function open(i, from) {
        trigger = from || null;
        show(i);
        root.classList.add('open');
        root.setAttribute('aria-hidden', 'false');
        document.body.classList.add('reader-open');
        box.focus();
    }
    function close() {
        root.classList.remove('open');
        root.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('reader-open');
        if (trigger) trigger.focus();
        trigger = null;
    }
    wall.addEventListener('click', (e) => {
        const b = e.target.closest('.rec-more');
        if (b) open(+b.dataset.rec, b);
    });
    document.getElementById('reader-close').addEventListener('click', close);
    document.getElementById('reader-backdrop').addEventListener('click', close);
    document.getElementById('reader-prev').addEventListener('click', () => show(idx - 1));
    document.getElementById('reader-next').addEventListener('click', () => show(idx + 1));
    document.addEventListener('keydown', (e) => {
        if (!root.classList.contains('open')) return;
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
        else if (e.key === 'Tab') trapTab(e, box);
    }, true);

    bindSnapDots(wall, document.getElementById('rec-dots'), '.rec-card');
})();

// ===== CONTACT — compose a mailto (nothing leaves the page except through the user's mail app) =====
(function initCompose() {
    const send = document.getElementById('compose-send');
    const msg = document.getElementById('compose-msg');
    if (!send || !msg) return;
    function composeMailto() {
        const sel = document.querySelector('#compose input[name="reason"]:checked');
        const reason = sel ? sel.value : 'Hello';
        const subject = 'Hello Ashish: ' + reason;
        const text = msg.value.trim();
        const body = (text ? text : 'Hi Ashish,') + '\n';
        return 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    }
    window.__composeMailto = composeMailto;
    send.addEventListener('click', () => { window.location.href = composeMailto(); });
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
    const logo = n.logo ? `<img class="stop-logo" src="${esc(n.logo)}" alt="" width="28" height="28" loading="lazy" decoding="async">` : '';

    // Hero pill
    const pillText = joined ? `Now at ${n.company}`
            : hasCo ? `Serving notice · joining ${n.company} ${shortDate}`
            : `Serving notice · next chapter starts ${shortDate}`;
    document.querySelectorAll('[data-nc="hero-pill-text"], [data-nc="contact-pill-text"]').forEach(el => { el.textContent = pillText; });

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
            <h3 class="stop-title">Serving notice</h3><p class="stop-sum">Wrapping up handovers</p>
            <div class="now-bar" aria-hidden="true"><span>Handover in progress</span><i></i></div></div>`;
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
