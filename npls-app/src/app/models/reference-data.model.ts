export interface ReferenceData {
  coverstocks: string[];
  finishes: string[];
  weightBlocks: string[];
  brands: string[];
  lines: string[];
  coverstockTypes: string[];
  colors?: ColorOption[];
  fragrances?: string[];
  logos?: string[];
}

export interface ColorOption {
  name: string;
  shades?: string[];
  hex?: string;
}

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}
