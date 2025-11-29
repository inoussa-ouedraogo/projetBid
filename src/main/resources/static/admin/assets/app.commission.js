// Commission view: admin sets a global commission rate applied to all products/auctions
async function ViewCommission() {
  appEl.innerHTML = '';
  const rateId = 'c-rate-' + Math.random().toString(36).slice(2);
  const form = h('div', { class: 'panel', style: 'max-width:420px;display:flex;flex-direction:column;gap:12px;' }, [
    h('h2', {}, 'Commission globale'),
    h('p', { class: 'muted' }, 'Définis un pourcentage prélevé sur chaque vente/enchère.'),
    h('label', { for: rateId }, 'Commission (%)'),
    h('input', { id: rateId, type: 'number', step: '0.01', min: 0, max: 100, style: 'padding:10px;border-radius:10px;border:1px solid var(--border);background:#0b1220;color:var(--text);' }),
    h('div', { style: 'display:flex;gap:8px;' }, [
      h('button', { class: 'btn', id: 'btn-save-commission' }, 'Enregistrer')
    ])
  ]);
  appEl.appendChild(form);

  try {
    const res = await apiFetch('/api/admin/commission');
    if (res.ok) {
      const data = await res.json();
      document.getElementById(rateId).value = data.rate ?? '';
    }
  } catch (e) {
    console.warn('Unable to load commission', e);
  }

  document.getElementById('btn-save-commission').addEventListener('click', async () => {
    const val = Number(document.getElementById(rateId).value);
    if (!Number.isFinite(val) || val < 0) {
      alert('Valeur invalide');
      return;
    }
    const btn = document.getElementById('btn-save-commission');
    btn.disabled = true;
    try {
      const res = await apiFetch('/api/admin/commission', { method: 'PUT', body: JSON.stringify({ rate: val }) });
      if (!res.ok) throw new Error(await res.text());
      alert('Commission mise à jour');
    } catch (e) {
      alert(e.message || 'Echec sauvegarde');
    } finally {
      btn.disabled = false;
    }
  });
}
