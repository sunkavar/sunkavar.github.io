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

    /* ---------- Connected-dots particle network (hero background) ----------
       Adapted from 21st.dev SynapseBackground: drifting particles that link
       when close, plus a subtle cursor "grab" effect. 2D canvas, no deps. */
    var particleCanvas = document.getElementById('particleCanvas');

    if (particleCanvas && !prefersReducedMotion) {
        (function () {
            var ctx = particleCanvas.getContext('2d');
            var hero = particleCanvas.parentElement;
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            var particles = [];
            var w = 0, h = 0;
            var LINK_DIST = 130;
            var MOUSE_DIST = 170;
            var mouse = { x: -9999, y: -9999 };
            var running = true;

            function themeColors() {
                var dark = document.documentElement.classList.contains('dark');
                return dark
                    ? { dot: '242, 242, 242', line: '242, 242, 242', dotAlpha: 0.4, lineAlpha: 0.14 }
                    : { dot: '100, 116, 139', line: '100, 116, 139', dotAlpha: 0.45, lineAlpha: 0.16 };
            }

            function resize() {
                w = hero.offsetWidth;
                h = hero.offsetHeight;
                particleCanvas.width = w * dpr;
                particleCanvas.height = h * dpr;
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

                /* Density-based count, capped for performance */
                var target = Math.min(90, Math.round((w * h) / 16000));
                particles = [];
                for (var i = 0; i < target; i++) {
                    particles.push({
                        x: Math.random() * w,
                        y: Math.random() * h,
                        vx: (Math.random() - 0.5) * 0.45,
                        vy: (Math.random() - 0.5) * 0.45,
                        r: 1.2 + Math.random() * 1.6
                    });
                }
            }

            function step() {
                if (!running) return;
                ctx.clearRect(0, 0, w, h);
                var c = themeColors();
                var i, j, p, q, dx, dy, d;

                for (i = 0; i < particles.length; i++) {
                    p = particles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x < 0 || p.x > w) p.vx *= -1;
                    if (p.y < 0 || p.y > h) p.vy *= -1;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(' + c.dot + ',' + c.dotAlpha + ')';
                    ctx.fill();
                }

                for (i = 0; i < particles.length; i++) {
                    p = particles[i];
                    for (j = i + 1; j < particles.length; j++) {
                        q = particles[j];
                        dx = p.x - q.x;
                        dy = p.y - q.y;
                        d = Math.sqrt(dx * dx + dy * dy);
                        if (d < LINK_DIST) {
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(q.x, q.y);
                            ctx.strokeStyle = 'rgba(' + c.line + ',' + (c.lineAlpha * (1 - d / LINK_DIST)) + ')';
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                    }

                    /* Cursor grab lines */
                    dx = p.x - mouse.x;
                    dy = p.y - mouse.y;
                    d = Math.sqrt(dx * dx + dy * dy);
                    if (d < MOUSE_DIST) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = 'rgba(' + c.line + ',' + (0.25 * (1 - d / MOUSE_DIST)) + ')';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }

                requestAnimationFrame(step);
            }

            hero.addEventListener('mousemove', function (event) {
                var rect = particleCanvas.getBoundingClientRect();
                mouse.x = event.clientX - rect.left;
                mouse.y = event.clientY - rect.top;
            });

            hero.addEventListener('mouseleave', function () {
                mouse.x = -9999;
                mouse.y = -9999;
            });

            /* Pause when the hero scrolls out of view */
            new IntersectionObserver(function (entries) {
                var visible = entries[0].isIntersecting;
                if (visible && !running) {
                    running = true;
                    requestAnimationFrame(step);
                } else if (!visible) {
                    running = false;
                }
            }).observe(hero);

            var resizeTimer;
            window.addEventListener('resize', function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(resize, 150);
            });

            resize();
            requestAnimationFrame(step);
        })();
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

    /* ---------- Blog vertical scroll window (6 visible on desktop) ---------- */
    var blogWindow = document.getElementById('blogWindow');

    if (blogWindow) {
        var blogPrev = document.getElementById('blogPrev');
        var blogNext = document.getElementById('blogNext');
        var blogProgress = document.getElementById('blogProgress');
        var blogCountEl = document.getElementById('blogCount');
        var blogCards = blogWindow.querySelectorAll('.blog-card');
        var BLOG_GAP = 18;

        if (blogCountEl) {
            blogCountEl.textContent = blogCards.length + ' ARTICLES';
        }

        var blogCols = function () {
            return getComputedStyle(blogWindow).gridTemplateColumns.split(' ').length;
        };

        /* Height of one row + gap = the scroll step */
        var blogRowStep = function () {
            var cols = blogCols();
            if (blogCards.length > cols) {
                return blogCards[cols].offsetTop - blogCards[0].offsetTop;
            }
            return blogWindow.clientHeight;
        };

        var updateBlogState = function () {
            var max = blogWindow.scrollHeight - blogWindow.clientHeight;
            var y = blogWindow.scrollTop;
            blogPrev.disabled = y <= 4;
            blogNext.disabled = y >= max - 4;
            if (blogProgress) {
                blogProgress.style.width = (max > 0 ? (y / max) * 100 : 100) + '%';
            }
        };

        /* Size the window to show exactly 2 rows. On touch/mobile widths the
           grid renders in full (no nested scroll area), so skip sizing. */
        var sizeBlogWindow = function () {
            blogWindow.style.height = '';

            if (window.innerWidth <= 768) {
                blogWindow.removeAttribute('tabindex');
                return;
            }

            blogWindow.setAttribute('tabindex', '0');
            var cols = blogCols();
            var firstHidden = cols * 2;

            if (blogCards.length > firstHidden) {
                var inner = blogCards[firstHidden].offsetTop - blogCards[0].offsetTop - BLOG_GAP;
                blogWindow.style.height = (inner + 8) + 'px'; /* + top/bottom padding */
            }
            updateBlogState();
        };

        blogPrev.addEventListener('click', function () {
            blogWindow.scrollBy({ top: -blogRowStep(), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });

        blogNext.addEventListener('click', function () {
            blogWindow.scrollBy({ top: blogRowStep(), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });

        blogWindow.addEventListener('scroll', updateBlogState, { passive: true });

        var blogResizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(blogResizeTimer);
            blogResizeTimer = setTimeout(sizeBlogWindow, 150);
        });

        sizeBlogWindow();
        /* Re-measure once fonts settle so row heights are exact */
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(sizeBlogWindow);
        }
    }

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
