export interface AmenityItem {
  id: string;
  label: string;
  category: 'Appliances' | 'Connectivity' | 'Other';
}

export interface AmenityCategoryGroup {
  category: 'Appliances' | 'Connectivity' | 'Other';
  iconKey: 'tv' | 'network' | 'asterisk';
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
];

export const ALL_AMENITIES_LIST: string[] = AMENITY_GROUPS.flatMap((g) => g.items);

export function getAmenityGroup(amenityName: string): 'Appliances' | 'Connectivity' | 'Other' {
  for (const group of AMENITY_GROUPS) {
    if (group.items.some((item) => item.toLowerCase() === amenityName.toLowerCase())) {
      return group.category;
    }
  }
  return 'Other';
}
