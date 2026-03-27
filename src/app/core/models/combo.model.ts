export interface Combo {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  includedProducts: {
    id: string;
    quantity: number;
  }[];
  venueIds: string[]; // ['ALL'] o específicos
  active: boolean;
  showSavings: boolean;
}
