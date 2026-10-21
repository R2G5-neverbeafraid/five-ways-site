// Parties « fun » : tableau d'affichage, saison sportive, actualités, sons, vibration, défis du jour et badges.
// Aucun appel réseau : tout reste dans le navigateur (localStorage, WebAudio).

/* ---------- Tableau d'affichage ---------- */
function abrev(s){ return String(s||'').normalize('NFD').replace(/[^A-Za-z]/g,'').slice(0,3).toUpperCase()||'EQP'; }
function alea(n){ return Math.floor(Math.random()*n); }
function genererTableau(m){
  const f=etat.franchise;
  const dom=Math.random()<0.5;
  let na, nb, ca, cb, fa=null, fb=null, oppId=null;
  if(m.coupe){
    const pays=etat.pays&&etat.pays!=='Autre'?etat.pays:null;
    na=pays&&CODE3[pays]?CODE3[pays]:'SEL';
    // Adversaires cohérents : coupe continentale = pays du même continent ; Coupe du Monde / JO = tous les pays.
    // Choix déterministe (saison + manche) pour ne pas retrouver le même adversaire dans la même compétition.
    const rangC=m.rangC!==undefined?m.rangC:['coupe_poule','coupe_demi','coupe_finale'].indexOf(m.id);
    const typeC=etat.scenarioActuel&&etat.scenarioActuel.coupe?etat.scenarioActuel.coupe.type:'monde';
    let cand=Object.keys(CONTINENTS).filter(p=>p!==pays);
    if(typeC==='continent'&&pays) cand=cand.filter(p=>CONTINENTS[p]===CONTINENTS[pays]);
    const adv=cand.length?cand[((etat.saison||0)*7+13+Math.max(0,rangC)*5)%cand.length]:pick(Object.keys(CONTINENTS));
    nb=CODE3[adv]||abrev(adv); ca='#4C6FFF'; cb='#E5484D';
    fa=(pays&&DRAPEAUX[pays])||null; fb=DRAPEAUX[adv]||null;
  } else {
    let opp=null;
    const rv=m.rivalId?rivaux().find(r=>r.id===m.rivalId):null;
    if(rv){ opp=rv.type==='equipe'?franchiseParId(String(rv.id).slice(3)):FRANCHISES.find(x=>x.ville+' '+x.nom===rv.equipe); }
    if(!opp||opp.id===f.id) opp=pick(toutesEquipes().filter(x=>x.id!==f.id));
    const col=dom?couleursMatch(f,opp):couleursMatch(opp,f);
    na=f.abr||abrev(f.id); nb=opp.abr||abrev(opp.id); oppId=opp.id;
    ca=dom?col.dom:col.ext; cb=dom?col.ext:col.dom;
  }
  let q, t, diff;
  const id=m.id;
  if(id==='prolongation'){ q=5; t='4:'+String(10+alea(40)); diff=0; }
  else if(m.playoff||id==='coupe_finale'||(id==='duel'&&Math.random()<0.5)){ q=4; t='0:0'+(2+alea(7)); diff=-(1+alea(2)); }
  else if(id==='faute_rapide'){ q=1; t='7:'+String(10+alea(40)); diff=pick([-2,0,1]); }
  else { q=pick([2,3,4,4,4]); t=(q===4?pick(['0','1','1','2']):String(2+alea(8)))+':'+String(10+alea(49)); diff=pick([-3,-2,-1,0,0,1,2]); }
  const base=62+alea(34);
  const res={na,nb,ca,cb,q,t,a:base+diff,b:base,dom}; if(oppId) res.opp=oppId; if(fa) res.fa=fa; if(fb) res.fb=fb; if(m.coupe) res.neutre=true; return res;
}
function scoreApres(tab,reussi){
  let a=tab.a, b=tab.b;
  if(reussi) a+=pick([2,3,3]); else b+=pick([2,2,3]);
  if(a===b) { if(reussi) a++; else b++; }
  return {a,b};
}

/* ---------- Saison sportive (bilan, classement, playoffs) ---------- */
const STADES_FAC=[__("Non qualifié"),__("Éliminé au premier tour du Tournoi"),__("Éliminé en Sweet 16"),__("Éliminé en Final Four"),__("Finaliste national"),__("Champion universitaire")];
const STADES_LYC=[__("Non qualifié"),__("Éliminé au premier tour"),__("Éliminé en quarts de finale"),__("Éliminé en demi-finales d'État"),__("Finaliste d'État"),__("Champion d'État")];
function stadesSaison(){ return estLycee()?STADES_LYC:estFac()?STADES_FAC:STADES; }
const STADES=[__("Non qualifié"),__("Éliminé au premier tour"),__("Éliminé en demi-finales"),__("Éliminé en finale de conférence"),__('Finaliste'),__('Champion')];
function genererSaisonRegliere(reussis,total,moyenne){
  const force=clamp(-0.02+etat.meta.coteEquipe/300+etat.meta.alchimieEquipe/700+(total?reussis/total:0.5)*0.30+(moyenne-55)/200+(Math.random()-0.5)*0.12,0.15,0.90);
  const v=clamp(Math.round(82*force),12,72);
  const rang=clamp(1+Math.round((0.78-force)*22),1,15);
  return {v,d:82-v,rang};
}
function texteRang(r){ if(LANG==='en'){ const s=['th','st','nd','rd'], v=r%100; return r+(s[(v-20)%10]||s[v]||s[0]); } return r===1?'1er':r+'e'; }

/* ---------- Actualités (presse, fans, rival) ---------- */
const ACTUS={
  presse_ok:[__("{n} TUE LE MATCH"),__("{n} : « Le sang-froid d'un vétéran »"),__("La nuit de {n}"),__("{ville} tient son homme"),__("{n} répond présent quand ça compte")],
  presse_ko:[__("{n} sèche dans le money time"),__("{n} a raté son rendez-vous"),__("Nuit blanche pour {n}"),__("Le tir de la peur pour {n}"),__("{ville} doit-elle s'inquiéter ?")],
  fans_ok:[__("« MVP ! MVP ! » scande la salle"),__("Les fans de {ville} chantent ton nom"),__("Le nom de {n} explose sur les réseaux"),__("Standing ovation à {ville}")],
  fans_ko:[__("Quelques sifflets dans la salle"),__("Les fans veulent une revanche"),__("Silence dans les gradins"),__("Les supporters restent derrière toi malgré tout")],
  rival_ok:[__("{r} : « On se retrouvera. »"),__("{r} te serre la main sans un mot"),__("{r} minimise sa défaite en conférence de presse")],
  rival_ko:[__("{r} : « Trop facile ce soir. »"),__("{r} savoure sur les réseaux"),__("{r} te fait signe vers le banc")]
};
function genererActus(entree,rv){
  const n=etat.nom||__("Le joueur"), ville=etat.franchise.ville, ok=entree.reussi;
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
  ?__("<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 10v4h4l6 4V6L7 10zM17 9a4 4 0 010 6\"/></svg>")
  :__("<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 10v4h4l6 4V6L7 10zM17 9l5 6M22 9l-5 6\"/></svg>"); }
function monterBoutonLangue(){
  if(document.getElementById('btn-langue')) return;
  const b=document.createElement('button');
  b.id='btn-langue'; b.type='button';
  b.textContent=LANG==='fr'?'EN':'FR';
  b.setAttribute('aria-label',LANG==='fr'?__("Switch to English"):__("Passer en français"));
  b.title=LANG==='fr'?'English':'Français';
  b.onclick=()=>changerLangue();
  document.body.appendChild(b);
}
function monterBoutonSon(){
  if(document.getElementById('btn-son')) return;
  Son.init();
  const b=document.createElement('button');
  b.id='btn-son'; b.type='button'; b.setAttribute('aria-label',__('Activer ou couper le son'));
  b.innerHTML=iconeSon();
  b.onclick=()=>{ Son.basculer(); b.innerHTML=iconeSon(); Son.clic(); };
  document.body.appendChild(b);
}

/* ---------- Jauge de geste ---------- */
const GESTES={scoring:[__('TIRER'),__("SWISH !"),__("LE TIR SORT")],defense:[__('CONTRER'),__("STOP !"),__("ILS PASSENT")],playmaking:[__('PASSER'),__("QUELLE PASSE !"),__("PASSE PERDUE")],athletisme:[__('ATTAQUER'),__("EXPLOSIF !"),__("CONTRÉ !")],basketIQ:[__('DÉCIDER'),__("BIEN LU !"),__("MAUVAIS CHOIX")]};
let jaugeRaf=0;
/* Difficulté de la jauge selon l'importance du moment :
   - moment décisif de saison régulière (fin de 4e quart-temps, tir final, lancers décisifs, prolongation, finale de coupe) : zone −15 %, curseur +5 %
   - playoffs : zone −15 / −30 / −45 / −60 % et curseur +15 / +30 / +40 / +50 % selon le tour (1er tour -> finales) */
const JAUGE_PO={zone:[0.85,0.70,0.55,0.40],vitesse:[1.15,1.30,1.40,1.50]};
function momentDecisif(m){
  if(!m) return false;
  if(['buzzer','lancers','prolongation','coupe_finale'].includes(m.id)) return true;
  const t=m.tableau; if(!t) return false;
  if(t.q>=5) return true;
  const mm=/^(\d{1,2}):(\d{2})$/.exec(String(t.t));
  return t.q>=4&&!!mm&&(Number(mm[1])*60+Number(mm[2]))<=120;
}
function difficulteJauge(m){
  if(m&&m.playoff){ const i=Math.max(0,Math.min(3,Number(m.tour)||0)); return {zone:JAUGE_PO.zone[i],vitesse:JAUGE_PO.vitesse[i],note:__t("Jauge durcie : zone verte −{#0} %, curseur +{#1} %.",[Math.round((1-JAUGE_PO.zone[i])*100),Math.round((JAUGE_PO.vitesse[i]-1)*100)])}; }
  if(momentDecisif(m)) return {zone:0.85,vitesse:1.05,note:__t("Moment décisif : zone verte −{#0} %, curseur +{#1} %.",[15,5])};
  return {zone:1,vitesse:1,note:''};
}
/* Largeur de la zone verte (fraction de la jauge) : plus grande avec une bonne stat, réduite dans les moments importants. */
function largeurJauge(statCle,diff){ return (0.28+(etat.stats[statCle]||50)/100*0.14)*((diff&&diff.zone)||1); }
/* Règle : appuyer hors de la zone verte = l'action est perdue. Dans la zone : bonus (+8 %, +14 % au centre), mais un mauvais choix reste un mauvais choix. */
function evaluerGeste(d,largeur){
  if(d<=largeur*0.18) return {label:'parfait',bonus:0.14};
  if(d<=largeur/2) return {label:'bon',bonus:0.08};
  return {label:'rate',bonus:0};
}
function demarrerJauge(statCle,surArret,diff){
  diff=diff||{zone:1,vitesse:1};
  const zone=document.getElementById('jauge-zone'), curseur=document.getElementById('jauge-curseur'), bouton=document.getElementById('btn-geste');
  if(!zone||!curseur||!bouton) return;
  const largeur=largeurJauge(statCle,diff);
  const centre=0.2+Math.random()*0.6;
  zone.style.left=((centre-largeur/2)*100)+'%'; zone.style.width=(largeur*100)+'%';
  const debut=performance.now(), periode=1500/diff.vitesse;
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
    const g=auto?{label:'rate',bonus:0}:evaluerGeste(d,largeur);
    bouton.disabled=true;
    surArret(g);
  };
  bouton.onclick=()=>arreter(false);
  jaugeRaf=requestAnimationFrame(tick);
}

/* ---------- Compteurs animés ---------- */
function animerCompteurs(){
  document.querySelectorAll('.cnt').forEach(el=>{
    const cible=Number(el.dataset.v)||0, dur=700, debut=performance.now();
    const calme=window.matchMedia&&window.matchMedia(__("(prefers-reduced-motion: reduce)")).matches;
    if(calme){ el.textContent=String(cible); return; }
    const tick=now=>{ const p=Math.min(1,(now-debut)/dur); el.textContent=String(Math.round(cible*(1-Math.pow(1-p,3)))); if(p<1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
}

/* ---------- Défis du jour et badges ---------- */
const DEFIS_KEY='five-ways-defis-v1', BADGES_KEY='five-ways-badges-v1';
const DEFIS_FACILES=[
  {id:'m3',nom:__("Réussis 3 moments de match"),evt:'match_ok',cible:3},
  {id:'s2',nom:__("Joue 2 saisons"),evt:'saison',cible:2},
  {id:'p3',nom:__("Réussis 3 gestes parfaits"),evt:'parfait',cible:3}
];
const DEFIS_MOYENS=[
  {id:'m6',nom:__("Réussis 6 moments de match"),evt:'match_ok',cible:6},
  {id:'s4',nom:__("Joue 4 saisons"),evt:'saison',cible:4},
  {id:'c1',nom:__("Réussis un moment décisif"),evt:'clutch',cible:1},
  {id:'d1',nom:__("Bats un rival en duel"),evt:'duel_ok',cible:1}
];
const DEFIS_DIFFICILES=[
  {id:'med',nom:__("Remporte une médaille"),evt:'medaille',cible:1},
  {id:'tit',nom:__("Gagne un titre"),evt:'titre',cible:1},
  {id:'all',nom:__("Sois sélectionné All-Star"),evt:'allstar',cible:1}
];
const BADGES=[
  {id:'titre',nom:__("Premier titre")},{id:'allstar',nom:'All-Star'},{id:'mvp',nom:'MVP'},
  {id:'medaille',nom:__('Médaillé')},{id:'or',nom:__("Médaille d'or")},{id:'parfait20',nom:__("Geste d'or")},
  {id:'veteran',nom:__('Vétéran')},{id:'legende',nom:__('Légende')},{id:'duelliste',nom:__("Roi du duel")}
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
  if(def) toast(__("Badge débloqué : ")+def.nom,'#F5C542');
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
        if(d.prog[df.id]>=df.cible){ d.faits.push(df.id); toast(__("Défi accompli : ")+df.nom,'#4ADE9A'); }
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
  return __t("<div class=\"bloc-defis\"><p class=\"byline\" style=\"margin-bottom:8px\">DÉFIS DU JOUR</p>{#0}<p class=\"byline\" style=\"margin:12px 0 8px\">BADGES · {#1}/{#2}</p><div class=\"chips-badges\">{#3}</div></div>",[lignes,b.ids.length,BADGES.length,chips]);
}
