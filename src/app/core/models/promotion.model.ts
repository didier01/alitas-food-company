export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPercentage?: number;
  specialPrice?: number;
  imageUrl: string;
  venueIds: string[]; // puede ser ['ALL'] para todas las sedes
  startDate: string; // ISO String recomendado
  endDate: string; // ISO String recomendado
  applicableDays: string[]; // Ej: ['Martes', 'Miercoles']
  active: boolean;
}
