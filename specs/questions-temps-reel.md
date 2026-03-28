# Questions — Gestion en temps réel

À traiter avant d'écrire les specs de la partie temps réel.

---

## 1. Saisie des scores

- **Q1** : Qui saisit le score final d'un match — l'arbitre officiel uniquement, ou l'organisateur peut aussi intervenir ?
- **Q2** : Le score est-il saisi en fin de match uniquement (score final), ou aussi en cours de match (score intermédiaire / live) ?
- **Q3** : Le score se présente sous quelle forme ? Un score global (ex. 3-1), un score par mi-temps/période, ou autre chose selon le sport ?
- **Q4** : Y a-t-il une validation du score par un second acteur (ex. l'organisateur confirme ce que l'arbitre a saisi), ou la saisie est-elle directe et définitive ?
- **Q5** : Que se passe-t-il si un score est saisi par erreur — peut-on le corriger, et si oui par qui ?

---

## 2. Déroulement d'un match

- **Q6** : Un match doit-il être explicitement "démarré" (passage en statut EN_COURS) ou est-il automatiquement démarré à l'heure du créneau ?
- **Q7** : Un match peut-il être déclaré "forfait" (une équipe ne se présente pas) ? Si oui, qui le déclare et quel est le résultat attribué ?
- **Q8** : Un match peut-il être annulé (distinct du forfait) ? Dans quel cas ?
- **Q9** : Y a-t-il une notion de prolongation ou de tirs au but pour les matchs à élimination directe, ou le résultat est toujours tranché dans le temps réglementaire ?

---

## 3. Classements et résultats

- **Q10** : Quel est le système de points pour les matchs de poule (ex. 3 pts victoire, 1 pt nul, 0 pt défaite) ? Y a-t-il des nuls possibles ?
- **Q11** : En cas d'égalité au classement de poule, quels critères de départage ? (différence de buts, confrontation directe, fair-play, tirage au sort ?)
- **Q12** : Le classement est-il mis à jour en temps réel après chaque saisie de score, ou seulement à la validation du score ?
- **Q13** : Pour la phase à élimination directe, le tableau (bracket) est-il mis à jour automatiquement dès qu'un résultat est saisi ?

---

## 4. Affichage public / spectateurs

- **Q14** : Y a-t-il un écran ou une page publique (sans connexion) affichant les matchs en cours et les scores en temps réel ?
- **Q15** : Que voit-on sur cet affichage — tous les sous-tournois en même temps, ou une vue par sous-tournoi ?
- **Q16** : Les spectateurs peuvent-ils accéder au planning complet et aux classements, ou uniquement aux scores en cours ?
- **Q17** : Y a-t-il un affichage physique prévu (ex. écran TV sur site) qui serait alimenté par l'application ?

---

## 5. Notifications

- **Q18** : Des notifications sont-elles envoyées aux équipes (ex. "Votre match commence dans 10 minutes") ? Si oui, sur quel canal (SMS, push, affichage sur site) ?
- **Q19** : Les organisateurs doivent-ils recevoir des alertes en temps réel (ex. match en retard, terrain libre non utilisé, match NON_ALLOUÉ) ?

---

## 6. Incidents et cas particuliers

- **Q20** : Comment gère-t-on un match suspendu en cours de jeu (orage, incident terrain) — le score partiel est-il conservé ?
- **Q21** : Si un terrain devient indisponible en cours d'événement, doit-on proposer une réallocation automatique des matchs restants sur ce terrain ?
- **Q22** : Si une équipe est disqualifiée en cours de tournoi, que devient-elle dans le tableau et dans les matchs déjà programmés ?
