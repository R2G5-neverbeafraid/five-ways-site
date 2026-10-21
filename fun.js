// Parties « fun » : tableau d'affichage, saison sportive, actualités, sons, vibration, défis du jour et badges.
// Aucun appel réseau : tout reste dans le navigateur (localStorage, WebAudio).

/* ---------- Tableau d'affichage ---------- */
function abrev(s){ return String(s||'').normalize('NFD').replace(/[^A-Za-z]/g,'').slice(0,3).toUpperCase()||'EQP'; }
function alea(n){ return Math.floor(Math.random()*n); }
function genererTableau(m){
  const f=etat.franchise;
  const dom=Math.random()<0.5;
  let na, nb, ca, cb;
  if(m.coupe){
    const pays=etat.pays&&etat.pays!=='Autre'?etat.pays:null;
    na=pays?abrev(pays):'SEL';
    const adv=pick(Object.keys(CONTINENTS).filter(p=>p!==pays));
    nb=abrev(adv); ca='#4C6FFF'; cb='#E5484D';
  } else {
    let opp=null;
    const rv=m.rivalId?rivaux().find(r=>r.id===m.rivalId):null;
    if(rv){ opp=rv.type==='equipe'?franchiseParId(String(rv.id).slice(3)):FRANCHISES.find(x=>x.ville+' '+x.nom===rv.equipe); }
    if(!opp||opp.id===f.id) opp=pick(FRANCHISES.filter(x=>x.id!==f.id));
    const col=dom?couleursMatch(f,opp):couleursMatch(opp,f);
    na=abrev(f.id); nb=abrev(opp.id);
    ca=dom?col.dom:col.ext; cb=dom?col.ext:col.dom;
  }
  let q, t, diff;
  const id=m.id;
  if(id==='prolongation'){ q=5; t='4:'+String(10+alea(40)); diff=0; }
  else if(id==='coupe_finale'||(id==='duel'&&Math.random()<0.5)){ q=4; t='0:0'+(2+alea(7)); diff=-(1+alea(2)); }
  else if(id==='faute_rapide'){ q=1; t='7:'+String(10+alea(40)); diff=pick([-2,0,1]); }
  else { q=pick([2,3,4,4,4]); t=(q===4?pick(['0','1','1','2']):String(2+alea(8)))+':'+String(10+alea(49)); diff=pick([-3,-2,-1,0,0,1,2]); }
  const base=62+alea(34);
  return {na,nb,ca,cb,q,t,a:base+diff,b:base,dom};
}
function scoreApres(tab,reussi){
  let a=tab.a, b=tab.b;
  if(reussi) a+=pick([2,3,3]); else b+=pick([2,2,3]);
  if(a===b) { if(reussi) a++; else b++; }
  return {a,b};
}

/* ---------- Saison sportive (bilan, classement, playoffs) ---------- */
const STADES=['Non qualifié','Éliminé au premier tour','Éliminé en demi-finales','Éliminé en finale de conférence','Finaliste','Champion'];
function genererSaisonSportive(titre,reussis,total,moyenne){
  const force=clamp(0.30+etat.meta.coteEquipe/160+etat.meta.alchimieEquipe/400+(total?reussis/total:0.5)*0.12+(moyenne-55)/300+(Math.random()-0.5)*0.12,0.2,0.88);
  let v=clamp(Math.round(82*force),12,72);
  let rang=clamp(1+Math.round((0.9-force)*17),1,15);
  let stade;
  if(titre){ v=Math.max(v,50); rang=Math.min(rang,6); stade=5; }
  else if(rang>8) stade=0;
  else { const maxR=rang<=2?4:rang<=5?3:rang<=7?2:1; stade=1+alea(maxR); if(stade>4) stade=4; }
  return {v,d:82-v,rang,stade};
}
function texteRang(r){ return r===1?'1er':r+'e'; }

/* ---------- Actualités (presse, fans, rival) ---------- */
const ACTUS={
  presse_ok:["{n} TUE LE MATCH","{n} : « Le sang-froid d'un vétéran »","La nuit de {n}","{ville} tient son homme","{n} répond présent quand ça compte"],
  presse_ko:["{n} sèche dans le money time","{n} a raté son rendez-vous","Nuit blanche pour {n}","Le tir de la peur pour {n}","{ville} doit-elle s'inquiéter ?"],
  fans_ok:["« MVP ! MVP ! » scande la salle","Les fans de {ville} chantent ton nom","Le nom de {n} explose sur les réseaux","Standing ovation à {ville}"],
  fans_ko:["Quelques sifflets dans la salle","Les fans veulent une revanche","Silence dans les gradins","Les supporters restent derrière toi malgré tout"],
  rival_ok:["{r} : « On se retrouvera. »","{r} te serre la main sans un mot","{r} minimise sa défaite en conférence de presse"],
  rival_ko:["{r} : « Trop facile ce soir. »","{r} savoure sur les réseaux","{r} te fait signe vers le banc"]
};
function genererActus(entree,rv){
  const n=etat.nom||'Le joueur', ville=etat.franchise.ville, ok=entree.reussi;
  const sub=t=>t.replace(/\{n\}/g,n).replace(/\{ville\}/g,ville).replace(/\{r\}/g,rv?rv.court:'');
  const res=[{src:'PRESSE',texte:sub(pick(ok?ACTUS.presse_ok:ACTUS.presse_ko))}];
  if(rv) res.push({src:'RIVAL',texte:sub(pick(ok?ACTUS.rival_ok:ACTUS.rival_ko))});
  else res.push({src:'FANS',texte:sub(pick(ok?ACTUS.fans_ok:ACTUS.fans_ko))});
  return res;
}

/* ---------- Sons (WebAudio, aucun fichier) et vibration ---------- */
const SON_KEY='five-ways-son-v1';
const Son={
  actif:true, ctx:null,
  init(){ try{ this.actif=localStorage.getItem(SON_KEY)!=='off'; }catch(e){} },
  basculer(){ this.actif=!this.actif; try{ localStorage.setItem(SON_KEY,this.actif?'on':'off'); }catch(e){} },
  ac(){ try{ if(!this.ctx){ const C=window.AudioContext||window.webkitAudioContext; if(!C) return null; this.ctx=new C(); } if(this.ctx.state==='suspended') this.ctx.resume(); return this.ctx; }catch(e){ return null; } },
  bip(freq,dur,type,vol,delai,glisse){
    if(!this.actif) return; const c=this.ac(); if(!c) return;
    const t=c.currentTime+(delai||0), o=c.createOscillator(), g=c.createGain();
    o.type=type||'sine'; o.frequency.setValueAtTime(freq,t); if(glisse) o.frequency.exponentialRampToValueAtTime(glisse,t+dur);
    g.gain.setValueAtTime(vol||0.15,t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+dur+0.02);
  },
  bruit(dur,vol,f0,f1,delai){
    if(!this.actif) return; const c=this.ac(); if(!c) return;
    const t=c.currentTime+(delai||0), n=Math.max(1,Math.floor(c.sampleRate*dur)), buf=c.createBuffer(1,n,c.sampleRate), d=buf.getChannelData(0);
    for(let i=0;i<n;i++) d[i]=Math.random()*2-1;
    const s=c.createBufferSource(); s.buffer=buf;
    const fl=c.createBiquadFilter(); fl.type='bandpass'; fl.frequency.setValueAtTime(f0,t); fl.frequency.exponentialRampToValueAtTime(f1,t+dur);
    const g=c.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+dur*0.3); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    s.connect(fl); fl.connect(g); g.connect(c.destination); s.start(t);
  },
  clic(){ this.bip(620,0.05,'triangle',0.08); },
  tic(){ this.bip(900,0.03,'square',0.04); },
  swish(){ this.bruit(0.45,0.5,3000,900); this.bip(520,0.12,'sine',0.08,0.05,760); },
  buzzer(){ this.bip(196,0.7,'sawtooth',0.12); this.bip(247,0.7,'sawtooth',0.07); },
  contre(){ this.bip(160,0.25,'sine',0.25,0,60); this.bruit(0.2,0.3,600,200); },
  foule(){ this.bruit(1.4,0.35,700,1400); },
  huee(){ this.bruit(1.0,0.25,500,250); },
  succes(){ this.bip(523,0.12,'triangle',0.12); this.bip(659,0.12,'triangle',0.12,0.1); this.bip(784,0.25,'triangle',0.12,0.2); }
};
function vibrer(p){ try{ if(navigator.vibrate) navigator.vibrate(p); }catch(e){} }
function iconeSon(){ return Son.actif
  ?'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4h4l6 4V6L7 10zM17 9a4 4 0 010 6"/></svg>'
  :'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4h4l6 4V6L7 10zM17 9l5 6M22 9l-5 6"/></svg>'; }
function monterBoutonSon(){
  if(document.getElementById('btn-son')) return;
  Son.init();
  const b=document.createElement('button');
  b.id='btn-son'; b.type='button'; b.setAttribute('aria-label','Activer ou couper le son');
  b.innerHTML=iconeSon();
  b.onclick=()=>{ Son.basculer(); b.innerHTML=iconeSon(); Son.clic(); };
  document.body.appendChild(b);
}

/* ---------- Jauge de geste ---------- */
const GESTES={scoring:['TIRER','SWISH !','LE TIR SORT'],defense:['CONTRER','STOP !','ILS PASSENT'],playmaking:['PASSER','QUELLE PASSE !','PASSE PERDUE'],athletisme:['ATTAQUER','EXPLOSIF !','CONTRÉ !'],basketIQ:['DÉCIDER','BIEN LU !','MAUVAIS CHOIX']};
let jaugeRaf=0;
function demarrerJauge(statCle,surArret){
  const zone=document.getElementById('jauge-zone'), curseur=document.getElementById('jauge-curseur'), bouton=document.getElementById('btn-geste');
  if(!zone||!curseur||!bouton) return;
  const largeur=0.17+(etat.stats[statCle]||50)/100*0.10;
  const centre=0.2+Math.random()*0.6;
  zone.style.left=((centre-largeur/2)*100)+'%'; zone.style.width=(largeur*100)+'%';
  const debut=performance.now(), periode=1500;
  let fini=false, pos=0;
  const tick=now=>{
    if(fini) return;
    const ph=((now-debut)%periode)/periode; pos=ph<0.5?ph*2:2-ph*2;
    curseur.style.left=(pos*100)+'%';
    if(now-debut>7000){ arreter(true); return; }
    jaugeRaf=requestAnimationFrame(tick);
  };
  const arreter=auto=>{
    if(fini) return; fini=true; cancelAnimationFrame(jaugeRaf);
    const d=Math.abs(pos-centre);
    let label, bonus;
    if(auto){ label='rate'; bonus=-0.06; }
    else if(d<=largeur/2){ label='parfait'; bonus=0.10; }
    else if(d<=largeur*0.95){ label='bon'; bonus=0.04; }
    else { label='rate'; bonus=-0.05; }
    bouton.disabled=true;
    surArret({label,bonus});
  };
  bouton.onclick=()=>arreter(false);
  jaugeRaf=requestAnimationFrame(tick);
}

/* ---------- Compteurs animés ---------- */
function animerCompteurs(){
  document.querySelectorAll('.cnt').forEach(el=>{
    const cible=Number(el.dataset.v)||0, dur=700, debut=performance.now();
    const calme=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(calme){ el.textContent=String(cible); return; }
    const tick=now=>{ const p=Math.min(1,(now-debut)/dur); el.textContent=String(Math.round(cible*(1-Math.pow(1-p,3)))); if(p<1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
}

/* ---------- Défis du jour et badges ---------- */
const DEFIS_KEY='five-ways-defis-v1', BADGES_KEY='five-ways-badges-v1';
const DEFIS_FACILES=[
  {id:'m3',nom:'Réussis 3 moments de match',evt:'match_ok',cible:3},
  {id:'s2',nom:'Joue 2 saisons',evt:'saison',cible:2},
  {id:'p3',nom:'Réussis 3 gestes parfaits',evt:'parfait',cible:3}
];
const DEFIS_MOYENS=[
  {id:'m6',nom:'Réussis 6 moments de match',evt:'match_ok',cible:6},
  {id:'s4',nom:'Joue 4 saisons',evt:'saison',cible:4},
  {id:'c1',nom:'Réussis un moment décisif',evt:'clutch',cible:1},
  {id:'d1',nom:'Bats un rival en duel',evt:'duel_ok',cible:1}
];
const DEFIS_DIFFICILES=[
  {id:'med',nom:'Remporte une médaille',evt:'medaille',cible:1},
  {id:'tit',nom:'Gagne un titre',evt:'titre',cible:1},
  {id:'all',nom:'Sois sélectionné All-Star',evt:'allstar',cible:1}
];
const BADGES=[
  {id:'titre',nom:'Premier titre'},{id:'allstar',nom:'All-Star'},{id:'mvp',nom:'MVP'},
  {id:'medaille',nom:'Médaillé'},{id:'or',nom:'Médaille d\'or'},{id:'parfait20',nom:'Geste d\'or'},
  {id:'veteran',nom:'Vétéran'},{id:'legende',nom:'Légende'},{id:'duelliste',nom:'Roi du duel'}
];
function jourCle(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function graine(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
function defisDuJour(jour){
  const g=graine(jour);
  return [DEFIS_FACILES[g%DEFIS_FACILES.length],DEFIS_MOYENS[(g>>>3)%DEFIS_MOYENS.length],DEFIS_DIFFICILES[(g>>>6)%DEFIS_DIFFICILES.length]];
}
function lireJson(cle,def){ try{ const v=JSON.parse(localStorage.getItem(cle)||'null'); return v&&typeof v==='object'?v:def; }catch(e){ return def; } }
function ecrireJson(cle,v){ try{ localStorage.setItem(cle,JSON.stringify(v)); }catch(e){} }
function etatDefis(){
  const jour=jourCle();
  let d=lireJson(DEFIS_KEY,null);
  if(!d||d.jour!==jour||typeof d.prog!=='object'||d.prog===null||!Array.isArray(d.faits)) d={jour,prog:{},faits:[]};
  return d;
}
function etatBadges(){
  const b=lireJson(BADGES_KEY,null);
  const ok=b&&Array.isArray(b.ids)&&b.cpt&&typeof b.cpt==='object';
  return ok?{ids:b.ids.filter(x=>BADGES.some(y=>y.id===x)),cpt:{parfait:Number(b.cpt.parfait)||0,duel:Number(b.cpt.duel)||0}}:{ids:[],cpt:{parfait:0,duel:0}};
}
let fileToasts=[];
function toast(texte,couleur){
  fileToasts.push({texte,couleur});
  if(fileToasts.length===1) montrerToast();
}
function montrerToast(){
  const t=fileToasts[0]; if(!t) return;
  let el=document.getElementById('toast');
  if(!el){ el=document.createElement('div'); el.id='toast'; el.setAttribute('role','status'); document.body.appendChild(el); }
  el.textContent=t.texte; el.style.borderColor=t.couleur||'var(--accent)'; el.className='toast-vu';
  Son.succes(); vibrer([40,30,40]);
  setTimeout(()=>{ el.className=''; fileToasts.shift(); if(fileToasts.length) setTimeout(montrerToast,250); },2600);
}
function debloquer(b,id){
  if(b.ids.includes(id)) return;
  b.ids.push(id);
  const def=BADGES.find(x=>x.id===id);
  if(def) toast('Badge débloqué : '+def.nom,'#F5C542');
}
function suivre(evt,n,extra){
  try{
    n=n===undefined?1:n;
    const d=etatDefis(), b=etatBadges();
    // défis du jour
    if(evt!=='saison_n'&&evt!=='score'){
      for(const df of defisDuJour(d.jour)){
        if(df.evt!==evt||d.faits.includes(df.id)) continue;
        d.prog[df.id]=(d.prog[df.id]||0)+n;
        if(d.prog[df.id]>=df.cible){ d.faits.push(df.id); toast('Défi accompli : '+df.nom,'#4ADE9A'); }
      }
      ecrireJson(DEFIS_KEY,d);
    }
    // badges
    if(evt==='titre') debloquer(b,'titre');
    if(evt==='allstar') debloquer(b,'allstar');
    if(evt==='mvp') debloquer(b,'mvp');
    if(evt==='medaille'){ debloquer(b,'medaille'); if(extra==='or') debloquer(b,'or'); }
    if(evt==='parfait'){ b.cpt.parfait++; if(b.cpt.parfait>=20) debloquer(b,'parfait20'); }
    if(evt==='duel_ok'){ b.cpt.duel++; if(b.cpt.duel>=5) debloquer(b,'duelliste'); }
    if(evt==='saison_n'&&n>=10) debloquer(b,'veteran');
    if(evt==='score'&&n>=76) debloquer(b,'legende');
    ecrireJson(BADGES_KEY,b);
  }catch(e){}
}
function defisHtml(){
  const d=etatDefis(), b=etatBadges();
  const lignes=defisDuJour(d.jour).map(df=>{
    const fait=d.faits.includes(df.id), v=Math.min(df.cible,d.prog[df.id]||0);
    return `<div class="defi ${fait?'fait':''}"><span class="defi-nom">${escapeHtml(df.nom)}</span><span class="defi-v">${fait?'✓':v+'/'+df.cible}</span><i><b style="width:${Math.round(v/df.cible*100)}%"></b></i></div>`;
  }).join('');
  const chips=BADGES.map(x=>`<span class="badge-m ${b.ids.includes(x.id)?'on':''}">${escapeHtml(x.nom)}</span>`).join('');
  return `<div class="bloc-defis"><p class="byline" style="margin-bottom:8px">DÉFIS DU JOUR</p>${lignes}<p class="byline" style="margin:12px 0 8px">BADGES · ${b.ids.length}/${BADGES.length}</p><div class="chips-badges">${chips}</div></div>`;
}
