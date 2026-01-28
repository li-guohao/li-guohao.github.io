// ============================================
// Personal .io Website JavaScript
// Interactive Effects & Functionality
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initLoadingScreen();
    initParticles();
    initTypingAnimation();
    initNavigation();
    initSkillBars();
    initScrollAnimations();
    initBackToTop();
    initCursorTrail();
    initContactForm();
    initCounterAnimation();
});

// ============================================
// Loading Screen
// ============================================
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading');
    
    // Hide loading screen after content loads
    window.addEventListener('load', function() {
        setTimeout(function() {
            loadingScreen.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }, 1500);
    });
}

// ============================================
// Particle Background
// ============================================
function initParticles() {
    // Check if particles.js is loaded
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFD93D']
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    }
                },
                opacity: {
                    value: 0.5,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#4ECDC4',
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1.5,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'repulse'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    repulse: {
                        distance: 100,
                        duration: 0.4
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        });
    }
}

// ============================================
// Typing Animation
// ============================================
function initTypingAnimation() {
    const typingElement = document.querySelector('.typing-text');
    const phrases = [
        'AI & Machine Learning Engineer',
        'Quantitative Finance Researcher',
        'Creative Technology Explorer',
        'Python Developer'
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;
    
    function type() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }
        
        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500; // Pause before next phrase
        }
        
        setTimeout(type, typeSpeed);
    }
    
    // Start typing animation
    setTimeout(type, 1000);
}

// ============================================
// Navigation
// ============================================
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Scroll effect for navbar
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking a link
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    
    function highlightNavLink() {
        const scrollY = window.pageYOffset;
        
        sections.forEach(function(section) {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector('.nav-link[href*="' + sectionId + '"]');
            
            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(function(link) {
                        link.classList.remove('active');
                    });
                    navLink.classList.add('active');
                }
            }
        });
    }
    
    window.addEventListener('scroll', highlightNavLink);
}

// ============================================
// Skill Bars Animation (Faster - 20 iterations, 15ms)
// ============================================
function initSkillBars() {
    const skillItems = document.querySelectorAll('.skill-item');
    const animatedItems = new Set();
    
    function animateSkillBars() {
        skillItems.forEach(function(item) {
            if (animatedItems.has(item)) return;
            
            const skillProgress = item.querySelector('.skill-progress');
            const skillPercent = item.querySelector('.skill-percent');
            const targetSkill = parseInt(item.getAttribute('data-skill'));
            const rect = item.getBoundingClientRect();
            
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                animatedItems.add(item);
                
                // Animate progress bar with CSS transition
                skillProgress.style.transition = 'width 0.6s ease-out';
                skillProgress.style.width = targetSkill + '%';
                
                // Animate percentage counter - faster (20 iterations, 15ms = 300ms total)
                let currentPercent = 0;
                const increment = targetSkill / 20;
                const counter = setInterval(function() {
                    currentPercent += increment;
                    if (currentPercent >= targetSkill) {
                        currentPercent = targetSkill;
                        clearInterval(counter);
                    }
                    skillPercent.textContent = Math.round(currentPercent) + '%';
                }, 15);
            }
        });
    }
    
    // Initial check and scroll listener
    window.addEventListener('scroll', animateSkillBars);
    animateSkillBars(); // Check on load
}

// ============================================
// Scroll Animations
// ============================================
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    fadeElements.forEach(function(element) {
        observer.observe(element);
    });
}

// ============================================
// Back to Top Button
// ============================================
function initBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// Cursor Trail Effect
// ============================================
function initCursorTrail() {
    const cursorTrail = document.querySelector('.cursor-trail');
    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorTrail.classList.add('active');
    });
    
    document.addEventListener('mouseleave', function() {
        cursorTrail.classList.remove('active');
    });
    
    // Smooth trail movement
    function animateTrail() {
        trailX += (mouseX - trailX) * 0.1;
        trailY += (mouseY - trailY) * 0.1;
        
        cursorTrail.style.left = trailX - 10 + 'px';
        cursorTrail.style.top = trailY - 10 + 'px';
        
        requestAnimationFrame(animateTrail);
    }
    
    animateTrail();
}

// ============================================
// Contact Form
// ============================================
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        // Simple validation
        if (!name || !email || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email', 'error');
            return;
        }
        
        // Simulate form submission
        const submitBtn = contactForm.querySelector('.btn-submit');
        submitBtn.innerHTML = '<span>Sending...</span> <i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;
        
        setTimeout(function() {
            showNotification('Message sent successfully!', 'success');
            contactForm.reset();
            submitBtn.innerHTML = '<span>Send Message</span> <i class="fas fa-paper-plane"></i>';
            submitBtn.disabled = false;
        }, 2000);
    });
    
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification ' + type;
        notification.innerHTML = '<i class="fas fa-' + (type === 'success' ? 'check-circle' : 'exclamation-circle') + '"></i> <span>' + message + '</span>';
        notification.style.cssText = 'position: fixed; top: 100px; right: 30px; padding: 15px 25px; border-radius: 8px; display: flex; align-items: center; gap: 10px; z-index: 10000; animation: slideIn 0.3s ease;';
        
        if (type === 'success') {
            notification.style.background = '#4ECDC4';
            notification.style.color = '#1a1a2e';
        } else {
            notification.style.background = '#FF6B6B';
            notification.style.color = '#ffffff';
        }
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(function() {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(function() {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// ============================================
// Counter Animation (Fixed - no -1 bug)
// ============================================
function initCounterAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number');
    const animatedCounters = new Set();
    
    function animateCounters() {
        statNumbers.forEach(function(stat) {
            if (animatedCounters.has(stat)) return;
            
            const target = parseInt(stat.getAttribute('data-target'));
            const rect = stat.getBoundingClientRect();
            
            // Check if element is in viewport
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                animatedCounters.add(stat);
                
                // Animate counter - faster (25 iterations, 20ms = 500ms total)
                let current = 0;
                const increment = target / 25;
                const counter = setInterval(function() {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(counter);
                    }
                    stat.textContent = Math.round(current).toLocaleString();
                }, 20);
            }
        });
    }
    
    window.addEventListener('scroll', animateCounters);
    animateCounters();
}

// ============================================
// Smooth Scroll for Anchor Links
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// Add CSS animations dynamically
// ============================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// Parallax Effect for Floating Cards
// ============================================
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const floatingCards = document.querySelector('.floating-cards');
    
    if (floatingCards && scrolled < window.innerHeight) {
        floatingCards.style.transform = 'translateY(' + (scrolled * 0.3) + 'px)';
    }
});

// ============================================
// Tilt Effect for Cards
// ============================================
document.querySelectorAll('.project-card, .skills-category').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
});

console.log('🚀 Personal .io Website loaded successfully!');
console.log('👋 Welcome to li-guohao.github.io');
