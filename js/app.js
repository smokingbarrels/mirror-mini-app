// mirror.mirror.o — Telegram Mini App

const App = {
    currentPage: 'catalog',
    cart: [],
    favorites: [],
    currentSort: 'default',
    searchQuery: '',
    activeCategory: null,
    detailProduct: null,
    detailSlide: 0,
    detailSize: null,
    detailQty: 1,

    init() {
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
        }
        try {
            const saved = localStorage.getItem('mirror_favorites');
            if (saved) this.favorites = JSON.parse(saved);
        } catch(e) {}
        try {
            const savedCart = localStorage.getItem('mirror_cart');
            if (savedCart) this.cart = JSON.parse(savedCart);
        } catch(e) {}
        this.render();
        this.bindEvents();
        this.trackVisit();
    },

    trackVisit() {
        try {
            const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
            if (!tgUser) return;
            fetch('https://mirror-mini-app.vercel.app/api/stats?key=mirror2026', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visit: { userId: tgUser.id, name: tgUser.first_name, username: tgUser.username } })
            }).catch(() => {});
        } catch(e) {}
    },

    saveFavorites() {
        try { localStorage.setItem('mirror_favorites', JSON.stringify(this.favorites)); } catch(e) {}
    },

    saveCart() {
        try { localStorage.setItem('mirror_cart', JSON.stringify(this.cart)); } catch(e) {}
    },

    isFavorite(id) {
        return this.favorites.includes(id);
    },

    toggleFavorite(id) {
        const idx = this.favorites.indexOf(id);
        if (idx >= 0) {
            this.favorites.splice(idx, 1);
        } else {
            this.favorites.push(id);
        }
        this.saveFavorites();
    },

    render() {
        const app = document.getElementById('app');
        app.innerHTML = `
            ${this.renderHeader()}
            <div id="page-catalog" class="page active">
                ${this.renderCatalog()}
            </div>
            <div id="page-favorites" class="page">
                ${this.renderFavorites()}
            </div>
            <div id="page-cart" class="page">
                ${this.renderCart()}
            </div>
            <div id="page-profile" class="page">
                ${this.renderProfile()}
            </div>
            ${this.renderTabBar()}
        `;
    },

    renderHeader() {
        return `
        <div class="header">
            <img src="assets/img/logo.png" alt="mirror.mirror.o" class="header-logo">
        </div>`;
    },

    renderCatalog() {
        const products = this.getFilteredProducts();
        return `
        ${CATEGORIES.length > 1 ? `<div class="categories">
            ${CATEGORIES.map(c => `
                <button class="category-tag${this.activeCategory === c.value ? ' active' : ''}" data-category="${c.value}">${c.label}</button>
            `).join('')}
        </div>` : ''}
        <div class="catalog-section">
            <h1 class="catalog-title">Каталог</h1>
            <div class="search-bar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input type="text" placeholder="Поиск" id="search-input" value="${this.searchQuery}">
            </div>
            <div class="sort-wrapper">
                <button class="sort-button" id="sort-btn">
                    <span>${SORT_OPTIONS.find(o => o.value === this.currentSort).label}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                </button>
                <div class="sort-dropdown" id="sort-dropdown">
                    ${SORT_OPTIONS.map(o => `
                        <div class="sort-option${this.currentSort === o.value ? ' active' : ''}" data-sort="${o.value}">${o.label}</div>
                    `).join('')}
                </div>
            </div>
            <div class="product-grid">
                ${products.map(p => this.renderProductCard(p)).join('')}
            </div>
        </div>`;
    },

    renderImage(src) {
        if (src && src !== 'placeholder') {
            return `<img src="${src}" alt="">`;
        }
        return `<span class="product-placeholder">&#128085;</span>`;
    },

    renderProductCard(product) {
        const img = (product.images || [product.image])[0];
        const isFav = this.isFavorite(product.id);
        return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image-wrap">
                ${this.renderImage(img)}
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                <div class="product-fav-btn${isFav ? ' active' : ''}" data-fav-toggle="${product.id}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </div>
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div>
                    <span class="product-price">${this.formatPrice(product.price)}</span>
                    ${product.oldPrice ? `<span class="product-old-price">${this.formatPrice(product.oldPrice)}</span>` : ''}
                </div>
            </div>
        </div>`;
    },

    // ===== PRODUCT DETAIL =====
    openProduct(id) {
        const product = PRODUCTS.find(p => p.id === id);
        if (!product) return;
        this.detailProduct = product;
        this.detailSlide = 0;
        this.detailSize = null;
        this.detailQty = 1;

        let overlay = document.getElementById('product-detail');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'product-detail';
            overlay.className = 'product-detail';
            document.body.appendChild(overlay);
        }
        overlay.innerHTML = this.renderProductDetail(product);
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    },

    closeProduct() {
        const overlay = document.getElementById('product-detail');
        if (overlay) {
            overlay.style.display = 'none';
            overlay.innerHTML = '';
        }
        document.body.style.overflow = '';
        this.detailProduct = null;
    },

    renderProductDetail(product) {
        const slides = product.images || [product.image];
        return `
        <div class="detail-header">
            <button class="detail-back" data-detail-back>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span class="detail-header-title">${product.name}</span>
        </div>

        <div class="detail-gallery">
            ${product.badge ? `<span class="gallery-badge">${product.badge}</span>` : ''}
            <div class="gallery-track" id="gallery-track" style="transform:translateX(-${this.detailSlide * 100}%)">
                ${slides.map(src => `
                    <div class="gallery-slide">${src && src !== 'placeholder' ? `<img src="${src}" style="width:100%;height:100%;object-fit:cover;">` : '&#128085;'}</div>
                `).join('')}
            </div>
            ${slides.length > 1 ? `
                <button class="gallery-arrow left" data-gallery-prev>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button class="gallery-arrow right" data-gallery-next>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
                </button>
            ` : ''}
        </div>

        <div class="gallery-thumbnails">
            ${slides.map((src, i) => `
                <div class="gallery-thumb${i === this.detailSlide ? ' active' : ''}" data-thumb="${i}">${src && src !== 'placeholder' ? `<img src="${src}" style="width:100%;height:100%;object-fit:cover;">` : '&#128085;'}</div>
            `).join('')}
        </div>

        <div class="detail-body">
            <div class="detail-name">${product.name}</div>
            <div class="detail-price-row">
                <span class="detail-price">${this.formatPrice(product.price)}</span>
                ${product.oldPrice ? `<span class="detail-old-price">${this.formatPrice(product.oldPrice)}</span>` : ''}
                <button class="detail-share">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                        <path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>
                    </svg>
                </button>
            </div>

            ${product.description ? `<div class="detail-description-label">Описание</div>
            <div class="detail-description">${product.description.replace(/\n/g, '<br>')}</div>` : ''}

            <div class="detail-section-label">Размер *</div>
            <div class="size-selector">
                ${product.sizes.map(s => `
                    <button class="size-btn${this.detailSize === s ? ' active' : ''}" data-size="${s}">${s}</button>
                `).join('')}
            </div>

            <div class="detail-section-label">Количество</div>
            <div class="qty-selector">
                <button class="qty-btn" data-qty-minus>−</button>
                <span class="qty-value" id="detail-qty">${this.detailQty}</span>
                <button class="qty-btn" data-qty-plus>+</button>
            </div>

            <div class="shipping-notice${this.detailSize ? '' : ' hidden'}" id="shipping-notice">
                <span class="shipping-dot"></span>
                <span>Отправка до ${product.shippingDays || 10} рабочих дней</span>
            </div>

        </div>

        <div class="detail-bottom-bar">
            <button class="btn-add-cart" data-add-to-cart>Добавить в корзину</button>
            <button class="btn-favorite${this.isFavorite(product.id) ? ' active' : ''}" data-fav-detail="${product.id}">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="${this.isFavorite(product.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
            </button>
        </div>`;
    },

    updateGallery() {
        const track = document.getElementById('gallery-track');
        if (track) track.style.transform = `translateX(-${this.detailSlide * 100}%)`;
        document.querySelectorAll('.gallery-thumb').forEach((t, i) => {
            t.classList.toggle('active', i === this.detailSlide);
        });
    },

    addToCart() {
        if (!this.detailProduct) return;
        if (!this.detailSize) {
            this.showToast('Выберите размер');
            return;
        }
        const existing = this.cart.find(
            item => item.id === this.detailProduct.id && item.size === this.detailSize
        );
        if (existing) {
            existing.qty += this.detailQty;
        } else {
            this.cart.push({
                id: this.detailProduct.id,
                name: this.detailProduct.name,
                price: this.detailProduct.price,
                size: this.detailSize,
                qty: this.detailQty,
                shippingDays: this.detailProduct.shippingDays,
                image: this.detailProduct.images && this.detailProduct.images[0] || null
            });
        }
        this.updateCartBadge();
        this.saveCart();
        this.closeProduct();
        this.switchPage('cart');
    },

    renderCart() {
        if (this.cart.length === 0) {
            return this.renderStub('cart', 'Корзина пуста', 'Добавьте товары из каталога');
        }
        const total = this.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        return `
        <div class="catalog-section">
            <h1 class="catalog-title">Корзина</h1>
            ${this.cart.map((item, i) => `
            <div class="cart-item" style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);align-items:flex-start;">
                <div style="width:70px;height:70px;background:#222;border-radius:8px;flex-shrink:0;overflow:hidden;">${item.image ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;">` : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:28px;">&#128085;</div>`}</div>
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                        <div style="font-size:13px;font-weight:500;line-height:1.3;">${item.name}</div>
                        <button data-remove-cart="${i}" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:18px;padding:0 0 0 8px;">×</button>
                    </div>
                    <div style="font-size:12px;color:var(--text-secondary);margin:4px 0;">${item.size}</div>
                    <div style="font-size:11px;color:#e8a020;margin-bottom:6px;">ОТПРАВКА ДО ${item.shippingDays} РАБОЧИХ ДНЕЙ</div>
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <button data-cart-minus="${i}" style="background:none;border:1px solid var(--border);color:var(--text);width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:16px;">−</button>
                            <span style="font-size:14px;min-width:16px;text-align:center;">${item.qty}</span>
                            <button data-cart-plus="${i}" style="background:none;border:1px solid var(--border);color:var(--text);width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:16px;">+</button>
                        </div>
                        <span style="font-size:14px;font-weight:700;">${this.formatPrice(item.price * item.qty)}</span>
                    </div>
                </div>
            </div>`).join('')}
            <div style="margin-top:20px;padding:16px 0;border-top:1px solid var(--border);">
                <div style="display:flex;justify-content:space-between;font-size:14px;color:var(--text-secondary);margin-bottom:8px;">
                    <span>Товары</span><span>${this.formatPrice(total)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;">
                    <span>К оплате</span><span>${this.formatPrice(total)}</span>
                </div>
            </div>
            <div style="background:var(--bg-card);border-radius:var(--radius);padding:14px 16px;margin:16px 0;display:flex;align-items:center;gap:10px;">
                <span style="color:#e8a020;font-size:10px;">&#9679;</span>
                <div>
                    <div style="font-size:12px;font-weight:600;color:#e8a020;">СРОК ОТПРАВКИ ЗАКАЗА</div>
                    <div style="font-size:13px;color:var(--text-secondary);">Отправка до 10 рабочих дней</div>
                </div>
            </div>
            <button id="checkout-btn" style="width:100%;padding:16px;background:var(--text);color:var(--bg);border:none;border-radius:var(--radius);font-size:16px;font-weight:600;cursor:pointer;">
                Оформить заказ
            </button>
        </div>`;
    },

    renderProfile() {
        const items = [
            { icon: '&#128230;', label: 'История заказов' },
            { icon: '&#128172;', label: 'Связаться с поддержкой' },
            { icon: '&#9993;', label: 'Наш ТГ канал' }
        ];
        return `
        <div class="catalog-section">
            <h1 class="catalog-title">Профиль</h1>
        </div>
        <div class="profile-menu">
            ${items.map(item => `
            <div class="profile-item" data-profile-action="${item.label}">
                <span class="profile-item-label">${item.icon} ${item.label}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
            </div>`).join('')}
        </div>`;
    },

    renderOrderHistory() {
        const orders = JSON.parse(localStorage.getItem('mm_orders') || '[]');
        const content = document.getElementById('content');
        if (orders.length === 0) {
            content.innerHTML = `
            <div class="stub-page">
                <div class="stub-icon">&#128230;</div>
                <div class="stub-title">Заказов пока нет</div>
                <div class="stub-text">Оформите заявку в корзине</div>
                <button class="order-history-back" style="margin-top:20px;padding:12px 32px;background:var(--text);color:var(--bg);border:none;border-radius:var(--radius);font-size:14px;cursor:pointer;">Назад</button>
            </div>`;
        } else {
            content.innerHTML = `
            <div class="catalog-section">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                    <button class="order-history-back" style="background:none;border:none;color:var(--text);cursor:pointer;padding:4px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <h1 class="catalog-title" style="margin:0;">История заказов</h1>
                </div>
                ${orders.map(o => `
                <div style="background:var(--card);border-radius:var(--radius);padding:16px;margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="font-weight:600;">Заявка #${String(o.id).slice(-4)}</span>
                        <span style="color:var(--text-secondary);font-size:13px;">${o.date}</span>
                    </div>
                    ${o.items.map(i => `
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                        ${i.image ? `<img src="${i.image}" style="width:36px;height:36px;border-radius:6px;object-fit:cover;">` : ''}
                        <span style="flex:1;font-size:13px;">${i.name} (${i.size}) ×${i.qty}</span>
                        <span style="font-size:13px;color:var(--text-secondary);">${this.formatPrice(i.price * i.qty)}</span>
                    </div>`).join('')}
                    <div style="text-align:right;font-weight:600;margin-top:8px;padding-top:8px;border-top:1px solid var(--border);">
                        Итого: ${this.formatPrice(o.total)}
                    </div>
                </div>`).join('')}
            </div>`;
        }
        content.querySelector('.order-history-back')?.addEventListener('click', () => {
            this.currentPage = 'profile';
            this.render();
        });
    },

    renderFavorites() {
        const favProducts = PRODUCTS.filter(p => this.isFavorite(p.id));
        if (favProducts.length === 0) {
            return this.renderStub('heart', 'Избранное пусто', 'Нажмите ♥ на товаре');
        }
        return `
        <div class="catalog-section">
            <h1 class="catalog-title">Избранное</h1>
            <div class="product-grid">
                ${favProducts.map(p => this.renderProductCard(p)).join('')}
            </div>
        </div>`;
    },

    renderStub(icon, title, text) {
        const icons = { heart: '&#9825;', cart: '&#128722;' };
        return `
        <div class="stub-page">
            <div class="stub-icon">${icons[icon] || ''}</div>
            <div class="stub-title">${title}</div>
            <div class="stub-text">${text}</div>
        </div>`;
    },

    renderTabBar() {
        const tabs = [
            { id: 'catalog', label: 'Каталог', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>' },
            { id: 'favorites', label: 'Избранное', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' },
            { id: 'cart', label: 'Корзина', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' },
            { id: 'profile', label: 'Профиль', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' }
        ];
        const cartCount = this.cart.reduce((s, i) => s + i.qty, 0);
        return `
        <nav class="tab-bar">
            ${tabs.map(t => `
            <div class="tab-item${this.currentPage === t.id ? ' active' : ''}" data-tab="${t.id}" style="position:relative;">
                ${t.icon}
                ${t.id === 'cart' && cartCount > 0 ? `<span class="tab-badge">${cartCount}</span>` : ''}
                <span class="tab-label">${t.label}</span>
            </div>`).join('')}
        </nav>`;
    },

    bindEvents() {
        document.addEventListener('click', (e) => {
            // Tab bar
            const target = e.target.closest('[data-tab]');
            if (target) {
                this.switchPage(target.dataset.tab);
                return;
            }

            // Product card → open detail
            const quickAdd = e.target.closest('[data-quick-add]');
            if (quickAdd) {
                e.stopPropagation();
                const id = parseInt(quickAdd.dataset.quickAdd);
                this.openProduct(id);
                return;
            }
            const card = e.target.closest('.product-card');
            if (card) {
                this.openProduct(parseInt(card.dataset.id));
                return;
            }

            // Detail: back
            if (e.target.closest('[data-detail-back]')) {
                this.closeProduct();
                return;
            }

            // Detail: gallery arrows
            if (e.target.closest('[data-gallery-prev]')) {
                if (this.detailSlide > 0) {
                    this.detailSlide--;
                    this.updateGallery();
                }
                return;
            }
            if (e.target.closest('[data-gallery-next]')) {
                if (this.detailProduct && this.detailSlide < this.detailProduct.images.length - 1) {
                    this.detailSlide++;
                    this.updateGallery();
                }
                return;
            }

            // Detail: thumbnail
            if (e.target.closest('[data-thumb]')) {
                this.detailSlide = parseInt(e.target.closest('[data-thumb]').dataset.thumb);
                this.updateGallery();
                return;
            }

            // Detail: size
            if (e.target.closest('[data-size]')) {
                this.detailSize = e.target.closest('[data-size]').dataset.size;
                document.querySelectorAll('.size-btn').forEach(b => {
                    b.classList.toggle('active', b.dataset.size === this.detailSize);
                });
                const notice = document.getElementById('shipping-notice');
                if (notice) notice.classList.remove('hidden');
                return;
            }

            // Detail: quantity
            if (e.target.closest('[data-qty-minus]')) {
                if (this.detailQty > 1) {
                    this.detailQty--;
                    const el = document.getElementById('detail-qty');
                    if (el) el.textContent = this.detailQty;
                }
                return;
            }
            if (e.target.closest('[data-qty-plus]')) {
                this.detailQty++;
                const el = document.getElementById('detail-qty');
                if (el) el.textContent = this.detailQty;
                return;
            }

            // Detail: add to cart
            if (e.target.closest('[data-add-to-cart]')) {
                this.addToCart();
                return;
            }

            // Favorite toggle on card
            const favToggle = e.target.closest('[data-fav-toggle]');
            if (favToggle) {
                e.stopPropagation();
                const id = parseInt(favToggle.dataset.favToggle);
                this.toggleFavorite(id);
                this.refreshCatalog();
                if (this.currentPage === 'favorites') {
                    document.getElementById('page-favorites').innerHTML = this.renderFavorites();
                }
                return;
            }

            // Detail: favorite
            if (e.target.closest('[data-fav-detail]')) {
                const btn = e.target.closest('[data-fav-detail]');
                const id = parseInt(btn.dataset.favDetail);
                this.toggleFavorite(id);
                const isFav = this.isFavorite(id);
                btn.classList.toggle('active', isFav);
                const svg = btn.querySelector('svg');
                if (svg) svg.setAttribute('fill', isFav ? 'currentColor' : 'none');
                this.showToast(isFav ? 'Добавлено в избранное' : 'Убрано из избранного');
                return;
            }

            // Detail: accordion
            if (e.target.closest('[data-accordion]')) {
                const key = e.target.closest('[data-accordion]').dataset.accordion;
                const header = e.target.closest('.accordion-header');
                const content = document.getElementById('acc-' + key);
                if (header && content) {
                    header.classList.toggle('open');
                    content.classList.toggle('show');
                }
                return;
            }

            // Categories
            const cat = e.target.closest('.category-tag');
            if (cat) {
                const c = cat.dataset.category;
                this.activeCategory = this.activeCategory === c ? null : c;
                this.refreshCatalog();
                return;
            }

            // Sort button
            const sortBtn = e.target.closest('#sort-btn');
            if (sortBtn) {
                const dd = document.getElementById('sort-dropdown');
                const isOpen = dd.classList.contains('show');
                dd.classList.toggle('show');
                sortBtn.classList.toggle('open');
                if (!isOpen) {
                    setTimeout(() => {
                        const close = (ev) => {
                            if (!ev.target.closest('.sort-wrapper')) {
                                dd.classList.remove('show');
                                sortBtn.classList.remove('open');
                                document.removeEventListener('click', close);
                            }
                        };
                        document.addEventListener('click', close);
                    }, 0);
                }
                return;
            }

            // Sort option
            const sortOpt = e.target.closest('.sort-option');
            if (sortOpt) {
                this.currentSort = sortOpt.dataset.sort;
                document.getElementById('sort-dropdown').classList.remove('show');
                document.getElementById('sort-btn').classList.remove('open');
                this.refreshCatalog();
                return;
            }

            // Cart actions
            if (e.target.closest('[data-remove-cart]')) {
                const idx = parseInt(e.target.closest('[data-remove-cart]').dataset.removeCart);
                this.cart.splice(idx, 1);
                this.saveCart();
                this.refreshPage();
                return;
            }
            if (e.target.closest('[data-cart-minus]')) {
                const idx = parseInt(e.target.closest('[data-cart-minus]').dataset.cartMinus);
                if (this.cart[idx].qty > 1) this.cart[idx].qty--;
                else this.cart.splice(idx, 1);
                this.saveCart();
                this.refreshPage();
                return;
            }
            if (e.target.closest('[data-cart-plus]')) {
                const idx = parseInt(e.target.closest('[data-cart-plus]').dataset.cartPlus);
                this.cart[idx].qty++;
                this.saveCart();
                this.refreshPage();
                return;
            }

            if (e.target.closest('#checkout-btn')) {
                this.showOrderForm();
                return;
            }

            if (e.target.closest('#order-close')) {
                document.getElementById('order-overlay')?.remove();
                return;
            }

            if (e.target.closest('#order-submit')) {
                this.submitOrder();
                return;
            }

            if (e.target.closest('[data-profile-action]')) {
                const action = e.target.closest('[data-profile-action]').dataset.profileAction;
                if (action === 'Наш ТГ канал') {
                    window.open('https://t.me/mirr_r', '_blank');
                } else if (action === 'Связаться с поддержкой') {
                    window.open('https://t.me/mirshvv', '_blank');
                } else if (action === 'История заказов') {
                    this.renderOrderHistory();
                }
                return;
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.id === 'search-input') {
                this.searchQuery = e.target.value;
                this.refreshCatalog();
            }
        });

        document.addEventListener('focusin', (e) => {
            if (e.target.id === 'search-input') {
                const tabBar = document.querySelector('.tab-bar');
                if (tabBar) tabBar.style.display = 'none';
            }
        });
        document.addEventListener('focusout', (e) => {
            if (e.target.id === 'search-input') {
                const tabBar = document.querySelector('.tab-bar');
                if (tabBar) tabBar.style.display = '';
            }
        });
    },

    switchPage(page) {
        this.currentPage = page;
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(`page-${page}`).classList.add('active');
        document.querySelectorAll('.tab-item').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === page);
        });
        if (page === 'cart') {
            document.getElementById('page-cart').innerHTML = this.renderCart();
        }
        if (page === 'favorites') {
            document.getElementById('page-favorites').innerHTML = this.renderFavorites();
        }
        this.updateCartBadge();
    },

    refreshCatalog() {
        const grid = document.querySelector('.product-grid');
        if (grid) {
            const products = this.getFilteredProducts();
            grid.innerHTML = products.map(p => this.renderProductCard(p)).join('');
        } else {
            const section = document.getElementById('page-catalog');
            if (section) section.innerHTML = this.renderCatalog();
        }
    },

    refreshPage() {
        if (this.currentPage === 'cart') {
            document.getElementById('page-cart').innerHTML = this.renderCart();
        }
        this.updateCartBadge();
    },

    updateCartBadge() {
        const count = this.cart.reduce((s, i) => s + i.qty, 0);
        const cartTab = document.querySelector('[data-tab="cart"]');
        if (!cartTab) return;
        let badge = cartTab.querySelector('.tab-badge');
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'tab-badge';
                cartTab.appendChild(badge);
            }
            badge.textContent = count;
        } else if (badge) {
            badge.remove();
        }
    },

    getFilteredProducts() {
        let products = [...PRODUCTS];
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            products = products.filter(p => p.name.toLowerCase().includes(q));
        }
        switch (this.currentSort) {
            case 'name-asc': products.sort((a, b) => a.name.localeCompare(b.name, 'ru')); break;
            case 'name-desc': products.sort((a, b) => b.name.localeCompare(a.name, 'ru')); break;
            case 'price-asc': products.sort((a, b) => a.price - b.price); break;
        }
        return products;
    },

    formatPrice(price) {
        if (!price) return '??? BYN';
        return price.toLocaleString('ru-RU') + ' BYN';
    },

    showOrderForm() {
        const existing = document.getElementById('order-overlay');
        if (existing) existing.remove();
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        const tgName = tgUser?.first_name || '';
        const tgUsername = tgUser?.username ? '@' + tgUser.username : '';
        const overlay = document.createElement('div');
        overlay.id = 'order-overlay';
        overlay.className = 'order-overlay';
        overlay.innerHTML = `
            <div class="order-form">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <h2 style="font-size:18px;font-weight:700;">Оформить заявку</h2>
                    <button id="order-close" style="background:none;border:none;color:var(--text);font-size:24px;cursor:pointer;">×</button>
                </div>
                <div style="margin-bottom:14px;">
                    <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:6px;">Имя</label>
                    <input id="order-name" type="text" value="${tgName}" placeholder="Ваше имя" style="width:100%;padding:12px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);color:var(--text);font-size:14px;box-sizing:border-box;">
                </div>
                <div style="margin-bottom:14px;">
                    <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:6px;">Telegram</label>
                    <input id="order-username" type="text" value="${tgUsername}" placeholder="@username" style="width:100%;padding:12px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);color:var(--text);font-size:14px;box-sizing:border-box;">
                </div>
                <div style="margin-bottom:20px;">
                    <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:6px;">Комментарий</label>
                    <textarea id="order-comment" placeholder="Адрес, пожелания..." rows="3" style="width:100%;padding:12px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);color:var(--text);font-size:14px;resize:none;"></textarea>
                </div>
                <div style="font-size:12px;color:var(--text-secondary);margin-bottom:16px;">
                    Ваш заказ: ${this.cart.map(i => `${i.name} (${i.size}) ×${i.qty}`).join(', ')}
                </div>
                <button id="order-submit" style="width:100%;padding:16px;background:var(--text);color:var(--bg);border:none;border-radius:var(--radius);font-size:16px;font-weight:600;cursor:pointer;">
                    Отправить заявку
                </button>
            </div>`;
        document.body.appendChild(overlay);
    },

    async submitOrder() {
        const name = document.getElementById('order-name')?.value.trim();
        const username = document.getElementById('order-username')?.value.trim();
        const comment = document.getElementById('order-comment')?.value.trim();

        if (!name || !username) {
            this.showToast('Заполните имя и Telegram');
            return;
        }

        const btn = document.getElementById('order-submit');
        if (btn) {
            btn.textContent = 'Отправка...';
            btn.disabled = true;
        }

        const items = this.cart.map(i => `• ${i.name} (${i.size}) ×${i.qty} — ${this.formatPrice(i.price * i.qty)}`).join('\n');
        const total = this.cart.reduce((s, i) => s + i.price * i.qty, 0);

        const text = `🛍 Новая заявка!\n\nИмя: ${name}\nTelegram: ${username}${comment ? '\nКомментарий: ' + comment : ''}\n\nТовары:\n${items}\n\nИтого: ${this.formatPrice(total)}`;

        try {
            const resp = await fetch('https://mirror-mini-app.vercel.app/api/webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: { text, chatId: 1225606022, userChatId: window.Telegram?.WebApp?.initDataUnsafe?.user?.id } })
            });
            const order = {
                id: Date.now(),
                date: new Date().toLocaleDateString('ru-RU'),
                items: this.cart.map(i => ({ name: i.name, size: i.size, qty: i.qty, price: i.price, image: i.image })),
                total,
                name,
                username
            };
            const history = JSON.parse(localStorage.getItem('mm_orders') || '[]');
            history.unshift(order);
            localStorage.setItem('mm_orders', JSON.stringify(history));

            document.getElementById('order-overlay')?.remove();
            this.cart = [];
            this.saveCart();
            this.refreshPage();
            this.showToast('Заявка отправлена!');
        } catch(e) {
            this.showToast('Ошибка, попробуйте позже');
            if (btn) { btn.textContent = 'Отправить заявку'; btn.disabled = false; }
        }
    },

    showToast(message) {
        const existing = document.querySelector('.app-toast');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = 'app-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
