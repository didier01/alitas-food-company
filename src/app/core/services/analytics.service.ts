import { Injectable } from '@angular/core';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  /**
   * Envía un evento personalizado a Google Analytics 4
   * @param eventName Nombre del evento (ej: 'click_product', 'search_menu')
   * @param eventParams Parámetros del evento
   */
  trackEvent(eventName: string, eventParams: Record<string, any> = {}): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, eventParams);
      console.log(`[GA4 Event]: ${eventName}`, eventParams);
    }
  }

  /**
   * Registra el clic en una tarjeta de producto
   */
  trackProductClick(productName: string, categoryName: string, price: number): void {
    this.trackEvent('select_item', {
      item_name: productName,
      item_category: categoryName,
      price: price
    });
  }

  /**
   * Registra una búsqueda en el buscador del menú
   */
  trackSearch(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim().length < 2) return;
    this.trackEvent('search', {
      search_term: searchTerm.trim()
    });
  }

  /**
   * Registra el uso de un filtro por categoría
   */
  trackCategoryFilter(categoryName: string): void {
    this.trackEvent('filter_category', {
      category_name: categoryName
    });
  }

  /**
   * Registra el tiempo de interacción dentro del modal de un producto (en segundos)
   */
  trackModalViewDuration(productName: string, durationSeconds: number): void {
    this.trackEvent('modal_view_duration', {
      item_name: productName,
      duration_seconds: durationSeconds
    });
  }

  /**
   * Registra cuando un producto es agregado a la selección
   */
  trackAddToSelection(productName: string, totalPrice: number): void {
    this.trackEvent('add_to_cart', {
      item_name: productName,
      value: totalPrice,
      currency: 'COP'
    });
  }

  /**
   * Registra cuando el usuario abre el resumen de platos para el mesero
   */
  trackViewSelectionSummary(totalItems: number, totalAmount: number): void {
    this.trackEvent('view_cart', {
      items_count: totalItems,
      value: totalAmount,
      currency: 'COP'
    });
  }
}
