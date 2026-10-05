# Sous-titres

## User story
En tant qu'intégrateur qui pose `<VideoCn>` sur sa page, je veux fournir les fichiers WebVTT de
sous-titres de ma vidéo, afin que mes spectateurs puissent activer les sous-titres et choisir leur
langue depuis le lecteur, comme sur YouTube.

## Critères d'acceptation

Dans ces critères, « la prop de sous-titres » désigne la nouvelle prop racine de `<VideoCn>` qui
liste les pistes. Chaque piste y porte au moins l'URL d'un fichier WebVTT, un code de langue, un
libellé, et peut être marquée « par défaut ». Le nom et la forme exacts sont proposés par
l'architect et validés par Romain au plan.

### Fournir les pistes

- [ ] CA1 — Étant donné un `<VideoCn>` sans prop de sous-titres, ou avec une liste vide, alors la
  barre n'a pas de bouton CC, le menu Settings n'a pas de ligne « Subtitles », et `c` ne fait rien.
- [ ] CA2 — Étant donné la prop de sous-titres avec deux pistes dont aucune n'est marquée par
  défaut, quand le lecteur est monté, alors les sous-titres sont coupés et aucun texte ne s'affiche
  sur l'image.
- [ ] CA3 — Étant donné une piste marquée par défaut, quand le lecteur est monté et la lecture
  lancée, alors cette piste est active et ses sous-titres s'affichent. Si plusieurs pistes sont
  marquées par défaut, seule la première de la liste est active.
- [ ] CA4 — Étant donné la même prop de sous-titres passée successivement à une source MP4 (moteur
  natif), HLS et DASH (Shaka), alors le bouton CC, la ligne « Subtitles » et l'affichage se
  comportent à l'identique. Des sous-titres contenus dans le manifeste HLS ou DASH ne sont jamais
  proposés.
- [ ] CA5 — Étant donné un lecteur monté, quand la prop de sous-titres change, alors le bouton, le
  menu et l'affichage suivent la nouvelle liste. La piste active reste active si son URL figure
  encore dans la liste ; sinon les sous-titres sont coupés.
- [ ] CA6 — Étant donné plusieurs pistes, alors au plus une piste est affichée à la fois.

### Bouton CC

- [ ] CA7 — Étant donné une vidéo avec au moins une piste et aucune prop `controls`, alors la barre
  contient un bouton CC à icône, placé entre le bouton des chapitres (ou, sans chapitres, le début
  du groupe de droite) et le bouton Settings. Son nom accessible est « Subtitles », il annonce s'il
  est activé ou non aux lecteurs d'écran, et porte `aria-keyshortcuts="c"` quand les raccourcis sont
  actifs.
- [ ] CA8 — Étant donné les sous-titres coupés, quand on active le bouton CC, alors s'active la
  dernière piste choisie depuis le montage du lecteur ; à défaut, la piste marquée par défaut ; à
  défaut, la première de la liste.
- [ ] CA9 — Étant donné les sous-titres actifs, quand on active le bouton CC, alors ils sont coupés
  et le texte affiché disparaît.
- [ ] CA10 — Étant donné le bouton CC, alors son état activé et son état coupé se distinguent à
  l'œil (rendu calculé différent entre les deux états), sans couleur en dur.

### Ligne « Subtitles » du menu de réglages

- [ ] CA11 — Étant donné une vidéo avec au moins une piste, quand on ouvre le menu Settings, alors
  sa première ligne est « Subtitles », suivie de la valeur courante — « Off », ou le libellé de la
  piste active — et d'un chevron, au-dessus de « Speed » et « Quality ».
- [ ] CA12 — Étant donné le menu au premier niveau, quand on active la ligne « Subtitles », alors le
  popup affiche, sous une ligne de retour « Subtitles », l'entrée « Off » puis une entrée par piste
  dans l'ordre de la prop, l'état courant coché. Choisir une entrée l'applique et ferme le popup ;
  le bouton CC reflète aussitôt le nouvel état.
- [ ] CA13 — Étant donné le popup ouvert au clavier, alors la ligne « Subtitles » et sa sous-liste
  suivent les mêmes touches que « Speed » et « Quality » : `↑`/`↓`, `Entrée` ou `→` pour ouvrir
  (`←` en RTL), `←` pour revenir (`→` en RTL), `Échap` pour fermer et rendre le focus au bouton
  Settings.
- [ ] CA14 — Étant donné `controls={{ playbackRate: false, quality: false }}` et une vidéo avec au
  moins une piste, alors le bouton Settings reste dans la barre avec la seule ligne « Subtitles ».
  Sans aucune piste, avec ces mêmes `controls`, il disparaît comme aujourd'hui.

### Réglage par `controls`

- [ ] CA15 — Étant donné `controls={{ subtitles: false }}` et une vidéo avec des pistes, alors le
  bouton CC, la ligne « Subtitles » et le raccourci `c` disparaissent. Une piste marquée par défaut
  s'affiche quand même : `controls` règle ce que montre la barre, pas le contenu.

### Affichage

- [ ] CA16 — Étant donné une piste active et la barre masquée, quand la lecture atteint le temps
  d'un sous-titre, alors son texte s'affiche centré en bas de l'image, et disparaît à son temps de
  fin.
- [ ] CA17 — Étant donné une piste active et la barre visible, alors aucun sous-titre n'est
  recouvert par la barre, scrubber compris : le bas du texte reste au-dessus du haut de la barre.
  Quand la barre se masque, le texte revient en bas de l'image.
- [ ] CA18 — Étant donné le lecteur en plein écran, alors les sous-titres s'affichent et suivent
  CA16 et CA17 comme hors plein écran.
- [ ] CA19 — Étant donné un sous-titre affiché, alors chaque ligne de texte est posée sur un fond
  opaque ou semi-opaque qui la sépare de l'image, couleurs du texte et du fond tirées des tokens du
  thème, aucune couleur en dur.
- [ ] CA20 — Étant donné un iPhone et une piste active, quand on passe en plein écran (plein écran
  natif du système), alors les sous-titres de cette piste restent affichés.

### Clavier

- [ ] CA21 — Étant donné une vidéo avec des pistes et le focus dans le lecteur, quand on presse `c`,
  alors l'effet est celui d'un clic sur le bouton CC (CA8, CA9) et la barre apparaît. Comme les
  autres bascules : sans effet avec Ctrl, Cmd ou Alt, pas de répétition si la touche reste
  enfoncée, inactif dans un `input`, un `textarea` ou un `contenteditable` de la page hôte, et coupé
  par `controls={{ keyboard: false }}`.

### Largeur

- [ ] CA22 — Étant donné un lecteur de 360 px de large, une vidéo de moins d'une heure avec
  chapitres et sous-titres, et aucune prop `controls`, alors tous les contrôles de la barre sont
  entièrement visibles, volume replié comme déplié, et aucun ne déborde du lecteur.
- [ ] CA23 — Étant donné une vidéo sans sous-titres, alors les critères CA19 et CA22 de la refonte
  de la barre (`docs/features/refonte-barre-controles.md`) restent vrais à 360 px.

### Site et documentation

- [ ] CA24 — Étant donné la page `/docs`, alors elle documente la prop de sous-titres (champs de
  chaque piste), la clé `controls.subtitles`, le raccourci `c` dans le tableau des raccourcis, et
  montre un exemple jouable : Sintel avec ses sous-titres officiels en anglais et en français,
  fichiers `.vtt` servis par le site. Textes en anglais.
- [ ] CA25 — Étant donné `docs/mvp.md`, alors un amendement daté du jour décrit le bouton CC, la
  ligne « Subtitles », la prop et le raccourci `c` (tableau des raccourcis compris), et indique que
  la taille et la position font l'objet de la feature suivante.

## Hors scope
- Réglage de la taille et de la position des sous-titres : feature suivante (décision du
  05/10/2026).
- Chapitres chargés depuis un fichier `.vtt` : feature séparée, juste après (décision du
  05/10/2026).
- Sous-titres intégrés aux manifestes HLS ou DASH : la gestion texte de Shaka reste désactivée.
- Formats autres que WebVTT (SRT, TTML…) ; génération automatique de sous-titres.
- Mémoriser le choix de piste d'une page ou d'une visite à l'autre.
- Choisir la piste selon la langue du navigateur.
- Libellé ou code de langue affiché dans le bouton CC.
- Respect garanti des réglages de position inscrits dans le fichier (`line`, `position`, `align`)
  et des styles du fichier (balises de couleur, `::cue`).
- Sous-titres en Picture-in-Picture (dépend du navigateur).
- Comportement garanti sur un flux en direct.
- Signaler un fichier introuvable ou invalide.
- Masquer des contrôles en dessous de 360 px de large.
- Entrée dans le changelog du site.

## Contraintes
- Règles de `registry/README.md` : aucun import de framework, `"use client"`, ni `asChild` ni
  `render`, tokens sémantiques uniquement, un fichier = une responsabilité. Tout nouveau fichier
  rejoint le `files[]` de l'item unique `player`, jamais un nouvel item.
- Sous-titres par `<track>` et l'API `TextTrack`, identiquement pour les deux moteurs ; Shaka garde
  `manifest.disableText` (règle de `docs/mvp.md`, section Moteur vidéo).
- `<VideoCn>` n'accepte toujours pas de `children` : le lecteur rend les `<track>` depuis la prop.
- La sous-liste « Subtitles » vit dans le menu de réglages existant (`settings-menu.tsx`), rendu
  dans le conteneur du lecteur, sans portail.
- Ajouts d'API limités à la prop de sous-titres et à la clé `controls.subtitles`, qui suit la règle
  « `boolean | objet d'options` » de `controls-options.ts`. Tout autre besoin de prop va dans la
  liste de la phase 7.
- Le raccourci `c` suit le contrat de la keymap (`docs/mvp.md`, Raccourcis clavier).
- Fichiers `.vtt` de démonstration hébergés par le site, tirés des sous-titres officiels de Sintel
  (Blender Foundation) ; licence vérifiée et attribution donnée si elle l'exige.
- `docs/mvp.md` amendé, daté du jour.
- `pnpm lint` passe. Installation croisée vérifiée en `radix` et en `base`, avec passe RTL.
- Site en anglais ; commentaires du code en français.

## Plan technique
_À rédiger par l'architect._

## Décisions
- 2026-10-05 — Un bouton CC dans la barre active ou coupe les sous-titres ; une ligne « Subtitles » du menu de réglages choisit la piste (validée par Romain)
- 2026-10-05 — Taille et position des sous-titres reportées à la feature suivante (validée par Romain)
- 2026-10-05 — Chapitres depuis un fichier `.vtt` : feature séparée (validée par Romain)
- 2026-10-05 — Raccourci `c` ajouté à la keymap (validée par Romain)
- 2026-10-05 — Démo dans `/docs` avec Sintel et ses sous-titres officiels anglais et français (validée par Romain)
- 2026-10-05 — Avec `controls={{ subtitles: false }}`, une piste marquée par défaut s'affiche quand même : `controls` règle la barre, pas le contenu (CA15) (validée par Romain)
- 2026-10-05 — Pas de runner de tests ni de phase rouge, comme pour la refonte : le dev implémente et vérifie lui-même chaque CA dans le navigateur ; la review se fait contre la spec (validée par Romain)
- 2026-10-05 — Spec validée, DoR atteinte (validée par Romain)
