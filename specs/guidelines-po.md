# Guidelines PO / Spécifications Fonctionnelles
## Projet : Site d'administration et gestion de tournoi en temps réel

---

## 1. Philosophie générale

Ces guidelines régissent la façon dont nous écrivons, structurons et validons les spécifications fonctionnelles du projet. Elles s'appliquent à **tous les échanges futurs** sur les sujets fonctionnels, indépendamment de l'état technique du projet.

**Principes directeurs :**
- **User-first** : chaque spécification part d'un besoin utilisateur réel, pas d'une contrainte technique
- **Clarté > exhaustivité** : une spec courte et non ambiguë vaut mieux qu'un pavé incompréhensible
- **Testable par nature** : toute règle fonctionnelle doit pouvoir être vérifiée sans ambiguïté
- **Évolutif** : les specs sont versionnées et amendables, jamais gravées dans le marbre

---

## 2. Personas & rôles utilisateurs

Toute spec doit identifier le(s) rôle(s) concerné(s) parmi :

| Rôle | Description |
|------|-------------|
| **Super Admin** | Gestionnaire global de la plateforme (création de tournois, gestion des organisateurs) |
| **Organisateur** | Responsable d'un tournoi spécifique (paramétrage, validation, arbitrage) |
| **Arbitre / Staff** | Opérateur terrain (saisie des résultats, gestion des incidents) |
| **Joueur / Participant** | Compétiteur inscrit à un ou plusieurs tournois |
| **Spectateur** | Visiteur consultatif sans droit d'écriture |

> Ces rôles peuvent évoluer. Tout nouveau rôle doit être documenté ici avant d'être utilisé dans une spec.

---

## 3. Domaines fonctionnels

Le projet se structure autour de **5 domaines** :

### 3.1 Gestion des tournois
Création, configuration, publication et clôture d'un tournoi. Inclut les paramètres généraux (nom, dates, sport/jeu, format, règlement).

### 3.2 Gestion des participants
Inscription, validation, seeding, gestion des listes d'attente, désistements.

### 3.3 Compétition & résultats
Génération des tableaux/poules, planification des matchs, saisie des scores, gestion des forfaits et incidents.

### 3.4 Temps réel
Affichage live des matchs en cours, scores, classements, notifications push. Cœur de la proposition de valeur du produit.

### 3.5 Administration & reporting
Tableaux de bord, exports, historiques, statistiques par tournoi et par joueur.

---

## 4. Structure d'une spécification

Chaque spec fonctionnelle suit ce gabarit :

```
### [ID] Titre court et explicite

**Domaine** : (cf. §3)
**Rôle(s)** : (cf. §2)
**Priorité** : Must Have | Should Have | Could Have | Won't Have (MoSCoW)
**Statut** : Brouillon | En révision | Validé | Obsolète

#### Contexte
Pourquoi ce besoin existe. Ce qui se passe aujourd'hui sans cette fonctionnalité.

#### Comportement attendu
Description précise de ce que le système fait.
- Utiliser des listes pour les règles multiples
- Chaque règle = une phrase, une seule vérité

#### Règles métier
- RG-XXX : énoncé de la règle (court, testable)
- RG-XXX : ...

#### Cas limites & exclusions
Ce que la fonctionnalité ne fait PAS. Les edge cases identifiés.

#### Critères d'acceptation (Gherkin)
Given [contexte]
When [action]
Then [résultat attendu]

#### Questions ouvertes
- [ ] Question en suspens → assignée à qui, deadline
```

---

## 5. Priorisation MoSCoW

| Niveau | Signification |
|--------|---------------|
| **Must Have** | Bloquant pour le lancement. Sans ça, le produit ne tient pas. |
| **Should Have** | Important mais contournable temporairement. Prévu dans les premières itérations. |
| **Could Have** | Valeur ajoutée réelle mais non critique. Candidat au backlog. |
| **Won't Have** | Explicitement hors scope (cette version). Documenté pour éviter les rediscussions. |

---

## 6. Conventions de nommage des specs

- **ID** : `[DOMAINE]-[numéro]` — ex. `TOURNOI-01`, `TEMPS-REEL-03`, `PARTICIPANT-12`
- **Fichiers** : `specs/[domaine]/[id]-[slug].md` — ex. `specs/tournoi/TOURNOI-01-creation.md`
- **Règles métier** : `RG-[DOMAINE]-[numéro]` — ex. `RG-TOURNOI-01`

---

## 7. Gestion des états & cycles de vie

### Cycle de vie d'un tournoi
```
BROUILLON → PUBLIÉ → INSCRIPTIONS_OUVERTES → INSCRIPTIONS_FERMÉES → EN_COURS → TERMINÉ → ARCHIVÉ
                                                                               ↑
                                                                          (peut inclure PAUSE)
```

### Cycle de vie d'un match
```
PLANIFIÉ → EN_COURS → TERMINÉ
              ↓
          SUSPENDU → EN_COURS
              ↓
          ANNULÉ / FORFAIT
```

### Cycle de vie d'une inscription
```
EN_ATTENTE → VALIDÉE → CONFIRMÉE
     ↓                     ↓
  REFUSÉE              DÉSISTEMENT
```

> Tout changement d'état doit être traçable (qui, quand, depuis quel état).

---

## 8. Exigences transverses (non-fonctionnelles fonctionnellement visibles)

Ces exigences s'appliquent à toutes les specs du domaine **Temps réel** et à toute fonctionnalité impliquant plusieurs utilisateurs simultanés :

- **Latence affichage live** : un score saisi doit être visible par les spectateurs en < 2 secondes
- **Conflits de saisie** : si deux arbitres saisissent simultanément, le système doit détecter et alerter
- **Accessibilité** : les pages publiques (résultats live, tableaux) doivent être lisibles sans connexion
- **Hors-ligne partiel** : l'arbitre doit pouvoir saisir un score même en connexion dégradée (sync différée)

---

## 9. Ce que je ferai dans nos échanges

En tant que PO/Expert fonctionnel, lors de nos sessions de spec :

1. **Je poserai des questions avant d'écrire** : contexte, rôle, priorité, cas limites
2. **Je reformulerai le besoin** avant de le formaliser pour valider ma compréhension
3. **Je signalerai les ambiguïtés** et les règles métier manquantes explicitement
4. **Je proposerai des critères d'acceptation Gherkin** pour chaque fonctionnalité
5. **Je distinguerai** ce qui est fonctionnel de ce qui est une contrainte technique
6. **Je noterai les dépendances** entre specs (une feature qui en présuppose une autre)
7. **Je maintiendrai un glossaire** des termes métier au fil des échanges

---

## 10. Glossaire (à enrichir)

| Terme | Définition |
|-------|------------|
| **Tournoi** | Événement compétitif avec des participants, un format et des règles définis |
| **Match** | Rencontre entre deux participants ou équipes dans le cadre d'un tournoi |
| **Tableau** | Représentation bracket d'une compétition à élimination directe |
| **Poule** | Groupe de participants se rencontrant en round-robin |
| **Seeding** | Classement initial des participants avant le tirage |
| **Forfait** | Absence ou abandon d'un participant avant ou pendant un match |
| **Live** | Fonctionnalité affichant les informations en temps réel sans rechargement |

---

*Ces guidelines sont un document vivant. Elles seront amendées au fil des échanges si un cas non prévu se présente.*
