import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-admin-help',
  standalone: true,
  imports: [
    CommonModule, NzButtonModule, NzIconModule,
    NzTabsModule, NzCardModule, NzTagModule,
    NzAlertModule, NzCollapseModule
  ],
  templateUrl: './admin-help.component.html',
  styleUrl: './admin-help.component.scss'
})
export class AdminHelpComponent {
  seoService = inject(SeoService);

  ngOnInit() {
    this.seoService.setTags({
      title: 'Guía de Ayuda | Administración',
      description: 'Manual de usuario e instrucciones paso a paso para administrar Alitas Food Company.',
      route: '/admin/help'
    });
  }

  printManual() {
    window.print();
  }
}
