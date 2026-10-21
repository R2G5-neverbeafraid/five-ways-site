// Contrats, marques, trades : inspirés du fonctionnement réel de la NBA (plafond salarial, échelle rookie, droits Bird, clause de non-trade…)
// Les montants sont en millions de dollars (M$) et suivent le plafond de la ligue, qui augmente chaque année.
const CAP0=140;
function r1(v){ return Math.round(v*10)/10; }
function plafond(){ return CAP0*Math.pow(1.04,Math.max(0,(etat.saison||1)-1)); }
function minimumLigue(){ return r1(plafond()*0.0145); }
function fmtM(v){ const n=r1(v).toFixed(1); return (LANG==='en'?n:n.replace('.',','))+' M$'; }
function ansService(){ return Math.max(0,(etat.saison||1)-1); }
function maxPart(){ const a=ansService(); return a>=10?0.35:a>=7?0.30:0.25; }
function ntcEligible(){ return ansService()>=8&&(etat.ansEquipe||0)>=4; }
function fmtAns(n){ n=Math.max(0,Math.round(n)); return LANG==='en'?n+(n>1?' yrs':' yr'):n+(n>1?' ans':' an'); }
function totalContrat(c){ return r1(c.salaire*c.annees); }
const TAGS_EQUIPE=['contender','marche','reconstruction'];

/* ---------- Valeur de marché ---------- */
function reputationMarque(){
  const ac=etat.axesCompte||{};
  const image=ac['Image / Marque']||0, risque=ac['Risque / Legacy']||0;
  return clamp(etat.meta.reputation+Math.min(10,image*1.5)-Math.max(0,risque-3)*2,0,100);
}
function valeurMarche(){
  const ovr=moyenneStats(), rep=etat.meta.reputation, d=etat.distinctions;
  let q=(ovr-48)/32+(rep-50)/400+(d.allStar>0?0.05:0)+(d.mvp>0?0.08:0)+(d.titres>0?0.03:0);
  if(etat.bilan&&etat.bilan.total) q+=(etat.bilan.reussis/etat.bilan.total-0.5)*0.15;
  if(etat.age>=31) q-=(etat.age-30)*0.05;
  q=clamp(q,0,1.05);
  const part=0.017+Math.pow(q,1.5)*(maxPart()-0.017);
  return clamp(part,0.0145,maxPart());
}

/* ---------- Contrat rookie (échelle des choix de Draft) ---------- */
function contratRookie(pick){
  const premier=pick<=30;
  const salaire=premier?plafond()*0.087*(0.22+0.78*Math.exp(-(pick-1)/9)):plafond()*0.0145;
  return {type:'rookie',annees:premier?4:2,reste:premier?4:2,salaire:r1(salaire),ntc:false,optJ:false,garantis:premier?2:1};
}

/* ---------- Changer d'équipe ---------- */
function changerFranchise(f,tag){
  etat.ancienneFranchise={ville:etat.franchise.ville,nom:etat.franchise.nom};
  etat.franchise=f; etat.ansEquipe=0;
  etat.rivaux=rivaux().filter(r=>r.type!=='equipe').concat(rivauxEquipes(f.id).map(creerRivalEquipe));
  etat.meta.alchimieEquipe=clamp(46+Math.floor(Math.random()*10),0,100);
  etat.meta.coteEquipe=tag==='contender'?68:tag==='reconstruction'?40:tag==='marche'?56:52;
  if(tag==='marche') appliquerEffets({reputation:4});
  if(tag==='reconstruction') appliquerEffets({scoring:2});
}

/* ---------- Offres de contrat ---------- */
function genererOffresContrat(mode){
  const own=etat.franchise, age=etat.age;
  const S=valeurMarche()*plafond(), max=maxPart()*plafond(), min=minimumLigue();
  const cl=v=>r1(clamp(v,min,max));
  const autres=melangerOrdre(FRANCHISES.filter(f=>f.id!==own.id));
  const tags=melangerOrdre(TAGS_EQUIPE);
  const offres=[];
  if(mode==='extension'){
    const capExt=(etat.distinctions.mvp>0||etat.distinctions.allStar>=2?0.30:0.25)*plafond();
    offres.push({k:'ext5',fid:own.id,annees:5,salaire:r1(Math.min(S,capExt)),tag:'maison',ntc:false,optJ:false});
    offres.push({k:'ext4',fid:own.id,annees:4,salaire:r1(Math.min(S*0.93,capExt)),tag:'maison',ntc:false,optJ:true});
    offres.push({k:'refus',fid:own.id,annees:0,salaire:0,tag:'refus',ntc:false,optJ:false});
    return offres;
  }
  const longue=age>=33?2:age>=31?3:5;
  offres.push({k:'maison_longue',fid:own.id,annees:longue,salaire:cl(S),tag:'maison',ntc:false,optJ:false});
  offres.push({k:'maison_flex',fid:own.id,annees:2,salaire:cl(S*1.05),tag:'maison',ntc:false,optJ:true});
  offres.push({k:'ext_equipe',fid:autres[0].id,annees:Math.min(4,longue),salaire:cl(S*0.93),tag:'contender',ntc:false,optJ:false});
  offres.push({k:'ext_equipe',fid:autres[1].id,annees:Math.min(4,longue),salaire:cl(S*1.08),tag:tags[0]==='contender'?'marche':tags[0],ntc:false,optJ:false});
  const _ntc=ntcEligible()&&S>plafond()*0.08;
  if(_ntc) offres.push({k:'maison_ntc',fid:own.id,annees:longue,salaire:cl(S*0.97),tag:'maison',ntc:true,optJ:false});
  else if(age>=31||S<min*2.2) offres.push({k:'veteran',fid:autres[2].id,annees:1,salaire:cl(Math.max(min,S*0.5)),tag:'contender',ntc:false,optJ:false});
  else offres.push({k:'pari',fid:own.id,annees:1,salaire:cl(S*1.12),tag:'maison',ntc:false,optJ:false});
  offres.push({k:'agence',fid:own.id,annees:0,salaire:0,tag:'maison',ntc:false,optJ:false});
  return offres;
}
/* ---------- Agence libre : le marché s'ouvre, avec interview pour les joueurs importants ---------- */
function joueurImportant(){ const d=etat.distinctions; return (etat.meta.reputation>=60&&moyenneStats()>=66)||d.allStar>0||d.mvp>0; }
function genererOffresAgence(prime,pref){
  const o_=genererOffresAgenceBrut(prime,pref), mx=maxPart()*plafond();
  o_.forEach((o,i)=>{ if(o.salaire>=mx-0.05) o.salaire=r1(mx*(1-0.02*i)); });
  return o_;
}
function genererOffresAgenceBrut(prime,pref){
  const own=etat.franchise, age=etat.age, S=valeurMarche()*plafond(), max=maxPart()*plafond(), min=minimumLigue();
  const cl=v=>r1(clamp(v,min,max)), longue=age>=33?2:age>=31?3:5;
  const autres=melangerOrdre(FRANCHISES.filter(f=>f.id!==own.id)); let n=0;
  const eq=(tag,m)=>({k:'ext_equipe',fid:autres[n++%autres.length].id,annees:Math.min(4,longue),salaire:cl(S*m),tag,ntc:false,optJ:false});
  const maison=(m,ntc,flex)=>({k:ntc?'maison_ntc':flex?'maison_flex':'maison_longue',fid:own.id,annees:flex?2:longue,salaire:cl(S*m),tag:'maison',ntc:!!ntc,optJ:!!flex});
  const p=prime||1, ntcOk=ntcEligible()&&S>plafond()*0.08;
  if(pref==='contender') return [eq('contender',p*1.03),eq('contender',p*0.98),eq('contender',p*0.93),eq('marche',p*1.08),maison(p*0.97)];
  if(pref==='argent') return [eq('marche',p*1.2),eq('reconstruction',p*1.14),eq('contender',p*1.05),eq('marche',p),maison(p)];
  if(pref==='marche') return [eq('marche',p*1.04),eq('marche',p),eq('marche',p*0.95),eq('contender',p),maison(p*0.97)];
  if(pref==='maison') return [maison(p*1.05,ntcOk),maison(p*1.1,false,true),eq('contender',p),eq('marche',p*1.05),eq('reconstruction',p*0.98)];
  if(pref==='star') return [eq('reconstruction',p*1.1),eq('reconstruction',p*1.05),eq('reconstruction',p),eq('contender',p*0.98),maison(p*0.97)];
  return [eq('contender',0.93),eq('marche',1.0),eq('reconstruction',0.97),eq('marche',0.9),maison(1.0)];
}
function ouvrirAgenceLibre(){
  if(joueurImportant()){ etat.interview={id:'fa1',kind:'agence',etape:0,chaud:0,pref:null,ordre:melangerOrdre([0,1,2,3,4]),suite:'agence',resultat:null}; etat.phase='interview'; }
  else etat.offres=genererOffresAgence(1,null);
  sauvegarder();
}
function accepterOffreContrat(i){
  const o=(etat.offres||[])[i]; if(!o) return;
  if(o.k==='agence') return ouvrirAgenceLibre();
  if(o.k==='refus'){ etat.refusExt=true; etat.offres=null; return suiteHorsSaison(); }
  const f=franchiseParId(o.fid)||etat.franchise;
  if(f.id!==etat.franchise.id) changerFranchise(f,o.tag);
  else appliquerEffets({alchimieEquipe:4,reputation:1});
  const nouveau={type:'standard',annees:o.annees,reste:o.annees,salaire:o.salaire,ntc:!!o.ntc,optJ:!!o.optJ};
  if(etat.modeOffres==='extension'&&etat.contrat){ etat.contrat.suivant=nouveau; }
  else etat.contrat=nouveau;
  etat.refusExt=false;
  etat.signatures=(etat.signatures||0)+1;
  etat.offres=null;
  suiteHorsSaison();
}

/* ---------- Offres de marques (chaussures) ---------- */
const MARQUES=[
  {id:'stride',nom:'Stride',palier:3},
  {id:'vektor',nom:'Vektor',palier:3},
  {id:'orbit',nom:'Orbit',palier:2},
  {id:'kora',nom:'Kora',palier:2},
  {id:'anvil',nom:'Anvil',palier:1}
];
function marqueParId(id){ return MARQUES.find(m=>m.id===id)||null; }
function probSponsor(){ return clamp((reputationMarque()-38)/70,0,0.7); }
function genererOffresMarque(){
  const rep=reputationMarque(), ovr=moyenneStats();
  const niveau=clamp((rep-35)/55,0,1);
  if(niveau<0.08) return [];
  const rookie=etat.contrat&&etat.contrat.type==='rookie'&&etat.saison<=1;
  const base=0.35+Math.pow(niveau,1.7)*13*(rookie?0.55:1);
  const signature=rep>=78&&ovr>=72;
  const noms=melangerOrdre(MARQUES.filter(m=>m.palier>=2));
  const grande=noms.find(m=>m.palier===3), autre=noms.find(m=>m.palier===3&&m!==grande)||noms.find(m=>m!==grande);
  const offres=[
    {k:signature?'signature':'standard',mid:grande.id,annees:signature?5:4,valeur:r1(base*(signature?1.9:1))},
    {k:'standard',mid:autre.id,annees:3,valeur:r1(base*0.75)},
    {k:'emergente',mid:'kora',annees:3,valeur:r1(Math.max(0.2,base*0.5))},
    {k:'prime',mid:'anvil',annees:3,valeur:r1(Math.max(0.2,base*0.45))}
  ];
  offres.push({k:'libre',mid:'',annees:0,valeur:0});
  return offres;
}
function accepterOffreMarque(i){
  const o=(etat.offres||[])[i]; if(!o) return;
  if(o.k!=='libre'){
    etat.marque={id:o.mid,type:o.k,annees:o.annees,reste:o.annees,valeur:o.valeur};
    appliquerEffets({reputation:o.k==='signature'?8:o.k==='emergente'?4:3});
    etat.signatures=(etat.signatures||0)+1;
  } else appliquerEffets({reputation:1});
  etat.offres=null;
  suiteHorsSaison();
}
function revenuMarque(bilan){
  const m=etat.marque; if(!m) return 0;
  let v=m.valeur;
  if(m.type==='prime'&&bilan) v+=(bilan.allStar?m.valeur*1.2:0)+(bilan.titre?m.valeur*1.5:0)+(bilan.mvp?m.valeur*1.5:0);
  return r1(v);
}

/* ---------- Trades ---------- */
function genererOffresTrade(){
  const autres=melangerOrdre(FRANCHISES.filter(f=>f.id!==etat.franchise.id));
  const tags=melangerOrdre(TAGS_EQUIPE);
  const offres=tags.map((t,i)=>({k:'trade',fid:autres[i].id,tag:t,annees:0,salaire:0}));
  offres.push({k:'rester',fid:etat.franchise.id,tag:'maison',annees:0,salaire:0});
  return offres;
}
function accepterOffreTrade(i){
  const o=(etat.offres||[])[i]; if(!o) return;
  if(o.k==='trade'){
    changerFranchise(franchiseParId(o.fid),o.tag);
    appliquerEffets({reputation:-1});
    if(etat.contrat) etat.contrat.ntc=false;
  } else appliquerEffets({reputation:-2,alchimieEquipe:-2});
  etat.offres=null;
  demarrerMatchs();
}

/* ---------- Enchaînement entre deux saisons ---------- */
function preparerInterSaison(){
  const c=etat.contrat; etat.file=[]; etat.optionRefusee=false;
  etat.ansEquipe=(etat.ansEquipe||0)+1;
  if(etat.marque){ etat.marque.reste--; if(etat.marque.reste<=0) etat.marque=null; }
  if(!c) return;
  c.reste--;
  if(c.type==='rookie'&&c.annees===4&&c.reste>0&&c.reste<=2&&moyenneStats()<54){ c.reste=0; etat.optionRefusee=true; }
  if(c.optJ&&c.reste===1&&valeurMarche()*plafond()>c.salaire*1.15){ c.reste=0; etat.optionJoueurExercee=true; }
  if(c.reste<=0){
    if(c.suivant){ etat.contrat={...c.suivant,type:'standard',reste:c.suivant.annees}; }
    else etat.file.push('contrat');
  } else if(c.type==='rookie'&&c.annees===4&&c.reste===1&&!etat.refusExt&&!c.suivant&&valeurMarche()>0.06) etat.file.push('extension');
  if(!etat.marque&&Math.random()<probSponsor()) etat.file.push('sponsor');
  // événements de trade : annoncés dans le tour qui suit
  if(etat.saison>=3&&!etat.flagScenario){
    const rg=(etat.dernierResultat&&etat.dernierResultat.saison&&etat.dernierResultat.saison.rang)||8;
    let p=0.06+(rg>10?0.05:0)+(etat.contrat&&etat.contrat.salaire>plafond()*0.2?0.03:0);
    if(etat.contrat&&etat.contrat.type==='rookie') p*=0.5;
    const importante=etat.meta.reputation>=62&&moyenneStats()>=66&&etat.saison>=4&&etat.contrat&&etat.contrat.type!=='rookie';
    if(Math.random()<p){
      etat.flagScenario=etat.contrat&&etat.contrat.ntc?'trade_veto':'trade_surprise';
      etat.tradeVers=pick(FRANCHISES.filter(f=>f.id!==etat.franchise.id)).id;
    } else if(importante&&Math.random()<(rg>8?0.30:0.09)) etat.flagScenario='trade_demande';
  }
}
function suiteHorsSaison(){
  const suivant=(etat.file||[]).shift();
  if(!suivant){ etat.phase='jeu'; genererTour(); sauvegarder(); return; }
  if(suivant==='contrat'||suivant==='extension'){ etat.modeOffres=suivant; etat.offres=genererOffresContrat(suivant); etat.phase='contrat'; }
  else if(suivant==='sponsor'){
    etat.offres=genererOffresMarque();
    if(!etat.offres.length){ etat.offres=null; return suiteHorsSaison(); }
    etat.phase='sponsor';
  }
  sauvegarder();
}
function demarrerMatchs(){
  etat.matchsTotal=(etat.scenarioActuel&&etat.scenarioActuel.coupe?1:2+(Math.random()<0.34?1:0))+(rivaux().length?1:0);
  etat.matchsResultats=[];
  etat.bonusSaison=0;
  etat.matchActuel=genererMatch();
  etat.phase='match';
  sauvegarder();
}

/* ---------- Affichage ---------- */
function puceFranchise(f){ return `<span class="puce" style="background:${escapeHtml(f.couleur)};display:inline-block;vertical-align:middle;margin-right:6px"></span>`; }
function etiqTag(t){ return `<span class="badge" style="font-size:11.5px">${escapeHtml(t)}</span>`; }
function tagsOffre(o){
  const t=[];
  if(o.tag==='contender') t.push(__("Candidat au titre"));
  if(o.tag==='marche') t.push(__("Gros marché"));
  if(o.tag==='reconstruction') t.push(__("Reconstruction : rôle central"));
  if(o.tag==='maison') t.push(__("Droits Bird : ton équipe"));
  if(o.ntc) t.push(__("Clause de non-trade"));
  if(o.optJ) t.push(__("Option joueur sur la dernière année"));
  return t;
}
const TITRES_OFFRE={
  maison_longue:__("Prolongation longue"),maison_flex:__("Contrat court et flexible"),ext_equipe:__("Offre d'une autre équipe"),
  maison_ntc:__("Prolongation avec clause de non-trade"),veteran:__("Un an chez un favori"),pari:__("Un an : parier sur toi-même"),
  ext5:__("Extension rookie : 5 ans"),ext4:__("Extension rookie : 4 ans, option joueur"),refus:__("Refuser et attendre l'agence libre")
};
function carteOffreContrat(o,i){
  if(o.k==='agence'){
    const txt=joueurImportant()?__("Tu es un joueur recherché : interview en trois questions, puis les équipes viennent avec de plus grosses offres."):__("Tu fais le tour du marché : les autres équipes te feront des offres.");
    return `<button class="carte-choix carte-offre" data-i="${i}" style="--barre:#22B8CF;flex-direction:column;align-items:flex-start;gap:6px"><p><b>${escapeHtml(__("Ouvrir l'agence libre"))}</b></p><span style="font-size:12.5px;color:var(--text-muted)">${escapeHtml(txt)}</span></button>`;
  }
  const f=franchiseParId(o.fid)||etat.franchise;
  const titre=TITRES_OFFRE[o.k]||'';
  const chiffres=o.annees?__t("{#0} · {#1} par an · total {#2}",[fmtAns(o.annees),fmtM(o.salaire),fmtM(o.salaire*o.annees)]):__("Pas de nouveau contrat maintenant : tu joues ta dernière année rookie, puis tu seras agent libre (avec risque de perdre ton équipe).");
  return `<button class="carte-choix carte-offre" data-i="${i}" style="--barre:${escapeHtml(f.couleur)};flex-direction:column;align-items:flex-start;gap:6px"><p>${puceFranchise(f)}<b>${escapeHtml(f.ville)} ${escapeHtml(f.nom)}</b> — ${escapeHtml(titre)}</p><span style="font-size:13.5px;font-weight:600">${escapeHtml(chiffres)}</span><span style="display:flex;flex-wrap:wrap;gap:6px">${tagsOffre(o).map(etiqTag).join('')}</span></button>`;
}
function renderContrat(){
  const ext=etat.modeOffres==='extension';
  const c=etat.contrat;
  const raisons=[];
  if(etat.optionRefusee) raisons.push(__("Ton équipe n'a pas levé son option : tu deviens agent libre plus tôt que prévu."));
  if(etat.optionJoueurExercee) raisons.push(__("Tu as refusé ton option joueur pour aller chercher mieux sur le marché."));
  const contexte=ext?__t("Ton contrat rookie se termine dans un an. Ton équipe te propose une extension (jusqu'à {#0} par an). Tu peux aussi attendre l'agence libre.",[fmtM(plafond()*(etat.distinctions.mvp>0||etat.distinctions.allStar>=2?0.30:0.25))])
    :__t("Ton contrat arrive à terme. Plafond de la ligue : {#0}. Maximum possible pour toi : {#1} par an. Voici les offres reçues.",[fmtM(plafond()),fmtM(maxPart()*plafond())]);
  return `<div class="screen">${enteteMatch()}<p class="logo" style="color:#22B8CF">${ext?__("EXTENSION DE CONTRAT"):__("AGENCE LIBRE")}</p><h1 class="titre-ecran">${ext?__("Extension ou agence libre ?"):__("Quel contrat signer ?")}</h1>${raisons.map(r=>`<p class="flavor">${escapeHtml(r)}</p>`).join('')}<p class="flavor">${escapeHtml(contexte)}</p><div class="pile-choix">${etat.offres.map(carteOffreContrat).join('')}</div>${bilanContratHtml()}</div>`;
}
function attacherContrat(){
  document.querySelectorAll('.carte-offre').forEach(b=>b.onclick=()=>{ Son.clic(); accepterOffreContrat(Number(b.dataset.i)); render(); });
}
const TITRES_MARQUE={signature:__("Chaussure signature"),standard:__("Contrat chaussures"),emergente:__("Marque émergente : ton nom sur un programme jeunes"),prime:__("Contrat à primes de performance"),libre:__("Rester libre pour l'instant")};
function carteOffreMarque(o,i){
  const m=marqueParId(o.mid);
  const chiffres=o.annees?__t("{#0} · {#1} par an",[fmtAns(o.annees),fmtM(o.valeur)]):__("Aucune marque pour l'instant : tu gardes ton image intacte et ta liberté.");
  const note=o.k==='prime'?__("Base réduite, mais des primes si tu es All-Star, MVP ou champion."):o.k==='signature'?__("Ton propre modèle de chaussure : le sommet du marché."):o.k==='emergente'?__("Moins d'argent, mais plus de crédibilité dans ta communauté."):'';
  return `<button class="carte-choix carte-offre" data-i="${i}" style="--barre:var(--accent);flex-direction:column;align-items:flex-start;gap:6px"><p><b>${escapeHtml(m?m.nom:'')}</b> — ${escapeHtml(TITRES_MARQUE[o.k]||'')}</p><span style="font-size:13.5px;font-weight:600">${escapeHtml(chiffres)}</span>${note?`<span style="font-size:12.5px;color:var(--text-muted)">${escapeHtml(note)}</span>`:''}</button>`;
}
function renderSponsor(){
  return `<div class="screen">${enteteMatch()}<p class="logo" style="color:#9B6BFF">${__("CONTRATS DE MARQUE")}</p><h1 class="titre-ecran">${__("Quelle marque t'habille ?")}</h1><p class="flavor">${escapeHtml(__t("Ta réputation attire les équipementiers. Image publique estimée : {#0}/100.",[Math.round(reputationMarque())]))}</p><div class="pile-choix">${etat.offres.map(carteOffreMarque).join('')}</div>${bilanContratHtml()}</div>`;
}
function attacherSponsor(){
  document.querySelectorAll('.carte-offre').forEach(b=>b.onclick=()=>{ Son.clic(); accepterOffreMarque(Number(b.dataset.i)); render(); });
}
const TITRES_TRADE={contender:__("Candidat au titre : les playoffs sont l'objectif."),marche:__("Gros marché : projecteurs, sponsors et réputation."),reconstruction:__("Équipe en reconstruction : le ballon est à toi.")};
function renderTrade(){
  const cartes=etat.offres.map((o,i)=>{
    const f=franchiseParId(o.fid);
    if(o.k==='rester') return `<button class="carte-choix carte-offre" data-i="${i}" style="--barre:var(--border);flex-direction:column;align-items:flex-start;gap:6px"><p><b>${escapeHtml(__("Retirer ta demande"))}</b></p><span style="font-size:12.5px;color:var(--text-muted)">${escapeHtml(__t("Tu restes aux {#0} {#1}, mais le vestiaire n'oubliera pas.",[f.ville,f.nom]))}</span></button>`;
    return `<button class="carte-choix carte-offre" data-i="${i}" style="--barre:${escapeHtml(f.couleur)};flex-direction:column;align-items:flex-start;gap:6px"><p>${puceFranchise(f)}<b>${escapeHtml(f.ville)} ${escapeHtml(f.nom)}</b></p><span style="font-size:12.5px;color:var(--text-muted)">${escapeHtml(TITRES_TRADE[o.tag])}</span></button>`;
  }).join('');
  return `<div class="screen">${enteteMatch()}<p class="logo" style="color:#E5484D">${__("DEMANDE DE TRADE")}</p><h1 class="titre-ecran">${__("Où veux-tu aller ?")}</h1><p class="flavor">${__("Ta direction a reçu ta demande et a négocié avec plusieurs équipes. Ton contrat te suit.")}</p><div class="pile-choix">${cartes}</div>${bilanContratHtml()}</div>`;
}
function attacherTrade(){
  document.querySelectorAll('.carte-offre').forEach(b=>b.onclick=()=>{ Son.clic(); accepterOffreTrade(Number(b.dataset.i)); render(); });
}
/* Résumé du contrat actuel (en-tête et fin de saison) */
function contratChipHtml(){
  const c=etat.contrat; if(!c) return '';
  const m=etat.marque?marqueParId(etat.marque.id):null;
  const parties=[__t("{#0}/an · {#1}",[fmtM(c.salaire),fmtAns(c.reste)])];
  if(c.ntc) parties.push(__("non-trade"));
  if(c.type==='rookie') parties.push(__("rookie"));
  if(m) parties.push(m.nom+' '+fmtM(revenuMarque(null))+__t("/an",[]));
  return `<p class="contrat-chip">${escapeHtml(parties.join(' · '))}</p>`;
}
function bilanContratHtml(){
  const c=etat.contrat; if(!c) return '';
  return `<div class="rival-card" style="background:var(--surface)"><p class="rival-titre">${__("TON CONTRAT ACTUEL")}</p><p class="rival-ligne">${escapeHtml((c.reste>0?__t("{#0} par an, encore {#1}.",[fmtM(c.salaire),fmtAns(c.reste)]):__t("{#0} par an : contrat arrivé à terme.",[fmtM(c.salaire)])))}${c.ntc?' '+escapeHtml(__("Clause de non-trade.")):''}</p><p class="rival-ligne">${escapeHtml(__t("Gains de carrière jusqu'ici : {#0}.",[fmtM(etat.gains||0)]))}</p></div>`;
}
function resumeContratRookie(){
  const c=etat.contrat; if(!c) return '';
  const det=c.annees===4?__t("{#0} · {#1} par an · 2 ans garantis + 2 options d'équipe",[fmtAns(c.annees),fmtM(c.salaire)]):__t("{#0} · {#1} par an",[fmtAns(c.annees),fmtM(c.salaire)]);
  return `<div class="rival-card" style="background:var(--surface)"><p class="rival-titre">${__("CONTRAT ROOKIE")}</p><p class="rival-ligne">${escapeHtml(det)}</p></div>`;
}
function gainsSaisonHtml(r){
  const g=r&&r.gainsSaison; if(!g||(!g.salaire&&!g.marque)) return '';
  const detail=g.marque?__t("Salaire {#0} + marque {#1}",[fmtM(g.salaire),fmtM(g.marque)]):__t("Salaire {#0}",[fmtM(g.salaire)]);
  return `<div class="rival-card anim" style="background:var(--surface);animation-delay:1s"><p class="rival-titre">${__("GAINS DE LA SAISON")}</p><p class="rival-ligne">${escapeHtml(detail)}</p><p class="rival-ligne">${escapeHtml(__t("Gains de carrière : {#0}",[fmtM(etat.gains||0)]))}</p></div>`;
}
function gainsCarriereHtml(){
  return `<span class="badge">${escapeHtml(__t("{#0} gagnés",[fmtM(etat.gains||0)]))}</span>`+(etat.signatures?`<span class="badge">${escapeHtml(__t("{#0} contrats signés",[etat.signatures]))}</span>`:'');
}
