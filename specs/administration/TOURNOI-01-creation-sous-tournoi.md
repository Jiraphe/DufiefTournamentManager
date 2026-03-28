# TOURNOI-01 — Création et configuration d'un sous-tournoi

**Domaine** : Administration / Préparation
**Rôle(s)** : Super Admin, Organisateur
**Priorité** : Must Have
**Statut** : Validé

---

## Contexte

Un sous-tournoi représente une compétition par catégorie d'âge (ex. -12 ans, -14 ans, -16 ans, Seniors) se déroulant dans le cadre de l'événement global. Tous les sous-tournois se jouent en parallèle sur les mêmes terrains et créneaux. Le format est équipe mixte.

Un organisateur peut créer et gérer plusieurs sous-tournois. Tous les organisateurs ont accès à tous les sous-tournois.

---

## Comportement attendu

- Le Super Admin ou un Organisateur peut créer un sous-tournoi rattaché à l'événement global
- Chaque sous-tournoi a ses propres équipes, son propre tableau de compétition et ses propres résultats
- Les sous-tournois partagent les ressources globales (terrains, créneaux) selon les règles d'affectation définies en TERRAIN-02

---

## Paramètres d'un sous-tournoi

| Paramètre | Type | Obligatoire | Contraintes |
|-----------|------|-------------|-------------|
| Nom / Catégorie | Texte | Oui | Ex. "-12 ans", "-14 ans", "Seniors" — unique dans l'événement |
| Format | Énuméré | Oui | Voir §Format de compétition |
| Nombre d'équipes minimum | Entier | Oui | ≥ 2 |
| Nombre d'équipes maximum | Entier | Non | ≥ nombre minimum si renseigné |

| Statut | Énuméré | — | Géré par le système (cf. cycle de vie) |

---

## Format de compétition

Les formats disponibles pour un sous-tournoi :

| Format | Description |
|--------|-------------|
| **POULES** | Tous les participants se rencontrent au sein de groupes (round-robin) |
| **ÉLIMINATION_DIRECTE** | Tableau à élimination directe (bracket) |
| **POULES_PUIS_ÉLIMINATION** | Phase de poules suivie d'une phase finale à élimination directe |

> Le choix du format est définitif une fois les équipes inscrites et le tableau généré.

---

## Règles métier

- **RG-TOURNOI-01** : Le nom/catégorie d'un sous-tournoi doit être unique au sein de l'événement global.
- **RG-TOURNOI-02** : La durée d'un match est obligatoirement égale à la durée du créneau global. Un créneau = un match. Il n'y a pas de temps de battement.
- **RG-TOURNOI-03** : Un sous-tournoi ne peut pas être supprimé si des équipes y sont inscrites ou si des matchs y sont planifiés.
- **RG-TOURNOI-04** : Tous les sous-tournois d'un même événement partagent les mêmes créneaux globaux.
- **RG-TOURNOI-05** : Un sous-tournoi peut être mis en pause (SUSPENDU) indépendamment des autres.
- **RG-TOURNOI-06** : La modification du format est bloquée dès que le tableau a été généré.


---

## Cycle de vie d'un sous-tournoi

```
BROUILLON → INSCRIPTIONS_OUVERTES → INSCRIPTIONS_FERMÉES → EN_COURS → TERMINÉ
                                                                ↕
                                                            SUSPENDU
```

| Transition | Condition |
|-----------|-----------|
| → INSCRIPTIONS_OUVERTES | Le tableau n'est pas encore généré |
| → INSCRIPTIONS_FERMÉES | Déclenchement manuel par organisateur |
| → EN_COURS | Tableau généré + premier match démarré |
| → SUSPENDU | Incident terrain ou décision organisateur |
| → TERMINÉ | Dernier match joué |

---

## Cas limites & exclusions

- Un sous-tournoi peut démarrer et se terminer avant les autres — les autres continuent indépendamment
- La gestion des équipes (inscription, composition) fait l'objet d'une spec dédiée (PARTICIPANT-XX)
- La génération du tableau fait l'objet d'une spec dédiée (TOURNOI-02)
- Le format en poules suppose un minimum de 3 équipes par poule — à valider à la génération du tableau

---

## Critères d'acceptation

```gherkin
Scenario: Création d'un sous-tournoi valide
  Given je suis Organisateur sur la page de gestion des sous-tournois
  When je crée un sous-tournoi "-14 ans" en format POULES, durée match 25 min, min 4 équipes
  Then le sous-tournoi "-14 ans" apparaît dans la liste en statut BROUILLON
  And les règles d'affectation terrain pour "-14 ans" sont initialisées à NEUTRE pour tous les terrains

Scenario: Durée de match supérieure à la durée du créneau
  Given la durée de créneau globale est de 30 minutes
  When je crée un sous-tournoi avec une durée de match de 35 minutes
  Then le formulaire affiche "La durée d'un match ne peut pas dépasser la durée du créneau (30 min)"
  And le sous-tournoi n'est pas créé

Scenario: Nom de catégorie dupliqué
  Given le sous-tournoi "-12 ans" existe déjà dans l'événement
  When je tente de créer un second sous-tournoi "-12 ans"
  Then le formulaire affiche "Cette catégorie existe déjà dans l'événement"

Scenario: Suspension d'un sous-tournoi
  Given le sous-tournoi "Seniors" est EN_COURS
  When un organisateur le passe en SUSPENDU
  Then les matchs EN_COURS de "Seniors" sont marqués SUSPENDU
  And les autres sous-tournois continuent normalement
  And une notification est envoyée aux arbitres du sous-tournoi "Seniors"
```

---

## Questions ouvertes

## Décisions actées

- **Durée d'un match** : obligatoirement égale à la durée du créneau global. Pas de temps de battement.
- **Responsable par sous-tournoi** : pas de notion de responsable principal. Tous les organisateurs ont les mêmes droits sur tous les sous-tournois.
- **Format de compétition (finales, petite finale, etc.)** : traité dans une spec dédiée lors de la partie "suggestion des matchs / format de tournoi".
