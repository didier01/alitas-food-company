import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, delay, tap, switchMap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http'; // Used to load the local json

// Simulamos latencia de red entre 300ms y 600ms
const simulateNetworkDelay = () => Math.floor(Math.random() * 300) + 300;

export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo interceptamos si useMocks es true y es una petición al backend 'simulado'
  // Para evitar interceptar la carga del propio JSON, usamos req.url.includes('/api/') o la lógica que convenga
  
  if (!environment.useMocks) {
    return next(req);
  }

  // Ejemplo: el servicio llama a getAll() -> GET /api/products
  // Interceptamos y leemos /assets/mock/products.json
  if (req.url.startsWith('/api/')) {
    const endpoint = req.url.replace('/api/', ''); // ej: 'products'
    // Soporte básico para GET (lectura de JSONs locales proxy)
    // Para POST/PUT/DELETE simplemente se simula un success respondiendo con los datos del body o vacío
    
    if (req.method === 'GET') {
      const jsonStr = `/assets/mock/${endpoint}.json`; // Asume que el endpoint es el name exacto, ej 'products' -> products.json
      
      // Para simular el proxy, Angular usará the native fetch() o next(req) pero a un JSON
      const mockReq = req.clone({ url: jsonStr });
      return next(mockReq).pipe(
        delay(simulateNetworkDelay())
      );
    } 
    
    if (req.method === 'POST') {
      const bodyPayload = req.body as any;
      return of(new HttpResponse({ status: 201, body: { ...bodyPayload, id: `${endpoint}-new` } })).pipe(
        delay(simulateNetworkDelay())
      );
    }

    if (req.method === 'PUT') {
      return of(new HttpResponse({ status: 200, body: req.body })).pipe(
        delay(simulateNetworkDelay())
      );
    }

    if (req.method === 'DELETE') {
      return of(new HttpResponse({ status: 204, body: null })).pipe(
        delay(simulateNetworkDelay())
      );
    }
  }

  // Si no coincide, procesar normalmente (ej. requests reales de assets, etc)
  return next(req);
};
