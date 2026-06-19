# Assets graphiques a produire

Cette liste est une checklist de production. Elle n'est pas destinee a etre affichee dans le jeu.

## UI / onboarding

- Logo titre `Poulet & Compagnie` ou nom final du jeu.
- Ecran accueil : devanture simple, enseigne, bouton commencer.
- Boutons pixel art : normal, pressed, disabled.
- Panels UI bruns : normal, titre, score, tuto.
- Icones HUD : score semaine, tentative, recompense, classement, retour, aide.
- Cartes tutoriel : lire, glisser, eviter, valider.

## Avatar

- Base personnage face/profil leger.
- Tetes et expressions : neutre, content, concentre.
- Cheveux : courts, casquette, frange, afro/simple volume.
- Couleurs cheveux.
- Couleurs peau, dont options fun comme vert.
- Hauts / tabliers / shorts / pantalons.
- Accessoires : casquette, lunettes, petit badge.
- Animations : idle 2 frames, tap/selection, victoire.

## Restaurant hub

- Fond long 2.5D leger : cuisine continue vers salle.
- Mur cuisine : carrelage clair.
- Mur salle : chaud, bois, poster.
- Sol cuisine : carrelage.
- Sol salle : bois.
- Separation visuelle cuisine/salle sans transition.
- Frigo cliquable : normal, highlighted, locked/no attempt.
- Poste composition : normal, highlighted.
- Jukebox : normal, highlighted, animation lumineuse.
- Comptoir/caisse.
- Table client + client assis.
- Bulles interaction : frigo, assiette, musique, client.

## Mini-jeu composition

- Assiette vide liseret vert.
- Ticket de commande.
- Timer pixel.
- Tenders.
- Wings.
- Burger complet, en un seul item.
- Frites classiques.
- Frites patate douce.
- Dirty rice.
- Coleslaw.
- Sauces : BBQ, chipotle mayo, carolina mustard, comeback, spread.
- Feedback : check vert, X rouge, combo, score pop.

## Mini-jeu frigo

- Grille frigo.
- Produits bons : bouteilles, sauces, poulet emballe, salade, citron, bac.
- Intrus propres/droles : fourchette, bouteille vin rouge, ticket caisse, pain burger, objet pas a sa place.
- Slots corrects.
- Feedback rangement.

## Mini-jeu commande

- Clients : 5 variations.
- Fiches client : vegan, allergies, kosher, sans gluten, spicy/no spicy.
- Cartes choix conseil.
- Expressions client : content, hesitant, pas content.

## Mini-jeu musique

- Jukebox plein ecran.
- Moods de salle : calme, fete, famille, presse, date.
- Boutons musique : chill, funk, rock, rap, soul.
- Feedback ambience : notes, clients contents, mauvais mood.

## Export conseille

- Sprites en PNG transparents.
- Multiples de 16 px ou 32 px.
- `image-rendering: pixelated`, donc pas d'antialias flou.
- Nommage : `area_object_state.png`, par exemple `hub_fridge_idle.png`.
