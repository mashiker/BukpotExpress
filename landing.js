// Bukpot Express - Landing Page Script
// Handles navigation and theme management

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    setupThemeToggle();
    setupNavigation();
});

// ============================================
// THEME MANAGEMENT
// ============================================

function initializeTheme() {
    chrome.storage.local.get(['theme'], (result) => {
        const theme = result.theme || 'light';
        applyTheme(theme);
    });
}

function applyTheme(theme) {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-icon');

    if (theme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.innerHTML = '&#127769;'; // Moon icon for toggle to light
    } else {
        body.removeAttribute('data-theme');
        if (themeIcon) themeIcon.innerHTML = '&#127769;'; // Moon for next theme
    }

    chrome.storage.local.set({ theme: theme });
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// ============================================
// NAVIGATION
// ============================================

function setupNavigation() {
    // Main menu items - handle click for navigation
    const menuPrepaid = document.getElementById('menu-prepaid');
    const menuBppu = document.getElementById('menu-bppu');

    // These are already <a> tags so they navigate naturally
    // But we can add analytics or additional logic here if needed

    // External tool links - ensure they open in new tab
    const toolLinks = document.querySelectorAll('.tool-item');
    toolLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Let the default behavior handle it (opens in new tab)
            // Can add analytics tracking here if needed
        });
    });

    // Support link
    const supportLink = document.getElementById('support-link');
    if (supportLink) {
        supportLink.addEventListener('click', (e) => {
            // Let default behavior handle it
        });
    }
}
