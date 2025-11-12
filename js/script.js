// Language switching functionality
const ABOUT_FALLBACK = {
    en: [
        "Jr. Game & Narrative Designer focused on creating meaningful player experiences through story, structure, and emotion. I approach design as a dialogue between gameplay and narrative — where every mechanic, choice, and detail serves the story. My work explores how interactive systems can express feeling, consequence, and human complexity.",
        "I've worked on small independent projects exploring different genres — from mystery and suspense to romance — always with the goal of making players feel something real. My work and collaborations explore emotion, player choice, craft characters that feel alive and world-building through small but meaningful projects developed with engines like Unity, Godot, and Twine. I'm constantly learning, experimenting, and refining my craft, creating experiences where story and gameplay truly connect."
    ],
    es: [
        "Jr. Game & Narrative Designer enfocado en crear experiencias significativas para los jugadores a través de la historia, la estructura y la emoción. Abordo el diseño como un diálogo entre el gameplay y la narrativa — donde cada mecánica, decisión y detalle sirve a la historia. Mi trabajo explora cómo los sistemas interactivos pueden expresar sentimientos, consecuencias y la complejidad humana.",
        "He trabajado en pequeños proyectos independientes explorando diferentes géneros — del misterio y el suspense al romance — siempre con el objetivo de hacer sentir algo real a quien juega. Mi trabajo y colaboraciones exploran la emoción, las decisiones del jugador, crear personajes que se sienten vivos y la construcción de mundos a través de proyectos pequeños pero significativos desarrollados con motores como Unity, Godot y Twine. Estoy constantemente aprendiendo, experimentando y refinando mi oficio, creando experiencias donde la historia y el gameplay realmente se conectan."
    ]
};

class LanguageManager {
    constructor() {
        this.currentLang = 'en';
        this.projectDataCache = {};
        this.aboutContent = null;
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
            await this.populateAboutSection(lang);
            await this.populateProjectCards(lang);
        } catch (error) {
            console.warn('Failed to load external content:', error);
            this.applyAboutFallback(lang);
        }
    }
    async getProjectData(projectId) {
        if (this.projectDataCache[projectId]) {
            return this.projectDataCache[projectId];
        }

        try {
            const cacheBust = `v=${Date.now()}`;
            const response = await fetch(`content/${projectId}.json?${cacheBust}`, { cache: 'no-store' });
            if (response.ok) {
                const data = await response.json();
                this.projectDataCache[projectId] = data;
                return data;
            }
        } catch (error) {
            console.warn(`Failed to load content for project ${projectId}:`, error);
        }

        return null;
    }

    async populateProjectCards(lang) {
        const projectCards = document.querySelectorAll('.project-card[data-project]');

        for (const card of projectCards) {
            const projectId = card.getAttribute('data-project');
            const projectInfo = await this.getProjectData(projectId);

            if (!projectInfo) continue;

            const titleElement = card.querySelector('.project-title');
            const genreElement = card.querySelector('.project-genre');
            const descriptionElement = card.querySelector('.project-description');

            if (titleElement && projectInfo.title?.[lang]) {
                titleElement.textContent = projectInfo.title[lang];
            }
            if (genreElement && projectInfo.genre?.[lang]) {
                genreElement.textContent = projectInfo.genre[lang];
            }
            if (descriptionElement && projectInfo.description?.[lang]) {
                descriptionElement.textContent = projectInfo.description[lang];
            }

            // Update overlay links if provided in JSON
            const linkEn = projectInfo.link?.en || '';
            const linkEs = projectInfo.link?.es || '';
            const enAnchor = card.querySelector('.project-overlay .project-link.en-link');
            const esAnchor = card.querySelector('.project-overlay .project-link.es-link');
            const singleAnchor = card.querySelector('.project-overlay .project-link:not(.en-link):not(.es-link)');

            if (enAnchor || esAnchor) {
                if (enAnchor && (linkEn || linkEs)) {
                    enAnchor.href = linkEn || linkEs;
                }
                if (esAnchor && (linkEs || linkEn)) {
                    esAnchor.href = linkEs || linkEn;
                }
            } else if (singleAnchor) {
                if (linkEn || linkEs) {
                    singleAnchor.href = linkEn || linkEs;
                }
            }
        }
    }

    async populateAboutSection(lang) {
        if (!this.aboutContent) {
            try {
                const cacheBust = `v=${Date.now()}`;
                const aboutResponse = await fetch(`content/about.json?${cacheBust}`, { cache: 'no-store' });
                if (aboutResponse.ok) {
                    this.aboutContent = await aboutResponse.json();
                }
            } catch (error) {
                console.warn('Failed to load about content:', error);
            }
        }

        const paragraphs = this.aboutContent?.paragraphs?.[lang];
        if (paragraphs && paragraphs.length) {
            this.setAboutParagraphs(paragraphs);
        } else {
            this.applyAboutFallback(lang);
        }
    }

    setAboutParagraphs(paragraphs = []) {
        const [first = '', second = ''] = paragraphs;
        const paragraph1 = document.getElementById('about-paragraph-1');
        const paragraph2 = document.getElementById('about-paragraph-2');

        if (paragraph1 && first) {
            paragraph1.textContent = first;
        }
        if (paragraph2 && second) {
            paragraph2.textContent = second;
        }
    }

    applyAboutFallback(lang) {
        const fallbackParagraphs = ABOUT_FALLBACK[lang];
        if (fallbackParagraphs) {
            this.setAboutParagraphs(fallbackParagraphs);
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
