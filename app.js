// Datos: catálogo y servicios
const PRODUCTS = [
  { id:'logitech-teclado', name:'Teclado Mecánico logitech', price:279900, img:'https://www.logitechstore.com.co/cdn/shop/files/D_860126-MCO77165932415_062024-B.jpg?v=1749834665&width=600', desc:' teclas ajustadas para el rendimiento, G213 Prodigy combina lo mejor en sensación táctil y rendimiento para gaming.' },
  { id:'torre', name:'Torre Cpu Core Ultra 9 285 Intel Graphics 1tb 64gb Pc', price:5900000, img:'https://http2.mlstatic.com/D_NQ_NP_2X_787405-MCO84167809679_042025-F.webp', desc:'Control por app, escenas automatizadas' },
  { id:'silla Gamer', name:'Silla Gamer Titan Ergonómica con Masajeador y Reposapiés 135° Blanco', price:490000, img:'https://media.falabella.com/falabellaCO/140743878_01/w=1500,h=1500,fit=pad', desc:'Diseñada para brindarte una experiencia de trabajo sin igual, nuestra silla ofrece una combinación perfecta de comodidad y funcionalidad para largas horas de trabajo o estudio.' },
  { id:'mouse-pro', name:'Mouse Gamer Inalámbrico Logitech G305', price:199900, img:'https://www.logitechstore.com.co/cdn/shop/files/D_816380-MCO54981706246_042023-B_e6bb756c-ae8b-459d-9b73-52bf3f3bd42b.jpg?v=1749834184&width=600', desc:'Mouse inalámbrico para juegos LIGHTSPEED diseñado para un desempeño excelente con las innovaciones tecnológicas más recientes' },
];

const SERVICES = [
  { id:'svc-basic', name:'Mantenimiento Básico', price:80000, features:['Limpieza física','revisión y limpieza de ventiladores','optimización del sistema operativo (liberación de espacio, eliminación de archivos temporales)','actualización del antivirus','Revisión del disco duro'] },
  { id:'svc-adv', name:'Mantenimiento Avanzado', price:120000, features:[ 'Incluye todo lo del Plan Básico, más''revisión y reparación de errores del sistema','limpieza profunda del sistema (uso de herramientas profesionales)','actualización de drivers','Optimización de arranque y procesos en segundo plano','Análisis de seguridad intermedio' ] },
  { id:'svc-prem', name:'Mantenimiento Premium', price:180000, features:['Incluye todo lo del Plan Avanzado, más:','Soporte técnico remoto prioritario','Copia de seguridad (backup) de archivos importantes' ,'Restauración del sistema (si es necesario)' ,'Desinfección avanzada de virus, malware y spyware' ,'Informe técnico detallado','Asesoría en mejoras de hardware/software' ] },
];

// Estado carrito
let cart = JSON.parse(localStorage.getItem('ether-cart') || '[]');

// Utiles
const formatCOP = (n) => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);

// Init UI spots
document.addEventListener('DOMContentLoaded', ()=>{
  renderProducts();
  renderServices();
  renderCartUI();
  document.getElementById('year').textContent = new Date().getFullYear();

  // handlers
  document.getElementById('open-cart').addEventListener('click', ()=> showModal('cart-modal'));
  document.getElementById('close-cart').addEventListener('click', ()=> hideModal('cart-modal'));
  document.getElementById('to-checkout').addEventListener('click', ()=> { hideModal('cart-modal'); showModal('checkout-modal'); fillSummaryMini(); });
  document.getElementById('back-to-cart').addEventListener('click', ()=> { hideModal('checkout-modal'); showModal('cart-modal'); });
  document.getElementById('clear-cart').addEventListener('click', clearCart);
  document.getElementById('checkout-top').addEventListener('click', ()=> { if(cart.length) { showModal('checkout-modal'); fillSummaryMini(); } else alert('Carrito vacío'); });

  // Checkout submit
  document.getElementById('checkout-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    simulatePayment();
  });

  // receipt controls
  document.getElementById('close-checkout').addEventListener('click', ()=> hideModal('checkout-modal'));
  document.getElementById('close-receipt').addEventListener('click', ()=> hideModal('receipt-modal'));
  document.getElementById('print-receipt').addEventListener('click', ()=> { window.print(); });
  document.getElementById('finish').addEventListener('click', ()=> { hideModal('receipt-modal'); });
});

// Renders
function renderProducts(){
  const grid = document.querySelector('.product-grid');
  grid.innerHTML = '';
  PRODUCTS.forEach(p => {
    const card = document.createElement('div'); card.className='product-card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div class="title">${p.name}</div>
      <div class="small">${p.desc}</div>
      <div class="meta">
        <div class="price">${formatCOP(p.price)}</div>
        <div>
          <button class="btn-outline" onclick="addToCart('${p.id}','product')">Agregar</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderServices(){
  const grid = document.querySelector('.services-grid');
  grid.innerHTML = '';
  SERVICES.forEach(s=>{
    const el = document.createElement('div'); el.className='service';
    el.innerHTML = `
      <div class="title">${s.name}</div>
      <div class="small">${s.features.join(' · ')}</div>
      <div class="price">${formatCOP(s.price)}</div>
      <div style="margin-top:10px"><button class="btn-outline" onclick="addToCart('${s.id}','service')">Agregar</button></div>
    `;
    grid.appendChild(el);
  });
}

// Carrito: agregar
function addToCart(id, type){
  const src = type === 'service' ? SERVICES.find(x=>x.id===id) : PRODUCTS.find(x=>x.id===id);
  if(!src) return;
  const existing = cart.find(i=>i.id===id);
  if(existing) existing.qty++;
  else cart.push({ id: src.id, name: src.name, price: src.price, qty:1, type });
  saveCart(); renderCartUI();
  flashCount();
}

function saveCart(){ localStorage.setItem('ether-cart', JSON.stringify(cart)); }

function renderCartUI(){
  const container = document.getElementById('cart-items');
  container.innerHTML = '';
  if(!cart.length){ container.innerHTML = '<div class="small muted">Carrito vacío</div>'; updateTotals(); updateCount(); return; }
  cart.forEach(item=>{
    const row = document.createElement('div'); row.className='cart-row';
    row.innerHTML = `
      <div>
        <div style="font-weight:700">${item.name}</div>
        <div class="small">${item.type==='service'?'Servicio':'Producto'}</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="btn-outline" onclick="changeQty('${item.id}', -1)">-</button>
        <div style="width:28px;text-align:center">${item.qty}</div>
        <button class="btn-outline" onclick="changeQty('${item.id}', 1)">+</button>
        <div style="width:110px;text-align:right;font-weight:800">${formatCOP(item.qty * item.price)}</div>
        <button class="btn-outline" onclick="removeFromCart('${item.id}')">Quitar</button>
      </div>
    `;
    container.appendChild(row);
  });
  updateTotals(); updateCount();
}

function changeQty(id, delta){
  const it = cart.find(i=>i.id===id); if(!it) return;
  it.qty = Math.max(1, it.qty + delta); saveCart(); renderCartUI();
}
function removeFromCart(id){ cart = cart.filter(i=>i.id!==id); saveCart(); renderCartUI(); }

function clearCart(){ if(confirm('Vaciar carrito?')) { cart=[]; saveCart(); renderCartUI(); hideModal('cart-modal'); } }

function updateTotals(){
  const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const iva = Math.round(subtotal * 0.19);
  const total = subtotal + iva;
  document.getElementById('subtotal').textContent = formatCOP(subtotal);
  document.getElementById('iva').textContent = formatCOP(iva);
  document.getElementById('total').textContent = formatCOP(total);
  document.getElementById('subtotal-text')?.setAttribute('data', subtotal);
}

function updateCount(){ document.getElementById('cart-count').textContent = cart.reduce((s,i)=>s+i.qty,0) }
function flashCount(){ const el = document.getElementById('open-cart'); el.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:220}); updateCount(); }

// Modal helpers
function showModal(id){ document.getElementById(id).setAttribute('aria-hidden','false'); }
function hideModal(id){ document.getElementById(id).setAttribute('aria-hidden','true'); }

// Checkout summary mini
function fillSummaryMini(){
  const el = document.getElementById('summary-mini');
  if(!cart.length) el.innerHTML = '<div class="small muted">Carrito vacío</div>';
  else el.innerHTML = cart.map(i=>`${i.qty} × ${i.name} — ${formatCOP(i.qty * i.price)}`).join('<br>');
}

// Payment simulation
function simulatePayment(){
  // Basic validation
  const name = document.getElementById('cust-name').value.trim();
  const email = document.getElementById('cust-email').value.trim();
  const card = document.getElementById('card-number').value.replace(/\s/g,'');
  if(!name || !email){ alert('Ingresa nombre y correo'); return; }
  if(card.length < 12){ alert('Tarjeta inválida (demo)'); return; }

  // simulate
  const btn = document.querySelector('#checkout-form button[type="submit"]');
  btn.disabled = true; btn.textContent = 'Procesando...';

  setTimeout(()=> {
    const orderId = 'EN' + Date.now().toString().slice(-7);
    const subtotal = cart.reduce((s,i)=>s+i.qty*i.price,0);
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;

    const receiptHtml = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div><strong>EtherNext</strong><div class="small muted">Mantenimiento & Productos Automatizados</div></div>
        <div style="text-align:right"><div class="small muted">Orden</div><strong>${orderId}</strong></div>
      </div>
      <hr style="margin:8px 0;border:none;border-top:1px solid rgba(255,255,255,0.04)">
      <div><strong>Cliente:</strong> ${name} · <span class="small muted">${email}</span></div>
      <div style="margin-top:8px">
        ${cart.map(i=>`<div style="display:flex;justify-content:space-between;margin:6px 0"><div>${i.qty} x ${i.name}</div><div>${formatCOP(i.qty*i.price)}</div></div>`).join('')}
      </div>
      <hr style="margin:8px 0;border:none;border-top:1px solid rgba(255,255,255,0.04)">
      <div style="display:flex;justify-content:space-between"><div>Subtotal</div><div>${formatCOP(subtotal)}</div></div>
      <div style="display:flex;justify-content:space-between"><div>IVA (19%)</div><div>${formatCOP(iva)}</div></div>
      <div style="display:flex;justify-content:space-between;font-weight:700"><div>Total</div><div>${formatCOP(total)}</div></div>
      <div style="margin-top:8px" class="small muted">Pago: Tarjeta (simulada)</div>
      <div style="margin-top:6px" class="small muted">Gracias por su compra — comprobante DEMO.</div>
    `;

    document.getElementById('receipt-content').innerHTML = receiptHtml;
    hideModal('checkout-modal');
    showModal('receipt-modal');

    // Reset
    cart = []; saveCart(); renderCartUI();
    btn.disabled = false; btn.textContent = 'Pagar ahora';
  }, 1100);
}

// Partículas fondo (canvas)
(function initParticles(){
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let w, h, particles = [], count = 90;

  function resize(){ w = canvas.width = innerWidth; h = canvas.height = innerHeight; particles = []; for(let i=0;i<count;i++) particles.push(makeParticle()); }
  function makeParticle(){
    return {
      x: Math.random()*w,
      y: Math.random()*h,
      vx: (Math.random()-0.5)*0.6,
      vy: (Math.random()-0.5)*0.6,
      r: 1 + Math.random()*2.5,
      hue: 190 + Math.random()*80
    };
  }
  function step(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      p.x += p.vx; p.y += p.vy;
      if(p.x < -10) p.x = w+10; if(p.x> w+10) p.x=-10;
      if(p.y < -10) p.y = h+10; if(p.y> h+10) p.y=-10;
      const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*8);
      g.addColorStop(0, `hsla(${p.hue},100%,60%,0.12)`);
      g.addColorStop(0.5, `hsla(${p.hue},90%,60%,0.06)`);
      g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(step);
  }

  addEventListener('resize', resize);
  resize(); step();
})();



