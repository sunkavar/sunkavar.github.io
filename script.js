// ============================================
// Neural Network Canvas Animation
// ============================================
const canvas = document.getElementById('neuralCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createParticles() {
    particles = [];
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 18000), 80);
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 2 + 1,
        });
    }
}

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDark = document.body.classList.contains('dark-mode');
    const dotColor = isDark ? 'rgba(99,102,241,' : 'rgba(99,102,241,';
    const lineColor = isDark ? 'rgba(99,102,241,' : 'rgba(148,163,184,';

    particles.forEach((p, i) => {
        // Move
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = dotColor + '0.5)';
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
            const dx = p.x - particles[j].x;
            const dy = p.y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = lineColor + (0.15 * (1 - dist / 150)) + ')';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    });

    animationId = requestAnimationFrame(drawParticles);
}

resizeCanvas();
createParticles();
drawParticles();

window.addEventListener('resize', () => {
    resizeCanvas();
    createParticles();
});

// Pause animation when tab is not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cancelAnimationFrame(animationId);
    } else {
        drawParticles();
    }
});

// ============================================
// Theme Toggle
// ============================================
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
});

// ============================================
// Navbar scroll effect
// ============================================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ============================================
// Active nav link on scroll
// ============================================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNav() {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        if (scrollY >= top && scrollY < top + height) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + id) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);
updateActiveNav();

// ============================================
// Mobile menu
// ============================================
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu on link click
navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// ============================================
// Scroll to top
// ============================================
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================================
// Scroll reveal animations
// ============================================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll(
        '.event-card, .blog-card, .focus-card, .credential-card, .contact-card, .about-text p'
    );
    revealElements.forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });
});

// ============================================
// Smooth scroll for anchor links
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = navbar.offsetHeight + 20;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

// ============================================
// Search
// ============================================
(() => {
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');
    const emptyState = document.getElementById('searchEmpty');
    const searchBtn = document.getElementById('searchBtn');

    // Build search index from page content
    function buildIndex() {
        const items = [];

        // Speaking events
        document.querySelectorAll('#speaking .event-card').forEach(card => {
            const title = card.querySelector('.event-title')?.textContent || '';
            const desc = card.querySelector('.event-desc')?.textContent || '';
            const venue = card.querySelector('.event-venue')?.textContent || '';
            const date = card.querySelector('.event-date')?.textContent || '';
            const tags = Array.from(card.querySelectorAll('.tag')).map(t => t.textContent).join(' ');
            const link = card.querySelector('.event-link');
            items.push({
                type: 'speaking',
                icon: '🎤',
                title,
                meta: `${venue} · ${date}`,
                searchText: `${title} ${desc} ${venue} ${date} ${tags}`.toLowerCase(),
                url: link?.href || null,
                section: 'speaking',
            });
        });

        // Blog posts
        document.querySelectorAll('#writing .blog-card').forEach(card => {
            const title = card.querySelector('.blog-title')?.textContent || '';
            const excerpt = card.querySelector('.blog-excerpt')?.textContent || '';
            const date = card.querySelector('.blog-date')?.textContent || '';
            const link = card.querySelector('.blog-link');
            items.push({
                type: 'writing',
                icon: '📝',
                title,
                meta: date,
                searchText: `${title} ${excerpt} ${date}`.toLowerCase(),
                url: link?.href || null,
                section: 'writing',
            });
        });

        // Credentials
        document.querySelectorAll('#credentials .credential-card').forEach(card => {
            const title = card.querySelector('h4')?.textContent || '';
            const issuer = card.querySelector('.credential-issuer')?.textContent || '';
            const desc = card.querySelector('p')?.textContent || '';
            items.push({
                type: 'credentials',
                icon: '🏅',
                title,
                meta: issuer,
                searchText: `${title} ${issuer} ${desc}`.toLowerCase(),
                url: null,
                section: 'credentials',
            });
        });

        return items;
    }

    const searchIndex = buildIndex();

    function highlightMatch(text, query) {
        if (!query) return text;
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    function renderResults(query) {
        const q = query.trim().toLowerCase();

        if (!q) {
            resultsContainer.innerHTML = '';
            resultsContainer.appendChild(emptyState);
            emptyState.style.display = '';
            return;
        }

        const matches = searchIndex.filter(item => item.searchText.includes(q));

        if (matches.length === 0) {
            resultsContainer.innerHTML = '<div class="search-no-results">No results found for "' + query.replace(/</g, '&lt;') + '"</div>';
            return;
        }

        // Group by type
        const groups = {};
        const groupLabels = { speaking: 'Speaking Events', writing: 'Blog Posts', credentials: 'Credentials' };
        matches.forEach(m => {
            if (!groups[m.type]) groups[m.type] = [];
            groups[m.type].push(m);
        });

        let html = '';
        for (const [type, items] of Object.entries(groups)) {
            html += `<div class="search-group-label">${groupLabels[type] || type}</div>`;
            items.forEach(item => {
                const tag = item.url ? 'a' : 'div';
                const href = item.url ? ` href="${item.url}" target="_blank" rel="noopener"` : '';
                const sectionAttr = !item.url ? ` data-section="${item.section}"` : '';
                html += `<${tag} class="search-result-item"${href}${sectionAttr}>
                    <div class="search-result-icon">${item.icon}</div>
                    <div class="search-result-content">
                        <div class="search-result-title">${highlightMatch(item.title, query)}</div>
                        <div class="search-result-meta">${item.meta}</div>
                    </div>
                    <svg class="search-result-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </${tag}>`;
            });
        }

        resultsContainer.innerHTML = html;

        // Add click handlers for non-link items to scroll to section
        resultsContainer.querySelectorAll('[data-section]').forEach(el => {
            el.addEventListener('click', () => {
                closeSearch();
                const section = document.getElementById(el.dataset.section);
                if (section) {
                    const offset = navbar.offsetHeight + 20;
                    const top = section.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            });
        });
    }

    function openSearch() {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => input.focus(), 50);
    }

    function closeSearch() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        input.value = '';
        renderResults('');
    }

    // Event listeners
    searchBtn.addEventListener('click', openSearch);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeSearch();
    });

    input.addEventListener('input', () => renderResults(input.value));

    document.addEventListener('keydown', (e) => {
        // ⌘K or Ctrl+K to open
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            if (overlay.classList.contains('active')) {
                closeSearch();
            } else {
                openSearch();
            }
        }
        // Escape to close
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeSearch();
        }
    });
})();


// ============================================
// Dashboard Sparkline Charts (Hero Section)
// ============================================
function drawDashSparklines() {
    document.querySelectorAll('.dash-sparkline').forEach(el => {
        const raw = el.dataset.values;
        if (!raw) return;
        const values = raw.split(',').map(Number);
        const max = Math.max(...values);
        const min = Math.min(...values);
        const range = max - min || 1;
        const width = el.offsetWidth;
        const height = 24;

        if (width === 0) return;

        // Clear previous
        el.innerHTML = '';

        const canvas = document.createElement('canvas');
        canvas.width = width * 2;
        canvas.height = height * 2;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        el.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);

        const step = width / (values.length - 1);
        const points = values.map((v, i) => ({
            x: i * step,
            y: height - ((v - min) / range) * (height - 4) - 2
        }));

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const cp1x = points[i-1].x + step * 0.4;
            const cp1y = points[i-1].y;
            const cp2x = points[i].x - step * 0.4;
            const cp2y = points[i].y;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i].x, points[i].y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const cp1x = points[i-1].x + step * 0.4;
            const cp1y = points[i-1].y;
            const cp2x = points[i].x - step * 0.4;
            const cp2y = points[i].y;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i].x, points[i].y);
        }
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // End dot
        const last = points[points.length - 1];
        ctx.beginPath();
        ctx.arc(last.x, last.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#a78bfa';
        ctx.fill();
    });
}

// Draw after layout settles
setTimeout(drawDashSparklines, 200);
window.addEventListener('resize', () => {
    clearTimeout(window._sparkResize);
    window._sparkResize = setTimeout(drawDashSparklines, 150);
});
