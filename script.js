/* =========================================
   SAI GANGA GRANITES & MINERALS
   JavaScript — Interactivity & Animations
   ========================================= */

// =============================================
// PRODUCT DATA
// =============================================
const products = [
    {
        name: "Black Pearl Granite",
        origin: "Prakasam, Andhra Pradesh",
        tag: "Premium",
        category: "black",
        desc: "A striking deep black granite with a lustrous pearl-like finish — ideal for flooring, countertops, and wall cladding in premium spaces.",
        specs: ["Polish", "Leather Finish", "Lepothra Finish", "Antique Finish", "Flaming Finish", "Hand Polish", "Brush Hammering Finish"],
        price: "₹110–₹170/sqft",
        style: "background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #080808 100%)"
    },
    {
        name: "Steel Grey Granite",
        origin: "Prakasam, Andhra Pradesh",
        tag: "Classic",
        category: "grey",
        desc: "Consistent steel-grey tone with subtle mica sparkles — widely used for exterior cladding, large-format flooring, and monuments.",
        specs: ["Polish", "Leather Finish", "Lepothra Finish", "Antique Finish", "Flaming Finish", "Hand Polish", "Brush Hammering Finish"],
        price: "₹75–₹130/sqft",
        style: "background: linear-gradient(135deg, #5a5a5a 0%, #808080 50%, #6a6a6a 100%)"
    },
    {
        name: "Nadendla Brown Granite",
        origin: "Prakasam, Andhra Pradesh",
        tag: "Local Pride",
        category: "brown",
        desc: "A rich warm-brown granite quarried locally in the Prakasam district — known for its earthy tones and excellent durability for construction.",
        specs: ["Polished", "Flamed", "Leathered"],
        price: "₹70–₹120/sqft",
        style: "background: linear-gradient(135deg, #5a3520 0%, #8b5a35 50%, #6a3d20 100%)"
    },
    {
        name: "Tiger Black Granite",
        origin: "Prakasam, Andhra Pradesh",
        tag: "Exclusive",
        category: "exotic",
        desc: "A rare and distinctive granite variety with unique natural patterns — prized for feature walls, statement floors, and bespoke architectural designs.",
        specs: ["Lepothra Finish", "Leather Finish"],
        price: "₹130–₹200/sqft",
        style: "background: linear-gradient(135deg, #2a2a3a 0%, #4a3a5a 50%, #352a45 100%)"
    }
];

// =============================================
// ADMIN OVERRIDES (set via admin panel)
// Prices fetched from Google Sheets on every load
// so ALL visitors see the latest admin-set prices
// =============================================

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwuyCrENFE3YxKBsBDz_Bm0tfpmwpz47JREXP8F4xh1JQb_liQMIBr9pQuHCyVImm4X/exec';

async function applyAdminOverrides() {
    // --- Prices from Google Sheets (with localStorage fallback) ---
    let prices = null;
    try {
        const res = await fetch(APPS_SCRIPT_URL + '?action=getSettings');
        const data = await res.json();
        if (data.status === 'success' && data.settings && data.settings.prices) {
            prices = data.settings.prices;
            localStorage.setItem('sgg_prices', JSON.stringify(prices)); // cache locally
        }
    } catch (e) {
        // offline — use cached localStorage value
    }

    if (!prices) {
        prices = JSON.parse(localStorage.getItem('sgg_prices') || '{}');
    }

    const priceMap = {
        0: prices.bp,  // Black Pearl
        1: prices.sg,  // Steel Grey
        2: prices.nb,  // Nadendla Brown
        3: prices.tb   // Tiger Black
    };
    Object.entries(priceMap).forEach(([idx, p]) => {
        if (p && p.min && p.max) {
            products[idx].price = `₹${p.min}–₹${p.max}/sqft`;
        }
    });

    // --- Contact info overrides (localStorage only) ---
    const savedContact = JSON.parse(localStorage.getItem('sgg_contact') || '{}');
    if (Object.keys(savedContact).length > 0) {
        if (savedContact.phone1) {
            document.querySelectorAll('a[href^="tel:"]').forEach(a => {
                if (a.textContent.includes('94406 98103')) {
                    a.href = `tel:${savedContact.phone1.replace(/[^+\d]/g, '')}`;
                    a.textContent = savedContact.phone1;
                }
            });
        }
        if (savedContact.phone2) {
            document.querySelectorAll('a[href^="tel:"]').forEach(a => {
                if (a.textContent.includes('99635 51074') || a.textContent.includes('99635 51073')) {
                    a.href = `tel:${savedContact.phone2.replace(/[^+\d]/g, '')}`;
                    a.textContent = savedContact.phone2;
                }
            });
        }
        if (savedContact.address) {
            document.querySelectorAll('.contact-info-item, .footer-contact-list li').forEach(el => {
                if (el.textContent.includes('Uppumaguluru') || el.textContent.includes('Prakasam')) {
                    const icon = el.querySelector('i');
                    el.textContent = savedContact.address;
                    if (icon) el.prepend(icon);
                }
            });
        }
    }
}

// Run overrides then signal products are ready
let pricesReady = false;
applyAdminOverrides().finally(() => {
    pricesReady = true;
    document.dispatchEvent(new Event('pricesReady'));
});


// =============================================
// PRELOADER
// =============================================
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.style.overflow = '';
    }, 2200);
});
document.body.style.overflow = 'hidden';

// =============================================
// NAVBAR
// =============================================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const navLinkItems = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    updateActiveNavLink();
    handleBackToTop();
    handleStickyAnimations();
});

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
    });
});

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });
    navLinkItems.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// =============================================
// SMOOTH SCROLLING
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// =============================================
// HERO PARTICLES
// =============================================
const heroParticles = document.getElementById('heroParticles');
function createParticles() {
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('hero-particle');
        const size = Math.random() * 4 + 1;
        particle.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * 10}s;
      opacity: ${Math.random() * 0.5 + 0.1};
    `;
        heroParticles.appendChild(particle);
    }
}
createParticles();

// =============================================
// COUNTER ANIMATION
// =============================================
let countersAnimated = false;
function animateCounters() {
    if (countersAnimated) return;
    const heroStats = document.querySelector('.hero-stats');
    if (!heroStats) return;
    const rect = heroStats.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
        countersAnimated = true;
        document.querySelectorAll('.stat-number').forEach(counter => {
            if (!counter.hasAttribute('data-target')) return;
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.textContent = Math.floor(current);
            }, 16);
        });
    }
}

// =============================================
// PRODUCTS
// =============================================
const productsGrid = document.getElementById('productsGrid');
let activeFilter = 'all';

function renderProducts(filter = 'all') {
    const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
    productsGrid.innerHTML = '';
    filtered.forEach((product, i) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animationDelay = `${i * 0.08}s`;
        card.innerHTML = `
      <div class="product-image">
        <div class="product-granite" style="${product.style}"></div>
        <span class="product-tag">${product.tag}</span>
      </div>
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-origin"><i class="fas fa-map-marker-alt"></i> ${product.origin}</div>
        <p class="product-desc">${product.desc}</p>
        <div class="product-specs">${product.specs.map(s => `<span class="spec-badge">${s}</span>`).join('')}</div>
        <div class="product-footer">
          <div>
            <span class="product-price-label">Starting from</span>
            <div class="product-price">${product.price}</div>
          </div>
          <button class="product-btn" onclick="scrollToContact('${product.name}')">Get Quote</button>
        </div>
      </div>
    `;
        productsGrid.appendChild(card);
    });
}

function scrollToContact(productName) {
    document.getElementById('product').value = productName;
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeFilter = this.getAttribute('data-filter');
        renderProducts(activeFilter);
    });
});

// Wait for prices to load from Google Sheets before rendering cards
if (pricesReady) {
    renderProducts();
} else {
    document.addEventListener('pricesReady', () => renderProducts(), { once: true });
}

// =============================================
// TESTIMONIALS CAROUSEL
// =============================================
const track = document.getElementById('testimonialsTrack');
const cards = document.querySelectorAll('.testimonial-card');
const dotsContainer = document.getElementById('carouselDots');
let currentSlide = 0;
let slidesPerView = window.innerWidth >= 768 ? 2 : 1;
const totalSlides = cards.length;
const maxSlide = totalSlides - slidesPerView;
let autoSlideInterval;

function createDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i <= maxSlide; i++) {
        const dot = document.createElement('div');
        dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
}

function goToSlide(index) {
    currentSlide = Math.max(0, Math.min(index, maxSlide));
    const cardWidth = cards[0].offsetWidth + 28;
    track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
    });
}

function nextSlide() {
    goToSlide(currentSlide >= maxSlide ? 0 : currentSlide + 1);
}
function prevSlide() {
    goToSlide(currentSlide <= 0 ? maxSlide : currentSlide - 1);
}

document.getElementById('nextBtn').addEventListener('click', () => { nextSlide(); resetAutoSlide(); });
document.getElementById('prevBtn').addEventListener('click', () => { prevSlide(); resetAutoSlide(); });

function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 4000);
}
function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

createDots();
startAutoSlide();

window.addEventListener('resize', () => {
    slidesPerView = window.innerWidth >= 768 ? 2 : 1;
    createDots();
    goToSlide(0);
});

// =============================================
// CONTACT FORM → GOOGLE SHEETS
// =============================================
// STEP: Paste your Google Apps Script Web App URL below after setup
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwuyCrENFE3YxKBsBDz_Bm0tfpmwpz47JREXP8F4xh1JQb_liQMIBr9pQuHCyVImm4X/exec';

const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        product: document.getElementById('product').value,
        message: document.getElementById('message').value,
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    try {
        if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            await fetch(GOOGLE_SHEET_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        }
        btn.innerHTML = '<span>Send Enquiry</span><i class="fas fa-paper-plane"></i>';
        btn.disabled = false;
        formSuccess.classList.add('show');
        contactForm.reset();
        setTimeout(() => formSuccess.classList.remove('show'), 5000);
    } catch (error) {
        btn.innerHTML = '<span>Send Enquiry</span><i class="fas fa-paper-plane"></i>';
        btn.disabled = false;
        alert('Something went wrong. Please call us directly at +91 94406 98103');
    }
});

// =============================================
// BACK TO TOP
// =============================================
const backToTop = document.getElementById('backToTop');
function handleBackToTop() {
    if (window.scrollY > 400) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
}
backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// =============================================
// AOS (Animate On Scroll — custom lightweight)
// =============================================
function handleStickyAnimations() {
    document.querySelectorAll('[data-aos]').forEach(el => {
        const rect = el.getBoundingClientRect();
        const delay = parseFloat(el.getAttribute('data-delay') || 0);
        if (rect.top < window.innerHeight - 80) {
            setTimeout(() => {
                el.classList.add('aos-animated');
            }, delay);
        }
    });
    animateCounters();
}

// Trigger once on load
setTimeout(handleStickyAnimations, 300);
window.addEventListener('scroll', handleStickyAnimations);

// =============================================
// GRANITE DISPLAY SHIMMER
// =============================================
document.querySelectorAll('.granite-surface').forEach(el => {
    el.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        this.style.background = this.style.background;
    });
});
