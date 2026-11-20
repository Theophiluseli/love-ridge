export interface AmenityItem {
  id: string;
  label: string;
  category: AmenityCategory;
}

export type AmenityCategory = 'Appliances' | 'Connectivity' | 'Other' | 'Property & Security';

export interface AmenityCategoryGroup {
  category: AmenityCategory;
  iconKey: 'tv' | 'network' | 'asterisk' | 'shield';
  color: string;
  items: string[];
}

export const AMENITY_GROUPS: AmenityCategoryGroup[] = [
  {
    category: 'Appliances',
    iconKey: 'tv',
    color: '#a21caf', // vibrant fuchsia/purple
    items: [
      'Air conditioning',
      'Cooker',
      'Washing machine',
      'Fans',
      'Refrigerator',
      'Microwave',
    ],
  },
  {
    category: 'Connectivity',
    iconKey: 'network',
    color: '#c026d3', // vibrant magenta
    items: [
      'Internet access',
      'Satellite tv',
    ],
  },
  {
    category: 'Other',
    iconKey: 'asterisk',
    color: '#db2777', // pink/rose
    items: [
      'Garden',
      'Garage',
      "Annexe (Boys' quarters)",
      'Roof terrace',
    ],
  },
  {
    // Buyer-confidence features most asked about by Ghana and diaspora buyers.
    category: 'Property & Security',
    iconKey: 'shield',
    color: '#047857',
    items: [
      'Titled land',
      'Swimming pool',
      'Gated community',
      '24/7 security',
      'Backup generator',
      'Water reservoir',
    ],
  },
];

export const ALL_AMENITIES_LIST: string[] = AMENITY_GROUPS.flatMap((g) => g.items);

export function getAmenityGroup(amenityName: string): AmenityCategory {
  for (const group of AMENITY_GROUPS) {
    if (group.items.some((item) => item.toLowerCase() === amenityName.toLowerCase())) {
      return group.category;
    }
  }
  return 'Other';
}
