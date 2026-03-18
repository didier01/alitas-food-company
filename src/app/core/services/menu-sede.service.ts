import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MenuSede } from '../models/menu-sede.model';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuSedeService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(): Observable<MenuSede[]> {
    return this.http.get<MenuSede[]>(`${this.apiUrl}/menus-sede`);
  }

  getMenuBySede(sedeId: string): Observable<MenuSede | undefined> {
    return this.getAll().pipe(
      map(menus => menus.find(m => m.esCompartido || m.sedeId === sedeId))
    );
  }

  crearMenuParaSede(menu: MenuSede): Observable<MenuSede> {
    return this.http.post<MenuSede>(`${this.apiUrl}/menus-sede`, menu);
  }

  compartirMenuEntreTodasLasSedes(menuId: string): Observable<MenuSede> {
    const updatePayload = {
      esCompartido: true,
      sedeId: 'ALL'
    } as Partial<MenuSede>;
    return this.http.put<MenuSede>(`${this.apiUrl}/menus-sede/${menuId}`, updatePayload);
  }

  // En un mock interceptor esto se sobrescribe con el json completo pero simula la API real
  agregarQuitarProducto(menuId: string, productoIds: string[]): Observable<MenuSede> {
     return this.http.put<MenuSede>(`${this.apiUrl}/menus-sede/${menuId}`, { productoIds });
  }

  update(menu: MenuSede): Observable<MenuSede> {
    return this.http.put<MenuSede>(`${this.apiUrl}/menus-sede/${menu.id}`, menu);
  }
}
