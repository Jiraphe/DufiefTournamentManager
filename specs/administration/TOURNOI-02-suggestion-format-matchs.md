# TOURNOI-02 — Suggestion de format et génération des matchs

**Domaine** : Administration / Préparation
**Rôle(s)** : Organisateur, Super Admin
**Priorité** : Must Have
**Statut** : Validé

---

## Contexte

Une fois les équipes inscrites dans un sous-tournoi, le système propose un format de compétition adapté au nombre d'équipes et génère la liste exhaustive des matchs à jouer. Cette liste est le point d'entrée de l'allocation terrain/créneau/arbitre (voir ALLOCATION-01).

La suggestion est modifiable par l'organisateur avant validation. Une fois le format validé, les matchs sont figés et l'allocation peut commencer.

---

## Comportement attendu

- Le système analyse le nombre d'équipes inscrites et propose un format adapté
- L'organisateur peut accepter la suggestion ou choisir un autre format compatible
- Une fois le format validé, le système génère la liste des matchs (sans terrain ni créneau à ce stade)
- L'organisateur peut ensuite lancer l'allocation automatique (ALLOCATION-01)

---

## Formats disponibles et conditions de suggestion

| Format | Conditions de suggestion | Description |
|--------|--------------------------|-------------|
| **POULES** | Toujours possible dès 2 équipes | Toutes les équipes se rencontrent dans des groupes en round-robin |
| **ÉLIMINATION_DIRECTE** | Recommandé si nombre d'équipes = puissance de 2 (2, 4, 8, 16…) | Bracket à élimination directe |
| **POULES_PUIS_ÉLIMINATION** | Recommandé si ≥ 6 équipes | Phase de poules suivie d'une phase finale à élimination directe |

> Le système propose le format le mieux adapté mais l'organisateur peut en choisir un autre parmi les formats compatibles avec le nombre d'équipes.

---

## Règles de génération des matchs par format

### Format POULES

- **RG-TOURNOI-08** : Le système répartit les équipes en groupes de taille homogène. Si la division est inégale, certains groupes ont une équipe de plus.
- **RG-TOURNOI-09** : Chaque groupe joue en round-robin : chaque équipe rencontre toutes les autres équipes du même groupe exactement une fois.
- **RG-TOURNOI-10** : La composition des groupes est tirée au sort par le système avec une contrainte de séparation : le système s'efforce de ne pas placer deux équipes d'un même club dans le même groupe. Si le nombre d'équipes d'un club l'impose, la séparation est maximisée (best effort). L'organisateur peut modifier la composition avant validation.
- **RG-TOURNOI-11** : Nombre de matchs par groupe de N équipes = N × (N−1) / 2.

### Format ÉLIMINATION_DIRECTE

- **RG-TOURNOI-12** : Si le nombre d'équipes n'est pas une puissance de 2, des exemptions (bye) sont générées pour compléter le tableau. Une équipe exemptée passe automatiquement au tour suivant.
- **RG-TOURNOI-13** : Le système propose la répartition des équipes dans le tableau (seeding). L'organisateur peut la modifier.
- **RG-TOURNOI-14** : Le détail des tours finaux (finale, match pour la 3e place, etc.) sera spécifié dans une version ultérieure.

### Format POULES_PUIS_ÉLIMINATION

- Les règles POULES s'appliquent à la phase de groupes.
- Les règles ÉLIMINATION_DIRECTE s'appliquent à la phase finale.
- **RG-TOURNOI-15** : Le nombre d'équipes qualifiées par groupe pour la phase finale est paramétrable (ex. 1er et 2e de chaque groupe).

---

## Règles métier transverses

- **RG-TOURNOI-16** : Une fois le format validé et les matchs générés, le format ne peut plus être modifié. Les matchs peuvent en revanche être ajustés manuellement (ajout/suppression) avant le début de l'événement.
- **RG-TOURNOI-19** : Avant de valider le format, le système affiche un récapitulatif : nombre total de matchs générés et estimation du nombre de créneaux nécessaires (calculée sur la base du nombre de terrains disponibles et non interdits pour ce sous-tournoi). Cette estimation est indicative — elle ne tient pas compte des contraintes inter-sous-tournois.
- **RG-TOURNOI-17** : Tout match généré est initialement sans terrain, sans créneau et sans arbitre — ces informations sont remplies par l'allocation (ALLOCATION-01).
- **RG-TOURNOI-18** : Un sous-tournoi doit avoir au minimum 2 équipes inscrites pour que le format puisse être validé.

---

## Cas limites & exclusions

- La gestion du seeding avancé (classements externes, têtes de série) est hors scope pour cette version
- La gestion des matchs aller-retour est hors scope
- Le détail des formats de finale (petite finale, etc.) fera l'objet d'une spec dédiée

---

## Critères d'acceptation

```gherkin
Scenario: Suggestion de format pour 8 équipes
  Given le sous-tournoi "-14 ans" a 8 équipes inscrites
  When je demande une suggestion de format
  Then le système propose POULES_PUIS_ÉLIMINATION en format recommandé
  And propose POULES et ÉLIMINATION_DIRECTE comme alternatives

Scenario: Génération des matchs en format POULES (4 équipes, 1 groupe)
  Given le format POULES est validé avec 4 équipes dans 1 groupe
  When les matchs sont générés
  Then 6 matchs sont créés (A-B, A-C, A-D, B-C, B-D, C-D)
  And chaque match est sans terrain, sans créneau, sans arbitre

Scenario: Tentative de validation avec moins de 2 équipes
  Given le sous-tournoi "Seniors" n'a qu'1 équipe inscrite
  When je tente de valider le format
  Then le système affiche "Il faut au minimum 2 équipes pour générer des matchs"

Scenario: Modification manuelle d'un match avant allocation
  Given les matchs sont générés mais aucune allocation n'a démarré
  When un organisateur supprime un match de la liste
  Then le match est retiré de la liste
  And l'allocation tiendra compte de cette liste mise à jour
```

---

## Décisions actées

- **Composition des groupes** : tirage au sort avec séparation best effort des équipes d'un même club. Modifiable manuellement avant validation.
- **Récapitulatif avant validation** : le système affiche le nombre de matchs générés et une estimation indicative du nombre de créneaux nécessaires, calculée sur les terrains disponibles pour ce sous-tournoi.
