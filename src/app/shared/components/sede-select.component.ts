import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { SedeService } from '../../core/services/sede.service';
import { Sede } from '../../core/models/sede.model';

@Component({
  selector: 'app-sede-select',
  standalone: true,
  imports: [CommonModule, FormsModule, NzSelectModule],
    templateUrl: './sede-select.component.html',
    styleUrl: './sede-select.component.scss'
})
export class SedeSelectComponent implements OnInit {
  sedeService = inject(SedeService);
  sedes = signal<Sede[]>([]);

  ngOnInit() {
    this.sedeService.getAll().subscribe(data => {
      this.sedes.set(data.filter(s => s.activa));
      
      // Preseleccionar si no hay nada guardado, usando un microtask para evitar NG0100
      if (!this.sedeService.selectedSede() && this.sedes().length > 0) {
        Promise.resolve().then(() => {
          if (!this.sedeService.selectedSede()) {
            this.sedeService.setSede(this.sedes()[0]);
          }
        });
      }
    });
  }

  safeSedeId(): string {
    return this.sedeService.selectedSede()?.id || '';
  }

  onSedeChange(sedeId: string) {
    const s = this.sedes().find((x: Sede) => x.id === sedeId);
    if (s) {
      this.sedeService.setSede(s);
    }
  }
}
