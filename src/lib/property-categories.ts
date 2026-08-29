export interface PropertyTypeOption {
  value: string;
  label: string;
  category: 'PROPERTY' | 'LAND';
  isResidential: boolean;
  desc?: string;
}

// Built properties matching exact screenshot format
export const BUILT_PROPERTY_TYPES: PropertyTypeOption[] = [
  { value: 'APARTMENT', label: 'Apartment', category: 'PROPERTY', isResidential: true },
  { value: 'BEACHHOUSE', label: 'Beachhouse', category: 'PROPERTY', isResidential: true },
  { value: 'COMMERCIAL_SPACE', label: 'Commercial space', category: 'PROPERTY', isResidential: false },
  { value: 'GUEST_HOUSE', label: 'Guest house', category: 'PROPERTY', isResidential: true },
  { value: 'HOTEL', label: 'Hotel', category: 'PROPERTY', isResidential: true },
  { value: 'HOUSE', label: 'House', category: 'PROPERTY', isResidential: true },
  { value: 'OFFICE', label: 'Office', category: 'PROPERTY', isResidential: false },
  { value: 'RETAIL', label: 'Retail', category: 'PROPERTY', isResidential: false },
  { value: 'SHOP', label: 'Shop', category: 'PROPERTY', isResidential: false },
  { value: 'STUDIO_APARTMENT', label: 'Studio apartment', category: 'PROPERTY', isResidential: true },
  { value: 'TOWNHOUSE', label: 'Townhouse', category: 'PROPERTY', isResidential: true },
];

// Land section standing on its own dedicated section
export const LAND_PROPERTY_TYPE: PropertyTypeOption = {
  value: 'LAND',
  label: 'Land & Plots',
  category: 'LAND',
  isResidential: false,
  desc: 'Commercial & Lease Lands, Residential Plots, Titled Acreage & Development Sites',
};

export const ALL_PROPERTY_TYPES: PropertyTypeOption[] = [
  LAND_PROPERTY_TYPE,
  ...BUILT_PROPERTY_TYPES,
];

export function isResidentialProperty(type: string): boolean {
  const upper = (type || '').toUpperCase();
  if (upper === 'LAND') return false;
  const found = BUILT_PROPERTY_TYPES.find((p) => p.value === upper);
  if (found) return found.isResidential;
  // default true for common living spaces
  return ['HOUSE', 'APARTMENT', 'STUDIO_APARTMENT', 'TOWNHOUSE', 'BEACHHOUSE', 'GUEST_HOUSE', 'HOTEL'].includes(upper);
}

export function formatPropertyType(type: string): string {
  if (!type) return 'Property';
  const upper = type.toUpperCase();
  if (upper === 'LAND') return 'Land / Plot';
  if (upper === 'OFFICE_SPACE') return 'Office';
  if (upper === 'WAREHOUSE') return 'Warehouse / Logistics';
  const found = BUILT_PROPERTY_TYPES.find((p) => p.value === upper);
  if (found) return found.label;
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase().replace(/_/g, ' ');
}
