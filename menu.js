// Menu du jeu : reprendre, nouvelle carrière, carrières du jour (parcours préparés), défis et badges.
// Les parcours s'inspirent de grandes trajectoires du basket, avec des noms fictifs.
const CARRIERES_KEY='five-ways-carrieres-v1';
const CARRIERES_JOUR=[
  {id:'prodige',niv:1,nom:'ELIO MARQUES',titre:__("Le prodige de 2003"),desc:__("Le lycéen le plus attendu de sa génération. Choix n°1, pression énorme, talent total."),poste:'Ailier',gabarit:'Costaud',pays:'USA',origine:'prep',voie:'direct',pick:1,numero:23,obj:{type:'titres',n:2}},
  {id:'fils_star',niv:1,nom:'DAVID KOUASSI',titre:__("Le fils du champion"),desc:__("Il porte le nom de son père. Plus de portes ouvertes, mais aucun droit à l'erreur."),poste:'Ailier fort',gabarit:'Costaud',pays:'Côte d\'Ivoire',origine:'fils',voie:'fac1',pick:4,numero:33,obj:{type:'allStar',n:3}},
  {id:'tireur',niv:2,nom:'STEFAN CURIC',titre:__("Le tireur venu d'ailleurs"),desc:__("Un meneur à la détente rapide, drafté plus bas que prévu. Il va devoir prouver sa valeur."),poste:'Meneur',gabarit:'Longiligne',pays:'France',origine:'academie',voie:'fac3',pick:7,numero:30,obj:{type:'allStar',n:4}},
  {id:'geant',niv:2,nom:'JOEL MBANGA',titre:__("Le géant discret"),desc:__("Un pivot méconnu, formé à l'ancienne. Il n'a jamais voulu les projecteurs, mais il gagne."),poste:'Pivot',gabarit:'Costaud',pays:'Cameroun',origine:'academie',voie:'fac3',pick:18,numero:13,obj:{type:'score',n:55}},
  {id:'bitume',niv:3,nom:'JAYDEN ROOKE',titre:__("La légende du bitume"),desc:__("Il a tout appris dans la rue et n'a été drafté qu'au second tour. Personne ne l'attendait."),poste:'Arrière',gabarit:'Équilibré',pays:'RDC',origine:'bitume',voie:'direct',pick:48,numero:1,obj:{type:'allStar',n:2}},
  {id:'europeen',niv:2,nom:'LUKA VESNIC',titre:__("Le virtuose européen"),desc:__("Un meneur géant, arrivé en ligue après plusieurs années en Europe. Il lit le jeu avant tout le monde."),poste:'Meneur',gabarit:'Équilibré',pays:'Serbie',origine:'academie',voie:'europe',pick:3,numero:77,obj:{type:'mvp',n:1}},
  {id:'revenant',niv:3,nom:'MARCUS BELL',titre:__("Le revenant"),desc:__("Tout le monde l'avait enterré. Quelqu'un lui offre une dernière chance de prouver qu'il avait raison."),poste:'Ailier',gabarit:'Longiligne',pays:'Sénégal',origine:'bitume',voie:'direct',pick:55,numero:8,obj:{type:'titres',n:1}},
  {id:'ailier_ldc',niv:1,nom:'TYRESE ADAMS',titre:__("Le meilleur lycéen du pays"),desc:__("Un ailier athlétique, premier de sa classe de draft. Tout le monde attend un titre."),poste:'Ailier',gabarit:'Longiligne',pays:'USA',origine:'prep',voie:'fac1',pick:1,numero:11,obj:{type:'titres',n:2}},
  {id:'meneur_fac',niv:1,nom:'MATEO RIVERA',titre:__("Le meneur de la grande fac"),desc:__("Une saison de rêve à l'université, un jeu de passe hors norme. Il vise les sommets."),poste:'Meneur',gabarit:'Équilibré',pays:'Espagne',origine:'academie',voie:'fac1',pick:3,numero:3,obj:{type:'allStar',n:4}},
  {id:'pivot_nba',niv:2,nom:'OMAR DIALLO',titre:__("Le pivot venu d'Afrique"),desc:__("Découvert tard, il dévore le jeu. Un talent brut à polir, avec des qualités rares."),poste:'Pivot',gabarit:'Costaud',pays:'Sénégal',origine:'academie',voie:'direct',pick:9,numero:21,obj:{type:'allStar',n:3}},
  {id:'arriere_clutch',niv:2,nom:'KEVIN BRAXTON',titre:__("L'arrière des fins de match"),desc:__("Sang-froid d'acier dans les dernières secondes. Reste à gagner la bague."),poste:'Arrière',gabarit:'Équilibré',pays:'USA',origine:'fils',voie:'fac3',pick:12,numero:24,obj:{type:'titres',n:2}},
  {id:'rookie_europe',niv:2,nom:'NIKOLA PETROV',titre:__("Le rookie venu d'Europe"),desc:__("Un jeu mûr pour son âge après deux saisons en Europe. Il découvre la ligue."),poste:'Ailier fort',gabarit:'Longiligne',pays:'Grèce',origine:'academie',voie:'europe',pick:14,numero:13,obj:{type:'score',n:50}},
  {id:'second_tour',niv:3,nom:'DEVON HARPER',titre:__("L'oublié de la draft"),desc:__("Choisi à la fin du second tour, sans garantie. Il n'a que son travail pour réussir."),poste:'Meneur',gabarit:'Équilibré',pays:'USA',origine:'bitume',voie:'fac3',pick:57,numero:5,obj:{type:'saisons',n:8}},
  {id:'veteran_boost',niv:3,nom:'SAMUEL OKAFOR',titre:__("Le travailleur de l'ombre"),desc:__("Pas de grand talent, mais une éthique de travail à toute épreuve. Il veut durer."),poste:'Ailier',gabarit:'Costaud',pays:'Nigeria',origine:'bitume',voie:'direct',pick:42,numero:15,obj:{type:'saisons',n:10}},
  {id:'dynastie2',niv:3,nom:'ANDRE CARTER',titre:__("Le rêve de trois bagues"),desc:__("Un pivot dominant à la tête d'une équipe d'élite. Trois titres, pas moins."),poste:'Pivot',gabarit:'Costaud',pays:'USA',origine:'prep',voie:'fac1',pick:5,numero:32,obj:{type:'titres',n:3}},
  {id:'dynastie',niv:3,nom:'ISAIAH TRENT',titre:__("Le bâtisseur de dynastie"),desc:__("Un ailier fort complet. Son objectif ? Gagner encore et encore, comme les plus grands."),poste:'Ailier fort',gabarit:'Équilibré',pays:'USA',origine:'prep',voie:'fac1',pick:2,numero:6,obj:{type:'titres',n:3}}
];
function carrieresDuJour(jour){
  const g=graine(jour);
  return [1,2,3].map(n=>{ const l=CARRIERES_JOUR.filter(x=>x.niv===n); return l[(g>>>(n*3))%l.length]; });
}
function carrieresFaites(){
  const d=lireJson(CARRIERES_KEY,null);
  return d&&d.jour===jourCle()&&Array.isArray(d.faits)?d:{jour:jourCle(),faits:[]};
}
function objectifTexte(o){
  const t={titres:__t("Gagne {#0} titre(s)",[o.n]),allStar:__t("Sois All-Star {#0} fois",[o.n]),mvp:__t("Sois élu MVP {#0} fois",[o.n]),score:__t("Atteins un score de {#0}",[o.n]),saisons:__t("Joue {#0} saisons",[o.n])};
  return t[o.type]||'';
}
function objectifAtteint(o){
  const d=etat.distinctions, sc=calculerScore();
  if(o.type==='titres') return d.titres>=o.n;
  if(o.type==='allStar') return d.allStar>=o.n;
  if(o.type==='mvp') return d.mvp>=o.n;
  if(o.type==='score') return sc.total>=o.n;
  if(o.type==='saisons') return etat.saison-1>=o.n;
  return false;
}
function lancerCarriere(d){
  nouvellePartie(d.nom,d.poste);
  const st={...POSITIONS[d.poste]}, g=GABARITS[d.gabarit], org=origineParId(d.origine);
  for(const k in g.bonus) st[k]=clamp(st[k]+g.bonus[k],0,99);
  for(const k in g.malus) st[k]=clamp(st[k]+g.malus[k],0,99);
  if(org) for(const k in org.stats) st[k]=clamp(st[k]+org.stats[k],0,99);
  // Parcours déjà accompli avant la Draft
  const voie={direct:{age:1,st:{}},fac1:{age:1,st:{scoring:2}},fac3:{age:3,st:{basketIQ:3,defense:2}},europe:{age:1,st:{basketIQ:2,defense:1}}}[d.voie]||{age:1,st:{}};
  for(const k in voie.st) st[k]=clamp(st[k]+voie.st[k],0,99);
  etat.stats=st; etat.pays=d.pays; etat.gabarit=d.gabarit; etat.numero=d.numero;
  appliquerOrigine(d.origine);
  etat.age=18+voie.age;
  etat.franchise=FRANCHISES[graine(d.id+jourCle())%FRANCHISES.length];
  etat.draftPick=d.pick;
  etat.contrat=contratRookie(d.pick); etat.gains=0; etat.marque=null; etat.ansEquipe=0; etat.signatures=0; etat.file=[]; etat.refusExt=false;
  etat.rivaux=rivauxEquipes(etat.franchise.id).map(creerRivalEquipe);
  etat.saison=1; etat.defi={id:d.id};
  etat.phase='draftnight';
  sauvegarder();
}
function carriereParId(id){ return CARRIERES_JOUR.find(x=>x.id===id)||null; }
function bilanDefiHtml(){
  const d=etat.defi&&carriereParId(etat.defi.id); if(!d) return '';
  const ok=objectifAtteint(d.obj);
  return `<div class="rival-card" style="background:${ok?'#14281F':'var(--surface)'}"><p class="rival-titre">${escapeHtml(__("CARRIÈRE DU JOUR"))} — ${ok?escapeHtml(__("RÉUSSIE")):escapeHtml(__("MANQUÉE"))}</p><p class="rival-ligne">${escapeHtml(__(d.titre))} · ${escapeHtml(objectifTexte(d.obj))}</p></div>`;
}
function enregistrerDefiCarriere(){
  if(!etat.defi) return;
  const d=carriereParId(etat.defi.id); if(!d||!objectifAtteint(d.obj)) return;
  const f=carrieresFaites(); if(!f.faits.includes(d.id)){ f.faits.push(d.id); ecrireJson(CARRIERES_KEY,f); }
}

/* ---------- Interface du menu ---------- */
let menuConfirme=null;
function fermerMenu(){ const m=document.getElementById('menu-fond'); if(m) m.remove(); menuConfirme=null; }
function enCours(){ return !!etat&&etat.phase!=='retraite'; }
function ouvrirMenu(){
  fermerMenu();
  const el=document.createElement('div');
  el.id='menu-fond';
  el.innerHTML=`<div class="menu-panneau" role="dialog" aria-modal="true" aria-label="${escapeHtml(__('Menu'))}">
    <div class="menu-tete"><h2 class="titre-ecran" style="font-size:22px">${escapeHtml(__('Menu'))}</h2><button id="menu-fermer" class="pilule" aria-label="${escapeHtml(__('Fermer'))}">✕</button></div>
    ${etat?`<button id="menu-reprendre" class="bouton">${escapeHtml(__('Reprendre'))}</button>`:''}
    <button id="menu-nouvelle" class="bouton" style="background:var(--surface);color:var(--text);border:1px solid var(--border)">${escapeHtml(__('Nouvelle carrière'))}</button>
    ${defisHtml()}
  </div>`;
  document.body.appendChild(el);
  const q=s=>el.querySelector(s);
  q('#menu-fermer').onclick=fermerMenu;
  el.onclick=ev=>{ if(ev.target===el) fermerMenu(); };
  const rp=q('#menu-reprendre'); if(rp) rp.onclick=fermerMenu;
  const nv=q('#menu-nouvelle');
  nv.onclick=()=>{
    if(enCours()&&menuConfirme!=='nouvelle'){ menuConfirme='nouvelle'; nv.textContent=__("Confirmer : la progression sera perdue"); return; }
    fermerMenu(); reinitialiser(); accueilVu=true; render();
  };
  const f=q('#menu-fermer'); if(f) f.focus();
}
function monterBoutonMenu(){
  if(document.getElementById('btn-menu')) return;
  const b=document.createElement('button');
  b.id='btn-menu'; b.type='button'; b.setAttribute('aria-label',__('Menu'));
  b.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  b.onclick=()=>{ Son.clic(); ouvrirMenu(); };
  document.body.appendChild(b);
}
document.addEventListener('keydown',ev=>{ if(ev.key==='Escape') fermerMenu(); });

/* Barre du bas : recommencer et menu, visibles sur tous les écrans de jeu */
function monterBarreBas(){
  const old=document.getElementById('barre-bas'); if(old) old.remove();
  const app=document.getElementById('app'); if(!app||!etat) return;
  const el=document.createElement('div'); el.id='barre-bas';
  el.innerHTML=`<button type="button" id="bb-recommencer" class="bb-btn">${escapeHtml(__('Recommencer'))}</button>`;
  app.appendChild(el);
  const r=el.querySelector('#bb-recommencer'); let conf=false;
  r.onclick=()=>{
    if(enCours()&&!conf){ conf=true; r.textContent=__("Confirmer : la progression sera perdue"); r.classList.add('bb-alerte'); return; }
    reinitialiser(); accueilVu=true; render();
  };
}

/* Accueil : bloc à deux pages (défis du jour / carrières du jour), on glisse sur le côté */
function carrieresAccueilHtml(){
  const faits=carrieresFaites().faits;
  const cartes=carrieresDuJour(jourCle()).map(d=>{
    const ok=faits.includes(d.id);
    return `<button type="button" class="carte-choix carriere-accueil" data-defi="${d.id}" style="--barre:${ok?'var(--gain)':'var(--accent)'};flex-direction:column;align-items:flex-start;gap:3px;text-align:left"><p>${escapeHtml(__(d.titre))}${ok?' ✓':''}</p><span style="font-size:12.5px;color:var(--text-muted)">${escapeHtml(__(d.desc))}</span></button>`;
  }).join('');
  return `<p class="byline" style="margin-bottom:8px">${escapeHtml(__("CARRIÈRES DU JOUR"))}</p><div class="pile-choix">${cartes}</div>`;
}
function swipeAccueilHtml(){
  return `<div class="swipe-accueil"><div class="swipe-piste" id="swipe-piste"><section class="swipe-page">${defisHtml()}</section><section class="swipe-page"><div class="bloc-defis">${carrieresAccueilHtml()}</div></section></div><div class="swipe-points"><i class="on"></i><i></i></div></div>`;
}
function attacherSwipeAccueil(){
  const p=document.getElementById('swipe-piste'); if(!p) return;
  const pts=document.querySelectorAll('.swipe-points i');
  p.addEventListener('scroll',()=>{ const i=Math.round(p.scrollLeft/Math.max(1,p.clientWidth)); pts.forEach((x,k)=>x.classList.toggle('on',k===i)); },{passive:true});
  pts.forEach((x,k)=>x.onclick=()=>p.scrollTo({left:k*p.clientWidth,behavior:'smooth'}));
  document.querySelectorAll('.carriere-accueil').forEach(b=>b.onclick=()=>{
    const d=carriereParId(b.dataset.defi); if(!d) return;
    lancerCarriere(d); accueilVu=true; render();
  });
}
