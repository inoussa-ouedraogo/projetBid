// SmartBid Admin SPA bootstrap

const API_BASE = '';
const TOKEN_KEY = 'sb_token';
const appEl = document.getElementById('app');
const userBadgeEl = document.getElementById('user-badge');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

const state = {
  token: localStorage.getItem(TOKEN_KEY) || null,
  me: null,
};

function setToken(t) {
  state.token = t;
  if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch(path, opts = {}) {
  const headers = new Headers(opts.headers || {});
  headers.set('Content-Type', 'application/json');
  if (state.token) headers.set('Authorization', 'Bearer ' + state.token);
  const res = await fetch(API_BASE + path, { ...opts, headers });
  if (res.status === 401) {
    setToken(null);
    state.me = null;
    location.hash = '#/login';
    throw new Error('Unauthorized');
  }
  return res;
}

async function login(email, password) {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Login failed');
  }
  const data = await res.json();
  const rawToken = (data && (data.token || data.accessToken || data.access_token || data.jwt)) || '';
const trimmed = String(rawToken).trim();
const jwt = trimmed.startsWith('Bearer ') ? trimmed.slice(7) : trimmed;
if (!jwt) { throw new Error('Login did not return a token'); }
setToken(jwt);
  await loadMe();
  if (!state.me) {
    setToken(null);
    throw new Error('Authentication failed');
  }
  // Allow ADMIN and REPRESENTANT to use the console; other roles are blocked
  if (state.me.role !== 'ADMIN' && state.me.role !== 'REPRESENTANT') {
    setToken(null);
    throw new Error('Account not authorized');
  }
}

async function loadMe() {
  if (!state.token) { state.me = null; return; }
  const res = await apiFetch('/api/auth/me');
  if (res.ok) {
    state.me = await res.json();
  } else {
    state.me = null;
  }
}

function renderHeader() {
  if (state.me) {
    userBadgeEl.textContent = `${state.me.name || state.me.email} · ${state.me.role}`;
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
  } else {
    userBadgeEl.textContent = 'Guest';
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
  }
}

logoutBtn?.addEventListener('click', async () => {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } catch (_) {}
  setToken(null);
  state.me = null;
  renderHeaderRoleAware();
  location.hash = '#/login';
});

const Router = {
  routes: {},
  add(hash, viewFn) { this.routes[hash] = viewFn; },
  async go() {
    const h = location.hash || '#/dashboard';
    const view = this.routes[h] || ViewNotFound;
    // Guard
    if (h !== '#/login') {
      if (!state.token) { location.hash = '#/login'; return; }
      if (!state.me) await loadMe();
      const role = state.me && state.me.role;
const adminOnly = (h === '#/users' || h === '#/drafts' || h === '#/rep-drafts');
const repOnly = (h === '#/my-bidders');
if (!role) { location.hash = '#/login'; return; }
if (adminOnly && role !== 'ADMIN') { location.hash = '#/login'; return; }
if (repOnly && role !== 'REPRESENTANT') { location.hash = '#/login'; return; }
if (!adminOnly && !repOnly && !(role === 'ADMIN' || role === 'REPRESENTANT')) { location.hash = '#/login'; return; }
    }
    renderHeaderRoleAware();
    await view();
    applyTranslations();
  }
};

function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') el.className = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).forEach(ch => {
    if (ch == null) return;
    if (typeof ch === 'string') el.appendChild(document.createTextNode(ch));
    else el.appendChild(ch);
  });
  return el;
}

async function ViewLogin() {
  const emailId = 'email-' + Math.random().toString(36).slice(2);
  const passId = 'pass-' + Math.random().toString(36).slice(2);
  const form = h('form', { class: 'login-form' }, [
    h('h2', {}, 'Admin Login'),
    h('label', { for: emailId }, 'Email'),
    h('input', { id: emailId, type: 'email', required: true, placeholder: 'admin@example.com' }),
    h('label', { for: passId }, 'Password'),
    h('input', { id: passId, type: 'password', required: true, placeholder: '••••••••' }),
    h('div', { class: 'muted', style: 'margin:8px 0 0' }, 'Use your admin credentials.'),
    h('button', { type: 'submit', class: 'btn', style: 'margin-top:12px' }, 'Login'),
  ]);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('#' + emailId).value.trim();
    const password = form.querySelector('#' + passId).value;
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Signing in…';
    try {
      await login(email, password);
      renderHeaderRoleAware();
      location.hash = '#/dashboard';
    } catch (err) {
      alert(err.message || 'Login failed');
    } finally {
      btn.disabled = false; btn.textContent = 'Login';
    }
  });
  appEl.innerHTML = '';
  appEl.appendChild(form);
}

async function ViewDashboard() {
  appEl.innerHTML = '';
  const wrap = h('div', {}, [
    h('h2', {}, 'Dashboard'),
    h('p', { class: 'muted' }, 'Overview of key metrics.'),
    h('div', { class: 'grid' }, [
      h('div', { class: 'panel' }, [h('div', {}, 'Products'), h('div', { id: 'kpi-products' }, '—')]),
      h('div', { class: 'panel' }, [h('div', {}, 'Auctions'), h('div', { id: 'kpi-auctions' }, '—')]),
      h('div', { class: 'panel' }, [h('div', {}, 'Running'), h('div', { id: 'kpi-running' }, '—')]),
      h('div', { class: 'panel' }, [h('div', {}, 'Closed'), h('div', { id: 'kpi-closed' }, '—')]),
    ])
  ]);
  appEl.appendChild(wrap);
  try {
    const [prodRes, aucRes] = await Promise.all([
      apiFetch('/api/products'),
      apiFetch('/api/auctions'),
    ]);
    const products = prodRes.ok ? await prodRes.json() : [];
    const auctions = aucRes.ok ? await aucRes.json() : [];
    const running = auctions.filter(a => a.status === 'RUNNING').length;
    const closed = auctions.filter(a => a.status === 'CLOSED').length;
    document.getElementById('kpi-products').textContent = String(products.length);
    document.getElementById('kpi-auctions').textContent = String(auctions.length);
    document.getElementById('kpi-running').textContent = String(running);
    document.getElementById('kpi-closed').textContent = String(closed);
  } catch (e) {
    console.error(e);
  }
}

async function ViewComingSoon(title) {
  appEl.innerHTML = '';
  appEl.appendChild(h('div', {}, [
    h('h2', {}, title),
    h('p', { class: 'muted' }, 'This section will be available soon.'),
  ]));
}

async function ViewNotFound() {
  return ViewComingSoon('Not found');
}

Router.add('#/login', ViewLogin);
Router.add('#/dashboard', ViewDashboard);
Router.add('#/products', () => ViewComingSoon('Products'));
Router.add('#/auctions', () => ViewComingSoon('Auctions'));
Router.add('#/bids', () => ViewComingSoon('Bids'));
Router.add('#/users', () => ViewComingSoon('Users'));

window.addEventListener('hashchange', () => Router.go());

(async function bootstrap() {
  try {
    if (state.token) {
      await loadMe();
    }
  } catch (_) {}
  renderHeaderRoleAware();
  await Router.go();
})();

// minor styles via JS (for grid)
const style = document.createElement('style');
style.textContent = `
  .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  @media (min-width: 1000px) { .grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
  form.login-form { display: grid; gap: 8px; max-width: 360px; }
  form.login-form input { padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border); background: #0b1220; color: var(--text); }
`;
document.head.appendChild(style);

// ===== i18n: French runtime translation =====
const LANG = 'fr';
const translations = {
  'Dashboard': 'Tableau de bord',
  'Products': 'Produits',
  'Auctions': 'Enchères',
  'Drafts': 'Brouillons',
  'Rep Drafts': 'Brouillons représentants',
  'My Bidders': 'Mes enchérisseurs',
  'Bids': 'Offres',
  'Users': 'Utilisateurs',
  'Login': 'Connexion',
  'Logout': 'Déconnexion',
  'Guest': 'Invité',
  'Admin Login': 'Connexion administrateur',
  'Email': 'E-mail',
  'Password': 'Mot de passe',
  'Use your admin credentials.': 'Utilisez vos identifiants administrateur.',
  'Signing in…': 'Connexion…',
  'Overview of key metrics.': 'Aperçu des indicateurs clés.',
  'Running': 'En cours',
  'Closed': 'Terminées',
  'This section will be available soon.': 'Cette section sera disponible bientôt.',
  'Not found': 'Introuvable',
  'New Product': 'Nouveau produit',
  'Create, edit, delete products. Upload image after creation.': 'Créez, modifiez, supprimez des produits. Téléchargez une image après la création.',
  'Search by title/category...': 'Rechercher par titre/catégorie...',
  'Search': 'Rechercher',
  'ID': 'ID',
  'Title': 'Titre',
  'Category': 'Catégorie',
  'Base Price': 'Prix de base',
  'Image': 'Image',
  'Actions': 'Actions',
  'Edit': 'Modifier',
  'Upload Image': 'Téléverser une image',
  'Create Auction': 'Créer une enchère',
  'Delete': 'Supprimer',
  'Edit Product': 'Modifier le produit',
  'Description': 'Description',
  'Image URL (optional)': 'URL de l’image (optionnel)',
  'Upload image (optional)': 'Téléverser une image (optionnel)',
  'Save': 'Enregistrer',
  'Create': 'Créer',
  'Cancel': 'Annuler',
  'Select a category': 'Sélectionnez une catégorie',
  'Manage auctions and control their lifecycle.': 'Gérer les enchères et leur cycle de vie.',
  'Status': 'Statut',
  'Product': 'Produit',
  'Min/Max': 'Min/Max',
  'Start/End': 'Début/Fin',
  'Active': 'Actif',
  'Refresh': 'Actualiser',
  'Prev': 'Précédent',
  'Next': 'Suivant',
  'New Auction (Published after approval)': 'Nouvelle enchère (publiée après approbation)',
  'New Auction (Draft)': 'Nouvelle enchère (brouillon)',
  'Product ID': 'ID produit',
  'Currency (3 letters)': 'Devise (3 lettres)',
  'Start At': 'Début le',
  'End At': 'Fin le',
  'Participant Limit': 'Limite de participants',
  'Start': 'Démarrer',
  'Close': 'Clôturer',
  'Winner': 'Gagnant',
  'Delete this auction?': 'Supprimer cette enchère ?',
  'Close auction and pick winner now?': 'Clôturer l’enchère et choisir un gagnant maintenant ?',
  'Please select a product': 'Veuillez sélectionner un produit',
  'Loading products...': 'Chargement des produits…',
  'Select a product': 'Sélectionnez un produit',
  'My Bids': 'Mes offres',
  'Select an auction to view bids.': 'Sélectionnez une enchère pour voir les offres.',
  'Auction': 'Enchère',
  'Load': 'Charger',
  'User': 'Utilisateur',
  'Amount': 'Montant',
  'Created': 'Créé',
  'No bids yet.': 'Aucune offre pour le moment.',
  'Failed to load bidders.': 'Échec du chargement des enchérisseurs.',
  'Search users by email/name/phone': 'Rechercher des utilisateurs par e-mail/nom/téléphone',
  'Role': 'Rôle',
  'Manage roles and status.': 'Gérer les rôles et le statut.',
  'ACTIVE': 'ACTIF',
  'BLOCKED': 'BLOQUÉ',
  'Block': 'Bloquer',
  'Activate': 'Activer',
  'Save Role': 'Enregistrer le rôle',
  'Pending Auctions (Drafts)': 'Enchères en attente (brouillons)',
  'Auctions submitted by representatives and awaiting approval.': 'Enchères créées par les représentants en attente d’approbation.',
  'Approve': 'Approuver',
  'Representative Drafts': 'Brouillons des représentants',
  'Auctions created by REPRESENTANT and waiting for approval.': 'Enchères créées par des représentants et en attente d’approbation.',
  'My Auctions · Bidders': 'Mes enchères · Enchérisseurs',
  'See the list of people that bid on each of your auctions.': 'Voir la liste des personnes ayant enchéri sur chacune de vos enchères.',
  'View Bidders': 'Voir les enchérisseurs',
  'Unauthorized': 'Non autorisé',
  'Login failed': 'Échec de la connexion',
  'Account not authorized': 'Compte non autorisé',
  'Authentication failed': 'Échec de l’authentification',
  'Invalid product id': 'ID produit invalide',
  'Failed to save product': 'Échec de l’enregistrement du produit',
  'Upload failed': 'Échec du téléversement',
  'Product not found': 'Produit introuvable',
  'Delete this product?': 'Supprimer ce produit ?',
  'Auction not found': 'Enchère introuvable',
  'Failed to save auction': 'Échec de l’enregistrement de l’enchère',
  'Approve this auction? It will become scheduled and visible.': 'Approuver cette enchère ? Elle sera planifiée et visible.',
  'Approve this auction?': 'Approuver cette enchère ?',
  'Winner Bid:': 'Offre gagnante :',
  'User:': 'Utilisateur :',
  'Amount:': 'Montant :',
  'Loading…': 'Chargement…',
  'Please wait while the admin console initializes.': 'Veuillez patienter pendant l’initialisation de la console d’administration.',
  'Admin Console': 'Console d’administration',
  'YES': 'OUI',
  'NO': 'NON',
  'none': 'aucun',
  'Name': 'Nom',
  'Manage all auctions and control lifecycle.': 'Gérer toutes les enchères et leur cycle de vie.',
  'Your auctions (create new or edit your drafts; admin must approve to publish).': 'Vos enchères (créez ou modifiez vos brouillons; un administrateur doit approuver pour publier).',
  'Edit Auction': 'Modifier l’enchère',
  'New Auction': 'Nouvelle enchère',
  'Min Bid': 'Offre minimale',
  'Max Bid': 'Offre maximale',
  'No auctions found.': 'Aucune enchère trouvée.',
  'Bid ID': 'ID de l’offre',
  'Invalid auction id': 'ID d’enchère invalide'
};

function t(s) {
  try {
    if (LANG === 'fr' && typeof s === 'string' && translations[s]) return translations[s];
  } catch (_) {}
  return s;
}

function translateTextNodes(root) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
  let n;
  while ((n = walker.nextNode())) {
    const raw = n.nodeValue;
    if (!raw) continue;
    const trimmed = raw.trim();
    if (translations[trimmed]) {
      n.nodeValue = raw.replace(trimmed, translations[trimmed]);
    } else {
      for (const k in translations) {
        if (raw.includes(k)) {
          n.nodeValue = raw.split(k).join(translations[k]);
        }
      }
    }
  }
}

function translateAttributes(root) {
  if (!root) return;
  const ATTRS = ['placeholder', 'title', 'value', 'aria-label'];
  root.querySelectorAll('*').forEach(el => {
    ATTRS.forEach(a => {
      try {
        const v = el.getAttribute && el.getAttribute(a);
        if (v && translations[v]) el.setAttribute(a, translations[v]);
      } catch (_) {}
    });
  });
}

// Patch alert to translate message fragments
(function () {
  const _alert = window.alert ? window.alert.bind(window) : null;
  window.alert = function (msg) {
    try {
      if (typeof msg === 'string' && LANG === 'fr') {
        for (const k in translations) {
          if (msg.includes(k)) msg = msg.split(k).join(translations[k]);
        }
      }
    } catch (_) {}
    if (_alert) _alert(msg);
  };
})();

function applyTranslations() {
  if (LANG !== 'fr') return;
  const header = document.querySelector('header') || document.body;
  translateTextNodes(header);
  translateAttributes(header);
  translateTextNodes(appEl);
  translateAttributes(appEl);
  const footer = document.querySelector('footer');
  if (footer) {
    translateTextNodes(footer);
    translateAttributes(footer);
  }
}

// ====== Extended Admin Views and Utilities ======

// Additional helpers without breaking existing apiFetch
function authHeaders() {
  const headers = new Headers();
  if (state.token) headers.set('Authorization', 'Bearer ' + state.token);
  return headers;
}

async function apiFetchForm(path, formData, opts = {}) {
  const headers = authHeaders();
  // Do NOT set Content-Type for FormData; browser will set boundary
  const res = await fetch(API_BASE + path, {
    method: (opts.method || 'POST'),
    body: formData,
    headers
  });
  if (res.status === 401) {
    setToken(null);
    state.me = null;
    location.hash = '#/login';
    throw new Error('Unauthorized');
  }
  return res;
}

function fmtMoney(v, currency = 'EUR') {
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(v)); }
  catch (_) { return String(v); }
}

function elFromHTML(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstChild;
}

// ---------- Products ----------

async function ViewProducts() {
  appEl.innerHTML = '';
  const wrap = h('div', {}, [
    h('div', { class: 'header-row', style: 'display:flex;justify-content:space-between;align-items:center;gap:12px;' }, [
      h('h2', {}, 'Products'),
      h('div', {}, [
        h('button', { class: 'btn', id: 'btn-new-product' }, 'New Product')
      ])
    ]),
    h('div', { class: 'muted', style: 'margin-bottom:8px' }, 'Create, edit, delete products. Upload image after creation.'),
    h('div', { id: 'product-form-wrap', class: 'panel hidden' }),
    h('div', { class: 'panel' }, [
      h('div', { style: 'display:flex;gap:8px;margin-bottom:8px;' }, [
        h('input', { id: 'product-search', placeholder: 'Search by title/category...', style: 'flex:1;padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }),
        h('button', { class: 'btn outline', id: 'btn-search' }, 'Search')
      ]),
      elFromHTML(`<div style="overflow:auto;">
        <table class="table-list" style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">ID</th>
              <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Title</th>
              <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Category</th>
              <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Base Price</th>
              <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Image</th>
              <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Actions</th>
            </tr>
          </thead>
          <tbody id="product-rows"></tbody>
        </table>
      </div>`)
    ])
  ]);
  appEl.appendChild(wrap);

  document.getElementById('btn-new-product').addEventListener('click', () => showProductForm());
  document.getElementById('btn-search').addEventListener('click', () => loadProducts());
  document.getElementById('product-search').addEventListener('keydown', (e) => { if (e.key === 'Enter') loadProducts(); });

  async function loadProducts() {
    const q = document.getElementById('product-search').value.trim();
    const url = q ? `/api/products?q=${encodeURIComponent(q)}` : '/api/products';
    const res = await apiFetch(url);
    const items = res.ok ? await res.json() : [];
    const tb = document.getElementById('product-rows');
    tb.innerHTML = '';
    for (const p of items) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding:8px;border-bottom:1px solid var(--border);">${p.id ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${p.title ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${p.category ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${p.basePrice ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">
          ${p.imageUrl ? `<img src="${p.imageUrl}" alt="" style="height:36px;border-radius:6px;border:1px solid var(--border);" />` : '<span class="muted">none</span>'}
        </td>
        <td style="padding:8px;border-bottom:1px solid var(--border);display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn outline btn-edit" data-id="${p.id}">Edit</button>
          <button class="btn outline btn-upload" data-id="${p.id}">Upload Image</button>
          <button class="btn outline btn-auction" data-id="${p.id}">Create Auction</button>
          <button class="btn outline btn-del" data-id="${p.id}" style="color:var(--danger);border-color:var(--danger)">Delete</button>
        </td>
      `;
      tb.appendChild(tr);
    }
    tb.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', () => editProduct(btn.dataset.id)));
    tb.querySelectorAll('.btn-upload').forEach(btn => btn.addEventListener('click', () => uploadImage(btn.dataset.id)));
    tb.querySelectorAll('.btn-auction').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (!id || id === 'undefined' || !Number.isFinite(Number(id))) { alert('Invalid product id'); return; }
      window.__pendingAuctionProductId = id;
      location.hash = '#/auctions';
    }));
    tb.querySelectorAll('.btn-del').forEach(btn => btn.addEventListener('click', () => deleteProduct(btn.dataset.id)));
  }

  function showProductForm(existing) {
    const wrap = document.getElementById('product-form-wrap');
    wrap.classList.remove('hidden');
    const isEdit = !!existing;
    const titleId = 'pt-' + Math.random().toString(36).slice(2);
    const catId = 'pc-' + Math.random().toString(36).slice(2);
    const priceId = 'pp-' + Math.random().toString(36).slice(2);
    const descId = 'pd-' + Math.random().toString(36).slice(2);
    const imgId = 'pi-' + Math.random().toString(36).slice(2);
    const fileId = 'pf-' + Math.random().toString(36).slice(2);

    wrap.innerHTML = '';
    wrap.appendChild(h('form', { id: 'product-form' }, [
      h('h3', {}, isEdit ? 'Edit Product' : 'New Product'),
      h('label', { for: titleId }, 'Title'),
      h('input', { id: titleId, required: true, value: existing?.title ?? '', style: 'padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }),
      h('label', { for: catId }, 'Category'),
      (function() {
        const sel = h('select', { id: catId, required: true, style: 'padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' });
        const categories = [
          'SMARTPHONE',
          'ORDINATEUR_PORTABLE',
          'TELEVISEUR',
          'CONSOLE_JEUX',
          'ELECTROMENAGER',
          'MODE_BEAUTE',
          'AUTOMOBILE',
          'BRICOLAGE_OUTILS',
          'MAISON_DECORATION',
          'SPORT_LOISIRS',
          'AUTRE'
        ];
        sel.appendChild(h('option', { value: '' }, 'Select a category'));
        categories.forEach(c => sel.appendChild(h('option', { value: c, selected: (existing?.category || '') === c }, c)));
        return sel;
      })(),
      h('label', { for: priceId }, 'Base Price'),
      h('input', { id: priceId, type: 'number', step: '0.01', required: true, value: existing?.basePrice ?? '', style: 'padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }),
      h('label', { for: descId }, 'Description'),
      h('textarea', { id: descId, rows: 3, required: true, style: 'padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }, existing?.description ?? ''),
      h('label', { for: imgId }, 'Image URL (optional)'),
      h('input', { id: imgId, placeholder: 'https://via.placeholder.com/300', value: existing?.imageUrl ?? 'https://via.placeholder.com/300', style: 'padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }),
      h('label', { for: fileId }, 'Upload image (optional)'),
      h('input', { id: fileId, type: 'file', accept: 'image/*' }),
      h('div', { style: 'display:flex;gap:8px;margin-top:10px;' }, [
        h('button', { class: 'btn', type: 'submit' }, isEdit ? 'Save' : 'Create'),
        h('button', { class: 'btn outline', type: 'button', onclick: () => { wrap.classList.add('hidden'); wrap.innerHTML = ''; } }, 'Cancel')
      ])
    ]));

    const form = document.getElementById('product-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        title: document.getElementById(titleId).value.trim(),
        category: document.getElementById(catId).value.trim(),
        basePrice: Number(document.getElementById(priceId).value),
        description: document.getElementById(descId).value.trim(),
        imageUrl: document.getElementById(imgId).value.trim() || 'https://via.placeholder.com/300'
      };
      const btn = form.querySelector('button[type="submit"]'); btn.disabled = true;
      try {
        if (isEdit) {
          const res = await apiFetch(`/api/products/${existing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
          if (!res.ok) throw new Error(await res.text());
        } else {
          const res = await apiFetch('/api/products', { method: 'POST', body: JSON.stringify(payload) });
          if (!res.ok) throw new Error(await res.text());
          const created = await res.json();
          const fileInput = document.getElementById(fileId);
          if (fileInput && fileInput.files && fileInput.files[0]) {
            const fd = new FormData();
            fd.append('file', fileInput.files[0]);
            const up = await apiFetchForm(`/api/products/${created.id}/image`, fd, { method: 'POST' });
            if (!up.ok) {
              const msg = await up.text();
              console.warn('Image upload failed:', msg);
            }
          }
        }
        wrap.classList.add('hidden'); wrap.innerHTML = '';
        await loadProducts();
      } catch (err) {
        alert(err.message || 'Failed to save product');
      } finally {
        btn.disabled = false;
      }
    });
  }

  async function editProduct(id) {
    const res = await apiFetch(`/api/products/${id}`);
    if (!res.ok) { alert('Product not found'); return; }
    const p = await res.json();
    showProductForm(p);
  }

  async function uploadImage(id) {
    // simple dialog
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await apiFetchForm(`/api/products/${id}/image`, fd, { method: 'POST' });
        if (!res.ok) throw new Error(await res.text());
        await loadProducts();
      } catch (e) {
        alert(e.message || 'Upload failed');
      }
    };
    input.click();
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    const res = await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok || res.status === 204) {
      await loadProducts();
    } else {
      alert(await res.text());
    }
  }

  await loadProducts();
}

// ---------- Auctions ----------

async function ViewAuctions() {
  appEl.innerHTML = '';
  const stateA = { page: 0, size: 10, sort: 'createdAt,DESC' };

  const controls = h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;' }, [
    h('button', { class: 'btn', id: 'btn-new-auction' }, 'New Auction'),
    h('button', { class: 'btn outline', id: 'btn-refresh' }, 'Refresh'),
  ]);

  const tableWrap = elFromHTML(`<div class="panel" style="overflow:auto;">
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">ID</th>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Title</th>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Status</th>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Product</th>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Min/Max</th>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Start/End</th>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Actions</th>
        </tr>
      </thead>
      <tbody id="auction-rows"></tbody>
    </table>
  </div>`);

  const pager = elFromHTML(`<div style="display:flex;gap:8px;align-items:center;margin-top:8px;">
    <button class="btn outline" id="prev">Prev</button>
    <span id="page-label" class="muted">Page 1</span>
    <button class="btn outline" id="next">Next</button>
  </div>`);

  const formWrap = h('div', { id: 'auction-form-wrap', class: 'panel hidden', style: 'margin-bottom:8px;' });

  appEl.appendChild(h('div', {}, [
    h('h2', {}, 'Auctions'),
    h('div', { class: 'muted' }, 'Manage auctions and control their lifecycle.'),
    formWrap,
    controls,
    tableWrap,
    pager
  ]));

  document.getElementById('btn-new-auction').addEventListener('click', () => showAuctionForm());
  document.getElementById('btn-refresh').addEventListener('click', () => loadAuctions());
  pager.querySelector('#prev').addEventListener('click', () => { if (stateA.page > 0) { stateA.page--; loadAuctions(); } });
  pager.querySelector('#next').addEventListener('click', () => { stateA.page++; loadAuctions(); });

  async function loadAuctions() {
    const res = await apiFetch(`/api/auctions/paged?page=${stateA.page}&size=${stateA.size}&sort=${encodeURIComponent(stateA.sort)}`);
    const page = res.ok ? await res.json() : { content: [], number: 0, totalPages: 1 };
    const tb = document.getElementById('auction-rows');
    tb.innerHTML = '';
    for (const a of (page.content || [])) {
      const tr = document.createElement('tr');
      const start = a.startAt ? new Date(a.startAt).toLocaleString() : '';
      const end = a.endAt ? new Date(a.endAt).toLocaleString() : '';
      tr.innerHTML = `
        <td style="padding:8px;border-bottom:1px solid var(--border);">${a.id ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${a.title ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${a.status ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${a.productId ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${a.minBid ?? ''} / ${a.maxBid ?? ''} ${a.currency ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${start} → ${end}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn outline btn-edit" data-id="${a.id}">Edit</button>
          <button class="btn outline btn-start" data-id="${a.id}">Start</button>
          <button class="btn outline btn-close" data-id="${a.id}" style="color:var(--danger);border-color:var(--danger)">Close</button>
          <button class="btn outline btn-winner" data-id="${a.id}">Winner</button>
          <button class="btn outline btn-del" data-id="${a.id}" style="color:var(--danger);border-color:var(--danger)">Delete</button>
        </td>
      `;
      tb.appendChild(tr);
    }
    tb.querySelectorAll('.btn-edit').forEach(b => b.addEventListener('click', () => editAuction(b.dataset.id)));
    tb.querySelectorAll('.btn-start').forEach(b => b.addEventListener('click', () => startAuction(b.dataset.id)));
    tb.querySelectorAll('.btn-close').forEach(b => b.addEventListener('click', () => closeAuction(b.dataset.id)));
    tb.querySelectorAll('.btn-winner').forEach(b => b.addEventListener('click', () => viewWinner(b.dataset.id)));
    tb.querySelectorAll('.btn-del').forEach(b => b.addEventListener('click', () => deleteAuction(b.dataset.id)));
    document.getElementById('page-label').textContent = `Page ${Number(page.number) + 1} / ${Math.max(Number(page.totalPages) || 1, 1)}`;
  }

  function showAuctionForm(existing) {
    formWrap.classList.remove('hidden');
    const isEdit = !!existing;
    const pidId = 'ap-' + Math.random().toString(36).slice(2);
    const titleId = 'at-' + Math.random().toString(36).slice(2);
    const descId = 'ad-' + Math.random().toString(36).slice(2);
    const minId = 'amin-' + Math.random().toString(36).slice(2);
    const maxId = 'amax-' + Math.random().toString(36).slice(2);
    const curId = 'acur-' + Math.random().toString(36).slice(2);
    const startId = 'astart-' + Math.random().toString(36).slice(2);
    const endId = 'aend-' + Math.random().toString(36).slice(2);
    const limitId = 'alimit-' + Math.random().toString(36).slice(2);

    formWrap.innerHTML = '';
    formWrap.appendChild(h('form', { id: 'auction-form' }, [
      h('h3', {}, isEdit ? 'Edit Auction' : 'New Auction'),
      h('label', { for: pidId }, 'Product ID'),
      h('input', { id: pidId, type: 'number', value: existing?.productId ?? '', style: 'padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }),
      h('label', { for: titleId }, 'Title'),
      h('input', { id: titleId, value: existing?.title ?? '', style: 'padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }),
      h('label', { for: descId }, 'Description'),
      h('textarea', { id: descId, rows: 3, style: 'padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }, existing?.description ?? ''),
      h('label', { for: minId }, 'Min Bid'),
      h('input', { id: minId, type: 'number', step: '0.01', required: true, value: existing?.minBid ?? '', style: 'padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }),
      h('label', { for: maxId }, 'Max Bid'),
      h('input', { id: maxId, type: 'number', step: '0.01', required: true, value: existing?.maxBid ?? '', style: 'padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }),
      h('label', { for: curId }, 'Currency (3 letters)'),
      h('input', { id: curId, maxlength: 3, value: existing?.currency ?? 'EUR', style: 'padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }),
      h('label', { for: startId }, 'Start At'),
      h('input', { id: startId, type: 'datetime-local', required: true }),
      h('label', { for: endId }, 'End At'),
      h('input', { id: endId, type: 'datetime-local', required: true }),
      h('label', { for: limitId }, 'Participant Limit'),
      h('input', { id: limitId, type: 'number', min: 1, value: existing?.participantLimit ?? '', style: 'padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }),
      h('div', { style: 'display:flex;gap:8px;margin-top:10px;' }, [
        h('button', { class: 'btn', type: 'submit' }, isEdit ? 'Save' : 'Create'),
        h('button', { class: 'btn outline', type: 'button', onclick: () => { formWrap.classList.add('hidden'); formWrap.innerHTML = ''; } }, 'Cancel')
      ])
    ]));

    // prefill datetime-local from ISO
    if (existing?.startAt) document.getElementById(startId).value = new Date(existing.startAt).toISOString().slice(0,16);
    if (existing?.endAt) document.getElementById(endId).value = new Date(existing.endAt).toISOString().slice(0,16);

    document.getElementById('auction-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        productId: Number(document.getElementById(pidId).value),
        title: document.getElementById(titleId).value.trim(),
        description: document.getElementById(descId).value.trim(),
        minBid: Number(document.getElementById(minId).value),
        maxBid: Number(document.getElementById(maxId).value),
        currency: (document.getElementById(curId).value.trim() || 'EUR').toUpperCase(),
        startAt: new Date(document.getElementById(startId).value).toISOString(),
        endAt: new Date(document.getElementById(endId).value).toISOString(),
        participantLimit: Number(document.getElementById(limitId).value) || undefined
      };
      const btn = formWrap.querySelector('button[type="submit"]'); btn.disabled = true;
      try {
        if (isEdit) {
          const res = await apiFetch(`/api/auctions/${existing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
          if (!res.ok) throw new Error(await res.text());
        } else {
          const res = await apiFetch('/api/auctions', { method: 'POST', body: JSON.stringify(payload) });
          if (!res.ok) throw new Error(await res.text());
        }
        formWrap.classList.add('hidden'); formWrap.innerHTML = '';
        await loadAuctions();
      } catch (err) {
        alert(err.message || 'Failed to save auction');
      } finally {
        btn.disabled = false;
      }
    });
  }

  async function editAuction(id) {
    const res = await apiFetch(`/api/auctions/${id}`);
    if (!res.ok) { alert('Auction not found'); return; }
    const a = await res.json();
    showAuctionForm(a);
  }
  async function startAuction(id) {
    const res = await apiFetch(`/api/auctions/${id}/start`, { method: 'POST' });
    if (!res.ok) alert(await res.text());
    await loadAuctions();
  }
  async function closeAuction(id) {
    if (!confirm('Close auction and pick winner now?')) return;
    const res = await apiFetch(`/api/auctions/${id}/close`, { method: 'POST' });
    if (!res.ok) alert(await res.text());
    await loadAuctions();
  }
  async function viewWinner(id) {
    const res = await apiFetch(`/api/auctions/${id}/winner`);
    if (!res.ok) { alert(await res.text()); return; }
    const w = await res.json();
    alert(`Winner Bid:\nUser: ${w.userEmail ?? w.userId ?? 'n/a'}\nAmount: ${w.amount ?? w.value ?? 'n/a'}`);
  }
  async function deleteAuction(id) {
    if (!confirm('Delete this auction?')) return;
    const res = await apiFetch(`/api/auctions/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) alert(await res.text());
    await loadAuctions();
  }

  await loadAuctions();
}

// ---------- Bids ----------

async function ViewBids() {
  appEl.innerHTML = '';
  const role = state.me && state.me.role;
  if (role === 'REPRESENTANT') {
    const panel = elFromHTML(`<div class="panel" style="overflow:auto;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">ID</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Auction</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Amount</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Created</th>
          </tr>
        </thead>
        <tbody id="my-bid-rows"></tbody>
      </table>
    </div>`);
    appEl.appendChild(h('div', {}, [
      h('h2', {}, 'My Bids'),
      panel
    ]));
    async function loadMyBids() {
      const res = await apiFetch('/api/me/bids/paged?page=0&size=50&sort=createdAt,DESC');
      const page = res.ok ? await res.json() : { content: [] };
      const tb = document.getElementById('my-bid-rows');
      tb.innerHTML = '';
      for (const b of (page.content || [])) {
        const tr = document.createElement('tr');
        const created = b.createdAt ? new Date(b.createdAt).toLocaleString() : '';
        tr.innerHTML = `
          <td style="padding:8px;border-bottom:1px solid var(--border);">${b.id ?? ''}</td>
          <td style="padding:8px;border-bottom:1px solid var(--border);">${b.auctionId ?? ''}</td>
          <td style="padding:8px;border-bottom:1px solid var(--border);">${b.amount ?? ''}</td>
          <td style="padding:8px;border-bottom:1px solid var(--border);">${created}</td>
        `;
        tb.appendChild(tr);
      }
    }
    await loadMyBids();
    return;
  }
  const selectId = 'sel-' + Math.random().toString(36).slice(2);
  appEl.appendChild(h('div', {}, [
    h('h2', {}, 'Bids'),
    h('div', { class: 'muted' }, 'Select an auction to view bids.'),
    h('div', { class: 'panel', style: 'margin:8px 0;' }, [
      h('label', { for: selectId }, 'Auction'),
      h('select', { id: selectId, style: 'padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }),
      h('button', { class: 'btn outline', style: 'margin-left:8px;', id: 'btn-load-bids' }, 'Load')
    ]),
    elFromHTML(`<div class="panel" style="overflow:auto;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">ID</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">User</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Amount</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Created</th>
          </tr>
        </thead>
        <tbody id="bid-rows"></tbody>
      </table>
    </div>`)
  ]));

  async function loadAuctionsOptions() {
    const res = await apiFetch('/api/auctions/paged?page=0&size=50&sort=createdAt,DESC');
    const page = res.ok ? await res.json() : { content: [] };
    const sel = document.getElementById(selectId);
    sel.innerHTML = '';
    for (const a of (page.content || [])) {
      const opt = document.createElement('option');
      opt.value = a.id; opt.textContent = `${a.id} · ${a.title ?? ''} [${a.status ?? ''}]`;
      sel.appendChild(opt);
    }
  }

  async function loadBids() {
    const auctionId = document.getElementById(selectId).value;
    if (!auctionId) return;
    const res = await apiFetch(`/api/auctions/${auctionId}/bids/paged?page=0&size=50&sort=createdAt,DESC`);
    const page = res.ok ? await res.json() : { content: [] };
    const tb = document.getElementById('bid-rows');
    tb.innerHTML = '';
    for (const b of (page.content || [])) {
      const tr = document.createElement('tr');
      const created = b.createdAt ? new Date(b.createdAt).toLocaleString() : '';
      tr.innerHTML = `
        <td style="padding:8px;border-bottom:1px solid var(--border);">${b.id ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${b.userEmail ?? b.userId ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${b.amount ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${created}</td>
      `;
      tb.appendChild(tr);
    }
  }

  document.getElementById('btn-load-bids').addEventListener('click', loadBids);
  await loadAuctionsOptions();
}

// ---------- Users (Admin) ----------

async function ViewUsers() {
  appEl.innerHTML = '';
  const searchId = 'uq-' + Math.random().toString(36).slice(2);

  const panel = h('div', { class: 'panel' }, [
    h('div', { style: 'display:flex;gap:8px;margin-bottom:8px;' }, [
      h('input', { id: searchId, placeholder: 'Search users by email/name/phone', style: 'flex:1;padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }),
      h('button', { class: 'btn outline', id: 'btn-usearch' }, 'Search')
    ]),
    elFromHTML(`<div style="overflow:auto;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">ID</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Name</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Email</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Role</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Status</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Actions</th>
          </tr>
        </thead>
        <tbody id="user-rows"></tbody>
      </table>
    </div>`)
  ]);

  appEl.appendChild(h('div', {}, [
    h('h2', {}, 'Users'),
    h('div', { class: 'muted' }, 'Manage roles and status.'),
    panel
  ]));

  document.getElementById('btn-usearch').addEventListener('click', loadUsers);
  document.getElementById(searchId).addEventListener('keydown', (e) => { if (e.key === 'Enter') loadUsers(); });

  async function loadUsers() {
    const q = document.getElementById(searchId).value.trim();
    const res = await apiFetch(q ? `/api/admin/users?q=${encodeURIComponent(q)}` : '/api/admin/users');
    const users = res.ok ? await res.json() : [];
    const tb = document.getElementById('user-rows');
    tb.innerHTML = '';
    for (const u of users) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding:8px;border-bottom:1px solid var(--border);">${u.id}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${u.name ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${u.email ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">
          <select class="role-sel" data-id="${u.id}" style="padding:6px;border-radius:6px;background:#0b1220;color:var(--text);border:1px solid var(--border);">
            ${['VISITOR','USER','ADMIN','REPRESENTANT'].map(r => `<option value="${r}" ${u.role===r?'selected':''}>${r}</option>`).join('')}
          </select>
        </td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${u.status ? 'ACTIVE' : 'BLOCKED'}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);display:flex;gap:6px;">
          <button class="btn outline btn-toggle" data-id="${u.id}">${u.status ? 'Block' : 'Activate'}</button>
          <button class="btn outline btn-save-role" data-id="${u.id}">Save Role</button>
        </td>
      `;
      tb.appendChild(tr);
    }
    tb.querySelectorAll('.btn-toggle').forEach(b => b.addEventListener('click', () => toggleStatus(b.dataset.id)));
    tb.querySelectorAll('.btn-save-role').forEach(b => b.addEventListener('click', () => saveRole(b.dataset.id)));
  }

  async function toggleStatus(id) {
    // Fetch current row status text
    const row = [...document.querySelectorAll('#user-rows tr')].find(tr => tr.querySelector('.btn-toggle')?.dataset.id === id);
    const isActive = row?.children[4]?.textContent.includes('ACTIVE');
    const res = await apiFetch(`/api/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ status: !isActive }) });
    if (!res.ok) alert(await res.text());
    await loadUsers();
  }

  async function saveRole(id) {
    const sel = document.querySelector(`.role-sel[data-id="${id}"]`);
    const role = sel?.value;
    const res = await apiFetch(`/api/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
    if (!res.ok) alert(await res.text());
    await loadUsers();
  }

  await loadUsers();
}

// Re-bind routes to new views
Router.add('#/products', ViewProducts);
Router.add('#/auctions', ViewAuctions);
Router.add('#/bids', ViewBids);
Router.add('#/users', ViewUsers);

// If currently on one of these routes, re-render
if (['#/products','#/auctions','#/bids','#/users'].includes(location.hash)) {
  Router.go();
}
// ====== Admin Drafts Approval View (append) ======
function isAdmin() { return !!(state.me && state.me.role === 'ADMIN'); }

async function ViewDrafts() {
  if (!isAdmin()) { location.hash = '#/login'; return; }
  appEl.innerHTML = '';

  const table = elFromHTML(`<div class="panel" style="overflow:auto;">
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">ID</th>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Title</th>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Product</th>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Min/Max</th>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Start/End</th>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Actions</th>
        </tr>
      </thead>
      <tbody id="draft-rows"></tbody>
    </table>
  </div>`);

  appEl.appendChild(h('div', {}, [
    h('h2', {}, 'Pending Auctions (Drafts)'),
    h('div', { class: 'muted', style: 'margin-bottom:8px' }, 'Auctions submitted by representatives and awaiting approval.'),
    table
  ]));

  async function loadDrafts() {
    const res = await apiFetch('/api/admin/auctions/drafts');
    const items = res.ok ? await res.json() : [];
    const tb = document.getElementById('draft-rows');
    tb.innerHTML = '';
    for (const a of items) {
      const start = a.startAt ? new Date(a.startAt).toLocaleString() : '';
      const end = a.endAt ? new Date(a.endAt).toLocaleString() : '';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding:8px;border-bottom:1px solid var(--border);">${a.id ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${a.title ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${a.productId ?? ''} · ${a.productTitle ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${a.minBid ?? ''} / ${a.maxBid ?? ''} ${a.currency ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${start} → ${end}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn outline btn-approve" data-id="${a.id}">Approve</button>
        </td>
      `;
      tb.appendChild(tr);
    }
    tb.querySelectorAll('.btn-approve').forEach(b => b.addEventListener('click', () => approve(b.dataset.id)));
  }

  async function approve(id) {
    if (!confirm('Approve this auction? It will become scheduled and visible.')) return;
    const res = await apiFetch(`/api/admin/auctions/${id}/approve`, { method: 'PUT' });
    if (!res.ok) {
      alert(await res.text());
    }
    await loadDrafts();
  }

  await loadDrafts();
}

// Register route for drafts (admin only)
Router.add('#/drafts', ViewDrafts);

// ViewRepDrafts (admin only) - drafts created by REPRESENTANT
async function ViewRepDrafts() {
 if (!isAdmin()) { location.hash = '#/login'; return; }
 appEl.innerHTML = '';

 const table = elFromHTML(`<div class="panel" style="overflow:auto;">
   <table style="width:100%;border-collapse:collapse;">
     <thead>
       <tr>
         <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">ID</th>
         <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Title</th>
         <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Product</th>
         <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Min/Max</th>
         <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Start/End</th>
         <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Actions</th>
       </tr>
     </thead>
     <tbody id="rep-draft-rows"></tbody>
   </table>
 </div>`);

 appEl.appendChild(h('div', {}, [
   h('h2', {}, 'Representative Drafts'),
   h('div', { class: 'muted', style: 'margin-bottom:8px' }, 'Auctions created by REPRESENTANT and waiting for approval.'),
   table
 ]));

 async function loadRepDrafts() {
   const res = await apiFetch('/api/admin/auctions/rep-drafts');
   const items = res.ok ? await res.json() : [];
   const tb = document.getElementById('rep-draft-rows');
   tb.innerHTML = '';
   for (const a of items) {
     const start = a.startAt ? new Date(a.startAt).toLocaleString() : '';
     const end = a.endAt ? new Date(a.endAt).toLocaleString() : '';
     const tr = document.createElement('tr');
     tr.innerHTML = `
       <td style="padding:8px;border-bottom:1px solid var(--border);">${a.id ?? ''}</td>
       <td style="padding:8px;border-bottom:1px solid var(--border);">${a.title ?? ''}</td>
       <td style="padding:8px;border-bottom:1px solid var(--border);">${a.productId ?? ''} · ${a.productTitle ?? ''}</td>
       <td style="padding:8px;border-bottom:1px solid var(--border);">${a.minBid ?? ''} / ${a.maxBid ?? ''} ${a.currency ?? ''}</td>
       <td style="padding:8px;border-bottom:1px solid var(--border);">${start} → ${end}</td>
       <td style="padding:8px;border-bottom:1px solid var(--border);display:flex;gap:6px;flex-wrap:wrap;">
         <button class="btn outline btn-approve" data-id="${a.id}">Approve</button>
       </td>
     `;
     tb.appendChild(tr);
   }
   tb.querySelectorAll('.btn-approve').forEach(b => b.addEventListener('click', async () => {
     if (!confirm('Approve this auction?')) return;
     const res2 = await apiFetch(`/api/admin/auctions/${b.dataset.id}/approve`, { method: 'PUT' });
     if (!res2.ok) alert(await res2.text());
     await loadRepDrafts();
   }));
 }

 await loadRepDrafts();
}

// Register route for rep drafts (admin only)
Router.add('#/rep-drafts', ViewRepDrafts);
// Auto-navigate handling if someone is already on /#/drafts or /#/rep-drafts
if (location.hash === '#/drafts' || location.hash === '#/rep-drafts') {
  Router.go();
}
// ====== Enhanced header and Auctions view (role-aware, product picker, approval flow) ======

// Override header renderer to also toggle nav links by role
function renderHeaderRoleAware() {
  if (state.me) {
    userBadgeEl.textContent = `${state.me.name || state.me.email} · ${state.me.role}`;
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
  } else {
    userBadgeEl.textContent = 'Guest';
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
  }
  // Toggle links by role
  const draftsLink = document.querySelector('a.nav-link[href="#/drafts"]');
  const repDraftsLink = document.querySelector('a.nav-link[href="#/rep-drafts"]');
  const myBiddersLink = document.querySelector('a.nav-link[href="#/my-bidders"]');
  const usersLink = document.querySelector('a.nav-link[href="#/users"]');
  const role = state.me && state.me.role;
  const isAdmin = role === 'ADMIN';
  const isRep = role === 'REPRESENTANT';
  if (draftsLink) draftsLink.style.display = isAdmin ? '' : 'none';
  if (repDraftsLink) repDraftsLink.style.display = isAdmin ? '' : 'none';
  if (usersLink) usersLink.style.display = isAdmin ? '' : 'none';
  if (myBiddersLink) myBiddersLink.style.display = isRep ? '' : 'none';
}

// Improved Auctions View (ROLE-aware)
// - ADMIN: paged list of all auctions, full controls (start/close/winner/delete)
// - REPRESENTANT: list only “my” auctions (optionally filtered by status), create/edit; server enforces DRAFT on create
async function ViewAuctions2() {
  const role = state.me && state.me.role;
  const isAdmin = role === 'ADMIN';
  const isRep = role === 'REPRESENTANT';

  appEl.innerHTML = '';
  const stateA = { page: 0, size: 10, sort: 'createdAt,DESC', status: '' };

  const statusId = 'astat-' + Math.random().toString(36).slice(2);
  const controls = h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;' }, [
    h('button', { class: 'btn', id: 'btn-new-auction' }, 'New Auction'),
    h('button', { class: 'btn outline', id: 'btn-refresh' }, 'Refresh'),
    (isRep
      ? h('select', { id: statusId, style: 'padding:8px;border-radius:8px;background:#0b1220;color:var(--text);border:1px solid var(--border);' }, [
          h('option', { value: '' }, 'All Status'),
          ...['DRAFT','SCHEDULED','RUNNING','FINISHED','CANCELED'].map(s => h('option', { value: s }, s))
        ])
      : null),
  ]);

  const formWrap = h('div', { id: 'auction-form-wrap', class: 'panel hidden', style: 'margin-bottom:8px;' });

  const tableWrap = elFromHTML(`<div class="panel" style="overflow:auto;">
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">ID</th>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Title</th>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Status</th>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Product</th>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Min/Max</th>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Start/End</th>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Active</th>
          <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Actions</th>
        </tr>
      </thead>
      <tbody id="auction-rows"></tbody>
    </table>
  </div>`);

  const pager = elFromHTML(`<div style="display:flex;gap:8px;align-items:center;margin-top:8px;">
    <button class="btn outline" id="prev">Prev</button>
    <span id="page-label" class="muted">Page 1</span>
    <button class="btn outline" id="next">Next</button>
  </div>`);

  appEl.appendChild(h('div', {}, [
    h('h2', {}, 'Auctions'),
    h('div', { class: 'muted' }, isAdmin
      ? 'Manage all auctions and control lifecycle.'
      : 'Your auctions (create new or edit your drafts; admin must approve to publish).'),
    formWrap,
    controls,
    tableWrap,
    (isAdmin ? pager : h('div', {}))
  ]));

  if (window.__pendingAuctionProductId) {
    const pid = Number(window.__pendingAuctionProductId);
    window.__pendingAuctionProductId = null;
    if (Number.isFinite(pid) && pid > 0) {
      showAuctionForm({ productId: pid });
    }
  }
  document.getElementById('btn-new-auction').addEventListener('click', () => showAuctionForm());
  document.getElementById('btn-refresh').addEventListener('click', () => loadAuctions());
  if (isRep) {
    const sel = document.getElementById(statusId);
    sel.addEventListener('change', () => {
      stateA.status = sel.value;
      loadAuctions();
    });
  }
  if (isAdmin) {
    pager.querySelector('#prev').addEventListener('click', () => { if (stateA.page > 0) { stateA.page--; loadAuctions(); } });
    pager.querySelector('#next').addEventListener('click', () => { stateA.page++; loadAuctions(); });
  }

  async function loadAuctions() {
    let rows = [];
    let totalPages = 1;
    let pageNumber = 0;

    if (isAdmin) {
      const res = await apiFetch(`/api/auctions/paged?page=${stateA.page}&size=${stateA.size}&sort=${encodeURIComponent(stateA.sort)}`);
      const page = res.ok ? await res.json() : { content: [], number: 0, totalPages: 1 };
      rows = page.content || [];
      pageNumber = Number(page.number) || 0;
      totalPages = Math.max(Number(page.totalPages) || 1, 1);
    } else {
      const qs = stateA.status ? `?status=${encodeURIComponent(stateA.status)}` : '';
      const res = await apiFetch(`/api/auctions/mine${qs}`);
      rows = res.ok ? await res.json() : [];
    }

    const tb = document.getElementById('auction-rows');
    tb.innerHTML = '';
    for (const a of rows) {
      const start = a.startAt ? new Date(a.startAt).toLocaleString() : '';
      const end = a.endAt ? new Date(a.endAt).toLocaleString() : '';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding:8px;border-bottom:1px solid var(--border);">${a.id ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${a.title ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);"><span class="muted">${a.status ?? ''}</span></td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${a.productId ?? ''} · ${a.productTitle ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${a.minBid ?? ''} / ${a.maxBid ?? ''} ${a.currency ?? ''}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${start} → ${end}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);">${a.isActive ? 'YES' : 'NO'}</td>
        <td style="padding:8px;border-bottom:1px solid var(--border);display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn outline btn-edit" data-id="${a.id}">Edit</button>
          ${isAdmin ? `
            <button class="btn outline btn-start" data-id="${a.id}">Start</button>
            <button class="btn outline btn-close" data-id="${a.id}" style="color:var(--danger);border-color:var(--danger)">Close</button>
            <button class="btn outline btn-winner" data-id="${a.id}">Winner</button>
          ` : ''}
          <button class="btn outline btn-del" data-id="${a.id}" style="color:var(--danger);border-color:var(--danger)">Delete</button>
        </td>
      `;
      tb.appendChild(tr);
    }
    tb.querySelectorAll('.btn-edit').forEach(b => b.addEventListener('click', () => editAuction(b.dataset.id)));
    if (isAdmin) {
      tb.querySelectorAll('.btn-start').forEach(b => b.addEventListener('click', () => startAuction(b.dataset.id)));
      tb.querySelectorAll('.btn-close').forEach(b => b.addEventListener('click', () => closeAuction(b.dataset.id)));
      tb.querySelectorAll('.btn-winner').forEach(b => b.addEventListener('click', () => viewWinner(b.dataset.id)));
    }
    tb.querySelectorAll('.btn-del').forEach(b => b.addEventListener('click', () => deleteAuction(b.dataset.id)));

    if (isAdmin) {
      document.getElementById('page-label').textContent = `Page ${pageNumber + 1} / ${totalPages}`;
    }
  }

  async function fetchProducts() {
    const res = await apiFetch('/api/products');
    return res.ok ? await res.json() : [];
  }

  function showAuctionForm(existing) {
    formWrap.classList.remove('hidden');
    const isEdit = !!(existing && typeof existing.id !== 'undefined');
    const pidId = 'ap-' + Math.random().toString(36).slice(2);
    const titleId = 'at-' + Math.random().toString(36).slice(2);
    const descId = 'ad-' + Math.random().toString(36).slice(2);
    const minId = 'amin-' + Math.random().toString(36).slice(2);
    const maxId = 'amax-' + Math.random().toString(36).slice(2);
    const curId = 'acur-' + Math.random().toString(36).slice(2);
    const startId = 'astart-' + Math.random().toString(36).slice(2);
    const endId = 'aend-' + Math.random().toString(36).slice(2);
    const limitId = 'alimit-' + Math.random().toString(36).slice(2);
    const prodSelId = 'apsel-' + Math.random().toString(36).slice(2);

    formWrap.innerHTML = '';
    formWrap.appendChild(h('form', { id: 'auction-form' }, [
      h('h3', {}, isEdit ? 'Edit Auction' : (isAdmin ? 'New Auction (Published after approval)' : 'New Auction (Draft)')),
      h('label', { for: prodSelId }, 'Product'),
      // the select will be populated after render
      h('select', { id: prodSelId, required: true, style: 'padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }, [
        h('option', { value: '' }, 'Loading products...')
      ]),
      h('input', { id: pidId, type: 'number', value: existing?.productId ?? '', style: 'display:none' }),
      h('label', { for: titleId }, 'Title'),
      h('input', { id: titleId, value: existing?.title ?? '', style: 'padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }),
      h('label', { for: descId }, 'Description'),
      h('textarea', { id: descId, rows: 3, style: 'padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }, existing?.description ?? ''),
      h('label', { for: minId }, 'Min Bid'),
      h('input', { id: minId, type: 'number', step: '0.01', required: true, value: existing?.minBid ?? '', style: 'padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }),
      h('label', { for: maxId }, 'Max Bid'),
      h('input', { id: maxId, type: 'number', step: '0.01', required: true, value: existing?.maxBid ?? '', style: 'padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }),
      h('label', { for: curId }, 'Currency (3 letters)'),
      h('input', { id: curId, maxlength: 3, value: existing?.currency ?? 'EUR', style: 'padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }),
      h('label', { for: startId }, 'Start At'),
      h('input', { id: startId, type: 'datetime-local', required: true }),
      h('label', { for: endId }, 'End At'),
      h('input', { id: endId, type: 'datetime-local', required: true }),
      h('label', { for: limitId }, 'Participant Limit'),
      h('input', { id: limitId, type: 'number', min: 1, value: existing?.participantLimit ?? '', style: 'padding:8px;border-radius:8px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }),
      h('div', { style: 'display:flex;gap:8px;margin-top:10px;' }, [
        h('button', { class: 'btn', type: 'submit' }, isEdit ? 'Save' : 'Create'),
        h('button', { class: 'btn outline', type: 'button', onclick: () => { formWrap.classList.add('hidden'); formWrap.innerHTML = ''; } }, 'Cancel')
      ])
    ]));

    // Fill select with products
    (async () => {
      try {
        const products = await fetchProducts();
        const sel = document.getElementById(prodSelId);
        sel.innerHTML = '';
        sel.appendChild(h('option', { value: '' }, 'Select a product'));
        products.forEach(p => {
          sel.appendChild(h('option', { value: String(p.id), selected: existing?.productId === p.id }, `${p.id} · ${p.title}`));
        });
        sel.addEventListener('change', () => {
          const v = sel.value;
          document.getElementById(pidId).value = v || '';
        });
        // Preselect existing
        if (existing?.productId) {
          document.getElementById(pidId).value = String(existing.productId);
          sel.value = String(existing.productId);
        }
      } catch (_) {}
    })();

    // prefill datetime-local from ISO
    if (existing?.startAt) document.getElementById(startId).value = new Date(existing.startAt).toISOString().slice(0,16);
    if (existing?.endAt) document.getElementById(endId).value = new Date(existing.endAt).toISOString().slice(0,16);

    document.getElementById('auction-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const selEl = document.getElementById(prodSelId);
      const rawPid = (selEl && selEl.value) || document.getElementById(pidId).value;
      const productId = Number(rawPid);
      if (!productId) { alert('Please select a product'); return; }
      const payload = {
        productId,
        title: document.getElementById(titleId).value.trim(),
        description: document.getElementById(descId).value.trim(),
        minBid: Number(document.getElementById(minId).value),
        maxBid: Number(document.getElementById(maxId).value),
        currency: (document.getElementById(curId).value.trim() || 'EUR').toUpperCase(),
        startAt: new Date(document.getElementById(startId).value).toISOString(),
        endAt: new Date(document.getElementById(endId).value).toISOString(),
        participantLimit: Number(document.getElementById(limitId).value) || undefined
      };
      const btn = formWrap.querySelector('button[type="submit"]'); btn.disabled = true;
      try {
        if (isEdit) {
          const res = await apiFetch(`/api/auctions/${existing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
          if (!res.ok) throw new Error(await res.text());
        } else {
          const res = await apiFetch('/api/auctions', { method: 'POST', body: JSON.stringify(payload) });
          if (!res.ok) throw new Error(await res.text());
        }
        formWrap.classList.add('hidden'); formWrap.innerHTML = '';
        await loadAuctions();
      } catch (err) {
        alert(err.message || 'Failed to save auction');
      } finally {
        btn.disabled = false;
      }
    });
  }

  async function editAuction(id) {
    const nid = Number(id);
    if (!Number.isFinite(nid) || nid <= 0) { alert('Invalid auction id'); return; }
    const res = await apiFetch(`/api/auctions/${nid}`);
    if (!res.ok) { alert('Auction not found'); return; }
    const a = await res.json();
    showAuctionForm(a);
  }
  async function startAuction(id) {
    const nid = Number(id);
    if (!Number.isFinite(nid) || nid <= 0) { alert('Invalid auction id'); return; }
    const res = await apiFetch(`/api/auctions/${nid}/start`, { method: 'POST' });
    if (!res.ok) alert(await res.text());
    await loadAuctions();
  }
  async function closeAuction(id) {
    const nid = Number(id);
    if (!Number.isFinite(nid) || nid <= 0) { alert('Invalid auction id'); return; }
    if (!confirm('Close auction and pick winner now?')) return;
    const res = await apiFetch(`/api/auctions/${nid}/close`, { method: 'POST' });
    if (!res.ok) alert(await res.text());
    await loadAuctions();
  }
  async function viewWinner(id) {
    const nid = Number(id);
    if (!Number.isFinite(nid) || nid <= 0) { alert('Invalid auction id'); return; }
    const res = await apiFetch(`/api/auctions/${nid}/winner`);
    if (!res.ok) { alert(await res.text()); return; }
    const w = await res.json();
    alert(`Winner Bid:\nUser: ${w.userEmail ?? w.userId ?? 'n/a'}\nAmount: ${w.amount ?? w.value ?? 'n/a'}`);
  }
  async function deleteAuction(id) {
    const nid = Number(id);
    if (!Number.isFinite(nid) || nid <= 0) { alert('Invalid auction id'); return; }
    if (!confirm('Delete this auction?')) return;
    const res = await apiFetch(`/api/auctions/${nid}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) alert(await res.text());
    await loadAuctions();
  }

  await loadAuctions();
}

// Override route to enhanced view
Router.add('#/auctions', ViewAuctions2);
if (location.hash === '#/auctions') {
  Router.go();
}
// ====== View: My Bidders (REPRESENTANT only) ======
async function ViewMyBidders() {
  const role = state.me && state.me.role;
  if (role !== 'REPRESENTANT') { location.hash = '#/login'; return; }

  appEl.innerHTML = '';

  const wrap = h('div', {}, [
    h('h2', {}, 'My Auctions · Bidders'),
    h('div', { class: 'muted', style: 'margin-bottom:8px' }, 'See the list of people that bid on each of your auctions.'),
    h('div', { id: 'my-auctions-bidders', class: 'panel' })
  ]);
  appEl.appendChild(wrap);

  // Load my auctions (created by current user)
  const res = await apiFetch('/api/auctions/mine');
  const auctions = res.ok ? await res.json() : [];
  const container = document.getElementById('my-auctions-bidders');

  if (!auctions.length) {
    container.appendChild(h('div', { class: 'muted' }, 'No auctions found.'));
    return;
  }

  for (const a of auctions) {
    const sectionId = 'sect-' + a.id;
    const bidTableId = 'bids-' + a.id;

    const start = a.startAt ? new Date(a.startAt).toLocaleString() : '';
    const end = a.endAt ? new Date(a.endAt).toLocaleString() : '';

    const section = h('div', { id: sectionId, style: 'border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px;background:#0b1220;' }, [
      h('div', { style: 'display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;' }, [
        h('div', {}, [
          h('div', {}, `#${a.id} · ${a.title ?? ''}`),
          h('div', { class: 'muted', style: 'font-size:12px;' }, `${a.status ?? ''} · ${start} → ${end}`)
        ]),
        h('div', {}, [
          h('button', { class: 'btn outline', onclick: async () => { await loadBidders(a.id); } }, 'View Bidders')
        ])
      ]),
      elFromHTML(`<div style="overflow:auto;margin-top:8px;">
        <table style="width:100%;border-collapse:collapse;display:none;" id="${bidTableId}">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Bid ID</th>
              <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">User</th>
              <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Amount</th>
              <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Created</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>`)
    ]);

    container.appendChild(section);

    async function loadBidders(auctionId) {
      const tbEl = document.querySelector(`#${bidTableId}`);
      const body = tbEl.querySelector('tbody');
      body.innerHTML = '';
      // show table when loading
      tbEl.style.display = '';

      try {
        const resp = await apiFetch(`/api/auctions/${auctionId}/bids/paged?page=0&size=200&sort=createdAt,DESC`);
        const page = resp.ok ? await resp.json() : { content: [] };
        const rows = page.content || [];

        if (!rows.length) {
          body.innerHTML = `<tr><td colspan="4" style="padding:8px;border-bottom:1px solid var(--border);" class="muted">No bids yet.</td></tr>`;
          return;
        }

        for (const b of rows) {
          const created = b.createdAt ? new Date(b.createdAt).toLocaleString() : '';
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="padding:8px;border-bottom:1px solid var(--border);">${b.id ?? ''}</td>
            <td style="padding:8px;border-bottom:1px solid var(--border);">${b.userEmail ?? b.userId ?? ''}</td>
            <td style="padding:8px;border-bottom:1px solid var(--border);">${b.amount ?? ''}</td>
            <td style="padding:8px;border-bottom:1px solid var(--border);">${created}</td>
          `;
          body.appendChild(tr);
        }
      } catch (e) {
        body.innerHTML = `<tr><td colspan="4" style="padding:8px;border-bottom:1px solid var(--border);color:var(--danger);">Failed to load bidders.</td></tr>`;
      }
    }
  }
}

// Route registration for REPRESENTANT's bidders page
Router.add('#/my-bidders', ViewMyBidders);

// Auto-navigate if already on the route
if (location.hash === '#/my-bidders') {
  Router.go();
}