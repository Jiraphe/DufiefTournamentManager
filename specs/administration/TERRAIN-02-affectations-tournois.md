# TERRAIN-02 — Règles d'affectation terrain ↔ sous-tournoi

**Domaine** : Administration / Préparation
**Rôle(s)** : Super Admin, Organisateur
**Priorité** : Must Have
**Statut** : Validé

---

## Contexte

Les terrains sont partagés entre tous les sous-tournois mais certains sous-tournois peuvent être interdits sur certains terrains (ex. un petit terrain non adapté à une catégorie). À l'inverse, certains terrains peuvent être privilégiés pour un sous-tournoi. Ces règles d'affectation guident l'algorithme d'allocation automatique.

---

## Comportement attendu

- Pour chaque couple (terrain, sous-tournoi), le Super Admin peut définir une règle d'affectation
- Ces règles sont consultables et modifiables depuis une vue matricielle (terrain × sous-tournoi)
- L'algorithme d'allocation respecte strictement les interdictions et favorise les terrains privilégiés

---

## Modèle d'affectation

Chaque couple (terrain, sous-tournoi) a exactement **une** règle d'affectation :

| Valeur | Signification |
|--------|---------------|
| **NEUTRE** | Le terrain peut accueillir ce sous-tournoi (comportement par défaut) |
| **PRIVILÉGIÉ** | Le système préfère ce terrain pour ce sous-tournoi lors de l'allocation |
| **INTERDIT** | Le système ne peut jamais affecter ce terrain à ce sous-tournoi |

> Par défaut, toute nouvelle combinaison terrain/sous-tournoi est NEUTRE.

---

## Règles métier

- **RG-TERRAIN-06** : Un match d'un sous-tournoi ne peut jamais être affecté (automatiquement ou manuellement) à un terrain marqué INTERDIT pour ce sous-tournoi.
- **RG-TERRAIN-07** : L'algorithme d'allocation priorise les terrains PRIVILÉGIÉS avant les terrains NEUTRES. Les terrains INTERDITS sont exclus.
- **RG-TERRAIN-08** : Si tous les terrains disponibles sur un créneau sont INTERDITS pour un sous-tournoi, les matchs de ce créneau pour ce sous-tournoi sont signalés comme non allouables (alerte).
- **RG-TERRAIN-09** : Une règle INTERDIT peut être modifiée avant et pendant l'événement, mais pas rétroactivement sur un match déjà joué.
- **RG-TERRAIN-10** : La modification d'une règle en cours d'événement ne réalloue pas automatiquement les matchs déjà planifiés — une réallocation manuelle ou un recalcul explicite est nécessaire.

---

## Vue matricielle

La page d'affectation présente une matrice :

```
              | Terrain A | Terrain B | Terrain C | Terrain D |
-12 ans       |  NEUTRE   | PRIVILÉGIÉ|  NEUTRE   |  INTERDIT |
-14 ans       | PRIVILÉGIÉ|  NEUTRE   |  NEUTRE   |  NEUTRE   |
-16 ans       |  NEUTRE   |  NEUTRE   | PRIVILÉGIÉ|  NEUTRE   |
Seniors       |  NEUTRE   |  INTERDIT |  NEUTRE   | PRIVILÉGIÉ|
```

Chaque cellule est éditable via un sélecteur (NEUTRE / PRIVILÉGIÉ / INTERDIT).

---

## Cas limites & exclusions

- Un terrain peut être PRIVILÉGIÉ pour plusieurs sous-tournois simultanément (pas de réservation exclusive)
- Si aucun terrain n'est PRIVILÉGIÉ pour un sous-tournoi, l'allocation se fait uniquement sur les NEUTRES
- La gestion de priorités numériques (ex. priorité 1, 2, 3) est hors scope — seuls 3 niveaux sont gérés

---

## Critères d'acceptation

```gherkin
Scenario: Affectation manuelle sur terrain interdit bloquée
  Given le terrain "Terrain D" est INTERDIT pour le sous-tournoi "-12 ans"
  When un organisateur tente d'affecter manuellement un match de "-12 ans" sur "Terrain D"
  Then le système affiche "Ce terrain est interdit pour ce sous-tournoi"
  And l'affectation est refusée

Scenario: L'algorithme respecte les privilèges
  Given "Terrain A" est PRIVILÉGIÉ pour "-14 ans" et "Terrain B" est NEUTRE
  And les deux terrains sont disponibles sur le créneau 10h00
  When l'algorithme alloue les matchs du créneau 10h00 pour "-14 ans"
  Then "Terrain A" est attribué en priorité avant "Terrain B"

Scenario: Alerte si aucun terrain disponible
  Given tous les terrains sont INTERDITS pour le sous-tournoi "Seniors" sur le créneau 14h00
  When l'algorithme tente d'allouer les matchs de 14h00 pour "Seniors"
  Then une alerte "Aucun terrain disponible pour Seniors au créneau 14h00" est remontée
  And les matchs concernés sont marqués NON_ALLOUÉS

Scenario: Modification d'une règle en cours d'événement
  Given l'événement est EN_COURS
  And le terrain "Terrain C" passe de INTERDIT à NEUTRE pour "-16 ans"
  Then les matchs de "-16 ans" déjà planifiés sur d'autres terrains ne sont pas modifiés
  And la nouvelle règle s'applique aux prochaines allocations
```

---

## Questions ouvertes

- [ ] La vue matricielle est-elle accessible aux organisateurs en lecture seule, ou réservée au Super Admin ?

## Décisions actées

- **Recalcul des allocations** : un bouton "Recalculer toutes les allocations" sera disponible (Must Have). Il tient compte des règles d'affectation courantes et nécessite une confirmation avant exécution. Les matchs déjà joués ne sont jamais réalloués.
