// Contenu du jeu : franchises, postes, choix, scénarios, situations de match, rivalités
const FRANCHISES=[
  {id:'bos',ville:'Boston',nom:'Harborlights',couleur:'#1B7A4A'},
  {id:'bkn',ville:'Brooklyn',nom:'Voltage',couleur:'#6B7280'},
  {id:'nyk',ville:'New York',nom:'Empire',couleur:'#1D5FD1'},
  {id:'phi',ville:'Philadelphie',nom:'Liberty',couleur:'#1B4F9C'},
  {id:'tor',ville:'Toronto',nom:'Skyline',couleur:'#C8262C'},
  {id:'chi',ville:'Chicago',nom:'Windstorm',couleur:'#CE1141'},
  {id:'cle',ville:'Cleveland',nom:'Steel',couleur:'#7B2E3E'},
  {id:'det',ville:'Detroit',nom:'Motors',couleur:'#1857A4'},
  {id:'ind',ville:'Indiana',nom:'Crossroads',couleur:'#3A4E7C'},
  {id:'mil',ville:'Milwaukee',nom:'Antlers',couleur:'#1E5631'},
  {id:'atl',ville:'Atlanta',nom:'Phoenix',couleur:'#D62828'},
  {id:'cha',ville:'Charlotte',nom:'Current',couleur:'#148F8F'},
  {id:'mia',ville:'Miami',nom:'Blaze',couleur:'#E0311D'},
  {id:'orl',ville:'Orlando',nom:'Wonders',couleur:'#1657B0'},
  {id:'was',ville:'Washington',nom:'Monuments',couleur:'#C8102E'},
  {id:'den',ville:'Denver',nom:'Peaks',couleur:'#3A4E7C'},
  {id:'min',ville:'Minnesota',nom:'Northlights',couleur:'#1C4E80'},
  {id:'okc',ville:'Oklahoma City',nom:'Twisters',couleur:'#1D6FBF'},
  {id:'por',ville:'Portland',nom:'Pioneers',couleur:'#C8262C'},
  {id:'uta',ville:'Utah',nom:'Canyons',couleur:'#3A4E7C'},
  {id:'gsw',ville:'Golden State',nom:'Comets',couleur:'#1D5FA8'},
  {id:'lac',ville:'Los Angeles',nom:'Coastliners',couleur:'#1B5FAE'},
  {id:'lal',ville:'Los Angeles',nom:'Starlight',couleur:'#5B2A8C'},
  {id:'phx',ville:'Phoenix',nom:'Solstice',couleur:'#E8720C'},
  {id:'sac',ville:'Sacramento',nom:'Capitol',couleur:'#5A2D82'},
  {id:'dal',ville:'Dallas',nom:'Rustlers',couleur:'#1650A0'},
  {id:'hou',ville:'Houston',nom:'Orbit',couleur:'#CE1126'},
  {id:'mem',ville:'Memphis',nom:'Rhythm',couleur:'#3A4E7C'},
  {id:'nop',ville:'Nouvelle-Orléans',nom:'Krewe',couleur:'#0E2240'},
  {id:'sas',ville:'San Antonio',nom:'Vaqueros',couleur:'#8A8F98'}
];
const POSITIONS={
  'Meneur':{scoring:50,playmaking:70,defense:48,athletisme:55,basketIQ:65},
  'Arrière':{scoring:68,playmaking:52,defense:50,athletisme:62,basketIQ:52},
  'Ailier':{scoring:58,playmaking:55,defense:58,athletisme:60,basketIQ:55},
  'Ailier fort':{scoring:52,playmaking:42,defense:64,athletisme:62,basketIQ:50},
  'Pivot':{scoring:48,playmaking:38,defense:68,athletisme:58,basketIQ:48}
};
const POOL=[
  {axe:'Performance',texte:"Retravailler ton tir tout l'été",effets:{scoring:4,risqueBlessure:2}},
  {axe:'Performance',texte:'Ajouter des séances de vision de jeu',effets:{playmaking:4}},
  {axe:'Performance',texte:'Renforcement physique intensif',effets:{athletisme:5,risqueBlessure:5}},
  {axe:'Performance',texte:'Travailler ton jeu de dos au panier avec un ancien pivot',effets:{scoring:3,defense:1}},
  {axe:'Performance',texte:'Filmer et analyser chaque possession avec ton staff',effets:{basketIQ:4}},
  {axe:'Performance',texte:'Changer de préparateur physique pour une méthode plus intense',effets:{athletisme:5,risqueBlessure:6}},
  {axe:'Performance',texte:'Ajouter le tir à 3 points à ton arsenal',effets:{scoring:5,risqueBlessure:1}},
  {axe:'Performance',texte:"Prioriser le repos actif plutôt que l'intensité cet été",effets:{athletisme:2,risqueBlessure:-4}},
  {axe:'Performance',texte:'Travailler spécifiquement ta main faible',effets:{playmaking:2,scoring:2}},
  {axe:'Performance',texte:"Jouer en ligue d'été contre des pros confirmés",ageMax:24,effets:{scoring:3,reputation:2,risqueBlessure:3}},
  {axe:'Performance',texte:"Te concentrer sur la lecture défensive plutôt que l'attaque",effets:{defense:4,basketIQ:2}},
  {axe:'Carrière / Contrat',texte:'Pousser pour une prolongation immédiate',effets:{coteEquipe:6}},
  {axe:'Carrière / Contrat',texte:'Explorer discrètement le marché',effets:{reputation:3,coteEquipe:-4}},
  {axe:'Carrière / Contrat',texte:"Accepter un rôle réduit pour l'équipe",effets:{alchimieEquipe:6,reputation:-2}},
  {axe:'Carrière / Contrat',texte:'Accepter un trade vers une équipe qui reconstruit',effets:{reputation:2,coteEquipe:-5}},
  {axe:'Carrière / Contrat',texte:'Négocier une clause de non-échange',effets:{coteEquipe:5}},
  {axe:'Carrière / Contrat',texte:'Prendre un agent plus agressif',effets:{reputation:3,alchimieEquipe:-2}},
  {axe:'Carrière / Contrat',texte:'Accepter de venir du banc pour rejoindre un contender',effets:{coteEquipe:5,reputation:-3}},
  {axe:'Carrière / Contrat',texte:'Refuser une prolongation pour viser la free agency',effets:{reputation:4,coteEquipe:-5}},
  {axe:'Carrière / Contrat',texte:'Devenir le capitaine officieux du vestiaire',ageMin:27,effets:{alchimieEquipe:5,basketIQ:2}},
  {axe:'Carrière / Contrat',texte:'Demander à peser sur les décisions de recrutement',ageMin:29,effets:{coteEquipe:3,reputation:3}},
  {axe:'Carrière / Contrat',texte:'Accepter un contrat plus court pour garder de la flexibilité',ageMin:31,effets:{reputation:2}},
  {axe:'Image / Marque',texte:'Signer avec un petit équipementier',effets:{reputation:5}},
  {axe:'Image / Marque',texte:'Lancer ta propre chaîne de contenu',effets:{reputation:3,coteEquipe:-1}},
  {axe:'Image / Marque',texte:'Rester discret, éviter les médias',effets:{alchimieEquipe:2}},
  {axe:'Image / Marque',texte:"Créer une fondation caritative dans ta ville d'origine",ageMin:27,effets:{reputation:6,alchimieEquipe:2}},
  {axe:'Image / Marque',texte:'Tourner une pub nationale pour une grande marque',effets:{reputation:4,coteEquipe:2}},
  {axe:'Image / Marque',texte:'Répondre à un rival sur les réseaux sociaux',effets:{reputation:4,alchimieEquipe:-2}},
  {axe:'Image / Marque',texte:'Investir dans une startup en dehors du basket',effets:{reputation:2}},
  {axe:'Image / Marque',texte:'Participer à un documentaire sur ta saison',effets:{reputation:6,risqueBlessure:2}},
  {axe:'Image / Marque',texte:'Éviter toute polémique, communication minimale',effets:{alchimieEquipe:2,reputation:-2}},
  {axe:'Image / Marque',texte:'Lancer ta propre marque de vêtements',ageMin:28,effets:{reputation:3}},
  {axe:'Vie perso',texte:'Rentrer aider ta famille cet été',effets:{athletisme:-2,alchimieEquipe:2}},
  {axe:'Vie perso',texte:"Devenir mentor d'un jeune coéquipier",ageMin:27,effets:{alchimieEquipe:5,basketIQ:2}},
  {axe:'Vie perso',texte:'Te consacrer à un projet perso hors basket',effets:{scoring:-2,alchimieEquipe:3}},
  {axe:'Vie perso',texte:'Fonder une famille cette intersaison',ageMin:25,effets:{alchimieEquipe:4,scoring:-2}},
  {axe:'Vie perso',texte:'Reprendre des études à distance en parallèle',ageMax:24,effets:{basketIQ:2,athletisme:-1}},
  {axe:'Vie perso',texte:"Installer toute ta famille dans ta ville d'équipe",ageMin:26,effets:{alchimieEquipe:4}},
  {axe:'Vie perso',texte:"Prendre de la distance avec un ami d'enfance toxique",ageMax:26,effets:{basketIQ:2}},
  {axe:'Vie perso',texte:'Partir en voyage complètement déconnecté du basket',effets:{alchimieEquipe:3,scoring:-2}},
  {axe:'Vie perso',texte:'Consacrer du temps au mentorat dans ton ancien quartier',ageMin:29,effets:{reputation:2,alchimieEquipe:2}},
  {axe:'Vie perso',texte:'Accompagner un proche traversant une période difficile',effets:{athletisme:-2,alchimieEquipe:3}},
  {axe:'Risque / Legacy',texte:'Demander publiquement un trade',effets:{reputation:6,coteEquipe:-8,risqueBlessure:1}},
  {axe:'Risque / Legacy',texte:'Jouer blessé pour un match clé',effets:{reputation:4,risqueBlessure:10}},
  {axe:'Risque / Legacy',texte:'Viser un record personnel cette saison',effets:{scoring:3,risqueBlessure:4}},
  {axe:'Risque / Legacy',texte:'Garantir publiquement un titre cette saison',effets:{reputation:6,risqueBlessure:3}},
  {axe:'Risque / Legacy',texte:'Refuser de sortir malgré la fatigue en fin de match serré',effets:{reputation:4,risqueBlessure:8}},
  {axe:'Risque / Legacy',texte:"Baisser ton salaire pour garder le noyau de l'équipe",ageMin:31,effets:{alchimieEquipe:7,reputation:3}},
  {axe:'Risque / Legacy',texte:'Contester publiquement la stratégie du coach',ageMax:29,effets:{reputation:4,alchimieEquipe:-5}},
  {axe:'Risque / Legacy',texte:'Revenir plus tôt que prévu de blessure pour les playoffs',effets:{reputation:4,risqueBlessure:9}},
  {axe:'Risque / Legacy',texte:'Tenter un enchaînement spectaculaire pour devenir viral',ageMax:25,effets:{reputation:5,risqueBlessure:2}},
  {axe:'Risque / Legacy',texte:'Annoncer vouloir battre un record historique de la ligue',ageMin:29,effets:{scoring:2,risqueBlessure:4}},
  {axe:'Risque / Legacy',texte:"Prendre la défense publique d'un coéquipier controversé",effets:{alchimieEquipe:4,reputation:-2}}
];
const LYCEE_POOL=[
  {axe:'Performance',texte:'Enchaîner un tournoi AAU supplémentaire',effets:{scoring:2,athletisme:2,risqueBlessure:3}},
  {axe:'Carrière / Contrat',texte:'Visiter en priorité les campus offrant le plus de temps de jeu',effets:{coteEquipe:3}},
  {axe:'Image / Marque',texte:"Poster tes highlights toi-même plutôt que d'attendre les recruteurs",effets:{reputation:3}},
  {axe:'Vie perso',texte:'Privilégier une université proche de chez toi',effets:{alchimieEquipe:3}},
  {axe:'Risque / Legacy',texte:'Annoncer publiquement viser une seule année universitaire',effets:{reputation:4,coteEquipe:-1}}
];
const CHEMINS_PREDRAFT=[
  {texte:'NCAA — une seule année (one-and-done)',ageAjout:1,coteDraftMod:2,effets:{scoring:2}},
  {texte:'NCAA — plusieurs années',ageAjout:3,coteDraftMod:5,effets:{basketIQ:3,defense:2}},
  {texte:'G-League Ignite (voie professionnelle directe)',ageAjout:1,coteDraftMod:0,effets:{scoring:2,athletisme:1}},
  {texte:'Jouer un an en Europe',ageAjout:1,coteDraftMod:1,effets:{basketIQ:2,defense:1}},
  {texte:'Te déclarer directement pour la Draft',ageAjout:0,coteDraftMod:-4,effets:{}}
];
const COMBINE_CHOIX=[
  {texte:'Jouer la sécurité, miser sur la régularité',coteDraftMod:2,effets:{}},
  {texte:'Prendre des risques sur les tests athlétiques',coteDraftMod:4,effets:{risqueBlessure:4}},
  {texte:'Privilégier les entretiens avec les franchises',coteDraftMod:3,effets:{reputation:2}},
  {texte:'Privilégier les drills sur le terrain',coteDraftMod:2,effets:{scoring:1}},
  {texte:'Rester toi-même, sans stratégie particulière',coteDraftMod:0,effets:{}}
];
const o=(texte,stat,mod,enjeu,gain,perte,ok,ko)=>({texte,stat,mod,enjeu,gain,perte,ok,ko});
const MATCH_SITUATIONS=[
  {id:'buzzer',titre:'Dernières secondes',contexte:"Égalité, 6 secondes au chrono. Le coach te remet le ballon pour le dernier tir.",choix:[
    o('Tirer à 3 points au buzzer','scoring',-0.15,0.12,{reputation:6},{reputation:-3},'Le ballon rentre, la salle explose.','Le tir touche le cercle. Défaite d\'un point.'),
    o('Attaquer le cercle en pénétration','athletisme',-0.05,0.08,{reputation:4,scoring:1},{risqueBlessure:3},'Tu passes la défense et finis en force.','Le contre est sifflé sans faute. Le match t\'échappe.'),
    o('Passer à un coéquipier démarqué','playmaking',0.05,0.06,{alchimieEquipe:5},{alchimieEquipe:-2},'Ton coéquipier reçoit seul et marque.','La passe est interceptée à quelques secondes de la fin.'),
    o('Demander un temps mort pour dessiner le tir','basketIQ',0.1,0.04,{basketIQ:1,alchimieEquipe:2},{reputation:-1},'Le système fonctionne à la perfection.','Le temps mort laisse la défense se replacer.'),
    o('Provoquer la faute pour aller aux lancers','basketIQ',-0.05,0.07,{reputation:3},{reputation:-2},'La faute est sifflée, tu fais le sans-faute.','Pas de faute sifflée, le tir est forcé et raté.')
  ]},
  {id:'blessure',titre:'Blessure en plein match',contexte:"Tu retombes mal sur la cheville au 3e quart-temps. La douleur est vive, mais le match compte beaucoup.",choix:[
    o('Rester sur le terrain malgré la douleur','athletisme',-0.1,0.08,{reputation:4},{risqueBlessure:12,athletisme:-2},'Tu finis le match et ton équipe te salue.','La cheville lâche. Retour express au vestiaire.'),
    o('Sortir immédiatement te faire examiner','basketIQ',0.3,0.02,{risqueBlessure:-3,alchimieEquipe:2},{reputation:-1},'Rien de grave, tu reviens bientôt.','Tu rates la fin du match mais tu évites le pire.'),
    o('Serrer les dents et finir le quart-temps','athletisme',-0.05,0.05,{reputation:2},{risqueBlessure:6},'Tu tiens bon jusqu\'à la pause.','La douleur te force à sortir plus tôt que prévu.'),
    o('Demander un strap et revenir au 4e quart','basketIQ',0.0,0.05,{reputation:2,alchimieEquipe:1},{risqueBlessure:5},'Le strap tient, tu reviens plus fort.','Le strap ne suffit pas, tu quittes le match.'),
    o('Laisser le coach décider pour toi','basketIQ',0.1,0.03,{alchimieEquipe:3},{alchimieEquipe:-1},'Le coach fait le bon choix pour toi.','Le coach te garde trop longtemps sur le terrain.')
  ]},
  {id:'rival',titre:'Un rival te provoque',contexte:"Ton rival direct te chambre devant tout le stade. Le match est tendu et tout le monde regarde.",choix:[
    o('Répondre sur le terrain en 1 contre 1','scoring',-0.05,0.07,{reputation:5},{reputation:-3},'Tu le prends de vitesse et tu marques sous ses yeux.','Il te contre et la salle se retourne contre toi.'),
    o('Ignorer et rester concentré','basketIQ',0.1,0.04,{basketIQ:1,alchimieEquipe:2},{reputation:-1},'Tu gardes la tête froide et ton équipe suit.','Tu passes pour quelqu\'un qui se laisse marcher dessus.'),
    o('Demander à le défendre toi-même','defense',-0.05,0.07,{reputation:4,defense:1},{reputation:-2},'Tu l\'étouffes toute la deuxième mi-temps.','Il te passe dessus à répétition.'),
    o('Le chambrer publiquement','basketIQ',-0.15,0.08,{reputation:6},{reputation:-4,alchimieEquipe:-2},'Le stade est dans ta poche, le défi est lancé.','Le geste est mal pris et les médias s\'en saisissent.'),
    o('T\'associer à un coéquipier pour le piéger','playmaking',0.0,0.06,{alchimieEquipe:4,reputation:2},{alchimieEquipe:-1},'Le piège fonctionne à la perfection.','Le rival lit le coup et en profite.')
  ]},
  {id:'remontee',titre:'Quinze points de retard',contexte:"Ton équipe est menée de 15 points à 8 minutes de la fin. Il faut tout changer.",choix:[
    o('Presse tout terrain sur toute la longueur','defense',-0.05,0.08,{reputation:3,alchimieEquipe:3},{athletisme:-1},'La pression étouffe l\'adversaire, vous recollez.','L\'équipe s\'épuise et la presse est contournée.'),
    o('Prendre les tirs toi-même','scoring',-0.1,0.09,{reputation:5},{reputation:-3,alchimieEquipe:-2},'Tu enchaînes les paniers, la salle se lève.','Tu forces trop, l\'écart se creuse.'),
    o('Faire circuler le ballon avec patience','playmaking',0.05,0.06,{alchimieEquipe:5},{alchimieEquipe:-1},'Le jeu collectif fait revenir l\'équipe.','Trop de passes, le temps fuit.'),
    o('Accélérer le rythme à tout prix','athletisme',-0.05,0.07,{reputation:3,athletisme:1},{risqueBlessure:4},'Le tempo infernal désarme l\'adversaire.','L\'équipe perd le contrôle et accumule les fautes.'),
    o('Ralentir le jeu pour calmer les esprits','basketIQ',0.0,0.05,{basketIQ:2,alchimieEquipe:2},{reputation:-1},'Le calme revient, le score aussi.','L\'adversaire contrôle désormais le chrono.')
  ]},
  {id:'lancers',titre:'Lancers francs décisifs',contexte:"Faute à 2 secondes de la fin. Un point d'écart. Deux lancers pour gagner le match.",choix:[
    o('Suivre ta routine habituelle','basketIQ',0.05,0.08,{reputation:5},{reputation:-3},'Routine parfaite, les deux lancers rentrent.','Les nerfs te trahissent, un lancer manque.'),
    o('Tirer vite sans réfléchir','scoring',-0.1,0.07,{reputation:4},{reputation:-3},'Le geste est fluide, tu ne penses à rien.','Trop précipité, le ballon ricoche.'),
    o('Prendre ton temps pour calmer la salle','basketIQ',0.0,0.06,{reputation:3,basketIQ:1},{reputation:-2},'Le silence se fait, tu marques.','Le temps joue contre toi, tu perds ta concentration.'),
    o('Viser la planche','scoring',-0.05,0.07,{reputation:3},{reputation:-2},'Le ballon prend la planche et rentre.','Mauvais angle, le ballon ressort.'),
    o('Demander conseil à un coéquipier','playmaking',0.05,0.04,{alchimieEquipe:4},{alchimieEquipe:-1},'Son conseil te rassure, le tir est parfait.','Le doute s\'installe, tu rates.')
  ]},
  {id:'technique',titre:'Technique contre ton coach',contexte:"L'arbitre siffle une technique contre ton entraîneur. L'ambiance bascule d'un coup.",choix:[
    o('Calmer ton coach avant que ça dégénère','basketIQ',0.1,0.04,{alchimieEquipe:4},{alchimieEquipe:-1},'Ton coach te remercie, l\'équipe reste soudée.','Il ne t\'écoute pas et se fait expulser.'),
    o('Parler à l\'arbitre pour apaiser les choses','basketIQ',-0.1,0.06,{reputation:3,alchimieEquipe:2},{reputation:-3},'L\'arbitre t\'écoute et les esprits se calment.','L\'arbitre te siffle aussi une technique.'),
    o('Canaliser la colère dans une série défensive','defense',0.0,0.07,{defense:1,reputation:3},{alchimieEquipe:-1},'Vous verrouillez la raquette et reprenez l\'avantage.','L\'énervement coûte plusieurs fautes bêtes.'),
    o('Te mettre en avant en attaque','scoring',-0.05,0.07,{reputation:4},{reputation:-2},'Tu prends tes responsabilités et tu marques.','Tu forces et l\'équipe en pâtit.'),
    o('Rassembler l\'équipe en cercle','playmaking',0.05,0.05,{alchimieEquipe:5},{alchimieEquipe:-1},'L\'équipe sort soudée de ce moment.','Le geste est mal interprété par le banc.')
  ]},
  {id:'playoffs',titre:'Match décisif des playoffs',contexte:"Match 7. Ton équipe est menée de 4 points à la mi-temps. Le vestiaire est tendu.",choix:[
    o('Prendre la parole devant tout le vestiaire','basketIQ',-0.05,0.1,{reputation:5,alchimieEquipe:4},{reputation:-3,alchimieEquipe:-3},'Ton discours galvanise tout le monde.','Ton discours tombe à plat et la tension monte.'),
    o('Demander la balle sur chaque possession','scoring',-0.1,0.1,{reputation:6},{reputation:-4},'Tu portes l\'équipe sur tes épaules.','Les défenseurs te collent, l\'attaque s\'enraye.'),
    o('Proposer un changement de défense','defense',0.0,0.08,{defense:1,alchimieEquipe:3},{reputation:-1},'Le nouveau schéma désorganise l\'adversaire.','Le changement crée des failles que l\'adversaire exploite.'),
    o('Garder le calme et dérouler le plan','basketIQ',0.1,0.06,{basketIQ:1,alchimieEquipe:2},{reputation:-1},'La discipline paie, vous recollez.','Le plan est trop prudent pour remonter.'),
    o('Prendre le jeu en main pour distribuer','playmaking',0.0,0.08,{alchimieEquipe:5,reputation:3},{alchimieEquipe:-2},'Tout le monde touche la balle et ça marque.','La circulation est trop lente, l\'écart se creuse.')
  ]},
  {id:'exterieur',titre:'Salle hostile',contexte:"Match à l'extérieur : le public te siffle à chaque touche de balle et le bruit est assourdissant.",choix:[
    o('Utiliser les sifflets comme carburant','scoring',-0.05,0.07,{reputation:4,scoring:1},{reputation:-2},'Chaque sifflet te donne plus d\'énergie, tu domines.','Le bruit te déstabilise et tu enchaînes les pertes de balle.'),
    o('Te concentrer sur ta routine habituelle','basketIQ',0.1,0.05,{basketIQ:1,alchimieEquipe:2},{reputation:-1},'Tu restes dans ta bulle et le match se déroule comme prévu.','La routine ne suffit pas à couvrir le bruit.'),
    o('Calmer le jeu pour faire taire la salle','playmaking',0.0,0.06,{alchimieEquipe:3,reputation:2},{alchimieEquipe:-1},'Le rythme lent éteint peu à peu le public.','L\'adversaire profite de la lenteur pour prendre l\'avantage.'),
    o('Défendre avec agressivité pour imposer ton tempo','defense',-0.05,0.07,{defense:1,reputation:3},{risqueBlessure:3},'Ta défense étouffe l\'adversaire et la salle se tait.','Les fautes s\'accumulent et le coach te retire du jeu.'),
    o('Chercher le contact pour provoquer des fautes','athletisme',-0.05,0.06,{reputation:3},{risqueBlessure:4},'Tu vas sur la ligne des lancers à répétition.','Les arbitres ne sifflent pas et tu encaisses les coups.')
  ]},
  {id:'retour',titre:'Premier match après ta blessure',contexte:"Tu rentres pour la première fois depuis ta blessure. Le staff t'a fixé une limite de minutes.",choix:[
    o('Respecter les minutes prévues','basketIQ',0.2,0.03,{risqueBlessure:-3,alchimieEquipe:2},{reputation:-1},'Tu respectes le plan et ton corps suit.','Le plan est respecté mais ton rythme n\'est pas encore là.'),
    o('Tester ton corps sur quelques actions physiques','athletisme',-0.1,0.06,{athletisme:1,reputation:2},{risqueBlessure:8},'Ton corps répond bien et la confiance revient.','Une douleur surgit et tu dois lever le pied.'),
    o('Jouer avec prudence en évitant les contacts','basketIQ',0.0,0.04,{basketIQ:1,risqueBlessure:-2},{reputation:-1},'Tu lis le jeu et tu évites les risques inutiles.','À force de prudence, tu ne pèses pas sur le match.'),
    o('Chercher ton rythme sur le tir à mi-distance','scoring',-0.05,0.05,{scoring:1,reputation:2},{reputation:-1},'Les premiers tirs rentrent, tu retrouves tes repères.','Tes tirs manquent de précision après l\'arrêt.'),
    o('Demander plus de minutes au coach','athletisme',-0.1,0.07,{reputation:4},{risqueBlessure:7,reputation:-1},'Le coach te fait confiance et tu réponds présent.','Le coach te laisse jouer et ton corps fatigue vite.')
  ]},
  {id:'trade_rumeur',titre:'Rumeurs de transfert',contexte:"Pendant l'échauffement, une rumeur circule : ta franchise discuterait de ton départ.",choix:[
    o('Prouver sur le terrain que tu mérites ta place','scoring',-0.05,0.07,{reputation:4,coteEquipe:3},{coteEquipe:-3},'Tu réponds par un match énorme, la direction te regarde autrement.','Tu forces ton jeu et la rumeur n\'en devient que plus crédible.'),
    o('Demander des explications au coach','basketIQ',-0.05,0.05,{coteEquipe:2,alchimieEquipe:1},{alchimieEquipe:-2},'Le coach te rassure sincèrement.','La conversation tourne court et laisse un malaise.'),
    o('Ignorer et jouer ton match','basketIQ',0.1,0.04,{basketIQ:1,alchimieEquipe:2},{reputation:-1},'Tu restes concentré et l\'équipe te suit.','Tu penses trop à la rumeur et ça se voit.'),
    o('Faire passer un message à tes coéquipiers','playmaking',0.0,0.05,{alchimieEquipe:4},{alchimieEquipe:-1},'Tes coéquipiers te soutiennent et se serrent les coudes.','Le message est mal compris et crée des tensions.'),
    o('Répondre aux journalistes à la mi-temps','basketIQ',-0.1,0.06,{reputation:4},{reputation:-3,alchimieEquipe:-2},'Ta réponse est applaudie par les supporters.','Ta phrase est reprise hors contexte par les médias.')
  ]}
];
const c=(axe,texte,effets)=>({axe,texte,effets});
const SCENARIOS=[
  {id:'rookie',generique:false,cond:e=>e.saison===1,
   question:'Première saison en pro : comment abordes-tu ton arrivée ?',
   contexte:e=>{const p=e.draftPick; return `Tu as été sélectionné au pick n°${p} par les ${e.franchise.ville} ${e.franchise.nom}. Les attentes sont ${p<=5?'énormes':p<=14?'élevées':'modestes'} et tout le monde te regarde.`;},
   choix:[
    c('Performance','Arriver en avance au centre d\'entraînement chaque jour',{basketIQ:2,athletisme:2,risqueBlessure:2}),
    c('Carrière / Contrat','Demander un rôle clair au coach dès le premier match',{coteEquipe:3,reputation:1}),
    c('Image / Marque','Rester discret et laisser parler tes performances',{alchimieEquipe:3}),
    c('Vie perso','T\'installer en ville avec ta famille proche',{alchimieEquipe:4}),
    c('Risque / Legacy','Annoncer viser le titre de Rookie de l\'année',{reputation:5,risqueBlessure:2})
  ]},
  {id:'champion',generique:false,cond:e=>e.bilan&&e.bilan.titre,
   question:'Champion ! Comment vis-tu cet été de titre ?',
   contexte:e=>`Les ${e.franchise.ville} ${e.franchise.nom} ont remporté le titre. Les sponsors et les médias se pressent autour de toi.`,
   choix:[
    c('Performance','Reprendre l\'entraînement dès la semaine suivante',{athletisme:2,scoring:2,risqueBlessure:3}),
    c('Carrière / Contrat','Négocier une prolongation en position de force',{coteEquipe:6,reputation:2}),
    c('Image / Marque','Signer avec un équipementier de renommée mondiale',{reputation:6}),
    c('Vie perso','Fêter le titre dans ta ville d\'origine avec tes proches',{alchimieEquipe:4,reputation:2,risqueBlessure:-3}),
    c('Risque / Legacy','Annoncer publiquement vouloir réussir le doublé',{reputation:5,risqueBlessure:3})
  ]},
  {id:'blessure',generique:false,cond:e=>e.bilan&&e.bilan.blessure,
   question:'Blessé la saison dernière : comment reviens-tu ?',
   contexte:e=>`Une blessure a écourté ta saison. Ton corps est fragile et le staff médical te demande d'être prudent.`,
   choix:[
    c('Performance','Suivre un programme de rééducation sans brûler d\'étapes',{risqueBlessure:-12,athletisme:1}),
    c('Carrière / Contrat','Accepter un rôle réduit le temps de retrouver ton niveau',{alchimieEquipe:3,risqueBlessure:-4,reputation:-1}),
    c('Image / Marque','Raconter ta rééducation sur les réseaux sociaux',{reputation:4}),
    c('Vie perso','Prendre un mois de repos complet avec ta famille',{risqueBlessure:-10,alchimieEquipe:2}),
    c('Risque / Legacy','Revenir plus tôt que prévu pour le début de saison',{reputation:4,risqueBlessure:10})
  ]},
  {id:'etoile',generique:false,cond:e=>e.bilan&&(e.bilan.mvp||e.bilan.allStar),
   question:'Tu es une star de la ligue : jusqu\'où vas-tu viser ?',
   contexte:e=>`${e.bilan.mvp?'Élu MVP':'Sélectionné All-Star'} cette saison, tu es désormais l'un des visages de la ligue.`,
   choix:[
    c('Performance','Ajouter un nouveau geste technique à ton arsenal',{scoring:3,playmaking:2}),
    c('Carrière / Contrat','Demander à devenir le joueur franchise de l\'équipe',{reputation:4,coteEquipe:4}),
    c('Image / Marque','Lancer ta propre ligne de sneakers',{reputation:6}),
    c('Vie perso','Monter ta fondation dans ton quartier d\'origine',{reputation:3,alchimieEquipe:3}),
    c('Risque / Legacy','Viser un record historique de la ligue cette saison',{scoring:2,reputation:4,risqueBlessure:4})
  ]},
  {id:'echec',generique:false,cond:e=>e.bilan&&e.bilan.total>0&&e.bilan.rates/e.bilan.total>=0.6,
   question:'Saison compliquée : comment réponds-tu aux critiques ?',
   contexte:e=>`Tu as raté ${e.bilan.rates} moment${e.bilan.rates>1?'s':''} clé${e.bilan.rates>1?'s':''} sur ${e.bilan.total}. Les médias et une partie des supporters te critiquent.`,
   choix:[
    c('Performance','Travailler spécifiquement tes décisions en fin de match',{basketIQ:4}),
    c('Carrière / Contrat','Demander au coach un rôle plus protégé',{basketIQ:1,reputation:-2}),
    c('Image / Marque','Répondre calmement aux critiques en conférence de presse',{reputation:3}),
    c('Vie perso','Consulter un préparateur mental',{basketIQ:3,alchimieEquipe:1}),
    c('Risque / Legacy','Promettre publiquement de faire taire tes détracteurs',{reputation:5,risqueBlessure:2,alchimieEquipe:-2})
  ]},
  {id:'decisif',generique:false,cond:e=>e.bilan&&e.bilan.total>0&&e.bilan.rates===0,
   question:'Décisif dans les moments clés : comment capitalises-tu ?',
   contexte:e=>`Tu as réussi tes ${e.bilan.total} moments clés. L'équipe te fait confiance dans les dernières possessions.`,
   choix:[
    c('Performance','Répéter tout l\'été les situations de fin de match',{basketIQ:3,scoring:2}),
    c('Carrière / Contrat','Demander le statut de capitaine',{alchimieEquipe:4,coteEquipe:3}),
    c('Image / Marque','Devenir le visage de la campagne de la franchise',{reputation:5,coteEquipe:2}),
    c('Vie perso','Partager la gloire avec tes coéquipiers lors d\'un voyage d\'équipe',{alchimieEquipe:5}),
    c('Risque / Legacy','Réclamer publiquement le dernier tir à chaque match',{reputation:4,alchimieEquipe:-3,scoring:1})
  ]},
  {id:'fragile',generique:false,cond:e=>e.meta.risqueBlessure>=45,
   question:'Ton corps t\'envoie des signaux d\'alerte : que fais-tu ?',
   contexte:e=>`Ton risque de blessure est élevé (${e.meta.risqueBlessure}/100). Le staff médical s'inquiète.`,
   choix:[
    c('Performance','Réduire ta charge d\'entraînement cet été',{risqueBlessure:-10,athletisme:-1}),
    c('Carrière / Contrat','Négocier une gestion des minutes avec le coach',{risqueBlessure:-6,coteEquipe:-2}),
    c('Image / Marque','Limiter tes apparitions médiatiques pour te reposer',{risqueBlessure:-4,reputation:-1}),
    c('Vie perso','Changer ton hygiène de vie : sommeil et nutrition',{risqueBlessure:-8,athletisme:1}),
    c('Risque / Legacy','Ignorer les alertes et enchaîner les matchs',{scoring:2,risqueBlessure:8})
  ]},
  {id:'tension',generique:false,cond:e=>e.meta.alchimieEquipe<=38,
   question:'Le vestiaire est tendu : comment recolles-tu les morceaux ?',
   contexte:e=>`L'ambiance dans le groupe s'est dégradée ces derniers mois (alchimie ${e.meta.alchimieEquipe}/100).`,
   choix:[
    c('Performance','Proposer des séances collectives supplémentaires',{alchimieEquipe:4,basketIQ:1}),
    c('Carrière / Contrat','Parler franchement au coach et à la direction',{alchimieEquipe:3,reputation:1}),
    c('Image / Marque','Prendre la défense du groupe devant la presse',{alchimieEquipe:4,reputation:2}),
    c('Vie perso','Organiser un week-end d\'équipe loin du basket',{alchimieEquipe:6}),
    c('Risque / Legacy','Confronter publiquement le coéquipier qui pose problème',{alchimieEquipe:-3,reputation:4})
  ]},
  {id:'cote_basse',generique:false,cond:e=>e.meta.reputation<=30||e.meta.coteEquipe<=30,
   question:'Ta cote baisse : comment relances-tu ta carrière ?',
   contexte:e=>`Ta réputation (${e.meta.reputation}/100) et ta cote auprès de l'équipe (${e.meta.coteEquipe}/100) ne sont plus ce qu'elles étaient.`,
   choix:[
    c('Performance','Te spécialiser dans le domaine où tu excelles',{scoring:3}),
    c('Carrière / Contrat','Envisager un transfert vers un projet plus ambitieux',{coteEquipe:-3,reputation:3}),
    c('Image / Marque','Lancer une série de contenus pour raconter ton histoire',{reputation:5}),
    c('Vie perso','Retourner t\'entraîner dans ton ancien quartier',{reputation:2,alchimieEquipe:2}),
    c('Risque / Legacy','Défier publiquement les meilleurs joueurs de la ligue',{reputation:6,risqueBlessure:3})
  ]},
  {id:'contrat',generique:false,cond:e=>e.saison>=3&&e.saison<=4&&e.age<=25,
   question:'Ton contrat rookie touche à sa fin : quelle stratégie ?',
   contexte:e=>`Dans un an, tu pourras négocier ton premier gros contrat avec les ${e.franchise.ville} ${e.franchise.nom} ou ailleurs.`,
   choix:[
    c('Performance','Soigner tes statistiques pour augmenter ta valeur',{scoring:3,playmaking:1}),
    c('Carrière / Contrat','Pousser pour une prolongation immédiate',{coteEquipe:6}),
    c('Image / Marque','Soigner ton image pour attirer les grands sponsors',{reputation:5}),
    c('Vie perso','Prendre conseil auprès d\'un ancien joueur de confiance',{basketIQ:2,alchimieEquipe:1}),
    c('Risque / Legacy','Refuser la prolongation pour viser la free agency',{reputation:4,coteEquipe:-5})
  ]},
  {id:'veteran',generique:false,cond:e=>e.age>=33,
   question:'Les années pèsent : comment prolonges-tu ta carrière ?',
   contexte:e=>`À ${e.age} ans, ton corps ne répond plus comme avant, mais ton expérience reste un atout.`,
   choix:[
    c('Performance','Adapter ton jeu pour économiser ton corps',{basketIQ:3,athletisme:-1,risqueBlessure:-6}),
    c('Carrière / Contrat','Accepter un contrat plus court dans un rôle d\'expérience',{coteEquipe:2,alchimieEquipe:2}),
    c('Image / Marque','Préparer ta reconversion médiatique',{reputation:3}),
    c('Vie perso','Passer plus de temps en famille pendant l\'intersaison',{alchimieEquipe:3,risqueBlessure:-4}),
    c('Risque / Legacy','Viser un dernier titre quoi qu\'il en coûte',{reputation:4,risqueBlessure:8,scoring:1})
  ]},
  {id:'mi_carriere',generique:true,cond:e=>e.age>=26&&e.age<=32,
   question:'Quelle marque veux-tu laisser dans la ligue ?',
   contexte:e=>`À ${e.age} ans, tu es au cœur de ta carrière. C'est le moment de construire ce qu'on retiendra de toi.`,
   choix:[
    c('Performance','Travailler ton point faible tout l\'été',{basketIQ:2,defense:2}),
    c('Carrière / Contrat','Devenir le capitaine officieux du vestiaire',{alchimieEquipe:5,basketIQ:1}),
    c('Image / Marque','Créer une fondation caritative dans ta ville d\'origine',{reputation:6}),
    c('Vie perso','Devenir le mentor d\'un jeune coéquipier',{alchimieEquipe:4,basketIQ:2}),
    c('Risque / Legacy','Demander publiquement à rejoindre un prétendant au titre',{reputation:5,coteEquipe:-6})
  ]},
  {id:'montee',generique:true,cond:e=>e.age<=25,
   question:'Tu montes en puissance : où investis-tu tes efforts cette année ?',
   contexte:e=>`À ${e.age} ans, tu progresses vite et les autres franchises commencent à te surveiller.`,
   choix:[
    c('Performance','Passer l\'été avec un coach spécialisé dans ton poste',{scoring:2,basketIQ:2,defense:1}),
    c('Carrière / Contrat','Demander plus de responsabilités dans le jeu de l\'équipe',{coteEquipe:3,reputation:2}),
    c('Image / Marque','Accepter une série d\'interviews pour te faire connaître',{reputation:4}),
    c('Vie perso','Rester entouré de ta famille et de ton cercle proche',{alchimieEquipe:3,risqueBlessure:-3}),
    c('Risque / Legacy','Annoncer viser ta première sélection All-Star',{reputation:5,risqueBlessure:2})
  ]},
  {id:'ete_calme',generique:true,cond:e=>true,
   question:'Intersaison tranquille : comment emploies-tu ton été ?',
   contexte:e=>`Aucune urgence cette année. Tu as le temps de choisir où investir tes efforts.`,
   choix:[
    c('Performance','Développer une nouvelle arme offensive',{scoring:4,risqueBlessure:2}),
    c('Carrière / Contrat','Rencontrer les dirigeants pour parler de ton avenir',{coteEquipe:4}),
    c('Image / Marque','Tourner une publicité nationale',{reputation:4,coteEquipe:1}),
    c('Vie perso','Partir en voyage pour recharger les batteries',{risqueBlessure:-6,alchimieEquipe:2}),
    c('Risque / Legacy','Défier un rival lors d\'un camp d\'été public',{reputation:5,risqueBlessure:3})
  ]},
  {id:'selection',generique:false,cond:e=>e.saison>=3&&e.saison%3===0&&!!e.pays&&e.pays!=='Autre',
   question:'La sélection nationale t\'appelle : que réponds-tu ?',
   contexte:e=>`Le sélectionneur de ${e.pays} compte sur toi pour la prochaine fenêtre internationale. Ton pays t'attend, ta franchise aussi.`,
   choix:e=>[
    c('Performance','Rejoindre le stage de préparation et jouer tous les matchs',{playmaking:2,defense:2,risqueBlessure:2}),
    c('Carrière / Contrat','Négocier avec ta franchise un calendrier adapté',{coteEquipe:3,reputation:1}),
    c('Image / Marque',`Porter fièrement les couleurs de ${e.pays} sur tes réseaux`,{reputation:5}),
    c('Vie perso','Profiter du voyage pour retrouver ta famille et tes amis au pays',{alchimieEquipe:3,risqueBlessure:-4}),
    c('Risque / Legacy','Enchaîner saison et sélection sans aucun repos',{reputation:4,scoring:2,risqueBlessure:5})
  ]},
  {id:'champion2',generique:false,cond:e=>e.bilan&&e.bilan.titre,
   question:'Tu es sur le toit de la ligue : comment restes-tu affamé ?',
   contexte:e=>`Avec le titre en poche, tout le monde veut battre les ${e.franchise.nom}. Le plus dur, c'est de rester au sommet.`,
   choix:[
    c('Performance','Te fixer un nouvel objectif de progression chiffré',{scoring:2,basketIQ:2}),
    c('Carrière / Contrat','Demander à la direction de renforcer l\'effectif',{coteEquipe:3,alchimieEquipe:2}),
    c('Image / Marque','Refuser les sollicitations pour rester concentré',{alchimieEquipe:3,reputation:-1}),
    c('Vie perso','Prendre deux semaines de vraies vacances',{risqueBlessure:-6,alchimieEquipe:2}),
    c('Risque / Legacy','Lancer un défi public à tous les prétendants',{reputation:5,risqueBlessure:2})
  ]},
  {id:'blessure2',generique:false,cond:e=>e.bilan&&e.bilan.blessure,
   question:'De retour de blessure : à quel rythme reprends-tu ?',
   contexte:e=>`Tu es rétabli sur le papier, mais ton corps garde la trace de ta dernière blessure.`,
   choix:[
    c('Performance','Reprendre par un travail de renforcement ciblé',{athletisme:2,risqueBlessure:-8}),
    c('Carrière / Contrat','Négocier un plan de retour progressif avec le staff',{risqueBlessure:-5,coteEquipe:1}),
    c('Image / Marque','Rester discret pour te concentrer sur ta forme',{risqueBlessure:-3}),
    c('Vie perso','Consulter un second avis médical',{risqueBlessure:-6,basketIQ:1}),
    c('Risque / Legacy','Te déclarer à 100 % pour retrouver ta place de titulaire',{reputation:3,risqueBlessure:9})
  ]},
  {id:'etoile2',generique:false,cond:e=>e.bilan&&(e.bilan.mvp||e.bilan.allStar),
   question:'Les défenses te ciblent : comment t\'adaptes-tu ?',
   contexte:e=>`Après ta belle saison, les adversaires préparent des défenses spécialement contre toi.`,
   choix:[
    c('Performance','Travailler ta lecture des prises à deux',{playmaking:3,basketIQ:2}),
    c('Carrière / Contrat','Demander des systèmes qui t\'éloignent du ballon',{alchimieEquipe:3,coteEquipe:1}),
    c('Image / Marque','Parler publiquement du traitement dont tu fais l\'objet',{reputation:3}),
    c('Vie perso','Échanger avec un ancien All-Star qui a vécu la même chose',{basketIQ:3}),
    c('Risque / Legacy','Provoquer les défenses en prenant encore plus de tirs',{scoring:2,reputation:3,alchimieEquipe:-2})
  ]},
  {id:'echec2',generique:false,cond:e=>e.bilan&&e.bilan.total>0&&e.bilan.rates/e.bilan.total>=0.6,
   question:'Le doute s\'installe : comment reprends-tu confiance ?',
   contexte:e=>`Avec ${e.bilan.rates} moment${e.bilan.rates>1?'s':''} clé${e.bilan.rates>1?'s':''} raté${e.bilan.rates>1?'s':''} sur ${e.bilan.total}, tu te demandes si tu es à la hauteur.`,
   choix:[
    c('Performance','Refaire des séries de tirs sous fatigue chaque jour',{scoring:3,athletisme:1}),
    c('Carrière / Contrat','Demander à tes coéquipiers d\'être plus présents sur les dernières possessions',{alchimieEquipe:3}),
    c('Image / Marque','Faire une pause avec les réseaux sociaux',{alchimieEquipe:1,reputation:-1}),
    c('Vie perso','Parler à un ancien joueur qui a connu le même passage à vide',{basketIQ:2,alchimieEquipe:2}),
    c('Risque / Legacy','Demander publiquement la balle sur chaque dernier tir',{reputation:5,alchimieEquipe:-2})
  ]},
  {id:'decisif2',generique:false,cond:e=>e.bilan&&e.bilan.total>0&&e.bilan.rates===0,
   question:'Tout le monde compte sur toi : comment gères-tu la confiance ?',
   contexte:e=>`Ton sang-froid est devenu ta signature. Ton coach et ton équipe comptent sur toi à chaque fin de match.`,
   choix:[
    c('Performance','Étudier les défenses de fin de match de tes adversaires',{basketIQ:4}),
    c('Carrière / Contrat','Négocier une prime liée aux moments décisifs',{reputation:2,coteEquipe:2}),
    c('Image / Marque','Accepter une série d\'interviews sur ta mentalité de gagnant',{reputation:4}),
    c('Vie perso','Garder tes habitudes d\'avant-match pour ne pas te déconcentrer',{basketIQ:2,alchimieEquipe:2}),
    c('Risque / Legacy','Te lancer le défi de gagner un match à toi seul',{reputation:5,risqueBlessure:3,alchimieEquipe:-2})
  ]},
  {id:'fragile2',generique:false,cond:e=>e.meta.risqueBlessure>=45,
   question:'Ton physique t\'inquiète : quelle stratégie à long terme ?',
   contexte:e=>`À ${e.age} ans, ton corps accumule la fatigue (risque de blessure ${e.meta.risqueBlessure}/100).`,
   choix:[
    c('Performance','Mettre en place une préparation physique personnalisée',{risqueBlessure:-10,athletisme:1}),
    c('Carrière / Contrat','Accepter de sauter quelques matchs de saison régulière',{risqueBlessure:-7,coteEquipe:-1}),
    c('Image / Marque','Annuler tes engagements commerciaux de l\'été',{risqueBlessure:-5,reputation:-2}),
    c('Vie perso','Prendre soin de ton sommeil et de ton alimentation',{risqueBlessure:-6}),
    c('Risque / Legacy','Continuer au même rythme tant que ça tient',{scoring:2,reputation:2,risqueBlessure:7})
  ]},
  {id:'tension2',generique:false,cond:e=>e.meta.alchimieEquipe<=45,
   question:'Un coéquipier te défie : comment réagis-tu ?',
   contexte:e=>`Un coéquipier remet ton rôle en cause devant les autres joueurs. Toute l'équipe regarde ta réaction.`,
   choix:[
    c('Performance','Répondre par ton travail à l\'entraînement',{basketIQ:1,alchimieEquipe:2}),
    c('Carrière / Contrat','Demander une rencontre avec le coach pour clarifier les rôles',{alchimieEquipe:3}),
    c('Image / Marque','Éviter que l\'histoire sorte dans les médias',{alchimieEquipe:1,reputation:1}),
    c('Vie perso','Inviter ce coéquipier chez toi pour désamorcer le conflit',{alchimieEquipe:5}),
    c('Risque / Legacy','Le recadrer devant tout le groupe',{alchimieEquipe:-3,reputation:3})
  ]},
  {id:'cote_basse2',generique:false,cond:e=>e.meta.reputation<=30||e.meta.coteEquipe<=30,
   question:'Les rumeurs de départ circulent : comment les gères-tu ?',
   contexte:e=>`On parle de toi comme d'un joueur sur le déclin. Les ${e.franchise.ville} ${e.franchise.nom} réfléchissent à leur avenir avec toi.`,
   choix:[
    c('Performance','Prouver ta valeur dès le début de saison',{scoring:2,defense:2}),
    c('Carrière / Contrat','Demander une prolongation pour te rassurer',{coteEquipe:4,reputation:-1}),
    c('Image / Marque','Démentir publiquement les rumeurs',{reputation:3}),
    c('Vie perso','Prendre du recul et ne plus lire les commentaires',{alchimieEquipe:2}),
    c('Risque / Legacy','Demander toi-même à être échangé',{reputation:3,coteEquipe:-5})
  ]},
  {id:'veteran2',generique:false,cond:e=>e.age>=34,
   question:'Dernière ligne droite : quel héritage laisses-tu ?',
   contexte:e=>`À ${e.age} ans, chaque saison peut être la dernière. Les jeunes te regardent comme une référence.`,
   choix:[
    c('Performance','Te concentrer sur ton rôle de sixième homme de luxe',{basketIQ:3,alchimieEquipe:2}),
    c('Carrière / Contrat','Négocier une dernière année seulement',{coteEquipe:2,reputation:1}),
    c('Image / Marque','Écrire ton autobiographie',{reputation:4}),
    c('Vie perso','Organiser un camp de basket pour les jeunes de ton quartier',{reputation:3,alchimieEquipe:2}),
    c('Risque / Legacy','Tout donner sur une dernière saison à haut rendement',{scoring:2,reputation:4,risqueBlessure:8})
  ]},
  {id:'mi_carriere2',generique:true,cond:e=>e.age>=26&&e.age<=32,
   question:'Tu es au cœur de ta carrière : comment durer ?',
   contexte:e=>`À ${e.age} ans, tu dois penser à ton corps autant qu'à ton jeu.`,
   choix:[
    c('Performance','Travailler ta récupération autant que ton tir',{risqueBlessure:-5,scoring:2}),
    c('Carrière / Contrat','Négocier un contrat long avec ta franchise',{coteEquipe:4}),
    c('Image / Marque','Diversifier tes revenus avec des partenariats durables',{reputation:4}),
    c('Vie perso','Te faire accompagner pour ta santé mentale',{alchimieEquipe:3,basketIQ:1}),
    c('Risque / Legacy','Tenter un virage tactique en changeant ton style de jeu',{playmaking:3,scoring:-1,reputation:2})
  ]},
  {id:'ete_calme2',generique:true,cond:e=>true,
   question:'Une intersaison pour souffler ou pour progresser ?',
   contexte:e=>`Aucun dossier urgent cette année : à toi de choisir ton rythme.`,
   choix:[
    c('Performance','Faire un camp d\'entraînement avec d\'anciens joueurs',{basketIQ:3,scoring:1}),
    c('Carrière / Contrat','Planifier la suite de ta carrière avec ton agent',{coteEquipe:3,reputation:1}),
    c('Image / Marque','Lancer ton podcast basket',{reputation:4}),
    c('Vie perso','Passer l\'été à voyager avec tes proches',{alchimieEquipe:3,risqueBlessure:-5}),
    c('Risque / Legacy','Tenter un défi médiatique avec un autre joueur',{reputation:4,risqueBlessure:2})
  ]},
  {id:'rival_promo',generique:false,intro:'promo',cond:e=>e.saison>=2&&!possede('promo'),
   question:'Un joueur de ta promotion te suit de près : comment l\'abordes-tu ?',
   contexte:(e,r)=>`${r.nom}, ${r.poste.toLowerCase()} de ${r.equipe}, a été drafté juste après toi. Les médias vous comparent chaque semaine.`,
   choix:(e,r)=>[
    c('Performance',`Étudier le jeu de ${r.court} pour mieux le contrer`,{basketIQ:3}),
    c('Carrière / Contrat',`Demander à ton coach de te placer sur ${r.court} à chaque duel`,{coteEquipe:2,reputation:2,rivalite:1}),
    c('Image / Marque',`Entretenir la comparaison avec ${r.court} dans la presse`,{reputation:4,rivalite:1}),
    c('Vie perso',`Prendre un café avec ${r.court} pour désamorcer la tension`,{alchimieEquipe:2,rivalite:-1}),
    c('Risque / Legacy',`Défier publiquement ${r.court} de te battre sur le terrain`,{reputation:5,risqueBlessure:3,rivalite:2})
  ]},
  {id:'rival_veteran',generique:false,intro:'veteran',cond:e=>e.saison>=3&&!possede('veteran'),
   question:'Une légende de la ligue bloque ton chemin : comment la détrôner ?',
   contexte:(e,r)=>`${r.nom}, ${r.poste.toLowerCase()} de ${r.equipe}, domine la ligue depuis des années. Tant qu'il est là, personne ne te voit comme le meilleur.`,
   choix:(e,r)=>[
    c('Performance',`Passer l\'été à travailler les points forts de ${r.court}`,{scoring:2,defense:2}),
    c('Carrière / Contrat',`Réclamer plus de responsabilités pour prendre la place de ${r.court}`,{coteEquipe:3,reputation:2,rivalite:1}),
    c('Image / Marque',`Dire publiquement que tu vises la place de ${r.court}`,{reputation:5,rivalite:2}),
    c('Vie perso',`Demander conseil à ${r.court} après un match`,{basketIQ:3,rivalite:-1}),
    c('Risque / Legacy',`Prendre les tirs décisifs pour voler la vedette à ${r.court}`,{reputation:4,risqueBlessure:3,rivalite:1})
  ]},
  {id:'rival_ancien',generique:false,intro:'ancien',cond:e=>e.saison>=5&&!possede('ancien'),
   question:'Ton ancien coéquipier est parti chez un rival : comment le vis-tu ?',
   contexte:(e,r)=>`${r.nom}, avec qui tu as partagé le vestiaire, a rejoint ${r.equipe}. Les supporters se demandent de quel côté tu es.`,
   choix:(e,r)=>[
    c('Performance',`Utiliser ce que tu sais des habitudes de ${r.court} pour le préparer`,{basketIQ:3,rivalite:1}),
    c('Carrière / Contrat',`Conseiller à ta direction de proposer un retour à ${r.court}`,{coteEquipe:2,rivalite:-1}),
    c('Image / Marque',`Souhaiter bonne chance à ${r.court} publiquement`,{reputation:3,rivalite:-1}),
    c('Vie perso',`Rester en contact avec ${r.court} malgré la rivalité`,{alchimieEquipe:3,rivalite:-1}),
    c('Risque / Legacy',`Lancer à ${r.court} qu\'il regrettera son choix`,{reputation:5,alchimieEquipe:-2,rivalite:2})
  ]},
  {id:'rival_media',generique:false,intro:'media',cond:e=>e.saison>=6&&e.meta.reputation>=55&&!possede('media'),
   question:'Un rival te cherche dans la presse : comment réponds-tu ?',
   contexte:(e,r)=>`${r.nom} (${r.equipe}) multiplie les déclarations contre toi. Chaque interview alimente le duel.`,
   choix:(e,r)=>[
    c('Performance','Répondre uniquement sur le terrain',{scoring:2,basketIQ:1,rivalite:1}),
    c('Carrière / Contrat',`Demander à ton agent de calmer le jeu avec les représentants de ${r.court}`,{reputation:1,rivalite:-1}),
    c('Image / Marque',`Répondre point par point à ${r.court} en conférence de presse`,{reputation:4,rivalite:1}),
    c('Vie perso','Couper les réseaux sociaux quelques semaines',{alchimieEquipe:2,rivalite:-1}),
    c('Risque / Legacy','Lancer une punchline qui devient virale',{reputation:6,alchimieEquipe:-2,rivalite:2})
  ]}
];
const SCENARIO_MATCHS={
  rookie:['rival','technique','exterieur'], champion:['playoffs','buzzer','exterieur'], champion2:['playoffs','remontee','lancers'],
  blessure:['blessure','retour'], blessure2:['retour','remontee'], etoile:['rival','buzzer','exterieur'], etoile2:['technique','remontee','rival'],
  echec:['lancers','buzzer','playoffs'], echec2:['lancers','remontee','buzzer'], decisif:['buzzer','lancers','playoffs'], decisif2:['playoffs','buzzer'],
  fragile:['blessure','retour'], fragile2:['blessure','retour','remontee'], tension:['technique','rival'], tension2:['technique','rival'],
  cote_basse:['trade_rumeur','rival'], cote_basse2:['trade_rumeur','exterieur'], contrat:['trade_rumeur','lancers'],
  veteran:['remontee','blessure','lancers'], veteran2:['remontee','playoffs','lancers'], mi_carriere:['playoffs','remontee','trade_rumeur'],
  mi_carriere2:['blessure','remontee'], selection:['exterieur','playoffs'], montee:['rival','exterieur','buzzer'], ete_calme:[], ete_calme2:[]
};
const RIVALITES_EQUIPES=[
  {a:'lac',b:'bos',detail:'le classique des finales'},
  {a:'nyk',b:'mia',detail:'le duel des années 90'},
  {a:'chi',b:'det',detail:'frères ennemis, jeu dur'},
  {a:'lac',b:'lal',detail:'le derby de la ville'},
  {a:'dal',b:'hou',detail:'les voisins du Texas'},
  {a:'gsw',b:'cle',detail:'la trilogie de finales'}
];
const PRENOMS_RIVAUX=['Dario','Kalil','Tayshon','Ronan','Elio','Idris','Teodor','Bastien','Cairo','Soren','Lazar','Nolan','Mateo','Ilyas','Brandt','Kwame','Zavier','Orlan','Lucian','Darnell'];
const NOMS_RIVAUX=['Vance','Okoro','Halvorsen','Mbeki','Castellan','Brightwell','Ndiaye','Kowalczyk','Ferreira','Rourke','Adeyemi','Lindqvist','Maddox','Tanaka','Delacroix','Oyelaran','Voss','Calloway','Ibarra','Sandoval'];
