import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  temaAdmin = signal<'dark' | 'light'>('dark');
  loadingGlobal = signal<boolean>(false);

  constructor() {
    const savedTheme = localStorage.getItem('alitas-admin-theme') as 'dark' | 'light';
    if (savedTheme) {
      this.temaAdmin.set(savedTheme);
    }


    // Effect to auto-save when signal changes
    effect(() => {
      localStorage.setItem('alitas-admin-theme', this.temaAdmin());
      this.applyThemeToBody(this.temaAdmin());
    });
  }

  toggleTheme() {
    this.temaAdmin.update(theme => theme === 'dark' ? 'light' : 'dark');
  }

  setLoading(isLoading: boolean) {
    this.loadingGlobal.set(isLoading);
  }

  private applyThemeToBody(theme: 'dark' | 'light') {
    // Solo aplicamos clases al body si estamos en el modo admin. 
    // Para no ensuciar, el layout del admin añadirá la clase, pero podemos forzar el cambio desde aquí si es un approach global.
    const body = document.body;
    if (theme === 'light') {
      body.classList.remove('theme-dark');
      body.classList.add('theme-light');
    } else {
      body.classList.remove('theme-light');
      body.classList.add('theme-dark');
    }
  }
}
