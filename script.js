// Page Navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-section').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.querySelector(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === pageId) {
            link.classList.add('active');
        }
    });
}

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Save theme preference
    const theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
});

// Navigation link clicks
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const pageId = this.getAttribute('href');
        showPage(pageId);
        
        // Update URL hash without scrolling
        history.pushState(null, null, pageId);
    });
});

// Handle browser back/forward
window.addEventListener('popstate', function() {
    const hash = window.location.hash || '#about';
    showPage(hash);
});

// Show initial page based on URL hash
document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash || '#about';
    showPage(hash);
});

// Smooth scroll for navigation links (legacy support)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    if (!anchor.classList.contains('nav-link')) {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
});

// Image Slider for Event Cards
class ImageSlider {
    constructor(card) {
        this.card = card;
        this.images = card.querySelectorAll('.event-image');
        this.dotsContainer = card.querySelector('.slider-dots');
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        
        if (this.images.length > 1) {
            this.createDots();
            this.startAutoPlay();
            this.addEventListeners();
        } else {
            // Hide dots container if only one image or no images
            if (this.dotsContainer) {
                this.dotsContainer.style.display = 'none';
            }
        }
    }
    
    createDots() {
        this.images.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'slider-dot';
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(index));
            this.dotsContainer.appendChild(dot);
        });
    }
    
    goToSlide(index) {
        this.images[this.currentIndex].classList.remove('active');
        const dots = this.dotsContainer.querySelectorAll('.slider-dot');
        dots[this.currentIndex].classList.remove('active');
        
        this.currentIndex = index;
        
        this.images[this.currentIndex].classList.add('active');
        dots[this.currentIndex].classList.add('active');
    }
    
    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.images.length;
        this.goToSlide(nextIndex);
    }
    
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 4000); // Change slide every 4 seconds
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }
    
    addEventListeners() {
        // Pause on hover
        this.card.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.card.addEventListener('mouseleave', () => this.startAutoPlay());
    }
}

// Initialize all image sliders
document.addEventListener('DOMContentLoaded', () => {
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach(card => {
        if (card.querySelector('.image-slider')) {
            new ImageSlider(card);
        }
    });
    
    // Show initial page
    const hash = window.location.hash || '#about';
    showPage(hash);
});

// Add active state to navigation on scroll - Disabled for page-based navigation
// const sections = document.querySelectorAll('section[id]');
// const navLinks = document.querySelectorAll('.nav-menu a');

// function updateActiveNav() {
//     const scrollPosition = window.scrollY + 100;

//     sections.forEach(section => {
//         const sectionTop = section.offsetTop;
//         const sectionHeight = section.offsetHeight;
//         const sectionId = section.getAttribute('id');

//         if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
//             navLinks.forEach(link => {
//                 link.classList.remove('active');
//                 if (link.getAttribute('href') === `#${sectionId}`) {
//                     link.classList.add('active');
//                 }
//             });
//         }
//     });
// }

// window.addEventListener('scroll', updateActiveNav);

// Add fade-in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.event-card, .blog-card, .responsibility-list li, .expertise-card, .stat-card, .award-card, .education-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Mobile menu toggle - Initialize after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        // Main toggle handler
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = navMenu.classList.contains('active');
            
            if (isActive) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            } else {
                navMenu.classList.add('active');
                menuToggle.classList.add('active');
            }
        }, true);

        // Close menu when clicking a nav link
        const navLinks = document.querySelectorAll('.nav-menu .nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                const clickedToggle = menuToggle.contains(e.target);
                const clickedMenu = navMenu.contains(e.target);
                
                if (!clickedToggle && !clickedMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            });
        }, 200);
    }
});

// Add scroll-to-top button
const createScrollToTop = () => {
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '↑';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
};

// Initialize scroll to top button
document.addEventListener('DOMContentLoaded', createScrollToTop);
