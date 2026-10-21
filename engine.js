// Règles du jeu : état, tirage des choix, matchs, score, sauvegarde
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function rivaux(){ if(!etat.rivaux) etat.rivaux=[]; return etat.rivaux; }
function possede(type){ return rivaux().some(r=>r.type===type); }
function franchiseParId(id){ return FRANCHISES.find(f=>f.id===id)||ECOLES.find(f=>f.id===id)||LYCEES.find(f=>f.id===id)||CLUBS_JEUNES.find(f=>f.id===id); }
function estFac(){ return !!etat&&etat.niveau==='fac'; }
function estLycee(){ return estFac()&&!!etat.fac&&!!etat.fac.lycee; }
function toutesEquipes(){ return estLycee()?(etat.fac.region==='na'?LYCEES:CLUBS_JEUNES.filter(x=>x.region===etat.fac.region)):estFac()?ECOLES:FRANCHISES; }
function libSaison(){ return estLycee()?(etat.fac.region==='na'?__("Lycée · dernière année"):etat.fac.etape===2?__("Club · niveau supérieur"):__("Club · saison des jeunes")):estFac()?__t("Université · année {#0}",[etat.fac.numero]):__t("Saison {#0}",[etat.saison]); }
function rivauxEquipes(franchiseId){
  const res=[];
  for(const r of RIVALITES_EQUIPES){
    const autre=r.a===franchiseId?r.b:(r.b===franchiseId?r.a:null);
    if(autre) res.push({id:autre,detail:r.detail});
  }
  return res;
}
function creerRivalEquipe(rv){
  const f=franchiseParId(rv.id);
  return {id:'eq-'+rv.id,type:'equipe',nom:f.ville+' '+f.nom,court:__('les ')+f.nom,detail:rv.detail,equipe:f.ville+' '+f.nom,niveau:3,bilan:{v:0,d:0}};
}
function creerRivalJoueur(type){
  const utilises=rivaux().map(r=>r.nom);
  let prenom,complet;
  do{ prenom=pick(PRENOMS_RIVAUX); complet=prenom+' '+pick(NOMS_RIVAUX); }while(utilises.includes(complet));
  const propre=etat.franchise;
  let equipe;
  if(type==='ancien'){
    const re=rivauxEquipes(propre.id);
    equipe=re.length?franchiseParId(pick(re).id):pick(FRANCHISES.filter(f=>f.id!==propre.id));
  } else equipe=pick(FRANCHISES.filter(f=>f.id!==propre.id));
  // Le rival naît de tes propres actions : un tir, un contre ou une équipe battue qui l'a marqué.
  const fait=type==='ancien'?null:choisirFait();
  let raison='', poste=type==='promo'?etat.poste:pick(Object.keys(POSITIONS));
  if(fait){
    equipe=franchiseParId(fait.opp)||equipe;
    raison=fait.po?'elimine':fait.stat;
    if(type!=='promo'&&POSTE_RIVAL[fait.stat]) poste=POSTE_RIVAL[fait.stat];
    if(equipe.id===propre.id) equipe=pick(FRANCHISES.filter(f=>f.id!==propre.id));
  }
  return {id:'pl-'+type,type,prenom,nom:complet,court:prenom,poste,equipe:equipe.ville+' '+equipe.nom,raison,niveau:1,bilan:{v:0,d:0}};
}
const POSTE_RIVAL={scoring:'Arrière',defense:'Pivot',playmaking:'Meneur',athletisme:'Ailier fort',basketIQ:'Ailier'};
function choisirFait(){
  const f=(etat.faits||[]).slice();
  if(!f.length) return null;
  const po=f.filter(x=>x.po);
  const pool=po.length?po:f;
  return pool[pool.length-1];
}
function raisonRival(r){
  const t={
    scoring:__("Ton tir décisif contre son équipe lui est resté en travers de la gorge."),
    defense:__("Ton contre sur lui a fait le tour des réseaux : il ne l'a jamais digéré."),
    playmaking:__("Ta passe décisive a fait basculer un match contre son équipe : il veut sa revanche."),
    athletisme:__("Ton action explosive face à son équipe a fait le tour des réseaux : il ne l'a pas oubliée."),
    basketIQ:__("Tu as piégé son équipe avec une lecture de jeu parfaite : il veut sa revanche."),
    elimine:__("Tu as éliminé son équipe en playoffs : il veut sa revanche.")
  };
  return t[r&&r.raison]||'';
}
function pastilles(n){ return '●'.repeat(n)+'○'.repeat(5-n); }
function scaleEffets(effets,f){
  const res={};
  for(const k in (effets||{})) res[k]=(k==='reputation'||k==='risqueBlessure')?Math.round(effets[k]*f):effets[k];
  return res;
}
function genererDuel(){
  const liste=rivaux();
  let pool=liste.filter(r=>r.id!==etat.dernierRivalId);
  if(!pool.length) pool=liste;
  const total=pool.reduce((s,r)=>s+r.niveau,0);
  let x=Math.random()*total, r=pool[0];
  for(const cand of pool){ x-=cand.niveau; if(x<=0){ r=cand; break; } }
  const n=r.court, E=r.type==='equipe';
  const contextes={
    equipe:__t("Match contre {#0} : {#1}. La salle est électrique et chaque possession compte double.",[r.nom,r.detail]),
    promo:__t("{#0} te fait face. Même promotion, même poste : tout le monde attend ce duel.",[r.nom]),
    veteran:__t("{#0}, la légende que tu cherches à détrôner, est en face de toi ce soir.",[r.nom]),
    ancien:__t("Ton ancien coéquipier {#0} joue désormais pour {#1}. Il connaît tes habitudes, et toi les siennes.",[r.nom,r.equipe]),
    media:__t("{#0} t'a lancé des piques toute la semaine. Ce soir, la presse regarde qui aura le dernier mot.",[r.nom])
  };
  const choix=[
    o(E?__("Imposer une défense agressive dès le coup d'envoi"):__t("Défendre sur {#0} à chaque possession",[n]),'defense',-0.05,0.08,{reputation:4,defense:1},{reputation:-2,risqueBlessure:3},E?__("Ta défense étouffe l'adversaire et la salle s'enflamme."):__t("{#0} n'arrive plus à respirer.",[n]),E?__("L'adversaire contourne ta défense et prend l'avantage."):__t("{#0} te prend de vitesse et la salle le sent.",[n])),
    o(E?__("Prendre les premiers tirs pour imposer ton rythme"):__t("Répondre à {#0} panier pour panier",[n]),'scoring',-0.1,0.1,{reputation:6,scoring:1},{reputation:-4},E?__("Tu ouvres le score et le stade vibre."):__t("Tu réponds à chaque panier de {#0}.",[n]),E?__("Tu forces et les ratés s'enchaînent."):__t("{#0} te répond coup pour coup et reprend l'avantage.",[n])),
    o(__("Faire circuler le ballon pour user la défense"),'playmaking',0.0,0.06,{alchimieEquipe:4,reputation:2},{alchimieEquipe:-2},__("Le collectif prend le dessus."),__("Le jeu se grippe et l'adversaire en profite.")),
    o(E?__("Chambrer leurs supporters pour les déstabiliser"):__t("Chambrer {#0} devant toute la salle",[n]),'basketIQ',-0.15,0.1,{reputation:7},{reputation:-5,alchimieEquipe:-2},__("La provocation fonctionne : ta réputation grimpe."),__("La provocation se retourne contre toi.")),
    o(E?__("Garder la tête froide et suivre le plan"):__t("Ignorer {#0} et jouer ton match",[n]),'basketIQ',0.1,0.05,{basketIQ:1,alchimieEquipe:2},{reputation:-1},__("Tu restes dans ton plan et tu le paies."),__("Trop de retenue : tu laisses l'initiative à l'adversaire."))
  ];
  return {id:'duel',titre:(E?__("Classique — "):__("Duel — "))+r.nom,contexte:contextes[r.type],choix:melangerOrdre(choix),rivalId:r.id};
}
let cheminOrdreTemp=null;
let combineOrdreTemp=null;
const SAVE_KEY='five-ways-save-v2';
let etat=null;

function clamp(v,mn,mx){ return Math.max(mn,Math.min(mx,v)); }
function escapeHtml(str){ return String(str===undefined||str===null?'':str).replace(/[&<>"'`]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c])); }
function melangerOrdre(tab){
  const c=[...tab];
  for(let i=c.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [c[i],c[j]]=[c[j],c[i]]; }
  return c;
}
function moyenneStats(){ const s=etat.stats; return (s.scoring+s.playmaking+s.defense+s.athletisme+s.basketIQ)/5; }

function nouvellePartie(nom,poste){
  etat={
    nom,poste,age:17,saison:0,niveau:'pro',fac:null,franchise:null,draftPick:null,
    stats:{...POSITIONS[poste]},
    meta:{reputation:40,coteEquipe:50,risqueBlessure:0,alchimieEquipe:50,coach:50,vestiaire:50,place:50},
    distinctions:{titres:0,allStar:0,mvp:0,medailles:0,trophees:0,jo:0,can:0,monde:0}, titresSaisons:[], compteurInterview:0,
    malusAccumule:0, historiqueRecent:[], phase:'lycee', tourActuel:melangerOrdre(LYCEE_POOL),
    coteDraftBase:0
  };
  sauvegarder();
}
function appliquerOrigine(id){
  const o=origineParId(id); if(!o) return;
  etat.origine=o.id;
  appliquerEffets(o.meta);
  etat.coteDraftBase+=o.cote;
}
function appliquerEffets(effets){
  for(const [cle,val] of Object.entries(effets||{})){
    if(etat.stats[cle]!==undefined) etat.stats[cle]=clamp(etat.stats[cle]+val,0,99);
    else if(etat.meta[cle]!==undefined) etat.meta[cle]=clamp(etat.meta[cle]+val,0,100);
  }
}
function choisirChemin(chemin){
  etat.age+=chemin.ageAjout;
  etat.coteDraftBase+=chemin.coteDraftMod;
  appliquerEffets(chemin.effets);
  if(chemin.fac){ commencerFac(chemin.fac); sauvegarder(); return; }
  etat.phase='combine';
  sauvegarder();
}
/* ---------- Université : une ou plusieurs saisons jouées avant la Draft ---------- */
const COTE_PRESTIGE={3:66,2:54,1:44};
function jeunesNA(){ return estLycee()&&etat.fac.region==='na'; }
function commencerJeunes(club,etape,region){
  etat.niveau='fac'; etat.fac={annees:1,numero:1,derniere:null,titres:0,honneurs:0,lycee:true,region,etape};
  etat.franchise=club; etat.rivaux=[]; etat.saison=0; etat.ansEquipe=0;
  etat.meta.coteEquipe=COTE_PRESTIGE[club.prestige]||48; etat.meta.alchimieEquipe=50;
  etat.scenariosRecents=[]; etat.faits=[]; etat.flagScenario=null; etat.situationsRecentes=[];
  etat.phase='jeu'; genererTour();
}
function commencerLycee(){
  const region=regionDe(etat.pays);
  commencerJeunes(equipeJeunes(etat.origine,region),1,region);
}
/* Fin de la saison de jeunes (lycée en Amérique du Nord, club ailleurs) : les offres dépendent de la région, de ta saison, de ton profil et de ton équipe. */
function terminerLycee(){
  const d=etat.fac.derniere||{reussis:1,total:2}, ratio=d.reussis/Math.max(1,d.total);
  const reg=etat.fac.region, et=etat.fac.etape||1, courant=etat.franchise;
  etat.coteDraftBase+=clamp(Math.round((ratio-0.5)*6),-2,3)+(etat.fac.titres?1:0);
  const p=moyenneStats()+(etat.meta.reputation-40)*0.35+(ratio-0.5)*24+(etat.fac.titres?6:0)+(etat.fac.honneurs?5:0)+etat.coteDraftBase*0.8+(courant.prestige-2)*2;
  const tierDe=(v)=>{ const sc=v+(Math.random()-0.5)*16; return sc>=66?3:sc>=55?2:1; };
  const dejaPris=[];
  const offreFac=(v)=>{ const tier=tierDe(v); const c=ECOLES.filter(x=>x.prestige===tier&&!dejaPris.includes(x.id)); const e=pick(c.length?c:ECOLES.filter(x=>!dejaPris.includes(x.id))); dejaPris.push(e.id); return {k:'fac',fid:e.id,tier:e.prestige}; };
  const offreClub=(region,tier,extra)=>{ const c=CLUBS_JEUNES.filter(x=>x.region===region&&x.prestige===tier&&x.id!==courant.id); const e=pick(c.length?c:CLUBS_JEUNES.filter(x=>x.region===region&&x.id!==courant.id)); return {k:'club',fid:e.id,tier:e.prestige,...(extra||{})}; };
  let offres=[];
  if(reg==='na'){
    offres=[offreFac(p),offreFac(p),offreFac(p)].sort((a,b)=>b.tier-a.tier);
    offres.push({k:'chemin',i:1},{k:'chemin',i:2});
  } else if(reg==='af'&&et===1){
    const tA=tierDe(p-4), tB=Math.max(1,tA-1);
    offres=[offreClub('af',tA),offreClub('af',tB),{k:'club',fid:courant.id,tier:courant.prestige,stay:true},offreClub('eu',p>=72?3:2,{eu:true}),offreFac(p-8)];
  } else if(reg==='ot'){
    offres=[offreFac(p-4),{k:'chemin',i:6},{k:'chemin',i:1},{k:'chemin',i:2},{k:'chemin',i:4}];
  } else {
    const gros=p+(Math.random()-0.5)*16>=60;
    offres=[offreFac(p-4),{k:'chemin',i:gros?5:3},{k:'chemin',i:6},{k:'chemin',i:1},{k:'chemin',i:4}];
  }
  etat.age++; etat.offresFac=offres;
  etat.niveau='pro'; etat.fac=null; etat.scenarioActuel=null; etat.rivaux=[]; etat.faits=[]; etat.axeChoisiSaison=null;
  etat.phase='offresfac';
}
function choisirOffreFac(i){
  const o=(etat.offresFac||[])[i]; if(!o) return;
  etat.offresFac=null;
  if(o.k==='fac'){ const ecole=franchiseParId(o.fid); commencerFac(1,ecole); }
  else if(o.k==='club'){ const club=franchiseParId(o.fid); commencerJeunes(club,2,club.region||'af'); }
  else { choisirChemin(CHEMINS_PREDRAFT[o.i]); }
  sauvegarder();
}
function commencerFac(nb,ecole){
  etat.niveau='fac'; etat.fac={annees:4,numero:1,derniere:null,titres:0,honneurs:0};
  etat.scenariosRecents=[]; etat.flagScenario=null; etat.faits=[];
  etat.franchise=ecole||pick(ECOLES); etat.rivaux=[]; etat.saison=0; etat.ansEquipe=0;
  etat.meta.coteEquipe=({3:66,2:54,1:44})[etat.franchise.prestige]||48; etat.meta.alchimieEquipe=50;
  etat.phase='jeu'; genererTour();
}
function terminerFac(){
  const d=etat.fac.derniere||{reussis:1,total:2};
  etat.coteDraftBase+=clamp(Math.round((d.reussis/Math.max(1,d.total)-0.5)*10),-3,5)+(etat.fac.titres?3:0)+(etat.fac.honneurs||0);
  etat.ecole=etat.franchise.ville+' '+etat.franchise.nom;
  etat.niveau='pro'; etat.fac=null; etat.franchise=null; etat.saison=0; etat.scenarioActuel=null; etat.scenariosRecents=[];
  etat.rivaux=[]; etat.faits=[]; etat.axeChoisiSaison=null;
  etat.phase='combine';
}
function choisirCombine(option){
  etat.coteDraftBase+=option.coteDraftMod;
  appliquerEffets(option.effets);
  resoudreDraft();
}
/* ---------- Rôle dans l'équipe : le rang de draft décide d'où l'on part ---------- */
const ROLES=[__("Fin de banc"),__("Sur le banc"),__("Rotation"),__("Titulaire"),__("Star de la franchise")];
function roleIdx(p){ return p>=80?4:p>=62?3:p>=45?2:p>=30?1:0; }
function minutesJeu(p){ return clamp(2+p*0.38,3,37); }
function placeDepart(pick){
  const base=pick<=3?90:pick<=5?85:pick<=10?78:pick<=14?70:pick<=20?60:pick<=30?50:pick<=40?36:pick<=50?28:20;
  return clamp(Math.round(base+(Math.random()*8-4)+(moyenneStats()-60)*0.3),8,96);
}
function bonusRole(){ return etat.niveau==='pro'&&etat.meta&&typeof etat.meta.place==='number'?clamp((etat.meta.place-50)/900,-0.05,0.05):0; }
function resoudreDraft(){
  const cote=moyenneStats()+etat.coteDraftBase;
  const roll=Math.random()*60+cote;
  let pick;
  if(roll>115) pick=1+Math.floor(Math.random()*5);
  else if(roll>95) pick=6+Math.floor(Math.random()*9);
  else if(roll>75) pick=15+Math.floor(Math.random()*16);
  else pick=31+Math.floor(Math.random()*30);
  etat.niveau='pro'; etat.fac=null;
  etat.franchise=FRANCHISES[Math.floor(Math.random()*FRANCHISES.length)];
  etat.draftPick=pick;
  etat.meta.place=placeDepart(pick); etat.meta.coach=50; etat.meta.vestiaire=50; etat.compteurInterview=0;
  etat.contrat=contratRookie(pick); etat.gains=0; etat.marque=null; etat.ansEquipe=0; etat.signatures=0; etat.file=[]; etat.refusExt=false;
  etat.rivaux=rivauxEquipes(etat.franchise.id).map(creerRivalEquipe);
  etat.saison=1;
  etat.phase='draftnight';
  sauvegarder();
}
const famille=id=>String(id).replace(/2$/,'');
/* Tirage pondéré : les scénarios nés de la saison qui vient de se jouer passent avant les situations installées. */
function tirerPondere(liste){
  if(!liste.length) return null;
  const nb={}; liste.forEach(s=>{ const f=famille(s.id); nb[f]=(nb[f]||0)+1; });
  const w=liste.map(s=>(POIDS_SCENARIO[famille(s.id)]||2)/nb[famille(s.id)]);
  let x=Math.random()*w.reduce((a,b)=>a+b,0);
  for(let i=0;i<liste.length;i++){ x-=w[i]; if(x<=0) return liste[i]; }
  return liste[liste.length-1];
}
function genererTour(){
  const recents=etat.scenariosRecents||[];
  const recFam=recents.map(famille);
  const base=SCENARIOS.filter(s=>!s.intro&&!s.special&&!!s.fac===estFac());
  const ok=s=>s.cond(etat)&&!recFam.includes(famille(s.id));
  const specifiques=base.filter(s=>!s.generique&&ok(s));
  const generiques=base.filter(s=>s.generique&&ok(s));
  const dernier=recents[recents.length-1];
  const intros=etat.saison>=2?SCENARIOS.filter(s=>s.intro&&s.cond(etat)):[];
  const choisi=estFac()?(estLycee()?(base.find(s=>(s.id==='jeunes_etape2'||s.id==='lyc_'+etat.origine)&&s.cond(etat))||base.find(s=>s.id==='lyc_generique'&&s.cond(etat))):etat.fac.numero===1?specifiques.find(s=>s.id==='fac_arrivee'):tirerPondere(specifiques)):(etat.saison===1?specifiques.find(s=>s.id==='rookie'):tirerPondere(specifiques));
  const coupes=base.filter(s=>s.coupe&&s.cond(etat));
  const special=etat.flagScenario?SCENARIOS.find(s=>s.id===etat.flagScenario&&s.cond(etat)):null;
  etat.flagScenario=null;
  if(special&&special.effetDebut) special.effetDebut(etat);
  const sc=special||coupes[0]||intros[0]||choisi||pick(generiques.length?generiques:[null])
    ||base.filter(s=>s.generique&&s.cond(etat)&&s.id!==dernier)[0]
    ||base.filter(s=>s.cond(etat)&&s.id!==dernier)[0]
    ||base.filter(s=>s.cond(etat))[0];
  let rival=null;
  if(sc.intro){ rival=creerRivalJoueur(sc.intro); rivaux().push(rival); }
  etat.scenariosRecents=[...recents,sc.id].slice(-6);
  etat.scenarioActuel={id:sc.id,question:sc.question,contexte:sc.contexte(etat,rival),matchsPrefs:SCENARIO_MATCHS[sc.id]||[],rivalId:rival?rival.id:null,coupe:sc.coupe?sc.coupe(etat):null};
  etat.tourActuel=melangerOrdre(typeof sc.choix==='function'?sc.choix(etat,rival):sc.choix);
}
function genererTourPool(){
  const axes=['Performance','Carrière / Contrat','Image / Marque','Vie perso','Risque / Legacy'];
  const choix=axes.map(axe=>{
    const parAxeEtAge=POOL.filter(c=>
      c.axe===axe &&
      (c.ageMin===undefined || etat.age>=c.ageMin) &&
      (c.ageMax===undefined || etat.age<=c.ageMax)
    );
    const candidats=parAxeEtAge.filter(c=>!etat.historiqueRecent.includes(c.texte));
    const pool=candidats.length?candidats:parAxeEtAge;
    return pool[Math.floor(Math.random()*pool.length)];
  });
  etat.tourActuel=melangerOrdre(choix);
}
function appliquerChoix(choix){
  etat.statsAvantSaison={...etat.stats};
  appliquerEffets(choix.effets);
  etat.historiqueRecent.push(choix.texte);
  if(etat.historiqueRecent.length>8) etat.historiqueRecent.shift();
  etat.texteChoixSaison=choix.texte; etat.axeChoisiSaison=choix.axe||null;
  if(choix.axe){ if(!etat.axesCompte) etat.axesCompte={}; etat.axesCompte[choix.axe]=(etat.axesCompte[choix.axe]||0)+1; }
  if(etat.scenarioActuel&&etat.scenarioActuel.rivalId){
    const rv=rivaux().find(r=>r.id===etat.scenarioActuel.rivalId);
    if(rv&&choix.effets&&choix.effets.rivalite) rv.niveau=clamp(rv.niveau+choix.effets.rivalite,1,5);
  }
  if(choix.action==='quitter'){ const f=franchiseParId(etat.tradeVers); if(f&&f.id!==etat.franchise.id) changerFranchise(f,pick(TAGS_EQUIPE)); }
  if(choix.action==='refus_selection'&&etat.scenarioActuel) etat.scenarioActuel.coupe=null;
  if(choix.action==='fac_rester'){ etat.fac.numero++; etat.phase='jeu'; genererTour(); sauvegarder(); return; }
  if(['draft','gleague','europe','prepa'].includes(choix.action)){
    if(choix.action!=='draft'){ etat.age++; etat.coteDraftBase+=choix.action==='europe'?1:choix.action==='prepa'?1:0; }
    terminerFac(); sauvegarder(); return;
  }
  if(choix.action==='transfert'){ etat.franchise=pick(ECOLES.filter(x=>x.id!==etat.franchise.id)); etat.meta.coteEquipe=({3:66,2:54,1:44})[etat.franchise.prestige]||48; etat.meta.alchimieEquipe=clamp(etat.meta.alchimieEquipe-4,0,100); }
  if(choix.action==='demande'){ etat.offres=genererOffresTrade(); etat.phase='trade'; sauvegarder(); return; }
  demarrerMatchs();
}
/* Tournoi (Coupe, JO…) : 3 matchs de poule (2 victoires pour passer), puis quart, demi, finale.
   Perdre un match à élimination directe termine la compétition ; perdre la demi-finale mène au match pour le bronze. */
function coupeSuite(){
  const r=(etat.matchsResultats||[]).filter(m=>m.stade);
  const poule=r.filter(m=>m.stade==='poule'), pv=poule.filter(m=>m.reussi).length, pd=poule.length-pv;
  if(pd>=2) return null;
  if(pv<2) return 'poule';
  const ko={}; r.filter(m=>m.stade!=='poule').forEach(m=>{ ko[m.stade]=m.reussi; });
  if(!('quart' in ko)) return 'quart';
  if(!ko.quart) return null;
  if(!('demi' in ko)) return 'demi';
  if(!ko.demi) return ('bronze' in ko)?null:'bronze';
  if(!('finale' in ko)) return 'finale';
  return null;
}
function coupeIssue(){
  const r=(etat.matchsResultats||[]).filter(m=>m.stade);
  const poule=r.filter(m=>m.stade==='poule'), pv=poule.filter(m=>m.reussi).length;
  const ko={}; r.filter(m=>m.stade!=='poule').forEach(m=>{ ko[m.stade]=m.reussi; });
  if(pv<2) return 'poule';
  if(ko.quart===false) return 'quart';
  if(ko.finale===true) return 'or';
  if(ko.finale===false) return 'argent';
  if(ko.bronze===true) return 'bronze';
  if(ko.bronze===false) return 'quatrieme';
  return 'poule';
}
/* Adversaire d'une manche : poule = n'importe qui, puis des adversaires de plus en plus forts (quart, demi, finale), du même continent pour une coupe continentale. */
function adversaireCoupe(pays,type,stade,rang,deja){
  let cand=Object.keys(CONTINENTS).filter(p=>p!==pays);
  if(type==='continent'&&pays) cand=cand.filter(p=>CONTINENTS[p]===CONTINENTS[pays]);
  cand.sort((a,b)=>(FORCE_NATION[b]||50)-(FORCE_NATION[a]||50));
  const n=cand.length, fin=stade==='poule'?n:stade==='quart'?Math.ceil(n*0.6):stade==='finale'?Math.max(3,Math.ceil(n*0.2)):Math.max(3,Math.ceil(n*0.35));
  const tr=cand.slice(0,fin), dep=((etat.saison||0)*7+13+rang*5)%tr.length;
  for(let k=0;k<tr.length;k++){ const a=tr[(dep+k)%tr.length]; if(!deja.includes(a)) return a; }
  return tr[dep];
}
function bonusCoupe(){
  const m=etat.matchActuel; if(!m||!m.coupe||!m.adv) return 0;
  const own=(FORCE_NATION[etat.pays]||50)+(moyenneStats()-60)*0.3;
  return clamp((own-(FORCE_NATION[m.adv]||50))/250,-0.18,0.12);
}
function genererMatchCoupe(stade){
  const sa=etat.scenarioActuel.coupe, pays=nomPays(etat), id={poule:'coupe_poule',quart:'coupe_quart',demi:'coupe_demi',bronze:'coupe_bronze',finale:'coupe_finale'}[stade];
  const s=MATCH_SITUATIONS.find(x=>x.id===id);
  const sub=t=>t.replace(/\{pays\}/g,pays).replace(/\{coupe\}/g,sa.nom);
  const rangC=etat.matchsResultats.filter(m=>m.stade).length;
  const deja=sa.adv||(sa.adv=[]);
  const adv=adversaireCoupe(etat.pays,sa.type,stade,rangC,deja); deja.push(adv);
  return {id:s.id,titre:s.titre,contexte:sub(s.contexte),choix:melangerOrdre(s.choix.map(c=>({...c,texte:sub(c.texte),ok:sub(c.ok),ko:sub(c.ko)}))),coupe:true,stade,rangC,adv};
}
function genererMatch(){ const m=genererMatchBase(); m.tableau=genererTableau(m); return m; }
function genererMatchBase(){
  if(rivaux().length&&etat.matchsResultats&&etat.matchsResultats.length===etat.matchsTotal-1) return genererDuel();
  if(etat.scenarioActuel&&etat.scenarioActuel.coupe&&etat.matchsResultats){ const st=coupeSuite(); if(st) return genererMatchCoupe(st); }
  const recents=etat.situationsRecentes||[];
  const normales=MATCH_SITUATIONS.filter(s=>!s.id.startsWith('coupe_'));
  let dispo=normales.filter(s=>!recents.includes(s.id));
  if(!dispo.length) dispo=normales;
  const prefs=(etat.scenarioActuel&&etat.scenarioActuel.matchsPrefs)||[];
  const pref=dispo.filter(s=>prefs.includes(s.id));
  const premier=!etat.matchsResultats||etat.matchsResultats.length===0;
  const pool=(pref.length&&(premier||Math.random()<0.5))?pref:dispo;
  const s=pool[Math.floor(Math.random()*pool.length)];
  etat.situationsRecentes=[...recents,s.id].slice(-8);
  return {id:s.id,titre:s.titre,contexte:s.contexte,choix:melangerOrdre(s.choix)};
}
function resoudreMatch(opt,geste){
  const bonusGeste=geste&&Number.isFinite(geste.bonus)?clamp(geste.bonus,0,0.15):0;
  const gesteRate=!!(geste&&geste.label==='rate');
  const enPlayoffs=etat.phase==='playoffs';
  const p=clamp(clamp(etat.stats[opt.stat]/100+opt.mod,0.12,0.9)+bonusGeste+(enPlayoffs?bonusPlayoffs():0)+bonusCoupe()+bonusRole(),0.05,0.95);
  const reussi=gesteRate?false:Math.random()<p;
  const rv=etat.matchActuel.rivalId?rivaux().find(r=>r.id===etat.matchActuel.rivalId):null;
  const f=rv?1+0.2*rv.niveau:1;
  appliquerEffets(scaleEffets(reussi?opt.gain:opt.perte,f));
  const enjeu=rv?opt.enjeu*(1+0.1*rv.niveau):opt.enjeu;
  etat.bonusSaison+=reussi?enjeu:-enjeu/2;
  const entree={titre:etat.matchActuel.titre, texte:opt.texte, reussi, narration:reussi?opt.ok:opt.ko, stat:opt.stat, p:gesteRate?0:Math.round(p*100), geste:(geste&&geste.label)||null, tableau:etat.matchActuel.tableau||null};
  if(etat.matchActuel.stade) entree.stade=etat.matchActuel.stade;
  if(rv){
    if(reussi) rv.bilan.v++; else rv.bilan.d++;
    if((rv.bilan.v+rv.bilan.d)%2===0&&rv.niveau<5) rv.niveau++;
    etat.dernierRivalId=rv.id;
    entree.rival={nom:rv.nom,type:rv.type,niveau:rv.niveau,v:rv.bilan.v,d:rv.bilan.d};
  }
  const oppId=etat.matchActuel.tableau&&etat.matchActuel.tableau.opp;
  if(reussi&&oppId&&!rv){ if(!etat.faits) etat.faits=[]; etat.faits.push({opp:oppId,stat:opt.stat,po:enPlayoffs,saison:etat.saison}); if(etat.faits.length>8) etat.faits.shift(); }
  entree.actus=genererActus(entree,rv);
  if(typeof suivre==='function'){
    if(reussi) suivre('match_ok');
    if(geste&&geste.label==='parfait') suivre('parfait');
    if(reussi&&rv) suivre('duel_ok');
    if(reussi&&(etat.matchActuel.id==='coupe_finale'||enPlayoffs||(entree.tableau&&entree.tableau.q>=4&&/^0:[0-5]\d$/.test(entree.tableau.t)))) suivre('clutch');
  }
  if(enPlayoffs) return resoudrePlayoffs(entree,reussi);
  etat.matchsResultats.push(entree);
  let doitInterview=false;
  if(etat.niveau==='pro'&&!(etat.scenarioActuel&&etat.scenarioActuel.coupe)){ etat.compteurInterview=(etat.compteurInterview||0)+1; if(etat.compteurInterview>=3){ etat.compteurInterview=0; doitInterview=true; } }
  if(etat.scenarioActuel&&etat.scenarioActuel.coupe){
    const nCup=etat.matchsResultats.filter(m=>m.stade).length, duel=rivaux().length?1:0;
    etat.matchsTotal=coupeSuite()?etat.matchsResultats.length+1+duel:nCup+duel;
  }
  if(etat.matchsResultats.length<etat.matchsTotal){
    etat.matchActuel=genererMatch();
    if(doitInterview) ouvrirInterview('match');
    sauvegarder();
    return entree;
  }
  if(doitInterview){ ouvrirInterview('fin'); sauvegarder(); return entree; }
  return terminerSaisonRegulier(entree);
}

/* ---------- Fin de saison régulière, playoffs ---------- */
const TOURS_PLAYOFFS=[__("Premier tour"),__("Demi-finales de conférence"),__("Finale de conférence"),__('Finales')];
const TOURS_FAC=[__("Premier tour du Tournoi"),__("Sweet 16"),__("Final Four"),__("Finale nationale")];
const TOURS_JEUNES=[__("Premier tour"),__("Quarts de finale"),__("Demi-finales nationales"),__("Finale nationale des jeunes")];
const TOURS_LYC=[__("Premier tour"),__("Quarts de finale"),__("Demi-finales d'État"),__("Finale d'État")];
function toursPO(){ return estLycee()?(jeunesNA()?TOURS_LYC:TOURS_JEUNES):estFac()?TOURS_FAC:TOURS_PLAYOFFS; }
let PO_BASE=[-0.26,-0.30,-0.34,-0.38];
function bonusPlayoffs(){
  const t=etat.playoffs?etat.playoffs.tour:0;
  const equipe=clamp((etat.meta.coteEquipe+etat.meta.alchimieEquipe-100)/700,-0.08,0.08);
  const tete=etat.saisonSport&&etat.saisonSport.rang<=2?0.03:0;
  return PO_BASE[t]+equipe+tete;
}
function terminerSaisonRegulier(entree){
  const bonus=etat.bonusSaison*0.6;
  const evenements=[];
  const moyenne=moyenneStats();
  const fac=estFac();
  if(fac){ if(Math.random()<Math.max(0,(moyenne-52)/80+bonus/2)){ etat.fac.honneurs=(etat.fac.honneurs||0)+1; evenements.push(estLycee()?(jeunesNA()?__("Joueur de l'année de l'État !"):__("Meilleur jeune du championnat !")):__("Meilleur joueur de la conférence !")); } }
  else{
  const gate=clamp((etat.meta.place-30)/40,0.12,1);
  if(Math.random()<Math.max(0,(moyenne-58)/80+bonus/2)*gate){ etat.distinctions.allStar++; evenements.push(/*fr*/'Sélection All-Star !'); }
  if(moyenne>68 && etat.meta.place>=70 && Math.random()<Math.max(0,0.01+(moyenne-68)/120+bonus/3)){ etat.distinctions.mvp++; evenements.push(/*fr*/'Élu MVP de la saison !'); }
  }
  if(etat.meta.risqueBlessure>60 && Math.random()<0.18){
    etat.malusAccumule+=3;
    etat.meta.risqueBlessure=Math.max(0,etat.meta.risqueBlessure-20);
    evenements.push(/*fr*/'Blessure — saison écourtée (−3 au score final)');
  }
  let medaille=null;
  if(etat.scenarioActuel&&etat.scenarioActuel.coupe){
    const nomC=etat.scenarioActuel.coupe.nom, avec=aPays(etat)?__(' avec ')+nomPays(etat):'';
    const issue=coupeIssue();
    if(issue==='or'){ medaille='or'; etat.distinctions.medailles=(etat.distinctions.medailles||0)+2; { const k_={jo:'jo',monde:'monde',continent:'can'}[etat.scenarioActuel.coupe.type]; if(k_) etat.distinctions[k_]=(etat.distinctions[k_]||0)+1; } evenements.push(__t("Médaille d'or — {#0}{#1} !",[nomC,avec])); }
    else if(issue==='argent'){ medaille='argent'; etat.distinctions.medailles=(etat.distinctions.medailles||0)+1; evenements.push(__t("Médaille d'argent — {#0}{#1}",[nomC,avec])); }
    else if(issue==='bronze'){ medaille='bronze'; etat.distinctions.medailles=(etat.distinctions.medailles||0)+1; evenements.push(__t("Médaille de bronze — {#0}{#1}",[nomC,avec])); }
    else if(issue==='quatrieme') evenements.push(__t("Quatrième place — {#0}{#1}",[nomC,avec]));
    else if(issue==='quart') evenements.push(__t("Éliminé en quarts de finale — {#0}{#1}",[nomC,avec]));
    else evenements.push(__t("Éliminé en phase de groupes — {#0}{#1}",[nomC,avec]));
  }
  const reussis=etat.matchsResultats.filter(m=>m.reussi).length;
  const s=genererSaisonRegliere(reussis,etat.matchsResultats.length,moyenne);
  if(fac){ const ng=estLycee()?24:32; s.v=Math.round(s.v*ng/82); s.d=ng-s.v; }
  etat.saisonSport={v:s.v,d:s.d,rang:s.rang,qualifie:s.rang<=8};
  if(!fac) etat.statsSaison=calculerStatsSaison(evenements.some(x=>x.startsWith('Blessure')),reussis);
  etat.evenementsSaison=evenements;
  etat.medailleSaison=medaille;
  etat.reussisReg=reussis;
  etat.playoffs=etat.saisonSport.qualifie?{tour:0,resultats:[]}:null;
  etat.matchActuel=null;
  etat.phase='finreguliere';
  sauvegarder();
  return entree;
}
/* ---------- Ligne statistique de la saison (points, rebonds, passes, matchs sur 82) ---------- */
const BONUS_REB={'Pivot':4.5,'Ailier fort':3,'Ailier':0.8,'Arrière':-0.8,'Meneur':-1.6};
const BONUS_PAS={'Meneur':2.5,'Arrière':0.6,'Ailier':0.3,'Ailier fort':-0.4,'Pivot':-0.6};
function calculerStatsSaison(blesse,reussis){
  const s=etat.stats, place=etat.meta.place, ng=82;
  const mpg=minutesJeu(place)*(0.96+Math.random()*0.08);
  const u=0.85+place/100*0.3, bruit=()=>0.92+Math.random()*0.16;
  const p36=clamp(5+(s.scoring-40)*0.42,3,38)*u*bruit();
  const r36=clamp(3.2+(s.athletisme-40)*0.06+(s.defense-40)*0.05+(BONUS_REB[etat.poste]||0),1.5,16)*bruit();
  const a36=clamp(1+(s.playmaking-40)*0.16+(BONUS_PAS[etat.poste]||0)+(s.basketIQ-50)*0.02,0.4,13)*bruit();
  const manques=blesse?Math.round(ng*(0.2+Math.random()*0.35)):Math.round(ng*Math.random()*0.07+etat.meta.risqueBlessure/100*ng*0.08);
  const r1_=v=>Math.round(v*10)/10;
  return {gp:Math.max(0,ng-manques),ng,manques,blesse:!!blesse,min:r1_(mpg),pts:r1_(p36*mpg/36),reb:r1_(r36*mpg/36),ast:r1_(a36*mpg/36),placeAvant:place,trophees:[]};
}
/* Fin de saison : le rôle évolue selon le niveau, la confiance du coach, le vestiaire et les résultats. */
function majRole(reussis,total){
  const m=etat.meta, moy=moyenneStats(), attendu=45+m.place*0.25;
  const delta=clamp((moy-attendu)*0.9,-8,10)+(m.coach-50)*0.12+(m.vestiaire-50)*0.05+((total?reussis/total:0.5)-0.5)*6+(etat.age<24?1:0);
  m.place=clamp(Math.round(m.place+delta),5,98);
  m.coach=Math.round(m.coach+(50-m.coach)*0.15); m.vestiaire=Math.round(m.vestiaire+(50-m.vestiaire)*0.15);
}
/* ---------- Interviews ---------- */
function ouvrirInterview(suite){
  const recents=etat.interviewsRecents||[];
  let dispo=INTERVIEWS.filter(x=>x.cond(etat)&&!recents.includes(x.id)); if(!dispo.length) dispo=INTERVIEWS.filter(x=>x.cond(etat));
  const th=pick(dispo);
  etat.interviewsRecents=[...recents,th.id].slice(-4);
  etat.interview={id:th.id,ordre:melangerOrdre([0,1,2,3,4]),suite,resultat:null};
  etat.phase='interview';
}
function interviewTheme(){ return etat.interview?themeInterviewParId(etat.interview.id):null; }
function repondreInterview(i){
  const th=interviewTheme(), iv=etat.interview; if(!th||!iv||iv.resultat) return;
  const ch=th.choix[iv.ordre[i]]; if(!ch) return;
  const m=etat.meta, avant={coach:m.coach,vestiaire:m.vestiaire,reputation:m.reputation,alchimie:m.alchimieEquipe,place:m.place};
  const roleAvant=roleIdx(m.place);
  appliquerEffets(ch.effets);
  const ag=iv.kind==='agence';
  if(ag){ iv.chaud=(iv.chaud||0)+(ch.chaud||0); if(ch.pref) iv.pref=ch.pref; }
  else m.place=clamp(Math.round(m.place+(m.coach-avant.coach)*0.35+(m.vestiaire-avant.vestiaire)*0.15),0,100);
  iv.resultat={axe:ch.axe,texte:ch.texte,chaud:Math.round((ch.chaud||0)*100),d:{coach:m.coach-avant.coach,vestiaire:m.vestiaire-avant.vestiaire,reputation:m.reputation-avant.reputation,alchimie:m.alchimieEquipe-avant.alchimie},roleAvant,roleApres:roleIdx(m.place)};
  sauvegarder();
}
function finirInterview(){
  const iv=etat.interview; if(!iv) return;
  const suite=iv.suite;
  if(iv&&iv.kind==='agence'){
    if(iv.etape<2){ iv.etape++; iv.id='fa'+(iv.etape+1); iv.ordre=melangerOrdre([0,1,2,3,4]); iv.resultat=null; sauvegarder(); return; }
    const p=1.12+clamp(iv.chaud||0,-0.12,0.2);
    etat.offres=genererOffresAgence(p,iv.pref); etat.interview=null; etat.modeOffres='contrat'; etat.phase='contrat'; sauvegarder(); return;
  }
  etat.interview=null;
  if(suite==='fin'){ etat.phase='match'; terminerSaisonRegulier(null); return; }
  etat.phase='match'; sauvegarder();
}
function avancerFinReguliere(){
  if(etat.playoffs) demarrerPlayoffs(); else finaliserSaison(0);
}
function demarrerPlayoffs(){
  etat.phase='playoffs';
  etat.matchActuel=genererMatchPlayoff(etat.playoffs.tour);
  sauvegarder();
}
function genererMatchPlayoff(tour){
  const rivalDispo=rivaux().length&&tour>=1&&Math.random()<0.5;
  let m;
  if(rivalDispo){ m=genererDuel(); }
  else{
    const recents=etat.situationsRecentes||[];
    const normales=MATCH_SITUATIONS.filter(s=>!s.id.startsWith('coupe_')&&!['trade_rumeur','retour','technique'].includes(s.id));
    let dispo=normales.filter(s=>!recents.includes(s.id)); if(!dispo.length) dispo=normales;
    const s=pick(dispo.concat(dispo.filter(x=>x.id==='playoffs')));
    etat.situationsRecentes=[...recents,s.id].slice(-8);
    m={id:s.id,titre:s.titre,contexte:s.contexte,choix:melangerOrdre(s.choix)};
  }
  const enjeu=tour===3?__("Gagne et tu es champion."):__("Gagne et tu passes au tour suivant.");
  m.contexte=estLycee()&&!jeunesNA()?__t("Phase finale des jeunes — {#0}. Match couperet. {#1} Perds et ta saison s'arrête. {#2}",[toursPO()[tour],enjeu,m.contexte]):estLycee()?__t("Tournoi d'État — {#0}. Match couperet. {#1} Perds et ta saison de lycée s'arrête. {#2}",[toursPO()[tour],enjeu,m.contexte]):estFac()?__t("Tournoi national — {#0}. Match couperet. {#1} Perds et ta saison universitaire s'arrête. {#2}",[toursPO()[tour],enjeu,m.contexte]):__t("Playoffs — {#0}. Match décisif de la série. {#1} Perds et la saison s'arrête. {#2}",[toursPO()[tour],enjeu,m.contexte]);
  m.titre=`${toursPO()[tour]} · ${m.titre}`;
  m.playoff=true; m.tour=tour;
  m.tableau=genererTableau(m);
  return m;
}
function resoudrePlayoffs(entree,reussi){
  const t=etat.playoffs.tour;
  entree.playoff=true; entree.tour=t;
  entree.issue={tour:t,avance:reussi,champion:reussi&&t===3,nom:toursPO()[t],suivant:t<3?toursPO()[t+1]:null};
  etat.playoffs.resultats.push(entree);
  if(reussi){
    if(t===3) finaliserSaison(5);
    else{ etat.playoffs.tour=t+1; etat.matchActuel=genererMatchPlayoff(t+1); sauvegarder(); }
  } else finaliserSaison(t+1);
  return entree;
}
function finaliserSaison(stade){
  const evenements=[...(etat.evenementsSaison||[])];
  const po=(etat.playoffs&&etat.playoffs.resultats)||[];
  const fac=estFac();
  if(stade===5){ if(fac){ etat.fac.titres++; evenements.unshift(estLycee()?(jeunesNA()?__("Titre d'État remporté !"):__("Titre national des jeunes remporté !")):__("Titre universitaire remporté !")); } else { etat.distinctions.titres++; (etat.titresSaisons=etat.titresSaisons||[]).push(etat.saison); evenements.unshift(__("Titre remporté !")); } }
  else if(stade===4) evenements.unshift(estLycee()?(jeunesNA()?__("Finaliste d'État — battu en finale"):__("Finaliste national des jeunes — battu en finale")):fac?__("Finaliste national — battu en finale"):__("Finaliste — battu en finale"));
  const st_=etat.statsSaison;
  if(!fac&&st_){
    const moy=moyenneStats(), pl=etat.meta.place, T=st_.trophees, add=(txt)=>{ T.push(txt); evenements.push(txt); etat.distinctions.trophees=(etat.distinctions.trophees||0)+1; };
    if(etat.saison===1&&pl>=40&&st_.pts>=9&&Math.random()<clamp((moy-52)/45,0,0.6)) add(__("Rookie de l'année"));
    if(etat.stats.defense>=76&&pl>=55&&Math.random()<clamp((etat.stats.defense-70)/55,0,0.45)) add(__("Défenseur de l'année"));
    if(roleIdx(pl)<=2&&pl>=38&&moy>=64&&Math.random()<0.25) add(__("Meilleur sixième homme"));
    if(st_.pts>=26&&Math.random()<clamp((st_.pts-24)/8,0,0.7)) add(__("Meilleur marqueur de la ligue"));
    if(stade===5&&pl>=62&&Math.random()<0.4) add(__("MVP des Finales"));
  }
  const ss=etat.saisonSport||{v:41,d:41,rang:8};
  const saisonSportive={v:ss.v,d:ss.d,rang:ss.rang,stade,fac};
  const tous=[...etat.matchsResultats,...po];
  const reussis=tous.filter(m=>m.reussi).length;
  etat.bilan={
    titre:stade===5,
    allStar:evenements.some(x=>x.startsWith('Sélection')),
    mvp:evenements.some(x=>x.startsWith('Élu MVP')),
    blessure:evenements.some(x=>x.startsWith('Blessure')),
    medaille:etat.medailleSaison||null, saison:saisonSportive,
    reussis, rates:tous.length-reussis, total:tous.length
  };
  const avant=etat.statsAvantSaison||etat.stats;
  const deltas={};
  for(const k in avant){ if(etat.stats[k]!==avant[k]) deltas[k]=etat.stats[k]-avant[k]; }
  const gSal=etat.contrat?etat.contrat.salaire:0, gMar=revenuMarque(etat.bilan);
  etat.gains=r1((etat.gains||0)+gSal+gMar);
  etat.dernierResultat={
    gainsSaison:{salaire:gSal,marque:gMar},
    texteChoix:etat.texteChoixSaison, axe:etat.axeChoisiSaison, deltas, evenements,
    matchs:tous, saison:saisonSportive,
    stats:(!fac&&etat.statsSaison)?{...etat.statsSaison,allStar:evenements.some(x=>x.startsWith('Sélection')),mvp:evenements.some(x=>x.startsWith('Élu MVP')),titre:stade===5,medaille:etat.medailleSaison||null,place:etat.meta.place,roleAvant:roleIdx(etat.statsSaison.placeAvant)}:null
  };
  if(fac) etat.fac.derniere={reussis,total:tous.length};
  if(typeof suivre==='function'&&!fac){
    suivre('saison'); suivre('saison_n',etat.saison);
    if(stade===5) suivre('titre');
    if(etat.bilan.allStar) suivre('allstar');
    if(etat.bilan.mvp) suivre('mvp');
    if(etat.medailleSaison) suivre('medaille',1,etat.medailleSaison);
  }
  if(!fac&&etat.statsSaison) majRole(reussis,tous.length);
  if(etat.dernierResultat.stats) etat.dernierResultat.stats.roleApres=roleIdx(etat.meta.place);
  etat.statsSaison=null;
  etat.matchActuel=null; etat.playoffs=null; etat.saisonSport=null; etat.evenementsSaison=null;
  etat.phase='resultat';
  sauvegarder();
}
const HOF_KEY='five-ways-hof-v1';
function rareteScore(t){
  return t>=110?[__('LÉGENDAIRE'),'#F5C542',__("Top 10 %")]:t>=80?[__('ÉPIQUE'),'#D4F04D',__("Top 30 %")]:t>=55?[__('RARE'),'#4C6FFF',__("Top 65 %")]:[__('COMMUN'),'#9AA7BD',__("Parcours classique")];
}
function lireHof(){ try{ const v=JSON.parse(localStorage.getItem(HOF_KEY)||'[]'); return Array.isArray(v)?v:[]; }catch(err){ return []; } }
function enregistrerCarriere(){
  if(etat.hofEnregistre) return;
  etat.hofEnregistre=true;
  try{
    enregistrerDefiCarriere();
    const sc=calculerScore();
    if(typeof suivre==='function') suivre('score',sc.total);
    const liste=lireHof();
    liste.push({nom:etat.nom,numero:etat.numero,poste:etat.poste,score:sc.total,saisons:etat.saison-1,titres:etat.distinctions.titres,equipe:etat.franchise.ville+' '+etat.franchise.nom});
    liste.sort((a,b)=>b.score-a.score);
    localStorage.setItem(HOF_KEY,JSON.stringify(liste.slice(0,5)));
  }catch(err){}
}
function continuerApresResultat(){
  if(estLycee()){ terminerLycee(); sauvegarder(); return; }
  if(estFac()){ etat.age++; if(etat.fac.numero>=etat.fac.annees) terminerFac(); else{ etat.flagScenario='fac_decision'; etat.phase='jeu'; genererTour(); } sauvegarder(); return; }
  etat.age++; etat.saison++;
  const chanceRetraite = etat.age>=30 ? (etat.age-30)*0.09 : 0;
  if(etat.age>=36 || Math.random()<chanceRetraite){ etat.phase='retraite'; enregistrerCarriere(); }
  else{ preparerInterSaison(); suiteHorsSaison(); }
  sauvegarder();
}
/* Barème : titre +15 (deux de suite +20, trois de suite et plus +30), JO +10, CAN / Coupe du monde +5, MVP +8, autres trophées individuels +3, All-Star +2. */
function pointsTitres(){
  const d=etat.distinctions, ss=[...new Set((etat.titresSaisons||[]).map(Number))].sort((a,b)=>a-b);
  let tot=0, run=0, prev=-9;
  for(const x of ss){ run=(x===prev+1)?run+1:1; tot+=run>=3?30:run===2?20:15; prev=x; }
  return tot+15*Math.max(0,(d.titres||0)-ss.length);
}
function calculerScore(){
  const d=etat.distinctions;
  const titres=pointsTitres();
  const ors=(d.jo||0)+(d.can||0)+(d.monde||0);
  const autresMedailles=Math.max(0,(d.medailles||0)-2*ors);
  const distinctions=d.allStar*2 + d.mvp*8 + (d.trophees||0)*3 + (d.jo||0)*10 + ((d.can||0)+(d.monde||0))*5 + Math.min(4,autresMedailles);
  const stats=Math.max(0, Math.min(25, Math.round((moyenneStats()-40)/60*25)));
  const seasons=etat.saison-1;
  let longevite=Math.min(12,seasons);
  if(seasons>=8 && moyenneStats()>72) longevite=Math.min(16, longevite+4);
  const total=Math.max(0, titres+distinctions+stats+longevite-etat.malusAccumule);
  return {total,titres,distinctions,stats,longevite,malus:etat.malusAccumule};
}
function sauvegarder(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(etat)); }catch(e){} }
function sauvegardeValide(s){
  if(!s||typeof s!=='object'||!s.stats||!s.meta||!s.distinctions||typeof s.phase!=='string') return false;
  if(s.phase==='jeu') return Array.isArray(s.tourActuel)&&s.tourActuel.length===5&&!!s.franchise;
  if(s.phase==='match') return !!s.matchActuel&&Array.isArray(s.matchActuel.choix)&&Array.isArray(s.matchsResultats)&&typeof s.matchsTotal==='number'&&!!s.franchise;
  if(s.phase==='finreguliere') return !!s.saisonSport&&typeof s.saisonSport==='object'&&!!s.franchise;
  if(s.phase==='playoffs') return !!s.matchActuel&&Array.isArray(s.matchActuel.choix)&&!!s.playoffs&&typeof s.playoffs==='object'&&!!s.saisonSport&&!!s.franchise;
  if(s.phase==='resultat') return !!s.dernierResultat&&!!s.franchise;
  if(s.phase==='interview') return !!s.franchise&&!!s.interview&&typeof s.interview==='object'&&!!themeInterviewParId(s.interview.id)&&(s.interview.suite!=='match'||(!!s.matchActuel&&Array.isArray(s.matchActuel.choix)&&Array.isArray(s.matchsResultats)));
  if(s.phase==='retraite') return !!s.franchise;
  if(s.phase==='lycee') return Array.isArray(s.tourActuel);
  if(s.phase==='chemin'||s.phase==='combine') return true;
  if(s.phase==='offresfac') return Array.isArray(s.offresFac)&&s.offresFac.length>0;
  if(s.phase==='contrat'||s.phase==='sponsor'||s.phase==='trade') return !!s.franchise&&Array.isArray(s.offres)&&s.offres.length>0;
  if(s.phase==='draftnight') return !!s.franchise&&typeof s.draftPick==='number';
  return false;
}
// Une sauvegarde vient du navigateur : elle peut être modifiée ou venir d'un autre site de la même origine.
// On la reconstruit donc avec des valeurs contrôlées avant de l'utiliser.
function assainir(s){
  const num=(v,mn,mx,d)=>{ v=Number(v); return Number.isFinite(v)?Math.max(mn,Math.min(mx,Math.round(v))):d; };
  const f=FRANCHISES.find(x=>s.franchise&&x.id===s.franchise.id)||ECOLES.find(x=>s.franchise&&x.id===s.franchise.id)||LYCEES.find(x=>s.franchise&&x.id===s.franchise.id)||CLUBS_JEUNES.find(x=>s.franchise&&x.id===s.franchise.id);
  if(s.franchise&&!f&&s.phase!=='offresfac') return false;
  if(f) s.franchise=f;
  s.nom=String(s.nom||__('JOUEUR')).replace(/[<>&"'`]/g,'').slice(0,24)||__('JOUEUR');
  if(!POSITIONS[s.poste]) s.poste='Ailier';
  if(s.pays!==undefined&&!PAYS.some(p=>p[0]===s.pays)) s.pays='Autre';
  if(s.gabarit!==undefined&&!GABARITS[s.gabarit]) s.gabarit='Équilibré';
  if(s.numero!==undefined) s.numero=num(s.numero,0,99,23);
  if(s.origine!==undefined&&!origineParId(s.origine)) delete s.origine;
  if(s.defi&&typeof s.defi==='object'&&carriereParId(s.defi.id)) s.defi={id:s.defi.id}; else s.defi=null;
  s.age=num(s.age,14,60,17); s.saison=num(s.saison,0,60,1);
  for(const k of Object.keys(POSITIONS.Ailier)) s.stats[k]=num(s.stats[k],0,99,50);
  for(const k of ['reputation','coteEquipe','risqueBlessure','alchimieEquipe','coach','vestiaire','place']) s.meta[k]=num(s.meta[k],0,100,50);
  s.compteurInterview=num(s.compteurInterview,0,2,0); s.interviewsRecents=(Array.isArray(s.interviewsRecents)?s.interviewsRecents:[]).filter(x=>INTERVIEWS.some(t=>t.id===x)).slice(-4);
  if(s.interview&&typeof s.interview==='object'&&themeInterviewParId(s.interview.id)){ const o=Array.isArray(s.interview.ordre)?s.interview.ordre.map(Number):[]; const ok=o.length===5&&[0,1,2,3,4].every(k=>o.includes(k)); const r=s.interview.resultat; const d=r&&r.d||{}; const th_=themeInterviewParId(s.interview.id); const ag_=s.interview.kind==='agence'&&s.interview.id.startsWith('fa'); s.interview={id:s.interview.id,kind:ag_?'agence':null,etape:num(s.interview.etape,0,2,0),chaud:Math.max(-0.5,Math.min(0.8,Math.round((Number(s.interview.chaud)||0)*100)/100)),pref:['contender','argent','marche','maison','star'].includes(s.interview.pref)?s.interview.pref:null,ordre:ok?o:[0,1,2,3,4],suite:ag_?'agence':s.interview.suite==='fin'?'fin':'match',resultat:r&&typeof r==='object'&&th_.choix.some(c=>c.texte===r.texte)?{axe:th_.choix.find(c=>c.texte===r.texte).axe,texte:r.texte,chaud:num(r.chaud,-30,30,0),d:{coach:num(d.coach,-30,30,0),vestiaire:num(d.vestiaire,-30,30,0),reputation:num(d.reputation,-30,30,0),alchimie:num(d.alchimie,-30,30,0)},roleAvant:num(r.roleAvant,0,4,0),roleApres:num(r.roleApres,0,4,0)}:null}; } else s.interview=null;
  { const q=s.statsSaison; if(q&&typeof q==='object'){ const f1=(v,mn,mx)=>{ v=Number(v); return Number.isFinite(v)?Math.max(mn,Math.min(mx,Math.round(v*10)/10)):0; }; s.statsSaison={gp:num(q.gp,0,82,82),ng:82,manques:num(q.manques,0,82,0),blesse:!!q.blesse,min:f1(q.min,0,48),pts:f1(q.pts,0,60),reb:f1(q.reb,0,30),ast:f1(q.ast,0,25),placeAvant:num(q.placeAvant,0,100,50),trophees:[]}; } else s.statsSaison=null; }
  for(const k of ['titres','allStar','mvp','medailles','trophees','jo','can','monde']) s.distinctions[k]=num(s.distinctions[k],0,99,0);
  s.titresSaisons=(Array.isArray(s.titresSaisons)?s.titresSaisons:[]).map(Number).filter(x=>Number.isFinite(x)&&x>=0&&x<=80).slice(0,60);
  s.niveau=s.niveau==='fac'?'fac':'pro';
  if(s.niveau==='fac'&&s.fac&&typeof s.fac==='object'){ const q=s.fac; s.fac={annees:q.lycee?1:4,lycee:!!q.lycee,region:['na','af','eu','ot'].includes(q.region)?q.region:'na',etape:q.etape===2?2:1,numero:num(q.numero,1,q.lycee?1:4,1),titres:num(q.titres,0,9,0),honneurs:num(q.honneurs,0,9,0),derniere:q.derniere&&typeof q.derniere==='object'?{reussis:num(q.derniere.reussis,0,20,0),total:num(q.derniere.total,1,20,1)}:null}; if(s.fac.numero>s.fac.annees) s.fac.numero=s.fac.annees; } else { s.fac=null; if(s.niveau==='fac') s.niveau='pro'; }
  if(s.ecole!==undefined) s.ecole=String(s.ecole).replace(/[<>&"'`]/g,'').slice(0,50);
  s.malusAccumule=num(s.malusAccumule,0,999,0);
  const nf=(v,mn,mx,d)=>{ v=Number(v); return Number.isFinite(v)?Math.max(mn,Math.min(mx,Math.round(v*10)/10)):d; };
  s.faits=(Array.isArray(s.faits)?s.faits:[]).slice(-8).filter(x=>x&&typeof x==='object'&&FRANCHISES.some(f=>f.id===x.opp)).map(x=>({opp:x.opp,stat:['scoring','defense','playmaking','athletisme','basketIQ'].includes(x.stat)?x.stat:'scoring',po:!!x.po,saison:num(x.saison,0,60,1)}));
  s.gains=nf(s.gains,0,99999,0); s.ansEquipe=num(s.ansEquipe,0,60,0); s.signatures=num(s.signatures,0,99,0);
  if(s.contrat&&typeof s.contrat==='object'){ const c=s.contrat; const cc={type:c.type==='rookie'?'rookie':'standard',annees:num(c.annees,0,6,1),reste:num(c.reste,-1,6,1),salaire:nf(c.salaire,0,999,1),ntc:!!c.ntc,optJ:!!c.optJ,garantis:num(c.garantis,0,4,0)};
    if(c.suivant&&typeof c.suivant==='object') cc.suivant={annees:num(c.suivant.annees,1,6,1),salaire:nf(c.suivant.salaire,0,999,1),ntc:!!c.suivant.ntc,optJ:!!c.suivant.optJ}; s.contrat=cc; } else s.contrat=null;
  if(s.marque&&typeof s.marque==='object'&&marqueParId(s.marque.id)) s.marque={id:s.marque.id,type:['signature','standard','emergente','prime'].includes(s.marque.type)?s.marque.type:'standard',annees:num(s.marque.annees,1,6,1),reste:num(s.marque.reste,0,6,1),valeur:nf(s.marque.valeur,0,999,0.3)}; else s.marque=null;
  s.file=(Array.isArray(s.file)?s.file:[]).filter(x=>['contrat','extension','sponsor'].includes(x)).slice(0,4);
  s.modeOffres=s.modeOffres==='extension'?'extension':'contrat';
  s.refusExt=!!s.refusExt; s.optionRefusee=!!s.optionRefusee; s.optionJoueurExercee=!!s.optionJoueurExercee;
  if(s.flagScenario&&!['trade_surprise','trade_veto','trade_demande'].includes(s.flagScenario)) s.flagScenario=null;
  if(s.tradeVers&&!FRANCHISES.some(f=>f.id===s.tradeVers)) s.tradeVers=null;
  if(Array.isArray(s.offresFac)) s.offresFac=s.offresFac.slice(0,6).filter(o=>o&&(o.k==='fac'&&ECOLES.some(x=>x.id===o.fid)||o.k==='club'&&CLUBS_JEUNES.some(x=>x.id===o.fid)||o.k==='chemin'&&CHEMINS_PREDRAFT[o.i])).map(o=>o.k==='fac'?{k:'fac',fid:o.fid,tier:num(o.tier,1,3,1)}:o.k==='club'?{k:'club',fid:o.fid,tier:num(o.tier,1,3,1),eu:!!o.eu,stay:!!o.stay}:{k:'chemin',i:num(o.i,0,CHEMINS_PREDRAFT.length-1,1)}); else s.offresFac=null;
  if(Array.isArray(s.offres)) s.offres=s.offres.slice(0,6).filter(o=>o&&typeof o==='object'&&FRANCHISES.some(f=>f.id===o.fid)||(o&&marqueParId(o.mid)||o&&o.k==='libre')).map(o=>({k:String(o.k||'').slice(0,20),fid:FRANCHISES.some(f=>f.id===o.fid)?o.fid:s.franchise.id,mid:marqueParId(o.mid)?o.mid:'',tag:['contender','marche','reconstruction','maison','refus'].includes(o.tag)?o.tag:'maison',annees:num(o.annees,0,6,0),salaire:nf(o.salaire,0,999,0),valeur:nf(o.valeur,0,999,0),ntc:!!o.ntc,optJ:!!o.optJ})); else s.offres=null;
  if(s.ancienneFranchise&&typeof s.ancienneFranchise==='object') s.ancienneFranchise={ville:String(s.ancienneFranchise.ville||'').slice(0,30),nom:String(s.ancienneFranchise.nom||'').slice(0,30)}; else s.ancienneFranchise=null;
  if(Array.isArray(s.rivaux)) s.rivaux=s.rivaux.slice(0,12).filter(r=>r&&typeof r==='object').map(r=>({id:String(r.id||'').slice(0,20),type:String(r.type||'').slice(0,10),nom:String(r.nom||'').slice(0,40),court:String(r.court||'').slice(0,30),prenom:String(r.prenom||'').slice(0,20),poste:String(r.poste||'').slice(0,20),equipe:String(r.equipe||'').slice(0,40),detail:String(r.detail||'').slice(0,60),raison:['scoring','defense','playmaking','athletisme','basketIQ','elimine'].includes(r.raison)?r.raison:'',niveau:num(r.niveau,1,5,1),bilan:{v:num(r.bilan&&r.bilan.v,0,999,0),d:num(r.bilan&&r.bilan.d,0,999,0)}}));
  else s.rivaux=[];
  if(s.saisonSport&&typeof s.saisonSport==='object'){ const q=s.saisonSport; s.saisonSport={v:num(q.v,0,82,41),d:num(q.d,0,82,41),rang:num(q.rang,1,15,8),qualifie:num(q.rang,1,15,8)<=8}; } else s.saisonSport=null;
  if(s.playoffs&&typeof s.playoffs==='object'){ s.playoffs={tour:num(s.playoffs.tour,0,3,0),resultats:(Array.isArray(s.playoffs.resultats)?s.playoffs.resultats:[]).slice(0,4).filter(r=>r&&typeof r==='object')}; } else s.playoffs=null;
  if(s.matchActuel&&s.matchActuel.adv&&!CONTINENTS[s.matchActuel.adv]) delete s.matchActuel.adv;
  if(s.scenarioActuel&&s.scenarioActuel.coupe&&s.scenarioActuel.coupe.adv) s.scenarioActuel.coupe.adv=(Array.isArray(s.scenarioActuel.coupe.adv)?s.scenarioActuel.coupe.adv:[]).filter(a=>CONTINENTS[a]).slice(0,8);
  if(s.matchActuel&&s.matchActuel.stade&&!['poule','quart','demi','bronze','finale'].includes(s.matchActuel.stade)) delete s.matchActuel.stade;
  if(s.matchActuel&&s.matchActuel.rangC!==undefined) s.matchActuel.rangC=num(s.matchActuel.rangC,0,8,0);
  if(s.matchActuel){ s.matchActuel.playoff=!!s.matchActuel.playoff; s.matchActuel.tour=num(s.matchActuel.tour,0,3,0); }
  if(!Array.isArray(s.evenementsSaison)) s.evenementsSaison=null; else s.evenementsSaison=s.evenementsSaison.slice(0,8).map(x=>String(x).slice(0,120));
  const t=s.matchActuel&&s.matchActuel.tableau;
  if(t&&typeof t==='object'){
    const hex=v=>/^#[0-9A-Fa-f]{6}$/.test(v)?v:'#4C6FFF', ab=v=>String(v||'').replace(/[^A-Z]/g,'').slice(0,4)||'EQP';
    s.matchActuel.tableau={na:ab(t.na),nb:ab(t.nb),ca:hex(t.ca),cb:hex(t.cb),q:num(t.q,1,5,4),t:/^\d{1,2}:\d{2}$/.test(String(t.t))?String(t.t):'0:30',a:num(t.a,0,250,80),b:num(t.b,0,250,80),dom:!!t.dom,neutre:!!t.neutre};
    if(FRANCHISES.some(f=>f.id===t.opp)) s.matchActuel.tableau.opp=t.opp;
    if(Array.isArray(t.fa)&&t.fa.length===3) s.matchActuel.tableau.fa=t.fa.map(hex); if(Array.isArray(t.fb)&&t.fb.length===3) s.matchActuel.tableau.fb=t.fb.map(hex);
  } else if(s.matchActuel) delete s.matchActuel.tableau;
  return true;
}
function charger(){
  try{
    const brut=localStorage.getItem(SAVE_KEY);
    if(brut){ const s=JSON.parse(brut); etat=(sauvegardeValide(s)&&assainir(s))?s:null; if(!etat) localStorage.removeItem(SAVE_KEY); }
  }catch(e){ etat=null; }
}
function reinitialiser(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} etat=null; accueilVu=false; render(); }

