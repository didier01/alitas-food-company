import { Allergen } from './allergen.model';
import { AssignedModifierGroup } from './modifier-group.model';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url: string;
  category_id?: string;
  available?: boolean;
  featured?: boolean;
  allergen_ids?: string[];
  ingredient_ids?: string[];
  modifier_groups?: AssignedModifierGroup[];
}
