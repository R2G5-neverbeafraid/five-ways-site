/* Langue : français (par défaut) ou anglais. Le choix est mémorisé ; changer de langue recharge la page. */
(function(){
  var L='fr';
  try{ var s=localStorage.getItem('five-ways-lang-v1'); if(s==='fr'||s==='en') L=s; else if(/^en/i.test(navigator.language||'')) L='en'; }
  catch(e){ if(/^en/i.test((navigator&&navigator.language)||'')) L='en'; }
  window.LANG=L; window.EN=window.EN||{};
  try{ document.documentElement.lang=L; }catch(e){}
  window.__=function(s){ return (L==='en'&&Object.prototype.hasOwnProperty.call(window.EN,s))?window.EN[s]:s; };
  window.__t=function(k,a){ return window.__(k).replace(/\{#(\d+)\}/g,function(m,i){ return a[i]; }); };
  window.changerLangue=function(){
    try{ localStorage.setItem('five-ways-lang-v1', L==='fr'?'en':'fr'); }catch(e){}
    try{ if(typeof sauvegarder==='function'&&typeof etat!=='undefined'&&etat) sauvegarder(); }catch(e){}
    location.reload();
  };
  if(L==='en'&&!window.__EN_INLINE) document.write('<script src="en.js"><\/script>');
})();
