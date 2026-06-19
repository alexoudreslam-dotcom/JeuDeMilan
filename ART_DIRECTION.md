# Direction artistique - Buck Crew

## Intention

Le jeu doit rester en pixel art simple, lisible et faisable pour une V1 web/mobile.
On ne cherche pas une image concept trop ambitieuse. On cherche des sprites propres,
chauds, reconnaissables, et faciles a remplacer au fur et a mesure.

## References retenues

- Ambiance cozy / resto / jeu 2D chaleureux.
- Contours fonces, plutot brun tres sombre que noir pur.
- Couleurs chaudes et appetissantes : rouge, orange, creme, bois, vert.
- Food sprites plus detailles que le decor.
- UI et objets tres lisibles sur telephone.

## Style cible

- Pixel art 16-bit / 32-bit, plus premium que la V1 brute.
- Gros pixels visibles, pas de rendu flou.
- 2.5D leger : mur + sol visibles, objets de face avec un peu de volume.
- La scene reste lisible et codable : pas d'isometrique complexe.
- Ombrage simple : 2 ou 3 tons par objet suffisent.
- Personnages avec expressions vivantes, pas d'yeux noirs vides.
- Pas de vraie 3D, pas de WebGL obligatoire dans le hub.

## Niveau de detail par type d'asset

### Decor restaurant

Priorite : donner envie sans exploser la production.

- Mur du fond visible.
- Sol visible.
- Objets alignes dans une scene longue, façon decor de jeu mobile.
- Salle et cuisine dans la meme scene continue.
- Separation cuisine/salle par changement de couleur de sol/mur.

Les details decoratifs doivent rester secondaires.

### Objets interactifs

Priorite : comprendre en 1 seconde.

- Frigo.
- Poste composition.
- Jukebox.
- Table client.
- Caisse/comptoir.

Chaque objet doit avoir une silhouette claire et un petit etat interactif :

- normal,
- hover/tap,
- disponible,
- deja joue ou plus de tentative.

### Food sprites

Priorite : appetissant et reconnaissable.

Les aliments peuvent etre plus detailles que le decor :

- tenders croustillants,
- wings plus rouges/foncees,
- burger complet comme un item unique,
- frites classiques jaunes,
- frites patate douce oranges,
- dirty rice,
- coleslaw,
- sauces en ramequin.

Chaque food sprite doit exister en version separee pour le mini-jeu composition.

### Avatar

Priorite : personnalisation simple.

Pieces minimales :

- tete,
- cheveux,
- haut,
- bas,
- peau,
- quelques accessoires.

Les couleurs doivent accepter des choix classiques et des choix fun, par exemple
peau verte, cheveux roses, tenues tres colorees.

## Palette conseillee

- Contour : `#241612`
- Ombre chaude : `#5a3328`
- Creme : `#fff4d7`
- Rouge resto : `#d7422d`
- Rouge sombre : `#8e2118`
- Orange frit : `#e87827`
- Jaune frite : `#f7b64b`
- Vert liseres/validation : `#2c7a4b`
- Mur salle : `#f4c46d`
- Cuisine/inox simple : `#cbd6cf`

## A eviter

- Rendu trop 3D, NFT/Web3 ou trop concept art impossible a produire.
- Personnages aux yeux noirs sans expression.
- Trop de texte dans l'interface.
- Perspective compliquee.
- Decor plus detaille que les elements de jeu.
- Assets trop petits pour etre cliquables au doigt.
- Logos ou references de marques reelles.

## Assets prioritaires pour la prochaine iteration

1. Fond long 2D salle + cuisine continue.
2. Frigo simple cliquable.
3. Poste de composition cliquable.
4. Jukebox cliquable.
5. Table client cliquable.
6. Avatar base avec 4 ou 5 variations.
7. Food sprites de base pour le mini-jeu composition.
8. Icônes UI : score, essais, aide, classement, recompense.
