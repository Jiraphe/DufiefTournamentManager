import { Component, signal } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';

export interface StatCard {
  label: string;
  value: number;
  icon: string;
  delta: string;
  positive: boolean;
}

export interface RecentTournament {
  name: string;
  format: string;
  players: number;
  status: 'en cours' | 'terminé' | 'à venir';
  date: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    MatTableModule,
    MatBadgeModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly stats = signal<StatCard[]>([
    { label: 'Tournois actifs',  value: 3,   icon: 'emoji_events', delta: '+1 ce mois',   positive: true  },
    { label: 'Joueurs inscrits', value: 128, icon: 'group',         delta: '+12 ce mois',  positive: true  },
    { label: 'Matchs joués',     value: 342, icon: 'sports_score',  delta: '+48 ce mois',  positive: true  },
    { label: 'Tournois terminés',value: 17,  icon: 'task_alt',      delta: '−2 vs mois dernier', positive: false },
  ]);

  readonly recentTournaments = signal<RecentTournament[]>([
    { name: 'Open Printemps 2026',   format: 'Élimination directe', players: 32, status: 'en cours', date: '20 mars 2026' },
    { name: 'Championnat Régional',  format: 'Round Robin',          players: 16, status: 'en cours', date: '15 mars 2026' },
    { name: 'Coupe des Clubs',       format: 'Double élimination',   players: 64, status: 'à venir',  date: '5 avr. 2026'  },
    { name: 'Liga Hiver 2025',       format: 'Round Robin',          players: 12, status: 'terminé',  date: '28 fév. 2026' },
    { name: 'Invitationnel Elite',   format: 'Élimination directe',  players: 8,  status: 'terminé',  date: '14 fév. 2026' },
  ]);

  readonly tableColumns = ['name', 'format', 'players', 'status', 'date'];

  readonly upcomingMatches = signal([
    { player1: 'Martin L.',  player2: 'Chen W.',   time: '14h00', tournament: 'Open Printemps 2026' },
    { player1: 'Dupont A.',  player2: 'Silva R.',   time: '15h30', tournament: 'Open Printemps 2026' },
    { player1: 'Müller K.',  player2: 'Tanaka S.',  time: '17h00', tournament: 'Championnat Régional' },
  ]);
}
