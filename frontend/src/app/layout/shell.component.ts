import { Component, signal, computed, inject } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private breakpointObserver = inject(BreakpointObserver);

  readonly isHandset = toSignal(
    this.breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  readonly sidenavOpened = signal(true);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard',    icon: 'dashboard',       route: '/dashboard' },
    { label: 'Tournois',     icon: 'emoji_events',    route: '/tournaments' },
    { label: 'Joueurs',      icon: 'group',           route: '/players' },
    { label: 'Matchs',       icon: 'sports_score',    route: '/matches' },
    { label: 'Classements',  icon: 'leaderboard',     route: '/rankings' },
  ];

  toggleSidenav(): void {
    this.sidenavOpened.update((v) => !v);
  }
}
