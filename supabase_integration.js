// FamilyKids ERP - Integração Supabase desativada temporariamente.
// Motivo: vamos ajustar o projeto primeiro e só depois reconectar ao banco.
(function(){
  window.fkConnectSupabase = function(){ console.log('Supabase desativado nesta versão.'); return null; };
  window.fkSaveSnapshot = async function(){ alert('Supabase desativado nesta versão local.'); };
  window.fkLoadSnapshot = async function(){ alert('Supabase desativado nesta versão local.'); };
  window.fkSyncNormalized = async function(){ alert('Supabase desativado nesta versão local.'); };
})();
