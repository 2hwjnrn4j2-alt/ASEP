# Générateur de barèmes

Application web en français pour créer un barème de notes d'école primaire. Elle fonctionne sans dépendance ni service externe ; les calculs restent dans le navigateur.

## Lancer l'application

Avec Node.js 18 ou plus récent :

```sh
npm start
```

Ouvrez ensuite [http://localhost:4173](http://localhost:4173). Le port peut être modifié avec la variable d'environnement `PORT`.

## Calcul des notes

Les points sont convertis en pourcentage du total, après déduction de la pénalité éventuelle. Sans seuil de réussite saisi, le pourcentage du seuil est déduit des notes minimale, de réussite et maximale. La note est interpolée linéairement entre la note minimale à 0 %, la note de réussite au seuil et la note maximale à 100 %. Pour l'échelle 1–6, avec 4 comme seuil à 60 %, cela équivaut à `1 + 5 × (pourcentage / 100)`. La note est arrondie selon la règle choisie et reste dans les bornes configurées.

Le tableau affiche les points obtenus par pas personnalisé ou, par défaut, par un pas automatique adapté au total. Le total est toujours affiché, même s'il ne correspond pas exactement au dernier pas.

## Tests

```sh
npm test
```
