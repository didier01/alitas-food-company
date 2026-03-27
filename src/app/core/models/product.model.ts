export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  available: boolean;
  featured: boolean;
  allergens?: string[];
  customizations?: string[];
  // Optional price analytics
  realPrice?: number;
  showSavings?: boolean;
}
