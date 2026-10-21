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
  {texte:__("NCAA — Division I (université)"),fac:1,ageAjout:0,coteDraftMod:2,effets:{scoring:2}},
  {texte:__("G-League Ignite (voie professionnelle directe)"),ageAjout:1,coteDraftMod:0,effets:{scoring:2,athletisme:1}},
  {texte:__("Jouer un an en Europe"),ageAjout:1,coteDraftMod:1,effets:{basketIQ:2,defense:1}},
  {texte:__("Passer une année entière à t'entraîner avant la Draft"),ageAjout:1,coteDraftMod:1,effets:{athletisme:3,basketIQ:1,risqueBlessure:-4}},
  {texte:__("Te déclarer directement pour la Draft (profil international)"),ageAjout:1,coteDraftMod:-3,effets:{}},
  {texte:__("Signer dans un club européen de haut niveau (Euroleague)"),ageAjout:1,coteDraftMod:2,effets:{basketIQ:2,defense:1}},
  {texte:__("Intégrer l'équipe première d'un club de ta ligue nationale"),ageAjout:1,coteDraftMod:1,effets:{scoring:1,basketIQ:1}}
];

/* NCAA Division I : universités réelles (noms et couleurs d'origine). Les mascottes sont remplacées par un clin d'œil qui y renvoie. [nom, mascotte, couleur, couleur2, abréviation, prestige] */
const ECOLES=[
["Abilene Christian","Lynx","#4E2A84","#FFFFFF","ACH",1],
["Alabama A&M","Mastiffs","#660000","#FFFFFF","AAM",1],
["Alabama State","Wasps","#000000","#C99700","AST",1],
["Alcorn State","Valiants","#4B2E83","#FDB515","AST",1],
["American","Harriers","#C8102E","#00205B","AME",1],
["Appalachian State","Ridgemen","#222222","#FFCC00","AST",1],
["Arizona State","Solar Fiends","#8C1D40","#FFC627","AST",2],
["Arkansas State","Crimson Pack","#CC092F","#000000","AST",1],
["Auburn","Sabertooths","#0C2340","#E87722","AUB",2],
["Austin Peay","Statesmen","#C8102E","#FFFFFF","APE",1],
["Ball State","Finches","#BA0C2F","#FFFFFF","BST",1],
["Baylor","Kodiaks","#154734","#FFB81C","BAY",3],
["Bellarmine","Chevaliers","#C8102E","#A2AAAD","BEL",1],
["Belmont","Growlers","#003087","#C8102E","BEL",1],
["Bethune-Cookman","Lynx","#6C1D45","#F1B82D","BCO",1],
["Boise State","Stallions","#0033A0","#D64309","BST",1],
["Boston College","Harriers","#8A100B","#B29D6C","BCO",1],
["Boston University","Scrappers","#CC0000","#FFFFFF","BUN",1],
["Bowling Green","Kestrels","#FE5000","#4F2C1D","BGR",1],
["Bradley","Valiants","#C8102E","#FFFFFF","BRA",1],
["Brigham Young","Pumas","#002E5D","#FFFFFF","BYO",2],
["Brown","Kodiaks","#4E3629","#C00404","BRO",1],
["Bryant","Mastiffs","#000000","#FFC72C","BRY",1],
["Bucknell","Prairie Herd","#E87722","#003865","BUC",1],
["Butler","Mastiffs","#13294B","#FFFFFF","BUT",2],
["California Baptist","Jousters","#1B365D","#F1B82D","CBA",1],
["Cal Poly","Colts","#154734","#C69214","CPO",1],
["Cal State Bakersfield","Desert Runners","#003DA5","#FFC72C","CSB",1],
["Fresno State","Mastiffs","#DB0032","#002E6D","FST",1],
["Cal State Fullerton","Giants","#00274C","#FF7900","CSF",1],
["Long Beach State","Surfers","#000000","#FFC72C","LBS",1],
["Cal State Northridge","Bullfighters","#D22030","#FFFFFF","CSN",1],
["Sacramento State","Wasps","#043927","#C4B581","SST",1],
["Campbell","Dromedaries","#F56E00","#000000","CAM",1],
["Canisius","Gilded Gryphons","#004C97","#FFC72C","CAN",1],
["Central Connecticut","Azure Fiends","#0033A0","#FFFFFF","CCO",1],
["Central Michigan","Lake Voyagers","#6A0032","#FFC82E","CMI",1],
["Charleston Southern","Corsairs","#00205B","#C99700","CSO",1],
["Chicago State","Pumas","#006A4D","#FFFFFF","CST",1],
["Clemson","Sabertooths","#F56600","#522D80","CLE",2],
["Cleveland State","Norsemen","#006747","#FFFFFF","CST",1],
["Coastal Carolina","Roosters","#006F71","#A27752","CCA",1],
["Colgate","Marauders","#821019","#FFFFFF","COL",1],
["College of Charleston","Pumas","#800000","#C5A055","COC",1],
["Holy Cross","Templars","#602D89","#FFFFFF","HCR",1],
["Colorado State","Bighorns","#1E4D2B","#C8C372","CST",1],
["Columbia","Lionhearts","#B9D9EB","#FFFFFF","COL",1],
["Coppin State","Harriers","#003DA5","#FFC72C","CST",1],
["Cornell","Scarlet Pack","#B31B1B","#FFFFFF","COR",1],
["Creighton","Azure Corvids","#005CA9","#FFFFFF","CRE",2],
["Dartmouth","Emerald Herd","#00693E","#FFFFFF","DAR",1],
["Davidson","Lynx","#AC1A2F","#000000","DAV",1],
["Delaware State","Wasps","#C8102E","#00338D","DST",1],
["DePaul","Azure Imps","#005EB8","#E4002B","DEP",1],
["Drake","Mastiffs","#004477","#FFFFFF","DRA",1],
["Drexel","Wyverns","#07294D","#FFC600","DRE",1],
["Duke","Azure Fiends","#001A57","#FFFFFF","DUK",3],
["Duquesne","Earls","#041E42","#C8102E","DUQ",1],
["East Carolina","Freebooters","#592A8A","#FDC82F","ECA",1],
["Eastern Illinois","Prowlers","#004B8D","#A6A8AB","EIL",1],
["Eastern Kentucky","Majors","#861F41","#FFFFFF","EKE",1],
["Eastern Michigan","Harriers","#006633","#FFFFFF","EMI",1],
["Eastern Washington","Harriers","#A10022","#FFFFFF","EWA",1],
["East Tennessee State","Corsairs","#041E42","#FFC72C","ETS",1],
["East Texas A&M","Lionhearts","#00539F","#FFD100","ETA",1],
["Elon","Firebirds","#73000A","#B59A57","ELO",1],
["Fairfield","Harts","#C8102E","#FFFFFF","FAI",1],
["Fairleigh Dickinson","Chevaliers","#00338D","#C8102E","FDI",1],
["Florida A&M","Vipers","#F58025","#00833E","FAM",1],
["Florida Atlantic","Nighthawks","#003366","#CC0000","FAT",2],
["Florida Gulf Coast","Harriers","#004785","#00843D","FGC",1],
["Florida International","Prowlers","#081E3F","#B6862C","FIN",1],
["Florida State","Garnet Spears","#782F40","#CEB888","FST",2],
["Fordham","Bighorns","#800000","#FFFFFF","FOR",1],
["Furman","Knights Errant","#582C83","#FFFFFF","FUR",1],
["Gardner-Webb","Racing Mastiffs","#C8102E","#000000","GWE",1],
["George Mason","Liberty Guard","#006633","#FFCC33","GMA",1],
["Georgetown","Stonecutters","#041E42","#8D817B","GEO",2],
["Georgia Tech","Stinger Swarm","#B3A369","#003057","GTE",2],
["Georgia Southern","Harriers","#011E41","#FFFFFF","GSO",1],
["Georgia State","Prowlers","#0039A6","#FFFFFF","GST",1],
["Gonzaga","Mastiffs","#041E42","#C8102E","GON",3],
["Grambling State","Sabertooths","#000000","#FFC72C","GST",1],
["Grand Canyon","Pronghorns","#522398","#FFFFFF","GCA",1],
["Hampton","Freebooters","#0F3A75","#FFFFFF","HAM",1],
["Harvard","Ruby Guard","#A51C30","#000000","HAR",1],
["High Point","Prowlers","#330072","#FFFFFF","HPO",1],
["Hofstra","Manes","#003591","#FFB81C","HOF",1],
["Houston Christian","Malamutes","#003DA5","#FF6E00","HCH",1],
["Howard","Prairie Herd","#003A63","#E51937","HOW",1],
["Idaho State","Striped Cats","#FF7900","#000000","IST",1],
["Illinois State","Scarlet Wings","#CE1126","#FFFFFF","IST",1],
["Indiana State","Treemen","#00548F","#FFFFFF","IST",1],
["Indiana","Heartlanders","#990000","#EEEDEB","IND",3],
["IU Indianapolis","Spotted Hunters","#9D2235","#FFB81C","IIN",1],
["Iona","Celts","#7B2A3F","#FDB515","ION",1],
["Iowa State","Twisters","#C8102E","#F1BE48","IST",2],
["Jackson State","Sabertooths","#002147","#FFFFFF","JST",1],
["Jacksonville State","Fighting Roosters","#CC0000","#FFFFFF","JST",1],
["Jacksonville","Porpoises","#004D40","#FFFFFF","JAC",1],
["James Madison","Earls","#450084","#CBB677","JMA",1],
["Kansas State","Lynx","#512888","#FFFFFF","KST",2],
["Kennesaw State","Nighthawks","#000000","#FDBB30","KST",1],
["Kent State","Gilded Bolts","#002664","#EAAA00","KST",1],
["Lafayette","Pards","#800000","#FFFFFF","LAF",1],
["Lamar","Finches","#C8102E","#FFFFFF","LAM",1],
["La Salle","Pathfinders","#00205B","#F1B82D","LSA",1],
["Lehigh","Peak Hawks","#502D0E","#FFFFFF","LEH",1],
["Stanford","Redwoods","#8C1515","#FFFFFF","STA",2],
["Le Moyne","Porpoises","#006747","#FFC72C","LMO",1],
["Liberty","Embers","#002D62","#C8102E","LIB",1],
["Lindenwood","Lionhearts","#000000","#FFC72C","LIN",1],
["Lipscomb","Prairie Herd","#330072","#FFC72C","LIP",1],
["Long Island","Great Whites","#0038A8","#FFC72C","LIS",1],
["Longwood","Jousters","#003087","#FFFFFF","LON",1],
["Louisiana State","Sabertooths","#461D7C","#FDD023","LST",2],
["New Orleans","Raiders of the Sea","#0033A0","#A3A9AC","NOR",1],
["Louisiana Tech","Mastiffs","#C8102E","#002F8B","LTE",1],
["Loyola Marymount","Lionhearts","#8B1E3F","#00205B","LMA",1],
["Loyola Chicago","Wanderers","#7A0019","#FFB81C","LCH",1],
["Loyola Maryland","Whippets","#006747","#A2AAAD","LMA",1],
["Manhattan","Gemstones","#00573C","#FFFFFF","MAN",1],
["Marist","Vixens","#C8102E","#FFFFFF","MAR",1],
["Marquette","Gilded Raptors","#003366","#FFCC00","MAR",3],
["Marshall","Stampede","#00B140","#FFFFFF","MAR",1],
["McNeese","Wranglers","#005DAA","#FFC72C","MCN",1],
["Mercer","Kodiaks","#F76800","#000000","MER",1],
["Merrimack","Fighters","#003DA5","#FFC72C","MER",1],
["Miami (OH)","Scarlet Hawks","#C41230","#FFFFFF","MOH",1],
["Michigan State","Hoplites","#18453B","#FFFFFF","MST",3],
["Middle Tennessee","Azure Marauders","#0066CC","#FFFFFF","MTE",1],
["Mississippi State","Mastiffs","#660000","#FFFFFF","MST",2],
["Mississippi Valley State","Delta Fiends","#006747","#FFFFFF","MVS",1],
["Missouri State","Kodiaks","#5E0009","#FFFFFF","MST",1],
["Monmouth","Sparrowhawks","#002F6C","#FFFFFF","MON",1],
["Montana State","Red Lynx","#003975","#C5A230","MST",1],
["Morehead State","Harriers","#0033A0","#FFC72C","MST",1],
["Morgan State","Kodiaks","#002C5F","#F26522","MST",1],
["Mount St. Mary's","Ridgemen","#003DA5","#C8102E","MSM",1],
["Murray State","Sprinters","#002144","#ECAA00","MST",1],
["NJIT","Moorlanders","#D22030","#FFFFFF","NJI",1],
["New Mexico State","Farmhands","#8C0B42","#FFFFFF","NMS",1],
["Niagara","Violet Raptors","#4B2E83","#FFFFFF","NIA",1],
["Nicholls","Majors","#C8102E","#A7A8AA","NIC",1],
["Norfolk State","Hoplites","#00573F","#F2A900","NST",1],
["North Carolina A&T","Farmhands","#004684","#FFC72C","NCA",1],
["North Carolina Central","Harriers","#7A0019","#A8A9AD","NCC",1],
["NC State","Pack Hunters","#CC0000","#FFFFFF","NST",2],
["North Dakota State","Prairie Herd","#00753B","#FFC72C","NDS",1],
["Northeastern","Malamutes","#CC0000","#000000","NOR",1],
["Northern Arizona","Timber Cutters","#003466","#FFC72C","NAR",1],
["Northern Illinois","Malamutes","#BA0C2F","#000000","NIL",1],
["Northern Kentucky","Longships","#FFC72C","#000000","NKE",1],
["Northwestern State","Fiends","#4F2D7F","#F58025","NST",1],
["Northwestern","Lynx","#4E2A84","#FFFFFF","NOR",2],
["Oakland","Gilded Silvertips","#000000","#B59A57","OAK",1],
["Oklahoma State","Wranglers","#FF7300","#000000","OST",2],
["Old Dominion","Sovereigns","#003057","#7C878E","ODO",1],
["Oral Roberts","Gilded Raptors","#002F6C","#CDA32D","ORO",1],
["Oregon State","Dam Builders","#DC4405","#000000","OST",2],
["Pepperdine","Breakers","#00205B","#FF6C0C","PEP",1],
["Portland State","Norsemen","#154734","#FFFFFF","PST",1],
["Prairie View A&M","Prowlers","#4E2A84","#FFC72C","PVA",1],
["Presbyterian","Azure Socks","#0033A0","#C8102E","PRE",1],
["Princeton","Sabertooths","#E87722","#000000","PRI",1],
["Providence","Monks","#000000","#FFFFFF","PRO",2],
["Purdue","Steelworkers","#CEB888","#000000","PUR",3],
["Purdue Fort Wayne","Mammoths","#00205B","#B4B4B4","PFW",1],
["Queens (Charlotte)","Crowns","#002F5D","#FDB515","QCH",1],
["Quinnipiac","Red Lynx","#00205B","#FFB81C","QUI",1],
["Radford","Moorlanders","#C8102E","#FFFFFF","RAD",1],
["Rider","Colts","#A41E34","#FFFFFF","RID",1],
["Robert Morris","Settlers","#002D72","#C8102E","RMO",1],
["Rutgers","Ruby Chevaliers","#CC0033","#000000","RUT",2],
["Sacred Heart","Homesteaders","#C8102E","#FFFFFF","SHE",1],
["St. Bonaventure","Brown Friars","#6B3E26","#FFFFFF","SBO",1],
["St. John's","Crimson Gale","#C8102E","#FFFFFF","SJS",2],
["Saint Joseph's","Sparrowhawks","#9E1B32","#8D8D8D","SJS",1],
["Saint Louis","Lucky Charms","#003DA5","#FFFFFF","SLO",1],
["Saint Mary's (CA)","Celts","#00205B","#A6192E","SMS",2],
["Saint Peter's","Peafowl","#003DA5","#FFFFFF","SPS",1],
["Sam Houston","Binturongs","#F58025","#FFFFFF","SHO",1],
["Samford","Mastiffs","#00205B","#C8102E","SAM",1],
["San Diego State","Sun Temple Guard","#C41230","#000000","SDS",2],
["San Jose State","Hoplites","#0055A2","#E5A823","SJS",1],
["Santa Clara","Stallions","#862633","#FFFFFF","SCL",1],
["Seattle","Scarlet Hawks","#AA0000","#FFFFFF","SEA",1],
["Seton Hall","Freebooters","#0033A0","#FFFFFF","SHA",2],
["Siena","Holy Ones","#00573F","#FFC72C","SIE",1],
["South Carolina State","Mastiffs","#7B1F3A","#00205B","SCS",1],
["South Dakota State","Hares","#0033A0","#F7D417","SDS",1],
["Southeast Missouri","Scarlet Hawks","#C8102E","#000000","SMI",1],
["Southeastern Louisiana","Lionhearts","#006747","#FFC72C","SLO",1],
["Southern","Spotted Hunters","#6CACE4","#FFC72C","SOU",1],
["Southern Illinois","Desert Hounds","#720000","#FFFFFF","SIL",1],
["SIU Edwardsville","Pumas","#C8102E","#FFFFFF","SED",1],
["SMU","Colts","#CC0035","#354CA1","SMU",1],
["Southern Utah","Storm Birds","#C8102E","#FFFFFF","SUT",1],
["Iowa","Eagle Eyes","#000000","#FFCD00","IOW",2],
["Albany","Giant Hounds","#46166B","#EEB211","ALB",1],
["Binghamton","Cat-Bears","#005A43","#FFFFFF","BIN",1],
["Buffalo","Steers","#005BBB","#FFFFFF","BUF",1],
["Stony Brook","Sea Hounds","#990000","#A2AAAD","SBR",1],
["Stephen F. Austin","Timber Cutters","#4E2A84","#FFFFFF","SFA",1],
["Stetson","Milliners","#006747","#FFFFFF","STE",1],
["Stonehill","Sky Falcons","#522398","#FFFFFF","STO",1],
["Syracuse","Citrus","#D44500","#000E54","SYR",3],
["Tarleton","Lone Stars","#4F2D7F","#FFFFFF","TAR",1],
["Temple","Nighthawks","#A41E35","#FFFFFF","TEM",2],
["Tennessee State","Sabertooths","#00418E","#FFFFFF","TST",1],
["Tennessee Tech","Gilded Raptors","#4F2D7F","#FFC72C","TTE",1],
["Texas A&M","Farmhands","#500000","#FFFFFF","TAM",2],
["Texas A&M–Corpus Christi","Isle Folk","#0067C5","#007A33","TAM",1],
["TCU","Spiny Toads","#4D1979","#FFFFFF","TCU",2],
["Texas Southern","Sabertooths","#6A0032","#A7A8AA","TSO",1],
["Texas State","Red Lynx","#501214","#B29D6C","TST",1],
["Texas Tech","Scarlet Marauders","#CC0000","#000000","TTE",2],
["The Citadel","Mastiffs","#00205B","#FFFFFF","TCI",1],
["William & Mary","Clan","#115740","#B9975B","WMA",1],
["George Washington","Insurgents","#033C5A","#AA9868","GWA",1],
["Ohio State","Chestnuts","#BB0000","#666666","OST",3],
["Ohio","Red Lynx","#00694E","#FFFFFF","OHI",1],
["Penn State","Peak Cats","#041E42","#FFFFFF","PST",2],
["Akron","Snaps","#041E42","#A89968","AKR",1],
["Alabama","Scarlet Surge","#9E1B32","#FFFFFF","ALA",3],
["Ole Miss","Insurgents","#CE1126","#14213D","OMI",2],
["New Mexico","Timber Wolves","#BA0C2F","#63666A","NME",1],
["Chattanooga","Mockingbirds","#00386B","#E0AA0F","CHA",1],
["UT Martin","Sky Falcons","#F77F00","#0C2340","UMA",1],
["Tennessee","Enlisted","#FF8200","#FFFFFF","TEN",3],
["UT Arlington","Strays","#0064B1","#F58025","UAR",1],
["Texas","Steerhorns","#BF5700","#FFFFFF","TEX",3],
["UTEP","Diggers","#FF8200","#041E42","UTE",1],
["UT Rio Grande Valley","Ranchers","#F05A22","#00704A","URG",1],
["UTSA","Desert Runners","#0C2340","#F15A22","UTS",1],
["Tulsa","Gilded Storm","#002D72","#C8102E","TUL",1],
["Vermont","Ridge Cats","#154734","#FFCD00","VER",1],
["Towson","Sabertooths","#FFBB00","#000000","TOW",1],
["Troy","Horse Warriors","#8A2432","#888B8D","TRO",1],
["Tulane","Emerald Surge","#006747","#418FDE","TUL",1],
["Air Force","Kestrels","#003087","#8A8D8F","AFO",1],
["Army","Dark Chevaliers","#000000","#D4BF91","ARM",1],
["Navy","Mariners","#00205B","#C5B783","NAV",1],
["UAB","Flares","#1E6B52","#F2A900","UAB",1],
["Arizona","Lynx","#AB0520","#0C234B","ARI",3],
["Arkansas","Tuskers","#9D2235","#FFFFFF","ARK",3],
["Little Rock","Horse Warriors","#6E0B14","#A7A9AC","LRO",1],
["Arkansas–Pine Bluff","Gilded Manes","#000000","#FFC72C","ABL",1],
["California","Gilded Kodiaks","#003262","#FDB515","CAL",2],
["UC Davis","Farmhands","#022851","#FFBF00","UDA",1],
["UC Irvine","Ant Hunters","#0064A4","#FFD200","UIR",1],
["UCLA","Growlers","#2D68C4","#F2A900","UCL",3],
["UC Riverside","Moorlanders","#003DA5","#FFB81C","URI",1],
["UC San Diego","Sea Heralds","#182B49","#C69214","USD",1],
["UC Santa Barbara","Cowhands","#003660","#FEBC11","USB",1],
["Central Arkansas","Kodiaks","#4F2D7F","#A7A8AA","CAR",1],
["UCF","Chevaliers","#000000","#BA9B37","UCF",2],
["Cincinnati","Cat-Bears","#E00122","#000000","CIN",2],
["Colorado","Herd Runners","#000000","#CFB87C","COL",2],
["UConn","Malamutes","#000E2F","#FFFFFF","UCO",3],
["Dayton","Aviators","#CE1126","#004B8D","DAY",2],
["Delaware","Blue Fowl","#00539F","#FFD200","DEL",1],
["Denver","Homesteaders","#BA0C2F","#B59A57","DEN",1],
["Detroit Mercy","Giants","#A6192E","#0A2240","DME",1],
["Evansville","Violet Aces","#4B2E83","#FFFFFF","EVA",1],
["Florida","Crocs","#0021A5","#FA4616","FLO",3],
["Georgia","Mastiffs","#BA0C2F","#000000","GEO",2],
["Hawai'i","Prism Fighters","#024731","#FFFFFF","HAI",1],
["Houston","Pumas","#C8102E","#FFFFFF","HOU",3],
["Idaho","Ransackers","#F1B300","#000000","IDA",1],
["UIC","Embers","#001E62","#D50032","UIC",1],
["Illinois","Prairie Fighters","#E84A27","#13294B","ILL",3],
["Kansas","Mythic Jays","#0051BA","#E8000D","KAN",3],
["Kentucky","Lynx","#0033A0","#FFFFFF","KEN",3],
["Louisiana","Bayou Rage","#CE181E","#FFFFFF","LOU",1],
["Louisiana–Monroe","Battle Hawks","#840029","#FFC72C","LOU",1],
["Louisville","Finches","#AD0000","#000000","LOU",3],
["Maine","Dark Kodiaks","#003263","#B0D7FF","MAI",1],
["UMBC","Fetchers","#000000","#FDB515","UMB",1],
["Maryland","Turtles","#E03A3E","#FFD520","MAR",2],
["Maryland Eastern Shore","Sparrowhawks","#860038","#A7A8AA","MES",1],
["UMass","Patriot Guard","#881C1C","#FFFFFF","UMA",1],
["UMass Lowell","Stream Hawks","#003DA5","#C8102E","ULO",1],
["Memphis","Sabertooths","#003087","#898D8D","MEM",2],
["Miami (FL)","Tempests","#F47321","#005030","MFL",2],
["Michigan","Wolf-Weasels","#00274C","#FFCB05","MIC",3],
["Minnesota","Gilded Burrowers","#7A0019","#FFCC33","MIN",2],
["Missouri","Sabertooths","#F1B82D","#000000","MIS",2],
["UMKC","Wallabies","#0033A0","#FFC72C","UMK",1],
["Montana","Silvertips","#751D4A","#A2AAAD","MON",1],
["Nebraska","Harvesters","#E41C38","#F5F1E7","NEB",2],
["Omaha","Strays","#D4272E","#000000","OMA",1],
["UNLV","Insurgents","#CF0A2C","#666666","UNL",2],
["Nevada","Pack Hunters","#003366","#A7A8AA","NEV",1],
["New Hampshire","Lynx","#003591","#FFFFFF","NHA",1],
["North Alabama","Lionhearts","#4B2E83","#FDB515","NAL",1],
["UNC Asheville","Mastiffs","#003DA5","#FFFFFF","UAS",1],
["North Carolina","Heelers","#7BAFD4","#FFFFFF","NCA",3],
["Charlotte","Gold Rushers","#046A38","#B9975B","CHA",1],
["UNC Greensboro","Hoplites","#FFB81C","#0F2D52","UGR",1],
["UNC Wilmington","Sea Falcons","#006666","#FFD100","UWI",1],
["North Dakota","Battle Raptors","#009A44","#FFFFFF","NDA",1],
["Northern Colorado","Kodiaks","#002B5C","#FFC72C","NCO",1],
["Northern Iowa","Prowlers","#4B116F","#FFCC00","NIO",1],
["North Florida","Fish Hawks","#00205B","#A2AAAD","NFL",1],
["North Texas","Jade Brawlers","#00853E","#FFFFFF","NTE",1],
["Notre Dame","Shamrock Scrappers","#0C2340","#C99700","NDA",2],
["Oklahoma","Land Runners","#841617","#FDF9D8","OKL",2],
["Oregon","Mallards","#154733","#FEE123","ORE",2],
["Pennsylvania","Friends","#990000","#011F5B","PEN",1],
["Pittsburgh","Prowlers","#003594","#FFB81C","PIT",2],
["Portland","Navigators","#4F2D7F","#FFFFFF","POR",1],
["Rhode Island","Bighorns","#75B2DD","#002147","RIS",1],
["Richmond","Arachnids","#990000","#00205B","RIC",1],
["St. Thomas","Aquinas Men","#510C76","#A2AAAD","STH",1],
["San Diego","Cape Bearers","#003B70","#75B2DD","SDI",1],
["San Francisco","Sirs","#00543C","#FDBB30","SFR",1],
["South Alabama","Spotted Hunters","#00205B","#BF0D3E","SAL",1],
["South Carolina","Fighting Roosters","#73000A","#000000","SCA",2],
["USC Upstate","Hoplites","#00573F","#000000","UUP",1],
["South Dakota","Prairie Wolves","#D6001C","#FFFFFF","SDA",1],
["USC","Horse Warriors","#990000","#FFC72C","USC",2],
["Southern Indiana","Shrieking Raptors","#C8102E","#002D72","SIN",1],
["Southern Miss","Gilded Raptors","#FFAB00","#000000","SMI",1],
["South Florida","Steers","#006747","#CFC493","SFL",1],
["Incarnate Word","Finches","#C8102E","#000000","IWO",1],
["Pacific","Sabertooths","#F58025","#000000","PAC",1],
["Toledo","Boosters","#003E7E","#FFCD00","TOL",1],
["Utah","Red Rock Guard","#CC0000","#FFFFFF","UTA",2],
["Virginia","Horsemen","#232D4B","#E57200","VIR",3],
["Washington","Malamutes","#4B2E83","#B7A57A","WAS",2],
["Green Bay","Firebirds","#006633","#C8102E","GBA",1],
["Wisconsin","Burrowers","#C5050C","#FFFFFF","WIS",3],
["Milwaukee","Prowlers","#000000","#FFC72C","MIL",1],
["Wyoming","Wranglers","#492F24","#FFC425","WYO",1],
["Utah State","Farmhands","#0F2439","#FFFFFF","UST",1],
["Utah Tech","Pathfinders","#BA0C2F","#002D72","UTE",1],
["Utah Valley","Wolf-Weasels","#275D38","#FFFFFF","UVA",1],
["Valparaiso","Lighthouses","#5C3A21","#F2A900","VAL",1],
["Vanderbilt","Admirals","#000000","#866D4B","VAN",2],
["Villanova","Lynx","#00205B","#13B5EA","VIL",3],
["VCU","Bighorns","#000000","#F8B800","VCU",2],
["VMI","Cadet Corps","#C8102E","#FFC72C","VMI",1],
["Virginia Tech","Gobblers","#861F41","#E5751F","VTE",2],
["Wagner","Sea Falcons","#00573F","#FFFFFF","WAG",1],
["Wake Forest","Fiend Preachers","#000000","#9E7E38","WFO",2],
["Washington State","Pumas","#981E32","#5E6A71","WST",2],
["Weber State","Lynx","#4B2E83","#FFFFFF","WST",1],
["Western Carolina","Ridge Cats","#592C82","#FFC72C","WCA",1],
["Western Illinois","Hardnecks","#4E2A84","#FFC72C","WIL",1],
["Western Kentucky","Summit Climbers","#C8102E","#FFFFFF","WKE",1],
["Western Michigan","Stallions","#6C4F3D","#B5A167","WMI",1],
["West Virginia","Ridgemen","#002855","#EAAA00","WVI",2],
["Wichita State","Jolts","#000000","#FFC72C","WST",2],
["Rice","Nighthawks","#00205B","#5E6A71","RIC",1],
["Winthrop","Harriers","#7B1F3A","#FFC72C","WIN",1],
["Wofford","Scrappers","#B9975B","#000000","WOF",1],
["Wright State","Marauders","#046A38","#FFC72C","WST",1],
["Xavier","Swordsmen","#0C2340","#9EA2A2","XAV",2],
["Yale","Mastiffs","#00356B","#FFFFFF","YAL",1],
["Youngstown State","Waddlers","#C8102E","#FFFFFF","YST",1]
].map((r,i)=>({id:'u'+i,ville:r[0],nom:r[1],couleur:r[2],couleur2:r[3],abr:r[4],prestige:r[5]}));
const COMBINE_CHOIX=[
  {texte:__("Jouer la sécurité, miser sur la régularité"),coteDraftMod:2,effets:{}},
  {texte:__("Prendre des risques sur les tests athlétiques"),coteDraftMod:4,effets:{risqueBlessure:4}},
  {texte:__("Privilégier les entretiens avec les franchises"),coteDraftMod:3,effets:{reputation:2}},
  {texte:__("Privilégier les drills sur le terrain"),coteDraftMod:2,effets:{scoring:1}},
  {texte:__("Rester toi-même, sans stratégie particulière"),coteDraftMod:0,effets:{}}
];
/* Origines : choisies à la création. stats = bonus de départ, meta = bonus de réputation / cote, cote = bonus à la Draft. */
const ORIGINES=[
  {id:'prep',nom:__("Prep school réputée"),desc:__("Un lycée d'élite, des coachs de haut niveau et déjà des recruteurs dans les gradins."),stats:{basketIQ:3,playmaking:1},meta:{reputation:8},cote:3,pression:0},
  {id:'academie',nom:__("Centre de formation connu"),desc:__("Un parcours rigoureux : fondamentaux solides, discipline et suivi médical depuis l'enfance."),stats:{defense:2,basketIQ:2,athletisme:1},meta:{reputation:3,risqueBlessure:-4},cote:2,pression:0},
  {id:'bitume',nom:__("Légende du bitume de ton quartier"),desc:__("Tout appris dans la rue : un style inimitable et tout un quartier derrière toi."),stats:{scoring:3,athletisme:2,basketIQ:-1},meta:{reputation:6,alchimieEquipe:-2},cote:0,pression:0},
  {id:'fils',nom:__("Fils d'un ancien joueur"),desc:__("Un nom qui ouvre des portes, et une pression qui ne te quitte jamais."),stats:{basketIQ:2,scoring:1},meta:{reputation:10,coteEquipe:3},cote:2,pression:1}
];
ORIGINES.push(
  {id:'hs',nom:__("Lycée public et circuit AAU"),desc:__("Le lycée en semaine, les tournois d'été le week-end : tu te fais remarquer match après match."),stats:{scoring:1,athletisme:1,defense:1},meta:{reputation:4},cote:1,pression:0},
  {id:'club',nom:__("Club de ton quartier"),desc:__("Peu de moyens, un terrain usé et un entraîneur qui croit en toi : tout reste à prouver."),stats:{athletisme:2,defense:1,basketIQ:-1},meta:{reputation:2,alchimieEquipe:2},cote:0,pression:0},
  {id:'academie_af',nom:__("Académie de basket du continent"),desc:__("Une académie qui forme les meilleurs jeunes d'Afrique, avec des recruteurs d'Europe et des États-Unis dans les gradins."),stats:{basketIQ:2,defense:1,athletisme:1},meta:{reputation:5},cote:2,pression:0},
  {id:'sport_etudes',nom:__("Section sport-études"),desc:__("Cours le matin, basket l'après-midi, et un club régional qui te suit de près."),stats:{basketIQ:2,defense:1},meta:{reputation:3},cote:1,pression:0}
);
const ORIGINES_REGION={na:['prep','hs','bitume','fils'],af:['club','academie_af','bitume','fils'],eu:['academie','sport_etudes','bitume','fils'],ot:['club','academie','bitume','fils']};
const PRESTIGE_ORIGINE={prep:3,hs:2,club:1,academie_af:2,academie:3,sport_etudes:2,bitume:1,fils:2};
/* Force réelle des sélections nationales (0-100, d'après les classements FIBA et les résultats récents). Le jeu reste arcade, mais les gros pays restent les favoris. */
const FORCE_NATION={'USA':98,'Allemagne':91,'France':90,'Canada':90,'Serbie':90,'Espagne':88,'Australie':87,'Slovénie':84,'Grèce':83,'Lituanie':82,'Italie':80,'Turquie':78,'Lettonie':78,'Brésil':78,'Argentine':76,'Soudan du Sud':76,'Finlande':74,'Monténégro':74,'Nigeria':74,'Japon':72,'Cameroun':72,'République dominicaine':72,'Porto Rico':70,'Géorgie':70,'Sénégal':70,'Chine':70,'Croatie':68,'Nouvelle-Zélande':68,'Angola':68,'Ukraine':68,'Royaume-Uni':66,'Iran':66,'Égypte':66,'Mali':66,'Tunisie':66,'Philippines':66,'Venezuela':66,'Pologne':66,'Corée du Sud':64,'Mexique':64,'Cap-Vert':62,"Côte d'Ivoire":62,'Liban':62,'Maroc':60,'RDC':58,'Jordanie':58,'Rwanda':52,'Autre':50};
function regionDe(pays){ if(pays==='USA'||pays==='Canada') return 'na'; const c=CONTINENTS[pays]; return c==='Afrique'?'af':c==='Europe'?'eu':'ot'; }
function originesPourPays(p){ return ORIGINES_REGION[regionDe(p)].map(origineParId); }
function origineParId(id){ return ORIGINES.find(x=>x.id===id)||null; }
const o=(texte,stat,mod,enjeu,gain,perte,ok,ko)=>({texte,stat,mod,enjeu,gain,perte,ok,ko});
const MATCH_SITUATIONS=[
  {id:'contre_attaque',titre:__("Contre-attaque adverse"),contexte:__("Un point d'avance, 6 secondes à jouer. L'adversaire lance une contre-attaque rapide vers ton panier."),choix:[
    o(__("Contester le tir en sautant"),'defense',-0.05,0.08,{reputation:4,defense:1},{risqueBlessure:3},__("Ta main touche le ballon : contre décisif."),__("Tu sautes trop tôt et le tir rentre.")),
    o(__("Te sacrifier pour prendre la faute"),'basketIQ',0.05,0.05,{alchimieEquipe:3},{reputation:-1},__("La faute est sifflée loin du panier : tu sauves le match."),__("La faute est sifflée sur un tir : trois lancers pour eux.")),
    o(__("Couper la ligne de passe"),'playmaking',0.0,0.06,{reputation:3},{alchimieEquipe:-2},__("Tu interceptes le ballon et tout s'arrête."),__("Le ballon passe et le tir est facile.")),
    o(__("Rattraper l'attaquant à pleine vitesse"),'athletisme',-0.1,0.07,{reputation:5},{risqueBlessure:4},__("Tu arrives en trombe et tu détournes le ballon."),__("Il te devance et marque sans opposition.")),
    o(__("Laisser ton pivot gérer et te replacer"),'basketIQ',0.1,0.04,{alchimieEquipe:2},{reputation:-1},__("Le collectif ferme la porte à temps."),__("La communication échoue et personne ne contrôle le tir."))
  ]},
  {id:'mi_temps',titre:__("Menés de dix à la pause"),contexte:__("Vestiaire tendu : ton équipe est menée de dix points et le coach cherche une solution."),choix:[
    o(__("Prendre le jeu en main dès la reprise"),'scoring',-0.1,0.09,{reputation:5},{alchimieEquipe:-2},__("Tu enchaînes les paniers et l'équipe te suit."),__("Tu forces et le collectif se grippe.")),
    o(__("Proposer un changement de défense"),'basketIQ',0.05,0.07,{basketIQ:1,alchimieEquipe:2},{reputation:-1},__("La zone surprend l'adversaire et l'écart fond."),__("La défense ne tient pas et l'écart se creuse.")),
    o(__("Motiver tes coéquipiers à voix haute"),'playmaking',0.0,0.05,{alchimieEquipe:4},{alchimieEquipe:-2},__("Le message passe : l'équipe revient sur le terrain avec l'envie."),__("Le discours tombe à plat.")),
    o(__("Accélérer le rythme pour fatiguer la défense"),'athletisme',-0.05,0.07,{reputation:3},{risqueBlessure:3},__("L'adversaire s'essouffle et l'écart fond."),__("Ton équipe est essoufflée la première.")),
    o(__("Demander au coach de te laisser seul sur le ballon"),'scoring',-0.15,0.09,{reputation:4},{reputation:-3},__("Tu mènes la remontée à toi seul."),__("Le coach refuse et la tension monte."))
  ]},
  {id:'mauvaise_passe',titre:__("Une série de tirs ratés"),contexte:__("Tu as raté tes six derniers tirs. Le coach hésite à te confier le ballon dans le money time."),choix:[
    o(__("Demander le ballon quand même"),'scoring',-0.15,0.09,{reputation:5},{reputation:-3},__("Le tir rentre : tu fais taire tous les doutes."),__("Le tir est raté : les doutes s'installent.")),
    o(__("Passer par un coéquipier en rythme"),'playmaking',0.05,0.05,{alchimieEquipe:3},{alchimieEquipe:-1},__("Ton coéquipier est parfait et la passe fait mouche."),__("La passe est maladroite et la possession se perd.")),
    o(__("Te concentrer sur la défense"),'defense',0.0,0.05,{defense:1,reputation:2},{reputation:-1},__("Ta défense change le match."),__("Ta défense ne suffit pas à compenser.")),
    o(__("Prendre un temps pour respirer et te reconcentrer"),'basketIQ',0.1,0.04,{basketIQ:1},{reputation:-1},__("Tu retrouves tes repères."),__("Le temps mort casse ton rythme.")),
    o(__("Attaquer le cercle pour retrouver confiance"),'athletisme',-0.05,0.07,{reputation:3},{risqueBlessure:3},__("Tu finis fort au cercle et la salle explose."),__("Le contact est sifflé contre toi."))
  ]},
  {id:'mismatch',titre:__("Un défenseur beaucoup plus petit"),contexte:__("L'adversaire a placé un joueur nettement plus petit sur toi. Le coach te demande d'en profiter."),choix:[
    o(__("Jouer dos au panier"),'scoring',0.1,0.06,{reputation:3,scoring:1},{reputation:-1},__("Tu écrases le défenseur et tu marques proprement."),__("Le double-pli arrive et tu perds le ballon.")),
    o(__("Attaquer en un contre un rapide"),'athletisme',0.0,0.07,{reputation:4},{risqueBlessure:3},__("Tu passes en force et tu finis au cercle."),__("Tu perds l'appui et le ballon sort.")),
    o(__("Attirer la défense puis passer"),'playmaking',0.05,0.05,{alchimieEquipe:4},{alchimieEquipe:-1},__("Ton coéquipier est démarqué et ne rate pas."),__("Le passeur est trop lent : interception.")),
    o(__("Lire le piège et pivoter"),'basketIQ',0.05,0.05,{basketIQ:1},{reputation:-1},__("Tu anticipes le piège et tu ouvres le jeu."),__("Tu hésites et le piège se referme.")),
    o(__("Forcer un tir contesté loin du panier"),'scoring',-0.2,0.09,{reputation:5},{reputation:-3},__("Le tir difficile rentre : le public se lève."),__("Le tir est trop ambitieux et passe à côté."))
  ]},
  {id:'jeune_coequipier',titre:__("Un jeune prend ton tir"),contexte:__("Un jeune coéquipier prend un tir que tu voulais. Il le rate. La caméra est sur toi."),choix:[
    o(__("Lui taper dans la main et passer à autre chose"),'playmaking',0.1,0.04,{alchimieEquipe:4},{alchimieEquipe:-1},__("Ton geste fait l'unanimité dans le vestiaire."),__("Le jeune se sent jugé malgré tout.")),
    o(__("Lui reprocher son choix à voix haute"),'basketIQ',-0.1,0.05,{reputation:2},{alchimieEquipe:-4},__("Le message est compris et le jeu se resserre."),__("Le jeune se braque et le groupe se divise.")),
    o(__("Demander le prochain ballon pour te rattraper"),'scoring',-0.05,0.07,{reputation:3},{reputation:-2},__("Tu récupères un ballon et tu marques."),__("Tu précipites ton tir et tu le rates.")),
    o(__("Te concentrer sur la défense pour compenser"),'defense',0.05,0.05,{defense:1,reputation:2},{alchimieEquipe:-1},__("Ta défense prend le relais."),__("Ta défense ne suffit pas à compenser.")),
    o(__("Prendre un temps pour parler à ton coach"),'basketIQ',0.1,0.03,{alchimieEquipe:2},{alchimieEquipe:-1},__("Le coach apaise tout le monde."),__("Le coach ne tranche pas."))
  ]},
  {id:'duel_pivot',titre:__("Bataille sous le panier"),contexte:__("L'adversaire te malmène physiquement depuis le début du match. L'arbitre ne siffle presque rien."),choix:[
    o(__("Répondre avec le même physique"),'athletisme',-0.1,0.07,{reputation:4,athletisme:1},{risqueBlessure:4,reputation:-2},__("Tu imposes ton gabarit et l'adversaire recule."),__("Tu écopes d'une faute technique.")),
    o(__("Garder la tête froide et jouer plus vite"),'basketIQ',0.05,0.05,{basketIQ:1},{reputation:-1},__("Ta vitesse de jeu fait la différence."),__("Tu te laisses déstabiliser.")),
    o(__("Demander une aide à tes coéquipiers"),'playmaking',0.05,0.05,{alchimieEquipe:3},{alchimieEquipe:-1},__("L'aide défensive arrive à temps."),__("La communication est confuse.")),
    o(__("Défendre plus bas pour éviter le contact"),'defense',0.0,0.06,{defense:1},{reputation:-1},__("Tu contiens l'adversaire loin du cercle."),__("Il te passe dessus à répétition.")),
    o(__("Réclamer calmement auprès de l'arbitre"),'basketIQ',0.0,0.04,{reputation:2},{reputation:-2},__("L'arbitre resserre le jeu et tu respires."),__("L'arbitre te rappelle à l'ordre."))
  ]},
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
  {id:'coupe_poule',titre:__("Match de poule serré"),contexte:__("{coupe}. Phase de groupes : il faut gagner deux matchs sur trois pour passer en quarts de finale."),choix:[
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
  {id:'coupe_quart',titre:__('Quart de finale'),contexte:__("{coupe}. Quart de finale : une défaite et {pays} rentre à la maison."),choix:null},
  {id:'coupe_bronze',titre:__("Match pour la médaille de bronze"),contexte:__("{coupe}. Match pour la troisième place : il reste une médaille de bronze à aller chercher."),choix:null},
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
/* Calendrier des compétitions internationales (saisons pro) : JO tous les 4 ans dès la saison 10, Coupe du Monde tous les 5 ans dès la saison 11, coupe continentale tous les 3 ans dès la saison 9. Priorité : JO, puis Coupe du Monde, puis coupe continentale. */
const estJO=s=>s>=10&&(s-10)%4===0;
const estMonde=s=>s>=11&&(s-11)%5===0&&!estJO(s);
const estCAN=s=>s>=9&&(s-9)%3===0&&!estJO(s)&&!estMonde(s);
function coupeContinent(e){ const c=CONTINENTS[e.pays]; return c?COUPES_CONTINENT[c]:null; }
function pointFaible(e){
  const L={scoring:__("ton scoring"),playmaking:__("ton playmaking"),defense:__("ta défense"),athletisme:__("ton athlétisme"),basketIQ:__("ton basket IQ")};
  let k='scoring'; for(const x in L){ if(e.stats[x]<e.stats[k]) k=x; }
  return {cle:k,nom:L[k]};
}
const SBIL=e=>(e.dernierResultat&&e.dernierResultat.saison)||{v:0,d:0,rang:8,stade:0};
const POIDS_SCENARIO={non_qualifie:7,catastrophe:8,elimine_tot:6,demi:6,finaliste:7,survol:5,champion:7,blessure:6,etoile:4,echec:5,decisif:4,fragile:3,tension:3,cote_basse:3};
const SCENARIOS=[
  /* Scénarios nés du résultat de la saison précédente */
  {id:'non_qualifie',generique:false,cond:e=>e.dernierResultat&&SBIL(e).stade===0&&(e.bilan&&e.bilan.total>0?e.bilan.reussis/e.bilan.total:0.5)>=0.4,
   question:__("Pas de playoffs cette année : comment rebondir ?"),
   contexte:e=>(()=>{const r=SBIL(e); return __t("Tu as terminé {#0} avec {#1} victoires pour {#2} défaites : les playoffs se sont joués sans toi. Il faut repartir sur de nouvelles bases.",[texteRang(r.rang),r.v,r.d]);})(),
   choix:[
    c('Performance',__("Refaire ta préparation physique de zéro"),{athletisme:2,defense:1}),
    c('Carrière / Contrat',__("Exiger des renforts à ta direction"),{coteEquipe:4,reputation:-1}),
    c('Image / Marque',__("Reconnaître l'échec et promettre un retour fort"),{reputation:3}),
    c('Vie perso',__("Couper quelques semaines avant de repartir"),{alchimieEquipe:3,risqueBlessure:-3}),
    c('Risque / Legacy',__("Prendre davantage de responsabilités dans le jeu"),{scoring:2,playmaking:1,risqueBlessure:2})
  ]},
  {id:'non_qualifie2',generique:false,cond:e=>e.dernierResultat&&SBIL(e).stade===0&&(e.bilan&&e.bilan.total>0?e.bilan.reussis/e.bilan.total:0.5)>=0.4,
   question:__("Les playoffs sans toi : que changes-tu cet été ?"),
   contexte:e=>(()=>{const r=SBIL(e); return __t("Avec {#1} victoires et {#2} défaites, ton équipe finit {#0}. Les supporters attendent une réaction, et tes coéquipiers aussi.",[texteRang(r.rang),r.v,r.d]);})(),
   choix:[
    c('Performance',__("Étudier tes matchs perdus avec un analyste vidéo"),{basketIQ:3}),
    c('Carrière / Contrat',__("Demander un nouveau rôle au sein de l'équipe"),{coteEquipe:3,reputation:1}),
    c('Image / Marque',__("Prendre la parole devant le groupe pour fédérer"),{alchimieEquipe:3,reputation:2}),
    c('Vie perso',__("Passer l'été en famille pour te ressourcer"),{alchimieEquipe:2,risqueBlessure:-4}),
    c('Risque / Legacy',__("Défier publiquement tes coéquipiers de faire mieux"),{reputation:4,alchimieEquipe:-3})
  ]},
  {id:'catastrophe',generique:false,cond:e=>e.dernierResultat&&SBIL(e).stade===0&&(e.bilan&&e.bilan.total>0?e.bilan.reussis/e.bilan.total:0.5)<0.4,
   question:__("Saison catastrophique : il faut tout changer"),
   contexte:e=>(()=>{const r=SBIL(e); return __t("{#0}, {#1} victoires, {#2} défaites : un naufrage. Rien n'a fonctionné, ni tes choix, ni ceux de l'équipe.",[texteRang(r.rang),r.v,r.d]);})(),
   choix:[
    c('Performance',__("Tout reprendre depuis les fondamentaux avec un coach individuel"),{scoring:2,basketIQ:2}),
    c('Carrière / Contrat',__("Demander un nouveau projet de jeu au coach"),{coteEquipe:3,alchimieEquipe:2}),
    c('Image / Marque',__("Faire le point publiquement avec les fans"),{reputation:3}),
    c('Vie perso',__("Reprendre du plaisir en jouant avec tes amis d'enfance"),{alchimieEquipe:3,risqueBlessure:-4}),
    c('Risque / Legacy',__("Changer radicalement ton style de jeu"),{scoring:2,athletisme:2,risqueBlessure:3})
  ]},
  {id:'catastrophe2',generique:false,cond:e=>e.dernierResultat&&SBIL(e).stade===0&&(e.bilan&&e.bilan.total>0?e.bilan.reussis/e.bilan.total:0.5)<0.4,
   question:__("Une saison à oublier : par où recommencer ?"),
   contexte:e=>(()=>{const r=SBIL(e); return __t("Tu finis {#0} avec {#1} victoires seulement. Les critiques pleuvent : il est temps de prouver que tu vaux mieux que ça.",[texteRang(r.rang),r.v,r.d]);})(),
   choix:[
    c('Performance',__("T'imposer un programme de travail strict dès le lendemain"),{basketIQ:2,athletisme:2,risqueBlessure:2}),
    c('Carrière / Contrat',__("Demander à ton agent de peser sur la direction"),{coteEquipe:3}),
    c('Image / Marque',__("Publier une lettre ouverte à tes supporters"),{reputation:4}),
    c('Vie perso',__("Prendre un mois complet loin des terrains"),{alchimieEquipe:3,risqueBlessure:-5}),
    c('Risque / Legacy',__("Annoncer que tu reviendras meilleur que jamais"),{reputation:5,risqueBlessure:2})
  ]},
  {id:'elimine_tot',generique:false,cond:e=>e.dernierResultat&&SBIL(e).stade===1,
   question:__("Éliminé dès le premier tour : comment le digérer ?"),
   contexte:e=>(()=>{const r=SBIL(e); return __t("Qualifié en tant que {#0} avec {#1} victoires, ton équipe est sortie dès le premier tour des playoffs. La déception est immense.",[texteRang(r.rang),r.v,r.d]);})(),
   choix:[
    c('Performance',__("Revoir chaque possession décisive de la série"),{basketIQ:3}),
    c('Carrière / Contrat',__("Demander des recrues capables de faire la différence"),{coteEquipe:4}),
    c('Image / Marque',__("Remercier tes supporters après la série"),{reputation:3}),
    c('Vie perso',__("T'offrir une semaine de vacances avec tes proches"),{alchimieEquipe:3,risqueBlessure:-3}),
    c('Risque / Legacy',__("Promettre d'aller beaucoup plus loin l'an prochain"),{reputation:5,risqueBlessure:2})
  ]},
  {id:'elimine_tot2',generique:false,cond:e=>e.dernierResultat&&SBIL(e).stade===1,
   question:__("Une série perdue trop vite : que retiens-tu ?"),
   contexte:e=>(()=>{const r=SBIL(e); return __t("Tu avais fini {#0} de la saison régulière ({#1}-{#2}), mais les playoffs ont tourné court. Il manque quelque chose à ton équipe.",[texteRang(r.rang),r.v,r.d]);})(),
   choix:[
    c('Performance',__("Muscler ton jeu pour mieux encaisser l'intensité des playoffs"),{athletisme:2,defense:1}),
    c('Carrière / Contrat',__("Discuter de la rotation avec ton coach"),{coteEquipe:3,alchimieEquipe:1}),
    c('Image / Marque',__("Montrer ta frustration devant les caméras"),{reputation:3,alchimieEquipe:-1}),
    c('Vie perso',__("Passer du temps avec tes coéquipiers hors du terrain"),{alchimieEquipe:4}),
    c('Risque / Legacy',__("Prendre davantage de tirs lors des moments clés"),{scoring:2,risqueBlessure:2})
  ]},
  {id:'demi',generique:false,cond:e=>e.dernierResultat&&(SBIL(e).stade===2||SBIL(e).stade===3),
   question:__("Si près de la finale : que manquait-il ?"),
   contexte:e=>(()=>{const r=SBIL(e); return __t("Après une saison à {#1} victoires, ton équipe est tombée juste avant la finale. Le titre n'était pas loin.",[texteRang(r.rang),r.v,r.d]);})(),
   choix:[
    c('Performance',__("Travailler la fin de match et les possessions serrées"),{basketIQ:2,scoring:1}),
    c('Carrière / Contrat',__("Obtenir un renfort de niveau all-star à ton poste"),{coteEquipe:4,reputation:1}),
    c('Image / Marque',__("Raconter ta frustration dans un long entretien télévisé"),{reputation:3}),
    c('Vie perso',__("Prendre du recul et te reposer avant la nouvelle saison"),{alchimieEquipe:2,risqueBlessure:-4}),
    c('Risque / Legacy',__("Défier publiquement les favoris pour l'an prochain"),{reputation:5,risqueBlessure:2})
  ]},
  {id:'finaliste',generique:false,cond:e=>e.dernierResultat&&SBIL(e).stade===4,
   question:__("Battu en finale : comment rebondir ?"),
   contexte:e=>(()=>{const r=SBIL(e); return __t("Tu as perdu en finale après une saison à {#1} victoires. Tu étais à quelques possessions du titre.",[texteRang(r.rang),r.v,r.d]);})(),
   choix:[
    c('Performance',__("Retravailler les situations de fin de match, une par une"),{basketIQ:2,scoring:1}),
    c('Carrière / Contrat',__("Pousser ta direction à garder le groupe intact"),{coteEquipe:3,alchimieEquipe:2}),
    c('Image / Marque',__("Accepter une série de documentaires sur la finale perdue"),{reputation:4}),
    c('Vie perso',__("Rester discret avec tes proches pendant quelques semaines"),{alchimieEquipe:3,risqueBlessure:-3}),
    c('Risque / Legacy',__("Promettre le titre pour l'an prochain, sans condition"),{reputation:6,risqueBlessure:2})
  ]},
  {id:'finaliste2',generique:false,cond:e=>e.dernierResultat&&SBIL(e).stade===4,
   question:__("Une finale perdue à jamais : qui en veut le plus ?"),
   contexte:e=>(()=>{const r=SBIL(e); return __t("{#0} en saison régulière ({#1}-{#2}), puis une finale perdue. Tous les regards sont tournés vers toi.",[texteRang(r.rang),r.v,r.d]);})(),
   choix:[
    c('Performance',__("T'entraîner dès la semaine suivante pour tourner la page"),{athletisme:2,scoring:1,risqueBlessure:2}),
    c('Carrière / Contrat',__("Demander des garanties sportives avant de te réengager"),{coteEquipe:3,reputation:1}),
    c('Image / Marque',__("Parler de la défaite sans détour en conférence de presse"),{reputation:3,alchimieEquipe:1}),
    c('Vie perso',__("Partir quelques jours loin de tout"),{alchimieEquipe:3,risqueBlessure:-4}),
    c('Risque / Legacy',__("Dire que tu es prêt à prendre tous les tirs décisifs"),{reputation:5,risqueBlessure:3})
  ]},
  {id:'survol',generique:false,cond:e=>e.dernierResultat&&SBIL(e).stade>=1&&SBIL(e).stade<=3&&(e.bilan&&e.bilan.total>0?e.bilan.reussis/e.bilan.total:0.5)>=0.75,
   question:__("Une saison dominée, mais sans titre : que fais-tu ?"),
   contexte:e=>(()=>{const r=SBIL(e); return __t("Tu as dominé la saison régulière ({#1}-{#2}, {#0}), mais la bague t'a échappé. Il va falloir convertir cette domination.",[texteRang(r.rang),r.v,r.d]);})(),
   choix:[
    c('Performance',__("Ajouter une arme offensive à ton répertoire"),{scoring:2,basketIQ:1}),
    c('Carrière / Contrat',__("Négocier un rôle encore plus central"),{coteEquipe:3,reputation:2}),
    c('Image / Marque',__("Capitaliser sur ta saison avec une campagne de marque"),{reputation:5}),
    c('Vie perso',__("Prendre le temps de profiter avec tes proches"),{alchimieEquipe:3,risqueBlessure:-3}),
    c('Risque / Legacy',__("Annoncer viser le record de victoires l'an prochain"),{reputation:5,risqueBlessure:3})
  ]},
  {id:'trade_surprise',special:true,generique:false,cond:e=>e.flagScenario==='trade_surprise',
   effetDebut:e=>{ const f=franchiseParId(e.tradeVers); if(f&&f.id!==e.franchise.id) changerFranchise(f,pick(TAGS_EQUIPE)); },
   question:__("Échangé par surprise ! Comment réagis-tu ?"),
   contexte:e=>__t("Un appel en pleine nuit : les {#0} t'ont échangé aux {#1} {#2}. Ton contrat te suit, mais tout le reste change.",[e.ancienneFranchise?e.ancienneFranchise.nom:'',e.franchise.ville,e.franchise.nom]),
   choix:[
    c('Performance',__("Arriver au premier entraînement et prouver ta valeur"),{scoring:1,basketIQ:1}),
    c('Carrière / Contrat',__("Demander à ton agent de revoir ta situation contractuelle"),{coteEquipe:2,reputation:1}),
    c('Image / Marque',__("Remercier publiquement ton ancienne ville et ses supporters"),{reputation:4}),
    c('Vie perso',__("Faire venir ta famille avant la reprise"),{alchimieEquipe:4}),
    c('Risque / Legacy',__("Dire publiquement que personne ne t'avait prévenu"),{reputation:5,alchimieEquipe:-4})
  ]},
  {id:'trade_veto',special:true,generique:false,cond:e=>e.flagScenario==='trade_veto',
   question:__("Ta clause de non-trade est activée : que fais-tu ?"),
   contexte:e=>{ const f=franchiseParId(e.tradeVers)||e.franchise; return __t("Les {#0} veulent t'échanger aux {#1} {#2}. Grâce à ta clause de non-trade, rien ne peut se faire sans ton accord.",[e.franchise.nom,f.ville,f.nom]); },
   choix:[
    c('Performance',__("Refuser le trade et te concentrer sur la saison"),{scoring:1,basketIQ:1,alchimieEquipe:-2}),
    {...c('Carrière / Contrat',__("Accepter le trade en échange de garanties de ton nouvel employeur"),{coteEquipe:2}),action:'quitter'},
    {...c('Image / Marque',__("Accepter pour rejoindre un plus gros marché"),{reputation:5}),action:'quitter'},
    c('Vie perso',__("Refuser : ta famille est installée ici"),{alchimieEquipe:4,reputation:-1}),
    {...c('Risque / Legacy',__("Accepter, mais critiquer publiquement la direction"),{reputation:3,alchimieEquipe:-4}),action:'quitter'}
  ]},
  {id:'trade_demande',special:true,generique:false,cond:e=>e.flagScenario==='trade_demande',
   question:__("Tu es une star dans une équipe qui stagne. Que fais-tu ?"),
   contexte:e=>__t("Tu es l'un des joueurs les plus importants de la ligue, mais les {#0} {#1} n'avancent plus. Plusieurs équipes ont déjà appelé ton agent.",[e.franchise.ville,e.franchise.nom]),
   choix:[
    c('Performance',__("Rester et tout donner pour redresser l'équipe"),{scoring:1,defense:1,alchimieEquipe:3}),
    {...c('Carrière / Contrat',__("Demander officiellement un trade à ta direction"),{reputation:-1}),action:'demande'},
    {...c('Image / Marque',__("Laisser fuiter dans la presse que tu veux partir"),{reputation:4,alchimieEquipe:-4}),action:'demande'},
    c('Vie perso',__("En parler à ta famille et à tes proches avant de décider"),{alchimieEquipe:2,reputation:1}),
    {...c('Risque / Legacy',__("Boycotter l'entraînement pour forcer un départ"),{reputation:-6,alchimieEquipe:-6}),action:'demande'}
  ]},
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
  {id:'contrat',generique:false,cond:e=>false,
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
  {id:'coupe_continent',generique:false,cond:e=>estCAN(e.saison)&&!!coupeContinent(e)&&selectionne(e),
   question:__("Une coupe continentale approche : comment la prépares-tu ?"),
   coupe:e=>({nom:coupeContinent(e),type:'continent'}),
   contexte:e=>__t("La {#0} réunit les meilleures sélections de la région. {#1} compte sur toi, mais ta franchise aussi.",[coupeContinent(e),aPays(e)?nomPays(e):__('Ta sélection')]),
   choix:e=>[
    c('Performance',__t("Rejoindre le stage de préparation et travailler les systèmes de {#0}",[nomPays(e)]),{playmaking:2,basketIQ:2,risqueBlessure:2}),
    c('Carrière / Contrat',__("Obtenir de ta franchise une libération sans conditions pour toute la compétition"),{coteEquipe:2,reputation:2}),
    c('Image / Marque',__t("Porter le brassard de capitaine dans les médias avant le tournoi",[]),{reputation:5}),
    {...c('Vie perso',__("Refuser la sélection nationale et te reposer cet été"),{alchimieEquipe:2,risqueBlessure:-6,reputation:-3}),action:'refus_selection'},
    c('Risque / Legacy',__("Jouer toute la compétition à fond malgré la fatigue de la saison"),{reputation:4,scoring:2,risqueBlessure:5})
  ]},
  {id:'coupe_monde',generique:false,cond:e=>estMonde(e.saison),
   question:__("La Coupe du Monde de la FIB arrive : quel joueur veux-tu y être ?"),
   coupe:e=>({nom:COUPE_MONDE,type:'monde'}),
   contexte:e=>__t("La FIB (Fédération internationale de basket) organise la {#0}. Le monde entier regarde, et {#1} veut aller loin.",[COUPE_MONDE,nomPays(e)]),
   choix:e=>[
    c('Performance',__("Faire de la préparation athlétique ta priorité absolue"),{athletisme:3,defense:1,risqueBlessure:2}),
    c('Carrière / Contrat',__("Utiliser la visibilité mondiale pour relancer ton contrat"),{coteEquipe:3,reputation:2}),
    c('Image / Marque',__t("Signer un contrat de marque lié à la Coupe du Monde",[]),{reputation:6,alchimieEquipe:-1}),
    {...c('Vie perso',__("Refuser la sélection nationale et te reposer cet été"),{alchimieEquipe:2,risqueBlessure:-6,reputation:-3}),action:'refus_selection'},
    c('Risque / Legacy',__("Annoncer que tu veux le titre mondial et le MVP du tournoi"),{reputation:6,scoring:2,risqueBlessure:4})
  ]},
  {id:'jeux_olympiques',generique:false,cond:e=>estJO(e.saison),
   question:__("Les Jeux Olympiques approchent : comment les abordes-tu ?"),
   coupe:e=>({nom:JEUX_OLYMPIQUES,type:'jo'}),
   contexte:e=>__t("Tous les quatre ans, les Jeux Olympiques réunissent les meilleures sélections de la planète. {#0} rêve d'une médaille, et tu es au cœur de ce rêve.",[aPays(e)?nomPays(e):__('Ta sélection')]),
   choix:e=>[
    c('Performance',__("Suivre un programme de préparation spécial pour être à ton pic le jour J"),{athletisme:2,scoring:1,basketIQ:1,risqueBlessure:2}),
    c('Carrière / Contrat',__("Négocier une clause « Jeux » avec ta franchise : libération et prime à la clé"),{coteEquipe:2,reputation:3}),
    c('Image / Marque',__("Devenir le visage de ta délégation dans les médias"),{reputation:6,alchimieEquipe:-1}),
    {...c('Vie perso',__("Refuser la sélection nationale et te reposer cet été"),{alchimieEquipe:2,risqueBlessure:-6,reputation:-3}),action:'refus_selection'},
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
  {id:'prolongation_contrat',generique:false,cond:e=>false,
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
  {id:'fac_decision',special:true,fac:true,generique:false,cond:e=>e.flagScenario==='fac_decision',
   question:__("Fin de saison universitaire : quelle est la suite ?"),
   contexte:e=>__t("Tu viens de terminer ta saison à {#0}. Ton agent et ta famille attendent ta décision : continuer la fac, te présenter à la Draft ou choisir une autre voie.",[e.franchise.ville]),
   choix:[
    {...c('Performance',__("Passer une année entière à t'entraîner avant la Draft"),{athletisme:3,basketIQ:1,risqueBlessure:-4}),action:'prepa'},
    {...c('Carrière / Contrat',__("Te présenter à la Draft maintenant"),{reputation:2}),action:'draft'},
    {...c('Image / Marque',__("Partir jouer un an en Europe"),{basketIQ:2,defense:1}),action:'europe'},
    {...c('Vie perso',__("Rester une année de plus à l'université"),{basketIQ:2,alchimieEquipe:2}),action:'fac_rester'},
    {...c('Risque / Legacy',__("Rejoindre la G-League"),{scoring:2,athletisme:1,risqueBlessure:2}),action:'gleague'}
  ]},
  {id:'fac_arrivee',fac:true,generique:false,cond:e=>(e.niveau==='fac'&&!e.fac.lycee)&&e.fac.numero===1,
   question:__("Première année à l'université : comment t'installes-tu ?"),
   contexte:e=>__t("Tu arrives chez les {#0} {#1}. Nouveau vestiaire, nouveau coach, des cours à suivre et déjà des recruteurs dans les gradins.",[e.franchise.ville,e.franchise.nom]),
   choix:[
    c('Performance',__("Rejoindre la salle de musculation dès l'aube"),{athletisme:2,risqueBlessure:2}),
    c('Carrière / Contrat',__("Négocier ton rôle dans la rotation avec le coach"),{coteEquipe:2,reputation:1}),
    c('Image / Marque',__("Montrer ta vie de campus sur les réseaux"),{reputation:3}),
    c('Vie perso',__("Équilibrer cours et entraînements dès le premier semestre"),{basketIQ:2,risqueBlessure:-2}),
    c('Risque / Legacy',__("Annoncer vouloir être le meilleur freshman du pays"),{reputation:5,risqueBlessure:2})
  ]},
  {id:'fac_nil',fac:true,generique:false,cond:e=>(e.niveau==='fac'&&!e.fac.lycee)&&e.meta.reputation>=45,
   question:__("Des marques te contactent déjà : que fais-tu ?"),
   contexte:e=>__t("Les accords d'image sont autorisés pour les étudiants-athlètes. Plusieurs entreprises de la région veulent ton visage sur leurs campagnes.",[]),
   choix:[
    c('Performance',__("Refuser les offres pour te concentrer sur ton jeu"),{scoring:1,basketIQ:1}),
    c('Carrière / Contrat',__("Confier tes accords à un agent de confiance"),{reputation:2,coteEquipe:1}),
    c('Image / Marque',__("Signer un accord local avec un équipementier"),{reputation:5}),
    c('Vie perso',__("Partager les revenus avec ta famille"),{alchimieEquipe:3,reputation:1}),
    c('Risque / Legacy',__("Accepter le plus gros chèque sans lire les clauses"),{reputation:6,risqueBlessure:1,alchimieEquipe:-2})
  ]},
  {id:'fac_etoile',fac:true,generique:false,cond:e=>(e.niveau==='fac'&&!e.fac.lycee)&&e.fac.numero>=2&&e.fac.derniere&&e.fac.derniere.reussis/Math.max(1,e.fac.derniere.total)>=0.6,
   question:__("Tu es la star du campus : comment gères-tu la pression ?"),
   contexte:e=>__t("Ta saison a rempli les salles. Les recruteurs de la ligue parlent déjà de toi dans les médias.",[]),
   choix:[
    c('Performance',__("Ajouter un nouveau mouvement à ton arsenal"),{scoring:2,basketIQ:1}),
    c('Carrière / Contrat',__("Recevoir des agents et comparer leurs propositions"),{reputation:2,coteEquipe:1}),
    c('Image / Marque',__("Accepter une interview télévisée nationale"),{reputation:5}),
    c('Vie perso',__("Rentrer quelques jours chez toi pour souffler"),{alchimieEquipe:3,risqueBlessure:-3}),
    c('Risque / Legacy',__("Promettre le titre universitaire à tes supporters"),{reputation:6,risqueBlessure:2})
  ]},
  {id:'fac_echec',fac:true,generique:false,cond:e=>(e.niveau==='fac'&&!e.fac.lycee)&&e.fac.numero>=2&&e.fac.derniere&&e.fac.derniere.reussis/Math.max(1,e.fac.derniere.total)<0.4,
   question:__("Une année universitaire compliquée : comment rebondir ?"),
   contexte:e=>__t("Tes performances ont déçu. Le coach te demande plus, et les recruteurs se posent des questions.",[]),
   choix:[
    c('Performance',__("Refaire tes fondamentaux avec un coach individuel"),{scoring:2,basketIQ:2}),
    c('Carrière / Contrat',__("Demander une explication franche au staff"),{coteEquipe:2}),
    c('Image / Marque',__("Reconnaître publiquement tes erreurs"),{reputation:3}),
    c('Vie perso',__("Prendre du recul avec ta famille avant la reprise"),{alchimieEquipe:3,risqueBlessure:-2}),
    c('Risque / Legacy',__("Changer complètement ton style de jeu"),{scoring:2,athletisme:2,risqueBlessure:3})
  ]},
  {id:'fac_blessure',fac:true,generique:false,cond:e=>(e.niveau==='fac'&&!e.fac.lycee)&&e.fac.numero>=2&&e.bilan&&e.bilan.blessure,
   question:__("Une blessure t'a coûté une partie de la saison : que fais-tu ?"),
   contexte:e=>__t("Le staff médical te prépare un programme de retour. L'université et les recruteurs attendent de voir comment tu reviens.",[]),
   choix:[
    c('Performance',__("Suivre le programme de rééducation à la lettre"),{athletisme:1,risqueBlessure:-5}),
    c('Carrière / Contrat',__("Demander l'avis d'un second spécialiste"),{coteEquipe:1,risqueBlessure:-3}),
    c('Image / Marque',__("Documenter ton retour sur les réseaux"),{reputation:3}),
    c('Vie perso',__("Profiter de ce temps pour valider tes cours"),{basketIQ:2,alchimieEquipe:2}),
    c('Risque / Legacy',__("Revenir plus tôt que prévu pour le tournoi"),{reputation:4,risqueBlessure:7})
  ]},
  {id:'fac_portail',fac:true,generique:false,cond:e=>(e.niveau==='fac'&&!e.fac.lycee)&&e.fac.numero>=2,
   question:__("Des écoles te sollicitent : restes-tu ou changes-tu d'université ?"),
   contexte:e=>__t("Le portail de transferts s'ouvre. Plusieurs programmes plus prestigieux t'appellent, mais ton coach compte sur toi.",[]),
   choix:[
    c('Performance',__("Rester et travailler avec le coach qui te connaît"),{basketIQ:2,alchimieEquipe:2}),
    {...c('Carrière / Contrat',__("Rejoindre un programme plus prestigieux"),{coteEquipe:3,reputation:2,alchimieEquipe:-2}),action:'transfert'},
    c('Image / Marque',__("Annoncer ta décision en direct sur les réseaux"),{reputation:4}),
    c('Vie perso',__("Rester près de tes amis et de ta famille"),{alchimieEquipe:4}),
    {...c('Risque / Legacy',__("Changer d'école et viser le titre national"),{reputation:3,risqueBlessure:2,alchimieEquipe:-3}),action:'transfert'}
  ]},
  {id:'fac_draft',fac:true,generique:false,cond:e=>(e.niveau==='fac'&&!e.fac.lycee)&&e.fac.numero>=3,
   question:__("Dernière année universitaire : comment prépares-tu la Draft ?"),
   contexte:e=>__t("Les recruteurs remplissent les gradins. Cette saison compte double pour ta position à la Draft.",[]),
   choix:[
    c('Performance',__("Travailler uniquement ta mécanique de tir"),{scoring:3}),
    c('Carrière / Contrat',__("Choisir un agent reconnu avant la fin de saison"),{coteEquipe:2,reputation:2}),
    c('Image / Marque',__("Soigner ton image pour les équipes de la ligue"),{reputation:4}),
    c('Vie perso',__("Finir tes cours pour sécuriser ton diplôme"),{basketIQ:2,risqueBlessure:-2}),
    c('Risque / Legacy',__("Dire publiquement que tu seras choix n°1"),{reputation:6,risqueBlessure:2})
  ]},
  {id:'fac_etudes',fac:true,generique:true,cond:e=>(e.niveau==='fac'&&!e.fac.lycee),
   question:__("Entre cours et entraînements, que privilégies-tu cette saison ?"),
   contexte:e=>__t("Les examens approchent en même temps que les gros matchs. Il va falloir choisir ses priorités.",[]),
   choix:[
    c('Performance',__("Ajouter une séance de tir individuelle chaque soir"),{scoring:2,risqueBlessure:2}),
    c('Carrière / Contrat',__("Négocier un emploi du temps adapté avec l'université"),{coteEquipe:1,reputation:1}),
    c('Image / Marque',__("Aider les jeunes du quartier lors d'un stage d'été"),{reputation:3}),
    c('Vie perso',__("Valider tous tes cours sans faire d'impasse"),{basketIQ:3,risqueBlessure:-2}),
    c('Risque / Legacy',__("Sécher les cours pour t'entraîner davantage"),{scoring:2,athletisme:2,reputation:-2,risqueBlessure:3})
  ]},
  {id:'rival_promo',generique:false,intro:'promo',cond:e=>e.saison>=2&&!possede('promo'),
   question:__("Un joueur de ta promotion te suit de près : comment l'abordes-tu ?"),
   contexte:(e,r)=>(__t("{#0}, {#1} de {#2}, a été drafté juste après toi. Les médias vous comparent chaque semaine.",[r.nom,__(r.poste).toLowerCase(),r.equipe])+' '+raisonRival(r)).trim(),
   choix:(e,r)=>[
    c('Performance',__t("Étudier le jeu de {#0} pour mieux le contrer",[r.court]),{basketIQ:3}),
    c('Carrière / Contrat',__t("Demander à ton coach de te placer sur {#0} à chaque duel",[r.court]),{coteEquipe:2,reputation:2,rivalite:1}),
    c('Image / Marque',__t("Entretenir la comparaison avec {#0} dans la presse",[r.court]),{reputation:4,rivalite:1}),
    c('Vie perso',__t("Prendre un café avec {#0} pour désamorcer la tension",[r.court]),{alchimieEquipe:2,rivalite:-1}),
    c('Risque / Legacy',__t("Défier publiquement {#0} de te battre sur le terrain",[r.court]),{reputation:5,risqueBlessure:3,rivalite:2})
  ]},
  {id:'rival_veteran',generique:false,intro:'veteran',cond:e=>e.saison>=3&&!possede('veteran'),
   question:__("Une légende de la ligue bloque ton chemin : comment la détrôner ?"),
   contexte:(e,r)=>(__t("{#0}, {#1} de {#2}, domine la ligue depuis des années. Tant qu'il est là, personne ne te voit comme le meilleur.",[r.nom,__(r.poste).toLowerCase(),r.equipe])+' '+raisonRival(r)).trim(),
   choix:(e,r)=>[
    c('Performance',__t("Passer l'été à travailler les points forts de {#0}",[r.court]),{scoring:2,defense:2}),
    c('Carrière / Contrat',__t("Réclamer plus de responsabilités pour prendre la place de {#0}",[r.court]),{coteEquipe:3,reputation:2,rivalite:1}),
    c('Image / Marque',__t("Dire publiquement que tu vises la place de {#0}",[r.court]),{reputation:5,rivalite:2}),
    c('Vie perso',__t("Demander conseil à {#0} après un match",[r.court]),{basketIQ:3,rivalite:-1}),
    c('Risque / Legacy',__t("Prendre les tirs décisifs pour voler la vedette à {#0}",[r.court]),{reputation:4,risqueBlessure:3,rivalite:1})
  ]},
  {id:'rival_ancien',generique:false,intro:'ancien',cond:e=>e.saison>=5&&!possede('ancien'),
   question:__("Ton ancien coéquipier est parti chez un rival : comment le vis-tu ?"),
   contexte:(e,r)=>(__t("{#0}, avec qui tu as partagé le vestiaire, a rejoint {#1}. Les supporters se demandent de quel côté tu es.",[r.nom,r.equipe])+' '+raisonRival(r)).trim(),
   choix:(e,r)=>[
    c('Performance',__t("Utiliser ce que tu sais des habitudes de {#0} pour le préparer",[r.court]),{basketIQ:3,rivalite:1}),
    c('Carrière / Contrat',__t("Conseiller à ta direction de proposer un retour à {#0}",[r.court]),{coteEquipe:2,rivalite:-1}),
    c('Image / Marque',__t("Souhaiter bonne chance à {#0} publiquement",[r.court]),{reputation:3,rivalite:-1}),
    c('Vie perso',__t("Rester en contact avec {#0} malgré la rivalité",[r.court]),{alchimieEquipe:3,rivalite:-1}),
    c('Risque / Legacy',__t("Lancer à {#0} qu'il regrettera son choix",[r.court]),{reputation:5,alchimieEquipe:-2,rivalite:2})
  ]},
  {id:'rival_media',generique:false,intro:'media',cond:e=>e.saison>=6&&e.meta.reputation>=55&&!possede('media'),
   question:__("Un rival te cherche dans la presse : comment réponds-tu ?"),
   contexte:(e,r)=>(__t("{#0} ({#1}) multiplie les déclarations contre toi. Chaque interview alimente le duel.",[r.nom,r.equipe])+' '+raisonRival(r)).trim(),
   choix:(e,r)=>[
    c('Performance',__("Répondre uniquement sur le terrain"),{scoring:2,basketIQ:1,rivalite:1}),
    c('Carrière / Contrat',__t("Demander à ton agent de calmer le jeu avec les représentants de {#0}",[r.court]),{reputation:1,rivalite:-1}),
    c('Image / Marque',__t("Répondre point par point à {#0} en conférence de presse",[r.court]),{reputation:4,rivalite:1}),
    c('Vie perso',__("Couper les réseaux sociaux quelques semaines"),{alchimieEquipe:2,rivalite:-1}),
    c('Risque / Legacy',__("Lancer une punchline qui devient virale"),{reputation:6,alchimieEquipe:-2,rivalite:2})
  ]}
];
const SCENARIO_MATCHS={
  non_qualifie:['remontee','lancers','rival'], non_qualifie2:['technique','remontee'], catastrophe:['remontee','lancers','retour'], catastrophe2:['retour','technique'], elimine_tot:['playoffs','buzzer','remontee'], elimine_tot2:['playoffs','lancers'], demi:['playoffs','buzzer'], finaliste:['playoffs','buzzer','lancers'], finaliste2:['playoffs','remontee'], survol:['playoffs','exterieur','rival'],
  fac_arrivee:['rival','technique'], fac_nil:['exterieur','rival'], fac_etoile:['buzzer','playoffs'], fac_echec:['lancers','remontee'], fac_blessure:['retour','blessure'], fac_portail:['exterieur','rival'], fac_draft:['buzzer','lancers','playoffs'], fac_etudes:['faute_rapide','exterieur'],
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

/* ---------- Lycée : dernière année, jouée avant les offres universitaires ---------- */
const LYCEES=[
  ['Sterling Prep','Falcons','#1F3A93','#F5C542','STP',3],['Harbor Academy','Admirals','#0B2A4A','#C9A227','HAR',3],['Ridgemont Prep','Titans','#7A1F2B','#D9D9D9','RDG',3],['Summit Prep','Lions','#0E5E3A','#F2E3A3','SUM',3],
  ['Lincoln High','Wolves','#4B5563','#9FB4D6','LIN',2],['Central High','Bulldogs','#7C1D1D','#F3F4F6','CEN',2],['Westside High','Hawks','#0F4C81','#E5E7EB','WST',2],['Northview High','Panthers','#1F2937','#F59E0B','NVW',2],["St. Mary's",'Knights','#5B2A86','#E5C100','STM',2],
  ['Eastside High','Rams','#B45309','#1F2937','EST',1],['Valley High','Cougars','#0E7490','#F3F4F6','VAL',1],['Riverbend High','Otters','#166534','#D1D5DB','RVB',1],['Cedar Park High','Bears','#7F1D1D','#E5E7EB','CED',1],['Southgate High','Stallions','#1E40AF','#FBBF24','SGT',1],['Hillcrest High','Rockets','#B91C1C','#111827','HIL',1],['Maple Grove High','Owls','#92400E','#F3F4F6','MAP',1],['Union High','Miners','#374151','#F59E0B','UNI',1]
].map((r,i)=>({id:'l'+i,ville:r[0],nom:r[1],couleur:r[2],couleur2:r[3],abr:r[4],prestige:r[5]}));
const TIERS_FAC={3:'High major',2:'Mid major',1:'Low major'};
SCENARIOS.push(
  {id:'lyc_prep',fac:true,generique:false,cond:e=>e.niveau==='fac'&&!!e.fac.lycee&&(e.fac.etape||1)===1&&e.origine==='prep',
   question:__("Dernière année de prep school : quel est ton rôle ?"),
   contexte:e=>__t("Tu joues pour {#0} {#1}, l'un des meilleurs lycées du pays. Les recruteurs des grandes universités remplissent déjà les gradins, mais tu partages le ballon avec d'autres futures stars.",[e.franchise.ville,e.franchise.nom]),
   choix:[
    c('Performance',__("Travailler ton jeu avec le staff d'élite chaque matin"),{scoring:2,basketIQ:1}),
    c('Carrière / Contrat',__("Demander le rôle de première option offensive"),{coteEquipe:2,reputation:1}),
    c('Image / Marque',__("Accepter d'être filmé pour un documentaire sur ton lycée"),{reputation:4}),
    c('Vie perso',__("Garder du temps pour tes proches malgré le rythme"),{alchimieEquipe:3,risqueBlessure:-3}),
    c('Risque / Legacy',__("Annoncer vouloir être le meilleur lycéen du pays"),{reputation:5,risqueBlessure:2})
  ]},
  {id:'lyc_academie',fac:true,generique:false,cond:e=>e.niveau==='fac'&&!!e.fac.lycee&&(e.fac.etape||1)===1&&e.origine==='academie',
   question:__("Dernière année au centre de formation : comment la vis-tu ?"),
   contexte:e=>__t("Tu défends les couleurs de {#0} {#1}. La discipline est stricte, tes progrès sont suivis de près et les recruteurs observent chaque séance.",[e.franchise.ville,e.franchise.nom]),
   choix:[
    c('Performance',__("Respecter à la lettre ton programme individuel"),{athletisme:2,basketIQ:1}),
    c('Carrière / Contrat',__("Demander aux coachs de présenter ton profil aux universités"),{reputation:2,coteEquipe:1}),
    c('Image / Marque',__("Publier tes progrès chaque semaine sur les réseaux"),{reputation:3}),
    c('Vie perso',__("Rentrer voir ta famille chaque fin de mois"),{alchimieEquipe:3,risqueBlessure:-2}),
    c('Risque / Legacy',__("Tenter des gestes techniques que le coach déconseille"),{scoring:2,reputation:2,risqueBlessure:3})
  ]},
  {id:'lyc_bitume',fac:true,generique:false,cond:e=>e.niveau==='fac'&&!!e.fac.lycee&&(e.fac.etape||1)===1&&e.origine==='bitume',
   question:__("Du bitume à l'équipe de jeunes : comment portes-tu ton équipe ?"),
   contexte:e=>__t("Tu es la star de {#0} {#1}, une petite équipe sans grands moyens. Tout le quartier vient te voir jouer, mais peu de recruteurs ont fait le déplacement.",[e.franchise.ville,e.franchise.nom]),
   choix:[
    c('Performance',__("Porter l'équipe à toi seul chaque soir"),{scoring:2,risqueBlessure:2}),
    c('Carrière / Contrat',__("Envoyer toi-même tes vidéos aux universités"),{reputation:2,coteEquipe:1}),
    c('Image / Marque',__("Tourner une vidéo virale avec ton quartier"),{reputation:4}),
    c('Vie perso',__("Organiser des matchs pour les jeunes du quartier"),{alchimieEquipe:3,reputation:1}),
    c('Risque / Legacy',__("Défier publiquement la meilleure équipe de l'État"),{reputation:5,risqueBlessure:2})
  ]},
  {id:'lyc_fils',fac:true,generique:false,cond:e=>e.niveau==='fac'&&!!e.fac.lycee&&(e.fac.etape||1)===1&&e.origine==='fils',
   question:__("Dernière année sous le nom de ton père : comment l'assumes-tu ?"),
   contexte:e=>__t("Chez {#0} {#1}, tout le monde connaît ton nom de famille. Les recruteurs sont venus voir le fils de l'ancien joueur, et tu dois prouver que tu es bien plus que cela.",[e.franchise.ville,e.franchise.nom]),
   choix:[
    c('Performance',__("Travailler tes fondamentaux avec ton père"),{basketIQ:2,defense:1}),
    c('Carrière / Contrat',__("Laisser ton père discuter avec les universités"),{coteEquipe:2,reputation:1}),
    c('Image / Marque',__("Refuser toutes les interviews sur ton père"),{reputation:1,alchimieEquipe:2}),
    c('Vie perso',__("Passer du temps loin du basket avec ta famille"),{alchimieEquipe:2,risqueBlessure:-3}),
    c('Risque / Legacy',__("Promettre de faire mieux que lui"),{reputation:5,risqueBlessure:2})
  ]},
  {id:'lyc_generique',fac:true,generique:true,cond:e=>e.niveau==='fac'&&!!e.fac.lycee&&(e.fac.etape||1)===1,
   question:__("Dernière année de lycée : où mets-tu l'accent ?"),
   contexte:e=>__t("Les recruteurs commencent à passer dans les gradins de {#0} {#1}. Cette saison peut décider du niveau des universités qui t'appelleront.",[e.franchise.ville,e.franchise.nom]),
   choix:[
    c('Performance',__("Ajouter une séance de tir individuelle chaque matin"),{scoring:2,risqueBlessure:1}),
    c('Carrière / Contrat',__("Visiter les campus qui offrent le plus de temps de jeu"),{coteEquipe:2}),
    c('Image / Marque',__("Poster toi-même tes highlights"),{reputation:3}),
    c('Vie perso',__("Valider tes cours pour sécuriser ton dossier"),{basketIQ:2,risqueBlessure:-2}),
    c('Risque / Legacy',__("Annoncer viser une seule année universitaire"),{reputation:4,coteEquipe:-1})
  ]}
);
Object.assign(SCENARIO_MATCHS,{lyc_prep:['rival','technique'],lyc_academie:['technique','exterieur'],lyc_bitume:['exterieur','rival'],lyc_fils:['rival','buzzer'],lyc_generique:['buzzer','lancers']});

/* Quart de finale et match pour le bronze : mêmes choix que la demi-finale. */
MATCH_SITUATIONS.forEach(s=>{ if((s.id==='coupe_quart'||s.id==='coupe_bronze')&&!s.choix) s.choix=MATCH_SITUATIONS.find(x=>x.id==='coupe_demi').choix; });

/* Clubs de jeunes hors Amérique du Nord : [région, ville, nom, couleur, couleur2, abréviation, prestige]. Noms inventés, villes réelles. */
const CLUBS_JEUNES=[
 ['af','Kinshasa','Jeunes du Fleuve','#0B5FA5','#F5C542','KIN',1],['af','Douala','Espoirs du Littoral','#166534','#FDE68A','DOU',1],['af','Dakar','Jeunes Lions','#B45309','#FEF3C7','DAK',1],['af','Lagos','Young Eagles','#047857','#F3F4F6','LAG',1],['af','Luanda','Jovens Estrelas','#B91C1C','#111827','LUA',1],
 ['af','Kigali',"Académie de la Colline",'#1D4ED8','#FBBF24','KGL',2],['af','Abidjan','Académie des Lagunes','#C2410C','#F3F4F6','ABJ',2],['af','Le Caire','Jeunes du Nil','#7C1D1D','#E5E7EB','CAI',2],['af','Tunis','Espoirs de Carthage','#BE123C','#F3F4F6','TUN',2],
 ['af','Saly','Académie Continentale','#0E5E3A','#F5C542','SAC',3],['af','Kigali','Grand Club Élite','#1E3A8A','#FBBF24','KGE',3],['af','Casablanca','Grand Club Atlas','#7C1D1D','#F3F4F6','CAS',3],['af','Luanda','Grand Club Atlantique','#0F766E','#FDE68A','LGA',3],
 ['eu','Nantes','Section Jeunes','#166534','#F3F4F6','NAN',1],['eu','Zagreb','Jeunes Basket','#1E40AF','#F3F4F6','ZAG',1],['eu','Varsovie','Jeunes Basket','#B91C1C','#F3F4F6','VAR',1],['eu','Kaunas','Jeunes Espoirs','#047857','#FDE68A','KAU',1],
 ['eu','Lyon','Jeunes Espoirs','#7C1D1D','#E5E7EB','LYO',2],['eu','Milan','Académie Jeunes','#1D4ED8','#F3F4F6','MIL',2],['eu','Berlin','Jeunes Basket','#374151','#F59E0B','BER',2],['eu','Ljubljana','Jeunes Espoirs','#0F766E','#F3F4F6','LJU',2],['eu','Istanbul','Jeunes Basket','#B91C1C','#111827','IST',2],
 ['eu','Belgrade','Centre de Formation Élite','#7C1D1D','#F3F4F6','BEL',3],['eu','Barcelone','Centre de Formation Élite','#1E3A8A','#FBBF24','BCN',3],['eu','Athènes','Centre de Formation Olympique','#0B5FA5','#F3F4F6','ATH',3],['eu','Madrid','Centre de Formation Élite','#4B5563','#F3F4F6','MAD',3],
 ['ot','Manille','Club de Quartier','#B91C1C','#FBBF24','MNL',1],['ot','Rio','Club de Quartier','#047857','#FDE68A','RIO',1],['ot','Santo Domingo','Club de Quartier','#1D4ED8','#F3F4F6','SDO',1],['ot','Osaka','Club de Quartier','#7C1D1D','#F3F4F6','OSA',1],
 ['ot','Buenos Aires','Jeunes Espoirs','#0E7490','#F3F4F6','BUE',2],['ot','Séoul','Jeunes Espoirs','#BE123C','#F3F4F6','SEO',2],['ot','Mexico','Jeunes Espoirs','#166534','#F3F4F6','MEX',2],['ot','Beyrouth','Jeunes Espoirs','#B91C1C','#E5E7EB','BEI',2],
 ['ot','São Paulo','Centre de Formation Élite','#1F2937','#F59E0B','SPA',3],['ot','Melbourne','Académie Élite','#0B2A4A','#F5C542','MEL',3],['ot','Tokyo','Académie Élite','#7C1D1D','#F3F4F6','TKY',3]
].map((r,i)=>({id:'c'+i,region:r[0],ville:r[1],nom:r[2],couleur:r[3],couleur2:r[4],abr:r[5],prestige:r[6]}));
function equipeJeunes(origine,region){
  let niv=PRESTIGE_ORIGINE[origine]||2; const r=Math.random();
  if(origine==='fils') niv=r<0.5?3:2; else if(origine==='bitume'&&r<0.25) niv=2; else if(origine==='academie'&&r<0.3) niv=2;
  const liste=region==='na'?LYCEES:CLUBS_JEUNES.filter(x=>x.region===region);
  const l=liste.filter(x=>x.prestige===niv);
  return pick(l.length?l:liste);
}

SCENARIOS.push(
  {id:'lyc_hs',fac:true,generique:false,cond:e=>e.niveau==='fac'&&!!e.fac.lycee&&(e.fac.etape||1)===1&&e.origine==='hs',
   question:__("Dernière année au lycée public : comment brilles-tu au circuit AAU ?"),
   contexte:e=>__t("Tu joues pour {#0} {#1} et, l'été, pour un club AAU. Les recruteurs te regardent surtout dans les tournois d'été.",[e.franchise.ville,e.franchise.nom]),
   choix:[
    c('Performance',__("Enchaîner les tournois AAU pour te montrer"),{scoring:2,athletisme:1,risqueBlessure:2}),
    c('Carrière / Contrat',__("Contacter toi-même les entraîneurs d'université"),{reputation:2,coteEquipe:1}),
    c('Image / Marque',__("Poster tes meilleurs moments d'AAU sur les réseaux"),{reputation:3}),
    c('Vie perso',__("Garder tes week-ends pour ta famille et tes cours"),{alchimieEquipe:3,risqueBlessure:-3}),
    c('Risque / Legacy',__("Défier le meilleur joueur de l'État en tournoi"),{reputation:5,risqueBlessure:2})
  ]},
  {id:'lyc_club',fac:true,generique:false,cond:e=>e.niveau==='fac'&&!!e.fac.lycee&&(e.fac.etape||1)===1&&e.origine==='club',
   question:__("Dans le club de ton quartier : comment te fais-tu remarquer ?"),
   contexte:e=>__t("Tu joues pour {#0} {#1}, un petit club sans grands moyens. Le terrain est en mauvais état et le matériel manque, mais ton entraîneur croit en toi.",[e.franchise.ville,e.franchise.nom]),
   choix:[
    c('Performance',__("T'entraîner seul tôt le matin avant les cours"),{athletisme:2,basketIQ:1}),
    c('Carrière / Contrat',__("Demander à ton entraîneur de t'ouvrir des portes dans d'autres clubs"),{reputation:2,coteEquipe:1}),
    c('Image / Marque',__("Filmer tes matchs et les partager sur les réseaux"),{reputation:4}),
    c('Vie perso',__("Aider ta famille tout en gardant du temps pour le basket"),{alchimieEquipe:3,risqueBlessure:-2}),
    c('Risque / Legacy',__("Défier les meilleurs de la ville dans un tournoi de quartier"),{reputation:5,risqueBlessure:2})
  ]},
  {id:'lyc_academie_af',fac:true,generique:false,cond:e=>e.niveau==='fac'&&!!e.fac.lycee&&(e.fac.etape||1)===1&&e.origine==='academie_af',
   question:__("À l'académie du continent : comment saisis-tu ta chance ?"),
   contexte:e=>__t("Tu as rejoint {#0} {#1}, qui forme les meilleurs jeunes du continent. Des recruteurs d'Europe et des États-Unis viennent régulièrement observer les entraînements.",[e.franchise.ville,e.franchise.nom]),
   choix:[
    c('Performance',__("Suivre le programme intensif de l'académie à la lettre"),{athletisme:2,basketIQ:1}),
    c('Carrière / Contrat',__("Demander aux coachs de t'inscrire aux camps de détection"),{reputation:2,coteEquipe:1}),
    c('Image / Marque',__("Accepter d'être filmé pour un reportage sur l'académie"),{reputation:4}),
    c('Vie perso',__("Rester en contact avec ta famille malgré l'éloignement"),{alchimieEquipe:3,risqueBlessure:-2}),
    c('Risque / Legacy',__("Annoncer que tu veux partir en Europe dès cette année"),{reputation:4,scoring:1,risqueBlessure:3})
  ]},
  {id:'lyc_sport_etudes',fac:true,generique:false,cond:e=>e.niveau==='fac'&&!!e.fac.lycee&&(e.fac.etape||1)===1&&e.origine==='sport_etudes',
   question:__("Entre le lycée et le club : comment équilibres-tu ?"),
   contexte:e=>__t("Tu es en section sport-études à {#0} {#1}. Cours le matin, basket l'après-midi, et un club régional qui te suit de près.",[e.franchise.ville,e.franchise.nom]),
   choix:[
    c('Performance',__("Ajouter une séance de tir individuelle avant les cours"),{scoring:2,risqueBlessure:1}),
    c('Carrière / Contrat',__("Demander à ton club de te faire monter en équipe première"),{reputation:2,coteEquipe:1}),
    c('Image / Marque',__("Poster ton quotidien de sport-études"),{reputation:3}),
    c('Vie perso',__("Garder du temps pour tes cours et tes amis"),{basketIQ:2,risqueBlessure:-2}),
    c('Risque / Legacy',__("Annoncer viser le titre national des jeunes"),{reputation:4,risqueBlessure:2})
  ]},
  {id:'jeunes_etape2',fac:true,generique:false,cond:e=>e.niveau==='fac'&&!!e.fac.lycee&&e.fac.etape===2,
   question:__("Saison à un niveau supérieur : comment t'imposes-tu ?"),
   contexte:e=>__t("Tu rejoins {#0} {#1}, un cran au-dessus. Les joueurs sont plus durs, les recruteurs plus nombreux : c'est ta chance de passer un palier.",[e.franchise.ville,e.franchise.nom]),
   choix:[
    c('Performance',__("Travailler ta condition physique pour tenir le rythme"),{athletisme:2,risqueBlessure:-1}),
    c('Carrière / Contrat',__("Discuter de ton rôle avec l'entraîneur dès le premier jour"),{coteEquipe:2,reputation:1}),
    c('Image / Marque',__("Montrer ton niveau dans une vidéo de présentation"),{reputation:3}),
    c('Vie perso',__("Prendre le temps de t'installer dans ta nouvelle ville"),{alchimieEquipe:3,risqueBlessure:-3}),
    c('Risque / Legacy',__("Défier le meilleur joueur de l'équipe pour le poste de titulaire"),{reputation:5,risqueBlessure:2})
  ]}
);
Object.assign(SCENARIO_MATCHS,{lyc_hs:['exterieur','rival'],lyc_club:['exterieur','rival'],lyc_academie_af:['technique','exterieur'],lyc_sport_etudes:['technique','buzzer'],jeunes_etape2:['rival','buzzer']});

/* ---------- Interviews (toutes les 3 rencontres de saison régulière) : 5 réponses, une par axe ---------- */
const INTERVIEWS=[
  {id:'temps_jeu',cond:e=>e.meta.place<62,
   question:__("Un journaliste te demande si tu es satisfait de ton temps de jeu."),
   contexte:()=>__("Le micro est sous ton nez dans le couloir des vestiaires. Le coach écoutera sûrement."),
   choix:[
    c('Performance',__("Répondre que tu dois travailler plus dur pour mériter tes minutes"),{coach:5,place:2,vestiaire:2,reputation:1}),
    c('Carrière / Contrat',__("Dire que tu mérites un plus grand rôle et que ton agent en parlera"),{place:3,coach:-4,vestiaire:-2,reputation:1}),
    c('Image / Marque',__("Raconter ton parcours avec le sourire et laisser l'histoire parler"),{reputation:5,coach:1}),
    c('Vie perso',__("Rester patient : tu es heureux d'être là et ta famille te soutient"),{vestiaire:4,coach:3,alchimieEquipe:2}),
    c('Risque / Legacy',__("Lâcher que le coach se trompe sur toi"),{reputation:4,coach:-9,vestiaire:-3,place:-1})
  ]},
  {id:'collectif',cond:()=>true,
   question:__("On te demande ce que tu penses du jeu collectif de l'équipe."),
   contexte:()=>__("Le ballon circule mal depuis quelques matchs et la presse le sait."),
   choix:[
    c('Performance',__("Dire que tu vas hausser le rythme en défense pour créer des paniers faciles"),{coach:3,alchimieEquipe:2,vestiaire:1}),
    c('Carrière / Contrat',__("Souligner que tu es prêt à porter plus de responsabilités"),{place:2,coach:1,vestiaire:-2,reputation:2}),
    c('Image / Marque',__("Lancer une punchline qui fera le tour des réseaux"),{reputation:5,vestiaire:-1}),
    c('Vie perso',__("Féliciter tes coéquipiers et prendre ta part de responsabilité"),{vestiaire:5,alchimieEquipe:3,coach:2}),
    c('Risque / Legacy',__("Dire que certains coéquipiers jouent trop pour eux"),{reputation:3,vestiaire:-8,alchimieEquipe:-6,coach:1})
  ]},
  {id:'systeme',cond:()=>true,
   question:__("Le système du coach te convient-il ?"),
   contexte:()=>__("La question n'est pas innocente : on parle de tensions dans le staff."),
   choix:[
    c('Performance',__("Expliquer que tu t'adaptes et que tu progresses dans son système"),{coach:5,alchimieEquipe:1,place:1}),
    c('Carrière / Contrat',__("Dire que tu aimerais un système qui te met plus en valeur"),{place:2,coach:-5,reputation:1,vestiaire:-1}),
    c('Image / Marque',__("Éviter la question avec une réponse élégante"),{reputation:2,vestiaire:1}),
    c('Vie perso',__("Remercier le coach pour sa confiance et sa franchise"),{coach:5,vestiaire:2}),
    c('Risque / Legacy',__("Critiquer ouvertement une décision du coach"),{coach:-10,reputation:4,vestiaire:-2,place:-2})
  ]},
  {id:'critique',cond:()=>true,
   question:__("Un ancien joueur dit à la télé que tu es surcoté."),
   contexte:()=>__("L'extrait tourne en boucle sur les réseaux depuis ce matin."),
   choix:[
    c('Performance',__("Ne rien dire et répondre sur le terrain"),{coach:3,reputation:2,vestiaire:2}),
    c('Carrière / Contrat',__("Rappeler tes chiffres et ton contrat avec calme"),{reputation:3}),
    c('Image / Marque',__("Répondre avec humour pour retourner la salle"),{reputation:5,vestiaire:1}),
    c('Vie perso',__("Dire que tu respectes son avis et que tu es bien entouré"),{vestiaire:3,reputation:2,alchimieEquipe:1}),
    c('Risque / Legacy',__("Le défier publiquement de venir t'affronter"),{reputation:6,vestiaire:-2,coach:-3,risqueBlessure:2})
  ]},
  {id:'vestiaire',cond:()=>true,
   question:__("La presse veut savoir ce qui se passe dans le vestiaire."),
   contexte:e=>{ const l=(e.matchsResultats||[]).slice(-3); const ok=l.filter(m=>m.reussi).length; return ok>=2?__("L'équipe sort de matchs solides, mais la presse cherche la petite histoire."):__("Après des matchs difficiles, la presse cherche des coupables."); },
   choix:[
    c('Performance',__("Dire que le groupe bosse et que les résultats viendront"),{coach:3,alchimieEquipe:2,vestiaire:2}),
    c('Carrière / Contrat',__("Parler de l'ambition collective et du besoin de renforts"),{coach:-2,reputation:2,alchimieEquipe:-1,place:1}),
    c('Image / Marque',__("Rester vague avec le sourire des grands soirs"),{reputation:3}),
    c('Vie perso',__("Défendre le vestiaire : « Nous sommes une famille »"),{vestiaire:4,alchimieEquipe:5,coach:1}),
    c('Risque / Legacy',__("Révéler une dispute pour faire réagir le groupe"),{reputation:5,alchimieEquipe:-7,vestiaire:-5,coach:-3})
  ]},
  {id:'hype',cond:e=>e.meta.reputation>=50||e.meta.place>=62,
   question:__("Les médias te présentent comme une future star de la ligue."),
   contexte:()=>__("Les caméras te suivent. Les vétérans, eux, observent."),
   choix:[
    c('Performance',__("Dire que tu n'as encore rien prouvé et qu'il reste du travail"),{coach:4,vestiaire:3,reputation:2}),
    c('Carrière / Contrat',__("Assumer tes ambitions : tu veux un rôle de franchise player"),{place:3,reputation:3,vestiaire:-3,coach:-1}),
    c('Image / Marque',__("Surfer sur la vague et lancer ta marque"),{reputation:6,vestiaire:-2}),
    c('Vie perso',__("Renvoyer la lumière vers les vétérans qui t'ont aidé"),{vestiaire:6,alchimieEquipe:3,coach:2}),
    c('Risque / Legacy',__("Te comparer aux légendes de la ligue"),{reputation:6,vestiaire:-6,coach:-2,place:1})
  ]},
  {id:'trade',cond:e=>e.saison>=2,
   question:__("Des rumeurs de trade circulent à ton sujet."),
   contexte:()=>__("Ton nom revient dans plusieurs articles. La direction n'a rien confirmé."),
   choix:[
    c('Performance',__("Dire que tu te concentres sur le prochain match"),{coach:4,vestiaire:2,alchimieEquipe:1}),
    c('Carrière / Contrat',__("Dire que tu es ouvert à tout pour jouer plus"),{place:2,coach:-4,vestiaire:-2,reputation:2}),
    c('Image / Marque',__("Laisser planer le mystère pour faire parler de toi"),{reputation:5,coach:-2,alchimieEquipe:-1}),
    c('Vie perso',__("Dire que tu veux rester et construire ici"),{vestiaire:5,coach:3,alchimieEquipe:3}),
    c('Risque / Legacy',__("Lâcher un « on verra » qui met le feu aux médias"),{reputation:5,coach:-5,vestiaire:-4,alchimieEquipe:-3})
  ]}
];

/* ---------- Agence libre : interview en trois questions pour un joueur important ---------- */
const FA_INTERVIEWS=[
  {id:'fa1',question:__("« Ton avenir est la grande question de l'été. Tu restes ou tu pars ? »"),
   contexte:()=>__("Les caméras sont là. Tout le marché écoute."),
   choix:[
    {...c('Performance',__("Dire que ton seul objectif est de gagner un titre"),{reputation:2,vestiaire:1}),chaud:0.03},
    {...c('Carrière / Contrat',__("Dire que tu écouteras toutes les offres"),{reputation:1,vestiaire:-2}),chaud:0.06},
    {...c('Image / Marque',__("Annoncer que tu feras ton choix en direct sur les réseaux"),{reputation:4,vestiaire:-1}),chaud:0.05},
    {...c('Vie perso',__("Remercier ton équipe et les fans, quoi qu'il arrive"),{vestiaire:4,reputation:2,alchimieEquipe:1}),chaud:0},
    {...c('Risque / Legacy',__("Laisser entendre que tu pourrais surprendre tout le monde"),{reputation:4,vestiaire:-3}),chaud:0.08}
  ]},
  {id:'fa2',question:__("On te demande ce que tu recherches avant tout dans ton prochain contrat."),
   contexte:()=>__("Les directeurs sportifs de la ligue prennent des notes."),
   choix:[
    {...c('Performance',__("Un projet sportif ambitieux et un vrai rôle"),{reputation:1,vestiaire:1}),chaud:0.02},
    {...c('Carrière / Contrat',__("Un contrat long et sécurisant"),{reputation:1}),chaud:0.04},
    {...c('Image / Marque',__("Un marché où ta marque peut exploser"),{reputation:3}),chaud:0.04},
    {...c('Vie perso',__("La stabilité pour toi et ta famille"),{vestiaire:2,alchimieEquipe:1}),chaud:-0.02},
    {...c('Risque / Legacy',__("Le plus gros contrat de l'histoire de la franchise"),{reputation:3,vestiaire:-2}),chaud:0.08}
  ]},
  {id:'fa3',question:__("Alors, où vas-tu signer ?"),
   contexte:()=>__("Les équipes ont déjà préparé leurs offres. Ta réponse va orienter les propositions."),
   choix:[
    {...c('Performance',__("Chez un candidat au titre"),{reputation:1}),pref:'contender',chaud:0.02},
    {...c('Carrière / Contrat',__("Là où l'offre sera la plus forte"),{reputation:1}),pref:'argent',chaud:0.05},
    {...c('Image / Marque',__("Dans un gros marché"),{reputation:2}),pref:'marche',chaud:0.02},
    {...c('Vie perso',__("À la maison, avec les gens qui m'ont tout donné"),{vestiaire:3,alchimieEquipe:2}),pref:'maison',chaud:0},
    {...c('Risque / Legacy',__("Dans une équipe qui bâtit tout autour de moi"),{reputation:2}),pref:'star',chaud:0.03}
  ]}
];
function themeInterviewParId(id){ return INTERVIEWS.find(x=>x.id===id)||FA_INTERVIEWS.find(x=>x.id===id)||null; }
