# CLUB-01 — Gestion des clubs

**Domaine** : Administration / Préparation
**Rôle(s)** : Organisateur, Super Admin
**Priorité** : Must Have
**Statut** : Validé

---

## Contexte

Un club est une entité sportive qui peut engager une ou plusieurs équipes dans l'événement. Les inscriptions étant gérées à l'extérieur de l'application, les clubs sont saisis manuellement par les organisateurs. Un club peut participer à plusieurs sous-tournois via des équipes distinctes.

---

## Comportement attendu

- Tout organisateur peut créer, modifier et consulter les clubs
- La suppression d'un club est possible uniquement s'il n'a aucune équipe rattachée
- La liste des clubs est partagée entre tous les sous-tournois (un club est global à l'événement)

---

## Paramètres d'un club

| Paramètre | Type | Obligatoire | Contraintes |
|-----------|------|-------------|-------------|
| Nom | Texte | Oui | 2–100 caractères, unique dans l'événement |
| Ville | Texte | Oui | 2–100 caractères |
| Nom du contact | Texte | Non | 2–100 caractères |
| Email du contact | Email | Non | Format email valide |
| Téléphone du contact | Texte | Non | — |

---

## Règles métier

- **RG-CLUB-01** : Le nom d'un club doit être unique au sein de l'événement.
- **RG-CLUB-02** : Un club ne peut pas être supprimé s'il a au moins une équipe rattachée (même désactivée).
- **RG-CLUB-03** : Tous les organisateurs peuvent créer et modifier des clubs.
- **RG-CLUB-04** : Un club peut avoir plusieurs équipes dans le même sous-tournoi.

---

## Cas limites & exclusions

- Il n'y a pas de notion de club "invité" ou de statut particulier — tous les clubs sont au même niveau
- L'import en masse (CSV/Excel) est hors scope pour cette version
- La gestion d'un logo de club est hors scope pour cette version

---

## Critères d'acceptation

```gherkin
Scenario: Création d'un club valide
  Given je suis Organisateur
  When je crée le club "FC Dufief" avec la ville "Bruxelles" et le contact "Jean Dupont / jean@fc.be"
  Then le club apparaît dans la liste des clubs de l'événement

Scenario: Nom de club dupliqué
  Given le club "FC Dufief" existe déjà
  When je tente de créer un second club "FC Dufief"
  Then le formulaire affiche "Ce nom de club est déjà utilisé"

Scenario: Suppression d'un club avec équipes
  Given le club "FC Dufief" a 2 équipes rattachées
  When je tente de le supprimer
  Then le système affiche "Impossible — ce club a des équipes rattachées"
  And la suppression est bloquée

Scenario: Suppression d'un club sans équipes
  Given le club "Club Test" n'a aucune équipe
  When je le supprime
  Then le club disparaît de la liste
```

---

## Questions ouvertes

- [ ] Faut-il un champ "Notes" libre sur le club pour les organisateurs ?
