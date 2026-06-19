# Stack technique

## Base app

### Next.js

Next est la base de l'application : routing, build production, optimisation,
font loading et futur backend via route handlers ou fonctions serverless.

Usage actuel :

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/components/GamePrototype.tsx`

Reference : https://nextjs.org/docs/app/getting-started/installation

## Animation UI

### Motion

Motion gere les transitions d'ecrans, les boutons, les micro-interactions et
les feedbacks de jeu comme pulse, tap, score pop, modal, etc.

Usage actuel :

- `AnimatePresence`
- `motion.section`
- `motion.button`
- `motion.span`

Reference : https://motion.dev/docs/react-quick-start

## Gestes tactiles

### @use-gesture/react

Le joystick est branche sur `useDrag`. C'est plus propre qu'un traitement
manuel des events pointer et ca preparera les gestes des mini-jeux :

- drag food item vers assiette,
- drag objets dans le frigo,
- swipe / hold sur certains controles.

Reference : https://use-gesture.netlify.app/docs/

## Mini-jeux canvas a venir

### Phaser

Phaser est le meilleur candidat si les mini-jeux deviennent de vrais jeux 2D :
scenes, sprites, collisions, input mobile, timers, tweening, states.

Bon pour :

- mini-jeu frigo drag-and-drop,
- mini-jeu composition,
- timers,
- scoring arcade,
- animations spritesheet.

Reference : https://docs.phaser.io/phaser/getting-started/what-is-phaser

### PixiJS

Pixi est plus bas niveau que Phaser, mais excellent pour rendu 2D WebGL rapide.
A choisir si on veut garder toute la logique maison et utiliser Pixi seulement
comme renderer performant.

Reference : https://pixijs.com/8.x/guides

## Backend / classement

### Supabase

Probable meilleur choix pour la V1 publique :

- table players,
- table weekly_scores,
- tentatives quotidiennes,
- leaderboard,
- reward code,
- auth anonyme ou magic link plus tard.

Reference : https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

## Police pixel

### Press Start 2P

Chargee via `next/font/google` dans `src/app/layout.tsx`.

Reference : https://fonts.google.com/specimen/Press+Start+2P

## Pourquoi pas Web3 pour l'instant

Si par "Web3" on parle blockchain/NFT, ce n'est pas utile pour cette V1.
Si on parle plutot de rendu web moderne / 2.5D, alors la bonne direction est :

- React + Motion pour UI,
- CSS pixel art pour prototype,
- Phaser/PixiJS pour mini-jeux,
- assets PNG pixel art pour production.

