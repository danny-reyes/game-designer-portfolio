// Language switching functionality
class LanguageManager {
    constructor() {
        this.currentLang = 'en';
        this.init();
    }

    init() {
        this.bindEvents();
        this.setLanguage('en');
    }

    bindEvents() {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.id.split('-')[1];
                this.setLanguage(lang);
            });
        });
    }

    setLanguage(lang) {
        this.currentLang = lang;
        
        // Update active button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.id === `lang-${lang}`) {
                btn.classList.add('active');
            }
        });

        // Update text content
        const elements = document.querySelectorAll('[data-en][data-es]');
        elements.forEach(element => {
            const text = element.getAttribute(`data-${lang}`);
            if (text) {
                element.textContent = text;
            }
        });

        // Load external content
        this.loadExternalContent(lang);

        // Store preference
        localStorage.setItem('preferred-language', lang);
    }

    async loadExternalContent(lang) {
        try {
            // Load About section content
            const aboutResponse = await fetch(`content/about-${lang}.txt`);
            if (aboutResponse.ok) {
                const text = await aboutResponse.text();
                const paragraphs = text.split('\n\n');
                
                const paragraph1 = document.getElementById('about-paragraph-1');
                const paragraph2 = document.getElementById('about-paragraph-2');
                
                if (paragraph1 && paragraphs[0]) {
                    paragraph1.textContent = paragraphs[0];
                }
                if (paragraph2 && paragraphs[1]) {
                    paragraph2.textContent = paragraphs[1];
                }
            }

            // Load project descriptions
            const projectDescriptions = document.querySelectorAll('.project-description[data-project]');
            for (const desc of projectDescriptions) {
                const projectId = desc.getAttribute('data-project');
                try {
                    const projectResponse = await fetch(`content/${projectId}-${lang}.txt`);
                    if (projectResponse.ok) {
                        const projectText = await projectResponse.text();
                        desc.textContent = projectText;
                    }
                } catch (projectError) {
                    console.warn(`Failed to load content for project ${projectId}:`, projectError);
                }
            }
        } catch (error) {
            console.warn('Failed to load external content:', error);
            // Fallback to inline content if available
            const paragraph1 = document.getElementById('about-paragraph-1');
            const paragraph2 = document.getElementById('about-paragraph-2');
            if (paragraph1 && paragraph1.textContent === 'Loading...') {
                paragraph1.textContent = lang === 'en' 
                    ? "Jr. Game & Narrative Designer focused on creating meaningful player experiences through story, structure, and emotion."
                    : "Jr. Game & Narrative Designer enfocado en crear experiencias significativas para los jugadores a través de la historia, la estructura y la emoción.";
            }
            if (paragraph2 && paragraph2.textContent === 'Loading...') {
                paragraph2.textContent = lang === 'en' 
                    ? "I've worked on small independent projects exploring different genres — always with the goal of making players feel something real."
                    : "He trabajado en pequeños proyectos independientes explorando diferentes géneros — siempre con el objetivo de hacer sentir algo real a quien juega.";
            }
        }
    }
}

// Tab-based navigation manager
class NavigationManager {
    constructor() {
        this.currentSection = 'interactive-fictions';
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupIntersectionObserver();
        // Set initial active section
        this.switchToSection('interactive-fictions');
    }

    bindEvents() {
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const section = tab.getAttribute('data-section');
                this.switchToSection(section);
            });
        });
    }

    switchToSection(sectionId) {
        // Remove active class from all tabs and sections
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Add active class to current tab and section
        const activeTab = document.querySelector(`[data-section="${sectionId}"]`);
        const activeSection = document.getElementById(sectionId);

        if (activeTab && activeSection) {
            activeTab.classList.add('active');
            activeSection.classList.add('active');
            this.currentSection = sectionId;

            // Animate section content
            this.animateContent(activeSection);

            // Update URL hash
            history.replaceState(null, null, `#${sectionId}`);
        }
    }

    animateContent(section) {
        // All animations are now handled by CSS when .active class is added
        // No JavaScript animation interference
    }

    setupIntersectionObserver() {
        // Intersection observer removed - animations handled by CSS only
    }
}

// Initialize managers
let languageManager;
let navigationManager;

document.addEventListener('DOMContentLoaded', () => {
    languageManager = new LanguageManager();
    navigationManager = new NavigationManager();

    // Load preferred language
    const savedLang = localStorage.getItem('preferred-language') || 'en';
    languageManager.setLanguage(savedLang);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) return;
        
        const tabs = document.querySelectorAll('.nav-tab');
        const currentIndex = Array.from(tabs).findIndex(tab => tab.classList.contains('active'));
        let targetIndex;

        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            targetIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            targetIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        } else if (e.key >= '1' && e.key <= '5') {
            e.preventDefault();
            const num = parseInt(e.key) - 1;
            if (num < tabs.length) {
                targetIndex = num;
            }
        }
        
        if (targetIndex !== undefined) {
            tabs[targetIndex].click();
        }
    });

    // Handle hash navigation
    if (window.location.hash) {
        const sectionId = window.location.hash.substring(1);
        setTimeout(() => {
            navigationManager.switchToSection(sectionId);
        }, 100);
    }
});

// Add loading state
window.addEventListener('load', () => {
    document.body.classList.add('fully-loaded');
    
    // Trigger animations for visible elements
    const visibleElements = document.querySelectorAll('.project-card, .about-content, .contact-content');
    visibleElements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('fade-in');
        }, index * 100);
    });
});

// Fiverr icon hover functionality
document.addEventListener('DOMContentLoaded', () => {
    const fiverrIcons = document.querySelectorAll('.fiverr-icon, .fiverr-contact-icon');
    
    fiverrIcons.forEach(icon => {
        const link = icon.closest('a');
        
        link.addEventListener('mouseenter', () => {
            icon.src = 'icons/fiverr-white.svg';
        });
        
        link.addEventListener('mouseleave', () => {
            icon.src = 'icons/fiverr-black.svg';
        });
    });
});

// Export for potential external use
window.LanguageManager = LanguageManager;
window.NavigationManager = NavigationManager;