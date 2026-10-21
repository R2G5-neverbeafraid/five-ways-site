// Affichage des écrans et interactions
function texteFlavor(){
  const lignes=["Nouvelle intersaison. Voici tes options :","L'heure des choix a sonné pour cette intersaison.","Ton entourage attend ta décision pour la suite.","Une nouvelle étape de ta carrière commence."];
  return lignes[etat.saison % lignes.length];
}
function barre(val){ return `<div class="bar"><div class="fill" style="width:${clamp(val,0,99)}%"></div></div>`; }

function renderLycee(){
  return `<div class="screen">
    ${logoCompact()}
    <h1 class="titre-ecran">Lycée — dernière année</h1>
    <p class="flavor">Tu as ${etat.age} ans. Après un tournoi AAU remarqué, plusieurs universités commencent à s'intéresser à toi.</p>
    <div class="pile-choix">${etat.tourActuel.map((c,i)=>carteChoixHtml(c,i)).join('')}</div>
  </div>`;
}
function attacherLycee(){
  document.querySelectorAll('.carte-choix').forEach(btn=>{
    btn.onclick=()=>{
      appliquerEffets(etat.tourActuel[Number(btn.dataset.i)].effets);
      etat.phase='chemin'; sauvegarder(); render();
    };
  });
}
function renderChemin(){
  if(!cheminOrdreTemp) cheminOrdreTemp=melangerOrdre(CHEMINS_PREDRAFT);
  return `<div class="screen">
    ${logoCompact()}
    <h1 class="titre-ecran">Quelle route avant la Draft ?</h1>
    <p class="flavor">Chaque voie a ses compromis, entre âge d'entrée dans la ligue et solidité de ton profil.</p>
    <div class="pile-choix">${cheminOrdreTemp.map((c,i)=>`<button class="carte-choix" data-i="${i}"><p>${escapeHtml(c.texte)}</p></button>`).join('')}</div>
  </div>`;
}
function attacherChemin(){
  document.querySelectorAll('.carte-choix').forEach(btn=>{
    btn.onclick=()=>{ choisirChemin(cheminOrdreTemp[Number(btn.dataset.i)]); cheminOrdreTemp=null; render(); };
  });
}
function renderCombine(){
  if(!combineOrdreTemp) combineOrdreTemp=melangerOrdre(COMBINE_CHOIX);
  return `<div class="screen">
    ${logoCompact()}
    <h1 class="titre-ecran">La Combine</h1>
    <p class="flavor">Dernière étape avant la Draft. Comment abordes-tu les tests devant les recruteurs ?</p>
    <div class="pile-choix">${combineOrdreTemp.map((c,i)=>`<button class="carte-choix" data-i="${i}"><p>${escapeHtml(c.texte)}</p></button>`).join('')}</div>
  </div>`;
}
function attacherCombine(){
  document.querySelectorAll('.carte-choix').forEach(btn=>{
    btn.onclick=()=>{ choisirCombine(combineOrdreTemp[Number(btn.dataset.i)]); combineOrdreTemp=null; render(); };
  });
}
function renderDraftNight(){
  const f=etat.franchise;
  const tierLabel = etat.draftPick<=5?'Top 5':etat.draftPick<=14?'Loterie':etat.draftPick<=30?'1er tour':'2e tour';
  const ovr=Math.round(moyenneStats());
  const caseStat=(lbl,val)=>`<div style="flex:1;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 8px;text-align:center"><div class="chiffre" style="font-size:26px;line-height:1.1">${val}</div><div style="font-size:11px;font-weight:600;letter-spacing:.1em;color:var(--text-muted);margin-top:4px">${lbl}</div></div>`;
  const rivs=rivaux().filter(r=>r.type==='equipe');
  return `<div class="screen">
    ${logoCompact()}
    <p class="logo" style="color:var(--text-muted)">DRAFT NIGHT</p>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:20px;text-align:center">
      <div style="font-size:12px;font-weight:600;letter-spacing:.14em;color:var(--text-muted)">CHOIX N° · ${tierLabel.toUpperCase()}</div>
      <div class="chiffre" style="font-size:84px;line-height:1;color:var(--accent);margin:6px 0">${etat.draftPick}</div>
      <div class="titre-ecran" style="font-size:24px">${escapeHtml(f.ville)} ${escapeHtml(f.nom)}</div>
      <div style="font-size:13px;color:var(--text-muted);margin-top:6px">Tu rejoins la franchise à ${etat.age} ans.</div>
    </div>
    <div style="display:flex;gap:10px">${caseStat('OVR',ovr)}${caseStat('POSTE',escapeHtml(etat.poste.toUpperCase().slice(0,3)))}${etat.pays?caseStat('PAYS',escapeHtml((PAYS.find(p=>p[0]===etat.pays)||['','--'])[1])):''}${caseStat('MAILLOT','#'+(etat.numero!==undefined?etat.numero:'—'))}</div>
    ${rivs.length?`<div class="rival-card" style="background:#2A1820"><p class="rival-titre">RIVALITÉS HISTORIQUES</p>${rivs.map(r=>`<p class="rival-ligne"><span style="color:#E5484D;letter-spacing:2px">${pastilles(r.niveau)}</span> ${escapeHtml(r.nom)} — ${escapeHtml(r.detail)}</p>`).join('')}</div>`:''}
    <button id="btn-rejoindre" class="bouton">COMMENCER LA SAISON 1</button>
  </div>`;
}
function attacherDraftNight(){
  document.getElementById('btn-rejoindre').onclick=()=>{ etat.phase='jeu'; genererTour(); sauvegarder(); render(); };
}
const PAYS=[['RDC','CD'],['France','FR'],['USA','US'],['Cameroun','CM'],['Sénégal','SN'],['Nigeria','NG'],['Canada','CA'],['Espagne','ES'],['Serbie','RS'],['Brésil','BR'],['Angola','AO'],['Autre','--']];
const DOMINANTE={'Meneur':'PLA','Arrière':'SCO','Ailier':'ATH','Ailier fort':'DEF','Pivot':'IQ'};
const GABARITS={
  'Longiligne':{desc:'Bras longs, explosif, moins de masse',bonus:{athletisme:4,defense:1},malus:{playmaking:-3}},
  'Équilibré':{desc:'Aucun point faible marqué',bonus:{basketIQ:2},malus:{}},
  'Costaud':{desc:'Puissant au contact, moins mobile',bonus:{defense:4,scoring:2},malus:{athletisme:-4}}
};
let creationTemp={etape:1,nom:'',pays:'RDC',poste:'Ailier',gabarit:'Équilibré',numero:23};
const LBL={scoring:'SCO',playmaking:'PLA',defense:'DEF',athletisme:'ATH',basketIQ:'IQ'};

// ---- Identité visuelle (voir five-ways-logo.md) ----
function arcSvg(r,a0,a1){ const p=a=>[50+r*Math.cos(a*Math.PI/180),50+r*Math.sin(a*Math.PI/180)].map(v=>v.toFixed(2)); const [x0,y0]=p(a0),[x1,y1]=p(a1); return `M${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}`; }
function logoIcone(s){
  const cols=['#F28C28','#22B8CF','#9B6BFF','#F06292','#E5484D'];
  const arcs=cols.map((c,i)=>`<path d="${arcSvg(36,-90+i*72+6,-90+i*72+66)}" stroke="${c}" stroke-width="7" stroke-linecap="round" fill="none"/>`).join('');
  return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" aria-hidden="true" style="flex:none"><rect width="100" height="100" rx="22" fill="#0E1626" stroke="#26345A" stroke-width="2"/>${arcs}<circle cx="50" cy="50" r="21" fill="#D9692B"/><g stroke="#F3EBDD" stroke-width="2.2" fill="none" stroke-linecap="round"><path d="M50 29v42M29 50h42"/><path d="M36 36c8 8 8 20 0 28M64 36c-8 8-8 20 0 28"/></g></svg>`;
}
function logoCompact(){ return `<p class="logo" style="display:flex;align-items:center;gap:9px;color:#fff;font-size:17px;letter-spacing:.04em">${logoIcone(28)}<span>FIVE <span style="color:var(--accent)">WAYS</span></span></p>`; }
function logo25(h){
  return `<svg viewBox="0 0 100 100" width="${h}" height="${h}" aria-hidden="true" style="flex:none"><g stroke="#EAF2FB" stroke-width="5" stroke-linecap="round"><path d="M50 50V10M50 50L88 38M50 50L74 83M50 50L26 83M50 50L12 38"/></g><g fill="#0E1626" stroke="#EAF2FB" stroke-width="5"><circle cx="50" cy="10" r="7"/><circle cx="88" cy="38" r="7"/><circle cx="74" cy="83" r="7"/><circle cx="26" cy="83" r="7"/><circle cx="12" cy="38" r="7"/></g><circle cx="50" cy="50" r="12" fill="#22D3EE"/></svg>`;
}
function signature25(){ return `<p class="byline" style="display:flex;align-items:center;gap:8px;justify-content:center">${logo25(18)}<span>by 25 Labs</span></p>`; }
let accueilVu=false;
function renderAccueil(){
  return `<div class="screen" style="min-height:86vh;justify-content:center;align-items:center;text-align:center;gap:22px">
    ${logoIcone(112)}
    <div style="font-family:'Oswald','Impact',sans-serif;font-weight:700;text-transform:uppercase;line-height:.95;font-size:64px;letter-spacing:.01em">FIVE<br><span style="color:var(--accent)">WAYS</span></div>
    <p style="margin:0;font-size:12.5px;font-weight:600;letter-spacing:.14em;color:var(--text-muted)">5 CHOIX. 1 CARRIÈRE.</p>
    <button id="btn-jouer" class="bouton" style="width:100%;margin-top:14px">Jouer</button>
    ${signature25()}
  </div>`;
}
function attacherAccueil(){ document.getElementById('btn-jouer').onclick=()=>{ accueilVu=true; render(); }; }
function progression(){ return `<div style="display:flex;gap:6px">${[1,2,3,4].map(i=>`<i style="flex:1;height:5px;border-radius:3px;background:${i<=creationTemp.etape?'var(--accent)':'var(--chip)'}"></i>`).join('')}</div><p class="logo">CRÉATION — ÉTAPE ${creationTemp.etape}/4</p>`; }
function statsDepart(){
  const st={...POSITIONS[creationTemp.poste]}; const g=GABARITS[creationTemp.gabarit];
  for(const k in g.bonus) st[k]=clamp(st[k]+g.bonus[k],0,99);
  for(const k in g.malus) st[k]=clamp(st[k]+g.malus[k],0,99);
  return st;
}
function maillotSvg(){
  const nom=escapeHtml((creationTemp.nom.trim()||'JOUEUR').toUpperCase().slice(0,12));
  return `<svg viewBox="0 0 200 230" width="200" height="230" style="align-self:center"><path id="arc" d="M48 100 Q100 78 152 100" fill="none"/><path d="M62 10 L62 40 Q100 78 138 40 L138 10 L168 10 L158 60 L158 215 Q100 225 42 215 L42 60 L32 10 Z" fill="var(--accent)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><text font-family="Oswald,Impact,sans-serif" font-size="15" font-weight="700" fill="#fff" letter-spacing="1.5" text-anchor="middle"><textPath href="#arc" startOffset="50%">${nom}</textPath></text><text x="100" y="172" font-family="Anton,Oswald,Impact,sans-serif" font-size="78" fill="#fff" text-anchor="middle">${creationTemp.numero}</text></svg>`;
}
function renderCreation(){
  const t=creationTemp, e=t.etape; let corps='', bouton='Continuer';
  if(e===1){
    corps=`<h1 class="titre-ecran">Ton joueur</h1>
    <label class="champ"><span>Nom</span><input id="champ-nom" type="text" placeholder="NOM DU JOUEUR" value="${escapeHtml(t.nom)}" maxlength="18" style="text-transform:uppercase"></label>
    <div class="champ"><span>Sur le maillot : <b style="color:var(--text)" id="apercu-nom">${escapeHtml((t.nom.trim()||'JOUEUR').toUpperCase())}</b></span></div>
    <div class="champ"><span>Nationalité</span><div class="grille-postes">${PAYS.map(([n,c])=>`<button class="pilule ${n===t.pays?'actif':''}" data-pays="${n}">${c} ${n}</button>`).join('')}</div></div>`;
  } else if(e===2){
    const s=statsDepart();
    corps=`<h1 class="titre-ecran">Ton poste</h1><div class="pile-choix">${Object.keys(POSITIONS).map(p=>`<button class="carte-choix" data-poste="${p}" style="--barre:${p===t.poste?'var(--accent)':'var(--border)'};${p===t.poste?'background:var(--chip);':''}"><p>${p}</p><span class="risque" style="color:var(--text-muted)">${DOMINANTE[p]}</span></button>`).join('')}</div>`;
  } else if(e===3){
    corps=`<h1 class="titre-ecran">Ton gabarit</h1><div class="pile-choix">${Object.keys(GABARITS).map(g=>{const G=GABARITS[g];const tags=[...Object.entries(G.bonus).map(([k,v])=>`<span style="color:var(--gain)">▲ ${LBL[k]} +${v}</span>`),...Object.entries(G.malus).map(([k,v])=>`<span style="color:var(--perte)">▼ ${LBL[k]} ${v}</span>`)].join(' &nbsp; ');return `<button class="carte-choix" data-gab="${g}" style="--barre:${g===t.gabarit?'var(--accent)':'var(--border)'};${g===t.gabarit?'background:var(--chip);':''};flex-direction:column;align-items:flex-start;gap:6px"><p>${g}</p><span style="font-size:12.5px;color:var(--text-muted)">${G.desc}</span><span style="font-size:12.5px;font-weight:600">${tags}</span></button>`;}).join('')}</div>`;
  } else {
    const st=statsDepart();
    corps=`<h1 class="titre-ecran">Ton maillot</h1>${maillotSvg()}
    <div style="display:flex;align-items:center;justify-content:center;gap:14px"><button class="pilule" id="num-moins">−</button><b style="font-family:Anton,Oswald,Impact,sans-serif;font-size:28px;min-width:48px;text-align:center">${t.numero}</b><button class="pilule" id="num-plus">+</button></div>
    <div class="grille-postes" style="justify-content:center">${[0,1,3,7,10,11,23,30,33].map(n=>`<button class="pilule ${n===t.numero?'actif':''}" data-num="${n}">${n}</button>`).join('')}</div>
    <div class="stats-apercu">${Object.keys(LBL).map(k=>`<div class="ligne-stat"><span>${LBL[k]}</span>${barre(st[k])}</div>`).join('')}</div>`;
    bouton='Commencer ma carrière';
  }
  return `<div class="screen">${progression()}${corps}<button id="btn-continuer" class="bouton">${bouton}</button>${e>1?'<button id="btn-retour" class="lien-reset">Retour</button>':''}</div>`;
}
function attacherCreation(){
  const t=creationTemp;
  const champ=document.getElementById('champ-nom');
  if(champ) champ.oninput=(ev)=>{ t.nom=ev.target.value; document.getElementById('apercu-nom').textContent=(t.nom.trim()||'JOUEUR').toUpperCase(); };
  document.querySelectorAll('[data-pays]').forEach(b=>b.onclick=()=>{ t.pays=b.dataset.pays; render(); });
  document.querySelectorAll('[data-poste]').forEach(b=>b.onclick=()=>{ t.poste=b.dataset.poste; render(); });
  document.querySelectorAll('[data-gab]').forEach(b=>b.onclick=()=>{ t.gabarit=b.dataset.gab; render(); });
  document.querySelectorAll('[data-num]').forEach(b=>b.onclick=()=>{ t.numero=Number(b.dataset.num); render(); });
  const m=document.getElementById('num-moins'), pl=document.getElementById('num-plus');
  if(m) m.onclick=()=>{ t.numero=(t.numero+99)%100; render(); };
  if(pl) pl.onclick=()=>{ t.numero=(t.numero+1)%100; render(); };
  const r=document.getElementById('btn-retour'); if(r) r.onclick=()=>{ t.etape--; render(); };
  document.getElementById('btn-continuer').onclick=()=>{
    if(t.etape<4){ t.etape++; render(); return; }
    nouvellePartie(t.nom.trim().toUpperCase()||'JOUEUR', t.poste);
    etat.stats=statsDepart(); etat.pays=t.pays; etat.gabarit=t.gabarit; etat.numero=t.numero;
    t.etape=1; sauvegarder(); render();
  };
}
function renderTour(){
  const f=etat.franchise;
  return `<div class="screen">
    <div class="entete-tour">
      <span class="puce" style="background:${f.couleur}"></span>
      <span class="meta">Saison ${etat.saison}</span>
      <span class="meta">${etat.age} ans</span>
      <span class="meta">${f.ville} ${f.nom}</span>
    </div>
    ${etat.scenarioActuel?`<h1 class="titre-ecran">${escapeHtml(etat.scenarioActuel.question)}</h1><p class="flavor">${escapeHtml(etat.scenarioActuel.contexte)}</p>`:`<p class="flavor">${texteFlavor()}</p>`}
    <div class="pile-choix">${etat.tourActuel.map((c,i)=>carteChoixHtml(c,i)).join('')}</div>
    ${statsMiniHtml()}
    <button id="btn-reset" class="lien-reset">Recommencer une carrière</button>
  </div>`;
}
function attacherTour(){
  document.querySelectorAll('.carte-choix').forEach(btn=>{
    btn.onclick=()=>{ appliquerChoix(etat.tourActuel[Number(btn.dataset.i)]); render(); };
  });
  document.getElementById('btn-reset').onclick=()=>{
    if(confirm('Recommencer une nouvelle carrière ? La progression actuelle sera perdue.')) reinitialiser();
  };
}
const COULEURS_AXES={'Performance':'#F28C28','Carrière / Contrat':'#22B8CF','Image / Marque':'#9B6BFF','Vie perso':'#F06292','Risque / Legacy':'#E5484D'};
const ICONES_AXES={'Performance':`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12h18M12 3v18M5.6 5.6c3 3 3 10.8 0 12.8M18.4 5.6c-3 3-3 10.8 0 12.8\"/></svg>`,'Carrière / Contrat':`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=\"M3 17l6-6 4 4 8-8M15 7h6v6\"/></svg>`,'Image / Marque':`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=\"M3 10v4h4l6 4V6L7 10zM17 9a4 4 0 010 6\"/></svg>`,'Vie perso':`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=\"M3 11l9-8 9 8M5 10v10h14V10\"/></svg>`,'Risque / Legacy':`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=\"M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z\"/></svg>`};
function niveauRisque(c){
  const e=c.effets||{}; let r=(c.axe==='Risque / Legacy'?2:0)+((e.risqueBlessure||0)>=3?1:0)+((e.rivalite||0)>0?1:0)+((e.alchimieEquipe||0)<0?1:0);
  return clamp(r,0,3);
}
function carteChoixHtml(c,i){
  const r=niveauRisque(c);
  return `<button class="carte-choix" data-i="${i}" style="--barre:${COULEURS_AXES[c.axe]||'var(--border)'}"><span class="ico" style="color:${COULEURS_AXES[c.axe]}">${ICONES_AXES[c.axe]||''}</span><p>${escapeHtml(c.texte)}</p><span class="risque">${'●'.repeat(Math.max(1,r))+'○'.repeat(3-Math.max(1,r))}</span></button>`;
}
function statsMiniHtml(){
  const L=[['SCO','scoring'],['PLA','playmaking'],['DEF','defense'],['ATH','athletisme'],['IQ','basketIQ']];
  return `<div class="stats-mini">${L.map(([n,k])=>`<span class="stat-m">${n} <b class="n">${etat.stats[k]}</b><i><b style="width:${etat.stats[k]}%"></b></i></span>`).join('')}</div>`;
}
const LIBELLES_STATS={scoring:'Scoring',playmaking:'Playmaking',defense:'Défense',athletisme:'Athlétisme',basketIQ:'Basket IQ'};
function renderMatch(){
  const f=etat.franchise;
  const m=etat.matchActuel;
  return `<div class="screen">
    <div class="entete-tour">
      <span class="puce" style="background:${f.couleur}"></span>
      <span class="meta">Saison ${etat.saison}</span>
      <span class="meta">${etat.age} ans</span>
      <span class="meta">${f.ville} ${f.nom}</span>
    </div>
    <p class="logo">EN PLEIN MATCH — SITUATION ${etat.matchsResultats.length+1}/${etat.matchsTotal}</p>
    <h1 class="titre-ecran">${escapeHtml(m.titre)}</h1>
    ${(()=>{const rv=m.rivalId?rivaux().find(r=>r.id===m.rivalId):null;return rv?`<div class="rival-card"><p class="rival-titre">RIVALITÉ ${pastilles(rv.niveau)}</p><p class="rival-ligne">Bilan face à ${escapeHtml(rv.court)} : ${rv.bilan.v}V – ${rv.bilan.d}D · enjeux amplifiés</p></div>`:'';})()}
    <p class="flavor">${escapeHtml(m.contexte)}</p>
    <div class="pile-choix">${m.choix.map((c,i)=>`<button class="carte-choix" data-i="${i}"><p>${escapeHtml(c.texte)}</p></button>`).join('')}</div>
    ${statsMiniHtml()}
  </div>`;
}
function attacherMatch(){
  document.querySelectorAll('.carte-choix').forEach(btn=>{
    btn.onclick=()=>{ resoudreMatch(etat.matchActuel.choix[Number(btn.dataset.i)]); render(); };
  });
}
function renderResultat(){
  const r=etat.dernierResultat;
  const f=etat.franchise;
  const deltasHtml=Object.keys(LIBELLES_STATS).map(k=>{const v=r.deltas[k];return v?`<span class="delta ${v>0?'pos':'neg'}">${LIBELLES_STATS[k]} ${v>0?'▲ +':'▼ '}${v}</span>`:`<span class="delta">${LIBELLES_STATS[k]} =</span>`;}).join('');
  const evtsHtml=r.evenements.map(e=>`<span class="badge">${escapeHtml(e)}</span>`).join('');
  const liste=r.matchs||(r.match?[r.match]:[]);
  const matchHtml=liste.map(m=>`<div class="match-issue ${m.reussi?'ok':'ko'}">
      <p class="match-titre">${escapeHtml(m.titre)} — ${m.reussi?'Réussi':'Raté'}</p>
      <p class="match-choix">${escapeHtml(m.texte)}</p>
      <p class="match-narration">${escapeHtml(m.narration)}</p>
      ${m.rival?`<div class="rival-card"><p class="rival-titre">DUEL — ${escapeHtml(m.rival.nom)} ${pastilles(m.rival.niveau)}</p><p class="rival-ligne">Bilan : ${m.rival.v}V – ${m.rival.d}D</p></div>`:''}
    </div>`).join('');
  return `<div class="screen">
    <div class="entete-tour">
      <span class="puce" style="background:${f.couleur}"></span>
      <span class="meta">Saison ${etat.saison}</span>
      <span class="meta">${etat.age} ans</span>
      <span class="meta">${f.ville} ${f.nom}</span>
    </div>
    <p class="flavor">Intersaison :</p>
    <div style="border:1px solid ${COULEURS_AXES[r.axe]||'var(--border)'};background:color-mix(in srgb,${COULEURS_AXES[r.axe]||'#26345A'} 12%,var(--surface));border-radius:12px;padding:14px 15px"><h1 class="titre-ecran" style="font-size:20px">${escapeHtml(r.texteChoix)}</h1></div>
    ${matchHtml}
    ${deltasHtml?`<div class="deltas">${deltasHtml}</div>`:'<p class="recap">Aucun changement de stats cette saison.</p>'}
    ${evtsHtml?`<div class="badges">${evtsHtml}</div>`:''}
    <button id="btn-suite" class="bouton">Saison suivante</button>
  </div>`;
}
function attacherResultat(){
  document.getElementById('btn-suite').onclick=()=>{ continuerApresResultat(); render(); };
}
function renderRetraite(){
  const sc=calculerScore();
  const d=etat.distinctions;
  return `<div class="screen">
    <p class="logo">FIN DE CARRIÈRE</p>
    ${(()=>{
      const t=sc.total;
      const R=t>=56?['LÉGENDAIRE','#F5C542','Top 5 %']:t>=53?['ÉPIQUE','#D4F04D','Top 25 %']:t>=46?['RARE','#4C6FFF','Top 75 %']:['COMMUN','#9AA7BD','Parcours classique'];
      const cpt=etat.axesCompte||{}; const tot=Object.values(cpt).reduce((a,b)=>a+b,0)||1;
      const lignes=Object.keys(COULEURS_AXES).map(a=>`<div class="profil-l"><span style="display:flex;align-items:center;gap:6px"><span style="color:${COULEURS_AXES[a]};display:flex">${ICONES_AXES[a]}</span>${a.split(' / ')[0]}</span><i><b style="width:${Math.round((cpt[a]||0)/tot*100)}%;background:${COULEURS_AXES[a]}"></b></i></div>`).join('');
      return `<div class="carte-fin" style="--rar:${R[1]}"><p class="rar-nom">${R[0]}</p><p class="rar-nom-joueur">${etat.numero!==undefined?"#"+etat.numero+" ":""}${escapeHtml(etat.nom)}</p><p class="recap">${etat.poste} — ${etat.saison-1} saisons — ${etat.franchise.ville} ${etat.franchise.nom}</p><div class="score-affiche"><span class="score-valeur" style="color:${R[1]}">${t}</span><span class="score-max">/ 96</span></div><p class="rar-pct">${R[2]}</p><div class="profil">${lignes}</div>${signature25()}</div>`;
    })()}
    <div class="score-detail">
      <div class="ligne-score"><span>Titres</span><span>${sc.titres}</span></div>
      <div class="ligne-score"><span>Distinctions</span><span>${sc.distinctions}</span></div>
      <div class="ligne-score"><span>Stats</span><span>${sc.stats}</span></div>
      <div class="ligne-score"><span>Longévité</span><span>${sc.longevite}</span></div>
      <div class="ligne-score malus"><span>Malus</span><span>−${sc.malus}</span></div>
    </div>
    ${(()=>{const l=rivaux();if(!l.length)return '';const g=[...l].sort((a,b)=>(b.niveau*10+b.bilan.v+b.bilan.d)-(a.niveau*10+a.bilan.v+a.bilan.d))[0];const t={equipe:'Rivalité historique',promo:'Rival de promotion',veteran:'Légende à détrôner',ancien:'Ancien coéquipier',media:'Ennemi médiatique'}[g.type];return `<div class="rival-card"><p class="rival-titre">PLUS GRAND RIVAL</p><p class="rival-ligne">${escapeHtml(g.nom)} — ${t} ${pastilles(g.niveau)}</p><p class="rival-ligne">Face à face : ${g.bilan.v}V – ${g.bilan.d}D</p></div>`;})()}
    <div class="badges">
      ${d.titres?`<span class="badge">${d.titres} titre${d.titres>1?'s':''}</span>`:''}
      ${d.allStar?`<span class="badge">${d.allStar}× All-Star</span>`:''}
      ${d.mvp?`<span class="badge">${d.mvp}× MVP</span>`:''}
    </div>
    <button id="btn-partager" class="bouton">Partager</button>
    <button id="btn-rejouer" class="bouton" style="background:var(--surface);color:var(--text);border:1px solid var(--border)">Nouvelle carrière</button>
  </div>`;
}
function attacherRetraite(){
  document.getElementById('btn-rejouer').onclick=()=>{ reinitialiser(); };
  document.getElementById('btn-partager').onclick=async()=>{
    const sc=calculerScore();
    const txt=`${etat.nom} — ${etat.poste} — ${etat.saison-1} saisons — score ${sc.total}/96 sur Five Ways, by 25 Labs. Fais mieux !`;
    try{ if(navigator.share) await navigator.share({text:txt}); else { await navigator.clipboard.writeText(txt); alert('Résultat copié.'); } }catch(_){}
  };
}

function render(){
  try{ renderEcran(); }
  catch(e){
    try{ localStorage.removeItem(SAVE_KEY); }catch(_){}
    etat=null;
    document.getElementById('app').innerHTML=renderCreation();
    attacherCreation();
  }
}
function renderEcran(){
  const app=document.getElementById('app');
  if(!etat&&!accueilVu){ app.innerHTML=renderAccueil(); attacherAccueil(); return; }
  if(!etat){ app.innerHTML=renderCreation(); attacherCreation(); return; }
  if(etat.phase==='lycee'){ app.innerHTML=renderLycee(); attacherLycee(); return; }
  if(etat.phase==='chemin'){ app.innerHTML=renderChemin(); attacherChemin(); return; }
  if(etat.phase==='combine'){ app.innerHTML=renderCombine(); attacherCombine(); return; }
  if(etat.phase==='draftnight'){ app.innerHTML=renderDraftNight(); attacherDraftNight(); return; }
  if(etat.phase==='match'){ app.innerHTML=renderMatch(); attacherMatch(); return; }
  if(etat.phase==='resultat'){ app.innerHTML=renderResultat(); attacherResultat(); return; }
  if(etat.phase==='retraite'){ app.innerHTML=renderRetraite(); attacherRetraite(); return; }
  app.innerHTML=renderTour(); attacherTour();
}
charger();
render();
