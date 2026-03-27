import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle.component';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule,
    NzLayoutModule, NzMenuModule,
    NzIconModule, ThemeToggleComponent, NzTooltipModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  isCollapsed = false;
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  router = inject(Router);

  isSuperAdmin(): boolean {
    return this.authService.currentUser()?.role === 'superadmin';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
