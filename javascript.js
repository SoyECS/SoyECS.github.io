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
