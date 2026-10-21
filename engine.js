// Règles du jeu : état, tirage des choix, matchs, score, sauvegarde
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function rivaux(){ if(!etat.rivaux) etat.rivaux=[]; return etat.rivaux; }
function possede(type){ return rivaux().some(r=>r.type===type); }
function franchiseParId(id){ return FRANCHISES.find(f=>f.id===id); }
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
  return {id:'eq-'+rv.id,type:'equipe',nom:f.ville+' '+f.nom,court:'les '+f.nom,detail:rv.detail,equipe:f.ville+' '+f.nom,niveau:3,bilan:{v:0,d:0}};
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
  return {id:'pl-'+type,type,prenom,nom:complet,court:prenom,poste:type==='promo'?etat.poste:pick(Object.keys(POSITIONS)),equipe:equipe.ville+' '+equipe.nom,niveau:1,bilan:{v:0,d:0}};
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
    equipe:`Match contre ${r.nom} : ${r.detail}. La salle est électrique et chaque possession compte double.`,
    promo:`${r.nom} te fait face. Même promotion, même poste : tout le monde attend ce duel.`,
    veteran:`${r.nom}, la légende que tu cherches à détrôner, est en face de toi ce soir.`,
    ancien:`Ton ancien coéquipier ${r.nom} joue désormais pour ${r.equipe}. Il connaît tes habitudes, et toi les siennes.`,
    media:`${r.nom} t'a lancé des piques toute la semaine. Ce soir, la presse regarde qui aura le dernier mot.`
  };
  const choix=[
    o(E?'Imposer une défense agressive dès le coup d\'envoi':`Défendre sur ${n} à chaque possession`,'defense',-0.05,0.08,{reputation:4,defense:1},{reputation:-2,risqueBlessure:3},E?'Ta défense étouffe l\'adversaire et la salle s\'enflamme.':`${n} n'arrive plus à respirer.`,E?'L\'adversaire contourne ta défense et prend l\'avantage.':`${n} te prend de vitesse et la salle le sent.`),
    o(E?'Prendre les premiers tirs pour imposer ton rythme':`Répondre à ${n} panier pour panier`,'scoring',-0.1,0.1,{reputation:6,scoring:1},{reputation:-4},E?'Tu ouvres le score et le stade vibre.':`Tu réponds à chaque panier de ${n}.`,E?'Tu forces et les ratés s\'enchaînent.':`${n} te répond coup pour coup et reprend l'avantage.`),
    o('Faire circuler le ballon pour user la défense','playmaking',0.0,0.06,{alchimieEquipe:4,reputation:2},{alchimieEquipe:-2},'Le collectif prend le dessus.','Le jeu se grippe et l\'adversaire en profite.'),
    o(E?'Chambrer leurs supporters pour les déstabiliser':`Chambrer ${n} devant toute la salle`,'basketIQ',-0.15,0.1,{reputation:7},{reputation:-5,alchimieEquipe:-2},'La provocation fonctionne : ta réputation grimpe.','La provocation se retourne contre toi.'),
    o(E?'Garder la tête froide et suivre le plan':`Ignorer ${n} et jouer ton match`,'basketIQ',0.1,0.05,{basketIQ:1,alchimieEquipe:2},{reputation:-1},'Tu restes dans ton plan et tu le paies.','Trop de retenue : tu laisses l\'initiative à l\'adversaire.')
  ];
  return {id:'duel',titre:(E?'Classique — ':'Duel — ')+r.nom,contexte:contextes[r.type],choix:melangerOrdre(choix),rivalId:r.id};
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
    nom,poste,age:16,saison:0,franchise:null,draftPick:null,
    stats:{...POSITIONS[poste]},
    meta:{reputation:40,coteEquipe:50,risqueBlessure:0,alchimieEquipe:50},
    distinctions:{titres:0,allStar:0,mvp:0,medailles:0},
    malusAccumule:0, historiqueRecent:[], phase:'lycee', tourActuel:melangerOrdre(LYCEE_POOL),
    coteDraftBase:0
  };
  sauvegarder();
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
  etat.phase='combine';
  sauvegarder();
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
  etat.franchise=FRANCHISES[Math.floor(Math.random()*FRANCHISES.length)];
  etat.draftPick=pick;
  etat.rivaux=rivauxEquipes(etat.franchise.id).map(creerRivalEquipe);
  etat.saison=1;
  etat.phase='draftnight';
  sauvegarder();
}
function genererTour(){
  const recents=etat.scenariosRecents||[];
  const base=SCENARIOS.filter(s=>!s.intro);
  const specifiques=base.filter(s=>!s.generique&&s.cond(etat)&&!recents.includes(s.id));
  const generiques=base.filter(s=>s.generique&&s.cond(etat)&&!recents.includes(s.id));
  const dernier=recents[recents.length-1];
  const intros=etat.saison>=2?SCENARIOS.filter(s=>s.intro&&s.cond(etat)):[];
  const choisi=etat.saison===1?specifiques.find(s=>s.id==='rookie'):specifiques[Math.floor(Math.random()*specifiques.length)];
  const coupes=base.filter(s=>s.coupe&&s.cond(etat));
  const sc=coupes[0]||intros[0]||choisi||generiques[0]
    ||base.filter(s=>s.generique&&s.cond(etat)&&s.id!==dernier)[0]
    ||base.filter(s=>s.cond(etat)&&s.id!==dernier)[0]
    ||base.filter(s=>s.cond(etat))[0];
  let rival=null;
  if(sc.intro){ rival=creerRivalJoueur(sc.intro); rivaux().push(rival); }
  etat.scenariosRecents=[...recents,sc.id].slice(-2);
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
  etat.matchsTotal=(etat.scenarioActuel&&etat.scenarioActuel.coupe?3:2+(Math.random()<0.34?1:0))+(rivaux().length?1:0);
  etat.matchsResultats=[];
  etat.bonusSaison=0;
  etat.matchActuel=genererMatch();
  etat.phase='match';
  sauvegarder();
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
  etat.situationsRecentes=[...recents,s.id].slice(-5);
  return {id:s.id,titre:s.titre,contexte:s.contexte,choix:melangerOrdre(s.choix)};
}
function resoudreMatch(opt,geste){
  const bonusGeste=geste&&Number.isFinite(geste.bonus)?clamp(geste.bonus,-0.1,0.12):0;
  const enPlayoffs=etat.phase==='playoffs';
  const p=clamp(clamp(etat.stats[opt.stat]/100+opt.mod,0.12,0.9)+bonusGeste+(enPlayoffs?bonusPlayoffs():0),0.05,0.95);
  const reussi=Math.random()<p;
  const rv=etat.matchActuel.rivalId?rivaux().find(r=>r.id===etat.matchActuel.rivalId):null;
  const f=rv?1+0.2*rv.niveau:1;
  appliquerEffets(scaleEffets(reussi?opt.gain:opt.perte,f));
  const enjeu=rv?opt.enjeu*(1+0.1*rv.niveau):opt.enjeu;
  etat.bonusSaison+=reussi?enjeu:-enjeu/2;
  const entree={titre:etat.matchActuel.titre, texte:opt.texte, reussi, narration:reussi?opt.ok:opt.ko, stat:opt.stat, p:Math.round(p*100), geste:(geste&&geste.label)||null, tableau:etat.matchActuel.tableau||null};
  if(rv){
    if(reussi) rv.bilan.v++; else rv.bilan.d++;
    if((rv.bilan.v+rv.bilan.d)%2===0&&rv.niveau<5) rv.niveau++;
    etat.dernierRivalId=rv.id;
    entree.rival={nom:rv.nom,type:rv.type,niveau:rv.niveau,v:rv.bilan.v,d:rv.bilan.d};
  }
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
const TOURS_PLAYOFFS=['Premier tour','Demi-finales de conférence','Finale de conférence','Finales'];
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
  if(Math.random()<Math.max(0,(moyenne-58)/80+bonus/2)){ etat.distinctions.allStar++; evenements.push('Sélection All-Star !'); }
  if(moyenne>68 && Math.random()<Math.max(0,0.01+(moyenne-68)/120+bonus/3)){ etat.distinctions.mvp++; evenements.push('Élu MVP de la saison !'); }
  if(etat.meta.risqueBlessure>60 && Math.random()<0.18){
    etat.malusAccumule+=3;
    etat.meta.risqueBlessure=Math.max(0,etat.meta.risqueBlessure-20);
    evenements.push('Blessure — saison écourtée (−3 au score final)');
  }
  let medaille=null;
  if(etat.scenarioActuel&&etat.scenarioActuel.coupe){
    const [poule,demi,finale]=etat.matchsResultats.slice(0,3).map(m=>m.reussi);
    const nomC=etat.scenarioActuel.coupe.nom, avec=nomPays(etat)==='ta sélection'?'':' avec '+etat.pays;
    if(poule&&demi&&finale){ medaille='or'; etat.distinctions.medailles=(etat.distinctions.medailles||0)+2; evenements.push(`Médaille d'or — ${nomC}${avec} !`); }
    else if(poule&&demi){ medaille='argent'; etat.distinctions.medailles=(etat.distinctions.medailles||0)+1; evenements.push(`Médaille d'argent — ${nomC}${avec}`); }
    else if(demi||(poule&&Math.random()<0.4)){ medaille='bronze'; etat.distinctions.medailles=(etat.distinctions.medailles||0)+1; evenements.push(`Médaille de bronze — ${nomC}${avec}`); }
  }
  const reussis=etat.matchsResultats.filter(m=>m.reussi).length;
  const s=genererSaisonRegliere(reussis,etat.matchsResultats.length,moyenne);
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
    etat.situationsRecentes=[...recents,s.id].slice(-5);
    m={id:s.id,titre:s.titre,contexte:s.contexte,choix:melangerOrdre(s.choix)};
  }
  const enjeu=tour===3?'Gagne et tu es champion.':'Gagne et tu passes au tour suivant.';
  m.contexte=`Playoffs — ${TOURS_PLAYOFFS[tour]}. Match décisif de la série. ${enjeu} Perds et la saison s'arrête. ${m.contexte}`;
  m.titre=`${TOURS_PLAYOFFS[tour]} · ${m.titre}`;
  m.playoff=true; m.tour=tour;
  m.tableau=genererTableau(m);
  return m;
}
function resoudrePlayoffs(entree,reussi){
  const t=etat.playoffs.tour;
  entree.playoff=true; entree.tour=t;
  entree.issue={tour:t,avance:reussi,champion:reussi&&t===3,nom:TOURS_PLAYOFFS[t],suivant:t<3?TOURS_PLAYOFFS[t+1]:null};
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
  if(stade===5){ etat.distinctions.titres++; evenements.unshift('Titre remporté !'); }
  else if(stade===4) evenements.unshift('Finaliste — battu en finale');
  const ss=etat.saisonSport||{v:41,d:41,rang:8};
  const saisonSportive={v:ss.v,d:ss.d,rang:ss.rang,stade};
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
  etat.dernierResultat={
    texteChoix:etat.texteChoixSaison, axe:etat.axeChoisiSaison, deltas, evenements,
    matchs:tous, saison:saisonSportive
  };
  if(typeof suivre==='function'){
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
  return t>=76?['LÉGENDAIRE','#F5C542','Top 10 %']:t>=62?['ÉPIQUE','#D4F04D','Top 30 %']:t>=46?['RARE','#4C6FFF','Top 65 %']:['COMMUN','#9AA7BD','Parcours classique'];
}
function lireHof(){ try{ const v=JSON.parse(localStorage.getItem(HOF_KEY)||'[]'); return Array.isArray(v)?v:[]; }catch(err){ return []; } }
function enregistrerCarriere(){
  if(etat.hofEnregistre) return;
  etat.hofEnregistre=true;
  try{
    const sc=calculerScore();
    if(typeof suivre==='function') suivre('score',sc.total);
    const liste=lireHof();
    liste.push({nom:etat.nom,numero:etat.numero,poste:etat.poste,score:sc.total,saisons:etat.saison-1,titres:etat.distinctions.titres,equipe:etat.franchise.ville+' '+etat.franchise.nom});
    liste.sort((a,b)=>b.score-a.score);
    localStorage.setItem(HOF_KEY,JSON.stringify(liste.slice(0,5)));
  }catch(err){}
}
function continuerApresResultat(){
  etat.age++; etat.saison++;
  const chanceRetraite = etat.age>=30 ? (etat.age-30)*0.09 : 0;
  if(etat.age>=36 || Math.random()<chanceRetraite){ etat.phase='retraite'; enregistrerCarriere(); }
  else{ etat.phase='jeu'; genererTour(); }
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
  if(s.phase==='draftnight') return !!s.franchise&&typeof s.draftPick==='number';
  return false;
}
// Une sauvegarde vient du navigateur : elle peut être modifiée ou venir d'un autre site de la même origine.
// On la reconstruit donc avec des valeurs contrôlées avant de l'utiliser.
function assainir(s){
  const num=(v,mn,mx,d)=>{ v=Number(v); return Number.isFinite(v)?Math.max(mn,Math.min(mx,Math.round(v))):d; };
  const f=FRANCHISES.find(x=>s.franchise&&x.id===s.franchise.id);
  if(s.franchise&&!f) return false;
  if(f) s.franchise=f;
  s.nom=String(s.nom||'JOUEUR').replace(/[<>&"'`]/g,'').slice(0,24)||'JOUEUR';
  if(!POSITIONS[s.poste]) s.poste='Ailier';
  if(s.pays!==undefined&&!PAYS.some(p=>p[0]===s.pays)) s.pays='Autre';
  if(s.gabarit!==undefined&&!GABARITS[s.gabarit]) s.gabarit='Équilibré';
  if(s.numero!==undefined) s.numero=num(s.numero,0,99,23);
  s.age=num(s.age,14,60,17); s.saison=num(s.saison,0,60,1);
  for(const k of Object.keys(POSITIONS.Ailier)) s.stats[k]=num(s.stats[k],0,99,50);
  for(const k of ['reputation','coteEquipe','risqueBlessure','alchimieEquipe']) s.meta[k]=num(s.meta[k],0,100,50);
  for(const k of ['titres','allStar','mvp','medailles']) s.distinctions[k]=num(s.distinctions[k],0,99,0);
  s.malusAccumule=num(s.malusAccumule,0,999,0);
  if(Array.isArray(s.rivaux)) s.rivaux=s.rivaux.slice(0,12).filter(r=>r&&typeof r==='object').map(r=>({id:String(r.id||'').slice(0,20),type:String(r.type||'').slice(0,10),nom:String(r.nom||'').slice(0,40),court:String(r.court||'').slice(0,30),prenom:String(r.prenom||'').slice(0,20),poste:String(r.poste||'').slice(0,20),equipe:String(r.equipe||'').slice(0,40),detail:String(r.detail||'').slice(0,60),niveau:num(r.niveau,1,5,1),bilan:{v:num(r.bilan&&r.bilan.v,0,999,0),d:num(r.bilan&&r.bilan.d,0,999,0)}}));
  else s.rivaux=[];
  if(s.saisonSport&&typeof s.saisonSport==='object'){ const q=s.saisonSport; s.saisonSport={v:num(q.v,0,82,41),d:num(q.d,0,82,41),rang:num(q.rang,1,15,8),qualifie:num(q.rang,1,15,8)<=8}; } else s.saisonSport=null;
  if(s.playoffs&&typeof s.playoffs==='object'){ s.playoffs={tour:num(s.playoffs.tour,0,3,0),resultats:(Array.isArray(s.playoffs.resultats)?s.playoffs.resultats:[]).slice(0,4).filter(r=>r&&typeof r==='object')}; } else s.playoffs=null;
  if(s.matchActuel){ s.matchActuel.playoff=!!s.matchActuel.playoff; s.matchActuel.tour=num(s.matchActuel.tour,0,3,0); }
  if(!Array.isArray(s.evenementsSaison)) s.evenementsSaison=null; else s.evenementsSaison=s.evenementsSaison.slice(0,8).map(x=>String(x).slice(0,120));
  const t=s.matchActuel&&s.matchActuel.tableau;
  if(t&&typeof t==='object'){
    const hex=v=>/^#[0-9A-Fa-f]{6}$/.test(v)?v:'#4C6FFF', ab=v=>String(v||'').replace(/[^A-Z]/g,'').slice(0,4)||'EQP';
    s.matchActuel.tableau={na:ab(t.na),nb:ab(t.nb),ca:hex(t.ca),cb:hex(t.cb),q:num(t.q,1,5,4),t:/^\d{1,2}:\d{2}$/.test(String(t.t))?String(t.t):'0:30',a:num(t.a,0,250,80),b:num(t.b,0,250,80),dom:!!t.dom};
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

