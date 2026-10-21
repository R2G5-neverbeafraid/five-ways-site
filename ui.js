// Affichage des écrans et interactions
function texteFlavor(){
  const lignes=[__("Nouvelle intersaison. Voici tes options :"),__("L'heure des choix a sonné pour cette intersaison."),__("Ton entourage attend ta décision pour la suite."),__("Une nouvelle étape de ta carrière commence.")];
  return lignes[etat.saison % lignes.length];
}
function barre(val){ return `<div class="bar"><div class="fill" style="width:${clamp(val,0,99)}%"></div></div>`; }

function renderLycee(){
  return __t("<div class=\"screen\">\n    {#0}\n    <h1 class=\"titre-ecran\">Lycée — dernière année</h1>\n    <p class=\"flavor\">Tu as {#1} ans. Après un tournoi AAU remarqué, plusieurs universités commencent à s'intéresser à toi.</p>\n    <div class=\"pile-choix\">{#2}</div>\n  </div>",[logoCompact(),etat.age,etat.tourActuel.map((c,i)=>carteChoixHtml(c,i)).join('')]);
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
  return __t("<div class=\"screen\">\n    {#0}\n    <h1 class=\"titre-ecran\">Quelle route avant la Draft ?</h1>\n    <p class=\"flavor\">Chaque voie a ses compromis, entre âge d'entrée dans la ligue et solidité de ton profil.</p>\n    <div class=\"pile-choix\">{#1}</div>\n  </div>",[logoCompact(),cheminOrdreTemp.map((c,i)=>`<button class="carte-choix" data-i="${i}"><p>${escapeHtml(__s(c.texte))}</p></button>`).join('')]);
}
function attacherChemin(){
  document.querySelectorAll('.carte-choix').forEach(btn=>{
    btn.onclick=()=>{ choisirChemin(cheminOrdreTemp[Number(btn.dataset.i)]); cheminOrdreTemp=null; render(); };
  });
}
function renderOffresFac(){
  const pitch={3:__("Un programme d'élite : télévision nationale, mais grosse concurrence pour le temps de jeu."),2:__("Un programme solide : un vrai rôle dès la première année."),1:__("Un petit programme : tu seras la star, mais loin des projecteurs.")};
  const cartes=etat.offresFac.map((o,i)=>{
    if(o.k==='fac'){ const e=franchiseParId(o.fid); return `<button class="carte-choix" data-i="${i}" style="--barre:${escapeHtml(e.couleur)};flex-direction:column;align-items:flex-start;gap:5px"><p>${escapeHtml(e.ville)} ${escapeHtml(e.nom)}</p><span style="font-size:12.5px;font-weight:600">${escapeHtml(__(TIERS_FAC[o.tier]))}</span><span style="font-size:12.5px;color:var(--text-muted)">${escapeHtml(pitch[o.tier])}</span></button>`; }
    return `<button class="carte-choix" data-i="${i}"><p>${escapeHtml(__s(CHEMINS_PREDRAFT[o.i].texte))}</p></button>`;
  }).join('');
  return __t("<div class=\"screen\">\n    {#0}\n    <h1 class=\"titre-ecran\">Les universités t'appellent</h1>\n    <p class=\"flavor\">Ta saison de lycée a parlé. Voici les offres reçues, et deux autres routes possibles.</p>\n    <div class=\"pile-choix\">{#1}</div>\n  </div>",[logoCompact(),cartes]);
}
function attacherOffresFac(){
  document.querySelectorAll('.carte-choix').forEach(btn=>{ btn.onclick=()=>{ choisirOffreFac(Number(btn.dataset.i)); render(); }; });
}
function renderCombine(){
  if(!combineOrdreTemp) combineOrdreTemp=melangerOrdre(COMBINE_CHOIX);
  return __t("<div class=\"screen\">\n    {#0}\n    <h1 class=\"titre-ecran\">La Combine</h1>\n    <p class=\"flavor\">Dernière étape avant la Draft. Comment abordes-tu les tests devant les recruteurs ?</p>\n    <div class=\"pile-choix\">{#1}</div>\n  </div>",[logoCompact(),combineOrdreTemp.map((c,i)=>`<button class="carte-choix" data-i="${i}"><p>${escapeHtml(__s(c.texte))}</p></button>`).join('')]);
}
function attacherCombine(){
  document.querySelectorAll('.carte-choix').forEach(btn=>{
    btn.onclick=()=>{ choisirCombine(combineOrdreTemp[Number(btn.dataset.i)]); combineOrdreTemp=null; render(); };
  });
}
function renderDraftNight(){
  const f=etat.franchise;
  const tierLabel = etat.draftPick<=5?__("Top 5"):etat.draftPick<=14?__('Loterie'):etat.draftPick<=30?__("1er tour"):__("2e tour");
  const ovr=Math.round(moyenneStats());
  const caseStat=(lbl,val)=>`<div style="flex:1;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 8px;text-align:center"><div class="chiffre" style="font-size:26px;line-height:1.1">${val}</div><div style="font-size:11px;font-weight:600;letter-spacing:.1em;color:var(--text-muted);margin-top:4px">${lbl}</div></div>`;
  const rivs=rivaux().filter(r=>r.type==='equipe');
  return __t("<div class=\"screen\">\n    {#0}\n    <p class=\"logo\" style=\"color:var(--text-muted)\">DRAFT NIGHT</p>\n    <div style=\"background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:20px;text-align:center\">\n      <div style=\"font-size:12px;font-weight:600;letter-spacing:.14em;color:var(--text-muted)\">CHOIX N° · {#1}</div>\n      <div class=\"chiffre\" style=\"font-size:84px;line-height:1;color:var(--accent);margin:6px 0\">{#2}</div>\n      <div class=\"titre-ecran\" style=\"font-size:24px\">{#3} {#4}</div>\n      <div style=\"font-size:13px;color:var(--text-muted);margin-top:6px\">Tu rejoins la franchise à {#5} ans.</div>\n    </div>\n    <div style=\"display:flex;gap:10px\">{#6}{#7}{#8}{#9}</div>\n    {#10}\n    {#11}\n    <button id=\"btn-rejoindre\" class=\"bouton\">COMMENCER LA SAISON 1</button>\n  </div>",[logoCompact(),tierLabel.toUpperCase(),etat.draftPick,escapeHtml(f.ville),escapeHtml(f.nom),etat.age,caseStat('OVR',ovr),caseStat(__('POSTE'),escapeHtml(posteCourt(etat.poste))),etat.pays?caseStat(__('PAYS'),escapeHtml((PAYS.find(p=>p[0]===etat.pays)||['','--'])[1])):'',caseStat(__('MAILLOT'),'#'+(etat.numero!==undefined?etat.numero:'—')),rivs.length?__t("<div class=\"rival-card\" style=\"background:#2A1820\"><p class=\"rival-titre\">RIVALITÉS HISTORIQUES</p>{#0}</div>",[rivs.map(r=>`<p class="rival-ligne"><span style="color:#E5484D;letter-spacing:2px">${pastilles(r.niveau)}</span> ${escapeHtml(r.nom)} — ${escapeHtml(__s(r.detail))}</p>`).join('')]):'',resumeContratRookie()]);
}
function attacherDraftNight(){
  document.getElementById('btn-rejoindre').onclick=()=>{ etat.file=[]; if(Math.random()<probSponsor()) etat.file.push('sponsor'); suiteHorsSaison(); render(); };
}
function posteCourt(p){ if(LANG==='en'){ return ({'Meneur':'PG','Arrière':'SG','Ailier':'SF','Ailier fort':'PF','Pivot':'C'})[p]||String(p).toUpperCase().slice(0,3); } return String(p).toUpperCase().slice(0,3); }
const DOMINANTE={'Meneur':'PLA','Arrière':'SCO','Ailier':'ATH','Ailier fort':'DEF','Pivot':'IQ'};
const GABARITS={
  'Longiligne':{desc:__("Bras longs, explosif, moins de masse"),bonus:{athletisme:4,defense:1},malus:{playmaking:-3}},
  'Équilibré':{desc:__("Aucun point faible marqué"),bonus:{basketIQ:2},malus:{}},
  'Costaud':{desc:__("Puissant au contact, moins mobile"),bonus:{defense:4,scoring:2},malus:{athletisme:-4}}
};
let creationTemp={etape:1,nom:'',pays:'RDC',poste:'Ailier',gabarit:'Équilibré',numero:23,origine:null,tire:false};
const NB_ETAPES=5;
const LBL={scoring:'SCO',playmaking:'PLA',defense:'DEF',athletisme:'ATH',basketIQ:'IQ'};

// ---- Identité visuelle (voir five-ways-logo.md) ----
function arcSvg(r,a0,a1){ const p=a=>[50+r*Math.cos(a*Math.PI/180),50+r*Math.sin(a*Math.PI/180)].map(v=>v.toFixed(2)); const [x0,y0]=p(a0),[x1,y1]=p(a1); return `M${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}`; }
function logoIcone(s){
  const cols=['#F28C28','#22B8CF','#9B6BFF','#F06292','#E5484D'];
  const arcs=cols.map((c,i)=>`<path d="${arcSvg(36,-90+i*72+6,-90+i*72+66)}" stroke="${c}" stroke-width="7" stroke-linecap="round" fill="none"/>`).join('');
  return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" aria-hidden="true" style="flex:none"><rect width="100" height="100" rx="22" fill="#0E1626" stroke="#26345A" stroke-width="2"/>${arcs}<circle cx="50" cy="50" r="21" fill="#D9692B"/><g stroke="#F3EBDD" stroke-width="2.2" fill="none" stroke-linecap="round"><path d="M50 29v42M29 50h42"/><path d="M36 36c8 8 8 20 0 28M64 36c-8 8-8 20 0 28"/></g></svg>`;
}
function logoCompact(){ return __t("<p class=\"logo\" style=\"display:flex;align-items:center;gap:9px;color:#fff;font-size:17px;letter-spacing:.04em\">{#0}<span>FIVE <span style=\"color:var(--accent)\">WAYS</span></span></p>",[logoIcone(28)]); }
function logo25(h){
  return `<svg viewBox="0 0 100 100" width="${h}" height="${h}" aria-hidden="true" style="flex:none"><g stroke="#EAF2FB" stroke-width="5" stroke-linecap="round"><path d="M50 50V10M50 50L88 38M50 50L74 83M50 50L26 83M50 50L12 38"/></g><g fill="#0E1626" stroke="#EAF2FB" stroke-width="5"><circle cx="50" cy="10" r="7"/><circle cx="88" cy="38" r="7"/><circle cx="74" cy="83" r="7"/><circle cx="26" cy="83" r="7"/><circle cx="12" cy="38" r="7"/></g><circle cx="50" cy="50" r="12" fill="#22D3EE"/></svg>`;
}
function signature25(){ return __t("<p class=\"byline\" style=\"display:flex;align-items:center;gap:8px;justify-content:center\">{#0}<span>by 25 Labs</span></p>",[logo25(18)]); }
let accueilVu=false;
function renderAccueil(){
  return __t("<div class=\"screen\" style=\"min-height:86vh;justify-content:center;align-items:center;text-align:center;gap:22px\">\n    {#0}\n    <div style=\"font-family:'Oswald','Impact',sans-serif;font-weight:700;text-transform:uppercase;line-height:.95;font-size:64px;letter-spacing:.01em\">FIVE<br><span style=\"color:var(--accent)\">WAYS</span></div>\n    <p style=\"margin:0;font-size:12.5px;font-weight:600;letter-spacing:.14em;color:var(--text-muted)\">5 CHOIX. 1 CARRIÈRE.</p>\n    <button id=\"btn-jouer\" class=\"bouton\" style=\"width:100%;margin-top:14px\">Jouer</button>\n    {#1}\n    {#2}\n    {#3}\n  </div>",[logoIcone(112),(()=>{const h=lireHof();return h.length?__t("<div style=\"width:100%;text-align:left;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 14px\"><p class=\"byline\" style=\"margin-bottom:8px\">HALL OF FAME · CET APPAREIL</p>{#0}</div>",[h.map((c,i)=>`<div style="display:flex;justify-content:space-between;font-size:13.5px;padding:3px 0"><span>${i+1}. #${c.numero!==undefined?c.numero:'—'} ${escapeHtml(c.nom)}</span><span style="color:${rareteScore(c.score)[1]};font-weight:700">${c.score}/96</span></div>`).join('')]):'';})(),defisHtml(),signature25()]);
}
function attacherAccueil(){ document.getElementById('btn-jouer').onclick=()=>{ accueilVu=true; render(); }; }
function progression(){ return __t("<div style=\"display:flex;gap:6px\">{#0}</div><p class=\"logo\">CRÉATION — ÉTAPE {#1}/{#2}</p>",[[1,2,3,4,5].map(i=>`<i style="flex:1;height:5px;border-radius:3px;background:${i<=creationTemp.etape?'var(--accent)':'var(--chip)'}"></i>`).join(''),creationTemp.etape,NB_ETAPES]); }
function statsDepart(){
  const st={...POSITIONS[creationTemp.poste]}; const g=GABARITS[creationTemp.gabarit];
  for(const k in g.bonus) st[k]=clamp(st[k]+g.bonus[k],0,99);
  for(const k in g.malus) st[k]=clamp(st[k]+g.malus[k],0,99);
  const org=origineParId(creationTemp.origine);
  if(org) for(const k in org.stats) st[k]=clamp(st[k]+org.stats[k],0,99);
  return st;
}
function maillotSvg(){
  const nom=escapeHtml((creationTemp.nom.trim()||__('JOUEUR')).toUpperCase().slice(0,12));
  return `<svg viewBox="0 0 200 230" width="200" height="230" style="align-self:center"><path id="arc" d="M48 100 Q100 78 152 100" fill="none"/><path d="M62 10 L62 40 Q100 78 138 40 L138 10 L168 10 L158 60 L158 215 Q100 225 42 215 L42 60 L32 10 Z" fill="var(--accent)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><text font-family="Oswald,Impact,sans-serif" font-size="15" font-weight="700" fill="#fff" letter-spacing="1.5" text-anchor="middle"><textPath href="#arc" startOffset="50%">${nom}</textPath></text><text x="100" y="172" font-family="Anton,Oswald,Impact,sans-serif" font-size="78" fill="#fff" text-anchor="middle">${creationTemp.numero}</text></svg>`;
}
function selecteurPays(courant){
  const groupes=['Afrique','Europe','Amériques','Asie'];
  const opt=(n,c)=>`<option value="${escapeHtml(n)}" ${n===courant?'selected':''}>${c} · ${escapeHtml(__(n))}</option>`;
  return `<select id="champ-pays" class="select-pays" aria-label="${__('Nationalité')}">${groupes.map(g=>`<optgroup label="${escapeHtml(__(g))}">${PAYS_LISTE.filter(p=>p[3]===g).map(p=>opt(p[0],p[1])).join('')}</optgroup>`).join('')}${opt('Autre','--')}</select>`;
}
function etiquettesOrigine(o){
  const t=[];
  for(const k in o.stats) t.push(`<span style="color:${o.stats[k]>0?'var(--gain)':'var(--perte)'}">${o.stats[k]>0?'▲':'▼'} ${LBL[k]} ${o.stats[k]>0?'+':''}${o.stats[k]}</span>`);
  if(o.meta.reputation) t.push(`<span style="color:var(--gain)">▲ ${__('Rép.')} +${o.meta.reputation}</span>`);
  if(o.cote) t.push(`<span style="color:var(--gain)">▲ ${__('Draft')} +${o.cote}</span>`);
  if(o.meta.alchimieEquipe<0) t.push(`<span style="color:var(--perte)">▼ ${__('Collectif')} ${o.meta.alchimieEquipe}</span>`);
  if(o.pression) t.push(`<span style="color:var(--perte)">▼ ${__('Pression')}</span>`);
  return t.join(' &nbsp; ');
}
const DE_SVG='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/></svg>';
function ecranOrigine(){
  const t=creationTemp;
  const cartes=ORIGINES.map(o=>`<button class="carte-choix carte-origine" data-orig="${o.id}" style="--barre:${o.id===t.origine?'var(--accent)':'var(--border)'};${o.id===t.origine?'background:var(--chip);':''};flex-direction:column;align-items:flex-start;gap:6px"><p>${escapeHtml(__(o.nom))}</p><span style="font-size:12.5px;color:var(--text-muted)">${escapeHtml(__(o.desc))}</span><span style="font-size:12.5px;font-weight:600">${etiquettesOrigine(o)}</span></button>`).join('');
  const tire=t.tire&&t.origine?`<p class="flavor" id="txt-tire">${escapeHtml(__t("Le hasard a décidé : {#0}.",[__(origineParId(t.origine).nom)]))}</p>`:'';
  return `<h1 class="titre-ecran">${__('Ton origine')}</h1><p class="flavor">${__("D'où viens-tu, avant les projecteurs ?")}</p><div class="pile-choix">${cartes}<button class="carte-choix" id="btn-hasard" style="--barre:var(--accent);flex-direction:row;align-items:center;gap:12px"><span class="ico" style="color:var(--accent);display:flex">${DE_SVG}</span><p>${__("Laisser le hasard choisir")}</p></button></div>${tire}`;
}
function renderCreation(){
  const t=creationTemp, e=t.etape; let corps='', bouton=__('Continuer');
  if(e===1){
    corps=__t("<h1 class=\"titre-ecran\">Ton joueur</h1>\n    <label class=\"champ\"><span>Nom</span><input id=\"champ-nom\" type=\"text\" placeholder=\"NOM DU JOUEUR\" value=\"{#0}\" maxlength=\"18\" style=\"text-transform:uppercase\"></label>\n    <div class=\"champ\"><span>Sur le maillot : <b style=\"color:var(--text)\" id=\"apercu-nom\">{#1}</b></span></div>\n    <div class=\"champ\"><span>Nationalité</span>{#2}</div>",[escapeHtml(t.nom),escapeHtml((t.nom.trim()||__('JOUEUR')).toUpperCase()),selecteurPays(t.pays)]);
  } else if(e===2){
    const s=statsDepart();
    corps=__t("<h1 class=\"titre-ecran\">Ton poste</h1><div class=\"pile-choix\">{#0}</div>",[Object.keys(POSITIONS).map(p=>`<button class="carte-choix" data-poste="${p}" style="--barre:${p===t.poste?'var(--accent)':'var(--border)'};${p===t.poste?'background:var(--chip);':''}"><p>${__(p)}</p><span class="risque" style="color:var(--text-muted)">${DOMINANTE[p]}</span></button>`).join('')]);
  } else if(e===3){
    corps=__t("<h1 class=\"titre-ecran\">Ton gabarit</h1><div class=\"pile-choix\">{#0}</div>",[Object.keys(GABARITS).map(g=>{const G=GABARITS[g];const tags=[...Object.entries(G.bonus).map(([k,v])=>`<span style="color:var(--gain)">▲ ${LBL[k]} +${v}</span>`),...Object.entries(G.malus).map(([k,v])=>`<span style="color:var(--perte)">▼ ${LBL[k]} ${v}</span>`)].join(' &nbsp; ');return `<button class="carte-choix" data-gab="${g}" style="--barre:${g===t.gabarit?'var(--accent)':'var(--border)'};${g===t.gabarit?'background:var(--chip);':''};flex-direction:column;align-items:flex-start;gap:6px"><p>${__(g)}</p><span style="font-size:12.5px;color:var(--text-muted)">${G.desc}</span><span style="font-size:12.5px;font-weight:600">${tags}</span></button>`;}).join('')]);
  } else if(e===4){
    corps=ecranOrigine();
    if(!t.origine) bouton=null;
  } else {
    const st=statsDepart();
    corps=__t("<h1 class=\"titre-ecran\">Ton maillot</h1>{#0}\n    <div style=\"display:flex;align-items:center;justify-content:center;gap:14px\"><button class=\"pilule\" id=\"num-moins\">−</button><b style=\"font-family:Anton,Oswald,Impact,sans-serif;font-size:28px;min-width:48px;text-align:center\">{#1}</b><button class=\"pilule\" id=\"num-plus\">+</button></div>\n    <div class=\"grille-postes\" style=\"justify-content:center\">{#2}</div>\n    <div class=\"stats-apercu\">{#3}</div>",[maillotSvg(),t.numero,[0,1,3,7,10,11,23,30,33].map(n=>`<button class="pilule ${n===t.numero?'actif':''}" data-num="${n}">${n}</button>`).join(''),Object.keys(LBL).map(k=>`<div class="ligne-stat"><span>${LBL[k]}</span>${barre(st[k])}</div>`).join('')]);
    bouton=__("Commencer ma carrière");
  }
  return `<div class="screen">${progression()}${corps}${bouton?`<button id="btn-continuer" class="bouton">${bouton}</button>`:''}${e>1?__("<button id=\"btn-retour\" class=\"lien-reset\">Retour</button>"):''}</div>`;
}
function attacherCreation(){
  const t=creationTemp;
  const champ=document.getElementById('champ-nom');
  if(champ) champ.oninput=(ev)=>{ t.nom=ev.target.value; document.getElementById('apercu-nom').textContent=(t.nom.trim()||__('JOUEUR')).toUpperCase(); };
  const sp=document.getElementById('champ-pays'); if(sp) sp.onchange=()=>{ t.pays=sp.value; render(); };
  document.querySelectorAll('[data-poste]').forEach(b=>b.onclick=()=>{ t.poste=b.dataset.poste; render(); });
  document.querySelectorAll('[data-gab]').forEach(b=>b.onclick=()=>{ t.gabarit=b.dataset.gab; render(); });
  document.querySelectorAll('[data-num]').forEach(b=>b.onclick=()=>{ t.numero=Number(b.dataset.num); render(); });
  const m=document.getElementById('num-moins'), pl=document.getElementById('num-plus');
  if(m) m.onclick=()=>{ t.numero=(t.numero+99)%100; render(); };
  if(pl) pl.onclick=()=>{ t.numero=(t.numero+1)%100; render(); };
  const r=document.getElementById('btn-retour'); if(r) r.onclick=()=>{ t.etape--; render(); };
  document.querySelectorAll('[data-orig]').forEach(b=>b.onclick=()=>{ t.origine=b.dataset.orig; t.tire=false; render(); });
  const de=document.getElementById('btn-hasard'); if(de) de.onclick=()=>{ t.origine=pick(ORIGINES).id; t.tire=true; render(); };
  const bc=document.getElementById('btn-continuer'); if(bc) bc.onclick=()=>{
    if(t.etape<NB_ETAPES){ t.etape++; render(); return; }
    nouvellePartie(t.nom.trim().toUpperCase()||__('JOUEUR'), t.poste);
    etat.stats=statsDepart(); etat.pays=t.pays; etat.gabarit=t.gabarit; etat.numero=t.numero; appliquerOrigine(t.origine); commencerLycee();
    t.etape=1; sauvegarder(); render();
  };
}
function renderTour(){
  const f=etat.franchise;
  return __t("<div class=\"screen\">\n    <div class=\"entete-tour\">\n      <span class=\"puce\" style=\"background:{#0}\"></span>\n      <span class=\"meta\">{#1}</span>\n      <span class=\"meta\">{#2} ans</span>\n      <span class=\"meta\">{#3} {#4}</span>\n    </div>\n    {#5}\n    <div class=\"pile-choix\">{#6}</div>\n    {#7}\n    <button id=\"btn-reset\" class=\"lien-reset\">Recommencer une carrière</button>\n  </div>",[f.couleur,libSaison(),etat.age,escapeHtml(f.ville),escapeHtml(f.nom),etat.scenarioActuel?`<h1 class="titre-ecran">${escapeHtml(__s(etat.scenarioActuel.question))}</h1><p class="flavor">${escapeHtml(__s(etat.scenarioActuel.contexte))}</p>`:`<p class="flavor">${texteFlavor()}</p>`,etat.tourActuel.map((c,i)=>carteChoixHtml(c,i)).join(''),contratChipHtml()+statsMiniHtml()]);
}
function attacherTour(){
  document.querySelectorAll('.carte-choix').forEach(btn=>{
    btn.onclick=()=>{ appliquerChoix(etat.tourActuel[Number(btn.dataset.i)]); render(); };
  });
  document.getElementById('btn-reset').onclick=()=>{
    if(confirm(__("Recommencer une nouvelle carrière ? La progression actuelle sera perdue."))) reinitialiser();
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
  return `<button class="carte-choix" data-i="${i}" style="--barre:${COULEURS_AXES[c.axe]||'var(--border)'}"><span class="ico" style="color:${COULEURS_AXES[c.axe]}">${ICONES_AXES[c.axe]||''}</span><p>${escapeHtml(__s(c.texte))}</p><span class="risque">${'●'.repeat(Math.max(1,r))+'○'.repeat(3-Math.max(1,r))}</span></button>`;
}
function statsMiniHtml(){
  const L=[['SCO','scoring'],['PLA','playmaking'],['DEF','defense'],['ATH','athletisme'],['IQ','basketIQ']];
  return `<div class="stats-mini">${L.map(([n,k])=>`<span class="stat-m">${n} <b class="n">${etat.stats[k]}</b><i><b style="width:${etat.stats[k]}%"></b></i></span>`).join('')}</div>`;
}
const LIBELLES_STATS={scoring:'Scoring',playmaking:'Playmaking',defense:__('Défense'),athletisme:__('Athlétisme'),basketIQ:__("Basket IQ")};
const COUL_STATS={scoring:'#F28C28',playmaking:'#22B8CF',defense:'#4ADE9A',athletisme:'#F06292',basketIQ:'#9B6BFF'};
function enteteMatch(){
  const f=etat.franchise;
  return __t("<div class=\"entete-tour\">\n      <span class=\"puce\" style=\"background:{#0}\"></span>\n      <span class=\"meta\">{#1}</span>\n      <span class=\"meta\">{#2} ans</span>\n      <span class=\"meta\">{#3} {#4}</span>\n    </div>",[f.couleur,libSaison(),etat.age,escapeHtml(f.ville),escapeHtml(f.nom)]);
}
function libelleTemps(t){ return (t.q>=5?__('PROL.'):'Q'+t.q)+' · '+escapeHtml(t.t); }
function pastilleEquipe(c,f){
  if(Array.isArray(f)&&f.length===3) return `<i class="drap">${f.map(x=>`<u style="background:${x}"></u>`).join('')}</i>`;
  return `<i style="background:${c}"></i>`;
}
function tableauHtml(t,score,classe){
  if(!t) return '';
  const s=score||{a:t.a,b:t.b};
  return `<div class="tableau ${classe||''}">
    <div class="tab-eq">${pastilleEquipe(t.ca,t.fa)}<span class="tab-nom">${escapeHtml(t.na)}</span><b id="tab-a" class="tab-score">${s.a}</b></div>
    <div class="tab-centre"><span class="tab-temps">${libelleTemps(t)}</span><span class="tab-dom">${t.neutre?__("NEUTRE"):t.dom?__("À DOMICILE"):__("À L'EXTÉRIEUR")}</span></div>
    <div class="tab-eq droite"><b id="tab-b" class="tab-score">${s.b}</b><span class="tab-nom">${escapeHtml(t.nb)}</span>${pastilleEquipe(t.cb,t.fb)}</div>
  </div>`;
}
function bracketHtml(tour,stade){
  const etapes=estLycee()?[__("1er tour"),__("Quarts"),__("Demi-finales"),__("Finale")]:estFac()?[__("1er tour"),'Sweet 16','Final Four',__("Finale")]:[__("1er tour"),'Demi-finales',__("Finale conf."),'Finales'];
  return `<div class="bracket">${etapes.map((n,i)=>{ const etat_=stade!==undefined?(i<stade-1||(stade===5)?'passe':i===stade-1?'elimine':''):(i<tour?'passe':i===tour?'courant':''); return `<div class="etape ${etat_}"><i></i><span>${escapeHtml(n)}</span></div>`; }).join('')}</div>`;
}
function renderFinReguliere(){
  const s=etat.saisonSport, q=s.qualifie;
  const prem=bracketHtml(0);
  return __t("<div class=\"screen\">\n    {#0}\n    <p class=\"logo\" style=\"color:#F5C542\">FIN DE LA SAISON RÉGULIÈRE</p>\n    <div class=\"bilan-saison anim\">\n      <p class=\"byline\">BILAN · {#1}</p>\n      <div class=\"vd\"><span class=\"chiffre\"><b class=\"cnt\" data-v=\"{#2}\">0</b> – <b class=\"cnt\" data-v=\"{#3}\">0</b></span><span class=\"rang\">{#4} de la conférence</span></div>\n    </div>\n    {#5}\n    <button id=\"btn-suite-reg\" class=\"bouton\">{#6}</button>\n  </div>",[enteteMatch(),etat.saison&&!estFac()?__('SAISON ')+etat.saison:'',s.v,s.d,texteRang(s.rang),q?estLycee()?__t("<div class=\"annonce ok anim\" style=\"animation-delay:.3s\"><p class=\"annonce-t\">QUALIFIÉ POUR LE TOURNOI D'ÉTAT</p><p class=\"annonce-s\">Tu es {#0} de ta ligue. 4 tours à gagner. À chaque tour, un match couperet : réussis ton coup et tu avances, rate-le et ta saison de lycée s'arrête.</p></div>{#1}",[texteRang(s.rang),prem]):estFac()?__t("<div class=\"annonce ok anim\" style=\"animation-delay:.3s\"><p class=\"annonce-t\">QUALIFIÉ POUR LE TOURNOI NATIONAL</p><p class=\"annonce-s\">Tu es {#0} de ta conférence. 4 tours à gagner. À chaque tour, un match couperet : réussis ton coup et tu avances, rate-le et ta saison universitaire s'arrête.</p></div>{#1}",[texteRang(s.rang),prem]):__t("<div class=\"annonce ok anim\" style=\"animation-delay:.3s\"><p class=\"annonce-t\">QUALIFIÉ POUR LES PLAYOFFS</p><p class=\"annonce-s\">Tu es {#0}. 4 tours à gagner. À chaque tour, un match décisif : réussis ton coup et tu avances, rate-le et la saison s'arrête.</p></div>{#1}",[texteRang(s.rang),prem])
      :estLycee()?__t("<div class=\"annonce ko anim\" style=\"animation-delay:.3s\"><p class=\"annonce-t\">NON QUALIFIÉ</p><p class=\"annonce-s\">Tu termines {#0} de ta ligue : pas de tournoi d'État cette saison. Seuls les 8 premiers se qualifient.</p></div>",[texteRang(s.rang)]):estFac()?__t("<div class=\"annonce ko anim\" style=\"animation-delay:.3s\"><p class=\"annonce-t\">NON QUALIFIÉ</p><p class=\"annonce-s\">Tu termines {#0} de ta conférence : pas de tournoi national cette saison. Seuls les 8 premiers se qualifient.</p></div>",[texteRang(s.rang)]):__t("<div class=\"annonce ko anim\" style=\"animation-delay:.3s\"><p class=\"annonce-t\">NON QUALIFIÉ</p><p class=\"annonce-s\">Tu termines {#0} : pas de playoffs cette saison. Seuls les 8 premiers de la conférence se qualifient.</p></div>",[texteRang(s.rang)]),q?(estFac()?__("Commencer le tournoi"):__("Commencer les playoffs")):__("Voir le bilan de la saison")]);
}
function attacherFinReguliere(){
  Son.buzzer(); vibrer([60,40,60]);
  document.getElementById('btn-suite-reg').onclick=()=>{ Son.clic(); if(etat.playoffs) Son.foule(); avancerFinReguliere(); render(); };
}
function pourcentageOption(c){ const b=clamp(etat.stats[c.stat]/100+c.mod,0.12,0.9)+(etat.phase==='playoffs'?bonusPlayoffs():0); return Math.round(clamp(b,0.05,0.95)*100); }
function renderMatch(){
  const m=etat.matchActuel;
  const rv=m.rivalId?rivaux().find(r=>r.id===m.rivalId):null;
  return __t("<div class=\"screen\">\n    {#0}\n    {#1}\n    {#2}\n    <h1 class=\"titre-ecran\">{#3}</h1>\n    {#4}\n    <p class=\"flavor\">{#5}</p>\n    <div class=\"pile-choix\">{#6}</div>\n    <p class=\"aide-geste\">{#7}Ensuite, arrête la jauge dans la zone verte (jusqu'à +14 %). Hors de la zone, l'action est perdue.</p>\n    {#8}\n  </div>",[enteteMatch(),m.playoff?__t("<p class=\"logo\" style=\"color:#F5C542\">{#2} · {#0}</p>{#1}",[escapeHtml((toursPO()[m.tour]||'').toUpperCase()),bracketHtml(m.tour),estLycee()?__("TOURNOI D'ÉTAT"):estFac()?__('TOURNOI NATIONAL'):__('PLAYOFFS')]):__t("<p class=\"logo\">MOMENT DE MATCH {#0}/{#1}</p>",[etat.matchsResultats.length+1,etat.matchsTotal]),tableauHtml(m.tableau),escapeHtml(__s(m.titre)),rv?__t("<div class=\"rival-card\"><p class=\"rival-titre\">RIVALITÉ {#0}</p><p class=\"rival-ligne\">Bilan face à {#1} : {#2}V – {#3}D · enjeux amplifiés</p></div>",[pastilles(rv.niveau),escapeHtml(__court(rv.court)),rv.bilan.v,rv.bilan.d]):'',escapeHtml(__s(m.contexte)),m.choix.map((c,i)=>`<button class="carte-choix carte-match" data-i="${i}" style="--barre:${COUL_STATS[c.stat]||'var(--border)'}"><p>${escapeHtml(__s(c.texte))}</p><span class="pct"><b class="chiffre">${pourcentageOption(c)}</b>%<small>${escapeHtml(LBL[c.stat]||'')}</small></span></button>`).join(''),m.playoff?__("Adversaires de haut niveau : les pourcentages sont plus bas qu'en saison régulière. "):'',statsMiniHtml()]);
}
function attacherMatch(){
  document.querySelectorAll('.carte-match').forEach(btn=>{
    btn.onclick=()=>{ Son.clic(); ecranGeste(etat.matchActuel.choix[Number(btn.dataset.i)]); };
  });
}
function ecranGeste(opt){
  const m=etat.matchActuel, g=GESTES[opt.stat]||GESTES.scoring;
  const base=pourcentageOption(opt);
  document.getElementById('app').innerHTML=__t("<div class=\"screen\">\n    {#0}\n    {#1}\n    <p class=\"logo\">À TOI DE JOUER</p>\n    <div class=\"action-choisie\" style=\"--barre:{#2}\"><p>{#3}</p><span class=\"pct\"><b class=\"chiffre\" id=\"pct-live\">{#4}</b>%</span></div>\n    <div class=\"jauge\"><div id=\"jauge-zone\"></div><div id=\"jauge-curseur\"></div></div>\n    <p class=\"aide-geste\" id=\"aide-geste\">Appuie quand la barre est dans la zone verte. Hors de la zone, l'action est perdue.</p>\n    <button id=\"btn-geste\" class=\"bouton bouton-geste\">{#5}</button>\n  </div>",[enteteMatch(),tableauHtml(m.tableau),COUL_STATS[opt.stat]||'var(--border)',escapeHtml(__s(opt.texte)),base,g[0]]);
  window.scrollTo(0,0);
  const dif=difficulteJauge(m);
  if(dif.note){ const el=document.getElementById('aide-geste'); if(el) el.insertAdjacentHTML('beforebegin','<p class="aide-geste aide-dur">'+escapeHtml(dif.note)+'</p>'); }
  demarrerJauge(opt.stat,geste=>{
    Son.tic();
    const pct=geste.label==='rate'?0:Math.round(clamp(base/100+geste.bonus,0.05,0.95)*100);
    const aide=document.getElementById('aide-geste'), live=document.getElementById('pct-live');
    if(live) live.textContent=pct;
    if(aide) aide.textContent=geste.label==='parfait'?__("Timing parfait ! +14 %"):geste.label==='bon'?__("Dans la zone, +8 %"):__("Zone ratée : l'action est perdue.");
    const avantTab=m.tableau, stat=opt.stat;
    const entree=resoudreMatch(opt,geste);
    setTimeout(()=>ecranReveal(entree,avantTab,stat),650);
  },dif);
}
function ecranReveal(entree,tab,stat){
  const g=GESTES[stat]||GESTES.scoring, ok=entree.reussi, apres=tab?scoreApres(tab,ok):null;
  const termine=!!(tab&&tab.q>=4&&/^0:[0-5]\d$/.test(tab.t));
  document.getElementById('app').innerHTML=`<div class="screen reveal">
    ${enteteMatch()}
    ${tableauHtml(tab)}
    <div class="suspense" id="suspense"><span class="points">…</span></div>
    <div id="apres" class="apres"></div>
  </div>`;
  window.scrollTo(0,0);
  Son.foule();
  setTimeout(()=>{
    const zone=document.getElementById('suspense'); if(!zone) return;
    zone.innerHTML=`<span class="mot ${ok?'ok':'ko'}">${escapeHtml(ok?g[1]:g[2])}</span>`;
    if(apres){ const a=document.getElementById('tab-a'), b=document.getElementById('tab-b'); if(a){ a.textContent=apres.a; a.classList.add('bump'); } if(b){ b.textContent=apres.b; b.classList.add('bump'); } }
    if(ok){ Son.swish(); vibrer(60); if(termine) setTimeout(()=>{ Son.buzzer(); vibrer([80,40,80]); },450); } else { Son.contre(); Son.huee(); vibrer([30,40,120]); }
  },1100);
  setTimeout(()=>{
    const zone=document.getElementById('apres'); if(!zone) return;
    const fin=termine&&apres?`<p class="fin-match ${apres.a>apres.b?'ok':'ko'}">${apres.a>apres.b?__('VICTOIRE'):__('DÉFAITE')} ${apres.a}–${apres.b}</p>`:'';
    const iss=entree.issue;
    const banniere=iss?`<div class="annonce ${iss.avance?'ok':'ko'}"><p class="annonce-t">${iss.champion?__("CHAMPION !"):iss.avance?__("TU PASSES : ")+escapeHtml((iss.suivant||'').toUpperCase()):__('ÉLIMINÉ')}</p><p class="annonce-s">${iss.champion?__("Tu remportes le titre."):iss.avance?escapeHtml(iss.nom)+__(" gagné. Prochain match décisif."):__("Ta saison s'arrête en ")+escapeHtml(iss.nom.toLowerCase())+'.'}</p></div>`:'';
    if(iss){ if(iss.champion){ Son.succes(); Son.foule(); vibrer([80,40,80,40,160]); } else if(!iss.avance){ Son.huee(); } else Son.succes(); }
    const libelle=iss?((iss.avance&&!iss.champion)?__("Tour suivant"):__("Voir le bilan de la saison")):(etat.phase==='finreguliere'?__("Fin de la saison régulière"):__('Continuer'));
    zone.innerHTML=`${fin}${banniere}<p class="narration">${escapeHtml(__s(entree.narration))}</p>
      <div class="fil">${(entree.actus||[]).map(a=>`<div class="actu"><span class="src">${escapeHtml(__(a.src))}</span><span>${escapeHtml(__s(a.texte))}</span></div>`).join('')}</div>
      <button id="btn-continuer" class="bouton">${libelle}</button>`;
    zone.classList.add('visible');
    document.getElementById('btn-continuer').onclick=()=>{ Son.clic(); render(); };
  },2100);
}
function bilanSaisonHtml(s){
  if(!s||typeof s!=='object') return '';
  const v=Number(s.v)||0, d=Number(s.d)||0, rang=Number(s.rang)||15, st=Math.max(0,Math.min(5,Number(s.stade)||0));
  const points=[1,2,3,4,5].map(i=>`<i class="${st>=i?'on':''}"></i>`).join('');
  return __t("<div class=\"bilan-saison anim\" style=\"animation-delay:.1s\">\n    <p class=\"byline\">BILAN DE LA SAISON</p>\n    <div class=\"vd\"><span class=\"chiffre\"><b class=\"cnt\" data-v=\"{#0}\">0</b> – <b class=\"cnt\" data-v=\"{#1}\">0</b></span><span class=\"rang\">{#2} de la conférence</span></div>\n    <div class=\"playoffs\"><div class=\"pts\">{#3}</div><span>{#4}</span></div>\n  </div>",[v,d,texteRang(rang),points,escapeHtml(stadesSaison()[st])]);
}
function renderResultat(){
  const r=etat.dernierResultat;
  const deltasHtml=Object.keys(LIBELLES_STATS).map(k=>{const v=Number(r.deltas[k])||0;return v?`<span class="delta ${v>0?'pos':'neg'}">${LIBELLES_STATS[k]} ${v>0?'▲ +':'▼ −'}<b class="cnt" data-v="${Math.abs(v)}">0</b></span>`:`<span class="delta">${LIBELLES_STATS[k]} =</span>`;}).join('');
  const evtsHtml=r.evenements.map(e=>`<span class="badge">${escapeHtml(__s(e))}</span>`).join('');
  const liste=r.matchs||(r.match?[r.match]:[]);
  const matchHtml=liste.map((m,i)=>`<div class="match-issue anim ${m.reussi?'ok':'ko'}" style="animation-delay:${0.35+i*0.25}s">
      <p class="match-titre">${m.playoff?(r.saison&&r.saison.fac?__("TOURNOI · "):__("PLAYOFFS · ")):''}${escapeHtml(__s(m.titre))} — ${m.reussi?__('Réussi'):__('Raté')}${m.p?' · '+Number(m.p)+' %':''}${m.geste==='parfait'?__(" · geste parfait"):m.geste==='rate'?__(" · zone ratée"):''}</p>
      <p class="match-choix">${escapeHtml(__s(m.texte))}</p>
      <p class="match-narration">${escapeHtml(__s(m.narration))}</p>
      ${m.rival?__t("<div class=\"rival-card\"><p class=\"rival-titre\">DUEL — {#0} {#1}</p><p class=\"rival-ligne\">Bilan : {#2}V – {#3}D</p></div>",[escapeHtml(m.rival.nom),pastilles(m.rival.niveau),m.rival.v,m.rival.d]):''}
    </div>`).join('');
  const actus=[];
  const dernier=liste[liste.length-1];
  if(dernier&&Array.isArray(dernier.actus)) actus.push(...dernier.actus.slice(0,1));
  const autre=[].concat(...liste.map(m=>Array.isArray(m.actus)?m.actus:[])).filter(a=>a&&(a.src==='RIVAL'||a.src==='FANS')).pop();
  if(autre) actus.push(autre);
  const fil=actus.length?__t("<div class=\"fil anim\" style=\"animation-delay:{#0}s\"><p class=\"byline\">À LA UNE</p>{#1}</div>",[0.4+liste.length*0.25,actus.map(a=>`<div class="actu"><span class="src">${escapeHtml(__(a.src))}</span><span>${escapeHtml(__s(a.texte))}</span></div>`).join('')]):'';
  return __t("<div class=\"screen\">\n    {#0}\n    {#1}\n    <div class=\"anim\" style=\"animation-delay:.2s;border:1px solid {#2};background:color-mix(in srgb,{#3} 12%,var(--surface));border-radius:12px;padding:14px 15px\"><h1 class=\"titre-ecran\" style=\"font-size:20px\">{#4}</h1></div>\n    {#5}\n    {#6}\n    {#7}\n    {#8}\n    <button id=\"btn-suite\" class=\"bouton\">Saison suivante</button>\n  </div>",[enteteMatch(),bilanSaisonHtml(r.saison),COULEURS_AXES[r.axe]||'var(--border)',COULEURS_AXES[r.axe]||'#26345A',escapeHtml(__s(r.texteChoix)),matchHtml,fil,deltasHtml?`<div class="deltas anim" style="animation-delay:${0.6+liste.length*0.25}s">${deltasHtml}</div>`:__("<p class=\"recap\">Aucun changement de stats cette saison.</p>"),evtsHtml?`<div class="badges anim" style="animation-delay:${0.8+liste.length*0.25}s">${evtsHtml}</div>`:''+gainsSaisonHtml(r)]);
}
function attacherResultat(){
  document.getElementById('btn-suite').onclick=()=>{ Son.clic(); continuerApresResultat(); render(); };
}
function renderRetraite(){
  const sc=calculerScore();
  const d=etat.distinctions;
  return __t("<div class=\"screen\">\n    <p class=\"logo\">FIN DE CARRIÈRE</p>\n    {#0}\n    <div class=\"score-detail\">\n      <div class=\"ligne-score\"><span>Titres</span><span>{#1}</span></div>\n      <div class=\"ligne-score\"><span>Distinctions</span><span>{#2}</span></div>\n      <div class=\"ligne-score\"><span>Stats</span><span>{#3}</span></div>\n      <div class=\"ligne-score\"><span>Longévité</span><span>{#4}</span></div>\n      <div class=\"ligne-score malus\"><span>Malus</span><span>−{#5}</span></div>\n    </div>\n    {#6}\n    <div class=\"badges\">\n      {#7}\n      {#8}\n      {#9}\n      {#10}\n    </div>\n    <button id=\"btn-partager\" class=\"bouton\">Partager</button>\n    <button id=\"btn-rejouer\" class=\"bouton\" style=\"background:var(--surface);color:var(--text);border:1px solid var(--border)\">Nouvelle carrière</button>\n  </div>",[(()=>{
      const t=sc.total;
      const R=rareteScore(t);
      const cpt=etat.axesCompte||{}; const tot=Object.values(cpt).reduce((a,b)=>a+b,0)||1;
      const lignes=Object.keys(COULEURS_AXES).map(a=>`<div class="profil-l"><span style="display:flex;align-items:center;gap:6px"><span style="color:${COULEURS_AXES[a]};display:flex">${ICONES_AXES[a]}</span>${__(a.split(' / ')[0])}</span><i><b style="width:${Math.round((cpt[a]||0)/tot*100)}%;background:${COULEURS_AXES[a]}"></b></i></div>`).join('');
      return __t("<div class=\"carte-fin\" style=\"--rar:{#0}\"><p class=\"rar-nom\">{#1}</p><p class=\"rar-nom-joueur\">{#2}{#3}</p><p class=\"recap\">{#4} — {#5} saisons — {#6} {#7}</p><div class=\"score-affiche\"><span class=\"score-valeur\" style=\"color:{#8}\">{#9}</span><span class=\"score-max\">/ 96</span></div><p class=\"rar-pct\">{#10}</p><div class=\"profil\">{#11}</div>{#12}</div>",[R[1],R[0],etat.numero!==undefined?"#"+etat.numero+" ":"",escapeHtml(etat.nom),__(etat.poste),etat.saison-1,etat.franchise.ville,etat.franchise.nom,R[1],t,R[2],lignes,signature25()]);
    })(),sc.titres,sc.distinctions,sc.stats,sc.longevite,sc.malus,(()=>{const l=rivaux();if(!l.length)return '';const g=[...l].sort((a,b)=>(b.niveau*10+b.bilan.v+b.bilan.d)-(a.niveau*10+a.bilan.v+a.bilan.d))[0];const t={equipe:__("Rivalité historique"),promo:__("Rival de promotion"),veteran:__("Légende à détrôner"),ancien:__("Ancien coéquipier"),media:__("Ennemi médiatique")}[g.type];return __t("<div class=\"rival-card\"><p class=\"rival-titre\">PLUS GRAND RIVAL</p><p class=\"rival-ligne\">{#0} — {#1} {#2}</p><p class=\"rival-ligne\">Face à face : {#3}V – {#4}D</p></div>",[escapeHtml(g.nom),t,pastilles(g.niveau),g.bilan.v,g.bilan.d]);})(),d.titres?__t("<span class=\"badge\">{#0} titre{#1}</span>",[d.titres,d.titres>1?'s':'']):'',d.allStar?__t("<span class=\"badge\">{#0}× All-Star</span>",[d.allStar]):'',d.mvp?__t("<span class=\"badge\">{#0}× MVP</span>",[d.mvp]):'',d.medailles?__t("<span class=\"badge\">{#0} pts de médailles</span>",[d.medailles]):''+gainsCarriereHtml()+bilanDefiHtml()]);
}
function attacherRetraite(){
  document.getElementById('btn-rejouer').onclick=()=>{ reinitialiser(); };
  document.getElementById('btn-partager').onclick=async()=>{
    const sc=calculerScore();
    const txt=__t("{#0} — {#1} — {#2} saisons — score {#3}/96 sur Five Ways, by 25 Labs. Fais mieux !",[etat.nom,__(etat.poste),etat.saison-1,sc.total]);
    try{ if(navigator.share) await navigator.share({text:txt}); else { await navigator.clipboard.writeText(txt); alert(__("Résultat copié.")); } }catch(_){}
  };
}

function render(){
  try{ renderEcran(); monterBoutonSon(); monterBoutonLangue(); monterBoutonMenu(); monterBarreBas(); animerCompteurs(); }
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
  if(etat.phase==='offresfac'){ app.innerHTML=renderOffresFac(); attacherOffresFac(); return; }
  if(etat.phase==='combine'){ app.innerHTML=renderCombine(); attacherCombine(); return; }
  if(etat.phase==='draftnight'){ app.innerHTML=renderDraftNight(); attacherDraftNight(); return; }
  if(etat.phase==='match'||etat.phase==='playoffs'){ app.innerHTML=renderMatch(); attacherMatch(); return; }
  if(etat.phase==='finreguliere'){ app.innerHTML=renderFinReguliere(); attacherFinReguliere(); return; }
  if(etat.phase==='resultat'){ app.innerHTML=renderResultat(); attacherResultat(); return; }
  if(etat.phase==='retraite'){ app.innerHTML=renderRetraite(); attacherRetraite(); return; }
  if(etat.phase==='contrat'){ app.innerHTML=renderContrat(); attacherContrat(); return; }
  if(etat.phase==='sponsor'){ app.innerHTML=renderSponsor(); attacherSponsor(); return; }
  if(etat.phase==='trade'){ app.innerHTML=renderTrade(); attacherTrade(); return; }
  app.innerHTML=renderTour(); attacherTour();
}
charger();
render();
