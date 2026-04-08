const CART_KEY = "velora_cart";

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatPrice(price) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(price);
}

function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const countDesktop = document.getElementById("cart-count");
  const countMobile = document.getElementById("cart-count-mobile");

  if (countDesktop) countDesktop.textContent = totalItems;
  if (countMobile) countMobile.textContent = totalItems;
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  updateCartCount();
}

function setupAddButtons() {
  const buttons = document.querySelectorAll(".btn-add");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const product = {
        id: button.dataset.id,
        name: button.dataset.name,
        price: Number(button.dataset.price),
        image: button.dataset.image
      };

      addToCart(product);

      const originalText = button.textContent;
      button.textContent = "Agregado";
      button.disabled = true;

      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 900);
    });
  });
}

function renderCart() {
  const container = document.getElementById("cart-items-container");
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <h3>Tu carrito está vacío</h3>
        <p>Agregá productos para empezar a armar tu pedido.</p>
        <a href="productos.html" class="btn btn-primary">Ir a productos</a>
      </div>
    `;
    updateCartSummary();
    return;
  }

  container.innerHTML = cart.map(item => `
    <article class="cart-item">
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}">
      </div>

      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>Precio unitario: ${formatPrice(item.price)}</p>

        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQuantity('${item.id}', -1)">−</button>
          <span class="qty-number">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQuantity('${item.id}', 1)">+</button>
          <button class="remove-btn" onclick="removeItem('${item.id}')">Eliminar</button>
        </div>
      </div>

      <div class="cart-item-price">
        ${formatPrice(item.price * item.quantity)}
      </div>
    </article>
  `).join("");

  updateCartSummary();
}

function changeQuantity(id, delta) {
  const cart = getCart();
  const item = cart.find(product => product.id === id);

  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    const updatedCart = cart.filter(product => product.id !== id);
    saveCart(updatedCart);
  } else {
    saveCart(cart);
  }

  updateCartCount();
  renderCart();
}

function removeItem(id) {
  const cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
  updateCartCount();
  renderCart();
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartCount();
  renderCart();
}

function updateCartSummary() {
  const cart = getCart();
  const totalProducts = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const productsEl = document.getElementById("summary-products");
  const subtotalEl = document.getElementById("summary-subtotal");
  const totalEl = document.getElementById("summary-total");

  if (productsEl) productsEl.textContent = totalProducts;
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (totalEl) totalEl.textContent = formatPrice(subtotal);
}

function setupClearCartButton() {
  const clearBtn = document.getElementById("clear-cart-btn");
  if (!clearBtn) return;

  clearBtn.addEventListener("click", clearCart);
}

function setupMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("mobile-menu");

  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    menu.classList.toggle("show");
  });
}

function setupFilters() {
  const buttons = document.querySelectorAll(".filter-btn");
  const items = document.querySelectorAll(".product-item");
  const searchInput = document.getElementById("search-input");

  if (!buttons.length || !items.length) return;

  let activeFilter = "all";
  let activeSearch = "";

  function applyFilters() {
    items.forEach(item => {
      const category = item.dataset.category.toLowerCase();
      const name = item.dataset.name.toLowerCase();

      const matchesCategory = activeFilter === "all" || category === activeFilter;
      const matchesSearch = name.includes(activeSearch);

      item.style.display = matchesCategory && matchesSearch ? "block" : "none";
    });
  }

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      activeFilter = button.dataset.filter;
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", e => {
      activeSearch = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  setupAddButtons();
  renderCart();
  setupClearCartButton();
  setupMobileMenu();
  setupFilters();
});