# ASEP — Espace enseignant

Application web en français qui rassemble des outils simples pour les enseignantes et enseignants. Elle fonctionne sans dépendance de production ; les calculs du barème restent dans le navigateur.

## Démarrer le projet

Prérequis : Node.js 18 ou une version plus récente.

```sh
npm start
```

Ouvrez ensuite [http://localhost:4173](http://localhost:4173). Le port peut être modifié avec la variable d’environnement `PORT`.

## Lancer les tests

```sh
npm test
```

## Organisation du code

```text
.
├── index.html                 # Structure et contenu des vues
├── src/
│   ├── main.js                # Point d’entrée et initialisation
│   ├── features/
│   │   ├── grading/           # Calcul métier et interface du barème
│   │   └── navigation/        # Navigation entre les vues et recherche
│   └── styles/                # CSS commun, composants, pages et adaptations
├── server/
│   └── server.js              # Serveur HTTP de développement
├── tests/                     # Tests automatisés
└── package.json               # Scripts et métadonnées du projet
```

### Ajouter une fonctionnalité

1. Créez un dossier dans `src/features/` avec le nom de la fonctionnalité.
2. Gardez sa logique et son interface dans des modules dédiés à ce dossier.
3. Ajoutez sa vue dans `index.html`, puis son style dans `src/styles/features.css` ou dans une nouvelle feuille importée par `src/styles/main.css`.
4. Initialisez la fonctionnalité depuis `src/main.js` et ajoutez ses tests dans `tests/`.

Les anciens fichiers JavaScript/CSS à la racine sont conservés comme points de compatibilité. Les nouvelles modifications doivent se faire dans `src/` ou `server/`.

## Calcul des notes

Les points obtenus sont convertis en pourcentage du total. La note progresse par interpolation linéaire entre la note minimale (0 %), la note de réussite (seuil défini ou déduit) et la note maximale (100 %). Le résultat peut être arrondi selon le réglage sélectionné. Le tableau affiche les points avec un intervalle choisi ou calculé automatiquement et inclut toujours le total exact.
