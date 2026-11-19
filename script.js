'use strict';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const COP = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);

const WHATSAPP_NUMBER = '573142110418';

// Año en footer
$('#year').textContent = new Date().getFullYear();

// Menú móvil
const menuBtn = $('#menuBtn');
menuBtn.addEventListener('click', () => {
  const open = $('#nav').classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? '×' : '☰';
});

$$('#nav a').forEach((link) =>
  link.addEventListener('click', () => {
    $('#nav').classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.textContent = '☰';
  })
);

// Animación reveal al hacer scroll
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      }),
    { threshold: 0.08 }
  );
  $$('.reveal').forEach((el) => io.observe(el));
} else {
  $$('.reveal').forEach((el) => el.classList.add('visible'));
}

// Estado global de edición, modalidad y meses
let edition = 'standard';
let access = 'principal';

const comparisonPrices = {
  standard: { principal: 227000, secundaria: 155000 },
  ultimate: { principal: 295000, secundaria: 210000 },
};

const monthlyPrices = {
  principal: 30000,
  secundaria: 20000,
};

const editionNames = {
  standard: 'Standard',
  ultimate: 'Ultimate',
};

const accessNames = {
  principal: 'Cuenta Primaria',
  secundaria: 'Cuenta Secundaria',
};

const detailContent = {
  standard: {
    title: 'GTA VI · Standard Edition',
    description:
      'Descubre Vice City y el estado de Leonida en una nueva historia protagonizada por Jason y Lucia. La edición Standard está pensada para quienes quieren vivir la aventura principal.',
    features: [
      'Juego completo GTA VI (historia principal).',
      'Optimizado para PlayStation 5 y DualSense.',
      'Entrega digital guiada paso a paso.',
    ],
    note:
      '¿No sabes si elegir Primaria o Secundaria? Si te importan tus trofeos y jugar offline, elige Primaria. Si buscas gastar menos, elige Secundaria.',
  },
  ultimate: {
    title: 'GTA VI · Ultimate Edition',
    description:
      'Para quienes quieren arrancar en Vice City con contenido adicional, bonificaciones digitales y extras exclusivos de la edición especial.',
    features: [
      'Juego completo GTA VI + contenido extra de edición Ultimate.',
      'Optimizado para PlayStation 5 y DualSense.',
      'Entrega digital guiada paso a paso.',
    ],
    note:
      'Algunos bonos o contenidos consumibles pueden quedar asociados a la cuenta principal de activación. Consúltanos por WhatsApp si tienes dudas.',
  },
};

function updateUI() {
  const months = Number($('#months').value);
  const prices = comparisonPrices[edition];
  const buyPrice = prices[access];
  const monthlyRate = monthlyPrices[access];
  const rentalTotal = months * monthlyRate;

  // Actualizar tarjetas de compra
  $('#editionPrincipalPrice').innerHTML = `${COP(prices.principal)} <small>COP</small>`;
  $('#editionSecondaryPrice').innerHTML = `${COP(prices.secundaria)} <small>COP</small>`;
  $$('[data-edition-pill]').forEach((pill) => {
    pill.textContent = edition.toUpperCase();
  });

  // Actualizar ficha lateral
  const d = detailContent[edition];
  $('#editionDetailTitle').textContent = d.title;
  $('#editionDetailDescription').textContent = d.description;
  $('#editionDetailFeatures').replaceChildren(
    ...d.features.map((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      return li;
    })
  );
  $('#editionDetailNote').textContent = d.note;

  // Actualizar cotizador de alquiler
  const mesTxt = `${months} ${months === 1 ? 'mes' : 'meses'}`;
  $('#monthsLabel').textContent = mesTxt;
  $('#rentalValue').textContent = COP(rentalTotal);
  $('#monthlyBreakdown').textContent = `${mesTxt} × ${COP(monthlyRate)}/mes`;
  $('#quoteSelection').textContent = `${editionNames[edition]} · ${accessNames[access]} · ${mesTxt}`;
  $('#quoteMonthly').textContent = `Total alquiler: ${COP(rentalTotal)} COP`;

  // Comparativa de ahorro en tiempo real
  const savings = buyPrice - rentalTotal;
  const pctSaved = Math.round((savings / buyPrice) * 100);
  const ratioPct = Math.min(100, Math.round((rentalTotal / buyPrice) * 100));

  $('#buyCompareText').textContent = `vs. ${COP(buyPrice)} compra definitiva`;
  $('#savingsBarFill').style.width = `${ratioPct}%`;

  const badge = $('#savingsBadge');
  const alertBox = $('#breakevenAlert');

  if (savings > 0) {
    badge.textContent = `Ahorras ${COP(savings)} (${pctSaved}%)`;
    badge.classList.remove('is-warning');
  } else {
    badge.textContent = 'Supera el valor de compra';
    badge.classList.add('is-warning');
  }

  // Aviso inteligente si el alquiler alcanza >= 85% del precio de compra
  if (rentalTotal >= buyPrice * 0.85) {
    alertBox.hidden = false;
    $('#breakevenText').textContent =
      rentalTotal >= buyPrice
        ? `Alquilar ${mesTxt} (${COP(rentalTotal)}) te cuesta más que comprarla (${COP(buyPrice)}). Te conviene comprar la cuenta definitiva y quedártela para siempre.`
        : `Por ${mesTxt} (${COP(rentalTotal)}) estás muy cerca del valor de compra definitiva (${COP(buyPrice)}). Por poco más te quedas con el juego para siempre.`;
  } else {
    alertBox.hidden = true;
  }

  // Sincronizar botones activos
  $$('.tab, .edition-switch').forEach((btn) => {
    const active = btn.dataset.edition === edition;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  $$('.choice').forEach((btn) => {
    const active = btn.dataset.access === access;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  $$('.month-pill').forEach((pill) => {
    pill.classList.toggle('active', Number(pill.dataset.months) === months);
  });
}

// Listeners de edición, modalidad, pills y slider
$$('.tab, .edition-switch').forEach((btn) =>
  btn.addEventListener('click', () => {
    edition = btn.dataset.edition;
    updateUI();
  })
);

$$('.choice').forEach((btn) =>
  btn.addEventListener('click', () => {
    access = btn.dataset.access;
    updateUI();
  })
);

$$('.month-pill').forEach((pill) =>
  pill.addEventListener('click', () => {
    $('#months').value = pill.dataset.months;
    updateUI();
  })
);

$$('.card-rent-link').forEach((link) =>
  link.addEventListener('click', () => {
    access = link.dataset.rentPreset;
    updateUI();
  })
);

$('#months').addEventListener('input', updateUI);
updateUI();

// ==========================================
// CHECKOUT UNIFICADO (COMPRA / ALQUILER / PS5)
// ==========================================
const checkoutBackdrop = $('#checkoutBackdrop');
const paymentRates = { breb: 0, debit: 0, wompi: 0.03, mercado: 0.04, credit: 0.05 };
const paymentLabels = {
  breb: 'Llave Bre-B / Nequi',
  debit: 'Tarjeta débito',
  wompi: 'Wompi',
  mercado: 'Mercado Pago',
  credit: 'Tarjeta crédito',
};

let currentOrder = {
  icon: 'GTA',
  product: '',
  subtitle: '',
  price: 0,
  notice: '',
  buildMessage: () => '',
};

function setScrollLock() {
  document.body.classList.toggle(
    'no-scroll',
    !checkoutBackdrop.hidden || !$('#cookieBackdrop').hidden
  );
}

function updateCheckoutTotals() {
  const method = $('input[name="payment"]:checked').value;
  const fee = Math.round(currentOrder.price * paymentRates[method]);
  $('#subTotal').textContent = COP(currentOrder.price);
  $('#feeTotal').textContent = COP(fee);
  $('#grandTotal').textContent = COP(currentOrder.price + fee);
}

function openCheckout(order) {
  currentOrder = order;
  $('#orderIcon').textContent = order.icon;
  $('#orderProduct').textContent = order.product;
  $('#orderSubtitle').textContent = order.subtitle;
  $('#orderBase').textContent = COP(order.price);
  $('#checkoutNotice').textContent = order.notice;

  $('#orderConsent').checked = false;
  $('#confirmOrder').disabled = true;
  $('input[name="payment"][value="breb"]').checked = true;

  updateCheckoutTotals();
  checkoutBackdrop.hidden = false;
  setScrollLock();
  $('#checkoutClose').focus();
}

function closeCheckout() {
  checkoutBackdrop.hidden = true;
  setScrollLock();
}

// 1. Botones de compra GTA VI
$$('.buy-account').forEach((btn) =>
  btn.addEventListener('click', () => {
    access = btn.dataset.access;
    updateUI();
    const price = comparisonPrices[edition][access];
    const prod = `GTA VI ${editionNames[edition]} · ${accessNames[access]}`;
    openCheckout({
      icon: 'GTA',
      product: prod,
      subtitle: 'Compra definitiva · Acceso permanente',
      price,
      notice: 'Entrega digital guiada en minutos tras confirmar el pago por WhatsApp.',
      buildMessage: (methodLabel, total) =>
        `Hola, quiero COMPRAR ${prod} (Pago único: ${COP(price)}). Medio de pago preferido: ${methodLabel}. Total estimado: ${COP(total)}. ¿Me confirman disponibilidad y datos para pagar?`,
    });
  })
);

// 2. Botón del cotizador (Alquiler)
$('#quotePlanBtn').addEventListener('click', () => {
  const months = Number($('#months').value);
  const mesTxt = `${months} ${months === 1 ? 'mes' : 'meses'}`;
  const monthlyRate = monthlyPrices[access];
  const price = months * monthlyRate;
  const prod = `Alquiler GTA VI ${editionNames[edition]} · ${accessNames[access]}`;

  openCheckout({
    icon: 'GTA',
    product: prod,
    subtitle: `Alquiler por ${mesTxt} (${COP(monthlyRate)}/mes)`,
    price,
    notice: 'Entrega digital guiada en minutos. Puedes renovar al finalizar tu tiempo.',
    buildMessage: (methodLabel, total) =>
      `Hola, quiero ALQUILAR GTA VI ${editionNames[edition]} en modalidad ${accessNames[access]} por ${mesTxt} (${COP(price)}). Medio de pago preferido: ${methodLabel}. Total estimado: ${COP(total)}. ¿Me confirman disponibilidad para activar hoy?`,
  });
});

// 3. Botón de aviso inteligente ("Cambiar a compra definitiva")
$('#switchToBuyBtn').addEventListener('click', () => {
  const price = comparisonPrices[edition][access];
  const prod = `GTA VI ${editionNames[edition]} · ${accessNames[access]}`;
  openCheckout({
    icon: 'GTA',
    product: prod,
    subtitle: 'Compra definitiva · Acceso permanente',
    price,
    notice: 'Entrega digital guiada en minutos tras confirmar el pago por WhatsApp.',
    buildMessage: (methodLabel, total) =>
      `Hola, estuve cotizando el alquiler y prefiero COMPRAR ${prod} de forma definitiva (${COP(price)}). Medio de pago preferido: ${methodLabel}. Total estimado: ${COP(total)}.`,
  });
});

// 4. Botones de Consolas PS5
$$('.checkout-trigger').forEach((btn) =>
  btn.addEventListener('click', () => {
    const prod = btn.dataset.product;
    const price = Number(btn.dataset.price);
    openCheckout({
      icon: 'PS5',
      product: prod,
      subtitle: 'Consola PlayStation 5 · Envío nacional',
      price,
      notice: 'Envío no incluido. Confirmaremos inventario y costo de despacho por WhatsApp.',
      buildMessage: (methodLabel, total) =>
        `Hola, quiero consultar disponibilidad y envío para la consola ${prod}. Precio base: ${COP(price)}. Medio de pago preferido: ${methodLabel}. Total estimado: ${COP(total)}.`,
    });
  })
);

$('#checkoutClose').addEventListener('click', closeCheckout);
checkoutBackdrop.addEventListener('click', (e) => {
  if (e.target === checkoutBackdrop) closeCheckout();
});
$$('input[name="payment"]').forEach((r) => r.addEventListener('change', updateCheckoutTotals));
$('#orderConsent').addEventListener('change', (e) => {
  $('#confirmOrder').disabled = !e.target.checked;
});

$('#confirmOrder').addEventListener('click', () => {
  if (!$('#orderConsent').checked) return;
  const method = $('input[name="payment"]:checked').value;
  const fee = Math.round(currentOrder.price * paymentRates[method]);
  const total = currentOrder.price + fee;
  const message = currentOrder.buildMessage(paymentLabels[method], total);
  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
    '_blank',
    'noopener,noreferrer'
  );
});

// ==========================================
// PREFERENCIAS DE COOKIES (BAJO DEMANDA)
// ==========================================
const cookieBackdrop = $('#cookieBackdrop');
const cookieKey = 'pixelstock-v4-cookie-preferences';

function openCookies() {
  cookieBackdrop.hidden = false;
  setScrollLock();
  $('#cookieClose').focus();
}

function closeCookies() {
  cookieBackdrop.hidden = true;
  setScrollLock();
}

function saveCookies(analytics, marketing) {
  try {
    localStorage.setItem(
      cookieKey,
      JSON.stringify({
        necessary: true,
        analytics,
        marketing,
        savedAt: new Date().toISOString(),
      })
    );
  } catch (e) {
    // Ignorar errores de almacenamiento
  }
  closeCookies();
}

$('#cookiesSettings').addEventListener('click', openCookies);
$('#cookieClose').addEventListener('click', closeCookies);
$('#rejectCookies').addEventListener('click', () => saveCookies(false, false));
$('#acceptCookies').addEventListener('click', () =>
  saveCookies($('#analyticsCookies').checked, $('#marketingCookies').checked)
);
cookieBackdrop.addEventListener('click', (e) => {
  if (e.target === cookieBackdrop) closeCookies();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!checkoutBackdrop.hidden) closeCheckout();
    if (!cookieBackdrop.hidden) closeCookies();
  }
});
