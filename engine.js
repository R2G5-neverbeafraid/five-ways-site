// Règles du jeu : état, tirage des choix, matchs, score, sauvegarde
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function rivaux(){ if(!etat.rivaux) etat.rivaux=[]; return etat.rivaux; }
function possede(type){ return rivaux().some(r=>r.type===type); }
function franchiseParId(id){ return FRANCHISES.find(f=>f.id===id)||ECOLES.find(f=>f.id===id)||LYCEES.find(f=>f.id===id); }
function estFac(){ return !!etat&&etat.niveau==='fac'; }
function estLycee(){ return estFac()&&!!etat.fac&&!!etat.fac.lycee; }
function toutesEquipes(){ return estLycee()?LYCEES:estFac()?ECOLES:FRANCHISES; }
function libSaison(){ return estLycee()?__("Lycée · dernière année"):estFac()?__t("Université · année {#0}",[etat.fac.numero]):__t("Saison {#0}",[etat.saison]); }
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
    meta:{reputation:40,coteEquipe:50,risqueBlessure:0,alchimieEquipe:50},
    distinctions:{titres:0,allStar:0,mvp:0,medailles:0},
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
function lyceeParOrigine(id){
  const p=pick([0,1,2,3,4,5,6,7,8,9]);
  const niv=id==='prep'?3:id==='academie'?(p<5?3:2):id==='fils'?(p<5?3:2):id==='bitume'?(p<7?1:2):2;
  return pick(LYCEES.filter(l=>l.prestige===niv));
}
function commencerLycee(){
  etat.niveau='fac'; etat.fac={annees:1,numero:1,derniere:null,titres:0,honneurs:0,lycee:true};
  etat.franchise=lyceeParOrigine(etat.origine); etat.rivaux=[]; etat.saison=0; etat.ansEquipe=0;
  etat.meta.coteEquipe=COTE_PRESTIGE[etat.franchise.prestige]||48; etat.meta.alchimieEquipe=50;
  etat.scenariosRecents=[]; etat.faits=[]; etat.flagScenario=null;
  etat.phase='jeu'; genererTour();
}
/* Fin de la saison de lycée : les universités appellent selon ta saison, ton profil et ton équipe. */
function terminerLycee(){
  const d=etat.fac.derniere||{reussis:1,total:2}, ratio=d.reussis/Math.max(1,d.total);
  etat.coteDraftBase+=clamp(Math.round((ratio-0.5)*6),-2,3)+(etat.fac.titres?1:0);
  const p=moyenneStats()+(etat.meta.reputation-40)*0.35+(ratio-0.5)*24+(etat.fac.titres?6:0)+(etat.fac.honneurs?5:0)+etat.coteDraftBase*0.8+(etat.franchise.prestige-2)*2;
  const dejaPris=[], offres=[];
  for(let i=0;i<3;i++){
    const sc=p+(Math.random()-0.5)*16;
    const tier=sc>=66?3:sc>=55?2:1;
    const cands=ECOLES.filter(x=>x.prestige===tier&&!dejaPris.includes(x.id));
    const ecole=pick(cands.length?cands:ECOLES.filter(x=>!dejaPris.includes(x.id)));
    dejaPris.push(ecole.id); offres.push({k:'fac',fid:ecole.id,tier:ecole.prestige});
  }
  offres.sort((a,b)=>b.tier-a.tier);
  offres.push({k:'chemin',i:1},{k:'chemin',i:2});
  etat.age++; etat.offresFac=offres;
  etat.niveau='pro'; etat.fac=null; etat.scenarioActuel=null; etat.rivaux=[]; etat.faits=[]; etat.axeChoisiSaison=null;
  etat.phase='offresfac';
}
function choisirOffreFac(i){
  const o=(etat.offresFac||[])[i]; if(!o) return;
  etat.offresFac=null;
  if(o.k==='fac'){ const ecole=franchiseParId(o.fid); commencerFac(1,ecole); }
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
  const choisi=estFac()?(estLycee()?(base.find(s=>s.id==='lyc_'+etat.origine&&s.cond(etat))||base.find(s=>s.id==='lyc_generique')):etat.fac.numero===1?specifiques.find(s=>s.id==='fac_arrivee'):tirerPondere(specifiques)):(etat.saison===1?specifiques.find(s=>s.id==='rookie'):tirerPondere(specifiques));
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
  if(choix.action==='fac_rester'){ etat.fac.numero++; etat.phase='jeu'; genererTour(); sauvegarder(); return; }
  if(['draft','gleague','europe','prepa'].includes(choix.action)){
    if(choix.action!=='draft'){ etat.age++; etat.coteDraftBase+=choix.action==='europe'?1:choix.action==='prepa'?1:0; }
    terminerFac(); sauvegarder(); return;
  }
  if(choix.action==='transfert'){ etat.franchise=pick(ECOLES.filter(x=>x.id!==etat.franchise.id)); etat.meta.coteEquipe=({3:66,2:54,1:44})[etat.franchise.prestige]||48; etat.meta.alchimieEquipe=clamp(etat.meta.alchimieEquipe-4,0,100); }
  if(choix.action==='demande'){ etat.offres=genererOffresTrade(); etat.phase='trade'; sauvegarder(); return; }
  demarrerMatchs();
}
function genererMatchCoupe(rang){
  const sa=etat.scenarioActuel.coupe, pays=nomPays(etat), id=['coupe_poule','coupe_demi','coupe_finale'][rang];
  const s=MATCH_SITUATIONS.find(x=>x.id===id);
  const sub=t=>t.replace(/\{pays\}/g,pays).replace(/\{coupe\}/g,sa.nom);
  return {id:s.id,titre:s.titre,contexte:sub(s.contexte),choix:melangerOrdre(s.choix.map(c=>({...c,texte:sub(c.texte),ok:sub(c.ok),ko:sub(c.ko)}))),coupe:true};
}
function genererMatch(){ const m=genererMatchBase(); m.tableau=genererTableau(m); return m; }
function genererMatchBase(){
  if(rivaux().length&&etat.matchsResultats&&etat.matchsResultats.length===etat.matchsTotal-1) return genererDuel();
  if(etat.scenarioActuel&&etat.scenarioActuel.coupe&&etat.matchsResultats&&etat.matchsResultats.length<3) return genererMatchCoupe(etat.matchsResultats.length);
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
  const p=clamp(clamp(etat.stats[opt.stat]/100+opt.mod,0.12,0.9)+bonusGeste+(enPlayoffs?bonusPlayoffs():0),0.05,0.95);
  const reussi=gesteRate?false:Math.random()<p;
  const rv=etat.matchActuel.rivalId?rivaux().find(r=>r.id===etat.matchActuel.rivalId):null;
  const f=rv?1+0.2*rv.niveau:1;
  appliquerEffets(scaleEffets(reussi?opt.gain:opt.perte,f));
  const enjeu=rv?opt.enjeu*(1+0.1*rv.niveau):opt.enjeu;
  etat.bonusSaison+=reussi?enjeu:-enjeu/2;
  const entree={titre:etat.matchActuel.titre, texte:opt.texte, reussi, narration:reussi?opt.ok:opt.ko, stat:opt.stat, p:gesteRate?0:Math.round(p*100), geste:(geste&&geste.label)||null, tableau:etat.matchActuel.tableau||null};
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
  if(etat.matchsResultats.length<etat.matchsTotal){
    etat.matchActuel=genererMatch();
    sauvegarder();
    return entree;
  }
  return terminerSaisonRegulier(entree);
}

/* ---------- Fin de saison régulière, playoffs ---------- */
const TOURS_PLAYOFFS=[__("Premier tour"),__("Demi-finales de conférence"),__("Finale de conférence"),__('Finales')];
const TOURS_FAC=[__("Premier tour du Tournoi"),__("Sweet 16"),__("Final Four"),__("Finale nationale")];
const TOURS_LYC=[__("Premier tour"),__("Quarts de finale"),__("Demi-finales d'État"),__("Finale d'État")];
function toursPO(){ return estLycee()?TOURS_LYC:estFac()?TOURS_FAC:TOURS_PLAYOFFS; }
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
  if(fac){ if(Math.random()<Math.max(0,(moyenne-52)/80+bonus/2)){ etat.fac.honneurs=(etat.fac.honneurs||0)+1; evenements.push(estLycee()?__("Joueur de l'année de l'État !"):__("Meilleur joueur de la conférence !")); } }
  else{
  if(Math.random()<Math.max(0,(moyenne-58)/80+bonus/2)){ etat.distinctions.allStar++; evenements.push(/*fr*/'Sélection All-Star !'); }
  if(moyenne>68 && Math.random()<Math.max(0,0.01+(moyenne-68)/120+bonus/3)){ etat.distinctions.mvp++; evenements.push(/*fr*/'Élu MVP de la saison !'); }
  }
  if(etat.meta.risqueBlessure>60 && Math.random()<0.18){
    etat.malusAccumule+=3;
    etat.meta.risqueBlessure=Math.max(0,etat.meta.risqueBlessure-20);
    evenements.push(/*fr*/'Blessure — saison écourtée (−3 au score final)');
  }
  let medaille=null;
  if(etat.scenarioActuel&&etat.scenarioActuel.coupe){
    const [poule,demi,finale]=etat.matchsResultats.slice(0,3).map(m=>m.reussi);
    const nomC=etat.scenarioActuel.coupe.nom, avec=aPays(etat)?__(' avec ')+nomPays(etat):'';
    if(poule&&demi&&finale){ medaille='or'; etat.distinctions.medailles=(etat.distinctions.medailles||0)+2; evenements.push(__t("Médaille d'or — {#0}{#1} !",[nomC,avec])); }
    else if(poule&&demi){ medaille='argent'; etat.distinctions.medailles=(etat.distinctions.medailles||0)+1; evenements.push(__t("Médaille d'argent — {#0}{#1}",[nomC,avec])); }
    else if(demi||(poule&&Math.random()<0.4)){ medaille='bronze'; etat.distinctions.medailles=(etat.distinctions.medailles||0)+1; evenements.push(__t("Médaille de bronze — {#0}{#1}",[nomC,avec])); }
  }
  const reussis=etat.matchsResultats.filter(m=>m.reussi).length;
  const s=genererSaisonRegliere(reussis,etat.matchsResultats.length,moyenne);
  if(fac){ const ng=estLycee()?24:32; s.v=Math.round(s.v*ng/82); s.d=ng-s.v; }
  etat.saisonSport={v:s.v,d:s.d,rang:s.rang,qualifie:s.rang<=8};
  etat.evenementsSaison=evenements;
  etat.medailleSaison=medaille;
  etat.reussisReg=reussis;
  etat.playoffs=etat.saisonSport.qualifie?{tour:0,resultats:[]}:null;
  etat.matchActuel=null;
  etat.phase='finreguliere';
  sauvegarder();
  return entree;
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
  m.contexte=estLycee()?__t("Tournoi d'État — {#0}. Match couperet. {#1} Perds et ta saison de lycée s'arrête. {#2}",[toursPO()[tour],enjeu,m.contexte]):estFac()?__t("Tournoi national — {#0}. Match couperet. {#1} Perds et ta saison universitaire s'arrête. {#2}",[toursPO()[tour],enjeu,m.contexte]):__t("Playoffs — {#0}. Match décisif de la série. {#1} Perds et la saison s'arrête. {#2}",[toursPO()[tour],enjeu,m.contexte]);
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
  if(stade===5){ if(fac){ etat.fac.titres++; evenements.unshift(estLycee()?__("Titre d'État remporté !"):__("Titre universitaire remporté !")); } else { etat.distinctions.titres++; evenements.unshift(__("Titre remporté !")); } }
  else if(stade===4) evenements.unshift(estLycee()?__("Finaliste d'État — battu en finale"):fac?__("Finaliste national — battu en finale"):__("Finaliste — battu en finale"));
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
    matchs:tous, saison:saisonSportive
  };
  if(fac) etat.fac.derniere={reussis,total:tous.length};
  if(typeof suivre==='function'&&!fac){
    suivre('saison'); suivre('saison_n',etat.saison);
    if(stade===5) suivre('titre');
    if(etat.bilan.allStar) suivre('allstar');
    if(etat.bilan.mvp) suivre('mvp');
    if(etat.medailleSaison) suivre('medaille',1,etat.medailleSaison);
  }
  etat.matchActuel=null; etat.playoffs=null; etat.saisonSport=null; etat.evenementsSaison=null;
  etat.phase='resultat';
  sauvegarder();
}
const HOF_KEY='five-ways-hof-v1';
function rareteScore(t){
  return t>=76?[__('LÉGENDAIRE'),'#F5C542',__("Top 10 %")]:t>=62?[__('ÉPIQUE'),'#D4F04D',__("Top 30 %")]:t>=46?[__('RARE'),'#4C6FFF',__("Top 65 %")]:[__('COMMUN'),'#9AA7BD',__("Parcours classique")];
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
function calculerScore(){
  const d=etat.distinctions;
  const barTitres=[12,9,6,3];
  let titres=0;
  for(let i=0;i<d.titres;i++) titres+=barTitres[Math.min(i,3)];
  titres=Math.min(30,titres);
  const distinctions=Math.min(25, d.allStar*2 + d.mvp*8 + Math.min(8,d.medailles||0));
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
  const f=FRANCHISES.find(x=>s.franchise&&x.id===s.franchise.id)||ECOLES.find(x=>s.franchise&&x.id===s.franchise.id)||LYCEES.find(x=>s.franchise&&x.id===s.franchise.id);
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
  for(const k of ['reputation','coteEquipe','risqueBlessure','alchimieEquipe']) s.meta[k]=num(s.meta[k],0,100,50);
  for(const k of ['titres','allStar','mvp','medailles']) s.distinctions[k]=num(s.distinctions[k],0,99,0);
  s.niveau=s.niveau==='fac'?'fac':'pro';
  if(s.niveau==='fac'&&s.fac&&typeof s.fac==='object'){ const q=s.fac; s.fac={annees:q.lycee?1:4,lycee:!!q.lycee,numero:num(q.numero,1,q.lycee?1:4,1),titres:num(q.titres,0,9,0),honneurs:num(q.honneurs,0,9,0),derniere:q.derniere&&typeof q.derniere==='object'?{reussis:num(q.derniere.reussis,0,20,0),total:num(q.derniere.total,1,20,1)}:null}; if(s.fac.numero>s.fac.annees) s.fac.numero=s.fac.annees; } else { s.fac=null; if(s.niveau==='fac') s.niveau='pro'; }
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
  if(Array.isArray(s.offresFac)) s.offresFac=s.offresFac.slice(0,6).filter(o=>o&&(o.k==='fac'&&ECOLES.some(x=>x.id===o.fid)||o.k==='chemin'&&CHEMINS_PREDRAFT[o.i])).map(o=>o.k==='fac'?{k:'fac',fid:o.fid,tier:num(o.tier,1,3,1)}:{k:'chemin',i:num(o.i,0,CHEMINS_PREDRAFT.length-1,1)}); else s.offresFac=null;
  if(Array.isArray(s.offres)) s.offres=s.offres.slice(0,6).filter(o=>o&&typeof o==='object'&&FRANCHISES.some(f=>f.id===o.fid)||(o&&marqueParId(o.mid)||o&&o.k==='libre')).map(o=>({k:String(o.k||'').slice(0,20),fid:FRANCHISES.some(f=>f.id===o.fid)?o.fid:s.franchise.id,mid:marqueParId(o.mid)?o.mid:'',tag:['contender','marche','reconstruction','maison','refus'].includes(o.tag)?o.tag:'maison',annees:num(o.annees,0,6,0),salaire:nf(o.salaire,0,999,0),valeur:nf(o.valeur,0,999,0),ntc:!!o.ntc,optJ:!!o.optJ})); else s.offres=null;
  if(s.ancienneFranchise&&typeof s.ancienneFranchise==='object') s.ancienneFranchise={ville:String(s.ancienneFranchise.ville||'').slice(0,30),nom:String(s.ancienneFranchise.nom||'').slice(0,30)}; else s.ancienneFranchise=null;
  if(Array.isArray(s.rivaux)) s.rivaux=s.rivaux.slice(0,12).filter(r=>r&&typeof r==='object').map(r=>({id:String(r.id||'').slice(0,20),type:String(r.type||'').slice(0,10),nom:String(r.nom||'').slice(0,40),court:String(r.court||'').slice(0,30),prenom:String(r.prenom||'').slice(0,20),poste:String(r.poste||'').slice(0,20),equipe:String(r.equipe||'').slice(0,40),detail:String(r.detail||'').slice(0,60),raison:['scoring','defense','playmaking','athletisme','basketIQ','elimine'].includes(r.raison)?r.raison:'',niveau:num(r.niveau,1,5,1),bilan:{v:num(r.bilan&&r.bilan.v,0,999,0),d:num(r.bilan&&r.bilan.d,0,999,0)}}));
  else s.rivaux=[];
  if(s.saisonSport&&typeof s.saisonSport==='object'){ const q=s.saisonSport; s.saisonSport={v:num(q.v,0,82,41),d:num(q.d,0,82,41),rang:num(q.rang,1,15,8),qualifie:num(q.rang,1,15,8)<=8}; } else s.saisonSport=null;
  if(s.playoffs&&typeof s.playoffs==='object'){ s.playoffs={tour:num(s.playoffs.tour,0,3,0),resultats:(Array.isArray(s.playoffs.resultats)?s.playoffs.resultats:[]).slice(0,4).filter(r=>r&&typeof r==='object')}; } else s.playoffs=null;
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

