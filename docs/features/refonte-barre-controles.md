# Refonte de la barre de contrôles

## User story
En tant qu'intégrateur qui pose `<VideoCn>` sur sa page, je veux une barre de contrôles épurée à la
manière de YouTube (volume replié derrière son icône, vitesse et qualité rangées dans un popup de
réglages), afin que la barre reste lisible et tienne entière dans un lecteur étroit.

## Critères d'acceptation

### Volume

- [ ] CA1 — Étant donné un appareil à souris, quand le pointeur n'est ni sur l'icône du son ni sur
  le curseur de volume et que le focus clavier n'y est pas, alors seule l'icône du son est visible,
  le curseur n'occupe aucune largeur et l'horodatage suit directement l'icône.
- [ ] CA2 — Étant donné le curseur replié, quand le pointeur survole l'icône du son, alors le
  curseur se déplie **à droite** de l'icône par une transition CSS de largeur d'au plus 200 ms ;
  l'icône ne bouge pas et l'horodatage glisse vers la droite.
- [ ] CA3 — Étant donné le curseur déplié, quand le pointeur quitte la zone formée par l'icône et
  le curseur, alors le curseur se replie avec la même transition. Passer de l'icône au curseur ne
  le replie pas.
- [ ] CA4 — Étant donné un glissement en cours sur le curseur de volume, quand le pointeur sort de
  la zone sans relâcher, alors le curseur reste déplié jusqu'au relâchement.
- [ ] CA5 — Étant donné une navigation au clavier, quand le focus arrive par `Tab` sur le bouton
  muet ou sur le curseur, alors le curseur est déplié. Le curseur reste atteignable par `Tab` même
  replié, et ses flèches fonctionnent comme aujourd'hui.
- [ ] CA6 — Étant donné `prefers-reduced-motion: reduce`, quand le curseur se déplie ou se replie,
  alors le changement est instantané, sans transition.
- [ ] CA7 — Étant donné un appareil sans survol (`(hover: none)`, tactile), alors le curseur de
  volume ne s'affiche jamais et toucher l'icône bascule le muet.
- [ ] CA8 — Étant donné n'importe quel appareil, quand on clique sur l'icône du son, alors le muet
  bascule comme aujourd'hui ; et `controls={{ volume: false }}` retire l'icône et le curseur.

### Popup de réglages

- [ ] CA9 — Étant donné un lecteur sans prop `controls`, alors la barre ne contient plus de bouton
  vitesse ni de bouton qualité, mais un bouton à icône de roue dentée, `aria-label="Settings"`,
  placé entre le bouton des chapitres et le bouton Picture-in-Picture.
- [ ] CA10 — Étant donné le bouton Settings, quand on l'active, alors un popup s'ouvre vers le haut,
  rendu dans le conteneur du lecteur, et montre deux lignes, chacune suivie d'un chevron :
  « Speed » avec la vitesse courante (`1×`), et « Quality » avec la qualité courante (`Auto (720p)`
  en automatique sur un flux adaptatif, la hauteur choisie sinon).
- [ ] CA11 — Étant donné le popup au premier niveau, quand on active la ligne « Speed », alors le
  popup affiche à la place la liste des vitesses, celle en cours cochée, sous une ligne de retour
  « Speed ». Choisir une vitesse l'applique et ferme le popup. Même chose pour « Quality » avec la
  liste des qualités et ses règles actuelles (« Auto (720p) », une entrée par hauteur, `1080p60`).
- [ ] CA12 — Étant donné une sous-liste ouverte, quand on active la ligne de retour, alors le popup
  revient au premier niveau.
- [ ] CA13 — Étant donné le popup ouvert au clavier, alors `↑`/`↓` parcourent les lignes, `Entrée`
  ou `→` ouvre une sous-liste, `←` revient au premier niveau, `Échap` ferme le popup et rend le
  focus au bouton Settings. Aucune de ces touches ne déclenche la keymap du lecteur pendant que le
  popup a le focus.
- [ ] CA14 — Étant donné le moteur natif (aucune qualité exposée), quand le popup est ouvert, alors
  la ligne « Quality » est visible, grisée, non activable, et affiche « Auto ».
- [ ] CA15 — Étant donné `controls={{ playbackRate: false }}`, alors la ligne « Speed » disparaît ;
  `controls={{ quality: false }}`, la ligne « Quality » disparaît ; les deux à la fois, le bouton
  Settings disparaît. `controls={{ playbackRate: { rates: [...] } }}` règle la liste des vitesses
  comme aujourd'hui.
- [ ] CA16 — Étant donné le popup ouvert, alors la barre ne se masque pas ; un clic hors du popup
  le ferme.
- [ ] CA17 — Étant donné le lecteur en plein écran, quand on ouvre le popup, alors il s'affiche et
  fonctionne comme hors plein écran.
- [ ] CA18 — Étant donné un lecteur de 360 × 202 px, quand on ouvre la liste des vitesses par
  défaut (7 entrées), alors le popup tient entièrement dans le lecteur et sa liste défile si elle
  dépasse.

### Barre et site

- [ ] CA19 — Étant donné un lecteur de 360 px de large, une vidéo de moins d'une heure avec des
  chapitres, et aucune prop `controls`, alors tous les contrôles de la barre sont entièrement
  visibles, aucun n'est coupé ni ne déborde du lecteur.
- [ ] CA20 — Étant donné une vidéo avec chapitres, alors le bouton des chapitres reste dans la
  barre, avec son comportement actuel.
- [ ] CA21 — Étant donné la page `/docs` du site, alors aucun texte ne parle plus d'un « speed
  menu » ou d'un « quality menu » distinct : vitesse et qualité y sont décrites comme des entrées
  du menu de réglages, et le volume comme un curseur qui se déplie au survol. Textes en anglais.

## Hors scope
- Sous-titres dans le popup : la phase 6 décidera de leur place.
- Chapitres dans le popup (écarté le 04/10/2026).
- Masquer des contrôles en dessous de 360 px de large.
- Toute nouvelle prop ou clé de `controls` (ordre des boutons, comportement du volume…) : à noter
  dans la liste des props de la phase 7 si le besoin apparaît.
- Bulle affichant le pourcentage de volume.
- Animation de fermeture du popup (déjà écartée pour les menus actuels).
- Modification des raccourcis clavier existants.
- Entrée dans le changelog du site.
- Correctif isolé de la barre tronquée à ~356 px : remplacé par cette refonte (CA19).

## Contraintes
- Règles de `registry/README.md` : aucun import de framework, `"use client"`, ni `asChild` ni
  `render`, tokens sémantiques uniquement, un fichier = une responsabilité. Tout nouveau fichier
  rejoint le `files[]` de l'item unique `player`, jamais un nouvel item.
- Le popup est rendu **dans** le conteneur du lecteur, sans portail vers `document.body`, comme
  les menus actuels (raison : le plein écran).
- L'apparition du volume est faite en CSS, sans JavaScript d'animation.
- L'API `ControlsOptions` ne change pas : aucune clé renommée, ajoutée ni retirée.
- Les règles de `docs/mvp.md` (section Contrôles) sur la qualité restent vraies : grisée plutôt que
  masquée, « Auto (720p) », une entrée par hauteur, choix appliqué tout de suite.
- `docs/mvp.md` est amendé, daté du jour, pour décrire la nouvelle barre (section Contrôles).
- `pnpm lint` passe. Installation croisée vérifiée en `radix` et en `base`.
- Site en anglais ; commentaires du code en français.

## Plan technique
<à remplir par l'architect>

## Décisions
- 2026-10-04 — Le curseur de volume se déplie à droite de l'icône, comme YouTube (validée par Romain)
- 2026-10-04 — Popup de réglages à deux niveaux, comme YouTube (validée par Romain)
- 2026-10-04 — Le menu des chapitres reste un bouton dans la barre (validée par Romain)
- 2026-10-04 — La barre tronquée n'est pas corrigée isolément : la refonte la remplace (validée par Romain)
