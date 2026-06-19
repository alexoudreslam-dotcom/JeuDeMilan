# Buck Crew

Prototype Next/React du mini-jeu hebdomadaire pour restaurant.

## Lancer le projet

```bash
npm install
npm run dev
```

Build production :

```bash
npm run build
npm run start
```

Dans l'environnement Codex actuel, `node` est disponible mais `npm` ne l'est pas.
Le projet est donc prepare pour Next, mais le build devra etre lance sur une
machine avec `npm`.

## Stack choisie

- **Next.js App Router** : base app moderne, build production propre.
- **React 19** : composants UI et etats du prototype.
- **Motion** : transitions d'ecrans et micro-interactions.
- **@use-gesture/react** : joystick et futures interactions tactiles.
- **lucide-react** : icones utilitaires temporaires.
- **next/font/google + Press Start 2P** : police pixel self-hosted au build.

## Ce qui est deja prototypé

- Accueil pixel art.
- Choix du pseudo.
- Regles rapides.
- Creation d'avatar.
- Hub restaurant 2.5D leger : cuisine et salle dans une scene continue.
- HUD score/semaine/tentatives.
- Route map du restaurant.
- Joystick tactile anime.
- Bouton action.
- Tap direct sur les objets interactifs.
- Ecran de tuto la premiere fois qu'un mini-jeu est lance.
- Ecran score / classement apres un mini-jeu.

## Fichiers importants

- `src/app/page.tsx` : entree de l'app.
- `src/components/GamePrototype.tsx` : prototype complet.
- `src/app/globals.css` : DA, faux sprites CSS, layout mobile.
- `docs/assets.md` : liste de production des assets graphiques.
- `docs/tech-stack.md` : ressources techniques et choix de frameworks.
- `ART_DIRECTION.md` : direction artistique.

## Backend a ajouter ensuite

Pour une vraie version publique :

- Auth legere ou pseudo + device id.
- Base de donnees joueurs.
- Scores par semaine.
- Tentatives quotidiennes.
- Anti-triche minimal cote serveur.
- Reset / verrouillage classement samedi.
- Code ou QR reward pour le gagnant.

Options probables :

- Supabase pour aller vite : auth anonyme, tables, fonctions SQL.
- Netlify/Vercel Functions si on garde une API serverless simple.
- Prisma + Postgres si on veut une structure plus robuste.

## Assets

La liste de production est dans `docs/assets.md`. Elle n'est pas affichee
dans le jeu : c'est une checklist pour produire/remplacer les faux sprites CSS.
