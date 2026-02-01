// Global Dark Mode Manager
class DarkModeManager {
    constructor() {
        this.darkModeKey = 'darkMode';
        this.darkBgColor = '#1a1a1a';
        this.darkTextColor = '#ffffff';
        this.lightBgColor = '#ffffff';
        this.lightTextColor = '#000000';
        this.init();
    }

    init() {
        // Apply saved preference on page load
        this.applyMode(localStorage.getItem(this.darkModeKey) === 'true');
        
        // Listen for dark mode toggle changes
        document.addEventListener('DOMContentLoaded', () => {
            this.setupToggleListeners();
        });
    }

    setupToggleListeners() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', (e) => {
                this.toggleDarkMode(e.target.checked);
            });
            // Set checkbox to match current state
            darkModeToggle.checked = localStorage.getItem(this.darkModeKey) === 'true';
        }
    }

    toggleDarkMode(isDark) {
        localStorage.setItem(this.darkModeKey, isDark);
        this.applyMode(isDark);
    }

    applyMode(isDark) {
        if (isDark) {
            this.enableDarkMode();
        } else {
            this.enableLightMode();
        }
    }

    enableDarkMode() {
        document.documentElement.style.backgroundColor = this.darkBgColor;
        document.body.style.backgroundColor = this.darkBgColor;
        document.body.style.color = this.darkTextColor;
        document.body.classList.add('dark-mode');

        // Apply to all main content areas
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.backgroundColor = this.darkBgColor;
            mainContent.style.color = this.darkTextColor;
        }

        const dashboardContainer = document.querySelector('.dashboard-container');
        if (dashboardContainer) {
            dashboardContainer.style.backgroundColor = this.darkBgColor;
        }

        // Apply to sidebar
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.backgroundColor = '#0d0d0d';
            sidebar.style.color = this.darkTextColor;
        }

        // Apply to cards and sections
        this.applyDarkToElements();
    }

    enableLightMode() {
        document.documentElement.style.backgroundColor = this.lightBgColor;
        document.body.style.backgroundColor = this.lightBgColor;
        document.body.style.color = this.lightTextColor;
        document.body.classList.remove('dark-mode');

        // Apply to all main content areas
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.backgroundColor = this.lightBgColor;
            mainContent.style.color = this.lightTextColor;
        }

        const dashboardContainer = document.querySelector('.dashboard-container');
        if (dashboardContainer) {
            dashboardContainer.style.backgroundColor = this.lightBgColor;
        }

        // Apply to sidebar
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.backgroundColor = '#f8f9fa';
            sidebar.style.color = this.lightTextColor;
        }

        // Apply to cards and sections
        this.applyLightToElements();
    }

    applyDarkToElements() {
        // Cards
        document.querySelectorAll('.stat-card, .data-card, .chart-card, .settings-section, .settings-container').forEach(el => {
            el.style.backgroundColor = '#2a2a2a';
            el.style.color = this.darkTextColor;
            el.style.borderColor = '#444';
        });

        // Tables
        document.querySelectorAll('table').forEach(table => {
            table.style.backgroundColor = '#1a1a1a';
            table.style.color = this.darkTextColor;
            document.querySelectorAll('th, td').forEach(cell => {
                cell.style.backgroundColor = '#2a2a2a';
                cell.style.color = this.darkTextColor;
                cell.style.borderColor = '#444';
            });
        });

        // Inputs and forms
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.style.backgroundColor = '#2a2a2a';
            input.style.color = this.darkTextColor;
            input.style.borderColor = '#444';
        });

        // Buttons
        document.querySelectorAll('button').forEach(btn => {
            if (!btn.classList.contains('btn-primary') && !btn.classList.contains('btn-warning')) {
                btn.style.backgroundColor = '#2a2a2a';
                btn.style.color = this.darkTextColor;
                btn.style.borderColor = '#444';
            }
        });
    }

    applyLightToElements() {
        // Cards
        document.querySelectorAll('.stat-card, .data-card, .chart-card, .settings-section, .settings-container').forEach(el => {
            el.style.backgroundColor = '#ffffff';
            el.style.color = this.lightTextColor;
            el.style.borderColor = '#ddd';
        });

        // Tables
        document.querySelectorAll('table').forEach(table => {
            table.style.backgroundColor = '#ffffff';
            table.style.color = this.lightTextColor;
            document.querySelectorAll('th, td').forEach(cell => {
                cell.style.backgroundColor = '#f8f9fa';
                cell.style.color = this.lightTextColor;
                cell.style.borderColor = '#ddd';
            });
        });

        // Inputs and forms
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.style.backgroundColor = '#ffffff';
            input.style.color = this.lightTextColor;
            input.style.borderColor = '#ddd';
        });

        // Buttons
        document.querySelectorAll('button').forEach(btn => {
            if (!btn.classList.contains('btn-primary') && !btn.classList.contains('btn-warning')) {
                btn.style.backgroundColor = '#f8f9fa';
                btn.style.color = this.lightTextColor;
                btn.style.borderColor = '#ddd';
            }
        });
    }
}

// Initialize dark mode manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.darkModeManager = new DarkModeManager();
    });
} else {
    window.darkModeManager = new DarkModeManager();
}
