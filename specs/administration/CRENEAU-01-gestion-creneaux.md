# CRENEAU-01 — Gestion des créneaux globaux

**Domaine** : Administration / Préparation
**Rôle(s)** : Super Admin
**Priorité** : Must Have
**Statut** : Validé

---

## Contexte

Un créneau représente une tranche horaire pendant laquelle des matchs peuvent se jouer. Tous les matchs affectés au même créneau commencent et finissent exactement en même temps. Les créneaux sont définis à l'échelle de l'événement global et s'appliquent à tous les sous-tournois.

La durée de tous les créneaux est identique et fixée au niveau de l'événement.

---

## Comportement attendu

- Le Super Admin définit une durée de créneau unique pour l'événement
- Le système génère automatiquement la liste des créneaux à partir de l'heure de début, de la durée et de l'heure de fin de l'événement
- Le Super Admin peut supprimer des créneaux individuels (ex. pause déjeuner) ou en ajouter manuellement
- Les créneaux sont consultables par les organisateurs (lecture seule)

---

## Paramètres globaux des créneaux

| Paramètre | Type | Obligatoire | Contraintes |
|-----------|------|-------------|-------------|
| Durée d'un créneau | Entier (minutes) | Oui | Entre 10 et 120 minutes |

> La durée est commune à tous les créneaux. Elle ne peut pas être modifiée une fois des matchs planifiés.

---

## Génération automatique des créneaux

À partir de :
- Heure de début de l'événement (ex. 08:00)
- Heure de fin de l'événement (ex. 19:00)
- Durée d'un créneau (ex. 30 min)

Le système génère les créneaux : 08:00–08:30, 08:30–09:00, 09:00–09:30… jusqu'à ne plus pouvoir générer un créneau complet avant 19:00.

> Si (heure de fin − heure de début) n'est pas un multiple de la durée, le dernier créneau incomplet **n'est pas généré**.

---

## Paramètres d'un créneau

| Paramètre | Type | Description |
|-----------|------|-------------|
| Heure de début | Heure | Calculée automatiquement |
| Heure de fin | Heure | Calculée automatiquement |
| Actif | Booléen | Défaut : true. Si false, aucun match ne peut y être planifié |
| Label | Texte | Optionnel — ex. "Pause déjeuner" pour un créneau désactivé |

---

## Règles métier

- **RG-CRENEAU-01** : La durée d'un créneau est identique pour tous les créneaux de l'événement.
- **RG-CRENEAU-02** : La durée ne peut pas être modifiée si au moins un match est déjà planifié sur un créneau.
- **RG-CRENEAU-03** : Un créneau désactivé n'est plus proposé à l'allocation automatique ni manuelle.
- **RG-CRENEAU-04** : Un créneau ne peut pas être supprimé s'il contient des matchs planifiés ou joués.
- **RG-CRENEAU-05** : Les créneaux sont régénérés automatiquement si l'heure de début ou de fin de l'événement est modifiée (tant qu'aucun match n'est planifié).
- **RG-CRENEAU-06** : Un créneau ajouté manuellement doit avoir une heure de début comprise dans la plage horaire de l'événement.

---

## Cas limites & exclusions

- Les créneaux n'ont pas de durée propre — ils héritent tous de la durée globale (pas de créneau "long" exceptionnel dans cette version)
- La gestion de pauses récurrentes (ex. pause toutes les 3 heures) n'est pas automatisée — c'est une désactivation manuelle créneau par créneau
- Un créneau désactivé avec un label "Pause déjeuner" est une convention d'affichage, pas un type distinct

---

## Critères d'acceptation

```gherkin
Scenario: Génération automatique des créneaux
  Given un événement de 08:00 à 19:00 avec une durée de créneau de 30 minutes
  When je valide la configuration des créneaux
  Then le système génère 22 créneaux : 08:00-08:30, 08:30-09:00, ..., 18:30-19:00

Scenario: Génération avec plage non multiple
  Given un événement de 08:00 à 19:00 avec une durée de créneau de 40 minutes
  When je valide la configuration
  Then le système génère les créneaux complets jusqu'à 18:40-19:20 exclus
  And affiche un avertissement "La durée ne divise pas exactement la plage horaire — X minutes non couvertes en fin de journée"

Scenario: Désactivation d'un créneau pour la pause déjeuner
  Given le créneau 12:00-12:30 est actif et sans match planifié
  When je le désactive avec le label "Pause déjeuner"
  Then il apparaît grisé dans le planning avec le label "Pause déjeuner"
  And il est exclu de l'allocation automatique

Scenario: Tentative de modification de durée avec matchs existants
  Given des matchs sont planifiés sur des créneaux
  When je tente de modifier la durée de 30 à 45 minutes
  Then le système affiche "Impossible — des matchs sont déjà planifiés sur des créneaux existants"
  And la modification est bloquée
```

---

## Questions ouvertes

- [ ] Souhaites-tu un aperçu visuel (timeline) des créneaux avant de valider la génération ?

## Décisions actées

- **Pause déjeuner** : pas de notion de "bloc pause". Une pause se gère en désactivant plusieurs créneaux unitaires consécutifs. Pas de type créneau dédié.
