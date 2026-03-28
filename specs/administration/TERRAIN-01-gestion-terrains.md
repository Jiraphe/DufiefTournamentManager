# TERRAIN-01 — Gestion des terrains

**Domaine** : Administration / Préparation
**Rôle(s)** : Super Admin
**Priorité** : Must Have
**Statut** : Validé

---

## Contexte

Les terrains sont des ressources physiques partagées entre tous les sous-tournois. Leur nombre est fixe pour un événement donné. Chaque terrain a un nom (ex. "Terrain A", "Terrain 3") et peut être soumis à des règles d'affectation spécifiques selon le sous-tournoi (voir TERRAIN-02).

---

## Comportement attendu

- Le Super Admin peut créer, modifier et désactiver des terrains depuis la page de configuration de l'événement
- La liste des terrains est visible par les organisateurs (lecture seule)
- Un terrain désactivé ne peut plus recevoir de matchs

---

## Paramètres d'un terrain

| Paramètre | Type | Obligatoire | Contraintes |
|-----------|------|-------------|-------------|
| Nom | Texte | Oui | 1–50 caractères, unique dans l'événement |
| Actif | Booléen | Oui | Défaut : true |
| Ordre d'affichage | Entier | Non | Pour le tri dans les vues planning |

---

## Règles métier

- **RG-TERRAIN-01** : Le nom d'un terrain doit être unique au sein d'un événement.
- **RG-TERRAIN-02** : Un terrain ne peut pas être supprimé s'il est affecté à des matchs planifiés ou en cours.
- **RG-TERRAIN-03** : Un terrain peut être désactivé à tout moment par le Super Admin, même en cours d'événement. Les matchs déjà planifiés sur ce terrain restent mais génèrent une alerte.
- **RG-TERRAIN-04** : Un terrain désactivé n'est plus proposé par le système lors de l'allocation automatique.
- **RG-TERRAIN-05** : Le nombre de terrains actifs peut être modifié avant et pendant l'événement (ajout en cas de terrain supplémentaire, désactivation en cas d'indisponibilité).

---

## Cas limites & exclusions

- Il n'y a pas de notion de "sport compatible" par terrain (hors scope pour cette version)
- La gestion des équipements ou caractéristiques physiques du terrain est hors scope
- La désactivation temporaire avec plage horaire est hors scope (Could Have futur)

---

## Critères d'acceptation

```gherkin
Scenario: Création d'un terrain
  Given je suis Super Admin sur la page de configuration des terrains
  When je saisis le nom "Terrain A" et je valide
  Then le terrain "Terrain A" apparaît dans la liste, statut Actif

Scenario: Nom de terrain dupliqué
  Given le terrain "Terrain A" existe déjà
  When je tente de créer un second terrain avec le nom "Terrain A"
  Then le formulaire affiche "Ce nom de terrain est déjà utilisé"
  And le terrain n'est pas créé

Scenario: Désactivation d'un terrain sans match planifié
  Given le terrain "Terrain B" est actif et sans match planifié
  When je le désactive
  Then son statut passe à Inactif
  And il n'apparaît plus dans les suggestions d'allocation

Scenario: Désactivation d'un terrain avec matchs planifiés
  Given le terrain "Terrain C" a 3 matchs planifiés
  When je le désactive
  Then le système affiche "Ce terrain a 3 matchs planifiés — ils seront signalés en anomalie"
  And je dois confirmer l'action
  And après confirmation, le terrain passe Inactif et les 3 matchs sont marqués en alerte
```

---

## Questions ouvertes

- [ ] Faut-il un historique des désactivations de terrain (qui, quand) ? (Should Have)
- [ ] Souhaites-tu un ordre d'affichage manuel des terrains ou alphabétique par défaut ?
