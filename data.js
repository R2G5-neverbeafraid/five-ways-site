// Anti-clickjacking : refuse d'être affiché dans une iframe d'un autre site.
if(window.top!==window.self){ try{ document.documentElement.style.display='none'; window.top.location=window.self.location; }catch(err){} }
// Contenu du jeu : franchises, postes, choix, scénarios, situations de match, rivalités
const FRANCHISES=[
  {id:'bos',ville:'Boston',nom:'Harborlights',couleur:'#007A33',couleur2:'#BA9653'},
  {id:'bkn',ville:'Brooklyn',nom:'Voltage',couleur:'#6B7280',couleur2:'#0B0B0B'},
  {id:'nyk',ville:__("New York"),nom:'Empire',couleur:'#006BB6',couleur2:'#F58426'},
  {id:'phi',ville:__('Philadelphie'),nom:'Liberty',couleur:'#0B4EA2',couleur2:'#ED174C'},
  {id:'tor',ville:'Toronto',nom:'Skyline',couleur:'#BA0C2F',couleur2:'#A1A1A4'},
  {id:'chi',ville:'Chicago',nom:'Windstorm',couleur:'#CE1141',couleur2:'#0B0B0B'},
  {id:'cle',ville:'Cleveland',nom:'Steel',couleur:'#860038',couleur2:'#FDBB30'},
  {id:'det',ville:'Detroit',nom:'Motors',couleur:'#1D42BA',couleur2:'#C8102E'},
  {id:'ind',ville:'Indiana',nom:'Crossroads',couleur:'#002D62',couleur2:'#FDBB30'},
  {id:'mil',ville:'Milwaukee',nom:'Antlers',couleur:'#00471B',couleur2:'#EEE1C6'},
  {id:'atl',ville:'Atlanta',nom:'Peachtree',couleur:'#C8102E',couleur2:'#F4A07A'},
  {id:'cha',ville:'Charlotte',nom:'Current',couleur:'#00788C',couleur2:'#1D1160'},
  {id:'mia',ville:'Miami',nom:'Blaze',couleur:'#98002E',couleur2:'#0B0B0B'},
  {id:'orl',ville:'Orlando',nom:'Wonders',couleur:'#0077C0',couleur2:'#C4CED4'},
  {id:'was',ville:'Washington',nom:'Monuments',couleur:'#002B5C',couleur2:'#E31837'},
  {id:'den',ville:'Denver',nom:'Peaks',couleur:'#0E2240',couleur2:'#FEC524'},
  {id:'min',ville:'Minnesota',nom:'Northlights',couleur:'#0C2340',couleur2:'#78BE20'},
  {id:'okc',ville:__("Oklahoma City"),nom:'Twisters',couleur:'#007AC1',couleur2:'#EF3B24'},
  {id:'por',ville:'Portland',nom:'Pioneers',couleur:'#E03A3E',couleur2:'#0B0B0B'},
  {id:'uta',ville:'Utah',nom:'Canyons',couleur:'#3E2680',couleur2:'#B87333'},
  {id:'gsw',ville:__("San Francisco"),nom:'Comets',couleur:'#1D428A',couleur2:'#FFC72C'},
  {id:'lac',ville:__("Los Angeles"),nom:'Coastliners',couleur:'#1B5FAE',couleur2:'#C8102E'},
  {id:'lal',ville:__("Los Angeles"),nom:'Starlight',couleur:'#552583',couleur2:'#FDB927'},
  {id:'phx',ville:'Phoenix',nom:'Solstice',couleur:'#E56020',couleur2:'#1D1160'},
  {id:'sac',ville:'Sacramento',nom:'Capitol',couleur:'#5A2D81',couleur2:'#63727A'},
  {id:'dal',ville:'Dallas',nom:'Rustlers',couleur:'#00538C',couleur2:'#B8C4CA'},
  {id:'hou',ville:'Houston',nom:'Orbit',couleur:'#CE1126',couleur2:'#C4CED4'},
  {id:'mem',ville:'Memphis',nom:'Rhythm',couleur:'#5D76A9',couleur2:'#F5B112'},
  {id:'nop',ville:__('Nouvelle-Orléans'),nom:'Krewe',couleur:'#0A1E3C',couleur2:'#B4975A'},
  {id:'sas',ville:__("San Antonio"),nom:'Vaqueros',couleur:'#C4CED4',couleur2:'#0B0B0B'}
];
// Couleurs de maillot pour un match : domicile = couleur principale ; à l'extérieur = couleur 2,
// puis couleur principale, puis blanc si l'adversaire est trop proche.
function _rgb(h){ return [1,3,5].map(i=>parseInt(h.slice(i,i+2),16)); }
function distanceCouleur(a,b){ const x=_rgb(a),y=_rgb(b); const rm=(x[0]+y[0])/2; const dr=x[0]-y[0],dg=x[1]-y[1],db=x[2]-y[2]; return Math.sqrt((2+rm/256)*dr*dr+4*dg*dg+(2+(255-rm)/256)*db*db); }
const SEUIL_COULEUR=140;
function couleursMatch(dom,ext){
  const cd=dom.couleur;
  let ce=ext.couleur2;
  if(distanceCouleur(ce,cd)<SEUIL_COULEUR) ce=ext.couleur;
  if(distanceCouleur(ce,cd)<SEUIL_COULEUR) ce='#F4F4F4';
  return {dom:cd,ext:ce};
}
const POSITIONS={
  'Meneur':{scoring:50,playmaking:70,defense:48,athletisme:55,basketIQ:65},
  'Arrière':{scoring:68,playmaking:52,defense:50,athletisme:62,basketIQ:52},
  'Ailier':{scoring:58,playmaking:55,defense:58,athletisme:60,basketIQ:55},
  'Ailier fort':{scoring:52,playmaking:42,defense:64,athletisme:62,basketIQ:50},
  'Pivot':{scoring:48,playmaking:38,defense:68,athletisme:58,basketIQ:48}
};
const POOL=[
  {axe:'Performance',texte:__("Retravailler ton tir tout l'été"),effets:{scoring:4,risqueBlessure:2}},
  {axe:'Performance',texte:__("Ajouter des séances de vision de jeu"),effets:{playmaking:4}},
  {axe:'Performance',texte:__("Renforcement physique intensif"),effets:{athletisme:5,risqueBlessure:5}},
  {axe:'Performance',texte:__("Travailler ton jeu de dos au panier avec un ancien pivot"),effets:{scoring:3,defense:1}},
  {axe:'Performance',texte:__("Filmer et analyser chaque possession avec ton staff"),effets:{basketIQ:4}},
  {axe:'Performance',texte:__("Changer de préparateur physique pour une méthode plus intense"),effets:{athletisme:5,risqueBlessure:6}},
  {axe:'Performance',texte:__("Ajouter le tir à 3 points à ton arsenal"),effets:{scoring:5,risqueBlessure:1}},
  {axe:'Performance',texte:__("Prioriser le repos actif plutôt que l'intensité cet été"),effets:{athletisme:2,risqueBlessure:-4}},
  {axe:'Performance',texte:__("Travailler spécifiquement ta main faible"),effets:{playmaking:2,scoring:2}},
  {axe:'Performance',texte:__("Jouer en ligue d'été contre des pros confirmés"),ageMax:24,effets:{scoring:3,reputation:2,risqueBlessure:3}},
  {axe:'Performance',texte:__("Te concentrer sur la lecture défensive plutôt que l'attaque"),effets:{defense:4,basketIQ:2}},
  {axe:'Carrière / Contrat',texte:__("Pousser pour une prolongation immédiate"),effets:{coteEquipe:6}},
  {axe:'Carrière / Contrat',texte:__("Explorer discrètement le marché"),effets:{reputation:3,coteEquipe:-4}},
  {axe:'Carrière / Contrat',texte:__("Accepter un rôle réduit pour l'équipe"),effets:{alchimieEquipe:6,reputation:-2}},
  {axe:'Carrière / Contrat',texte:__("Accepter un trade vers une équipe qui reconstruit"),effets:{reputation:2,coteEquipe:-5}},
  {axe:'Carrière / Contrat',texte:__("Négocier une clause de non-échange"),effets:{coteEquipe:5}},
  {axe:'Carrière / Contrat',texte:__("Prendre un agent plus agressif"),effets:{reputation:3,alchimieEquipe:-2}},
  {axe:'Carrière / Contrat',texte:__("Accepter de venir du banc pour rejoindre un contender"),effets:{coteEquipe:5,reputation:-3}},
  {axe:'Carrière / Contrat',texte:__("Refuser une prolongation pour viser la free agency"),effets:{reputation:4,coteEquipe:-5}},
  {axe:'Carrière / Contrat',texte:__("Devenir le capitaine officieux du vestiaire"),ageMin:27,effets:{alchimieEquipe:5,basketIQ:2}},
  {axe:'Carrière / Contrat',texte:__("Demander à peser sur les décisions de recrutement"),ageMin:29,effets:{coteEquipe:3,reputation:3}},
  {axe:'Carrière / Contrat',texte:__("Accepter un contrat plus court pour garder de la flexibilité"),ageMin:31,effets:{reputation:2}},
  {axe:'Image / Marque',texte:__("Signer avec un petit équipementier"),effets:{reputation:5}},
  {axe:'Image / Marque',texte:__("Lancer ta propre chaîne de contenu"),effets:{reputation:3,coteEquipe:-1}},
  {axe:'Image / Marque',texte:__("Rester discret, éviter les médias"),effets:{alchimieEquipe:2}},
  {axe:'Image / Marque',texte:__("Créer une fondation caritative dans ta ville d'origine"),ageMin:27,effets:{reputation:6,alchimieEquipe:2}},
  {axe:'Image / Marque',texte:__("Tourner une pub nationale pour une grande marque"),effets:{reputation:4,coteEquipe:2}},
  {axe:'Image / Marque',texte:__("Répondre à un rival sur les réseaux sociaux"),effets:{reputation:4,alchimieEquipe:-2}},
  {axe:'Image / Marque',texte:__("Investir dans une startup en dehors du basket"),effets:{reputation:2}},
  {axe:'Image / Marque',texte:__("Participer à un documentaire sur ta saison"),effets:{reputation:6,risqueBlessure:2}},
  {axe:'Image / Marque',texte:__("Éviter toute polémique, communication minimale"),effets:{alchimieEquipe:2,reputation:-2}},
  {axe:'Image / Marque',texte:__("Lancer ta propre marque de vêtements"),ageMin:28,effets:{reputation:3}},
  {axe:'Vie perso',texte:__("Rentrer aider ta famille cet été"),effets:{athletisme:-2,alchimieEquipe:2}},
  {axe:'Vie perso',texte:__("Devenir mentor d'un jeune coéquipier"),ageMin:27,effets:{alchimieEquipe:5,basketIQ:2}},
  {axe:'Vie perso',texte:__("Te consacrer à un projet perso hors basket"),effets:{scoring:-2,alchimieEquipe:3}},
  {axe:'Vie perso',texte:__("Fonder une famille cette intersaison"),ageMin:25,effets:{alchimieEquipe:4,scoring:-2}},
  {axe:'Vie perso',texte:__("Reprendre des études à distance en parallèle"),ageMax:24,effets:{basketIQ:2,athletisme:-1}},
  {axe:'Vie perso',texte:__("Installer toute ta famille dans ta ville d'équipe"),ageMin:26,effets:{alchimieEquipe:4}},
  {axe:'Vie perso',texte:__("Prendre de la distance avec un ami d'enfance toxique"),ageMax:26,effets:{basketIQ:2}},
  {axe:'Vie perso',texte:__("Partir en voyage complètement déconnecté du basket"),effets:{alchimieEquipe:3,scoring:-2}},
  {axe:'Vie perso',texte:__("Consacrer du temps au mentorat dans ton ancien quartier"),ageMin:29,effets:{reputation:2,alchimieEquipe:2}},
  {axe:'Vie perso',texte:__("Accompagner un proche traversant une période difficile"),effets:{athletisme:-2,alchimieEquipe:3}},
  {axe:'Risque / Legacy',texte:__("Demander publiquement un trade"),effets:{reputation:6,coteEquipe:-8,risqueBlessure:1}},
  {axe:'Risque / Legacy',texte:__("Jouer blessé pour un match clé"),effets:{reputation:4,risqueBlessure:10}},
  {axe:'Risque / Legacy',texte:__("Viser un record personnel cette saison"),effets:{scoring:3,risqueBlessure:4}},
  {axe:'Risque / Legacy',texte:__("Garantir publiquement un titre cette saison"),effets:{reputation:6,risqueBlessure:3}},
  {axe:'Risque / Legacy',texte:__("Refuser de sortir malgré la fatigue en fin de match serré"),effets:{reputation:4,risqueBlessure:8}},
  {axe:'Risque / Legacy',texte:__("Baisser ton salaire pour garder le noyau de l'équipe"),ageMin:31,effets:{alchimieEquipe:7,reputation:3}},
  {axe:'Risque / Legacy',texte:__("Contester publiquement la stratégie du coach"),ageMax:29,effets:{reputation:4,alchimieEquipe:-5}},
  {axe:'Risque / Legacy',texte:__("Revenir plus tôt que prévu de blessure pour les playoffs"),effets:{reputation:4,risqueBlessure:9}},
  {axe:'Risque / Legacy',texte:__("Tenter un enchaînement spectaculaire pour devenir viral"),ageMax:25,effets:{reputation:5,risqueBlessure:2}},
  {axe:'Risque / Legacy',texte:__("Annoncer vouloir battre un record historique de la ligue"),ageMin:29,effets:{scoring:2,risqueBlessure:4}},
  {axe:'Risque / Legacy',texte:__("Prendre la défense publique d'un coéquipier controversé"),effets:{alchimieEquipe:4,reputation:-2}}
];
const LYCEE_POOL=[
  {axe:'Performance',texte:__("Enchaîner un tournoi AAU supplémentaire"),effets:{scoring:2,athletisme:2,risqueBlessure:3}},
  {axe:'Carrière / Contrat',texte:__("Visiter en priorité les campus offrant le plus de temps de jeu"),effets:{coteEquipe:3}},
  {axe:'Image / Marque',texte:__("Poster tes highlights toi-même plutôt que d'attendre les recruteurs"),effets:{reputation:3}},
  {axe:'Vie perso',texte:__("Privilégier une université proche de chez toi"),effets:{alchimieEquipe:3}},
  {axe:'Risque / Legacy',texte:__("Annoncer publiquement viser une seule année universitaire"),effets:{reputation:4,coteEquipe:-1}}
];
const CHEMINS_PREDRAFT=[
  {texte:__("NCAA — une seule année (one-and-done)"),ageAjout:1,coteDraftMod:2,effets:{scoring:2}},
  {texte:__("NCAA — plusieurs années"),ageAjout:3,coteDraftMod:5,effets:{basketIQ:3,defense:2}},
  {texte:__("G-League Ignite (voie professionnelle directe)"),ageAjout:1,coteDraftMod:0,effets:{scoring:2,athletisme:1}},
  {texte:__("Jouer un an en Europe"),ageAjout:1,coteDraftMod:1,effets:{basketIQ:2,defense:1}},
  {texte:__("Te déclarer directement pour la Draft"),ageAjout:0,coteDraftMod:-4,effets:{}}
];
const COMBINE_CHOIX=[
  {texte:__("Jouer la sécurité, miser sur la régularité"),coteDraftMod:2,effets:{}},
  {texte:__("Prendre des risques sur les tests athlétiques"),coteDraftMod:4,effets:{risqueBlessure:4}},
  {texte:__("Privilégier les entretiens avec les franchises"),coteDraftMod:3,effets:{reputation:2}},
  {texte:__("Privilégier les drills sur le terrain"),coteDraftMod:2,effets:{scoring:1}},
  {texte:__("Rester toi-même, sans stratégie particulière"),coteDraftMod:0,effets:{}}
];
const o=(texte,stat,mod,enjeu,gain,perte,ok,ko)=>({texte,stat,mod,enjeu,gain,perte,ok,ko});
const MATCH_SITUATIONS=[
  {id:'buzzer',titre:__("Dernières secondes"),contexte:__("Égalité, 6 secondes au chrono. Le coach te remet le ballon pour le dernier tir."),choix:[
    o(__("Tirer à 3 points au buzzer"),'scoring',-0.15,0.12,{reputation:6},{reputation:-3},__("Le ballon rentre, la salle explose."),__("Le tir touche le cercle. Défaite d'un point.")),
    o(__("Attaquer le cercle en pénétration"),'athletisme',-0.05,0.08,{reputation:4,scoring:1},{risqueBlessure:3},__("Tu passes la défense et finis en force."),__("Le contre est sifflé sans faute. Le match t'échappe.")),
    o(__("Passer à un coéquipier démarqué"),'playmaking',0.05,0.06,{alchimieEquipe:5},{alchimieEquipe:-2},__("Ton coéquipier reçoit seul et marque."),__("La passe est interceptée à quelques secondes de la fin.")),
    o(__("Demander un temps mort pour dessiner le tir"),'basketIQ',0.1,0.04,{basketIQ:1,alchimieEquipe:2},{reputation:-1},__("Le système fonctionne à la perfection."),__("Le temps mort laisse la défense se replacer.")),
    o(__("Provoquer la faute pour aller aux lancers"),'basketIQ',-0.05,0.07,{reputation:3},{reputation:-2},__("La faute est sifflée, tu fais le sans-faute."),__("Pas de faute sifflée, le tir est forcé et raté."))
  ]},
  {id:'blessure',titre:__("Blessure en plein match"),contexte:__("Tu retombes mal sur la cheville au 3e quart-temps. La douleur est vive, mais le match compte beaucoup."),choix:[
    o(__("Rester sur le terrain malgré la douleur"),'athletisme',-0.1,0.08,{reputation:4},{risqueBlessure:12,athletisme:-2},__("Tu finis le match et ton équipe te salue."),__("La cheville lâche. Retour express au vestiaire.")),
    o(__("Sortir immédiatement te faire examiner"),'basketIQ',0.3,0.02,{risqueBlessure:-3,alchimieEquipe:2},{reputation:-1},__("Rien de grave, tu reviens bientôt."),__("Tu rates la fin du match mais tu évites le pire.")),
    o(__("Serrer les dents et finir le quart-temps"),'athletisme',-0.05,0.05,{reputation:2},{risqueBlessure:6},__("Tu tiens bon jusqu'à la pause."),__("La douleur te force à sortir plus tôt que prévu.")),
    o(__("Demander un strap et revenir au 4e quart"),'basketIQ',0.0,0.05,{reputation:2,alchimieEquipe:1},{risqueBlessure:5},__("Le strap tient, tu reviens plus fort."),__("Le strap ne suffit pas, tu quittes le match.")),
    o(__("Laisser le coach décider pour toi"),'basketIQ',0.1,0.03,{alchimieEquipe:3},{alchimieEquipe:-1},__("Le coach fait le bon choix pour toi."),__("Le coach te garde trop longtemps sur le terrain."))
  ]},
  {id:'rival',titre:__("Un rival te provoque"),contexte:__("Ton rival direct te chambre devant tout le stade. Le match est tendu et tout le monde regarde."),choix:[
    o(__("Répondre sur le terrain en 1 contre 1"),'scoring',-0.05,0.07,{reputation:5},{reputation:-3},__("Tu le prends de vitesse et tu marques sous ses yeux."),__("Il te contre et la salle se retourne contre toi.")),
    o(__("Ignorer et rester concentré"),'basketIQ',0.1,0.04,{basketIQ:1,alchimieEquipe:2},{reputation:-1},__("Tu gardes la tête froide et ton équipe suit."),__("Tu passes pour quelqu'un qui se laisse marcher dessus.")),
    o(__("Te proposer pour le défendre"),'defense',-0.05,0.07,{reputation:4,defense:1},{reputation:-2},__("Tu l'étouffes toute la deuxième mi-temps."),__("Il te passe dessus à répétition.")),
    o(__("Le chambrer publiquement"),'basketIQ',-0.15,0.08,{reputation:6},{reputation:-4,alchimieEquipe:-2},__("Le stade est dans ta poche, le défi est lancé."),__("Le geste est mal pris et les médias s'en saisissent.")),
    o(__("T'associer à un coéquipier pour le piéger"),'playmaking',0.0,0.06,{alchimieEquipe:4,reputation:2},{alchimieEquipe:-1},__("Le piège fonctionne à la perfection."),__("Le rival lit le coup et en profite."))
  ]},
  {id:'remontee',titre:__("Quinze points de retard"),contexte:__("Ton équipe est menée de 15 points à 8 minutes de la fin. Il faut tout changer."),choix:[
    o(__("Presse tout terrain sur toute la longueur"),'defense',-0.05,0.08,{reputation:3,alchimieEquipe:3},{athletisme:-1},__("La pression étouffe l'adversaire, vous recollez."),__("L'équipe s'épuise et la presse est contournée.")),
    o(__("Prendre les tirs toi-même"),'scoring',-0.1,0.09,{reputation:5},{reputation:-3,alchimieEquipe:-2},__("Tu enchaînes les paniers, la salle se lève."),__("Tu forces trop, l'écart se creuse.")),
    o(__("Faire circuler le ballon avec patience"),'playmaking',0.05,0.06,{alchimieEquipe:5},{alchimieEquipe:-1},__("Le jeu collectif fait revenir l'équipe."),__("Trop de passes, le temps fuit.")),
    o(__("Accélérer le rythme à tout prix"),'athletisme',-0.05,0.07,{reputation:3,athletisme:1},{risqueBlessure:4},__("Le tempo infernal désarme l'adversaire."),__("L'équipe perd le contrôle et accumule les fautes.")),
    o(__("Ralentir le jeu pour calmer les esprits"),'basketIQ',0.0,0.05,{basketIQ:2,alchimieEquipe:2},{reputation:-1},__("Le calme revient, le score aussi."),__("L'adversaire contrôle désormais le chrono."))
  ]},
  {id:'lancers',titre:__("Lancers francs décisifs"),contexte:__("Faute à 2 secondes de la fin. Un point d'écart. Deux lancers pour gagner le match."),choix:[
    o(__("Suivre ta routine habituelle"),'basketIQ',0.05,0.08,{reputation:5},{reputation:-3},__("Routine parfaite, les deux lancers rentrent."),__("Les nerfs te trahissent, un lancer manque.")),
    o(__("Tirer vite sans réfléchir"),'scoring',-0.1,0.07,{reputation:4},{reputation:-3},__("Le geste est fluide, tu ne penses à rien."),__("Trop précipité, le ballon ricoche.")),
    o(__("Prendre ton temps pour calmer la salle"),'basketIQ',0.0,0.06,{reputation:3,basketIQ:1},{reputation:-2},__("Le silence se fait, tu marques."),__("Le temps joue contre toi, tu perds ta concentration.")),
    o(__("Viser la planche"),'scoring',-0.05,0.07,{reputation:3},{reputation:-2},__("Le ballon prend la planche et rentre."),__("Mauvais angle, le ballon ressort.")),
    o(__("Demander conseil à un coéquipier"),'playmaking',0.05,0.04,{alchimieEquipe:4},{alchimieEquipe:-1},__("Son conseil te rassure, le tir est parfait."),__("Le doute s'installe, tu rates."))
  ]},
  {id:'technique',titre:__("Technique contre ton coach"),contexte:__("L'arbitre siffle une technique contre ton entraîneur. L'ambiance bascule d'un coup."),choix:[
    o(__("Calmer ton coach avant que ça dégénère"),'basketIQ',0.1,0.04,{alchimieEquipe:4},{alchimieEquipe:-1},__("Ton coach te remercie, l'équipe reste soudée."),__("Il ne t'écoute pas et se fait expulser.")),
    o(__("Parler à l'arbitre pour apaiser les choses"),'basketIQ',-0.1,0.06,{reputation:3,alchimieEquipe:2},{reputation:-3},__("L'arbitre t'écoute et les esprits se calment."),__("L'arbitre te siffle aussi une technique.")),
    o(__("Canaliser la colère dans une série défensive"),'defense',0.0,0.07,{defense:1,reputation:3},{alchimieEquipe:-1},__("Vous verrouillez la raquette et reprenez l'avantage."),__("L'énervement coûte plusieurs fautes bêtes.")),
    o(__("Te mettre en avant en attaque"),'scoring',-0.05,0.07,{reputation:4},{reputation:-2},__("Tu prends tes responsabilités et tu marques."),__("Tu forces et l'équipe en pâtit.")),
    o(__("Rassembler l'équipe en cercle"),'playmaking',0.05,0.05,{alchimieEquipe:5},{alchimieEquipe:-1},__("L'équipe sort soudée de ce moment."),__("Le geste est mal interprété par le banc."))
  ]},
  {id:'playoffs',titre:__("Match décisif des playoffs"),contexte:__("Match 7. Ton équipe est menée de 4 points à la mi-temps. Le vestiaire est tendu."),choix:[
    o(__("Prendre la parole devant tout le vestiaire"),'basketIQ',-0.05,0.1,{reputation:5,alchimieEquipe:4},{reputation:-3,alchimieEquipe:-3},__("Ton discours galvanise tout le monde."),__("Ton discours tombe à plat et la tension monte.")),
    o(__("Demander la balle sur chaque possession"),'scoring',-0.1,0.1,{reputation:6},{reputation:-4},__("Tu portes l'équipe sur tes épaules."),__("Les défenseurs te collent, l'attaque s'enraye.")),
    o(__("Proposer un changement de défense"),'defense',0.0,0.08,{defense:1,alchimieEquipe:3},{reputation:-1},__("Le nouveau schéma désorganise l'adversaire."),__("Le changement crée des failles que l'adversaire exploite.")),
    o(__("Garder le calme et dérouler le plan"),'basketIQ',0.1,0.06,{basketIQ:1,alchimieEquipe:2},{reputation:-1},__("La discipline paie, vous recollez."),__("Le plan est trop prudent pour remonter.")),
    o(__("Prendre le jeu en main pour distribuer"),'playmaking',0.0,0.08,{alchimieEquipe:5,reputation:3},{alchimieEquipe:-2},__("Tout le monde touche la balle et ça marque."),__("La circulation est trop lente, l'écart se creuse."))
  ]},
  {id:'exterieur',titre:__("Salle hostile"),contexte:__("Match à l'extérieur : le public te siffle à chaque touche de balle et le bruit est assourdissant."),choix:[
    o(__("Utiliser les sifflets comme carburant"),'scoring',-0.05,0.07,{reputation:4,scoring:1},{reputation:-2},__("Chaque sifflet te donne plus d'énergie, tu domines."),__("Le bruit te déstabilise et tu enchaînes les pertes de balle.")),
    o(__("Te concentrer sur ta routine habituelle"),'basketIQ',0.1,0.05,{basketIQ:1,alchimieEquipe:2},{reputation:-1},__("Tu restes dans ta bulle et le match se déroule comme prévu."),__("La routine ne suffit pas à couvrir le bruit.")),
    o(__("Calmer le jeu pour faire taire la salle"),'playmaking',0.0,0.06,{alchimieEquipe:3,reputation:2},{alchimieEquipe:-1},__("Le rythme lent éteint peu à peu le public."),__("L'adversaire profite de la lenteur pour prendre l'avantage.")),
    o(__("Défendre avec agressivité pour imposer ton tempo"),'defense',-0.05,0.07,{defense:1,reputation:3},{risqueBlessure:3},__("Ta défense étouffe l'adversaire et la salle se tait."),__("Les fautes s'accumulent et le coach te retire du jeu.")),
    o(__("Chercher le contact pour provoquer des fautes"),'athletisme',-0.05,0.06,{reputation:3},{risqueBlessure:4},__("Tu vas sur la ligne des lancers à répétition."),__("Les arbitres ne sifflent pas et tu encaisses les coups."))
  ]},
  {id:'retour',titre:__("Premier match après ta blessure"),contexte:__("Tu rentres pour la première fois depuis ta blessure. Le staff t'a fixé une limite de minutes."),choix:[
    o(__("Respecter les minutes prévues"),'basketIQ',0.2,0.03,{risqueBlessure:-3,alchimieEquipe:2},{reputation:-1},__("Tu respectes le plan et ton corps suit."),__("Le plan est respecté mais ton rythme n'est pas encore là.")),
    o(__("Tester ton corps sur quelques actions physiques"),'athletisme',-0.1,0.06,{athletisme:1,reputation:2},{risqueBlessure:8},__("Ton corps répond bien et la confiance revient."),__("Une douleur surgit et tu dois lever le pied.")),
    o(__("Jouer avec prudence en évitant les contacts"),'basketIQ',0.0,0.04,{basketIQ:1,risqueBlessure:-2},{reputation:-1},__("Tu lis le jeu et tu évites les risques inutiles."),__("À force de prudence, tu ne pèses pas sur le match.")),
    o(__("Chercher ton rythme sur le tir à mi-distance"),'scoring',-0.05,0.05,{scoring:1,reputation:2},{reputation:-1},__("Les premiers tirs rentrent, tu retrouves tes repères."),__("Tes tirs manquent de précision après l'arrêt.")),
    o(__("Demander plus de minutes au coach"),'athletisme',-0.1,0.07,{reputation:4},{risqueBlessure:7,reputation:-1},__("Le coach te fait confiance et tu réponds présent."),__("Le coach te laisse jouer et ton corps fatigue vite."))
  ]},
  {id:'trade_rumeur',titre:__("Rumeurs de transfert"),contexte:__("Pendant l'échauffement, une rumeur circule : ta franchise discuterait de ton départ."),choix:[
    o(__("Prouver sur le terrain que tu mérites ta place"),'scoring',-0.05,0.07,{reputation:4,coteEquipe:3},{coteEquipe:-3},__("Tu réponds par un match énorme, la direction te regarde autrement."),__("Tu forces ton jeu et la rumeur n'en devient que plus crédible.")),
    o(__("Demander des explications au coach"),'basketIQ',-0.05,0.05,{coteEquipe:2,alchimieEquipe:1},{alchimieEquipe:-2},__("Le coach te rassure sincèrement."),__("La conversation tourne court et laisse un malaise.")),
    o(__("Ignorer et jouer ton match"),'basketIQ',0.1,0.04,{basketIQ:1,alchimieEquipe:2},{reputation:-1},__("Tu restes concentré et l'équipe te suit."),__("Tu penses trop à la rumeur et ça se voit.")),
    o(__("Faire passer un message à tes coéquipiers"),'playmaking',0.0,0.05,{alchimieEquipe:4},{alchimieEquipe:-1},__("Tes coéquipiers te soutiennent et se serrent les coudes."),__("Le message est mal compris et crée des tensions.")),
    o(__("Répondre aux journalistes à la mi-temps"),'basketIQ',-0.1,0.06,{reputation:4},{reputation:-3,alchimieEquipe:-2},__("Ta réponse est applaudie par les supporters."),__("Ta phrase est reprise hors contexte par les médias."))
  ]},
  {id:'coupe_poule',titre:__("Match de poule serré"),contexte:__("{coupe}. Dernier match de la phase de groupes : une défaite et {pays} peut être éliminé."),choix:[
    o(__("Imposer ton rythme dès l'entame"),'scoring',-0.05,0.08,{reputation:4},{reputation:-2},__("Tu ouvres le score et la sélection suit ton rythme."),__("Tu forces tes tirs et l'adversaire prend les devants.")),
    o(__("Fermer la raquette en défense"),'defense',0.0,0.08,{reputation:3,defense:1},{risqueBlessure:2},__("Ta défense étouffe l'adversaire sur toute la rencontre."),__("L'adversaire contourne la défense et marque en transition.")),
    o(__("Faire jouer le collectif de la sélection"),'playmaking',0.05,0.06,{alchimieEquipe:4},{alchimieEquipe:-2},__("Les systèmes fonctionnent et tout le monde score."),__("Le collectif n'a pas eu le temps de se roder.")),
    o(__("Calmer le jeu et gérer l'avance"),'basketIQ',0.1,0.05,{basketIQ:1,alchimieEquipe:2},{reputation:-1},__("Tu gères le chrono et la qualification est assurée."),__("Trop de prudence : l'adversaire revient dans le match.")),
    o(__("Prendre toi-même les tirs importants"),'scoring',-0.15,0.1,{reputation:6},{reputation:-3},__("Chaque tir important rentre : {pays} se qualifie."),__("Les tirs importants ne rentrent pas et la salle se tait."))
  ]},
  {id:'coupe_demi',titre:__('Demi-finale'),contexte:__("{coupe}. Demi-finale face à la sélection voisine, rivale historique de {pays}. Le pays entier regarde."),choix:[
    o(__("Défendre dur sur leur meilleur joueur"),'defense',-0.05,0.08,{reputation:4,defense:1},{reputation:-2,risqueBlessure:3},__("Leur star disparaît du match."),__("Leur star se joue de ta défense.")),
    o(__("Attaquer le cercle sans relâche"),'athletisme',-0.05,0.08,{reputation:4,scoring:1},{risqueBlessure:3},__("Tu prends les fautes et la défense craque."),__("Ça bouchonne dans la raquette, tu perds trop de ballons.")),
    o(__("Faire circuler le ballon pour trouver le tir ouvert"),'playmaking',0.05,0.06,{alchimieEquipe:4},{alchimieEquipe:-2},__("Le ballon circule et la défense adverse craque."),__("Le jeu se grippe et le ballon colle.")),
    o(__("Lire le jeu et provoquer les erreurs"),'basketIQ',0.05,0.07,{basketIQ:1,reputation:3},{reputation:-1},__("Tu anticipes chaque passe et lances les contre-attaques."),__("Ton anticipation te trahit : interception inutile.")),
    o(__("Enflammer la salle avec un tir lointain"),'scoring',-0.15,0.1,{reputation:6},{reputation:-3},__("Ton tir lointain met le feu à la salle."),__("Le tir est manqué et l'adversaire contre."))
  ]},
  {id:'coupe_finale',titre:__("La finale"),contexte:__("La finale — {coupe}. {pays} n'a pas gagné ce titre depuis longtemps. Dernière possession ou presque."),choix:[
    o(__("Prendre le tir de la victoire"),'scoring',-0.15,0.14,{reputation:8},{reputation:-4},__("Le ballon rentre : {pays} est champion !"),__("Le tir sort. Il faudra attendre la prochaine édition.")),
    o(__("Défendre la dernière possession"),'defense',0.0,0.1,{reputation:5,defense:1},{reputation:-2},__("Stop défensif : la finale est à toi."),__("L'adversaire marque dans les dernières secondes.")),
    o(__("Faire la passe décisive"),'playmaking',0.0,0.1,{alchimieEquipe:5,reputation:4},{alchimieEquipe:-3},__("Ton coéquipier reçoit seul et marque."),__("La passe est interceptée à la dernière seconde.")),
    o(__("Demander un temps mort pour dessiner la dernière action"),'basketIQ',0.1,0.07,{basketIQ:1,alchimieEquipe:3},{reputation:-1},__("L'action dessinée fonctionne à la perfection."),__("L'adversaire a tout lu et ferme tous les passages.")),
    o(__("Forcer au cercle pour obtenir les lancers"),'athletisme',-0.05,0.09,{reputation:5},{risqueBlessure:4},__("Faute sifflée, deux lancers à la clé, tu les mets."),__("Pas de faute sifflée : le contre te prive du titre."))
  ]},
  {id:'faute_rapide',titre:__("Deux fautes en trois minutes"),contexte:__("Ton adversaire direct te provoque, l'arbitre te siffle deux fautes très vite. Le coach hésite à te garder."),choix:[
    o(__("Rester sur le terrain en jouant sans faire de faute"),'defense',0.05,0.05,{defense:1,reputation:2},{reputation:-2},__("Tu défends propre et tu gardes ta place."),__("Troisième faute, retour sur le banc.")),
    o(__("Demander à sortir pour reprendre ton souffle"),'basketIQ',0.15,0.03,{basketIQ:1},{reputation:-1},__("Tu reviens plus lucide et ton équipe n'a pas souffert."),__("Ton équipe encaisse un 10-0 pendant ton absence.")),
    o(__("Attaquer plus pour forcer la faute adverse"),'scoring',-0.05,0.07,{reputation:3},{reputation:-3},__("Tu prends ton adversaire à son propre jeu."),__("Tu forces et tu perds la balle.")),
    o(__("Parler calmement à l'arbitre"),'basketIQ',0.0,0.04,{alchimieEquipe:1,reputation:1},{reputation:-2},__("L'arbitre te remercie d'être resté calme."),__("L'arbitre n'apprécie pas ton intervention.")),
    o(__("Répondre à la provocation par un geste"),'athletisme',-0.2,0.08,{reputation:5},{reputation:-5,risqueBlessure:3},__("Le geste enflamme la salle, personne ne te siffle."),__("Technique et exclusion : ton équipe se retrouve à quatre."))
  ]},
  {id:'prolongation',titre:__('Prolongation'),contexte:__("Fin du temps réglementaire, égalité. Cinq minutes de plus, les jambes sont lourdes de part et d'autre."),choix:[
    o(__("Prendre le jeu à ton compte"),'scoring',-0.1,0.1,{reputation:6},{reputation:-3},__("Tu enchaînes les paniers et le match bascule."),__("Tu forces, les ratés s'enchaînent.")),
    o(__("Presser tout le terrain"),'athletisme',-0.05,0.08,{reputation:3,athletisme:1},{risqueBlessure:4},__("Tes jambes font la différence : l'adversaire craque."),__("Les jambes lâchent à deux minutes de la fin.")),
    o(__("Faire courir ton équipe pour trouver un tir ouvert"),'playmaking',0.05,0.07,{alchimieEquipe:4},{alchimieEquipe:-2},__("Le collectif trouve le tir ouvert à chaque possession."),__("Le jeu s'enraye de fatigue.")),
    o(__("Demander un temps mort pour souffler"),'basketIQ',0.1,0.04,{basketIQ:1,risqueBlessure:-2},{reputation:-1},__("Le temps mort remet tout le monde dans le match."),__("L'adversaire reprend son souffle lui aussi.")),
    o(__("Défendre chaque possession"),'defense',0.0,0.08,{reputation:3,defense:1},{reputation:-2},__("Ton équipe ne concède rien."),__("Une erreur de rotation offre un tir ouvert à l'adversaire."))
  ]},
  {id:'jeune_defenseur',titre:__("Un jeune te défie"),contexte:__("Un rookie plein d'énergie te colle toute la soirée et te défie du regard. Les caméras adorent."),choix:[
    o(__("Le punir sur un jeu au poste"),'scoring',-0.05,0.08,{reputation:4,scoring:1},{reputation:-2},__("Tu lui montres que l'expérience compte."),__("Il te prend le ballon et file en contre-attaque.")),
    o(__("L'ignorer et jouer ton rôle"),'basketIQ',0.1,0.04,{basketIQ:1,alchimieEquipe:2},{reputation:-1},__("Tu restes dans ton plan et ton équipe gagne."),__("Tu laisses l'initiative au rookie qui s'enhardit.")),
    o(__("Lui parler après un panier pour le calmer"),'playmaking',0.0,0.05,{alchimieEquipe:2,reputation:2},{reputation:-1},__("Il te respecte immédiatement."),__("Il prend ça pour de la faiblesse.")),
    o(__("Le défendre avec toute ton intensité"),'defense',0.0,0.08,{reputation:3,defense:1},{risqueBlessure:2},__("Il n'obtient plus un seul bon tir."),__("Il te dépasse et te fait faute.")),
    o(__("Le chambrer devant les caméras"),'basketIQ',-0.15,0.08,{reputation:7},{reputation:-5},__("La séquence devient virale à ton avantage."),__("La séquence se retourne contre toi."))
  ]}
];
const c=(axe,texte,effets)=>({axe,texte,effets});

// Compétitions internationales (la FIB = Fédération internationale de basket)
// Pays représentés dans le basket mondial (Coupe du Monde 2023 + vivier africain/NBA) : [nom, code 2, code 3, continent]
const PAYS_LISTE=[
 ['RDC','CD','COD','Afrique'],['Cameroun','CM','CMR','Afrique'],['Sénégal','SN','SEN','Afrique'],['Nigeria','NG','NGR','Afrique'],['Angola','AO','ANG','Afrique'],
 ['Égypte','EG','EGY','Afrique'],["Soudan du Sud",'SS','SSD','Afrique'],['Cap-Vert','CV','CPV','Afrique'],["Côte d'Ivoire",'CI','CIV','Afrique'],['Mali','ML','MLI','Afrique'],
 ['Tunisie','TN','TUN','Afrique'],['Maroc','MA','MAR','Afrique'],['Rwanda','RW','RWA','Afrique'],
 ['France','FR','FRA','Europe'],['Espagne','ES','ESP','Europe'],['Serbie','RS','SRB','Europe'],['Allemagne','DE','GER','Europe'],['Italie','IT','ITA','Europe'],
 ['Grèce','GR','GRE','Europe'],['Lituanie','LT','LTU','Europe'],['Slovénie','SI','SLO','Europe'],['Lettonie','LV','LAT','Europe'],['Monténégro','ME','MNE','Europe'],
 ['Finlande','FI','FIN','Europe'],['Géorgie','GE','GEO','Europe'],['Turquie','TR','TUR','Europe'],['Croatie','HR','CRO','Europe'],['Royaume-Uni','GB','GBR','Europe'],
 ['Pologne','PL','POL','Europe'],['Ukraine','UA','UKR','Europe'],
 ['USA','US','USA','Amériques'],['Canada','CA','CAN','Amériques'],['Brésil','BR','BRA','Amériques'],['Mexique','MX','MEX','Amériques'],["Porto Rico",'PR','PUR','Amériques'],
 ["République dominicaine",'DO','DOM','Amériques'],['Venezuela','VE','VEN','Amériques'],['Argentine','AR','ARG','Amériques'],
 ['Japon','JP','JPN','Asie'],['Chine','CN','CHN','Asie'],['Philippines','PH','PHI','Asie'],['Australie','AU','AUS','Asie'],['Nouvelle-Zélande','NZ','NZL','Asie'],
 ['Iran','IR','IRI','Asie'],['Liban','LB','LBN','Asie'],['Jordanie','JO','JOR','Asie'],["Corée du Sud",'KR','KOR','Asie']
];
const PAYS=PAYS_LISTE.map(p=>[p[0],p[1]]).concat([['Autre','--']]);
const CONTINENTS={}; const CODE3={};
PAYS_LISTE.forEach(p=>{ CONTINENTS[p[0]]=p[3]; CODE3[p[0]]=p[2]; });
// Couleurs du drapeau (3 bandes horizontales, de haut en bas) pour le tableau des matchs de sélection
const DRAPEAUX={"RDC": ["#007FFF", "#F7D618", "#CE1021"], "Cameroun": ["#007A5E", "#CE1126", "#FCD116"], "Sénégal": ["#00853F", "#FDEF42", "#E31B23"], "Nigeria": ["#008751", "#FFFFFF", "#008751"], "Angola": ["#CC092F", "#000000", "#FFCB00"], "Égypte": ["#CE1126", "#FFFFFF", "#000000"], "Soudan du Sud": ["#000000", "#DA121A", "#078930"], "Cap-Vert": ["#003893", "#FFFFFF", "#CF2027"], "Côte d'Ivoire": ["#F77F00", "#FFFFFF", "#009E60"], "Mali": ["#14B53A", "#FCD116", "#CE1126"], "Tunisie": ["#E70013", "#FFFFFF", "#E70013"], "Maroc": ["#C1272D", "#006233", "#C1272D"], "Rwanda": ["#00A1DE", "#FAD201", "#20603D"], "France": ["#0055A4", "#FFFFFF", "#EF4135"], "Espagne": ["#AA151B", "#F1BF00", "#AA151B"], "Serbie": ["#C6363C", "#0C4076", "#FFFFFF"], "Allemagne": ["#000000", "#DD0000", "#FFCE00"], "Italie": ["#009246", "#FFFFFF", "#CE2B37"], "Grèce": ["#0D5EAF", "#FFFFFF", "#0D5EAF"], "Lituanie": ["#FDB913", "#006A44", "#C1272D"], "Slovénie": ["#FFFFFF", "#005DA4", "#ED1C24"], "Lettonie": ["#9E3039", "#FFFFFF", "#9E3039"], "Monténégro": ["#D3AE3B", "#C40308", "#D3AE3B"], "Finlande": ["#FFFFFF", "#003580", "#FFFFFF"], "Géorgie": ["#FFFFFF", "#FF0000", "#FFFFFF"], "Turquie": ["#E30A17", "#FFFFFF", "#E30A17"], "Croatie": ["#FF0000", "#FFFFFF", "#171796"], "Royaume-Uni": ["#012169", "#FFFFFF", "#C8102E"], "Pologne": ["#FFFFFF", "#DC143C", "#DC143C"], "Ukraine": ["#0057B7", "#0057B7", "#FFD700"], "USA": ["#B22234", "#FFFFFF", "#3C3B6E"], "Canada": ["#FF0000", "#FFFFFF", "#FF0000"], "Brésil": ["#009C3B", "#FFDF00", "#002776"], "Mexique": ["#006847", "#FFFFFF", "#CE1126"], "Porto Rico": ["#ED0000", "#FFFFFF", "#0050F0"], "République dominicaine": ["#002D62", "#FFFFFF", "#CE1126"], "Venezuela": ["#FFCC00", "#00247D", "#CF142B"], "Argentine": ["#74ACDF", "#FFFFFF", "#74ACDF"], "Japon": ["#FFFFFF", "#BC002D", "#FFFFFF"], "Chine": ["#DE2910", "#FFDE00", "#DE2910"], "Philippines": ["#0038A8", "#CE1126", "#FCD116"], "Australie": ["#012169", "#FFFFFF", "#E4002B"], "Nouvelle-Zélande": ["#00247D", "#FFFFFF", "#CC142B"], "Iran": ["#239F40", "#FFFFFF", "#DA0000"], "Liban": ["#ED1C24", "#FFFFFF", "#00A651"], "Jordanie": ["#000000", "#FFFFFF", "#007A3D"], "Corée du Sud": ["#FFFFFF", "#CD2E3A", "#0047A0"]};
const COUPES_CONTINENT={'Afrique':__("Coupe d'Afrique de basket"),'Europe':__("Coupe d'Europe de basket"),'Amériques':__("Coupe des Amériques de basket"),'Asie':__("Coupe d'Asie de basket")};
const COUPE_MONDE=__("Coupe du Monde de basket de la FIB");
// Calendrier : continentale tous les 2 ans (saisons impaires, selon forme/réputation),
// Coupe du Monde de la FIB tous les 4 ans (saison%4===2), Jeux Olympiques tous les 4 ans, 2 ans après la Coupe du Monde (saison%4===0).
const JEUX_OLYMPIQUES=__("Jeux Olympiques de basket");
function selectionne(e){ return (e.saison*37+e.age*11)%100 < 45+e.meta.reputation*0.5; }
function aPays(e){ return !!(e.pays&&e.pays!=='Autre'&&CONTINENTS[e.pays]); }
function nomPays(e){ return aPays(e)?__(e.pays):__('ta sélection'); }
function coupeContinent(e){ const c=CONTINENTS[e.pays]; return c?COUPES_CONTINENT[c]:null; }
function pointFaible(e){
  const L={scoring:__("ton scoring"),playmaking:__("ton playmaking"),defense:__("ta défense"),athletisme:__("ton athlétisme"),basketIQ:__("ton basket IQ")};
  let k='scoring'; for(const x in L){ if(e.stats[x]<e.stats[k]) k=x; }
  return {cle:k,nom:L[k]};
}
const SCENARIOS=[
  {id:'rookie',generique:false,cond:e=>e.saison===1,
   question:__("Première saison en pro : comment abordes-tu ton arrivée ?"),
   contexte:e=>{const p=e.draftPick; return __t("Tu as été sélectionné au pick n°{#0} par les {#1} {#2}. Les attentes sont {#3} et tout le monde te regarde.",[p,e.franchise.ville,e.franchise.nom,p<=5?__('énormes'):p<=14?__('élevées'):__('modestes')]);},
   choix:[
    c('Performance',__("Arriver en avance au centre d'entraînement chaque jour"),{basketIQ:2,athletisme:2,risqueBlessure:2}),
    c('Carrière / Contrat',__("Demander un rôle clair au coach dès le premier match"),{coteEquipe:3,reputation:1}),
    c('Image / Marque',__("Rester discret et laisser parler tes performances"),{alchimieEquipe:3}),
    c('Vie perso',__("T'installer en ville avec ta famille proche"),{alchimieEquipe:4}),
    c('Risque / Legacy',__("Annoncer viser le titre de Rookie de l'année"),{reputation:5,risqueBlessure:2})
  ]},
  {id:'champion',generique:false,cond:e=>e.bilan&&e.bilan.titre,
   question:__("Champion ! Comment vis-tu cet été de titre ?"),
   contexte:e=>__t("Les {#0} {#1} ont remporté le titre. Les sponsors et les médias se pressent autour de toi.",[e.franchise.ville,e.franchise.nom]),
   choix:[
    c('Performance',__("Reprendre l'entraînement dès la semaine suivante"),{athletisme:2,scoring:2,risqueBlessure:3}),
    c('Carrière / Contrat',__("Négocier une prolongation en position de force"),{coteEquipe:6,reputation:2}),
    c('Image / Marque',__("Signer avec un équipementier de renommée mondiale"),{reputation:6}),
    c('Vie perso',__("Fêter le titre dans ta ville d'origine avec tes proches"),{alchimieEquipe:4,reputation:2,risqueBlessure:-3}),
    c('Risque / Legacy',__("Annoncer publiquement vouloir réussir le doublé"),{reputation:5,risqueBlessure:3})
  ]},
  {id:'blessure',generique:false,cond:e=>e.bilan&&e.bilan.blessure,
   question:__("Blessé la saison dernière : comment reviens-tu ?"),
   contexte:e=>__t("Une blessure a écourté ta saison. Ton corps est fragile et le staff médical te demande d'être prudent.",[]),
   choix:[
    c('Performance',__("Suivre un programme de rééducation sans brûler d'étapes"),{risqueBlessure:-12,athletisme:1}),
    c('Carrière / Contrat',__("Accepter un rôle réduit le temps de retrouver ton niveau"),{alchimieEquipe:3,risqueBlessure:-4,reputation:-1}),
    c('Image / Marque',__("Raconter ta rééducation sur les réseaux sociaux"),{reputation:4}),
    c('Vie perso',__("Prendre un mois de repos complet avec ta famille"),{risqueBlessure:-10,alchimieEquipe:2}),
    c('Risque / Legacy',__("Revenir plus tôt que prévu pour le début de saison"),{reputation:4,risqueBlessure:10})
  ]},
  {id:'etoile',generique:false,cond:e=>e.bilan&&(e.bilan.mvp||e.bilan.allStar),
   question:__("Tu es une star de la ligue : jusqu'où vas-tu viser ?"),
   contexte:e=>__t("{#0} cette saison, tu es désormais l'un des visages de la ligue.",[e.bilan.mvp?'Élu MVP':__("Sélectionné All-Star")]),
   choix:[
    c('Performance',__("Ajouter un nouveau geste technique à ton arsenal"),{scoring:3,playmaking:2}),
    c('Carrière / Contrat',__("Demander à devenir le joueur franchise de l'équipe"),{reputation:4,coteEquipe:4}),
    c('Image / Marque',__("Lancer ta propre ligne de sneakers"),{reputation:6}),
    c('Vie perso',__("Monter ta fondation dans ton quartier d'origine"),{reputation:3,alchimieEquipe:3}),
    c('Risque / Legacy',__("Viser un record historique de la ligue cette saison"),{scoring:2,reputation:4,risqueBlessure:4})
  ]},
  {id:'echec',generique:false,cond:e=>e.bilan&&e.bilan.total>0&&e.bilan.rates/e.bilan.total>=0.6,
   question:__("Saison compliquée : comment réponds-tu aux critiques ?"),
   contexte:e=>__t("Tu as raté {#0} moment{#1} clé{#2} sur {#3}. Les médias et une partie des supporters te critiquent.",[e.bilan.rates,e.bilan.rates>1?'s':'',e.bilan.rates>1?'s':'',e.bilan.total]),
   choix:[
    c('Performance',__("Travailler spécifiquement tes décisions en fin de match"),{basketIQ:4}),
    c('Carrière / Contrat',__("Demander au coach un rôle plus protégé"),{basketIQ:1,reputation:-2}),
    c('Image / Marque',__("Répondre calmement aux critiques en conférence de presse"),{reputation:3}),
    c('Vie perso',__("Consulter un préparateur mental"),{basketIQ:3,alchimieEquipe:1}),
    c('Risque / Legacy',__("Promettre publiquement de faire taire tes détracteurs"),{reputation:5,risqueBlessure:2,alchimieEquipe:-2})
  ]},
  {id:'decisif',generique:false,cond:e=>e.bilan&&e.bilan.total>0&&e.bilan.rates===0,
   question:__("Décisif dans les moments clés : comment capitalises-tu ?"),
   contexte:e=>__t("Tu as réussi tes {#0} moments clés. L'équipe te fait confiance dans les dernières possessions.",[e.bilan.total]),
   choix:[
    c('Performance',__("Répéter tout l'été les situations de fin de match"),{basketIQ:3,scoring:2}),
    c('Carrière / Contrat',__("Demander le statut de capitaine"),{alchimieEquipe:4,coteEquipe:3}),
    c('Image / Marque',__("Devenir le visage de la campagne de la franchise"),{reputation:5,coteEquipe:2}),
    c('Vie perso',__("Partager la gloire avec tes coéquipiers lors d'un voyage d'équipe"),{alchimieEquipe:5}),
    c('Risque / Legacy',__("Réclamer publiquement le dernier tir à chaque match"),{reputation:4,alchimieEquipe:-3,scoring:1})
  ]},
  {id:'fragile',generique:false,cond:e=>e.meta.risqueBlessure>=45,
   question:__("Ton corps t'envoie des signaux d'alerte : que fais-tu ?"),
   contexte:e=>__t("Ton risque de blessure est élevé ({#0}/100). Le staff médical s'inquiète.",[e.meta.risqueBlessure]),
   choix:[
    c('Performance',__("Réduire ta charge d'entraînement cet été"),{risqueBlessure:-10,athletisme:-1}),
    c('Carrière / Contrat',__("Négocier une gestion des minutes avec le coach"),{risqueBlessure:-6,coteEquipe:-2}),
    c('Image / Marque',__("Limiter tes apparitions médiatiques pour te reposer"),{risqueBlessure:-4,reputation:-1}),
    c('Vie perso',__("Changer ton hygiène de vie : sommeil et nutrition"),{risqueBlessure:-8,athletisme:1}),
    c('Risque / Legacy',__("Ignorer les alertes et enchaîner les matchs"),{scoring:2,risqueBlessure:8})
  ]},
  {id:'tension',generique:false,cond:e=>e.meta.alchimieEquipe<=38,
   question:__("Le vestiaire est tendu : comment recolles-tu les morceaux ?"),
   contexte:e=>__t("L'ambiance dans le groupe s'est dégradée ces derniers mois (alchimie {#0}/100).",[e.meta.alchimieEquipe]),
   choix:[
    c('Performance',__("Proposer des séances collectives supplémentaires"),{alchimieEquipe:4,basketIQ:1}),
    c('Carrière / Contrat',__("Parler franchement au coach et à la direction"),{alchimieEquipe:3,reputation:1}),
    c('Image / Marque',__("Prendre la défense du groupe devant la presse"),{alchimieEquipe:4,reputation:2}),
    c('Vie perso',__("Organiser un week-end d'équipe loin du basket"),{alchimieEquipe:6}),
    c('Risque / Legacy',__("Confronter publiquement le coéquipier qui pose problème"),{alchimieEquipe:-3,reputation:4})
  ]},
  {id:'cote_basse',generique:false,cond:e=>e.meta.reputation<=30||e.meta.coteEquipe<=30,
   question:__("Ta cote baisse : comment relances-tu ta carrière ?"),
   contexte:e=>__t("Ta réputation ({#0}/100) et ta cote auprès de l'équipe ({#1}/100) ne sont plus ce qu'elles étaient.",[e.meta.reputation,e.meta.coteEquipe]),
   choix:[
    c('Performance',__("Te spécialiser dans le domaine où tu excelles"),{scoring:3}),
    c('Carrière / Contrat',__("Envisager un transfert vers un projet plus ambitieux"),{coteEquipe:-3,reputation:3}),
    c('Image / Marque',__("Lancer une série de contenus pour raconter ton histoire"),{reputation:5}),
    c('Vie perso',__("Retourner t'entraîner dans ton ancien quartier"),{reputation:2,alchimieEquipe:2}),
    c('Risque / Legacy',__("Défier publiquement les meilleurs joueurs de la ligue"),{reputation:6,risqueBlessure:3})
  ]},
  {id:'contrat',generique:false,cond:e=>e.saison>=3&&e.saison<=4&&e.age<=25,
   question:__("Ton contrat rookie touche à sa fin : quelle stratégie ?"),
   contexte:e=>__t("Dans un an, tu pourras négocier ton premier gros contrat avec les {#0} {#1} ou ailleurs.",[e.franchise.ville,e.franchise.nom]),
   choix:[
    c('Performance',__("Soigner tes statistiques pour augmenter ta valeur"),{scoring:3,playmaking:1}),
    c('Carrière / Contrat',__("Pousser pour une prolongation immédiate"),{coteEquipe:6}),
    c('Image / Marque',__("Soigner ton image pour attirer les grands sponsors"),{reputation:5}),
    c('Vie perso',__("Prendre conseil auprès d'un ancien joueur de confiance"),{basketIQ:2,alchimieEquipe:1}),
    c('Risque / Legacy',__("Refuser la prolongation pour viser la free agency"),{reputation:4,coteEquipe:-5})
  ]},
  {id:'veteran',generique:false,cond:e=>e.age>=33,
   question:__("Les années pèsent : comment prolonges-tu ta carrière ?"),
   contexte:e=>__t("À {#0} ans, ton corps ne répond plus comme avant, mais ton expérience reste un atout.",[e.age]),
   choix:[
    c('Performance',__("Adapter ton jeu pour économiser ton corps"),{basketIQ:3,athletisme:-1,risqueBlessure:-6}),
    c('Carrière / Contrat',__("Accepter un contrat plus court dans un rôle d'expérience"),{coteEquipe:2,alchimieEquipe:2}),
    c('Image / Marque',__("Préparer ta reconversion médiatique"),{reputation:3}),
    c('Vie perso',__("Passer plus de temps en famille pendant l'intersaison"),{alchimieEquipe:3,risqueBlessure:-4}),
    c('Risque / Legacy',__("Viser un dernier titre quoi qu'il en coûte"),{reputation:4,risqueBlessure:8,scoring:1})
  ]},
  {id:'mi_carriere',generique:true,cond:e=>e.age>=26&&e.age<=32,
   question:__("Quelle marque veux-tu laisser dans la ligue ?"),
   contexte:e=>__t("À {#0} ans, tu es au cœur de ta carrière. C'est le moment de construire ce qu'on retiendra de toi.",[e.age]),
   choix:[
    c('Performance',__("Travailler ton point faible tout l'été"),{basketIQ:2,defense:2}),
    c('Carrière / Contrat',__("Devenir le capitaine officieux du vestiaire"),{alchimieEquipe:5,basketIQ:1}),
    c('Image / Marque',__("Créer une fondation caritative dans ta ville d'origine"),{reputation:6}),
    c('Vie perso',__("Devenir le mentor d'un jeune coéquipier"),{alchimieEquipe:4,basketIQ:2}),
    c('Risque / Legacy',__("Demander publiquement à rejoindre un prétendant au titre"),{reputation:5,coteEquipe:-6})
  ]},
  {id:'montee',generique:true,cond:e=>e.age<=25,
   question:__("Tu montes en puissance : où investis-tu tes efforts cette année ?"),
   contexte:e=>__t("À {#0} ans, tu progresses vite et les autres franchises commencent à te surveiller.",[e.age]),
   choix:[
    c('Performance',__("Passer l'été avec un coach spécialisé dans ton poste"),{scoring:2,basketIQ:2,defense:1}),
    c('Carrière / Contrat',__("Demander plus de responsabilités dans le jeu de l'équipe"),{coteEquipe:3,reputation:2}),
    c('Image / Marque',__("Accepter une série d'interviews pour te faire connaître"),{reputation:4}),
    c('Vie perso',__("Rester entouré de ta famille et de ton cercle proche"),{alchimieEquipe:3,risqueBlessure:-3}),
    c('Risque / Legacy',__("Annoncer viser ta première sélection All-Star"),{reputation:5,risqueBlessure:2})
  ]},
  {id:'ete_calme',generique:true,cond:e=>true,
   question:__("Intersaison tranquille : comment emploies-tu ton été ?"),
   contexte:e=>__t("Aucune urgence cette année. Tu as le temps de choisir où investir tes efforts.",[]),
   choix:[
    c('Performance',__("Développer une nouvelle arme offensive"),{scoring:4,risqueBlessure:2}),
    c('Carrière / Contrat',__("Rencontrer les dirigeants pour parler de ton avenir"),{coteEquipe:4}),
    c('Image / Marque',__("Tourner une publicité nationale"),{reputation:4,coteEquipe:1}),
    c('Vie perso',__("Partir en voyage pour recharger les batteries"),{risqueBlessure:-6,alchimieEquipe:2}),
    c('Risque / Legacy',__("Défier un rival lors d'un camp d'été public"),{reputation:5,risqueBlessure:3})
  ]},
  {id:'coupe_continent',generique:false,cond:e=>e.saison>=3&&e.saison%2===1&&!!coupeContinent(e)&&selectionne(e),
   question:__("Une coupe continentale approche : comment la prépares-tu ?"),
   coupe:e=>({nom:coupeContinent(e),type:'continent'}),
   contexte:e=>__t("La {#0} réunit les meilleures sélections de la région. {#1} compte sur toi, mais ta franchise aussi.",[coupeContinent(e),aPays(e)?nomPays(e):__('Ta sélection')]),
   choix:e=>[
    c('Performance',__t("Rejoindre le stage de préparation et travailler les systèmes de {#0}",[nomPays(e)]),{playmaking:2,basketIQ:2,risqueBlessure:2}),
    c('Carrière / Contrat',__("Obtenir de ta franchise une libération sans conditions pour toute la compétition"),{coteEquipe:2,reputation:2}),
    c('Image / Marque',__t("Porter le brassard de capitaine dans les médias avant le tournoi",[]),{reputation:5}),
    c('Vie perso',__("Passer quelques jours en famille au pays avant de rejoindre le groupe"),{alchimieEquipe:3,risqueBlessure:-4}),
    c('Risque / Legacy',__("Jouer toute la compétition à fond malgré la fatigue de la saison"),{reputation:4,scoring:2,risqueBlessure:5})
  ]},
  {id:'coupe_monde',generique:false,cond:e=>e.saison>=6&&e.saison%4===2,
   question:__("La Coupe du Monde de la FIB arrive : quel joueur veux-tu y être ?"),
   coupe:e=>({nom:COUPE_MONDE,type:'monde'}),
   contexte:e=>__t("La FIB (Fédération internationale de basket) organise la {#0}. Le monde entier regarde, et {#1} veut aller loin.",[COUPE_MONDE,nomPays(e)]),
   choix:e=>[
    c('Performance',__("Faire de la préparation athlétique ta priorité absolue"),{athletisme:3,defense:1,risqueBlessure:2}),
    c('Carrière / Contrat',__("Utiliser la visibilité mondiale pour relancer ton contrat"),{coteEquipe:3,reputation:2}),
    c('Image / Marque',__t("Signer un contrat de marque lié à la Coupe du Monde",[]),{reputation:6,alchimieEquipe:-1}),
    c('Vie perso',__("Voyager avec ta famille et profiter de l'événement"),{alchimieEquipe:3,risqueBlessure:-5}),
    c('Risque / Legacy',__("Annoncer que tu veux le titre mondial et le MVP du tournoi"),{reputation:6,scoring:2,risqueBlessure:4})
  ]},
  {id:'jeux_olympiques',generique:false,cond:e=>e.saison>=4&&e.saison%4===0,
   question:__("Les Jeux Olympiques approchent : comment les abordes-tu ?"),
   coupe:e=>({nom:JEUX_OLYMPIQUES,type:'jo'}),
   contexte:e=>__t("Tous les quatre ans, deux ans après la Coupe du Monde de la FIB, les Jeux Olympiques réunissent les meilleures sélections de la planète. {#0} rêve d'une médaille, et tu es au cœur de ce rêve.",[aPays(e)?nomPays(e):__('Ta sélection')]),
   choix:e=>[
    c('Performance',__("Suivre un programme de préparation spécial pour être à ton pic le jour J"),{athletisme:2,scoring:1,basketIQ:1,risqueBlessure:2}),
    c('Carrière / Contrat',__("Négocier une clause « Jeux » avec ta franchise : libération et prime à la clé"),{coteEquipe:2,reputation:3}),
    c('Image / Marque',__("Devenir le visage de ta délégation dans les médias"),{reputation:6,alchimieEquipe:-1}),
    c('Vie perso',__("Emmener ta famille au village olympique et profiter de l'instant"),{alchimieEquipe:3,risqueBlessure:-5}),
    c('Risque / Legacy',__("Annoncer que tu vises l'or, rien d'autre"),{reputation:7,scoring:2,risqueBlessure:4})
  ]},
  {id:'sponsor',generique:false,cond:e=>e.saison>=2&&e.meta.reputation>=60&&e.age<=34,
   question:__("Une grande marque veut faire de toi son ambassadeur : que réponds-tu ?"),
   contexte:e=>__t("Ta réputation attire les sponsors. Un contrat de plusieurs saisons est sur la table, mais il prendrait du temps sur tes entraînements.",[]),
   choix:[
    c('Performance',__("Refuser pour rester concentré sur le terrain"),{scoring:2,basketIQ:1}),
    c('Carrière / Contrat',__("Faire négocier le contrat par ton agent pour garder la main sur ton emploi du temps"),{coteEquipe:2,reputation:2}),
    c('Image / Marque',__("Signer et tourner la campagne tout de suite"),{reputation:6,alchimieEquipe:-1}),
    c('Vie perso',__("Accepter à condition de garder tes étés libres pour ta famille"),{reputation:2,alchimieEquipe:2,risqueBlessure:-3}),
    c('Risque / Legacy',__("Exiger de devenir le visage unique de la marque dans ta région"),{reputation:5,coteEquipe:-1,risqueBlessure:2})
  ]},
  {id:'nouveau_coach',generique:false,cond:e=>e.saison>=3&&e.saison%5===3,
   question:__("Un nouveau coach prend l'équipe : comment t'adaptes-tu ?"),
   contexte:e=>__t("Le nouvel entraîneur de {#0} arrive avec ses systèmes et ses habitudes. Tout le vestiaire se demande qui il va aligner.",[e.franchise.ville]),
   choix:[
    c('Performance',__("Apprendre ses systèmes plus vite que tout le monde"),{basketIQ:3,playmaking:1}),
    c('Carrière / Contrat',__("Demander un entretien individuel pour clarifier ton rôle"),{coteEquipe:3}),
    c('Image / Marque',__("Dire publiquement que tu soutiens le projet du nouveau coach"),{reputation:3,alchimieEquipe:2}),
    c('Vie perso',__("Inviter le coach à dîner pour mieux le connaître"),{alchimieEquipe:3,reputation:1}),
    c('Risque / Legacy',__("Contester ses méthodes devant tes coéquipiers"),{reputation:3,alchimieEquipe:-4,coteEquipe:-2})
  ]},
  {id:'jeune_talent',generique:false,cond:e=>e.age>=28&&e.saison>=4,
   question:__("Un jeune talent arrive à ton poste : comment réagis-tu ?"),
   contexte:e=>__t("Le club vient de recruter un jeune {#0} très prometteur. Les journalistes parlent déjà de la passation de pouvoir.",[__(e.poste).toLowerCase()]),
   choix:[
    c('Performance',__("Prouver sur le terrain que tu es encore le meilleur"),{scoring:2,defense:1,risqueBlessure:2}),
    c('Carrière / Contrat',__("Négocier un rôle de mentor clairement défini dans ton contrat"),{coteEquipe:2,alchimieEquipe:2}),
    c('Image / Marque',__("Parler de lui avec respect dans la presse"),{reputation:3,alchimieEquipe:2}),
    c('Vie perso',__("L'inviter chez toi et le guider hors du terrain"),{alchimieEquipe:4,basketIQ:1}),
    c('Risque / Legacy',__("Lui lancer un défi public : le meilleur au poste"),{reputation:5,alchimieEquipe:-2,risqueBlessure:3})
  ]},
  {id:'etudes',generique:false,cond:e=>e.age<=22&&e.saison>=2,
   question:__("Reprendre des études à distance pendant l'été ?"),
   contexte:e=>__t("Ton université te propose de valider ton diplôme à distance. Cela prendrait de l'énergie, mais ça sécuriserait ton avenir.",[]),
   choix:[
    c('Performance',__("Reporter les études et t'entraîner tout l'été"),{scoring:2,athletisme:2,risqueBlessure:3}),
    c('Carrière / Contrat',__("Demander à ton agent de plafonner ton emploi du temps"),{coteEquipe:2,reputation:1}),
    c('Image / Marque',__("Raconter ton parcours étudiant sur les réseaux"),{reputation:4,alchimieEquipe:1}),
    c('Vie perso',__("T'inscrire et valider tes cours un par un"),{basketIQ:3,risqueBlessure:-3}),
    c('Risque / Legacy',__("Tout miser sur le basket, sans plan B"),{reputation:4,scoring:2,risqueBlessure:3})
  ]},
  {id:'academie',generique:false,cond:e=>e.age>=29&&e.meta.reputation>=55,
   question:__("Ouvrir une académie de basket pour les jeunes de ton quartier ?"),
   contexte:e=>__t("Des élus locaux te proposent de financer une académie portant ton nom. Ce serait un héritage, mais aussi un engagement sur plusieurs années.",[]),
   choix:[
    c('Performance',__("Y organiser tes séances d'entraînement estivales"),{athletisme:2,basketIQ:1}),
    c('Carrière / Contrat',__("Chercher des partenaires privés pour financer le projet"),{coteEquipe:2,reputation:2}),
    c('Image / Marque',__("Lancer l'académie avec une grande cérémonie médiatisée"),{reputation:5}),
    c('Vie perso',__("Y associer ta famille et tes proches"),{alchimieEquipe:3,risqueBlessure:-3}),
    c('Risque / Legacy',__("Promettre publiquement un futur champion issu de l'académie"),{reputation:6,risqueBlessure:1})
  ]},
  {id:'documentaire',generique:false,cond:e=>e.meta.reputation>=75&&e.saison>=4,
   question:__("Une plateforme veut tourner un documentaire sur toi : tu acceptes ?"),
   contexte:e=>__t("Une équipe de tournage propose de te suivre pendant toute la saison. Intimité contre notoriété.",[]),
   choix:[
    c('Performance',__("Refuser pour ne pas être distrait en saison"),{scoring:2,basketIQ:1}),
    c('Carrière / Contrat',__("Accepter à condition de contrôler le montage final"),{coteEquipe:2,reputation:2}),
    c('Image / Marque',__("Accepter sans réserve et jouer le jeu des caméras"),{reputation:6,alchimieEquipe:-1}),
    c('Vie perso',__("Accepter en laissant tes proches hors cadre"),{alchimieEquipe:2,reputation:2}),
    c('Risque / Legacy',__("Exiger de tout montrer, même les mauvais moments"),{reputation:5,alchimieEquipe:-2})
  ]},
  {id:'deadline',generique:false,cond:e=>e.saison>=2&&e.meta.coteEquipe>=45&&e.meta.coteEquipe<=70,
   question:__("Date limite des transferts : ton équipe cherche un renfort. Que fais-tu ?"),
   contexte:e=>__t("Le directeur sportif de {#0} cherche un joueur pour viser plus haut cette saison. Toi, tu peux peser sur le choix.",[e.franchise.ville]),
   choix:[
    c('Performance',__("Suggérer un joueur dont les qualités complètent les tiennes"),{playmaking:2,basketIQ:2}),
    c('Carrière / Contrat',__("Demander que ton futur soit éclairci avant l'arrivée du renfort"),{coteEquipe:3}),
    c('Image / Marque',__("Faire une sortie médiatique pour convaincre la direction de viser haut"),{reputation:4,coteEquipe:1}),
    c('Vie perso',__("Proposer un ami d'enfance qui joue dans une autre équipe"),{alchimieEquipe:3,reputation:1}),
    c('Risque / Legacy',__("Menacer de partir si l'équipe ne se renforce pas"),{reputation:4,coteEquipe:-2,alchimieEquipe:-3})
  ]},
  {id:'fans_hostiles',generique:false,cond:e=>e.saison>=2&&e.meta.reputation<=45,
   question:__("Les supporters te sifflent : comment réponds-tu ?"),
   contexte:e=>__t("Après plusieurs mauvaises soirées, la salle de {#0} ne t'épargne plus. Les réseaux sociaux s'en mêlent.",[e.franchise.ville]),
   choix:[
    c('Performance',__("Rester tard à la salle pour corriger ce qui ne va pas"),{scoring:2,basketIQ:2}),
    c('Carrière / Contrat',__("Demander à la direction un message de soutien public"),{coteEquipe:1,reputation:2}),
    c('Image / Marque',__("Répondre avec humour dans une vidéo"),{reputation:4}),
    c('Vie perso',__("Couper les réseaux sociaux quelques semaines"),{alchimieEquipe:2,risqueBlessure:-3}),
    c('Risque / Legacy',__("Répondre aux sifflets en dédiant ton prochain match à tes détracteurs"),{reputation:5,risqueBlessure:2})
  ]},
  {id:'prolongation_contrat',generique:false,cond:e=>e.saison>=5&&e.saison%4===1,
   question:__("Ton contrat arrive à terme : prolongation ou marché libre ?"),
   contexte:e=>__t("{#0} te propose de prolonger, mais d'autres franchises te font les yeux doux. Ta cote d'équipe est de {#1}.",[e.franchise.ville,e.meta.coteEquipe]),
   choix:[
    c('Performance',__("Choisir le projet sportif le plus ambitieux"),{scoring:1,basketIQ:2,coteEquipe:1}),
    c('Carrière / Contrat',__("Prolonger pour sécuriser ton avenir"),{coteEquipe:4}),
    c('Image / Marque',__("Choisir la ville où ta marque personnelle rayonnera le plus"),{reputation:4,coteEquipe:1}),
    c('Vie perso',__("Rester pour que ta famille ne déménage pas"),{alchimieEquipe:3,risqueBlessure:-3}),
    c('Risque / Legacy',__("Tester le marché libre et faire monter les enchères"),{reputation:4,coteEquipe:-2,alchimieEquipe:-2})
  ]},
  {id:'point_faible',generique:false,cond:e=>{const m=Math.min(...Object.values(e.stats));return m<=56&&e.saison>=2;},
   question:__("Un point faible ressort dans ton jeu : comment le corriges-tu ?"),
   contexte:e=>__t("Les statistiques sont claires : {#0} est ton point faible ({#1}). Les adversaires commencent à le viser.",[pointFaible(e).nom,e.stats[pointFaible(e).cle]]),
   choix:e=>{const k=pointFaible(e).cle,n=pointFaible(e).nom;return [
    c('Performance',__t("Y consacrer tout l'été avec un préparateur spécialisé",[]),{[k]:4,risqueBlessure:2}),
    c('Carrière / Contrat',__("Demander à ton coach des minutes pour progresser en match"),{coteEquipe:2,[k]:1}),
    c('Image / Marque',__t("Tourner une série de vidéos publiques de ta progression sur {#0}",[n]),{reputation:3,[k]:1}),
    c('Vie perso',__("Faire un vrai break pour revenir plus frais"),{risqueBlessure:-5,alchimieEquipe:2}),
    c('Risque / Legacy',__("Assumer et jouer sans changer ton style, quoi qu'il arrive"),{reputation:3,[k]:-1,scoring:1})
  ];}},
  {id:'vieillissement',generique:false,cond:e=>e.age>=30&&e.stats.athletisme<=62,
   question:__("Tes jambes ne répondent plus comme avant : comment t'adaptes-tu ?"),
   contexte:e=>__t("À {#0} ans, ton athlétisme baisse ({#1}). Tes adversaires plus jeunes te dépassent de plus en plus souvent.",[e.age,e.stats.athletisme]),
   choix:[
    c('Performance',__("Transformer ton jeu : moins d'explosivité, plus de lecture"),{basketIQ:3,athletisme:-1}),
    c('Carrière / Contrat',__("Accepter un rôle de remplaçant de luxe"),{coteEquipe:1,alchimieEquipe:3}),
    c('Image / Marque',__("Assumer publiquement la deuxième partie de ta carrière"),{reputation:3,alchimieEquipe:1}),
    c('Vie perso',__("Réorganiser ta vie autour de la récupération"),{risqueBlessure:-7,athletisme:1}),
    c('Risque / Legacy',__("Forcer les entraînements pour retrouver tes jambes de vingt ans"),{athletisme:3,risqueBlessure:6})
  ]},
  {id:'champion2',generique:false,cond:e=>e.bilan&&e.bilan.titre,
   question:__("Tu es sur le toit de la ligue : comment restes-tu affamé ?"),
   contexte:e=>__t("Avec le titre en poche, tout le monde veut battre les {#0}. Le plus dur, c'est de rester au sommet.",[e.franchise.nom]),
   choix:[
    c('Performance',__("Te fixer un nouvel objectif de progression chiffré"),{scoring:2,basketIQ:2}),
    c('Carrière / Contrat',__("Demander à la direction de renforcer l'effectif"),{coteEquipe:3,alchimieEquipe:2}),
    c('Image / Marque',__("Refuser les sollicitations pour rester concentré"),{alchimieEquipe:3,reputation:-1}),
    c('Vie perso',__("Prendre deux semaines de vraies vacances"),{risqueBlessure:-6,alchimieEquipe:2}),
    c('Risque / Legacy',__("Lancer un défi public à tous les prétendants"),{reputation:5,risqueBlessure:2})
  ]},
  {id:'blessure2',generique:false,cond:e=>e.bilan&&e.bilan.blessure,
   question:__("De retour de blessure : à quel rythme reprends-tu ?"),
   contexte:e=>__t("Tu es rétabli sur le papier, mais ton corps garde la trace de ta dernière blessure.",[]),
   choix:[
    c('Performance',__("Reprendre par un travail de renforcement ciblé"),{athletisme:2,risqueBlessure:-8}),
    c('Carrière / Contrat',__("Négocier un plan de retour progressif avec le staff"),{risqueBlessure:-5,coteEquipe:1}),
    c('Image / Marque',__("Rester discret pour te concentrer sur ta forme"),{risqueBlessure:-3}),
    c('Vie perso',__("Consulter un second avis médical"),{risqueBlessure:-6,basketIQ:1}),
    c('Risque / Legacy',__("Te déclarer à 100 % pour retrouver ta place de titulaire"),{reputation:3,risqueBlessure:9})
  ]},
  {id:'etoile2',generique:false,cond:e=>e.bilan&&(e.bilan.mvp||e.bilan.allStar),
   question:__("Les défenses te ciblent : comment t'adaptes-tu ?"),
   contexte:e=>__t("Après ta belle saison, les adversaires préparent des défenses spécialement contre toi.",[]),
   choix:[
    c('Performance',__("Travailler ta lecture des prises à deux"),{playmaking:3,basketIQ:2}),
    c('Carrière / Contrat',__("Demander des systèmes qui t'éloignent du ballon"),{alchimieEquipe:3,coteEquipe:1}),
    c('Image / Marque',__("Parler publiquement du traitement dont tu fais l'objet"),{reputation:3}),
    c('Vie perso',__("Échanger avec un ancien All-Star qui a vécu la même chose"),{basketIQ:3}),
    c('Risque / Legacy',__("Provoquer les défenses en prenant encore plus de tirs"),{scoring:2,reputation:3,alchimieEquipe:-2})
  ]},
  {id:'echec2',generique:false,cond:e=>e.bilan&&e.bilan.total>0&&e.bilan.rates/e.bilan.total>=0.6,
   question:__("Le doute s'installe : comment reprends-tu confiance ?"),
   contexte:e=>__t("Avec {#0} moment{#1} clé{#2} raté{#3} sur {#4}, tu te demandes si tu es à la hauteur.",[e.bilan.rates,e.bilan.rates>1?'s':'',e.bilan.rates>1?'s':'',e.bilan.rates>1?'s':'',e.bilan.total]),
   choix:[
    c('Performance',__("Refaire des séries de tirs sous fatigue chaque jour"),{scoring:3,athletisme:1}),
    c('Carrière / Contrat',__("Demander à tes coéquipiers d'être plus présents sur les dernières possessions"),{alchimieEquipe:3}),
    c('Image / Marque',__("Faire une pause avec les réseaux sociaux"),{alchimieEquipe:1,reputation:-1}),
    c('Vie perso',__("Parler à un ancien joueur qui a connu le même passage à vide"),{basketIQ:2,alchimieEquipe:2}),
    c('Risque / Legacy',__("Demander publiquement la balle sur chaque dernier tir"),{reputation:5,alchimieEquipe:-2})
  ]},
  {id:'decisif2',generique:false,cond:e=>e.bilan&&e.bilan.total>0&&e.bilan.rates===0,
   question:__("Tout le monde compte sur toi : comment gères-tu la confiance ?"),
   contexte:e=>__t("Ton sang-froid est devenu ta signature. Ton coach et ton équipe comptent sur toi à chaque fin de match.",[]),
   choix:[
    c('Performance',__("Étudier les défenses de fin de match de tes adversaires"),{basketIQ:4}),
    c('Carrière / Contrat',__("Négocier une prime liée aux moments décisifs"),{reputation:2,coteEquipe:2}),
    c('Image / Marque',__("Accepter une série d'interviews sur ta mentalité de gagnant"),{reputation:4}),
    c('Vie perso',__("Garder tes habitudes d'avant-match pour ne pas te déconcentrer"),{basketIQ:2,alchimieEquipe:2}),
    c('Risque / Legacy',__("Te lancer le défi de gagner un match à toi seul"),{reputation:5,risqueBlessure:3,alchimieEquipe:-2})
  ]},
  {id:'fragile2',generique:false,cond:e=>e.meta.risqueBlessure>=45,
   question:__("Ton physique t'inquiète : quelle stratégie à long terme ?"),
   contexte:e=>__t("À {#0} ans, ton corps accumule la fatigue (risque de blessure {#1}/100).",[e.age,e.meta.risqueBlessure]),
   choix:[
    c('Performance',__("Mettre en place une préparation physique personnalisée"),{risqueBlessure:-10,athletisme:1}),
    c('Carrière / Contrat',__("Accepter de sauter quelques matchs de saison régulière"),{risqueBlessure:-7,coteEquipe:-1}),
    c('Image / Marque',__("Annuler tes engagements commerciaux de l'été"),{risqueBlessure:-5,reputation:-2}),
    c('Vie perso',__("Prendre soin de ton sommeil et de ton alimentation"),{risqueBlessure:-6}),
    c('Risque / Legacy',__("Continuer au même rythme tant que ça tient"),{scoring:2,reputation:2,risqueBlessure:7})
  ]},
  {id:'tension2',generique:false,cond:e=>e.meta.alchimieEquipe<=45,
   question:__("Un coéquipier te défie : comment réagis-tu ?"),
   contexte:e=>__t("Un coéquipier remet ton rôle en cause devant les autres joueurs. Toute l'équipe regarde ta réaction.",[]),
   choix:[
    c('Performance',__("Répondre par ton travail à l'entraînement"),{basketIQ:1,alchimieEquipe:2}),
    c('Carrière / Contrat',__("Demander une rencontre avec le coach pour clarifier les rôles"),{alchimieEquipe:3}),
    c('Image / Marque',__("Éviter que l'histoire sorte dans les médias"),{alchimieEquipe:1,reputation:1}),
    c('Vie perso',__("Inviter ce coéquipier chez toi pour désamorcer le conflit"),{alchimieEquipe:5}),
    c('Risque / Legacy',__("Le recadrer devant tout le groupe"),{alchimieEquipe:-3,reputation:3})
  ]},
  {id:'cote_basse2',generique:false,cond:e=>e.meta.reputation<=30||e.meta.coteEquipe<=30,
   question:__("Les rumeurs de départ circulent : comment les gères-tu ?"),
   contexte:e=>__t("On parle de toi comme d'un joueur sur le déclin. Les {#0} {#1} réfléchissent à leur avenir avec toi.",[e.franchise.ville,e.franchise.nom]),
   choix:[
    c('Performance',__("Prouver ta valeur dès le début de saison"),{scoring:2,defense:2}),
    c('Carrière / Contrat',__("Demander une prolongation pour te rassurer"),{coteEquipe:4,reputation:-1}),
    c('Image / Marque',__("Démentir publiquement les rumeurs"),{reputation:3}),
    c('Vie perso',__("Prendre du recul et ne plus lire les commentaires"),{alchimieEquipe:2}),
    c('Risque / Legacy',__("Demander toi-même à être échangé"),{reputation:3,coteEquipe:-5})
  ]},
  {id:'veteran2',generique:false,cond:e=>e.age>=34,
   question:__("Dernière ligne droite : quel héritage laisses-tu ?"),
   contexte:e=>__t("À {#0} ans, chaque saison peut être la dernière. Les jeunes te regardent comme une référence.",[e.age]),
   choix:[
    c('Performance',__("Te concentrer sur ton rôle de sixième homme de luxe"),{basketIQ:3,alchimieEquipe:2}),
    c('Carrière / Contrat',__("Négocier une dernière année seulement"),{coteEquipe:2,reputation:1}),
    c('Image / Marque',__("Écrire ton autobiographie"),{reputation:4}),
    c('Vie perso',__("Organiser un camp de basket pour les jeunes de ton quartier"),{reputation:3,alchimieEquipe:2}),
    c('Risque / Legacy',__("Tout donner sur une dernière saison à haut rendement"),{scoring:2,reputation:4,risqueBlessure:8})
  ]},
  {id:'mi_carriere2',generique:true,cond:e=>e.age>=26&&e.age<=32,
   question:__("Tu es au cœur de ta carrière : comment durer ?"),
   contexte:e=>__t("À {#0} ans, tu dois penser à ton corps autant qu'à ton jeu.",[e.age]),
   choix:[
    c('Performance',__("Travailler ta récupération autant que ton tir"),{risqueBlessure:-5,scoring:2}),
    c('Carrière / Contrat',__("Négocier un contrat long avec ta franchise"),{coteEquipe:4}),
    c('Image / Marque',__("Diversifier tes revenus avec des partenariats durables"),{reputation:4}),
    c('Vie perso',__("Te faire accompagner pour ta santé mentale"),{alchimieEquipe:3,basketIQ:1}),
    c('Risque / Legacy',__("Tenter un virage tactique en changeant ton style de jeu"),{playmaking:3,scoring:-1,reputation:2})
  ]},
  {id:'ete_calme2',generique:true,cond:e=>true,
   question:__("Une intersaison pour souffler ou pour progresser ?"),
   contexte:e=>__t("Aucun dossier urgent cette année : à toi de choisir ton rythme.",[]),
   choix:[
    c('Performance',__("Faire un camp d'entraînement avec d'anciens joueurs"),{basketIQ:3,scoring:1}),
    c('Carrière / Contrat',__("Planifier la suite de ta carrière avec ton agent"),{coteEquipe:3,reputation:1}),
    c('Image / Marque',__("Lancer ton podcast basket"),{reputation:4}),
    c('Vie perso',__("Passer l'été à voyager avec tes proches"),{alchimieEquipe:3,risqueBlessure:-5}),
    c('Risque / Legacy',__("Tenter un défi médiatique avec un autre joueur"),{reputation:4,risqueBlessure:2})
  ]},
  {id:'rival_promo',generique:false,intro:'promo',cond:e=>e.saison>=2&&!possede('promo'),
   question:__("Un joueur de ta promotion te suit de près : comment l'abordes-tu ?"),
   contexte:(e,r)=>__t("{#0}, {#1} de {#2}, a été drafté juste après toi. Les médias vous comparent chaque semaine.",[r.nom,__(r.poste).toLowerCase(),r.equipe]),
   choix:(e,r)=>[
    c('Performance',__t("Étudier le jeu de {#0} pour mieux le contrer",[r.court]),{basketIQ:3}),
    c('Carrière / Contrat',__t("Demander à ton coach de te placer sur {#0} à chaque duel",[r.court]),{coteEquipe:2,reputation:2,rivalite:1}),
    c('Image / Marque',__t("Entretenir la comparaison avec {#0} dans la presse",[r.court]),{reputation:4,rivalite:1}),
    c('Vie perso',__t("Prendre un café avec {#0} pour désamorcer la tension",[r.court]),{alchimieEquipe:2,rivalite:-1}),
    c('Risque / Legacy',__t("Défier publiquement {#0} de te battre sur le terrain",[r.court]),{reputation:5,risqueBlessure:3,rivalite:2})
  ]},
  {id:'rival_veteran',generique:false,intro:'veteran',cond:e=>e.saison>=3&&!possede('veteran'),
   question:__("Une légende de la ligue bloque ton chemin : comment la détrôner ?"),
   contexte:(e,r)=>__t("{#0}, {#1} de {#2}, domine la ligue depuis des années. Tant qu'il est là, personne ne te voit comme le meilleur.",[r.nom,__(r.poste).toLowerCase(),r.equipe]),
   choix:(e,r)=>[
    c('Performance',__t("Passer l'été à travailler les points forts de {#0}",[r.court]),{scoring:2,defense:2}),
    c('Carrière / Contrat',__t("Réclamer plus de responsabilités pour prendre la place de {#0}",[r.court]),{coteEquipe:3,reputation:2,rivalite:1}),
    c('Image / Marque',__t("Dire publiquement que tu vises la place de {#0}",[r.court]),{reputation:5,rivalite:2}),
    c('Vie perso',__t("Demander conseil à {#0} après un match",[r.court]),{basketIQ:3,rivalite:-1}),
    c('Risque / Legacy',__t("Prendre les tirs décisifs pour voler la vedette à {#0}",[r.court]),{reputation:4,risqueBlessure:3,rivalite:1})
  ]},
  {id:'rival_ancien',generique:false,intro:'ancien',cond:e=>e.saison>=5&&!possede('ancien'),
   question:__("Ton ancien coéquipier est parti chez un rival : comment le vis-tu ?"),
   contexte:(e,r)=>__t("{#0}, avec qui tu as partagé le vestiaire, a rejoint {#1}. Les supporters se demandent de quel côté tu es.",[r.nom,r.equipe]),
   choix:(e,r)=>[
    c('Performance',__t("Utiliser ce que tu sais des habitudes de {#0} pour le préparer",[r.court]),{basketIQ:3,rivalite:1}),
    c('Carrière / Contrat',__t("Conseiller à ta direction de proposer un retour à {#0}",[r.court]),{coteEquipe:2,rivalite:-1}),
    c('Image / Marque',__t("Souhaiter bonne chance à {#0} publiquement",[r.court]),{reputation:3,rivalite:-1}),
    c('Vie perso',__t("Rester en contact avec {#0} malgré la rivalité",[r.court]),{alchimieEquipe:3,rivalite:-1}),
    c('Risque / Legacy',__t("Lancer à {#0} qu'il regrettera son choix",[r.court]),{reputation:5,alchimieEquipe:-2,rivalite:2})
  ]},
  {id:'rival_media',generique:false,intro:'media',cond:e=>e.saison>=6&&e.meta.reputation>=55&&!possede('media'),
   question:__("Un rival te cherche dans la presse : comment réponds-tu ?"),
   contexte:(e,r)=>__t("{#0} ({#1}) multiplie les déclarations contre toi. Chaque interview alimente le duel.",[r.nom,r.equipe]),
   choix:(e,r)=>[
    c('Performance',__("Répondre uniquement sur le terrain"),{scoring:2,basketIQ:1,rivalite:1}),
    c('Carrière / Contrat',__t("Demander à ton agent de calmer le jeu avec les représentants de {#0}",[r.court]),{reputation:1,rivalite:-1}),
    c('Image / Marque',__t("Répondre point par point à {#0} en conférence de presse",[r.court]),{reputation:4,rivalite:1}),
    c('Vie perso',__("Couper les réseaux sociaux quelques semaines"),{alchimieEquipe:2,rivalite:-1}),
    c('Risque / Legacy',__("Lancer une punchline qui devient virale"),{reputation:6,alchimieEquipe:-2,rivalite:2})
  ]}
];
const SCENARIO_MATCHS={
  rookie:['rival','technique','exterieur'], champion:['playoffs','buzzer','exterieur'], champion2:['playoffs','remontee','lancers'],
  blessure:['blessure','retour'], blessure2:['retour','remontee'], etoile:['rival','buzzer','exterieur'], etoile2:['technique','remontee','rival'],
  echec:['lancers','buzzer','playoffs'], echec2:['lancers','remontee','buzzer'], decisif:['buzzer','lancers','playoffs'], decisif2:['playoffs','buzzer'],
  fragile:['blessure','retour'], fragile2:['blessure','retour','remontee'], tension:['technique','rival'], tension2:['technique','rival'],
  cote_basse:['trade_rumeur','rival'], cote_basse2:['trade_rumeur','exterieur'], contrat:['trade_rumeur','lancers'],
  veteran:['remontee','blessure','lancers'], veteran2:['remontee','playoffs','lancers'], mi_carriere:['playoffs','remontee','trade_rumeur'],
  mi_carriere2:['blessure','remontee'], coupe_continent:[], coupe_monde:[],jeux_olympiques:[], sponsor:['exterieur','rival'], nouveau_coach:['technique','remontee'], jeune_talent:['jeune_defenseur','rival'], etudes:['faute_rapide','exterieur'], academie:['jeune_defenseur','remontee'], documentaire:['exterieur','buzzer'], deadline:['trade_rumeur','remontee'], fans_hostiles:['exterieur','faute_rapide'], prolongation_contrat:['trade_rumeur','prolongation'], point_faible:['faute_rapide','lancers'], vieillissement:['blessure','prolongation'], montee:['rival','exterieur','buzzer'], ete_calme:[], ete_calme2:[]
};
const RIVALITES_EQUIPES=[
  {a:'lac',b:'bos',detail:__("le classique des finales")},
  {a:'nyk',b:'mia',detail:__("le duel des années 90")},
  {a:'chi',b:'det',detail:__("frères ennemis, jeu dur")},
  {a:'lac',b:'lal',detail:__("le derby de la ville")},
  {a:'dal',b:'hou',detail:__("les voisins du Texas")},
  {a:'gsw',b:'cle',detail:__("la trilogie de finales")}
];
const PRENOMS_RIVAUX=['Dario','Kalil','Tayshon','Ronan','Elio','Idris','Teodor','Bastien','Cairo','Soren','Lazar','Nolan','Mateo','Ilyas','Brandt','Kwame','Zavier','Orlan','Lucian','Darnell'];
const NOMS_RIVAUX=['Vance','Okoro','Halvorsen','Mbeki','Castellan','Brightwell','Ndiaye','Kowalczyk','Ferreira','Rourke','Adeyemi','Lindqvist','Maddox','Tanaka','Delacroix','Oyelaran','Voss','Calloway','Ibarra','Sandoval'];
