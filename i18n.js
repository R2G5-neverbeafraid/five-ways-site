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
  /* Traduction à l'affichage des textes déjà fabriqués et sauvegardés (question, choix, narration…).
     Ils ont été générés dans la langue d'avant : on retrouve leur modèle dans le dictionnaire, dans un sens ou dans l'autre. */
  var IDX=null, PH=/\{#\d+\}|\{[a-z]+\}/g;
  function esc(t){ return t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
  function modele(src,dst){
    var noms=[],pat='',last=0,m; PH.lastIndex=0;
    while((m=PH.exec(src))){ pat+=esc(src.slice(last,m.index))+'([\\s\\S]+?)'; noms.push(m[0]); last=m.index+m[0].length; }
    if(!noms.length) return null;
    pat+=esc(src.slice(last));
    return {rx:new RegExp('^'+pat+'$'),noms:noms,dst:dst,len:src.length-noms.join('').length};
  }
  function construire(){
    IDX={fwd:[],rev:[],rm:{},pf:[],pr:[]};
    var E=window.EN;
    for(var k in E){
      if(!Object.prototype.hasOwnProperty.call(E,k)) continue;
      var v=E[k];
      if(!(v in IDX.rm)) IDX.rm[v]=k;
      var a=modele(k,v); if(a) IDX.fwd.push(a);
      var b=modele(v,k); if(b) IDX.rev.push(b);
      if(/ [—·:] $/.test(k)&&!PH.test(k)){ IDX.pf.push([k,v]); IDX.pr.push([v,k]); }
      PH.lastIndex=0;
    }
    IDX.fwd.sort(function(x,y){return y.len-x.len;}); IDX.rev.sort(function(x,y){return y.len-x.len;});
  }
  function remplir(a,m){
    var cap={}; a.noms.forEach(function(n,i){ if(!(n in cap)) cap[n]=m[i+1]; });
    return a.dst.replace(PH,function(n){ return n in cap?(n==='{r}'?window.__court(cap[n]):window.__s(cap[n])):n; });
  }
  window.__s=function(s){
    if(typeof s!=='string'||!s||!window.EN) return s;
    try{
      if(!IDX) construire();
      var E=window.EN, has=Object.prototype.hasOwnProperty;
      if(L==='en'){
        if(has.call(E,s)) return E[s];
        for(var i=0;i<IDX.fwd.length;i++){ var m=IDX.fwd[i].rx.exec(s); if(m) return remplir(IDX.fwd[i],m); }
        for(var j=0;j<IDX.pf.length;j++){ if(s.indexOf(IDX.pf[j][0])===0) return IDX.pf[j][1]+window.__s(s.slice(IDX.pf[j][0].length)); }
      } else {
        if(has.call(IDX.rm,s)) return IDX.rm[s];
        for(var i2=0;i2<IDX.rev.length;i2++){ var m2=IDX.rev[i2].rx.exec(s); if(m2) return remplir(IDX.rev[i2],m2); }
        for(var j2=0;j2<IDX.pr.length;j2++){ if(s.indexOf(IDX.pr[j2][0])===0) return IDX.pr[j2][1]+window.__s(s.slice(IDX.pr[j2][0].length)); }
      }
      if(s.indexOf(' · ')>0){ return s.split(' · ').map(window.__s).join(' · '); }
    }catch(e){}
    return s;
  };
  /* Nom court d'une équipe rivale (« les Lions » / « The Lions »). */
  window.__court=function(c){ c=String(c||''); if(L==='en'&&c.indexOf('les ')===0) return 'The '+c.slice(4); if(L==='fr'&&c.indexOf('The ')===0) return 'les '+c.slice(4); return c; };
  if(!window.__EN_INLINE) document.write('<script src="en.js?v=20261021d"><\/script><script src="en2.js?v=20261021d"><\/script>');
})();
