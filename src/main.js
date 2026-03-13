// ════════════════════════════════════════════════════════════
//  MemViz — Main SPA Router
// ════════════════════════════════════════════════════════════

import { renderHomePage, initHomeAnimations } from './pages/home.js';
import { renderVisualizerPage, initVisualizer } from './pages/visualizer.js';
import { renderExplorerPage, initExplorer } from './pages/explorer.js';
import { renderAboutPage } from './pages/about.js';
import { renderInteractivePage, initInteractive } from './pages/interactive.js';

// ── Navbar ──
function renderNavbar(activePage) {
    return `<nav class="navbar">
    <a class="nav-logo" href="#/">
      <div class="nav-logo-icon">⬡</div>
      <span class="nav-logo-text">MEMVIZ</span>
    </a>
    <div class="nav-sep"></div>
    <div class="nav-links">
      <a href="#/" class="nav-link ${activePage === 'home' ? 'active' : ''}">Home</a>
      <a href="#/visualizer" class="nav-link ${activePage === 'visualizer' ? 'active' : ''}">Visualizer</a>
      <a href="#/interactive" class="nav-link ${activePage === 'interactive' ? 'active' : ''}">Interactive</a>
      <a href="#/explorer" class="nav-link ${activePage === 'explorer' ? 'active' : ''}">Explorer</a>
      <a href="#/about" class="nav-link ${activePage === 'about' ? 'active' : ''}">About</a>
    </div>
    <div class="nav-right">
      <button class="theme-toggle" id="theme-toggle" title="Toggle theme">☀</button>
      <a href="#/interactive" class="nav-cta">Launch Lab</a>
    </div>
  </nav>`;
}

// ── Theme Toggle ──
function initTheme() {
    const saved = localStorage.getItem('memviz-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('memviz-theme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀' : '🌙';
}

// ── Router ──
function getRoute() {
    const hash = window.location.hash || '#/';
    const [path, query] = hash.replace('#', '').split('?');
    const params = {};
    if (query) query.split('&').forEach(p => { const [k, v] = p.split('='); params[k] = v; });
    return { path: path || '/', params };
}

function navigate() {
    const { path, params } = getRoute();
    const app = document.getElementById('app');
    let page = 'home';

    if (path === '/' || path === '') {
        page = 'home';
        app.innerHTML = renderNavbar('home') + renderHomePage();
        setTimeout(initHomeAnimations, 100);
    } else if (path === '/visualizer') {
        page = 'visualizer';
        app.innerHTML = renderNavbar('visualizer') + renderVisualizerPage();
        setTimeout(() => {
            initVisualizer();
            // If redirected from explorer with a sample
            if (params.sample) {
                const btn = document.querySelector(`.sb[data-sample="${params.sample}"]`);
                if (btn) btn.click();
            }
        }, 50);
    } else if (path === '/explorer') {
        page = 'explorer';
        app.innerHTML = renderNavbar('explorer') + renderExplorerPage();
        setTimeout(initExplorer, 50);
    } else if (path === '/interactive') {
        page = 'interactive';
        app.innerHTML = renderNavbar('interactive') + renderInteractivePage();
        setTimeout(initInteractive, 50);
    } else if (path === '/about') {
        page = 'about';
        app.innerHTML = renderNavbar('about') + renderAboutPage();
    } else {
        page = 'home';
        app.innerHTML = renderNavbar('home') + renderHomePage();
        setTimeout(initHomeAnimations, 100);
    }

    // Re-attach theme toggle
    setTimeout(() => {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) toggleBtn.addEventListener('click', toggleTheme);
        updateThemeIcon(document.documentElement.getAttribute('data-theme') || 'dark');
    }, 50);

    // Scroll to top
    window.scrollTo(0, 0);
}

// ── Init ──
initTheme();
window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', navigate);
navigate();
