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
function escapeHtml(str){ const d=document.createElement('div'); d.textContent=str; return d.innerHTML; }
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
    distinctions:{titres:0,allStar:0,mvp:0},
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
  const sc=intros[0]||choisi||generiques[0]
    ||base.filter(s=>s.generique&&s.cond(etat)&&s.id!==dernier)[0]
    ||base.filter(s=>s.cond(etat)&&s.id!==dernier)[0]
    ||base.filter(s=>s.cond(etat))[0];
  let rival=null;
  if(sc.intro){ rival=creerRivalJoueur(sc.intro); rivaux().push(rival); }
  etat.scenariosRecents=[...recents,sc.id].slice(-2);
  etat.scenarioActuel={id:sc.id,question:sc.question,contexte:sc.contexte(etat,rival),matchsPrefs:SCENARIO_MATCHS[sc.id]||[],rivalId:rival?rival.id:null};
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
  etat.matchsTotal=2+(Math.random()<0.34?1:0)+(rivaux().length?1:0);
  etat.matchsResultats=[];
  etat.bonusSaison=0;
  etat.matchActuel=genererMatch();
  etat.phase='match';
  sauvegarder();
}
function genererMatch(){
  if(rivaux().length&&etat.matchsResultats&&etat.matchsResultats.length===etat.matchsTotal-1) return genererDuel();
  const recents=etat.situationsRecentes||[];
  let dispo=MATCH_SITUATIONS.filter(s=>!recents.includes(s.id));
  if(!dispo.length) dispo=MATCH_SITUATIONS;
  const prefs=(etat.scenarioActuel&&etat.scenarioActuel.matchsPrefs)||[];
  const pref=dispo.filter(s=>prefs.includes(s.id));
  const premier=!etat.matchsResultats||etat.matchsResultats.length===0;
  const pool=(pref.length&&(premier||Math.random()<0.5))?pref:dispo;
  const s=pool[Math.floor(Math.random()*pool.length)];
  etat.situationsRecentes=[...recents,s.id].slice(-5);
  return {id:s.id,titre:s.titre,contexte:s.contexte,choix:melangerOrdre(s.choix)};
}
function resoudreMatch(opt){
  const p=clamp(etat.stats[opt.stat]/100+opt.mod,0.12,0.9);
  const reussi=Math.random()<p;
  const rv=etat.matchActuel.rivalId?rivaux().find(r=>r.id===etat.matchActuel.rivalId):null;
  const f=rv?1+0.2*rv.niveau:1;
  appliquerEffets(scaleEffets(reussi?opt.gain:opt.perte,f));
  const enjeu=rv?opt.enjeu*(1+0.1*rv.niveau):opt.enjeu;
  etat.bonusSaison+=reussi?enjeu:-enjeu/2;
  const entree={titre:etat.matchActuel.titre, texte:opt.texte, reussi, narration:reussi?opt.ok:opt.ko};
  if(rv){
    if(reussi) rv.bilan.v++; else rv.bilan.d++;
    if((rv.bilan.v+rv.bilan.d)%2===0&&rv.niveau<5) rv.niveau++;
    etat.dernierRivalId=rv.id;
    entree.rival={nom:rv.nom,type:rv.type,niveau:rv.niveau,v:rv.bilan.v,d:rv.bilan.d};
  }
  etat.matchsResultats.push(entree);

  if(etat.matchsResultats.length<etat.matchsTotal){
    etat.matchActuel=genererMatch();
    sauvegarder();
    return;
  }

  const bonus=etat.bonusSaison*0.6;
  const evenements=[];
  const moyenne=moyenneStats();
  if(Math.random()<Math.max(0,(moyenne-70)/100+bonus/2)){ etat.distinctions.allStar++; evenements.push('Sélection All-Star !'); }
  if(moyenne>88 && Math.random()<Math.max(0,0.06+bonus/2)){ etat.distinctions.mvp++; evenements.push('Élu MVP de la saison !'); }
  if(Math.random()<Math.max(0,0.10+etat.meta.alchimieEquipe/1000+bonus)){ etat.distinctions.titres++; evenements.push('Titre remporté !'); }
  if(etat.meta.risqueBlessure>60 && Math.random()<0.18){
    etat.malusAccumule+=3;
    etat.meta.risqueBlessure=Math.max(0,etat.meta.risqueBlessure-20);
    evenements.push('Blessure — saison écourtée (−3 au score final)');
  }

  const reussis=etat.matchsResultats.filter(m=>m.reussi).length;
  etat.bilan={
    titre:evenements.some(e=>e.startsWith('Titre')),
    allStar:evenements.some(e=>e.startsWith('Sélection')),
    mvp:evenements.some(e=>e.startsWith('Élu MVP')),
    blessure:evenements.some(e=>e.startsWith('Blessure')),
    reussis, rates:etat.matchsResultats.length-reussis, total:etat.matchsResultats.length
  };
  const avant=etat.statsAvantSaison||etat.stats;
  const deltas={};
  for(const k in avant){ if(etat.stats[k]!==avant[k]) deltas[k]=etat.stats[k]-avant[k]; }
  etat.dernierResultat={
    texteChoix:etat.texteChoixSaison, axe:etat.axeChoisiSaison, deltas, evenements,
    matchs:etat.matchsResultats
  };
  etat.matchActuel=null;
  etat.phase='resultat';
  sauvegarder();
}
const HOF_KEY='five-ways-hof-v1';
function rareteScore(t){
  return t>=56?['LÉGENDAIRE','#F5C542','Top 5 %']:t>=53?['ÉPIQUE','#D4F04D','Top 25 %']:t>=46?['RARE','#4C6FFF','Top 75 %']:['COMMUN','#9AA7BD','Parcours classique'];
}
function lireHof(){ try{ const v=JSON.parse(localStorage.getItem(HOF_KEY)||'[]'); return Array.isArray(v)?v:[]; }catch(err){ return []; } }
function enregistrerCarriere(){
  if(etat.hofEnregistre) return;
  etat.hofEnregistre=true;
  try{
    const sc=calculerScore();
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
  const distinctions=Math.min(25, d.allStar*2 + d.mvp*8);
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
  if(s.phase==='resultat') return !!s.dernierResultat&&!!s.franchise;
  if(s.phase==='retraite') return !!s.franchise;
  if(s.phase==='lycee') return Array.isArray(s.tourActuel);
  if(s.phase==='chemin'||s.phase==='combine') return true;
  if(s.phase==='draftnight') return !!s.franchise&&typeof s.draftPick==='number';
  return false;
}
function charger(){
  try{
    const brut=localStorage.getItem(SAVE_KEY);
    if(brut){ const s=JSON.parse(brut); etat=sauvegardeValide(s)?s:null; if(!etat) localStorage.removeItem(SAVE_KEY); }
  }catch(e){ etat=null; }
}
function reinitialiser(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} etat=null; accueilVu=false; render(); }

