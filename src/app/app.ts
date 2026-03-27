import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { animate, style, transition, trigger, query, group } from '@angular/animations';
import { ThemeService } from './core/services/theme.service';
import { VenueService } from './core/services/venue.service';

export const routeTransition = trigger('routeTransition', [
  transition('* => *', [
    query(':enter, :leave', style({ position: 'absolute', width: '100%' }), { optional: true }),
    group([
      query(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { optional: true }),
      query(':leave', [
        style({ opacity: 1, transform: 'translateY(0)' }),
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ], { optional: true })
    ])
  ])
]);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  animations: [routeTransition],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  title = 'alitas-company';
  themeService = inject(ThemeService);
  venueService = inject(VenueService);

  private outlet = inject(RouterOutlet, { optional: true });

  ngOnInit() {
    
    // Inicializar sede data en global app state al arranque
    this.venueService.getAll().subscribe(res => {
      const storedSedeId = localStorage.getItem('selectedSedeId');
      if (storedSedeId) {
        const found = res.find(s => s.id === storedSedeId);
        if (found) {
           this.venueService.selectedVenue.set(found);
           return;
        }
      }
      if (res.length > 0) {
        this.venueService.selectedVenue.set(res[0]); // fallback first sede
        localStorage.setItem('selectedSedeId', res[0].id);
      }
    });
  }

  getRouteAnimationData() {
    return this.outlet && this.outlet.activatedRouteData ? this.outlet.activatedRouteData['animation'] : null;
  }
}
