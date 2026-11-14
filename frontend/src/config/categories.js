/**
 * Official SIHA CRAFT STUDIO Product Categories Configuration
 * Provides the 8 canonical categories, subcategories, metadata & search/filter mappings.
 */

export const CATEGORIES = [
  {
    id: 'crochet-bags',
    name: 'Crochet Bags',
    slug: 'crochet-bags',
    apiSlug: 'crochet-bags',
    fallbackSlugs: ['crochet-bags', 'crochet-bags-purses', 'bags'],
    description: 'Chic hand-crocheted tote bags, granny square purses, and everyday floral bags.',
    image: '/images/crochet-handbag-display.png',
    subcategories: [
      {
        name: 'All Crochet Bags',
        slug: 'all-crochet-bags',
        query: { category: 'crochet-bags' },
      },
    ],
  },
  {
    id: 'crochet-accessories',
    name: 'Crochet Accessories',
    slug: 'crochet-accessories',
    apiSlug: 'crochet-accessories',
    fallbackSlugs: ['crochet-accessories', 'keychains-small-gifts', 'accessories'],
    description: 'Wearable slow-crafted accents including hair pieces, keychains, and delicate bookmarks.',
    image: '/images/crochet-flower-bouquet.png',
    subcategories: [
      {
        name: 'Scrunchies',
        slug: 'scrunchies',
        query: { category: 'crochet-accessories', search: 'scrunchie' },
      },
      {
        name: 'Headbands',
        slug: 'headbands',
        query: { category: 'crochet-accessories', search: 'headband' },
      },
      {
        name: 'Keychains',
        slug: 'keychains',
        query: { category: 'keychains', search: 'keychain' },
      },
      {
        name: 'Bookmarks',
        slug: 'bookmarks',
        query: { category: 'crochet-accessories', search: 'bookmark' },
      },
    ],
  },
  {
    id: 'crochet-flowers',
    name: 'Crochet Flowers',
    slug: 'crochet-flowers',
    apiSlug: 'crochet-flowers',
    fallbackSlugs: ['crochet-flowers', 'crochet-flowers-bouquets', 'flowers'],
    description: 'Everlasting handmade bouquets, individual stems, and floral centerpieces that never wilt.',
    image: '/images/crochet-flower-bouquet.png',
    subcategories: [
      {
        name: 'Flower Bouquets',
        slug: 'flower-bouquets',
        query: { category: 'crochet-flowers', search: 'bouquet' },
      },
      {
        name: 'Single Flowers',
        slug: 'single-flowers',
        query: { category: 'crochet-flowers', search: 'flower' },
      },
    ],
  },
  {
    id: 'amigurumi-toys',
    name: 'Amigurumi Toys',
    slug: 'amigurumi-toys',
    apiSlug: 'amigurumi-toys',
    fallbackSlugs: ['amigurumi-toys', 'crochet-toys-plushies', 'toys'],
    description: 'Ultra-soft hand-crocheted plushies, gentle animals, and collectible amigurumi companions.',
    image: '/images/teddy-bear-bouquet.png',
    subcategories: [
      {
        name: 'Mini Crochet Toys',
        slug: 'mini-crochet-toys',
        query: { category: 'amigurumi-toys', search: 'mini' },
      },
      {
        name: 'Other Amigurumi Toys',
        slug: 'other-amigurumi-toys',
        query: { category: 'amigurumi-toys' },
      },
    ],
  },
  {
    id: 'home-decor',
    name: 'Home Décor',
    slug: 'home-decor',
    apiSlug: 'home-decor',
    fallbackSlugs: ['home-decor', 'home-decor-coasters', 'decor'],
    description: 'Textured handmade coasters, heirloom table runners, woven baskets, and botanical wall hangings.',
    image: '/images/crochet-workspace.png',
    subcategories: [
      {
        name: 'Coasters',
        slug: 'coasters',
        query: { category: 'home-decor', search: 'coaster' },
      },
      {
        name: 'Table Runners',
        slug: 'table-runners',
        query: { category: 'home-decor', search: 'runner' },
      },
      {
        name: 'Wall Hangings',
        slug: 'wall-hangings',
        query: { category: 'home-decor', search: 'wall' },
      },
      {
        name: 'Baskets',
        slug: 'baskets',
        query: { category: 'home-decor', search: 'basket' },
      },
    ],
  },
  {
    id: 'baby-collection',
    name: 'Baby Collection',
    slug: 'baby-collection',
    apiSlug: 'baby-collection',
    fallbackSlugs: ['baby-collection', 'crochet-toys-plushies', 'baby'],
    description: 'Gentle, hypoallergenic hand-stitched nursery essentials, baby dresses, bonnets, and gift sets.',
    image: '/images/teddy-bear-bouquet.png',
    subcategories: [
      {
        name: 'Baby Dresses',
        slug: 'baby-dresses',
        query: { category: 'baby-collection', search: 'dress' },
      },
      {
        name: 'Baby Caps',
        slug: 'baby-caps',
        query: { category: 'baby-collection', search: 'cap' },
      },
      {
        name: 'Gift Sets',
        slug: 'gift-sets',
        query: { category: 'baby-collection', search: 'gift' },
      },
    ],
  },
  {
    id: 'custom-orders',
    name: 'Custom Orders',
    slug: 'custom-orders',
    isCustom: true,
    link: '/custom-orders',
    description: 'Bespoke made-to-order commissions crafted precisely to your vision and specifications.',
    image: '/images/crochet-workspace.png',
    subcategories: [
      {
        name: 'Made-to-order crochet toys',
        link: '/custom-orders?type=toys',
      },
      {
        name: 'Customized crochet products',
        link: '/custom-orders?type=products',
      },
    ],
  },
  {
    id: 'new-arrivals',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    isNewArrivals: true,
    link: '/shop?sort=newest',
    description: 'Fresh off our hooks: explore the most recent handmade creations in our atelier.',
    image: '/images/crochet-flower-bouquet.png',
    subcategories: [
      {
        name: 'Latest Stitches',
        link: '/shop?sort=newest',
      },
      {
        name: 'Featured Releases',
        link: '/shop?featured=true',
      },
    ],
  },
];

/**
 * Builds the appropriate destination URL for a given category or subcategory
 */
export const getCategoryUrl = (cat, sub = null) => {
  if (sub) {
    if (sub.link) return sub.link;
    if (sub.query) {
      const q = new URLSearchParams(sub.query);
      return `/shop?${q.toString()}`;
    }
  }
  if (cat.link) return cat.link;
  return `/shop?category=${cat.slug}`;
};

export default CATEGORIES;

