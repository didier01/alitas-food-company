export interface ModifierOption {
  id: string;             // Record UUID in modifier_options table
  name: string;           // Direct name of the modifier
  price: number;          // Direct extra price of the modifier
  category?: string;
  active?: boolean;
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

