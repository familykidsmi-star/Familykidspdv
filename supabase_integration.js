(function(){
  const LS_KEY = 'fk_v14_masterpiece';
  let client = null;
  function cfgOk(){
    return window.FK_SUPABASE && window.FK_SUPABASE.url && window.FK_SUPABASE.anonKey && !String(window.FK_SUPABASE.url).includes('COLE_AQUI') && !String(window.FK_SUPABASE.anonKey).includes('COLE_AQUI');
  }
  function notify(msg){
    if (typeof toast === 'function') toast(msg); else alert(msg);
  }
  function getState(){
    try { if (typeof S !== 'undefined') return S; } catch(e) {}
    try { return JSON.parse(localStorage.getItem(LS_KEY)||'{}'); } catch(e) { return {}; }
  }
  function setState(data){
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    try { if (typeof S !== 'undefined') { Object.keys(S).forEach(k=>delete S[k]); Object.assign(S, data); if (typeof save === 'function') save(); if (typeof render === 'function') render(); } } catch(e) {}
  }
  window.fkConnectSupabase = function(){
    if (!cfgOk()) { notify('Preencha supabase_config.js com URL e anon key.'); return null; }
    if (!window.supabase) { notify('Biblioteca Supabase não carregou. Verifique internet.'); return null; }
    client = window.supabase.createClient(window.FK_SUPABASE.url, window.FK_SUPABASE.anonKey);
    notify('Supabase conectado.');
    return client;
  }
  function db(){ return client || window.fkConnectSupabase(); }
  window.fkSaveSnapshot = async function(){
    const supa = db(); if(!supa) return;
    const state = getState();
    const payload = { name: 'backup_atual', payload: state, updated_at: new Date().toISOString() };
    const { error } = await supa.from('app_snapshots').upsert(payload, { onConflict: 'name' });
    if(error) return notify('Erro ao salvar no Supabase: ' + error.message);
    notify('Backup salvo no Supabase.');
  }
  window.fkLoadSnapshot = async function(){
    const supa = db(); if(!supa) return;
    const { data, error } = await supa.from('app_snapshots').select('payload').eq('name','backup_atual').single();
    if(error) return notify('Erro ao carregar: ' + error.message);
    if(data && data.payload){ setState(data.payload); notify('Dados carregados do Supabase.'); }
  }
  window.fkSyncNormalized = async function(){
    const supa = db(); if(!supa) return;
    const state = getState();
    await window.fkSaveSnapshot();
    const products = (state.products||[]).map(p=>({
      legacy_id: String(p.id), sku: p.sku || String(p.id), name: p.name || 'Produto', category: p.cat || null,
      season: p.season || null, price: Number(p.price||0), cost: Number(p.cost||0), min_stock: Number(p.min||0),
      sizes: p.sizes || {}, photos: p.photos || [], archived: !!p.arch, updated_at: new Date().toISOString()
    }));
    const clients = (state.clients||[]).map(c=>({
      legacy_id: String(c.id||c.name), name: c.name || 'Cliente', phone: c.phone || null, child_profile: c.child || null,
      ticket: Number(c.ticket||0), updated_at: new Date().toISOString()
    }));
    const sales = (state.sales||[]).map(s=>({
      legacy_id: String(s.id), sale_date: s.date || new Date().toISOString(), client_name: s.client || 'Consumidor final',
      total: Number(s.total||0), raw: s, updated_at: new Date().toISOString()
    }));
    if(products.length){ const {error}=await supa.from('products').upsert(products,{onConflict:'legacy_id'}); if(error) return notify('Erro produtos: '+error.message); }
    if(clients.length){ const {error}=await supa.from('customers').upsert(clients,{onConflict:'legacy_id'}); if(error) return notify('Erro clientes: '+error.message); }
    if(sales.length){ const {error}=await supa.from('sales').upsert(sales,{onConflict:'legacy_id'}); if(error) return notify('Erro vendas: '+error.message); }
    notify('Sincronização concluída com tabelas reais.');
  }
  function addPanel(){
    if(document.getElementById('fk-sync-panel')) return;
    const panel=document.createElement('div');
    panel.id='fk-sync-panel';
    panel.style.cssText='position:fixed;right:14px;bottom:88px;z-index:9999;background:#fff;border:1px solid #eee4dc;border-radius:18px;box-shadow:0 14px 40px rgba(0,0,0,.12);padding:10px;display:flex;gap:8px;flex-wrap:wrap;max-width:310px';
    panel.innerHTML='<button class="btn" onclick="fkConnectSupabase()">🔌 Supabase</button><button class="btn" onclick="fkSaveSnapshot()">☁️ Salvar</button><button class="btn" onclick="fkLoadSnapshot()">⬇️ Carregar</button><button class="btn primary" onclick="fkSyncNormalized()">🔁 Sincronizar</button>';
    document.body.appendChild(panel);
  }
  window.addEventListener('load', addPanel);
})();
