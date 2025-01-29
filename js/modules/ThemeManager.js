export class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.initialize();
        // Check for saved theme preference or system preference
        this.setInitialTheme();
    }

    initialize() {
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    setInitialTheme() {
        // Check if theme is saved in localStorage
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            document.documentElement.classList.add('dark');
            document.getElementById('theme-icon').classList.replace('bi-moon-stars-fill', 'bi-sun');
        } else {
            document.documentElement.classList.remove('dark');
            document.getElementById('theme-icon').classList.replace('bi-sun', 'bi-moon-stars-fill');
        }
    }

    toggleTheme() {
        const html = document.documentElement;
        const icon = document.getElementById('theme-icon');

        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            icon.classList.replace('bi-sun', 'bi-moon-stars-fill');
            localStorage.setItem('theme', 'light');
        } else {
            html.classList.add('dark');
            icon.classList.replace('bi-moon-stars-fill', 'bi-sun');
            localStorage.setItem('theme', 'dark');
        }
    }
} 