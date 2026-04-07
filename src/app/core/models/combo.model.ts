import { AssignedModifierGroup } from './modifier-group.model';

export interface Combo {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url: string;
  active?: boolean;
  show_savings?: boolean;
  included_products?: {
    id: string;
    quantity: number;
  }[];
  venue_ids?: string[];
  allergen_ids?: string[];
  modifier_groups?: AssignedModifierGroup[];
}
