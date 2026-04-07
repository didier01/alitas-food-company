export interface VenueMenu {
  id: string;
  venue_id: string;
  name: string;
  product_ids: string[]; // lista de productos habilitados para esa sede
  combo_ids: string[]; // lista de combos habilitados para esa sede
  is_shared: boolean; // si true, aplica a todas las sedes
  active: boolean;
}