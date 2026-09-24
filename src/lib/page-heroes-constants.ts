export interface PageHeroConfig {
  title: string;
  subtitle: string;
  highlightText?: string;
}

export type PageHeroConfigs = Record<string, PageHeroConfig>;

export const DEFAULT_PAGE_HEROES: PageHeroConfigs = {
  properties: {
    title: 'Properties & Commercial Listings',
    highlightText: 'Commercial Listings',
    subtitle: 'Browse verified luxury villas, residential homes, prime commercial offices, logistics warehouses, and titled lands across Ghana.',
  },
  products: {
    title: 'Loveridge Building Materials Store',
    highlightText: 'Building Materials Store',
    subtitle: 'We help developers, investors, home builders, artisans, and diaspora clients across Ghana and Africa source quality building materials, smart tools, and machinery from China. Check our store now.',
  },
  about: {
    title: 'Transforming Real Estate with Excellence & Practicality',
    highlightText: 'Excellence & Practicality',
    subtitle: 'Loveridge Properties and Consult bridges luxury real estate brokerage in Ghana with direct factory procurement of high-grade building materials, porcelain tiles, and construction tools globally.',
  },
  services: {
    title: 'Our Property & Global Sourcing Services',
    highlightText: 'Global Sourcing Services',
    subtitle: 'Tailored solutions designed for homeowners, property developers, and international investors seeking verified real estate or direct factory-priced construction materials.',
  },
  contact: {
    title: 'Contact Loveridge Consult',
    highlightText: 'Loveridge Consult',
    subtitle: 'Have a question about a property viewing, land title search, or wholesale building material import? Reach out to our East Legon office team.',
  },
};
