'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 'EN' | 'ZH' | 'ES' | 'JA' | 'FR';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'EN', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ZH', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'JA', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
];

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  EN: {
    // Navigation
    'nav.home': 'Home',
    'nav.properties': 'Properties & Commercial',
    'nav.store': 'Our Store',
    'nav.services': 'Services',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.inquiry': 'Inquiry',
    'nav.admin': 'Staff Admin Portal',

    // Hero Section
    'hero.badge': 'GHANA’S PREMIER REAL ESTATE & BUILDING MATERIALS PLATFORM',
    'hero.title_part1': 'Luxury Real Estate &',
    'hero.title_part2': 'Premium Building Materials',
    'hero.subtitle': 'Direct access to verified residential villas, lands, commercial offices in East Legon, paired with direct imported luxury porcelain tiles and construction tools.',
    'hero.explore_properties': 'Explore Properties',
    'hero.visit_store': 'Visit Building Store',
    'hero.search_placeholder': 'Search luxury properties, lands, tiles or tools...',
    'hero.stat_listings': 'Verified Properties',
    'hero.stat_materials': 'Direct Imported Supplies',
    'hero.stat_support': '24/7 VIP Concierge',

    // Badges & Status
    'badge.for_sale': 'FOR SALE',
    'badge.for_rent': 'FOR RENT',
    'badge.featured': 'FEATURED',
    'badge.in_stock': 'In Stock',
    'badge.pre_order': 'Available on Pre-Order',
    'badge.out_of_stock': 'Out of Stock',
    'badge.verified': 'Verified Title & Documentation',
    'badge.negotiable': 'Negotiable',

    // Action Buttons
    'btn.view_property': 'View Property',
    'btn.view_product': 'View Product',
    'btn.request_quote': 'Request Quote',
    'btn.whatsapp': 'WhatsApp Us',
    'btn.book_tour': 'Schedule Private Viewing',
    'btn.download_brochure': 'Download Brochure',
    'btn.send_message': 'Send Message',
    'btn.view_gallery': 'View Full Gallery',
    'btn.filter': 'Filter Results',
    'btn.reset': 'Reset Filters',

    // Section Titles
    'section.featured_properties': 'Featured Luxury Properties',
    'section.featured_properties_sub': 'Hand-picked luxury villas, modern apartments, and premium land plots across Accra.',
    'section.store_supplies': 'Direct Imported Building Materials',
    'section.store_supplies_sub': 'High-grade porcelain floor tiles, marble slabs, smart locks, and industrial cordless power tools.',
    'section.services_title': 'Our Core Real Estate & Construction Services',
    'section.services_sub': 'Comprehensive solutions from property acquisitions to imported architectural finishes.',
    'section.why_choose': 'Why Choose Loveridge Properties & Consult?',

    // Property Types & Specs
    'prop.all': 'All Properties',
    'prop.house': 'Residential Houses & Villas',
    'prop.apartment': 'Luxury Apartments',
    'prop.land': 'Land & Development Plots',
    'prop.office': 'Commercial Offices',
    'prop.warehouse': 'Industrial Warehouses',
    'prop.beds': 'Bedrooms',
    'prop.baths': 'Bathrooms',
    'prop.sqm': 'sqm Area',

    // Store & Products
    'store.all': 'All Products',
    'store.tiles': 'Tiles & Marble Slabs',
    'store.tools': 'Tools & Construction Equipment',
    'store.moq': 'Min Order Quantity',
    'store.unit_piece': 'per piece',
    'store.unit_box': 'per box',
    'store.unit_set': 'per set',

    // Footer
    'footer.company_desc': 'Loveridge Properties & Consult is Ghana’s premier real estate consultancy and direct imported building materials distributor located in East Legon, Accra.',
    'footer.quick_links': 'Quick Links',
    'footer.store_links': 'Building Store',
    'footer.contact_info': 'Contact Details',
    'footer.copyright': 'LOVERIDGE Properties & Consult. All rights reserved.',
  },

  ZH: {
    // Navigation
    'nav.home': '首页',
    'nav.properties': '房产与商业地产',
    'nav.store': '建材商城',
    'nav.services': '专业服务',
    'nav.about': '关于我们',
    'nav.contact': '联系我们',
    'nav.inquiry': '在线咨询',
    'nav.admin': '员工管理后台',

    // Hero Section
    'hero.badge': '加纳顶级房地产与精品建筑材料综合平台',
    'hero.title_part1': '豪华尊贵房产与',
    'hero.title_part2': '进口优质建筑建材',
    'hero.subtitle': '精选东莱贡（East Legon）豪华别墅、住宅地块及商业办公楼，提供意大利西班牙原装进口瓷砖大理石与工业级施工工具。',
    'hero.explore_properties': '探索房产房源',
    'hero.visit_store': '进入建材商城',
    'hero.search_placeholder': '搜索豪宅、地块、瓷砖或工具...',
    'hero.stat_listings': '认证精品房源',
    'hero.stat_materials': '直装进口建材',
    'hero.stat_support': '24/7 VIP专属服务',

    // Badges & Status
    'badge.for_sale': '出售',
    'badge.for_rent': '出租',
    'badge.featured': '精选推荐',
    'badge.in_stock': '现货供应',
    'badge.pre_order': '支持预订',
    'badge.out_of_stock': '暂时缺货',
    'badge.verified': '已认证合法产权文件',
    'badge.negotiable': '可议价',

    // Action Buttons
    'btn.view_property': '查看房源详情',
    'btn.view_product': '查看商品详情',
    'btn.request_quote': '获取精准报价',
    'btn.whatsapp': 'WhatsApp在线咨询',
    'btn.book_tour': '预约专属看房',
    'btn.download_brochure': '下载房产手册',
    'btn.send_message': '发送咨询信息',
    'btn.view_gallery': '查看高清图集',
    'btn.filter': '筛选结果',
    'btn.reset': '重置筛选',

    // Section Titles
    'section.featured_properties': '精选豪华房源',
    'section.featured_properties_sub': '位于阿克拉黄金地段的精选奢华独栋别墅、现代公寓及优质地块。',
    'section.store_supplies': '直装进口建筑材料与工具',
    'section.store_supplies_sub': '高档抛光通体瓷砖、天然大理石板材、五合一智能指纹锁及重工业级无刷电动工具。',
    'section.services_title': '房地产与建筑全方位服务',
    'section.services_sub': '从房产投资置业、地块开发到高端进口建筑装修的一站式解决方案。',
    'section.why_choose': '为什么选择 Loveridge 洛夫里奇房产与咨询？',

    // Property Types & Specs
    'prop.all': '全部房源',
    'prop.house': '豪华别墅住宅',
    'prop.apartment': '现代精品公寓',
    'prop.land': '优质开发土地',
    'prop.office': '商业写字楼办公',
    'prop.warehouse': '工业大型仓储',
    'prop.beds': '卧室数量',
    'prop.baths': '卫浴设施',
    'prop.sqm': '建筑面积 (平米)',

    // Store & Products
    'store.all': '全部商品',
    'store.tiles': '高档瓷砖与大理石',
    'store.tools': '建筑工具与重型设备',
    'store.moq': '起订量',
    'store.unit_piece': '每件',
    'store.unit_box': '每箱',
    'store.unit_set': '每套',

    // Footer
    'footer.company_desc': 'Loveridge Properties & Consult 是加纳阿克拉东莱贡领先的房地产咨询公司和直接进口建筑建材分销商。',
    'footer.quick_links': '快捷导航',
    'footer.store_links': '建材专区',
    'footer.contact_info': '联系方式',
    'footer.copyright': 'LOVERIDGE Properties & Consult 版权所有。',
  },

  ES: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.properties': 'Propiedades y Comercial',
    'nav.store': 'Nuestra Tienda',
    'nav.services': 'Servicios',
    'nav.about': 'Nosotros',
    'nav.contact': 'Contacto',
    'nav.inquiry': 'Consulta',
    'nav.admin': 'Portal de Personal',

    // Hero Section
    'hero.badge': 'LA PLATAFORMA LÍDER EN BIENES RAÍCES Y MATERIALES EN GHANA',
    'hero.title_part1': 'Bienes Raíces de Lujo y',
    'hero.title_part2': 'Materiales de Construcción',
    'hero.subtitle': 'Acceso directo a villas residenciales, terrenos y oficinas comerciales en East Legon, junto con baldosas de porcelana y herramientas de construcción importadas.',
    'hero.explore_properties': 'Explorar Propiedades',
    'hero.visit_store': 'Visitar Tienda',
    'hero.search_placeholder': 'Buscar propiedades de lujo, terrenos o baldosas...',
    'hero.stat_listings': 'Propiedades Verificadas',
    'hero.stat_materials': 'Materiales Importados',
    'hero.stat_support': 'Atención VIP 24/7',

    // Badges & Status
    'badge.for_sale': 'EN VENTA',
    'badge.for_rent': 'EN ALQUILER',
    'badge.featured': 'DESTACADO',
    'badge.in_stock': 'En Stock',
    'badge.pre_order': 'Disponible en Preventa',
    'badge.out_of_stock': 'Agotado',
    'badge.verified': 'Título y Documentación Verificados',
    'badge.negotiable': 'Negociable',

    // Action Buttons
    'btn.view_property': 'Ver Propiedad',
    'btn.view_product': 'Ver Producto',
    'btn.request_quote': 'Solicitar Cotización',
    'btn.whatsapp': 'Escríbenos por WhatsApp',
    'btn.book_tour': 'Programar Visita Privada',
    'btn.download_brochure': 'Descargar Folleto',
    'btn.send_message': 'Enviar Mensaje',
    'btn.view_gallery': 'Ver Galería Completa',
    'btn.filter': 'Filtrar Resultados',
    'btn.reset': 'Restablecer Filtros',

    // Section Titles
    'section.featured_properties': 'Propiedades de Lujo Destacadas',
    'section.featured_properties_sub': 'Villas de lujo seleccionadas, apartamentos modernos y terrenos premium en Accra.',
    'section.store_supplies': 'Materiales de Construcción Importados',
    'section.store_supplies_sub': 'Porcelanato de alta gama, mármoles, cerraduras inteligentes y herramientas eléctricas industriales.',
    'section.services_title': 'Nuestros Servicios Inmobiliarios y de Construcción',
    'section.services_sub': 'Soluciones integrales desde adquisición de propiedades hasta acabados arquitectónicos importados.',
    'section.why_choose': '¿Por qué elegir Loveridge Properties & Consult?',

    // Property Types & Specs
    'prop.all': 'Todas las Propiedades',
    'prop.house': 'Casas y Villas Residenciales',
    'prop.apartment': 'Apartamentos de Lujo',
    'prop.land': 'Terrenos y Parcelas',
    'prop.office': 'Oficinas Comerciales',
    'prop.warehouse': 'Almacenes Industriales',
    'prop.beds': 'Habitaciones',
    'prop.baths': 'Baños',
    'prop.sqm': 'Área en m²',

    // Store & Products
    'store.all': 'Todos los Productos',
    'store.tiles': 'Baldosas y Mármoles',
    'store.tools': 'Herramientas y Equipos',
    'store.moq': 'Pedido Mínimo',
    'store.unit_piece': 'por pieza',
    'store.unit_box': 'por caja',
    'store.unit_set': 'por juego',

    // Footer
    'footer.company_desc': 'Loveridge Properties & Consult es la consultora inmobiliaria y distribuidora de materiales importados líder en East Legon, Accra.',
    'footer.quick_links': 'Enlaces Rápidos',
    'footer.store_links': 'Tienda de Materiales',
    'footer.contact_info': 'Contacto',
    'footer.copyright': 'LOVERIDGE Properties & Consult. Todos los derechos reservados.',
  },

  JA: {
    // Navigation
    'nav.home': 'ホーム',
    'nav.properties': '不動産・商業物件',
    'nav.store': 'ストア',
    'nav.services': 'サービス',
    'nav.about': '会社概要',
    'nav.contact': 'お問い合わせ',
    'nav.inquiry': 'お問い合わせ',
    'nav.admin': 'スタッフ管理画面',

    // Hero Section
    'hero.badge': 'ガーナ最高峰の不動産＆建築資材プラットフォーム',
    'hero.title_part1': '高級不動産物件と',
    'hero.title_part2': '直輸入プレミアム建築資材',
    'hero.subtitle': 'イースト・レゴンの厳選高級邸宅、土地、オフィス物件と、直接輸入されたイタリア・スペイン製高級タイルや工具をお届けします。',
    'hero.explore_properties': '物件一覧を見る',
    'hero.visit_store': '資材ストアを見る',
    'hero.search_placeholder': '高級物件、土地、タイル、工具を検索...',
    'hero.stat_listings': '認証済み物件',
    'hero.stat_materials': '直輸入建築資材',
    'hero.stat_support': '24時間 VIPサポート',

    // Badges & Status
    'badge.for_sale': '売買物件',
    'badge.for_rent': '賃貸物件',
    'badge.featured': '注目物件',
    'badge.in_stock': '在庫あり',
    'badge.pre_order': '予約受付中',
    'badge.out_of_stock': '在庫切れ',
    'badge.verified': '権利関係・登記確認済み',
    'badge.negotiable': '価格交渉可能',

    // Action Buttons
    'btn.view_property': '物件詳細を見る',
    'btn.view_product': '商品詳細を見る',
    'btn.request_quote': 'お見積りを依頼',
    'btn.whatsapp': 'WhatsAppでお問い合わせ',
    'btn.book_tour': '内見を予約する',
    'btn.download_brochure': 'パンフレットをダウンロード',
    'btn.send_message': 'メッセージを送信',
    'btn.view_gallery': '高画質写真を見る',
    'btn.filter': '絞り込み',
    'btn.reset': 'リセット',

    // Section Titles
    'section.featured_properties': 'おすすめの高級物件',
    'section.featured_properties_sub': 'アクラの一等地に位置する厳選された高級邸宅、モダンアパートメント、優良土地。',
    'section.store_supplies': '直輸入の建築資材＆電動工具',
    'section.store_supplies_sub': '高品質な磁器タイル、大理石スラブ、スマートロック、業務用コードレス電動工具。',
    'section.services_title': '総合不動産・建築サービス',
    'section.services_sub': '物件取得から高品質な輸入建築資材の提供まで、ワンストップでお応えします。',
    'section.why_choose': 'Loveridgeが選ばれる理由',

    // Property Types & Specs
    'prop.all': 'すべての物件',
    'prop.house': '高級邸宅・一戸建て',
    'prop.apartment': '高級アパートメント',
    'prop.land': '開発用地・土地',
    'prop.office': '商業オフィス',
    'prop.warehouse': '大型倉庫・工場',
    'prop.beds': 'ベッドルーム数',
    'prop.baths': 'バスルーム数',
    'prop.sqm': '専有面積 (㎡)',

    // Store & Products
    'store.all': 'すべての商品',
    'store.tiles': 'タイル・大理石',
    'store.tools': '工具・建築機械',
    'store.moq': '最小発注数',
    'store.unit_piece': '個あたり',
    'store.unit_box': '箱あたり',
    'store.unit_set': 'セットあたり',

    // Footer
    'footer.company_desc': 'Loveridge Properties & Consult はアクラ・イーストレゴンを拠点とするガーナ屈指の総合不動産コンサルティング及び輸入建材専門商社です。',
    'footer.quick_links': 'リンク',
    'footer.store_links': '建築資材ストア',
    'footer.contact_info': 'お問い合わせ情報',
    'footer.copyright': 'LOVERIDGE Properties & Consult. 無断転載を禁じます。',
  },

  FR: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.properties': 'Immobilier & Commercial',
    'nav.store': 'Notre Boutique',
    'nav.services': 'Services',
    'nav.about': 'À Propos',
    'nav.contact': 'Contact',
    'nav.inquiry': 'Demande',
    'nav.admin': 'Portail Staff',

    // Hero Section
    'hero.badge': 'LA PREMIÈRE PLATEFORME IMMOBILIÈRE ET MATÉRIAUX DU GHANA',
    'hero.title_part1': 'Immobilier de Luxe &',
    'hero.title_part2': 'Matériaux de Construction',
    'hero.subtitle': 'Accès direct aux villas résidentielles, terrains et bureaux commerciaux à East Legon, avec carreaux de porcelaine et outillages importés.',
    'hero.explore_properties': 'Explorer les Biens',
    'hero.visit_store': 'Visiter la Boutique',
    'hero.search_placeholder': 'Rechercher des biens immobiliers, terrains ou carrelages...',
    'hero.stat_listings': 'Biens Vérifiés',
    'hero.stat_materials': 'Matériaux Importés',
    'hero.stat_support': 'Conciergerie VIP 24/7',

    // Badges & Status
    'badge.for_sale': 'À VENDRE',
    'badge.for_rent': 'À LOUER',
    'badge.featured': 'EN VEDETTE',
    'badge.in_stock': 'En Stock',
    'badge.pre_order': 'Disponible sur Précommande',
    'badge.out_of_stock': 'Épuisé',
    'badge.verified': 'Titres de Propriété Vérifiés',
    'badge.negotiable': 'Négociable',

    // Action Buttons
    'btn.view_property': 'Voir la Propriété',
    'btn.view_product': 'Voir le Produit',
    'btn.request_quote': 'Demander un Devis',
    'btn.whatsapp': 'Nous Écrire sur WhatsApp',
    'btn.book_tour': 'Planifier une Visite Privée',
    'btn.download_brochure': 'Télécharger la Brochure',
    'btn.send_message': 'Envoyer un Message',
    'btn.view_gallery': 'Voir la Galerie Complète',
    'btn.filter': 'Filtrer les Résultats',
    'btn.reset': 'Réinitialiser',

    // Section Titles
    'section.featured_properties': 'Biens Immobiliers de Prestige',
    'section.featured_properties_sub': 'Villas de luxe sélectionnées, appartements modernes et terrains haut de gamme à Accra.',
    'section.store_supplies': 'Matériaux de Construction Importés Directement',
    'section.store_supplies_sub': 'Carreaux de porcelaine polie, marbres, serrures biométriques et outillage électroportatif professionnel.',
    'section.services_title': 'Nos Services Immobiliers et de Construction',
    'section.services_sub': 'Des solutions complètes de l’acquisition immobilière aux finitions architecturales importées.',
    'section.why_choose': 'Pourquoi Choisir Loveridge Properties & Consult ?',

    // Property Types & Specs
    'prop.all': 'Tous les Biens',
    'prop.house': 'Villas et Maisons Résidentielles',
    'prop.apartment': 'Appartements de Luxe',
    'prop.land': 'Terrains et Parcelles',
    'prop.office': 'Bureaux Commerciaux',
    'prop.warehouse': 'Entrepôts Industriels',
    'prop.beds': 'Chambres',
    'prop.baths': 'Salles de Bain',
    'prop.sqm': 'Surface en m²',

    // Store & Products
    'store.all': 'Tous les Produits',
    'store.tiles': 'Carrelages et Marbres',
    'store.tools': 'Outillage et Équipements',
    'store.moq': 'Quantité Min. de Commande',
    'store.unit_piece': 'par pièce',
    'store.unit_box': 'par boîte',
    'store.unit_set': 'par ensemble',

    // Footer
    'footer.company_desc': 'Loveridge Properties & Consult est la principale agence immobilière et distributeur de matériaux importés située à East Legon, Accra.',
    'footer.quick_links': 'Liens Rapides',
    'footer.store_links': 'Boutique Matériaux',
    'footer.contact_info': 'Coordonnées',
    'footer.copyright': 'LOVERIDGE Properties & Consult. Tous droits réservés.',
  },
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  currentLanguage: LanguageInfo;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'EN',
  setLanguage: () => {},
  currentLanguage: LANGUAGES[0],
  t: (key: string, fallback?: string) => fallback || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('EN');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('loveridge_language') as SupportedLanguage;
      if (saved && ['EN', 'ZH', 'ES', 'JA', 'FR'].includes(saved)) {
        setLanguageState(saved);
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('loveridge_language', lang);
      document.documentElement.lang = lang.toLowerCase();
    } catch (e) {
      // Ignore
    }
  };

  const currentLanguage = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const t = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.EN;
    return dict[key] || TRANSLATIONS.EN[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, currentLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
