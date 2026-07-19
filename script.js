/* ============================================================
   Raviteja Sunkavalli — Portfolio interactions
   - Typed hero command
   - Count-up stats on scroll into view
   - Infinite marquee (content duplication)
   - Scroll reveals, nav state, mobile menu
   ============================================================ */

(function () {
    'use strict';

    document.documentElement.classList.add('js');

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Rotating hero roles ---------- */
    var roleText = document.getElementById('roleText');
    var roleCursor = document.getElementById('roleCursor');

    var roles = [
        'Enterprise Technologist',
        'Trusted Advisor',
        'AI/ML Observability Specialist',
        'DevOps & Platform Engineering',
        'Site Reliability Engineering',
        'Solutions Architecture',
        'Go-to-Market Strategist'
    ];

    if (roleText) {
        if (prefersReducedMotion) {
            roleText.textContent = 'Enterprise Technologist \u00B7 Trusted Advisor';
            if (roleCursor) roleCursor.hidden = true;
        } else {
            var roleIndex = 0;
            var charPos = roles[0].length; /* first role already rendered */
            var deleting = true;

            var roleTick = function () {
                var current = roles[roleIndex];

                if (deleting) {
                    charPos -= 1;
                    roleText.textContent = current.slice(0, charPos);
                    if (charPos === 0) {
                        deleting = false;
                        roleIndex = (roleIndex + 1) % roles.length;
                        setTimeout(roleTick, 350);
                    } else {
                        setTimeout(roleTick, 32);
                    }
                } else {
                    current = roles[roleIndex];
                    charPos += 1;
                    roleText.textContent = current.slice(0, charPos);
                    if (charPos === current.length) {
                        deleting = true;
                        setTimeout(roleTick, 2200); /* hold the finished role */
                    } else {
                        setTimeout(roleTick, 55);
                    }
                }
            };

            setTimeout(roleTick, 2200); /* hold the initial role before rotating */
        }
    }

    /* ---------- Marquee: duplicate track content for seamless loop ---------- */
    document.querySelectorAll('.marquee-track').forEach(function (track) {
        track.innerHTML += track.innerHTML;
    });

    /* ---------- Count-up animation (adapted from 21st.dev Count Animation) ---------- */
    var DURATION = 2000;
    var easeOutQuart = function (t) { return 1 - Math.pow(1 - t, 4); };

    function formatValue(value, decimals) {
        if (decimals > 0) return value.toFixed(decimals);
        return Math.round(value).toLocaleString('en-US');
    }

    function animateCount(el) {
        var target = parseFloat(el.dataset.count);
        var prefix = el.dataset.prefix || '';
        var suffix = el.dataset.suffix || '';
        var decimals = parseInt(el.dataset.decimals || '0', 10);

        if (prefersReducedMotion) {
            el.textContent = prefix + formatValue(target, decimals) + suffix;
            return;
        }

        var start = null;
        function step(timestamp) {
            if (!start) start = timestamp;
            var progress = Math.min((timestamp - start) / DURATION, 1);
            var current = target * easeOutQuart(progress);
            el.textContent = prefix + formatValue(current, decimals) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                countObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    document.querySelectorAll('[data-count]').forEach(function (el) {
        countObserver.observe(el);
    });

    /* ---------- Scroll reveal ---------- */
    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var el = entry.target;
                el.classList.add('is-in');
                revealObserver.unobserve(el);
                /* Once the entrance transition completes, drop the reveal
                   classes so their transform no longer overrides card
                   hover pop-out effects. */
                setTimeout(function () {
                    el.classList.remove('reveal', 'is-in');
                }, 750);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
        revealObserver.observe(el);
    });

    /* ---------- Navbar scroll state ---------- */
    var navbar = document.getElementById('navbar');
    var scrollTopBtn = document.getElementById('scrollTop');
    var lastScrollY = window.scrollY;

    function onScroll() {
        var y = window.scrollY;
        navbar.classList.toggle('is-scrolled', y > 24);
        scrollTopBtn.classList.toggle('is-visible', y > 600);

        /* Hide nav when scrolling down, reveal when scrolling up */
        var delta = y - lastScrollY;
        var menuOpen = navMenu && navMenu.classList.contains('is-open');
        if (delta > 4 && y > 140 && !menuOpen) {
            navbar.classList.add('is-hidden');
        } else if (delta < -4 || y <= 140) {
            navbar.classList.remove('is-hidden');
        }
        lastScrollY = y;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    scrollTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });

    /* ---------- Active nav link ---------- */
    var sections = document.querySelectorAll('section[id], header[id]');
    var navLinks = document.querySelectorAll('.nav-link');

    var sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var id = entry.target.getAttribute('id');
                navLinks.forEach(function (link) {
                    var href = link.getAttribute('href');
                    var isHome = link.hasAttribute('data-home');
                    link.classList.toggle('is-active', href === '#' + id || (isHome && id === 'hero'));
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(function (section) { sectionObserver.observe(section); });

    /* Home links: scroll to top with a clean URL (no #fragment, no reload) */
    document.querySelectorAll('[data-home]').forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            history.pushState(null, '', window.location.pathname);
        });
    });

    /* ---------- Theme toggle ---------- */
    var themeToggle = document.getElementById('themeToggle');

    themeToggle.addEventListener('click', function () {
        var isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    /* ---------- Mobile menu ---------- */
    var menuToggle = document.getElementById('menuToggle');
    var navMenu = document.getElementById('navMenu');

    menuToggle.addEventListener('click', function () {
        var isOpen = navMenu.classList.toggle('is-open');
        menuToggle.classList.toggle('is-open', isOpen);
        navbar.classList.toggle('menu-open', isOpen);
        menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navMenu.addEventListener('click', function (event) {
        if (event.target.classList.contains('nav-link')) {
            navMenu.classList.remove('is-open');
            menuToggle.classList.remove('is-open');
            navbar.classList.remove('menu-open');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });

    /* ---------- Search ---------- */
    var searchBtn = document.getElementById('searchBtn');
    var searchOverlay = document.getElementById('searchOverlay');
    var searchInput = document.getElementById('searchInput');
    var searchResults = document.getElementById('searchResults');
    var searchEmpty = document.getElementById('searchEmpty');

    /* Build a search index from page content */
    var searchIndex = [];

    function indexCards(selector, tag, titleSelector, linkSelector) {
        document.querySelectorAll(selector).forEach(function (card) {
            var titleEl = card.querySelector(titleSelector);
            if (!titleEl) return;
            var linkEl = linkSelector ? card.querySelector(linkSelector) : null;
            var href = null;
            if (linkEl) href = linkEl.getAttribute('href');
            else if (card.tagName === 'A') href = card.getAttribute('href');
            searchIndex.push({
                tag: tag,
                title: titleEl.textContent.trim(),
                text: card.textContent.toLowerCase(),
                href: href,
                el: card
            });
        });
    }

    indexCards('#speaking .event-card', 'TALK', 'h3', '.text-link');
    indexCards('#blogs .blog-card', 'BLOG', 'h3', '.text-link');
    indexCards('#work-samples .sample-card', 'WORK', 'h3', null);
    indexCards('#credentials .cred-card', 'CRED', 'h4', null);
    indexCards('#skills .skill-card', 'SKILL', 'h3', null);

    var selectedIndex = -1;
    var currentResults = [];

    function openSearch() {
        searchOverlay.classList.add('is-open');
        searchOverlay.setAttribute('aria-hidden', 'false');
        searchInput.value = '';
        renderResults([]);
        setTimeout(function () { searchInput.focus(); }, 80);
    }

    function closeSearch() {
        searchOverlay.classList.remove('is-open');
        searchOverlay.setAttribute('aria-hidden', 'true');
        selectedIndex = -1;
    }

    function goToResult(item) {
        closeSearch();
        if (item.href && item.href.indexOf('http') === 0) {
            window.open(item.href, '_blank', 'noopener');
        } else {
            item.el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
        }
    }

    function renderResults(items) {
        currentResults = items;
        selectedIndex = -1;
        searchResults.innerHTML = '';

        if (!searchInput.value.trim()) {
            searchEmpty.textContent = 'Start typing to search across all content';
            searchResults.appendChild(searchEmpty);
            return;
        }

        if (items.length === 0) {
            searchEmpty.textContent = 'No results found';
            searchResults.appendChild(searchEmpty);
            return;
        }

        items.forEach(function (item, i) {
            var btn = document.createElement('button');
            btn.className = 'search-result';
            btn.type = 'button';
            btn.innerHTML = '<span class="search-result-tag">' + item.tag + '</span>' +
                '<span class="search-result-title"></span>';
            btn.querySelector('.search-result-title').textContent = item.title;
            btn.addEventListener('click', function () { goToResult(item); });
            btn.addEventListener('mousemove', function () { setSelected(i); });
            searchResults.appendChild(btn);
        });
    }

    function setSelected(i) {
        selectedIndex = i;
        searchResults.querySelectorAll('.search-result').forEach(function (el, idx) {
            el.classList.toggle('is-selected', idx === i);
        });
    }

    searchInput.addEventListener('input', function () {
        var q = searchInput.value.trim().toLowerCase();
        if (!q) { renderResults([]); return; }
        var matches = searchIndex.filter(function (item) {
            return item.text.indexOf(q) !== -1;
        }).slice(0, 10);
        renderResults(matches);
    });

    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (currentResults.length) setSelected(Math.min(selectedIndex + 1, currentResults.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (currentResults.length) setSelected(Math.max(selectedIndex - 1, 0));
        } else if (event.key === 'Enter' && selectedIndex >= 0) {
            event.preventDefault();
            goToResult(currentResults[selectedIndex]);
        }
    });

    searchBtn.addEventListener('click', openSearch);

    searchOverlay.addEventListener('click', function (event) {
        if (event.target === searchOverlay) closeSearch();
    });

    document.addEventListener('keydown', function (event) {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            searchOverlay.classList.contains('is-open') ? closeSearch() : openSearch();
        } else if (event.key === 'Escape' && searchOverlay.classList.contains('is-open')) {
            closeSearch();
        }
    });
})();
