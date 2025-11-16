import { checkAuth, setupStorageListener } from './auth.js';

const getTotalCartItems = () => {
    const cartData = localStorage.getItem('cart');
    if (!cartData) return 0;
    
    try {
        const cart = JSON.parse(cartData);
        return cart.reduce((total, item) => total + (item.cantidad || 0), 0);
    } catch (error) {
        console.error('Error al leer el carrito:', error);
        return 0;
    }
};

const updateCartBadge = () => {
    const badge = document.getElementById('cart-badge');
    const badgeMobile = document.getElementById('cart-badge-mobile');
    
    const totalItems = getTotalCartItems();
    
    const updateBadge = (element) => {
        if (!element) return;
        if (totalItems > 0) {
            element.textContent = totalItems;
            element.style.display = 'inline-block';
        } else {
            element.style.display = 'none';
        }
    };
    
    updateBadge(badge);
    updateBadge(badgeMobile);
};

function loadHeader() {
    const currentPage = window.location.pathname.split('/').pop();
    const hasSearch = currentPage === 'products.html' || currentPage === 'categories.html';
    
    const header = document.createElement('header');
    if (hasSearch) {
        header.classList.add('has-search');
    }
    
    header.innerHTML = `
        <div class="header-container">
            <div class="header-row">
                <a href="./index.html" class="logo-container">
                    <img class="logo light-mode" src="img/extra/header-logo-light.png" alt="eMercado Logo - Modo Claro">
                    <img class="logo dark-mode" src="img/extra/header-logo-dark.png" alt="eMercado Logo - Modo Oscuro">
                </a>

                <div class="search-section desktop-search">
                    <input class="search-input" type="text" placeholder="Buscar productos...">
                    <button class="button search-button">
                        <svg class="icon search-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="m18,10c0-4.41-3.59-8-8-8S2,5.59,2,10s3.59,8,8,8c1.85,0,3.54-.63,4.9-1.69l5.1,5.1,1.41-1.41-5.1-5.1c1.05-1.36,1.69-3.05,1.69-4.9Zm-14,0c0-3.31,2.69-6,6-6s6,2.69,6,6-2.69,6-6,6-6-2.69-6-6Z"></path>
                        </svg>
                    </button>
                </div>

                <div class="user-actions desktop-actions">
                    <div class="toggle-button">
                        <input type="checkbox" id="themeToggle">
                        <label for="themeToggle" class="toggle-label">
                            <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M12 17.01c2.76 0 5.01-2.25 5.01-5.01S14.76 6.99 12 6.99 6.99 9.24 6.99 12s2.25 5.01 5.01 5.01M12 9c1.66 0 3.01 1.35 3.01 3.01s-1.35 3.01-3.01 3.01-3.01-1.35-3.01-3.01S10.34 9 12 9M13 19h-2v3h2v-3M13 2h-2v3h2V2M2 11h3v2H2zM19 11h3v2h-3zM4.22 18.36l.71.71.71.71 1.06-1.06 1.06-1.06-.71-.71-.71-.71-1.06 1.06zM19.78 5.64l-.71-.71-.71-.71-1.06 1.06-1.06 1.06.71.71.71.71 1.06-1.06zM7.76 6.34 6.7 5.28 5.64 4.22l-.71.71-.71.71L5.28 6.7l1.06 1.06.71-.71zM16.24 17.66l1.06 1.06 1.06 1.06.71-.71.71-.71-1.06-1.06-1.06-1.06-.71.71z"/>
                            </svg>
                            <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="m12.2,22c4.53,0,8.45-2.91,9.76-7.24.11-.35.01-.74-.25-1-.26-.26-.64-.36-1-.25-.78.23-1.58.35-2.38.35-4.52,0-8.2-3.68-8.2-8.2,0-.8.12-1.6.35-2.38.11-.35.01-.74-.25-1s-.64-.36-1-.25C4.91,3.35,2,7.28,2,11.8c0,5.62,4.57,10.2,10.2,10.2ZM8.18,4.65c-.03.34-.05.68-.05,1.02,0,5.62,4.57,10.2,10.2,10.2.34,0,.68-.02,1.02-.05-1.42,2.56-4.12,4.18-7.15,4.18-4.52,0-8.2-3.68-8.2-8.2,0-3.03,1.63-5.73,4.18-7.15Z"/>
                            </svg>
                            <span class="toggle-ball"></span>
                        </label>
                    </div>
                    <button class="button cart-button">
                        <svg class="icon cart-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10.5 18a1.5 1.5 0 1 0 0 3 1.5 1.5 0 1 0 0-3M17.5 18a1.5 1.5 0 1  0 0 3 1.5 1.5 0 1 0 0-3M8.82 15.77c.31.75 1.04 1.23 1.85 1.23h6.18c.79 0 1.51-.47 1.83-1.2l3.24-7.4c.14-.31.11-.67-.08-.95S21.34 7 21 7H7.33L5.92 3.62C5.76 3.25 5.4 3 5 3H2v2h2.33zM19.47 9l-2.62 6h-6.18l-2.5-6z"></path>
                        </svg>
                        <span id="cart-badge" class="cart-badge" style="display: none;">0</span>
                    </button>

                    <div class="dropdown">
                        <button class="button account-button" id="nombreUsuarioBtn">
                            <svg class="icon account-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5m0-8c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3M4 22h16c.55 0 1-.45 1-1v-1c0-3.86-3.14-7-7-7h-4c-3.86 0-7 3.14-7 7v1c0 .55.45 1 1 1m6-7h4c2.76 0 5 2.24 5 5H5c0-2.76 2.24-5 5-5"></path>
                            </svg>
                            <span id="nombreUsuario"></span>
                        </button>
                        <div class="dropdown-content">
                            <a href="my-profile.html">Mi perfil</a>
                            <a href="#" id="cerrarSesion">Cerrar sesión</a>
                        </div>
                    </div>
                </div>

                <button class="button menu-button mobile-menu-toggle" id="menuToggle">
                    <svg class="icon menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 17H20M4 12H20M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>

            ${hasSearch ? `
            <div class="search-section mobile-search">
                <input class="search-input" type="text" placeholder="Buscar productos...">
                <button class="button search-button">
                    <svg class="icon search-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="m18,10c0-4.41-3.59-8-8-8S2,5.59,2,10s3.59,8,8,8c1.85,0,3.54-.63,4.9-1.69l5.1,5.1,1.41-1.41-5.1-5.1c1.05-1.36,1.69-3.05,1.69-4.9Zm-14,0c0-3.31,2.69-6,6-6s6,2.69,6,6-2.69,6-6,6-6-2.69-6-6Z"></path>
                    </svg>
                </button>
            </div>
            ` : ''}
        </div>

        <div class="mobile-sidebar" id="mobileSidebar">
            <div class="sidebar-content">
                <button class="sidebar-close" id="sidebarClose">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span id="cart-badge" class="cart-badge" style="display: none;">0</span>
                </button>

                <nav class="sidebar-nav">
                    <div class="sidebar-item">
                        <span class="sidebar-label">Tema</span>
                        <div class="toggle-button">
                            <input type="checkbox" id="themeToggleMobile">
                            <label for="themeToggleMobile" class="toggle-label">
                                <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d="M12 17.01c2.76 0 5.01-2.25 5.01-5.01S14.76 6.99 12 6.99 6.99 9.24 6.99 12s2.25 5.01 5.01 5.01M12 9c1.66 0 3.01 1.35 3.01 3.01s-1.35 3.01-3.01 3.01-3.01-1.35-3.01-3.01S10.34 9 12 9M13 19h-2v3h2v-3M13 2h-2v3h2V2M2 11h3v2H2zM19 11h3v2h-3zM4.22 18.36l.71.71.71.71 1.06-1.06 1.06-1.06-.71-.71-.71-.71-1.06 1.06zM19.78 5.64l-.71-.71-.71-.71-1.06 1.06-1.06 1.06.71.71.71.71 1.06-1.06zM7.76 6.34 6.7 5.28 5.64 4.22l-.71.71-.71.71L5.28 6.7l1.06 1.06.71-.71zM16.24 17.66l1.06 1.06 1.06 1.06.71-.71.71-.71-1.06-1.06-1.06-1.06-.71.71z"/>
                                </svg>
                                <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d="m12.2,22c4.53,0,8.45-2.91,9.76-7.24.11-.35.01-.74-.25-1-.26-.26-.64-.36-1-.25-.78.23-1.58.35-2.38.35-4.52,0-8.2-3.68-8.2-8.2,0-.8.12-1.6.35-2.38.11-.35.01-.74-.25-1s-.64-.36-1-.25C4.91,3.35,2,7.28,2,11.8c0,5.62,4.57,10.2,10.2,10.2ZM8.18,4.65c-.03.34-.05.68-.05,1.02,0,5.62,4.57,10.2,10.2,10.2.34,0,.68-.02,1.02-.05-1.42,2.56-4.12,4.18-7.15,4.18-4.52,0-8.2-3.68-8.2-8.2,0-3.03,1.63-5.73,4.18-7.15Z"/>
                                </svg>
                                <span class="toggle-ball"></span>
                            </label>
                        </div>
                    </div>

                    <a href="cart.html" class="sidebar-item sidebar-link">
                        <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10.5 18a1.5 1.5 0 1 0 0 3 1.5 1.5 0 1 0 0-3M17.5 18a1.5 1.5 0 1  0 0 3 1.5 1.5 0 1 0 0-3M8.82 15.77c.31.75 1.04 1.23 1.85 1.23h6.18c.79 0 1.51-.47 1.83-1.2l3.24-7.4c.14-.31.11-.67-.08-.95S21.34 7 21 7H7.33L5.92 3.62C5.76 3.25 5.4 3 5 3H2v2h2.33zM19.47 9l-2.62 6h-6.18l-2.5-6z"></path>
                        </svg>
                        <span>Carrito</span>
                        <span id="cart-badge-mobile" class="cart-badge" style="display: none;">0</span>
                    </a>

                    <a href="my-profile.html" class="sidebar-item sidebar-link">
                        <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5m0-8c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3M4 22h16c.55 0 1-.45 1-1v-1c0-3.86-3.14-7-7-7h-4c-3.86 0-7 3.14-7 7v1c0 .55.45 1 1 1m6-7h4c2.76 0 5 2.24 5 5H5c0-2.76 2.24-5 5-5"></path>
                        </svg>
                        <span>Mi perfil</span>
                    </a>

                    <button class="sidebar-item sidebar-link" id="cerrarSesionMobile">
                        <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17 8l-1.41 1.41L17.17 11H9v2h8.17l-1.58 1.58L17 16l4-4-4-4M5 5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h7v-2H5V5z"/>
                        </svg>
                        <span>Cerrar sesión</span>
                    </button>
                </nav>
            </div>
        </div>
        <div class="sidebar-overlay" id="sidebarOverlay"></div>
    `;
    document.body.prepend(header);
}

function loadFooter() {
    const footer = document.createElement('footer');
    footer.innerHTML = `
        <div class="footer-container">
            <p>Este sitio forma parte de <a href="https://jovenesaprogramar.edu.uy/" target="_blank">Jóvenes a Programar</a> - 2025</p>
            <a href="#">Volver arriba</a>
        </div>
    `;
    document.body.appendChild(footer);
}

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth() && window.location.pathname.split('/').pop() !== 'login.html') {
        return;
    }
    
    loadHeader();
    loadFooter();
    setupStorageListener();

    const usuario = checkAuth();
    if (!usuario) return;

    const nombreUsuario = document.getElementById("nombreUsuario");
    if (nombreUsuario) {
        nombreUsuario.textContent = usuario;
    }

    const cerrarSesionBtn = document.getElementById("cerrarSesion");
    if (cerrarSesionBtn) {
        cerrarSesionBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("usuarioLogueado");
            window.location.href = "login.html";
        });
    }

    const cerrarSesionMobileBtn = document.getElementById("cerrarSesionMobile");
    if (cerrarSesionMobileBtn) {
        cerrarSesionMobileBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("usuarioLogueado");
            window.location.href = "login.html";
        });
    }

    const userButton = document.getElementById('nombreUsuarioBtn');
    const dropdownContent = document.querySelector('.dropdown-content');

    if (userButton && dropdownContent) {
        userButton.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdownContent.classList.toggle("show");
        });

        document.addEventListener("click", (e) => {
            if (!dropdownContent.contains(e.target) && !userButton.contains(e.target)) {
                dropdownContent.classList.remove("show");
            }
        });
    }

    const cartButton = document.querySelector('.cart-button');
    if (cartButton) {
        cartButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'cart.html';
        });
    }

    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('mobileSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarClose = document.getElementById('sidebarClose');

    const openSidebar = () => {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeSidebar = () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (menuToggle) {
        menuToggle.addEventListener('click', openSidebar);
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    const themeToggle = document.getElementById('themeToggle');
    const themeToggleMobile = document.getElementById('themeToggleMobile');

    const syncThemeToggles = () => {
        const isDark = document.documentElement.classList.contains('dark-mode');
        if (themeToggle) themeToggle.checked = isDark;
        if (themeToggleMobile) themeToggleMobile.checked = isDark;
    };

    syncThemeToggles();

    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('change', function() {
            const isDark = this.checked;
            document.documentElement.classList.toggle('dark-mode', isDark);
            localStorage.setItem('darkMode', isDark);
            syncThemeToggles();
        });
    }

    const observer = new MutationObserver(() => {
        syncThemeToggles();
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
    });
    
    updateCartBadge();
    window.addEventListener('cartUpdated', updateCartBadge);
});