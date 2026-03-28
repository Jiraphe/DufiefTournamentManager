# EVENEMENT-01 — Configuration de l'événement global

**Domaine** : Administration / Préparation
**Rôle(s)** : Super Admin
**Priorité** : Must Have
**Statut** : Validé

---

## Contexte

L'application gère un unique événement annuel (ex. "Tournoi de Dufief 2026"). Cet événement est le cadre de toutes les ressources partagées (terrains, créneaux) et de tous les sous-tournois. Il se déroule sur une seule journée.

Il n'y a qu'un seul événement actif à la fois sur la plateforme.

---

## Comportement attendu

- Le Super Admin peut créer et configurer l'événement global depuis une page d'administration dédiée
- L'événement peut être modifié tant qu'il n'est pas en statut EN_COURS
- Toutes les ressources (terrains, créneaux, sous-tournois) sont rattachées à cet événement

---

## Paramètres de l'événement

| Paramètre | Type | Obligatoire | Contraintes |
|-----------|------|-------------|-------------|
| Nom | Texte | Oui | 3–100 caractères |
| Date | Date | Oui | Doit être dans le futur à la création |
| Heure de début | Heure | Oui | Format HH:MM |
| Heure de fin | Heure | Oui | Doit être > heure de début |
| Lieu | Texte | Non | 3–200 caractères |
| Description | Texte long | Non | — |
| Nombre max de créneaux consécutifs sans jouer | Entier | Oui | ≥ 1 — s'applique à toutes les équipes de tous les sous-tournois |

---

## Règles métier

- **RG-EVENEMENT-01** : Il ne peut exister qu'un seul événement en statut BROUILLON, PUBLIÉ ou EN_COURS simultanément.
- **RG-EVENEMENT-02** : L'heure de fin doit être postérieure d'au moins 1 heure à l'heure de début.
- **RG-EVENEMENT-03** : La modification de la date ou des horaires est bloquée dès que l'événement passe EN_COURS.
- **RG-EVENEMENT-04** : La suppression d'un événement n'est possible que s'il est en statut BROUILLON et qu'aucun sous-tournoi n'y est rattaché.
- **RG-EVENEMENT-05** : Le nombre max de créneaux consécutifs sans jouer est une contrainte souple (best effort) utilisée par l'algorithme d'allocation. L'arbitrage d'un créneau ne compte pas comme un créneau joué — seule la participation à un match compte.

---

## Cycle de vie

```
BROUILLON → PUBLIÉ → EN_COURS → TERMINÉ → ARCHIVÉ
```

| Transition | Déclencheur | Acteur |
|-----------|-------------|--------|
| BROUILLON → PUBLIÉ | Action manuelle | Super Admin |
| PUBLIÉ → EN_COURS | Action manuelle ou heure de début atteinte | Super Admin / Système |
| EN_COURS → TERMINÉ | Action manuelle ou heure de fin atteinte | Super Admin / Système |
| TERMINÉ → ARCHIVÉ | Action manuelle | Super Admin |

---

## Cas limites & exclusions

- Un événement ARCHIVÉ est en lecture seule, aucune modification possible
- Le système ne crée pas l'événement automatiquement chaque année — c'est une action manuelle
- La gestion multi-jours est explicitement **hors scope** (Won't Have)

---

## Critères d'acceptation

```gherkin
Scenario: Création d'un événement valide
  Given je suis connecté en tant que Super Admin
  When je renseigne le nom "Tournoi Dufief 2026", la date "2026-06-15", l'heure de début "08:00" et l'heure de fin "19:00"
  And je valide le formulaire
  Then l'événement est créé en statut BROUILLON
  And il apparaît sur le tableau de bord d'administration

Scenario: Heure de fin invalide
  Given je crée un événement
  When je renseigne une heure de fin "07:30" inférieure à l'heure de début "08:00"
  Then le formulaire affiche une erreur "L'heure de fin doit être postérieure à l'heure de début"
  And l'événement n'est pas créé

Scenario: Tentative de création d'un deuxième événement actif
  Given un événement en statut PUBLIÉ existe déjà
  When je tente de créer un nouvel événement
  Then le système affiche un message "Un événement actif existe déjà"
  And la création est bloquée
```

---

## Questions ouvertes

- [ ] Faut-il une confirmation explicite avant la transition EN_COURS (pour éviter un passage accidentel) ? → à valider avec l'organisateur
- [ ] L'événement doit-il avoir un logo / visuel d'identité ? (Could Have)
