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

/* ── 2. CONTADORES DE CANTIDAD ──────────────────────────── */
cards.forEach(function(card) {
  var minusBtn = card.querySelector('.qty-minus');
  var plusBtn  = card.querySelector('.qty-plus');
  var qtySpan  = card.querySelector('.qty-value');

  plusBtn.addEventListener('click', function() {
    var current = parseInt(qtySpan.textContent);
    if (current < 50) { // máximo 50 unidades
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
  orderBar.classList.toggle('visible', t.items > 0);
  orderBar.setAttribute('aria-hidden', t.items > 0 ? 'false' : 'true');
}

/* ── 4. MODAL — abrir / cerrar ──────────────────────────── */
var backdrop   = document.getElementById('modal-backdrop');
var modalClose = document.getElementById('modal-close');

// Abrir modal al pulsar "Enviar pedido"
waBtn.addEventListener('click', function() {
  // ✅ VALIDACIÓN: verificar que haya productos seleccionados
  var totalItems = calcTotals().items;
  if (totalItems === 0) {
    alert('⚠️ Selecciona al menos un producto antes de pedir.');
    return; // No abre el modal
  }
  
  // Si hay productos, abrir modal
  backdrop.classList.add('open');
  backdrop.setAttribute('aria-hidden', 'false');
  document.getElementById('input-nombre').focus();
});

// Cerrar al pulsar la X
modalClose.addEventListener('click', closeModal);

// Cerrar al hacer clic fuera del cuadro
backdrop.addEventListener('click', function(e) {
  if (e.target === backdrop) closeModal();
});

function closeModal() {
  backdrop.classList.remove('open');
  backdrop.setAttribute('aria-hidden', 'true');
  var errorEl = document.getElementById('modal-error');
  if (errorEl) errorEl.textContent = '';
}

/* ── 5. ENVIAR PEDIDO POR WHATSAPP ───────────────────────── */
var sendBtn = document.getElementById('modal-send-btn');
if (sendBtn) {
sendBtn.addEventListener('click', function() {
    // Obtener valores de los campos
    var nombre  = document.getElementById('input-nombre').value.trim();
    var tel     = document.getElementById('input-tel').value.trim();
    var dir     = document.getElementById('input-dir').value.trim();
    var tarjeta = document.getElementById('input-tarjeta').value.trim();
    var errorEl = document.getElementById('modal-error');

    // Validar campos obligatorios (incluyendo tarjeta)
    if (!nombre || !tel || !dir || !tarjeta) {
      if (errorEl) errorEl.textContent = '⚠️ Por favor completa todos los campos (nombre, teléfono, dirección y número de tarjeta).';
      return;
    }
    if (errorEl) errorEl.textContent = '';

    // Obtener productos seleccionados
    var cards = document.querySelectorAll('.product-card');
    var lineas = [];
    var total = 0;

    cards.forEach(function(card) {
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

    // Construir mensaje
    var msg = '---------------------------' +
              '\nCliente: ' + nombre + '\n' +
              'Número: ' + tel + '\n' +
              'Dirección: ' + dir + '\n' +
              'Tarjeta Nº: ' + tarjeta + '\n' +
              '---------------------------' + '\n' +
              'Pedido:\n' + lineas.join('\n') + '\n---------------------------' +'\nTotal: $' + total.toFixed(2);

    // Obtener número de WhatsApp
    var waBtn = document.getElementById('whatsapp-btn');
    var phone = waBtn ? waBtn.getAttribute('data-phone') : '5359638868';
    var url = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(msg);

    // Abrir WhatsApp
    window.open(url, '_blank');

    // Cerrar modal
    closeModal();
});
}

/* ── 6. GUARDAR Y CARGAR DATOS DEL CLIENTE ─────────────────── */

// IDs de los campos que queremos guardar
var camposCliente = ['input-nombre', 'input-tel', 'input-dir', 'input-tarjeta'];

// Función para guardar todos los campos en localStorage
function guardarDatosCliente() {
  camposCliente.forEach(function(id) {
    var campo = document.getElementById(id);
    if (campo) {
      localStorage.setItem(id, campo.value);
    }
  });
}

// Función para cargar los datos guardados
function cargarDatosCliente() {
  camposCliente.forEach(function(id) {
    var campo = document.getElementById(id);
    if (campo) {
      var valorGuardado = localStorage.getItem(id);
      if (valorGuardado) {
        campo.value = valorGuardado;
      }
    }
  });
}

// Guardar automáticamente cuando el usuario escribe en cualquier campo
camposCliente.forEach(function(id) {
  var campo = document.getElementById(id);
  if (campo) {
    campo.addEventListener('input', guardarDatosCliente);
  }
});

// Cargar los datos cuando se abre el modal
var modalBackdrop = document.getElementById('modal-backdrop');
if (modalBackdrop) {
  // Observar cuando el modal se abre
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'class') {
        if (modalBackdrop.classList.contains('open')) {
          cargarDatosCliente();
        }
      }
    });
  });
  observer.observe(modalBackdrop, { attributes: true });
}

/* ── 7. BOTÓN DE AYUDA PARA LA DIRECCIÓN ── */

// Esperar a que todo el HTML esté cargado
document.addEventListener('DOMContentLoaded', function() {
  
  var helpBtn = document.getElementById('help-dir-btn');
  
  if (helpBtn) {
    helpBtn.addEventListener('click', function(e) {
      e.preventDefault();
      alert('📍 CONSEJO PARA TU DIRECCIÓN 📍\n\nEscribe tu dirección lo más detallada posible para que podamos entregarte sin demoras.\n\n✅ Incluye: calle, número entre calles, reparto y referencias (cerca de..., color de casa, etc.)\n\n📝 Ejemplo: "Calle 13 #45 e/ 2da y 3ra, Reparto José Martí, casa azul"');
    });
  }
});

/* ================================================================
   SISTEMA DE LOGIN POR URL ESPECIAL
   ================================================================ */

// Configuración
const ADMIN_SECRET = 'adminmarco';  // ← Cambia esto por la palabra clave que quieras
const ADMIN_PASSWORD = 'admin123';  // ← Cambia esto por la contraseña que quieras

// Elementos del login
var loginBackdrop = document.getElementById('login-backdrop');
var loginClose = document.getElementById('login-close');
var loginSubmit = document.getElementById('login-submit-btn');
var adminPassword = document.getElementById('admin-password');
var loginError = document.getElementById('login-error');
var adminFab = document.getElementById('admin-fab');

/* ── 1. DETECTAR URL ESPECIAL ────────────────────────────── */
function checkUrlForAdminAccess() {
  var urlParams = new URLSearchParams(window.location.search);
  var adminKey = urlParams.get('acceso');  // Busca ?acceso=xxxx
  
  if (adminKey === ADMIN_SECRET) {
    // Mostrar modal de login
    if (loginBackdrop) {
      loginBackdrop.classList.add('open');
      loginBackdrop.setAttribute('aria-hidden', 'false');
      if (adminPassword) adminPassword.focus();
    }
    
    // Limpiar la URL (quitar el parámetro para que no se vea feo)
    var cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}

/* ── 2. VERIFICAR SI EL DISPOSITIVO YA ESTÁ AUTORIZADO ───── */
function isDeviceAuthorized() {
  var autorizado = localStorage.getItem('admin_autorizado');
  var expiracion = localStorage.getItem('admin_expira');
  
  if (!autorizado) return false;
  
  // Verificar si ha expirado (30 días)
  if (expiracion) {
    if (Date.now() > parseInt(expiracion)) {
      localStorage.removeItem('admin_autorizado');
      localStorage.removeItem('admin_expira');
      return false;
    }
  }
  
  return autorizado === 'true';
}

/* ── 3. AUTORIZAR EL DISPOSITIVO ─────────────────────────── */
function authorizeDevice() {
  localStorage.setItem('admin_autorizado', 'true');
  // Autorización por 30 días
  var expiracion = Date.now() + (30 * 24 * 60 * 60 * 1000);
  localStorage.setItem('admin_expira', expiracion);
  showAdminButton();
}

/* ── 4. MOSTRAR BOTÓN DE ADMIN ───────────────────────────── */
function showAdminButton() {
  if (adminFab) {
    adminFab.style.display = 'flex';
  }
}

/* ── 5. OCULTAR BOTÓN DE ADMIN ───────────────────────────── */
function hideAdminButton() {
  if (adminFab) {
    adminFab.style.display = 'none';
  }
}

/* ── 6. CERRAR MODAL DE LOGIN ────────────────────────────── */
function closeLoginModal() {
  if (loginBackdrop) {
    loginBackdrop.classList.remove('open');
    loginBackdrop.setAttribute('aria-hidden', 'true');
  }
  if (loginError) loginError.textContent = '';
  if (adminPassword) adminPassword.value = '';
}

/* ── 7. VERIFICAR CONTRASEÑA Y AUTORIZAR ─────────────────── */
if (loginSubmit) {
  loginSubmit.addEventListener('click', function() {
    var password = adminPassword ? adminPassword.value.trim() : '';
    
    if (password === ADMIN_PASSWORD) {
      authorizeDevice();
      closeLoginModal();
      alert('✅ Acceso concedido. El botón de administrador ya está disponible.');
    } else {
      if (loginError) loginError.textContent = '❌ Contraseña incorrecta. Intenta de nuevo.';
      if (adminPassword) adminPassword.value = '';
      if (adminPassword) adminPassword.focus();
    }
  });
}

/* ── 8. CERRAR MODAL CON LA X ────────────────────────────── */
if (loginClose) {
  loginClose.addEventListener('click', closeLoginModal);
}

/* ── 9. CERRAR MODAL HACIENDO CLIC FUERA ─────────────────── */
if (loginBackdrop) {
  loginBackdrop.addEventListener('click', function(e) {
    if (e.target === loginBackdrop) closeLoginModal();
  });
}

/* ── 10. ENTER PARA ENVIAR CONTRASEÑA ────────────────────── */
if (adminPassword) {
  adminPassword.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (loginSubmit) loginSubmit.click();
    }
  });
}

/* ── 11. INICIALIZAR AL CARGAR LA PÁGINA ─────────────────── */
function initAdminSystem() {
  // Verificar si el dispositivo ya está autorizado
  if (isDeviceAuthorized()) {
    showAdminButton();
  }
  
  // Verificar si hay URL especial
  checkUrlForAdminAccess();
}

// Ejecutar al cargar
initAdminSystem();

/* ── 12. BOTÓN FLOTANTE PARA ABRIR PANEL (próximamente) ──── */
if (adminFab) {
  adminFab.addEventListener('click', function() {
    alert('🛠️ Panel de administración en construcción.\n\nPróximamente podrás añadir, editar y eliminar productos.');
    // Aquí luego agregaremos el código para abrir el panel admin
  });
}
