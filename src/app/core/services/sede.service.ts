import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Sede } from '../models/sede.model';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SedeService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Signal global para la sede seleccionada en el sitio público
  selectedSede = signal<Sede | null>(null);

  constructor() {
    this.initSelectedSede();
  }

  private initSelectedSede() {
    const saved = localStorage.getItem('alistas_selected_sede');
    if (saved) {
      this.selectedSede.set(JSON.parse(saved));
    }
  }

  setSede(sede: Sede) {
    this.selectedSede.set(sede);
    localStorage.setItem('alistas_selected_sede', JSON.stringify(sede));
  }

  getAll(): Observable<Sede[]> {
    return this.http.get<Sede[]>(`${this.apiUrl}/sedes`);
  }

  getById(id: string): Observable<Sede> {
    return this.http.get<Sede>(`${this.apiUrl}/sedes/${id}`);
  }

  create(sede: Sede): Observable<Sede> {
    return this.http.post<Sede>(`${this.apiUrl}/sedes`, sede);
  }

  update(sede: Sede): Observable<Sede> {
    return this.http.put<Sede>(`${this.apiUrl}/sedes/${sede.id}`, sede);
  }
}
