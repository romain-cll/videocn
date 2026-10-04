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
### Approche
**Volume — tout en CSS.** Dans `volume-control.tsx`, le curseur passe dans un volet `overflow-hidden` dont seule la largeur s'anime (0 ↔ 96 px, ≤ 200 ms, `motion-reduce:transition-none`). Le volet s'ouvre sur `group-hover`, `group-has-focus-visible` et `group-has-data-dragging` (attribut déjà posé par `PlayerSlider`), et passe en `display:none` sous `(hover: none)`. Le curseur reste dans le DOM : atteignable par Tab même replié.

**Réglages — un nouveau fichier `settings-menu.tsx`** remplace les menus vitesse et qualité et réutilise `PlayerMenu` tel quel : popup `absolute` dans le conteneur, donc sans portail et vivant en plein écran, composition sans `asChild` ni `render`. La vue (racine / vitesses / qualités) est un état local au contenu du popup, remis à zéro à chaque ouverture. `player-menu.tsx` gagne trois choses : un item simple `menuitem`, l'arrêt de `←`/`→` (qui n'atteignent plus la keymap), et une hauteur bornée à la place mesurée dans le conteneur — seul JS ajouté, imposé par CA18 : le popup, ancré dans la barre, ne connaît pas la hauteur du lecteur en CSS. `ControlsOptions` ne change pas : `playbackRate` et `quality` décident des lignes.

### Fichiers impactés
- créé : `registry/videocn/settings-menu.tsx` — bouton Settings, popup à deux niveaux, listes vitesses et qualités (reprend `formatRate` et les règles de qualité)
- supprimé : `registry/videocn/playback-rate-menu.tsx` — absorbé par settings-menu (si décision 1 = A)
- supprimé : `registry/videocn/quality-menu.tsx` — idem
- modifié : `registry/videocn/player-menu.tsx` — exporte `PlayerMenuItem` et `focusInitialItem` ; `PlayerMenuPopup` arrête `←`/`→` ; `max-h-64` remplacé par une borne mesurée ; commentaire du trigger `sm` corrigé (aucun trigger ne porte plus de texte)
- modifié : `registry/videocn/video-cn.tsx` — `data-slot="video-player"` sur le conteneur (cible de la mesure)
- modifié : `registry/videocn/player-controls.tsx` — `<SettingsMenu />` entre `<ChapterMenu />` et `<PictureInPictureToggle />`, deux imports retirés
- modifié : `registry/videocn/volume-control.tsx` — conteneur `group/volume` sans `gap`, volet repliable autour du curseur
- modifié : `registry/videocn/player-slider.tsx` — commentaire seulement (« le menu de vitesse ferme… » → « les menus ferment… »)
- modifié : `registry.json` — `files[]` : deux entrées retirées, `settings-menu.tsx` ajouté (target `@ui/video-player/settings-menu.tsx`)
- modifié : `docs/mvp.md` — amendement daté ; Contrôles (tableau, note sur les menus, règle « le bouton affiche Auto » remplacée) ; Moteur vidéo (« le bouton reste affiché et passe disabled » → « la ligne Quality reste affichée, grisée »)
- modifié : `src/components/docs/controls-table.tsx` — descriptions de `volume`, `playbackRate`, `quality`
- modifié : `src/app/docs/page.tsx` — paragraphe « The quality menu… » de l'exemple Streaming
- modifié (si décision 4 = A) : `src/lib/demo-media.ts` (note MP4 « quality button »), `src/components/landing/one-tag-section.tsx` (« enables the quality menu »), `src/app/_og/og-image.tsx` (« 1× » et « Auto » dessinés dans la barre)

### Tâches (ordonnées)
1. `player-menu.tsx` (CA13, CA17, CA18) — exporter `PlayerMenuItem` (`role="menuitem"`, `tabIndex={-1}`, `data-disabled` + `disabled`, `ITEM_CLASSNAME`, `onSelect` sans fermeture) et `focusInitialItem` ; `preventDefault` + `stopPropagation` sur `←`/`→` dans `PlayerMenuPopup` ; borne de hauteur mesurée au montage (`useLayoutEffect` : haut du trigger − haut de `[data-slot="video-player"]` − marges) écrite par `style.setProperty` dans une variable CSS lue par `max-h-[min(16rem,var(…))]`, jamais en `style` JSX ; quatre exports existants intacts. `data-slot="video-player"` dans `video-cn.tsx`.
2. `settings-menu.tsx` (CA9–CA16) — `"use client"`, `memo`, sans prop ; `null` si `playbackRate` et `quality` sont tous deux désactivés. Trigger `PlayerMenuTrigger aria-label="Settings"` + `SettingsIcon` seul. Contenu à état `view` : racine = lignes `PlayerMenuItem` « Speed » + `formatRate(rate)` et « Quality » + « Auto (720p) » / « Auto » / hauteur choisie (valeur en `span dir="ltr"` `ml-auto text-muted-foreground`, `ChevronRightIcon` dans la place réservée par `pr-8`), Quality `disabled` si `qualities` est vide ; sous-vue = ligne de retour (`ChevronLeftIcon` + titre) puis `PlayerMenuRadioItem` qui appliquent et ferment. `onKeyDown` du panneau : `→` ouvre la sous-vue de la ligne focalisée, `←` revient à la racine, toujours arrêtés. Focus au changement de vue (`useLayoutEffect`, l'item focalisé vient d'être démonté) : item coché (sinon premier) en entrant, ligne d'origine en revenant. Chaque chaîne de classes sur une ligne (piège RTL).
3. `player-controls.tsx` — `<SettingsMenu />`, suppression des deux fichiers, `registry.json` `files[]` (CA9, CA20).
4. `volume-control.tsx` (disjoint de 1–3, parallélisable ; CA1–CA8, CA19) — racine `group/volume flex items-center` sans `gap` ; volet `w-0 overflow-hidden transition-[width] duration-200 motion-reduce:transition-none group-hover/volume:w-24 group-has-focus-visible/volume:w-24 group-has-data-dragging/volume:w-24 [@media(hover:none)]:hidden` ; le curseur prend la largeur du volet avec `mx-2.5` (pastille + anneau = 10 px, que l'`overflow-hidden` couperait) au lieu du `w-20` fixe. Un `overflow-hidden` a une largeur minimale nulle en flex : le volet se comprime au lieu de faire déborder la barre.
5. Commentaire de `player-slider.tsx`.
6. Amendement de `docs/mvp.md` (date du jour, Contrôles + paragraphe du moteur natif).
7. Textes du site en anglais (controls-table, docs/page, + les trois autres selon décision 4) (CA21).
8. `pnpm lint`, `pnpm build && pnpm typecheck`, vérification que les classes arbitraires sont générées (CLI Tailwind dans un dossier jetable).
9. Commit, puis vérification navigateur scriptée ; sondes après le commit (CA1–CA21).
10. Installation croisée base + radix avec passe RTL ; CA6, CA7, CA17 confirmés à la main par Romain.

### Stratégie de test
- CA1 → e2e navigateur — souris hors zone : volet à largeur 0, horodatage collé au bouton muet (seuls `gap-1` + `mx-2` d'écart).
- CA2 → e2e navigateur (`hover`) — volet à 96 px après 250 ms, `transition-duration` ≤ 0,2 s, `left` de l'icône inchangé, horodatage décalé. Fluidité : à la main.
- CA3 → e2e navigateur — survol icône puis curseur : pas de repli ; `hover` à l'extérieur : largeur 0 après 250 ms.
- CA4 → e2e navigateur — `pointerdown` de synthèse (`pointerId: 1`) sur le curseur, `hover` hors zone : volet ouvert tant que `data-dragging` est présent, replié après `pointerup`.
- CA5 → e2e navigateur (`press_key Tab`) — volet ouvert sur le muet et sur le curseur ; `↑` sur le curseur : `video.volume` +0,05, une seule fois.
- CA6 → manuel (« Réduire les animations » de macOS) ; en navigateur, seulement la présence de la règle `prefers-reduced-motion` sur le volet.
- CA7 → manuel sur un vrai téléphone ; en navigateur, seulement la règle `@media (hover: none)`.
- CA8 → e2e navigateur — clic sur l'icône bascule `video.muted` ; playground, interrupteur `volume` éteint : icône et curseur absents.
- CA9 → e2e navigateur (snapshot a11y) — plus de « Playback speed… » ni « Quality… », un bouton `Settings` entre `Chapters` et PiP.
- CA10 → e2e navigateur — MP4 : « Speed 1× », « Quality Auto » ; HLS mux : « Auto (720p) » selon le niveau joué ; popup descendant du conteneur.
- CA11 → e2e navigateur — 7 vitesses, `1×` coché ; choisir `1.5×` met `playbackRate` à 1,5 et démonte le popup. Idem Quality en HLS.
- CA12 → e2e navigateur — la ligne de retour réaffiche la racine.
- CA13 → e2e navigateur (`press_key`) — séquence ↑ ↓ Entrée → ← Échap : focus revenu sur Settings, `currentTime` et `volume` inchangés.
- CA14 → e2e navigateur — MP4 : ligne Quality `disabled`, sautée par ↓, affiche « Auto ».
- CA15 → e2e navigateur — playground : `playbackRate` éteint, `quality` éteint, les deux éteints, preset `[1, 1.5, 2]`.
- CA16 → e2e navigateur — popup ouvert en lecture : pas de `data-hidden` après 4 s ; `pointerdown` sur la vidéo le ferme.
- CA17 → e2e navigateur (`click`, vrai geste) — popup visible dans `document.fullscreenElement`. Plein écran système : à la main (le Chrome piloté ne passe pas la fenêtre en plein écran).
- CA18 → e2e navigateur — conteneur forcé à 360 px (≈ 202 px de haut) : popup contenu, `scrollHeight > clientHeight`, `2×` atteint en défilant.
- CA19 → e2e navigateur — même gabarit, BBB avec chapitres, sans `controls` : chaque contrôle contenu dans la barre, `scrollWidth ≤ clientWidth`, marge restante notée.
- CA20 → e2e navigateur — menu Chapters : ouverture sur l'item coché, saut.
- CA21 → `curl -s localhost:3000/docs | grep -Ei "speed menu|quality menu"` vide, puis relecture des nouveaux textes.
- Commandes : le dépôt n'a aucun runner de tests (pas de script `test`). Barrières : `pnpm lint`, `pnpm build && pnpm typecheck`. Vérification : `pnpm dev`, `/playground` et `/docs` via `chrome-devtools`. Banc : `pnpm registry:build && pnpm dlx serve public -p 4000 --cors`, puis dans `~/projects/videocn-test-base` et `~/projects/videocn-test-radix` : `npx shadcn@latest add @videocn/player -y -o`, `npx tsc --noEmit && npx next build`, `npx next dev -p 3001` (ou `3002`).
- Vérifiable à la main seulement : CA6, CA7, CA17 (plein écran système), fluidité de CA2, rendu des installations base/radix, passe RTL.

### Décisions à valider
1. **Un seul fichier pour vitesse et qualité ?** A : `settings-menu.tsx` unique, les deux anciens supprimés. B : garder `playback-rate-menu.tsx` et `quality-menu.tsx` comme sous-listes composées par settings-menu. **Reco A** : la navigation et les libellés de la racine ont besoin des mêmes données que les sous-listes ; B fait importer les deux autres à chaque fichier pour une soixantaine de lignes.
2. **[Ambiguïté] Settings sans aucune ligne activable** (`playbackRate: false` sur moteur natif → seule Quality, grisée) : A : trigger `disabled`. B : popup ouvert sur une ligne grisée. **Reco A** : équivalent exact de l'ancien bouton qualité grisé, pas de clic qui ne mène à rien.
3. **[Ambiguïté, CA20 vs CA13/CA18] Les deux correctifs de `PlayerMenuPopup` (arrêt de `←`/`→`, hauteur bornée) profitent-ils aussi au menu des chapitres ?** Aujourd'hui `←`/`→` y font avancer la vidéo et sa liste est coupée à 202 px. A : partagés par tous les menus. B : réservés à Settings via une prop. **Reco A** : le commentaire de `PlayerMenuPopup` montre que les flèches devaient déjà être arrêtées ; B ajoute une prop qui ne sert qu'à garder deux défauts.
4. **[Ambiguïté, périmètre de CA21] Textes du site hors `/docs` devenus faux** (note MP4 du playground, cas « Streaming » de la landing, OG avec « 1× » et « Auto » dessinés) : A : corrigés ici. B : `/docs` seulement. **Reco A** : trois chaînes et une icône ; sinon le site affirme un « quality button » disparu. Le changelog n'est pas touché (historique).
5. **Runner de tests ?** A : aucun, vérification navigateur scriptée. B : Vitest + Testing Library + jsdom (nouvelles devDependencies). **Reco A** : le dépôt n'a aucun test, et la moitié des CA dépend du rendu CSS (`:hover`, `@media`, largeurs, plein écran), que jsdom ne calcule pas.

### Risques
- Fichiers orphelins chez qui réinstalle : `playback-rate-menu.tsx` et `quality-menu.tsx` restent dans son dossier ; ils compilent tant que `player-menu.tsx` garde ses quatre exports — ne pas les renommer ni les retirer.
- CA19 tient de justesse : ~10–15 px de marge à 360 px au pire (`59:59 / 59:59`), dépendante de la police de l'hôte. Mesurer la marge, pas seulement « ça rentre ».
- À 360 px, le curseur déplié se comprime (~50 px) au lieu de faire déborder la barre : voulu, à vérifier à l'œil.
- `PlayerSlider` mesure la piste une fois par geste : un appui pendant les 200 ms du dépliement mesure une piste encore étroite, geste décalé.
- Chrome rend le focus visible à la première touche frappée : après un clic sur le muet, une touche déplie le curseur jusqu'à ce que le focus parte.
- Le `display:none` sous `(hover: none)` retire aussi le curseur de l'accessibilité et de la tabulation (TalkBack, iPad avec clavier sans trackpad). Conséquence directe de CA7.
- Hauteur du popup mesurée à l'ouverture seulement : un redimensionnement pendant qu'il est ouvert n'est pas suivi.
- En RTL, les chevrons lucide ne se retournent pas et CA13 n'inverse pas `→`/`←`. Proposition : `rtl:rotate-180` sur les chevrons, à juger lors de la passe RTL.
- La taille de bundle affichée dans `/docs` (14 kB gzip) peut bouger légèrement ; pas de remesure exigée.

## Décisions
- 2026-10-04 — Le curseur de volume se déplie à droite de l'icône, comme YouTube (validée par Romain)
- 2026-10-04 — Popup de réglages à deux niveaux, comme YouTube (validée par Romain)
- 2026-10-04 — Le menu des chapitres reste un bouton dans la barre (validée par Romain)
- 2026-10-04 — La barre tronquée n'est pas corrigée isolément : la refonte la remplace (validée par Romain)
- 2026-10-05 — Décision 1 = A : un seul `settings-menu.tsx`, `playback-rate-menu.tsx` et `quality-menu.tsx` supprimés (validée par Romain)
- 2026-10-05 — Décision 2 = A : bouton Settings `disabled` quand aucune ligne n'est activable (validée par Romain)
- 2026-10-05 — Décision 3 = A : arrêt de `←`/`→` et hauteur bornée partagés par tous les menus, chapitres compris (validée par Romain)
- 2026-10-05 — Décision 4 = A : les textes du site hors `/docs` devenus faux sont corrigés ici (playground, landing, OG) (validée par Romain)
- 2026-10-05 — Décision 5 : pas de runner de tests ni de phase rouge. Le dev implémente en autonomie et vérifie lui-même chaque CA dans le navigateur ; la review se fait contre la spec (validée par Romain)
