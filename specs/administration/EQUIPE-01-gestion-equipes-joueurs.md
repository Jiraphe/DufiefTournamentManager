# EQUIPE-01 — Gestion des équipes et des joueurs

**Domaine** : Administration / Préparation
**Rôle(s)** : Organisateur, Super Admin
**Priorité** : Must Have
**Statut** : Validé

---

## Contexte

Une équipe est rattachée à un club et participe à un unique sous-tournoi. Elle a un nom propre et une liste de joueurs nominatifs (nom + sexe). Un club peut engager plusieurs équipes dans le même sous-tournoi. Les inscriptions étant gérées en dehors de l'application, la saisie des équipes et joueurs est manuelle.

---

## Comportement attendu

- Tout organisateur peut créer, modifier et supprimer des équipes
- Une équipe est associée à un club et à un seul sous-tournoi
- Chaque équipe peut avoir un contact dédié (distinct du contact du club)
- La composition en joueurs (nom, sexe) est saisie équipe par équipe

---

## Paramètres d'une équipe

| Paramètre | Type | Obligatoire | Contraintes |
|-----------|------|-------------|-------------|
| Nom | Texte | Oui | 2–100 caractères, unique au sein du sous-tournoi |
| Club | Référence | Oui | Doit exister dans la liste des clubs |
| Sous-tournoi | Référence | Oui | Un seul sous-tournoi par équipe |
| Nom du contact | Texte | Non | Contact propre à l'équipe (remplace/complète le contact club) |
| Email du contact | Email | Non | Format email valide |
| Téléphone du contact | Texte | Non | — |

---

## Paramètres d'un joueur

| Paramètre | Type | Obligatoire | Contraintes |
|-----------|------|-------------|-------------|
| Prénom | Texte | Oui | 2–50 caractères |
| Nom | Texte | Oui | 2–50 caractères |
| Sexe | Énuméré | Oui | M / F |
| Date de naissance | Date | Oui | Doit être cohérente avec la catégorie d'âge du sous-tournoi |

> Le format du tournoi étant mixte, le sexe est une donnée informative sans impact sur les règles de composition dans cette version.
> La date de naissance est informative et sert à vérifier visuellement l'éligibilité à la catégorie — l'application ne bloque pas mais avertit en cas d'incohérence (voir RG-EQUIPE-07).

---

## Règles métier

- **RG-EQUIPE-01** : Le nom d'une équipe doit être unique au sein d'un sous-tournoi.
- **RG-EQUIPE-02** : Une équipe ne peut appartenir qu'à un seul sous-tournoi. Si un club veut engager deux équipes dans deux sous-tournois différents, ce sont deux équipes distinctes.
- **RG-EQUIPE-03** : Un club peut avoir plusieurs équipes dans le même sous-tournoi (noms distincts obligatoires).
- **RG-EQUIPE-04** : Une équipe ne peut pas être supprimée si des matchs lui sont affectés (planifiés ou joués).
- **RG-EQUIPE-05** : Le contact de l'équipe est facultatif. En son absence, le contact du club fait foi.
- **RG-EQUIPE-06** : Il n'y a pas de nombre minimum ou maximum de joueurs imposé par l'application dans cette version.
- **RG-EQUIPE-07** : Si la date de naissance d'un joueur est incohérente avec la catégorie d'âge du sous-tournoi (ex. joueur trop âgé pour les -12 ans), le système affiche un avertissement non bloquant. L'organisateur reste libre de valider.
- **RG-EQUIPE-08** : L'application n'interdit pas techniquement qu'un même joueur (prénom + nom + date de naissance) apparaisse dans plusieurs équipes, en raison du risque d'homonymes. La vérification de l'unicité est de la responsabilité de l'organisateur.

---

## Cas limites & exclusions

- La composition en joueurs est purement informative — elle n'a pas d'impact sur l'allocation des matchs ni sur le scoring dans cette version
- La gestion de numéros de maillot, de licences ou de documents administratifs est hors scope
- L'import en masse (CSV) est hors scope pour cette version
- L'unicité d'un joueur entre plusieurs équipes n'est pas vérifiée techniquement (risque d'homonymes) — c'est une responsabilité organisateur

---

## Critères d'acceptation

```gherkin
Scenario: Création d'une équipe valide
  Given le club "FC Dufief" existe et le sous-tournoi "-14 ans" existe
  When je crée l'équipe "FC Dufief U14 A" rattachée à "FC Dufief" dans le sous-tournoi "-14 ans"
  Then l'équipe apparaît dans la liste des équipes du sous-tournoi "-14 ans"

Scenario: Deux équipes du même club dans le même sous-tournoi
  Given l'équipe "FC Dufief U14 A" existe dans "-14 ans"
  When je crée "FC Dufief U14 B" pour le même club et le même sous-tournoi
  Then les deux équipes coexistent dans le sous-tournoi "-14 ans"

Scenario: Nom d'équipe dupliqué dans un sous-tournoi
  Given "FC Dufief U14 A" existe dans "-14 ans"
  When je tente de créer une autre équipe nommée "FC Dufief U14 A" dans "-14 ans"
  Then le formulaire affiche "Ce nom d'équipe est déjà utilisé dans ce sous-tournoi"

Scenario: Ajout de joueurs à une équipe
  Given l'équipe "FC Dufief U14 A" existe
  When j'ajoute le joueur "Marie Dupont" (F) et "Lucas Martin" (M)
  Then les deux joueurs apparaissent dans la composition de l'équipe

Scenario: Suppression d'une équipe avec matchs planifiés
  Given l'équipe "FC Dufief U14 A" a des matchs planifiés
  When je tente de la supprimer
  Then le système affiche "Impossible — cette équipe a des matchs planifiés ou joués"
```

---

## Questions ouvertes

- [ ] Faut-il pouvoir réordonner les joueurs dans la liste (ex. par numéro de dossard) ou l'ordre de saisie suffit ?

## Décisions actées

- **Date de naissance** : obligatoire. Utilisée pour un avertissement non bloquant si le joueur semble hors catégorie.
- **Unicité des joueurs** : interdite en théorie mais non vérifiable techniquement à cause des homonymes. Pas de contrôle applicatif — responsabilité de l'organisateur.
