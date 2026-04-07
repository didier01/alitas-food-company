export interface ModifierOption {
  id: string;             // Record UUID in modifier_options table
  product_id: string;     // The referenced global Product UUID
  name: string;           // Derived from the relational product
  extra_price: number;    // Derived from the relational product price
}

export interface ModifierGroup {
  id: string;
  name: string;
  options?: ModifierOption[];
}

export interface AssignedModifierGroup {
  group_id: string;       // Foreign key to ModifierGroup
  name: string;           // Pre-filled from joined ModifierGroup
  min_selection: number;
  max_selection: number;
  free_selections: number;
  options: ModifierOption[];
}

