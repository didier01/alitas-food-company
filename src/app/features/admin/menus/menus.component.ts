import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { MenuSedeService } from '../../../core/services/menu-sede.service';
import { SedeService } from '../../../core/services/sede.service';
import { MenuSede } from '../../../core/models/menu-sede.model';
import { Sede } from '../../../core/models/sede.model';
import { forkJoin } from 'rxjs';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';

@Component({
  selector: 'app-menus',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzButtonModule, NzIconModule, NzTagModule, LoadingSpinnerComponent],
  templateUrl: './menus.component.html',
  styleUrl: './menus.component.scss'
})
export class MenusComponent implements OnInit {
  menuService = inject(MenuSedeService);
  sedeService = inject(SedeService);
  message = inject(NzMessageService);

  menus: MenuSede[] = [];
  sedes: Sede[] = [];
  menusSedesMap: { menu: MenuSede }[] = [];
  loading = signal(true);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    forkJoin({
      menus: this.menuService.getAll(),
      sedes: this.sedeService.getAll()
    }).subscribe({
      next: (data) => {
        this.menus = data.menus;
        this.sedes = data.sedes;
        this.menusSedesMap = this.menus.map(m => ({ menu: m }));
        this.loading.set(false);
      },
      error: () => {
        this.message.error('Error cargando menús');
        this.loading.set(false);
      }
    });
  }

  getSedeName(sedeId: string): string {
    const sede = this.sedes.find(s => s.id === sedeId);
    return sede ? sede.nombre : 'Sede Desconocida';
  }

  compartirGlobal(menu: MenuSede) {
    this.menuService.compartirMenuEntreTodasLasSedes(menu.id).subscribe(() => {
      this.message.success('Menú compartido a todas las sedes exitosamente.');
      this.loadData();
    });
  }
}
