export type Brand = 'Hard Yakka' | 'KingGee' | 'NNT';

export interface Product {
  id: string;
  brand: Brand;
  name: string;
  sku: string;
  description: string;
  // Price in cents to avoid floating point rounding issues.
  priceCents: number;
  imageUrl: string;
  colors: string[];
  sizes: string[];
  category: string;
}

// Display order for brand sections in the catalog.
export const BRANDS: Brand[] = ['Hard Yakka', 'KingGee', 'NNT'];

// Real product imagery is served from the Workwear Group Salesforce Commerce
// (Demandware) image CDNs. The URLs below were scraped from the official brand
// sites and verified to return HTTP 200 with an image/jpeg content-type.
const HY_IMG =
  'https://www.hardyakka.com/dw/image/v2/BJCV_PRD/on/demandware.static/-/Sites-wwg-m-hardyakka-catalog/default/images/hi-res';
const KG_IMG =
  'https://www.kinggee.com/dw/image/v2/BJCV_PRD/on/demandware.static/-/Sites-wwg-m-kinggee-catalog/default/images/hi-res';
const NNT_IMG =
  'https://www.nnt.com.au/dw/image/v2/BJCV_PRD/on/demandware.static/-/Sites-wwg-m-nnt-catalog/default/images/hi-res';

const IMG_PARAMS = '?sw=800&sh=800';

export const products: Product[] = [
  // ─── Hard Yakka ──────────────────────────────────────────────────────────
  {
    id: 'hy-y02500-foundations-cargo',
    brand: 'Hard Yakka',
    name: 'Foundations Drill Cargo Pant',
    sku: 'Y02500',
    description:
      "Hard Yakka's hard-working, hard-wearing relaxed fit cotton drill cargo work pants. 290gsm pre-shrunk drill with a bellowed cargo pocket and signature red waistband binding — built to work as hard as the person who wears it.",
    priceCents: 5995,
    imageUrl: `${HY_IMG}/y02500_bla_1.jpg${IMG_PARAMS}`,
    colors: ['Black', 'Navy', 'Khaki', 'Bottle Green'],
    sizes: ['72R', '77R', '82R', '87R', '92R', '97R', '102R', '107R', '112R'],
    category: 'Work Pants',
  },
  {
    id: 'hy-y07984-hivis-shirt',
    brand: 'Hard Yakka',
    name: 'Hi-Vis 2 Tone Closed Front Long Sleeve Shirt',
    sku: 'Y07984',
    description:
      'Get the job done right with the Foundations hi-vis long sleeve cotton drill gusset work shirt. Gusset sleeves give extra movement and a fade shade indicator lets you ensure you stay visible on site.',
    priceCents: 7495,
    imageUrl: `${HY_IMG}/y07984_ona_1.jpg${IMG_PARAMS}`,
    colors: ['Orange / Navy', 'Yellow / Navy'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    category: 'Hi-Vis',
  },
  {
    id: 'hy-y19038-heritage-hoodie',
    brand: 'Hard Yakka',
    name: 'Heritage Hoodie',
    sku: 'Y19038',
    description:
      'A classic Hard Yakka heritage pullover hoodie in soft brushed fleece — off-duty comfort with authentic workwear roots for cooler days on and off the tools.',
    priceCents: 5995,
    imageUrl: `${HY_IMG}/y19038_nav_1.jpg${IMG_PARAMS}`,
    colors: ['Navy', 'Charcoal', 'Forest'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    category: 'Hoodies',
  },
  {
    id: 'hy-y06056-camper-jacket',
    brand: 'Hard Yakka',
    name: 'Heritage Camper Jacket',
    sku: 'Y06056',
    description:
      'A heritage-styled camper jacket built tough for cooler days. Rugged good looks with the durability you expect from Hard Yakka.',
    priceCents: 8995,
    imageUrl: `${HY_IMG}/y06056_mar_1.jpg${IMG_PARAMS}`,
    colors: ['Maroon', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    category: 'Jackets',
  },
  {
    id: 'hy-y06124-canvas-bomber',
    brand: 'Hard Yakka',
    name: 'Heritage Canvas Bomber Jacket',
    sku: 'Y06124',
    description:
      'A rugged canvas bomber jacket with heritage detailing — durable, warm and ready for anything the day throws at it.',
    priceCents: 11995,
    imageUrl: `${HY_IMG}/y06124_for_1.jpg${IMG_PARAMS}`,
    colors: ['Forest', 'Black'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    category: 'Jackets',
  },
  {
    id: 'hy-y11244-hooded-tee',
    brand: 'Hard Yakka',
    name: 'Heritage Long Sleeve Tee With Hood',
    sku: 'Y11244',
    description:
      'A lightweight hooded long sleeve tee for easy layered comfort with a heritage look — great for milder days on site.',
    priceCents: 3995,
    imageUrl: `${HY_IMG}/y11244_cha_1.jpg${IMG_PARAMS}`,
    colors: ['Charcoal', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    category: 'Tees',
  },
  {
    id: 'hy-y02501-drill-pant',
    brand: 'Hard Yakka',
    name: 'Cotton Drill Relaxed Fit Pant',
    sku: 'Y02501',
    description:
      'A hard-wearing relaxed fit cotton drill work pant built for long days on the tools. Pre-shrunk drill, sturdy belt loops and a classic straight leg — an everyday workwear staple.',
    priceCents: 6495,
    imageUrl: `${HY_IMG}/y02501_grn_1.jpg${IMG_PARAMS}`,
    colors: ['Bottle Green', 'Khaki', 'Navy'],
    sizes: ['72R', '77R', '82R', '87R', '92R', '97R', '102R', '107R', '112R'],
    category: 'Work Pants',
  },
  {
    id: 'hy-y02300-vented-cargo',
    brand: 'Hard Yakka',
    name: 'Core Vented Cotton Work Cargo Pant',
    sku: 'Y02300',
    description:
      'Core cotton drill cargo pant with behind-the-knee venting for airflow on hot days. Bellowed cargo pockets and a relaxed fit keep you comfortable and organised on site.',
    priceCents: 4499,
    imageUrl: `${HY_IMG}/y02300_cha_1.jpg${IMG_PARAMS}`,
    colors: ['Charcoal', 'Khaki', 'Navy'],
    sizes: ['72R', '77R', '82R', '87R', '92R', '97R', '102R', '107R', '112R'],
    category: 'Work Pants',
  },
  {
    id: 'hy-y05500-drill-short',
    brand: 'Hard Yakka',
    name: 'Relaxed Fit Mid Weight Cotton Drill Short',
    sku: 'Y05500',
    description:
      'A mid-weight cotton drill work short with a relaxed fit for easy movement in the warmer months. Durable construction with roomy pockets for all the essentials.',
    priceCents: 6495,
    imageUrl: `${HY_IMG}/y05500_bla_1.jpg${IMG_PARAMS}`,
    colors: ['Black', 'Navy'],
    sizes: ['72R', '77R', '82R', '87R', '92R', '97R', '102R', '107R', '112R'],
    category: 'Shorts',
  },
  {
    id: 'hy-y07500-open-front-shirt',
    brand: 'Hard Yakka',
    name: 'Long Sleeve Open Front Cotton Drill Work Shirt',
    sku: 'Y07500',
    description:
      'A classic long sleeve open-front cotton drill work shirt. Tough, breathable and comfortable, with a chest pocket and a fade-resistant finish for daily wear.',
    priceCents: 6495,
    imageUrl: `${HY_IMG}/y07500_grn_1.jpg${IMG_PARAMS}`,
    colors: ['Bottle Green', 'Grey', 'Khaki', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    category: 'Work Shirts',
  },
  {
    id: 'hy-y07530-closed-front-shirt',
    brand: 'Hard Yakka',
    name: 'Long Sleeve Closed Front Cotton Drill Work Shirt',
    sku: 'Y07530',
    description:
      'A long sleeve closed-front cotton drill work shirt that keeps you covered on site. Hard-wearing drill fabric with a secure button placket and chest pockets.',
    priceCents: 6495,
    imageUrl: `${HY_IMG}/y07530_grn_1.jpg${IMG_PARAMS}`,
    colors: ['Bottle Green', 'Khaki', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    category: 'Work Shirts',
  },
  {
    id: 'hy-y19542-fleece-zip-hoodie',
    brand: 'Hard Yakka',
    name: 'Core Fleece Zip Hoodie',
    sku: 'Y19542',
    description:
      'A warm brushed-fleece full-zip hoodie for cold starts and early knock-offs. Soft, comfortable and hard-wearing — a workwear layering essential.',
    priceCents: 8495,
    imageUrl: `${HY_IMG}/y19542_bla_1.jpg${IMG_PARAMS}`,
    colors: ['Black', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    category: 'Hoodies',
  },
  {
    id: 'hy-y19617-hivis-ls-polo',
    brand: 'Hard Yakka',
    name: "Men's Long Sleeve Hi-Vis Polo",
    sku: 'Y19617',
    description:
      'A long sleeve hi-vis polo in breathable moisture-wicking fabric to keep you seen and comfortable all shift. Ribbed collar and a durable, easy-care knit.',
    priceCents: 3495,
    imageUrl: `${HY_IMG}/y19617_ona_1.jpg${IMG_PARAMS}`,
    colors: ['Orange / Navy', 'Yellow / Navy'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    category: 'Hi-Vis',
  },
  {
    id: 'hy-y19616-hivis-ss-polo',
    brand: 'Hard Yakka',
    name: "Men's Short Sleeve Hi-Vis Polo",
    sku: 'Y19616',
    description:
      'A short sleeve hi-vis polo built for hot days on site. Lightweight, breathable and colour-fast, with high-visibility panels for all-day safety.',
    priceCents: 2395,
    imageUrl: `${HY_IMG}/y19616_ona_1.jpg${IMG_PARAMS}`,
    colors: ['Orange / Navy', 'Yellow / Navy'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    category: 'Hi-Vis',
  },
  {
    id: 'hy-y03514-denim-jeans',
    brand: 'Hard Yakka',
    name: 'Heavy Duty Washed Denim Work Jeans',
    sku: 'Y03514',
    description:
      'Rugged heavy-duty washed denim work jeans made to take a beating. A comfortable straight leg with reinforced stress points for genuine on-the-tools durability.',
    priceCents: 8995,
    imageUrl: `${HY_IMG}/y03514_nav_1.jpg${IMG_PARAMS}`,
    colors: ['Indigo'],
    sizes: ['72R', '77R', '82R', '87R', '92R', '97R', '102R', '107R', '112R'],
    category: 'Jeans',
  },
  {
    id: 'hy-y02202-legends-cargo',
    brand: 'Hard Yakka',
    name: 'Legends Cotton Cargo Pant',
    sku: 'Y02202',
    description:
      'The Legends cotton cargo pant is a hard-wearing site favourite. Heavy cotton drill, a relaxed fit and multi-pocket cargo styling for the gear you need close at hand.',
    priceCents: 8995,
    imageUrl: `${HY_IMG}/y02202_bla_1.jpg${IMG_PARAMS}`,
    colors: ['Black', 'Bottle Green', 'Khaki', 'Navy'],
    sizes: ['72R', '77R', '82R', '87R', '92R', '97R', '102R', '107R', '112R'],
    category: 'Work Pants',
  },

  // ─── KingGee ─────────────────────────────────────────────────────────────
  {
    id: 'kg-k14820-workcool2-shirt',
    brand: 'KingGee',
    name: 'Workcool 2 Lightweight Ripstop Long Sleeve Shirt',
    sku: 'K14820',
    description:
      'KingGee Workcool does what it says — keeps you cool while you work. Lightweight 145gsm cotton ripstop with underarm and upper-back cooling vents, a 3-piece collar for sun protection and two secure chest pockets.',
    priceCents: 5995,
    imageUrl: `${KG_IMG}/k14820_kha_1.jpg${IMG_PARAMS}`,
    colors: ['Khaki', 'Navy', 'Charcoal', 'Bottle Green', 'Sky'],
    sizes: ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    category: 'Work Shirts',
  },
  {
    id: 'kg-k13023-workcool-cargo',
    brand: 'KingGee',
    name: 'Workcool Cargo Pant',
    sku: 'K13023',
    description:
      'Using breathable fabric with innovative behind-the-knee venting, these Workcool cargo pants perform in all conditions. Multifunctional pocketing makes them a staple for any work site.',
    priceCents: 6995,
    imageUrl: `${KG_IMG}/k13023_nav_1.jpg${IMG_PARAMS}`,
    colors: ['Navy', 'Khaki'],
    sizes: ['72R', '77R', '82R', '87R', '92R', '97R', '102R', '107R', '112R'],
    category: 'Work Pants',
  },
  {
    id: 'kg-k13026-workcool-pro-cargo',
    brand: 'KingGee',
    name: 'Workcool Pro Stretch Cargo Work Pants',
    sku: 'K13026',
    description:
      'Made from stretch ripstop fabric, the Workcool Pro pants are durable and ultra comfortable. A comfort gel-grip waistband and 9 multifunction pockets let you stay hands-free while on site.',
    priceCents: 8995,
    imageUrl: `${KG_IMG}/k13026_nav_1.jpg${IMG_PARAMS}`,
    colors: ['Navy', 'Khaki'],
    sizes: ['72R', '77R', '82R', '87R', '92R', '97R', '102R', '107R', '112R'],
    category: 'Work Pants',
  },
  {
    id: 'kg-k54936-reflective-drill-shirt',
    brand: 'KingGee',
    name: 'Originals Reflective Spliced Drill Shirt',
    sku: 'K54936',
    description:
      'Part of the new Originals range: a hi-vis reflective spliced drill shirt engineered for durability, comfort and all-day visibility. Performance built for value.',
    priceCents: 6495,
    imageUrl: `${KG_IMG}/k54936_ona_1.jpg${IMG_PARAMS}`,
    colors: ['Orange / Navy', 'Yellow / Navy'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    category: 'Hi-Vis',
  },
  {
    id: 'kg-k55018-hivis-hoodie',
    brand: 'KingGee',
    name: 'Originals Hi-Vis Spliced Full Zip Hoodie',
    sku: 'K55018',
    description:
      'Stay seen and stay warm with the Originals hi-vis spliced full-zip hoodie. Comfort and visibility combined for early starts and cold sites.',
    priceCents: 8995,
    imageUrl: `${KG_IMG}/k55018_ona_1.jpg${IMG_PARAMS}`,
    colors: ['Orange / Navy', 'Yellow / Navy'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    category: 'Hi-Vis',
  },
  {
    id: 'kg-k44249-womens-vented-drill-shirt',
    brand: 'KingGee',
    name: "Women's Originals Vented Drill Shirt",
    sku: 'K44249',
    description:
      "The Women's Originals vented drill shirt combines rugged drill fabric with performance venting for comfort and durability right through the working day.",
    priceCents: 6495,
    imageUrl: `${KG_IMG}/k44249_ora_1.jpg${IMG_PARAMS}`,
    colors: ['Orange', 'Yellow'],
    sizes: ['8', '10', '12', '14', '16', '18', '20', '22', '24'],
    category: "Women's",
  },
  {
    id: 'kg-k13800-workcool1-pant',
    brand: 'KingGee',
    name: 'Workcool 1 Work Pants',
    sku: 'K13800',
    description:
      'The Workcool 1 work pant keeps you cool and comfortable with a lightweight, breathable cotton drill build. A hard-wearing everyday pant for warm-weather work.',
    priceCents: 6995,
    imageUrl: `${KG_IMG}/k13800_bla_1.jpg${IMG_PARAMS}`,
    colors: ['Black', 'Khaki', 'Navy'],
    sizes: ['72R', '77R', '82R', '87R', '92R', '97R', '102R', '107R', '112R'],
    category: 'Work Pants',
  },
  {
    id: 'kg-k13820-workcool2-pant',
    brand: 'KingGee',
    name: 'Workcool 2 Lightweight Ripstop Work Pants',
    sku: 'K13820',
    description:
      'Lightweight 145gsm cotton ripstop work pants with cooling ventilation, engineered to perform through the hottest shifts while staying tough and comfortable.',
    priceCents: 6995,
    imageUrl: `${KG_IMG}/k13820_bla_1.jpg${IMG_PARAMS}`,
    colors: ['Black', 'Charcoal', 'Bottle Green', 'Khaki', 'Navy'],
    sizes: ['72R', '77R', '82R', '87R', '92R', '97R', '102R', '107R', '112R'],
    category: 'Work Pants',
  },
  {
    id: 'kg-k17820-workcool2-short',
    brand: 'KingGee',
    name: 'Workcool 2 Lightweight Ripstop Cargo Work Shorts',
    sku: 'K17820',
    description:
      'The Workcool 2 cargo short brings lightweight ripstop comfort and cooling ventilation to warm-weather work. Multi-pocket cargo styling keeps your essentials handy.',
    priceCents: 5995,
    imageUrl: `${KG_IMG}/k17820_bla_1.jpg${IMG_PARAMS}`,
    colors: ['Black', 'Bottle Green', 'Khaki', 'Navy'],
    sizes: ['72R', '77R', '82R', '87R', '92R', '97R', '102R', '107R', '112R'],
    category: 'Shorts',
  },
  {
    id: 'kg-k14031-workcool-ls-shirt',
    brand: 'KingGee',
    name: 'Workcool Vented Long Sleeve Shirt',
    sku: 'K14031',
    description:
      'A vented long sleeve work shirt that channels airflow where you need it. Lightweight, breathable and sun-smart for all-day comfort on site.',
    priceCents: 5495,
    imageUrl: `${KG_IMG}/k14031_grn_1.jpg${IMG_PARAMS}`,
    colors: ['Bottle Green', 'Khaki', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    category: 'Work Shirts',
  },
  {
    id: 'kg-k14030-workcool-ss-shirt',
    brand: 'KingGee',
    name: 'Workcool Vented Short Sleeve Shirt',
    sku: 'K14030',
    description:
      'The short sleeve Workcool vented shirt keeps you cool through summer with strategic venting and a lightweight, breathable weave. A hot-weather site staple.',
    priceCents: 4995,
    imageUrl: `${KG_IMG}/k14030_grn_1.jpg${IMG_PARAMS}`,
    colors: ['Bottle Green', 'Khaki', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    category: 'Work Shirts',
  },
  {
    id: 'kg-k69789-workcool-ss-polo',
    brand: 'KingGee',
    name: 'Workcool Short Sleeve Polo Shirt',
    sku: 'K69789',
    description:
      'A breathable moisture-wicking Workcool polo built for comfort on and off the tools. Quick-drying knit with a ribbed collar and an easy-care finish.',
    priceCents: 3995,
    imageUrl: `${KG_IMG}/k69789_nav_1.jpg${IMG_PARAMS}`,
    colors: ['Navy'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    category: 'Polos',
  },
  {
    id: 'kg-k03015-originals-drill-pant',
    brand: 'KingGee',
    name: 'Originals Drill Pant',
    sku: 'K03015',
    description:
      'The Originals drill pant is a no-nonsense heavy cotton drill work pant. Durable, comfortable and built to last through the daily grind.',
    priceCents: 5995,
    imageUrl: `${KG_IMG}/k03015_nav_1.jpg${IMG_PARAMS}`,
    colors: ['Navy'],
    sizes: ['72R', '77R', '82R', '87R', '92R', '97R', '102R', '107R', '112R'],
    category: 'Work Pants',
  },
  {
    id: 'kg-k05008-originals-hoodie',
    brand: 'KingGee',
    name: 'Originals Hoodie',
    sku: 'K05008',
    description:
      'A soft brushed-fleece pullover hoodie with classic KingGee styling. Warm and comfortable for cold starts, off-duty wear and everything in between.',
    priceCents: 6995,
    imageUrl: `${KG_IMG}/k05008_bla_1.jpg${IMG_PARAMS}`,
    colors: ['Black'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    category: 'Hoodies',
  },
  {
    id: 'kg-k54934-hivis-closed-front-shirt',
    brand: 'KingGee',
    name: 'Originals Hi-Vis Closed Front Shirt',
    sku: 'K54934',
    description:
      'An Originals hi-vis closed-front drill shirt engineered for durability and all-day visibility. Tough, comfortable and site-ready.',
    priceCents: 6495,
    imageUrl: `${KG_IMG}/k54934_ora_1.jpg${IMG_PARAMS}`,
    colors: ['Orange'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    category: 'Hi-Vis',
  },
  {
    id: 'kg-k54034-hivis-tee',
    brand: 'KingGee',
    name: 'Hi-Vis T-Shirt',
    sku: 'K54034',
    description:
      'A comfortable hi-vis t-shirt in breathable fluoro fabric for everyday visibility. Lightweight and colour-fast with a durable crew neck.',
    priceCents: 1795,
    imageUrl: `${KG_IMG}/k54034_flo_1.jpg${IMG_PARAMS}`,
    colors: ['Fluoro Orange', 'Fluoro Yellow'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    category: 'Hi-Vis',
  },

  // ─── NNT ─────────────────────────────────────────────────────────────────
  {
    id: 'nnt-catuga-endonend-tunic',
    brand: 'NNT',
    name: 'Poly Cotton End On End Short Sleeve Tunic',
    sku: 'CATUGA',
    description:
      'Smart, functional and comfortable, the End on End Short Sleeve Tunic ticks all the boxes — from the neat standing collar to cuffed sleeves with notch detailing, plus handy pockets and an inverted action back pleat for movement.',
    priceCents: 4995,
    imageUrl: `${NNT_IMG}/catuga_nav_1.jpg${IMG_PARAMS}`,
    colors: ['Navy', 'Blue', 'Emerald', 'Copper'],
    sizes: ['6', '8', '10', '12', '14', '16', '18', '20', '22', '24'],
    category: 'Tunics',
  },
  {
    id: 'nnt-cat9r9-pixel-tunic',
    brand: 'NNT',
    name: 'Pixel Print Short Sleeve Tunic',
    sku: 'CAT9R9',
    description:
      'Designed for demanding healthcare environments, our Pixel Print Short Sleeve Tunic keeps you cool and comfortable through the longest shift with ultra-breathable, anti-microbial AeroCool and AeroSilver fabric.',
    priceCents: 5495,
    imageUrl: `${NNT_IMG}/cat9r9_nvl_1.jpg${IMG_PARAMS}`,
    colors: ['Navy', 'Green', 'Blue'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    category: 'Healthcare',
  },
  {
    id: 'nnt-cat9xp-silvi-tunic',
    brand: 'NNT',
    name: 'Silvi Spot Print Short Sleeve Tunic',
    sku: 'CAT9XP',
    description:
      'A fresh spot-print short sleeve tunic that pairs a polished healthcare look with breathable, easy-care performance fabric for all-day comfort.',
    priceCents: 5495,
    imageUrl: `${NNT_IMG}/cat9xp_nvy_1.jpg${IMG_PARAMS}`,
    colors: ['Navy'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    category: 'Healthcare',
  },
  {
    id: 'nnt-catudj-endonend-shirt',
    brand: 'NNT',
    name: 'Poly Cotton End On End Short Sleeve Shirt',
    sku: 'CATUDJ',
    description:
      'This end on end shirting offers a classic style shirt in a comfortable cotton blend, with a modern slimline collar, darts for shaping, short sleeves and a left chest pocket. Easily styled with tailored pants.',
    priceCents: 4995,
    imageUrl: `${NNT_IMG}/catudj_red_1.jpg${IMG_PARAMS}`,
    colors: ['Red', 'Navy', 'White', 'Blue'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    category: 'Corporate',
  },
  {
    id: 'nnt-catq4f-scrub-pant',
    brand: 'NNT',
    name: 'Next-Gen Antibacterial Active Rontgen Scrub Pant',
    sku: 'CATQ4F',
    description:
      'Our bestselling unisex scrub pant, cut from an improved cotton-rich stretch fabric with a Polygiene antibacterial finish for lasting freshness. An elasticised drawcord waist and smart cargo pocketing keep you moving all shift.',
    priceCents: 6995,
    imageUrl: `${NNT_IMG}/catq4f_bla_1.jpg${IMG_PARAMS}`,
    colors: ['Black', 'Charcoal', 'Copper'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    category: 'Scrubs',
  },
  {
    id: 'nnt-catu8h-poplin-shirt',
    brand: 'NNT',
    name: 'Poplin Short Sleeve Shirt',
    sku: 'CATU8H',
    description:
      'A crisp, easy-care poplin short sleeve shirt — a corporate wardrobe staple that stays sharp all day and pairs back with any tailored look.',
    priceCents: 4495,
    imageUrl: `${NNT_IMG}/catu8h_blk_1.jpg${IMG_PARAMS}`,
    colors: ['Black', 'White'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    category: 'Corporate',
  },
  {
    id: 'nnt-catu88-34-sleeve-shirt',
    brand: 'NNT',
    name: '3/4 Sleeve Shirt',
    sku: 'CATU88',
    description:
      'A polished 3/4 sleeve corporate shirt with a flattering shaped fit and easy-care fabric. A versatile wardrobe staple that stays sharp from morning to close.',
    priceCents: 4200,
    imageUrl: `${NNT_IMG}/catu88_blk_1.jpg${IMG_PARAMS}`,
    colors: ['Black', 'White'],
    sizes: ['6', '8', '10', '12', '14', '16', '18', '20', '22', '24'],
    category: 'Corporate',
  },
  {
    id: 'nnt-catu58-polyface-polo',
    brand: 'NNT',
    name: 'Antibacterial Polyface Short Sleeve Polo',
    sku: 'CATU58',
    description:
      'A short sleeve polo with an antibacterial polyface finish for lasting freshness. Breathable, easy-care and comfortable through the longest shift.',
    priceCents: 2995,
    imageUrl: `${NNT_IMG}/catu58_bkp_1.jpg${IMG_PARAMS}`,
    colors: ['Black', 'Navy', 'Red', 'White'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    category: 'Corporate',
  },
  {
    id: 'nnt-catjjx-pique-polo',
    brand: 'NNT',
    name: 'Cotton Pique Polo',
    sku: 'CATJJX',
    description:
      'A classic cotton pique polo with a clean, professional look and a soft, breathable handfeel. Durable and easy to care for, day in and day out.',
    priceCents: 3995,
    imageUrl: `${NNT_IMG}/catjjx_bkp_1.jpg${IMG_PARAMS}`,
    colors: ['Black', 'Midnight'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    category: 'Corporate',
  },
  {
    id: 'nnt-catuy7-invigorate-scrub-top',
    brand: 'NNT',
    name: 'Invigorate Crew Neck Scrub Top',
    sku: 'CATUY7',
    description:
      'The Invigorate crew neck scrub top pairs a modern fit with stretch, breathable fabric for freedom of movement across a busy shift. Practical pockets included.',
    priceCents: 5295,
    imageUrl: `${NNT_IMG}/catuy7_nvb_1.jpg${IMG_PARAMS}`,
    colors: ['Navy'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    category: 'Scrubs',
  },
  {
    id: 'nnt-catq54-invigorate-scrub-pant',
    brand: 'NNT',
    name: 'Invigorate Drew Scrub Pant',
    sku: 'CATQ54',
    description:
      'The Invigorate Drew scrub pant delivers all-shift comfort with a stretch waistband and breathable, easy-care fabric. Smart pocketing keeps essentials close.',
    priceCents: 5995,
    imageUrl: `${NNT_IMG}/catq54_lbl_1.jpg${IMG_PARAMS}`,
    colors: ['Light Blue', 'Navy', 'Pink'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    category: 'Scrubs',
  },
  {
    id: 'nnt-catusy-cotton-ls-shirt',
    brand: 'NNT',
    name: 'Cotton Long Sleeve Shirt',
    sku: 'CATUSY',
    description:
      'A crisp cotton long sleeve business shirt with a tailored fit and a smart standing collar. A sharp, breathable foundation for any corporate wardrobe.',
    priceCents: 6495,
    imageUrl: `${NNT_IMG}/catusy_wht_1.jpg${IMG_PARAMS}`,
    colors: ['White'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    category: 'Corporate',
  },
  {
    id: 'nnt-catuk5-avignon-ss-shirt',
    brand: 'NNT',
    name: 'Avignon Fine Block Stripe Stretch Short Sleeve Shirt',
    sku: 'CATUK5',
    description:
      'The Avignon short sleeve shirt combines a fine block stripe with comfortable stretch fabric for a modern corporate look that moves with you all day.',
    priceCents: 4995,
    imageUrl: `${NNT_IMG}/catuk5_lbs_1.jpg${IMG_PARAMS}`,
    colors: ['Light Blue Stripe'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    category: 'Corporate',
  },
  {
    id: 'nnt-catrfv-nextgen-scrub-top',
    brand: 'NNT',
    name: 'Next-Gen Antibacterial Active Carl Scrub Top',
    sku: 'CATRFV',
    description:
      'The Next-Gen Active Carl scrub top features a Polygiene antibacterial finish and stretch, breathable fabric engineered for demanding healthcare shifts.',
    priceCents: 4595,
    imageUrl: `${NNT_IMG}/catrfv_bla_1.jpg${IMG_PARAMS}`,
    colors: ['Black', 'Charcoal', 'Copper', 'Teal'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    category: 'Scrubs',
  },
  {
    id: 'nnt-cat3ve-nextgen-scrub-pant',
    brand: 'NNT',
    name: 'Next-Gen Antibacterial Active Curie Scrub Pant',
    sku: 'CAT3VE',
    description:
      'The Next-Gen Active Curie scrub pant offers a modern fit with antibacterial, stretch fabric and a drawcord waist for freshness and comfort across a full shift.',
    priceCents: 4995,
    imageUrl: `${NNT_IMG}/cat3ve_bla_1.jpg${IMG_PARAMS}`,
    colors: ['Black', 'Charcoal', 'Copper', 'Teal'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    category: 'Scrubs',
  },
  {
    id: 'nnt-catu68-helix-tunic',
    brand: 'NNT',
    name: 'Helix Dry Zip Front Tunic',
    sku: 'CATU68',
    description:
      'The Helix Dry zip-front tunic keeps you cool and comfortable with moisture-wicking, quick-dry fabric. A neat, professional healthcare look with a practical zip front.',
    priceCents: 4500,
    imageUrl: `${NNT_IMG}/catu68_blk_1.jpg${IMG_PARAMS}`,
    colors: ['Black', 'White'],
    sizes: ['6', '8', '10', '12', '14', '16', '18', '20', '22', '24'],
    category: 'Tunics',
  },
];

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function getProductsByBrand(brand: string): Product[] {
  return products.filter(p => p.brand === brand);
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

// Distinct brand values in first-seen order, derived from the catalog rather
// than a hardcoded list so new brands appear automatically.
export function getBrands(): Brand[] {
  const seen: Brand[] = [];
  for (const p of products) {
    if (!seen.includes(p.brand)) {
      seen.push(p.brand);
    }
  }
  return seen;
}

export interface BrandSummary {
  brand: Brand;
  count: number;
  imageUrl: string;
}

// One summary per brand for the brand picker: style count + a representative
// image taken from the brand's first product.
export function getBrandSummaries(): BrandSummary[] {
  return getBrands().map(brand => {
    const brandProducts = getProductsByBrand(brand);
    return {
      brand,
      count: brandProducts.length,
      imageUrl: brandProducts[0]?.imageUrl ?? '',
    };
  });
}
