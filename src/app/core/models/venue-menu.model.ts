export interface VenueMenu {
  id: string;
  venueId: string;
  name: string;
  productIds: string[]; // lista de productos habilitados para esa sede
  isShared: boolean; // si true, aplica a todas las sedes
  active: boolean;

}