# Sécurité — Five Ways

Five Ways est un site statique (HTML, CSS, JavaScript) : il n'a ni serveur, ni base de données, ni compte utilisateur, ni formulaire envoyé en ligne. La progression est enregistrée uniquement dans le navigateur du joueur (`localStorage`).

## Signaler une faille
Ouvre un signalement privé : onglet **Security** du dépôt, puis **Report a vulnerability**. N'ouvre pas d'issue publique pour une faille.

## Ce qui est en place
- Politique de sécurité du contenu (CSP) : seuls les scripts du site sont autorisés, aucune connexion réseau sortante n'est permise au code du jeu.
- Tout texte affiché est échappé ; les sauvegardes du navigateur sont reconstruites avec des valeurs contrôlées avant d'être utilisées.
- Aucune donnée personnelle n'est collectée, aucun traceur, aucun cookie.
- Protection contre l'affichage du jeu dans une iframe d'un autre site.
- Dépendances : aucune bibliothèque JavaScript. Les polices viennent de Google Fonts.
- Les mises à jour des actions GitHub sont suivies par Dependabot.

## Règles pour les contributeurs
- Ne jamais écrire de clé, de mot de passe ou d'adresse personnelle dans le dépôt.
- Les secrets (par exemple `ANTHROPIC_API_KEY`) vivent uniquement dans Settings > Secrets and variables > Actions.
- Toute Pull Request générée automatiquement se relit avant fusion.
