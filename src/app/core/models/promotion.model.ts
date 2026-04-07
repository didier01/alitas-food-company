export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount_percentage?: number;
  special_price?: number;
  image_url: string;
  venue_ids?: string[]; // Join table promotion_venues
  start_date: string; // ISO String recomendado
  end_date: string; // ISO String recomendado
  applicable_days: string[]; // Ej: ['Martes', 'Miercoles']
  active: boolean;
}
