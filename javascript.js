/* ================================================================
   SCRIPT COMPLETO PARA DAIRY & MARCO
   Incluye: categorías, contadores, modal, envío WhatsApp,
   guardado de datos, ayuda dirección, y LOGIN POR URL
   ================================================================ */

/* ── 1. FILTRO DE CATEGORÍAS ────────────────────────────── */
var catBtns = document.querySelectorAll('.cat-btn');
var cards   = document.querySelectorAll('.product-card');

catBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    catBtns.forEach(function(b) {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    var target = btn.getAttribute('data-target');
    cards.forEach(function(card) {
      card.classList.toggle('hidden', card.getAttribute('data-category') !== target);
    });
  });
});

/* ── 2. CONTADORES DE CANTIDAD (con límite 50) ──────────── */
cards.forEach(function(card) {
  var minusBtn = card.querySelector('.qty-minus');
  var plusBtn  = card.querySelector('.qty-plus');
  var qtySpan  = card.querySelector('.qty-value');

  plusBtn.addEventListener('click', function() {
    var current = parseInt(qtySpan.textContent);
    if (current < 50) {
      qtySpan.textContent = current + 1;
      card.classList.add('has-qty');
      updateOrderBar();
    }
  });

  minusBtn.addEventListener('click', function() {
    var current = parseInt(qtySpan.textContent);
    if (current > 0) {
      qtySpan.textContent = current - 1;
      if (current - 1 === 0) card.classList.remove('has-qty');
      updateOrderBar();
    }
  });
});

/* ── 3. BARRA DE PEDIDO Y TOTAL ─────────────────────────── */
var orderBar   = document.getElementById('order-bar');
var orderCount = document.getElementById('order-count');
var orderTotal = document.getElementById('order-total');
var waBtn      = document.getElementById('whatsapp-btn');

function calcTotals() {
  var items = 0, price = 0;
  cards.forEach(function(card) {
    var qty = parseInt(card.querySelector('.qty-value').textContent);
    items += qty;
    price += qty * parseFloat(card.getAttribute('data-price'));
  });
  return { items: items, price: price };
}

function updateOrderBar() {
  var t = calcTotals();
  orderCount.textContent = t.items + (t.items === 1 ? ' artículo' : ' artículos');
  orderTotal.textContent = '$' + t.price.toFixed(2);
  if (orderBar) {
    orderBar.classList.toggle('visible', t.items > 0);
    orderBar.setAttribute('aria-hidden', t.items > 0 ? 'false' : 'true');
  }
}

/* ── 4. MODAL DE PEDIDO ─────────────────────────────────── */
var backdrop   = document.getElementById('modal-backdrop');
var modalClose = document.getElementById('modal-close');

if (waBtn && backdrop) {
  waBtn.addEventListener('click', function() {
    var totalItems = calcTotals().items;
    if (totalItems === 0) {
      alert('⚠️ Selecciona al menos un producto antes de pedir.');
      return;
    }
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    var nombreInput = document.getElementById('input-nombre');
    if (nombreInput) nombreInput.focus();
  });
}

if (modalClose) {
  modalClose.addEventListener('click', closeModal);
}

if (backdrop) {
  backdrop.addEventListener('click', function(e) {
    if (e.target === backdrop) closeModal();
  });
}

function closeModal() {
  if (backdrop) {
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
  }
  var errorEl = document.getElementById('modal-error');
  if (errorEl) errorEl.textContent = '';
}

/* ── 5. ENVIAR PEDIDO POR WHATSAPP ──────────────────────── */
var sendBtn = document.getElementById('modal-send-btn');
if (sendBtn) {
  sendBtn.addEventListener('click', function() {
    var nombre  = document.getElementById('input-nombre').value.trim();
    var tel     = document.getElementById('input-tel').value.trim();
    var dir     = document.getElementById('input-dir').value.trim();
    var tarjeta = document.getElementById('input-tarjeta').value.trim();
    var errorEl = document.getElementById('modal-error');

    if (!nombre || !tel || !dir || !tarjeta) {
      if (errorEl) errorEl.textContent = '⚠️ Por favor completa todos los campos.';
      return;
    }
    if (errorEl) errorEl.textContent = '';

    var cardsProducts = document.querySelectorAll('.product-card');
    var lineas = [];
    var total = 0;

    cardsProducts.forEach(function(card) {
      var qtySpan = card.querySelector('.qty-value');
      if (qtySpan) {
        var qty = parseInt(qtySpan.textContent);
        if (qty > 0) {
          var name = card.getAttribute('data-name');
          var price = parseFloat(card.getAttribute('data-price'));
          lineas.push(qty + 'x ' + name);
          total += qty * price;
        }
      }
    });

    var msg = '---------------------------\n' +
              'Cliente: ' + nombre + '\n' +
              'Número: ' + tel + '\n' +
              'Dirección: ' + dir + '\n' +
              'Tarjeta Nº: ' + tarjeta + '\n' +
              '---------------------------\n' +
              'Pedido:\n' + lineas.join('\n') + '\n---------------------------\n' +
              'Total: $' + total.toFixed(2);

    var waBtnLocal = document.getElementById('whatsapp-btn');
    var phone = waBtnLocal ? waBtnLocal.getAttribute('data-phone') : '5359638868';
    var url = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
    closeModal();
  });
}

/* ── 6. GUARDAR DATOS DEL CLIENTE ───────────────────────── */
var camposCliente = ['input-nombre', 'input-tel', 'input-dir', 'input-tarjeta'];

function guardarDatosCliente() {
  camposCliente.forEach(function(id) {
    var campo = document.getElementById(id);
    if (campo) localStorage.setItem(id, campo.value);
  });
}

function cargarDatosCliente() {
  camposCliente.forEach(function(id) {
    var campo = document.getElementById(id);
    if (campo) {
      var valorGuardado = localStorage.getItem(id);
      if (valorGuardado) campo.value = valorGuardado;
    }
  });
}

camposCliente.forEach(function(id) {
  var campo = document.getElementById(id);
  if (campo) campo.addEventListener('input', guardarDatosCliente);
});

var modalPedidoBackdrop = document.getElementById('modal-backdrop');
if (modalPedidoBackdrop) {
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'class' && modalPedidoBackdrop.classList.contains('open')) {
        cargarDatosCliente();
      }
    });
  });
  observer.observe(modalPedidoBackdrop, { attributes: true });
}

/* ── 7. BOTÓN DE AYUDA PARA DIRECCIÓN ───────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  var helpBtn = document.getElementById('help-dir-btn');
  if (helpBtn) {
    helpBtn.addEventListener('click', function(e) {
      e.preventDefault();
      alert('📍 CONSEJO PARA TU DIRECCIÓN 📍\n\nEscribe tu dirección lo más detallada posible.\n\n✅ Incluye: calle, número, reparto y referencias.\n\n📝 Ejemplo: "Calle 13 #45 e/ 2da y 3ra, Reparto José Martí"');
    });
  }
});

/* ================================================================
   SISTEMA DE LOGIN POR URL ESPECIAL (NUEVO)
   ================================================================ */

const ADMIN_SECRET = 'admin';
const ADMIN_PASSWORD = 'admin123';

var loginBackdrop = document.getElementById('login-backdrop');
var loginClose = document.getElementById('login-close');
var loginSubmit = document.getElementById('login-submit-btn');
var adminPasswordField = document.getElementById('admin-password');
var loginErrorSpan = document.getElementById('login-error');
var adminFabButton = document.getElementById('admin-fab');

function checkUrlForAdminAccess() {
  var urlParams = new URLSearchParams(window.location.search);
  var adminKey = urlParams.get('acceso');
  
  if (adminKey === ADMIN_SECRET && loginBackdrop) {
    loginBackdrop.classList.add('open');
    loginBackdrop.setAttribute('aria-hidden', 'false');
    if (adminPasswordField) adminPasswordField.focus();
    
    var cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}

function isDeviceAuthorized() {
  var autorizado = localStorage.getItem('admin_autorizado');
  var expiracion = localStorage.getItem('admin_expira');
  
  if (!autorizado) return false;
  if (expiracion && Date.now() > parseInt(expiracion)) {
    localStorage.removeItem('admin_autorizado');
    localStorage.removeItem('admin_expira');
    return false;
  }
  return autorizado === 'true';
}

function authorizeDevice() {
  localStorage.setItem('admin_autorizado', 'true');
  var expiracion = Date.now() + (30 * 24 * 60 * 60 * 1000);
  localStorage.setItem('admin_expira', expiracion);
  if (adminFabButton) adminFabButton.style.display = 'flex';
}

function closeLoginModal() {
  if (loginBackdrop) {
    loginBackdrop.classList.remove('open');
    loginBackdrop.setAttribute('aria-hidden', 'true');
  }
  if (loginErrorSpan) loginErrorSpan.textContent = '';
  if (adminPasswordField) adminPasswordField.value = '';
}

if (loginSubmit) {
  loginSubmit.addEventListener('click', function() {
    var password = adminPasswordField ? adminPasswordField.value.trim() : '';
    if (password === ADMIN_PASSWORD) {
      authorizeDevice();
      closeLoginModal();
      alert('✅ Acceso concedido. El botón de administrador ya está disponible.');
    } else {
      if (loginErrorSpan) loginErrorSpan.textContent = '❌ Contraseña incorrecta.';
      if (adminPasswordField) {
        adminPasswordField.value = '';
        adminPasswordField.focus();
      }
    }
  });
}

if (loginClose) loginClose.addEventListener('click', closeLoginModal);
if (loginBackdrop) {
  loginBackdrop.addEventListener('click', function(e) {
    if (e.target === loginBackdrop) closeLoginModal();
  });
}
if (adminPasswordField) {
  adminPasswordField.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && loginSubmit) loginSubmit.click();
  });
}

function initAdminSystem() {
  if (isDeviceAuthorized() && adminFabButton) {
    adminFabButton.style.display = 'flex';
  }
  checkUrlForAdminAccess();
}

initAdminSystem();

if (adminFabButton) {
  adminFabButton.addEventListener('click', function() {
    alert('🛠️ Panel de administración en construcción.\n\nPróximamente podrás añadir, editar y eliminar productos.');
  });
}

/* ================================================================
   PANEL DE ADMINISTRACIÓN
   ================================================================ */

// Clave para guardar productos en localStorage
const STORAGE_KEY = 'dairy_marco_productos';

// Productos originales (copia de seguridad)
const PRODUCTOS_ORIGINALES = [
  { name: "Maní Cocinado", price: 130.00, category: "dulces", image: "img/maniC.jpg" },
  { name: "Maní Molido", price: 110.00, category: "dulces", image: "img/maniC.jpg" },
  { name: "Refresco de Lata Naranja", price: 250.00, category: "bebidas", image: "img/refrescoLataNaranja.jpg" }
];

// Variable para edición
var editingIndex = null;

/* ── CARGAR PRODUCTOS GUARDADOS ────────────────────────────── */
function loadProductos() {
  var guardados = localStorage.getItem(STORAGE_KEY);
  if (guardados) {
    return JSON.parse(guardados);
  } else {
    // Guardar productos originales por primera vez
    localStorage.setItem(STORAGE_KEY, JSON.stringify(PRODUCTOS_ORIGINALES));
    return [...PRODUCTOS_ORIGINALES];
  }
}

/* ── GUARDAR PRODUCTOS ─────────────────────────────────────── */
function saveProductos(productos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(productos));
}

/* ── RENDERIZAR LA PÁGINA CON LOS PRODUCTOS ───────────────── */
function renderizarPagina() {
  var productos = loadProductos();
  var productGrid = document.getElementById('product-grid');
  if (!productGrid) return;
  
  // Limpiar grid
  productGrid.innerHTML = '';
  
  // Crear cada tarjeta de producto
  productos.forEach(function(prod, index) {
    var article = document.createElement('article');
    article.className = 'product-card';
    article.setAttribute('data-category', prod.category);
    article.setAttribute('data-name', prod.name);
    article.setAttribute('data-price', prod.price);
    article.setAttribute('data-index', index);
    
    article.innerHTML = `
      <img src="${prod.image}" alt="${prod.name}" class="product-img" />
      <div class="product-info">
        <h2 class="product-name">${prod.name}</h2>
        <p class="product-price">$${prod.price.toFixed(2)}</p>
        <div class="qty-control">
          <button class="qty-btn qty-minus" aria-label="Restar">−</button>
          <span class="qty-value">0</span>
          <button class="qty-btn qty-plus" aria-label="Sumar">+</button>
        </div>
      </div>
    `;
    
    productGrid.appendChild(article);
  });
  
  // Re-inicializar los contadores (los eventos se pierden al re-renderizar)
  inicializarContadores();
}

/* ── INICIALIZAR CONTADORES DESPUÉS DE RENDERIZAR ─────────── */
function inicializarContadores() {
  var todasLasCards = document.querySelectorAll('.product-card');
  
  todasLasCards.forEach(function(card) {
    var minusBtn = card.querySelector('.qty-minus');
    var plusBtn = card.querySelector('.qty-plus');
    var qtySpan = card.querySelector('.qty-value');
    
    if (plusBtn) {
      plusBtn.addEventListener('click', function() {
        var current = parseInt(qtySpan.textContent);
        if (current < 50) {
          qtySpan.textContent = current + 1;
          card.classList.add('has-qty');
          if (typeof updateOrderBar === 'function') updateOrderBar();
        }
      });
    }
    
    if (minusBtn) {
      minusBtn.addEventListener('click', function() {
        var current = parseInt(qtySpan.textContent);
        if (current > 0) {
          qtySpan.textContent = current - 1;
          if (current - 1 === 0) card.classList.remove('has-qty');
          if (typeof updateOrderBar === 'function') updateOrderBar();
        }
      });
    }
  });
}

/* ── RENDERIZAR LISTA DE PRODUCTOS EN EL PANEL ADMIN ──────── */
function renderizarAdminLista() {
  var container = document.getElementById('admin-products-container');
  if (!container) return;
  
  var productos = loadProductos();
  
  if (productos.length === 0) {
    container.innerHTML = '<p class="admin-loading">No hay productos. Añade uno nuevo.</p>';
    return;
  }
  
  var html = '';
  productos.forEach(function(prod, index) {
    html += `
      <div class="admin-product-item" data-index="${index}">
        <div class="admin-product-info">
          <span class="admin-product-name">${prod.name}</span>
          <span class="admin-product-price">$${prod.price.toFixed(2)}</span>
          <span class="admin-product-category">${getCategoryName(prod.category)}</span>
        </div>
        <div class="admin-product-actions">
          <button class="admin-edit-btn" data-index="${index}" data-action="edit">✏️</button>
          <button class="admin-delete-btn" data-index="${index}" data-action="delete">🗑️</button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  
  // Agregar eventos a los botones
  document.querySelectorAll('.admin-edit-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      var idx = parseInt(btn.getAttribute('data-index'));
      editarProducto(idx);
    });
  });
  
  document.querySelectorAll('.admin-delete-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      var idx = parseInt(btn.getAttribute('data-index'));
      eliminarProducto(idx);
    });
  });
}

function getCategoryName(cat) {
  var categorias = { dulces: '🍬 Dulces', bebidas: '🥤 Bebidas', otros: '📦 Otros' };
  return categorias[cat] || cat;
}

/* ── EDITAR PRODUCTO ──────────────────────────────────────── */
function editarProducto(index) {
  var productos = loadProductos();
  var prod = productos[index];
  
  document.getElementById('admin-product-name').value = prod.name;
  document.getElementById('admin-product-price').value = prod.price;
  document.getElementById('admin-product-category').value = prod.category;
  document.getElementById('admin-product-image').value = prod.image;
  
  editingIndex = index;
  
  document.getElementById('admin-add-btn').style.display = 'none';
  document.getElementById('admin-update-btn').style.display = 'block';
  document.getElementById('admin-cancel-btn').style.display = 'block';
}

/* ── ELIMINAR PRODUCTO ────────────────────────────────────── */
function eliminarProducto(index) {
  if (confirm('¿Eliminar este producto permanentemente?')) {
    var productos = loadProductos();
    productos.splice(index, 1);
    saveProductos(productos);
    renderizarAdminLista();
    renderizarPagina();
  }
}

/* ── AÑADIR PRODUCTO ──────────────────────────────────────── */
function añadirProducto() {
  var name = document.getElementById('admin-product-name').value.trim();
  var price = parseFloat(document.getElementById('admin-product-price').value);
  var category = document.getElementById('admin-product-category').value;
  var image = document.getElementById('admin-product-image').value.trim();
  
  if (!name || isNaN(price) || price <= 0) {
    alert('⚠️ Nombre y precio válido son obligatorios');
    return;
  }
  
  if (!image) {
    image = 'https://placehold.co/400x300/2a1a0e/c8a96e?text=' + encodeURIComponent(name);
  }
  
  var productos = loadProductos();
  productos.push({ name: name, price: price, category: category, image: image });
  saveProductos(productos);
  
  limpiarFormularioAdmin();
  renderizarAdminLista();
  renderizarPagina();
}

/* ── ACTUALIZAR PRODUCTO ──────────────────────────────────── */
function actualizarProducto() {
  if (editingIndex === null) return;
  
  var name = document.getElementById('admin-product-name').value.trim();
  var price = parseFloat(document.getElementById('admin-product-price').value);
  var category = document.getElementById('admin-product-category').value;
  var image = document.getElementById('admin-product-image').value.trim();
  
  if (!name || isNaN(price) || price <= 0) {
    alert('⚠️ Nombre y precio válido son obligatorios');
    return;
  }
  
  if (!image) {
    image = 'https://placehold.co/400x300/2a1a0e/c8a96e?text=' + encodeURIComponent(name);
  }
  
  var productos = loadProductos();
  productos[editingIndex] = { name: name, price: price, category: category, image: image };
  saveProductos(productos);
  
  limpiarFormularioAdmin();
  renderizarAdminLista();
  renderizarPagina();
}

function limpiarFormularioAdmin() {
  document.getElementById('admin-product-name').value = '';
  document.getElementById('admin-product-price').value = '';
  document.getElementById('admin-product-category').value = 'dulces';
  document.getElementById('admin-product-image').value = '';
  
  editingIndex = null;
  document.getElementById('admin-add-btn').style.display = 'block';
  document.getElementById('admin-update-btn').style.display = 'none';
  document.getElementById('admin-cancel-btn').style.display = 'none';
}

function cancelarEdicion() {
  limpiarFormularioAdmin();
}

/* ── RESTAURAR CATÁLOGO ORIGINAL ──────────────────────────── */
function restaurarOriginal() {
  if (confirm('⚠️ Esto eliminará todos los productos personalizados y restaurará el catálogo original. ¿Continuar?')) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(PRODUCTOS_ORIGINALES));
    renderizarAdminLista();
    renderizarPagina();
  }
}

/* ── GUARDAR TODO (ya se guarda automáticamente) ──────────── */
function guardarTodo() {
  alert('✅ Los cambios ya están guardados automáticamente.');
}

/* ── ABRIR PANEL ADMIN ────────────────────────────────────── */
function abrirPanelAdmin() {
  var panelBackdrop = document.getElementById('admin-panel-backdrop');
  if (panelBackdrop) {
    renderizarAdminLista();
    panelBackdrop.classList.add('open');
    panelBackdrop.setAttribute('aria-hidden', 'false');
  }
}

function cerrarPanelAdmin() {
  var panelBackdrop = document.getElementById('admin-panel-backdrop');
  if (panelBackdrop) {
    panelBackdrop.classList.remove('open');
    panelBackdrop.setAttribute('aria-hidden', 'true');
  }
  limpiarFormularioAdmin();
}

/* ── CONECTAR EVENTOS DEL PANEL ADMIN ─────────────────────── */
function iniciarPanelAdmin() {
  var addBtn = document.getElementById('admin-add-btn');
  if (addBtn) addBtn.addEventListener('click', añadirProducto);
  
  var updateBtn = document.getElementById('admin-update-btn');
  if (updateBtn) updateBtn.addEventListener('click', actualizarProducto);
  
  var cancelBtn = document.getElementById('admin-cancel-btn');
  if (cancelBtn) cancelBtn.addEventListener('click', cancelarEdicion);
  
  var saveAllBtn = document.getElementById('admin-save-all-btn');
  if (saveAllBtn) saveAllBtn.addEventListener('click', guardarTodo);
  
  var resetBtn = document.getElementById('admin-reset-btn');
  if (resetBtn) resetBtn.addEventListener('click', restaurarOriginal);
  
  var panelClose = document.getElementById('admin-panel-close');
  if (panelClose) panelClose.addEventListener('click', cerrarPanelAdmin);
  
  var panelBackdrop = document.getElementById('admin-panel-backdrop');
  if (panelBackdrop) {
    panelBackdrop.addEventListener('click', function(e) {
      if (e.target === panelBackdrop) cerrarPanelAdmin();
    });
  }
  
  // Conectar el botón flotante con el panel
  var adminFab = document.getElementById('admin-fab');
  if (adminFab) {
    adminFab.addEventListener('click', abrirPanelAdmin);
  }
  
  // Renderizar la página con los productos guardados
  renderizarPagina();
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', iniciarPanelAdmin);
