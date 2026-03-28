# ALLOCATION-01 — Allocation automatique terrain / créneau / arbitre

**Domaine** : Administration / Préparation
**Rôle(s)** : Organisateur, Super Admin
**Priorité** : Must Have
**Statut** : Validé

---

## Contexte

Une fois les matchs générés (TOURNOI-02), le système propose une allocation complète pour chaque match : un terrain, un créneau et une équipe arbitre. Cette allocation est une suggestion modifiable. L'organisateur peut ajuster manuellement n'importe quel match après le calcul.

L'algorithme travaille sur l'ensemble des sous-tournois simultanément, les ressources (terrains, créneaux) étant partagées.

---

## Ce que l'allocation produit

Pour chaque match non encore joué :

| Donnée allouée | Description |
|----------------|-------------|
| **Terrain** | Un terrain actif, non interdit pour le sous-tournoi du match |
| **Créneau** | Un créneau actif de l'événement |
| **Équipe arbitre** | Une équipe du même sous-tournoi, disponible sur ce créneau |

---

## Contraintes dures — ne peuvent jamais être violées

- **C-DUR-01** : Une équipe ne peut pas jouer deux matchs sur le même créneau.
- **C-DUR-02** : Un terrain ne peut pas accueillir deux matchs sur le même créneau.
- **C-DUR-03** : Un terrain marqué INTERDIT pour un sous-tournoi ne peut jamais recevoir un match de ce sous-tournoi.
- **C-DUR-04** : L'équipe arbitre d'un match ne peut pas être l'une des deux équipes qui jouent ce match.
- **C-DUR-05** : L'équipe arbitre ne peut pas jouer un autre match sur le même créneau que le match qu'elle arbitre.
- **C-DUR-06** : Un match ne peut être alloué qu'à un créneau actif et un terrain actif.

---

## Contraintes souples — respectées au mieux (best effort)

- **C-SOU-01** : Préférer les terrains PRIVILÉGIÉS d'un sous-tournoi avant les terrains NEUTRES.
- **C-SOU-02** : Respecter le nombre max de créneaux consécutifs sans jouer par équipe (paramètre global de l'événement). L'arbitrage ne compte pas comme un créneau joué.
- **C-SOU-03** : Répartir équitablement les rôles d'arbitrage entre les équipes d'un sous-tournoi.
- **C-SOU-04** : Minimiser le nombre total de créneaux utilisés (compacité du planning).
- **C-SOU-05** : Éviter qu'une équipe arbitre enchaîne plusieurs arbitrages consécutifs sans jouer.

---

## Comportement de l'algorithme

1. L'organisateur déclenche le calcul depuis la page d'administration du sous-tournoi ou de l'événement global
2. L'algorithme tente de satisfaire toutes les contraintes dures, puis optimise les contraintes souples
3. Si une contrainte dure ne peut pas être satisfaite pour un match, ce match est marqué **NON_ALLOUÉ** avec le motif (ex. "Aucun terrain disponible sur aucun créneau restant")
4. Le résultat est présenté comme une **suggestion** : l'organisateur peut valider en bloc ou ajuster match par match
5. Un bouton **"Recalculer"** permet de relancer l'algorithme à tout moment (cf. TERRAIN-02), avec confirmation si des ajustements manuels ont été faits (ils seront écrasés)

---

## Alertes et anomalies remontées

| Situation | Alerte |
|-----------|--------|
| Match non alloué faute de terrain disponible | "Aucun terrain disponible pour [équipe A] vs [équipe B]" |
| Match non alloué faute de créneau disponible | "Plus de créneaux disponibles pour allouer tous les matchs" |
| Contrainte max créneaux sans jouer violée | "L'équipe [X] dépasse le max de créneaux sans jouer sur le créneau [Y]" |
| Aucune équipe arbitre disponible sur un créneau | "Aucun arbitre disponible pour [équipe A] vs [équipe B] au créneau [Z]" |

Les alertes sont affichées dans un panneau récapitulatif après le calcul. Elles ne bloquent pas la validation — l'organisateur en a connaissance et peut corriger manuellement.

---

## Modification manuelle après allocation

- L'organisateur peut modifier le terrain, le créneau ou l'arbitre d'un match individuellement
- Lors d'une modification manuelle, le système vérifie les **contraintes dures** en temps réel et bloque si elles sont violées
- Les contraintes souples ne sont pas vérifiées à la modification manuelle, mais des avertissements sont affichés si elles sont violées (ex. "Cette équipe dépasse le max de créneaux sans jouer")
- Un match modifié manuellement est marqué **MODIFIÉ** pour le distinguer des suggestions système

---

## Recalcul global

- Disponible à tout moment avant le début de l'événement
- Nécessite une confirmation si des modifications manuelles existent ("Des ajustements manuels seront perdus. Confirmer ?")
- Les matchs déjà joués (statut TERMINÉ) ne sont jamais recalculés
- Déclenché aussi en cas de modification des règles d'affectation terrain (cf. TERRAIN-02)

---

## Règles métier

- **RG-ALLOC-01** : L'allocation ne peut être lancée que si le format du sous-tournoi est validé et la liste des matchs générée (cf. TOURNOI-02).
- **RG-ALLOC-02** : Un match en statut JOUÉ ou EN_COURS est exclu du recalcul.
- **RG-ALLOC-03** : L'algorithme traite les matchs de tous les sous-tournois simultanément pour optimiser l'utilisation des ressources partagées.
- **RG-ALLOC-04** : En cas d'impossibilité totale d'allocation pour un match (toutes les contraintes dures en échec), le match reste NON_ALLOUÉ et une alerte est remontée.
- **RG-ALLOC-05** : L'allocation suggérée n'est pas appliquée tant que l'organisateur ne la valide pas explicitement.

---

## Cas limites & exclusions

- L'algorithme exact d'optimisation (ex. backtracking, greedy, ILP) est une décision technique — seul le comportement observable est spécifié ici
- La gestion des phases successives (poules puis élimination) : l'allocation de la phase finale ne peut démarrer qu'une fois la phase de poules terminée
- Il n'y a pas de notion de "salle d'attente" ou de file de priorité entre sous-tournois pour l'accès aux terrains

---

## Critères d'acceptation

```gherkin
Scenario: Allocation réussie sans anomalie
  Given tous les matchs du sous-tournoi "-14 ans" sont générés
  And des terrains et créneaux sont disponibles
  When je lance l'allocation automatique
  Then chaque match reçoit un terrain, un créneau et une équipe arbitre
  And aucune contrainte dure n'est violée
  And la suggestion est affichée pour validation

Scenario: Terrain interdit respecté
  Given "Terrain D" est INTERDIT pour "-12 ans"
  When l'algorithme alloue les matchs de "-12 ans"
  Then aucun match de "-12 ans" n'est alloué sur "Terrain D"

Scenario: Terrain privilégié priorisé
  Given "Terrain A" est PRIVILÉGIÉ pour "-14 ans" et "Terrain B" est NEUTRE
  And les deux sont disponibles au même créneau
  When l'algorithme alloue un match de "-14 ans" sur ce créneau
  Then "Terrain A" est préféré à "Terrain B"

Scenario: Équipe arbitre qui joue au même créneau
  Given l'équipe "FC Dufief U14 A" joue un match au créneau 10h00
  When l'algorithme cherche un arbitre pour un autre match de "-14 ans" au créneau 10h00
  Then "FC Dufief U14 A" n'est pas proposée comme arbitre

Scenario: Modification manuelle avec violation de contrainte dure
  Given le match A vs B est alloué sur "Terrain C" au créneau 10h00
  And un autre match est déjà alloué sur "Terrain C" au créneau 10h00
  When un organisateur tente de déplacer A vs B sur "Terrain C" créneau 10h00
  Then le système bloque et affiche "Ce terrain est déjà occupé sur ce créneau"

Scenario: Recalcul avec modifications manuelles existantes
  Given l'organisateur a modifié manuellement 3 matchs après l'allocation
  When il clique sur "Recalculer"
  Then le système affiche "3 ajustements manuels seront perdus. Confirmer ?"
  And après confirmation, l'algorithme repart de zéro sur les matchs non joués
```

---

## Décisions actées

- **Export du planning** : un export par sous-tournoi est prévu (Should Have). Format PDF et/ou Excel, destiné à l'affichage physique sur site. Périmètre : tous les matchs du sous-tournoi avec terrain, créneau et arbitre.
- **Vue par équipe** : une vue dédiée affiche pour chaque équipe la liste ordonnée de ses matchs (à jouer et à arbitrer) avec terrain et créneau. Accessible depuis la page du sous-tournoi.
