(function(){
  const LS_KEY = 'fk_v14_masterpiece';
  let client = null;

  function cfgOk(){
    return window.FK_SUPABASE && window.FK_SUPABASE.url && window.FK_SUPABASE.anonKey &&
      !String(window.FK_SUPABASE.url).includes('COLE_AQUI') &&
      !String(window.FK_SUPABASE.anonKey).includes('COLE_AQUI');
  }

  function notify(msg){
    if (typeof toast === 'function') toast(msg); else console.log('[FamilyKids]', msg);
  }

  function getState(){
    try { if (typeof S !== 'undefined') return S; } catch(e) {}
    try { return JSON.parse(localStorage.getItem(LS_KEY)||'{}'); } catch(e) { return {}; }
  }

  function setState(data){
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    try {
      if (typeof S !== 'undefined') {
        Object.keys(S).forEach(k=>delete S[k]);
        Object.assign(S, data);
        if (typeof save === 'function') save();
        if (typeof render === 'function') render();
      }
    } catch(e) {}
  }

  window.fkConnectSupabase = function(){
    if (!cfgOk()) { notify('Supabase não configurado.'); return null; }
    if (!window.supabase) { notify('Biblioteca Supabase não carregou.'); return null; }
    client = window.supabase.createClient(window.FK_SUPABASE.url, window.FK_SUPABASE.anonKey);
    return client;
  };

  function db(){ return client || window.fkConnectSupabase(); }

  window.fkSaveSnapshot = async function(){
    const supa = db(); if(!supa) return;
    const state = getState();
    const payload = { name: 'backup_atual', payload: state, updated_at: new Date().toISOString() };
    const { error } = await supa.from('app_snapshots').upsert(payload, { onConflict: 'name' });
    if(error) return notify('Erro ao salvar no Supabase: ' + error.message);
    notify('Backup salvo no Supabase.');
  };

  window.fkLoadSnapshot = async function(){
    const supa = db(); if(!supa) return;
    const { data, error } = await supa.from('app_snapshots').select('payload').eq('name','backup_atual').single();
    if(error) return notify('Erro ao carregar: ' + error.message);
    if(data && data.payload){ setState(data.payload); notify('Dados carregados do Supabase.'); }
  };

  // Sincronização opcional, compatível com o banco FamilykidsPDV atual.
  window.fkSyncNormalized = async function(){
    const supa = db(); if(!supa) return;
    const state = getState();
    await window.fkSaveSnapshot();

    const products = (state.products||[]).map(p=>({
      sku: p.sku || String(p.id),
      barcode: p.barcode || null,
      name: p.name || 'Produto',
      short_description: p.type || null,
      season: p.season || null,
      cost: Number(p.cost||0),
      price: Number(p.price||0),
      min_stock: Number(p.min||0),
      status: p.arch ? 'archived' : 'active',
      catalog_visible: !p.arch,
      tags: [p.cat, p.type, p.color].filter(Boolean),
      updated_at: new Date().toISOString()
    }));

    if(products.length){
      const {error}=await supa.from('products').upsert(products,{onConflict:'sku'});
      if(error) return notify('Erro produtos: '+error.message);
    }
    notify('Sincronização concluída.');
  };

  // Produção: sem painel flutuante. As funções acima continuam disponíveis para manutenção técnica.
  window.addEventListener('load', function(){ if(cfgOk()) fkConnectSupabase(); });
})();
