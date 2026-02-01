class DarkModeManager {
    constructor() {
        this.darkModeKey = 'darkMode';
        this.isDark = false;
        this.init();
    }

    init() {
        this.createGlobalCSSRules();
        const savedMode = localStorage.getItem(this.darkModeKey);
        if (savedMode === null) {
            this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            localStorage.setItem(this.darkModeKey, this.isDark);
        } else {
            this.isDark = savedMode === 'true';
        }
        
        this.applyMode(this.isDark);
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupToggleListeners();
                this.applyDarkModeToEverything();
                this.setupMutationObserver();
            });
        } else {
            this.setupToggleListeners();
            this.applyDarkModeToEverything();
            this.setupMutationObserver();
        }
    }

    createGlobalCSSRules() {
        const style = document.createElement('style');
        style.id = 'ultimate-dark-mode';
        style.textContent = `
            body.dark-mode-ultimate {
                background-color: #121212 !important;
                color: #ffffff !important;
                transition: all 0.3s ease;
            }
            
            body.dark-mode-ultimate *:not(.btn-primary):not(.btn-success):not(.btn-warning):not(.btn-danger):not(.btn-info) {
                background-color: inherit !important;
                color: inherit !important;
                border-color: #444 !important;
                transition: all 0.3s ease !important;
            }
            
            body.dark-mode-ultimate .card,
            body.dark-mode-ultimate .panel,
            body.dark-mode-ultimate .box,
            body.dark-mode-ultimate .section,
            body.dark-mode-ultimate .container,
            body.dark-mode-ultimate .content,
            body.dark-mode-ultimate .wrapper {
                background-color: #1e1e1e !important;
                color: #ffffff !important;
                border-color: #444 !important;
            }
            
            body.dark-mode-ultimate input,
            body.dark-mode-ultimate select,
            body.dark-mode-ultimate textarea,
            body.dark-mode-ultimate .form-control {
                background-color: #2d2d2d !important;
                color: #ffffff !important;
                border-color: #555 !important;
            }
            
            body.dark-mode-ultimate table,
            body.dark-mode-ultimate tr,
            body.dark-mode-ultimate th,
            body.dark-mode-ultimate td {
                background-color: #1e1e1e !important;
                color: #ffffff !important;
                border-color: #444 !important;
            }
            
            body.dark-mode-ultimate .sidebar {
                background-color: #0a0a0a !important;
                color: #ffffff !important;
            }
            
            body.dark-mode-ultimate .header,
            body.dark-mode-ultimate .navbar {
                background-color: #1a1a1a !important;
                color: #ffffff !important;
            }
            
            body.dark-mode-ultimate .logo,
            body.dark-mode-ultimate h1,
            body.dark-mode-ultimate h2,
            body.dark-mode-ultimate h3,
            body.dark-mode-ultimate h4,
            body.dark-mode-ultimate h5,
            body.dark-mode-ultimate h6 {
                color: #ffffff !important;
            }
            
            body.dark-mode-ultimate .btn:not(.btn-primary):not(.btn-success):not(.btn-warning):not(.btn-danger):not(.btn-info) {
                background-color: #2d2d2d !important;
                color: #ffffff !important;
                border-color: #555 !important;
            }
            
            body.dark-mode-ultimate .text-muted,
            body.dark-mode-ultimate .text-secondary {
                color: #bbbbbb !important;
            }
            
            body.dark-mode-ultimate a:not(.btn) {
                color: #4dabf7 !important;
            }
            
            body.dark-mode-ultimate .footer {
                background-color: #0a0a0a !important;
                color: #bbbbbb !important;
            }
        `;
        document.head.appendChild(style);
    }

    setupToggleListeners() {
        const toggle = document.getElementById('darkModeToggle');
        if (toggle) {
            toggle.addEventListener('change', (e) => {
                this.toggleDarkMode(e.target.checked);
            });
            toggle.checked = this.isDark;
        }
        
        document.querySelectorAll('[data-toggle-dark]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.toggleDarkMode(!this.isDark);
            });
        });
    }

    toggleDarkMode(enable) {
        this.isDark = enable;
        localStorage.setItem(this.darkModeKey, enable);
        this.applyMode(enable);
        this.applyDarkModeToEverything();
    }

    applyMode(enable) {
        if (enable) {
            document.body.classList.add('dark-mode-ultimate');
            document.body.classList.remove('light-mode');
            document.documentElement.setAttribute('data-theme', 'dark');
            document.documentElement.style.backgroundColor = '#121212';
            document.documentElement.style.color = '#ffffff';
        } else {
            document.body.classList.remove('dark-mode-ultimate');
            document.body.classList.add('light-mode');
            document.documentElement.setAttribute('data-theme', 'light');
            document.documentElement.style.backgroundColor = '';
            document.documentElement.style.color = '';
        }
    }

    applyDarkModeToEverything() {
        if (!this.isDark) {
            this.removeDarkStyles();
            return;
        }

        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(element => {
            if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE' || element.tagName === 'SVG' || element.tagName === 'PATH') {
                return;
            }
            
            const tagName = element.tagName.toLowerCase();
            const classList = Array.from(element.classList);
            
            if (this.isSpecialButton(element)) {
                return;
            }
            
            if (tagName === 'body' || tagName === 'html') {
                element.style.backgroundColor = '#121212';
                element.style.color = '#ffffff';
                return;
            }
            
            if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
                element.style.backgroundColor = '#2d2d2d';
                element.style.color = '#ffffff';
                element.style.borderColor = '#555';
                return;
            }
            
            if (tagName === 'table' || tagName === 'tr' || tagName === 'th' || tagName === 'td') {
                element.style.backgroundColor = '#1e1e1e';
                element.style.color = '#ffffff';
                element.style.borderColor = '#444';
                return;
            }
            
            if (tagName === 'button') {
                if (!this.isSpecialButton(element)) {
                    element.style.backgroundColor = '#2d2d2d';
                    element.style.color = '#ffffff';
                    element.style.borderColor = '#555';
                }
                return;
            }
            
            if (this.isTextElement(tagName)) {
                const currentColor = window.getComputedStyle(element).color;
                if (currentColor === 'rgb(0, 0, 0)' || 
                    currentColor === '#000000' || 
                    currentColor === 'black' ||
                    element.style.color === 'black') {
                    element.style.color = '#ffffff';
                } else if (currentColor === 'rgb(108, 117, 125)' || 
                          currentColor === '#6c757d') {
                    element.style.color = '#bbbbbb';
                }
                return;
            }
            
            const computedBg = window.getComputedStyle(element).backgroundColor;
            if (computedBg === 'rgba(0, 0, 0, 0)' || 
                computedBg === 'transparent' ||
                computedBg === 'rgb(255, 255, 255)' ||
                computedBg === '#ffffff' ||
                computedBg === 'white') {
                
                const parentBg = this.getParentBackground(element);
                if (parentBg === '#121212' || parentBg === '#1e1e1e') {
                    element.style.backgroundColor = parentBg;
                } else {
                    element.style.backgroundColor = '#1e1e1e';
                }
            }
            
            const computedColor = window.getComputedStyle(element).color;
            if (computedColor === 'rgb(0, 0, 0)' || 
                computedColor === '#000000' || 
                computedColor === 'black') {
                element.style.color = '#ffffff';
            }
            
            element.style.transition = 'all 0.3s ease';
        });
    }

    isSpecialButton(element) {
        const specialClasses = ['btn-primary', 'btn-success', 'btn-warning', 'btn-danger', 'btn-info'];
        return specialClasses.some(cls => element.classList.contains(cls));
    }

    isTextElement(tagName) {
        return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'label', 'a', 'li', 'td', 'th'].includes(tagName);
    }

    getParentBackground(element) {
        let parent = element.parentElement;
        while (parent && parent !== document.body) {
            const bg = window.getComputedStyle(parent).backgroundColor;
            if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                return bg;
            }
            parent = parent.parentElement;
        }
        return '#121212';
    }

    removeDarkStyles() {
        document.querySelectorAll('*').forEach(element => {
            if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') return;
            
            element.style.backgroundColor = '';
            element.style.color = '';
            element.style.borderColor = '';
            element.style.transition = '';
        });
    }

    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    setTimeout(() => {
                        if (this.isDark) {
                            this.applyDarkModeToEverything();
                        }
                    }, 100);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    forceApplyToSection(selector) {
        const element = document.querySelector(selector);
        if (!element) return;
        
        if (this.isDark) {
            element.style.backgroundColor = '#1e1e1e';
            element.style.color = '#ffffff';
            
            element.querySelectorAll('*').forEach(child => {
                if (child.tagName === 'INPUT' || child.tagName === 'TEXTAREA' || child.tagName === 'SELECT') {
                    child.style.backgroundColor = '#2d2d2d';
                    child.style.color = '#ffffff';
                    child.style.borderColor = '#555';
                } else if (child.tagName === 'BUTTON' && !this.isSpecialButton(child)) {
                    child.style.backgroundColor = '#2d2d2d';
                    child.style.color = '#ffffff';
                    child.style.borderColor = '#555';
                } else {
                    const computedColor = window.getComputedStyle(child).color;
                    if (computedColor === 'rgb(0, 0, 0)' || computedColor === '#000000') {
                        child.style.color = '#ffffff';
                    }
                }
            });
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.darkModeManager = new DarkModeManager();
    });
} else {
    window.darkModeManager = new DarkModeManager();
}

window.toggleDarkMode = function(force) {
    if (window.darkModeManager) {
        if (force !== undefined) {
            window.darkModeManager.toggleDarkMode(force);
        } else {
            window.darkModeManager.toggleDarkMode(!window.darkModeManager.isDark);
        }
    }
};

window.forceDarkSection = function(selector) {
    if (window.darkModeManager) {
        window.darkModeManager.forceApplyToSection(selector);
    }
};

forceDarkSection('.settings-section'); // Replace with your section class
forceDarkSection('.sidebar');
forceDarkSection('.main-content');