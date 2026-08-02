import type { Product, ProductCategory } from "@/types/product";

export const products: Product[] = [
  {
    id: "1",
    slug: "samsung-rb34-muzlatgich",
    name: "Samsung RB34 No Frost muzlatgich",
    description:
      "334 litrli No Frost muzlatgich. Energiya samaradorligi A++, keng javonlar va tez muzlatish rejimi. Oila uchun ideal.",
    price: 8_450_000,
    compareAtPrice: 9_200_000,
    category: "appliances",
    brand: "Samsung",
    images: [
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=1200&q=80",
      "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=1200&q=80",
    ],
    specs: [
      { label: "Hajm", value: "334 L" },
      { label: "Energiya", value: "A++" },
      { label: "Muzlatgich", value: "No Frost" },
      { label: "Rang", value: "Inox" },
    ],
    featured: true,
    inStock: true,
  },
  {
    id: "2",
    slug: "lg-f4v5vyp0w-kir-yuvish",
    name: "LG F4V5VYP0W kir yuvish mashinasi",
    description:
      "9 kg yuklama, AI DD texnologiyasi va bug' bilan chuqur tozalash. Jim ishlaydi, matolarni himoya qiladi.",
    price: 6_890_000,
    compareAtPrice: 7_500_000,
    category: "appliances",
    brand: "LG",
    images: [
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=1200&q=80",
      "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=1200&q=80",
    ],
    specs: [
      { label: "Yuklama", value: "9 kg" },
      { label: "Aylanish", value: "1400 rpm" },
      { label: "Texnologiya", value: "AI DD" },
      { label: "Energiya", value: "A+++" },
    ],
    featured: true,
    inStock: true,
  },
  {
    id: "3",
    slug: "bosch-serie-6-idish-yuvish",
    name: "Bosch Serie 6 idish yuvish mashinasi",
    description:
      "14 komplekt sig'im, SilencePlus va EfficientDry. Oshxonangizda jim va tejamkor ishlaydi.",
    price: 7_200_000,
    category: "appliances",
    brand: "Bosch",
    images: [
      "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=1200&q=80",
      "https://images.unsplash.com/photo-1556911073-a517e752729c?w=1200&q=80",
    ],
    specs: [
      { label: "Sig'im", value: "14 komplekt" },
      { label: "Shovqin", value: "42 dB" },
      { label: "Dasturlar", value: "6" },
      { label: "Quritish", value: "EfficientDry" },
    ],
    featured: true,
    inStock: true,
  },
  {
    id: "4",
    slug: "philips-hr3655-blender",
    name: "Philips Avance blender HR3655",
    description:
      "1400 Vt quvvat, ProBlend 6 pichoq tizimi. Smuti, sho'rva va muzni oson maydalaydi.",
    price: 1_890_000,
    compareAtPrice: 2_150_000,
    category: "appliances",
    brand: "Philips",
    images: [
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=1200&q=80",
      "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=1200&q=80",
    ],
    specs: [
      { label: "Quvvat", value: "1400 Vt" },
      { label: "Idish", value: "2 L shisha" },
      { label: "Tezlik", value: "3 + pulse" },
      { label: "Material", value: "Titan pichoq" },
    ],
    featured: true,
    inStock: true,
  },
  {
    id: "5",
    slug: "tefal-express-toster",
    name: "Tefal Express toster",
    description:
      "2 bo'limli toster, 7 qovurish darajasi va avtomatik chiqarish. Nonni bir tekis qovuradi.",
    price: 420_000,
    category: "appliances",
    brand: "Tefal",
    images: [
      "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&q=80",
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=1200&q=80",
    ],
    specs: [
      { label: "Bo'limlar", value: "2" },
      { label: "Quvvat", value: "850 Vt" },
      { label: "Darajalar", value: "7" },
      { label: "Funksiya", value: "Defrost / Reheat" },
    ],
    inStock: true,
  },
  {
    id: "6",
    slug: "dyson-v15-changyutgich",
    name: "Dyson V15 Detect changyutgich",
    description:
      "Lazerli ifloslik aniqlash, kuchli suctsion va 60 daqiqagacha ishlash. Uy tozaligini yangi darajaga olib chiqadi.",
    price: 9_900_000,
    category: "appliances",
    brand: "Dyson",
    images: [
      "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=1200&q=80",
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1200&q=80",
    ],
    specs: [
      { label: "Ishlash", value: "60 daqiqa" },
      { label: "Filtr", value: "HEPA" },
      { label: "Og'irlik", value: "3.1 kg" },
      { label: "Rejimlar", value: "3" },
    ],
    featured: true,
    inStock: true,
  },
  {
    id: "7",
    slug: "tefal-ingenio-qozon-toplami",
    name: "Tefal Ingenio qozon to'plami (10 qism)",
    description:
      "Olinadigan tutqichli antiyopishqoq qozonlar. Pechga va induksiyaga mos, oson saqlanadi.",
    price: 2_450_000,
    compareAtPrice: 2_890_000,
    category: "cookware",
    brand: "Tefal",
    images: [
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80",
      "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=1200&q=80",
    ],
    specs: [
      { label: "Qismlar", value: "10" },
      { label: "Qoplama", value: "Titanium" },
      { label: "Induksiya", value: "Ha" },
      { label: "Pech", value: "250°C gacha" },
    ],
    featured: true,
    inStock: true,
  },
  {
    id: "8",
    slug: "le-creuset-cho'yan-qozon",
    name: "Le Creuset cho'yan qozon 5.3 L",
    description:
      "Emalli cho'yan qozon — go'sht, sho'rva va non uchun. Issiqlikni uzoq ushlaydi, umrboqiy sifat.",
    price: 4_800_000,
    category: "cookware",
    brand: "Le Creuset",
    images: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
    ],
    specs: [
      { label: "Hajm", value: "5.3 L" },
      { label: "Material", value: "Cho'yan + emal" },
      { label: "Induksiya", value: "Ha" },
      { label: "Kafolat", value: "Umrbod" },
    ],
    featured: true,
    inStock: true,
  },
  {
    id: "9",
    slug: "wmf-inox-skovorodka",
    name: "WMF Durado inox skovorodka 28 cm",
    description:
      "Nerjaveyka taglik, teng issiqlik tarqalishi. Induksiya, gaz va elektr plitalarga mos.",
    price: 980_000,
    category: "cookware",
    brand: "WMF",
    images: [
      "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=1200&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200&q=80",
    ],
    specs: [
      { label: "Diametr", value: "28 cm" },
      { label: "Material", value: "Cromargan inox" },
      { label: "Qopqoq", value: "Shisha" },
      { label: "Induksiya", value: "Ha" },
    ],
    inStock: true,
  },
  {
    id: "10",
    slug: "pyrex-shisha-idish-toplami",
    name: "Pyrex shisha pishirish idishlari (5 dona)",
    description:
      "Issiqqa chidamli shisha idishlar. Pech, mikroto'lqinli pech va muzlatgichga mos.",
    price: 650_000,
    category: "cookware",
    brand: "Pyrex",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
      "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=1200&q=80",
    ],
    specs: [
      { label: "Dona", value: "5" },
      { label: "Material", value: "Borosilikat shisha" },
      { label: "Temp.", value: "-40°C … 300°C" },
      { label: "Qopqoq", value: "Plastik" },
    ],
    inStock: true,
  },
  {
    id: "11",
    slug: "ikea-365-idish-tovoq",
    name: "IKEA 365+ idish-tovoq to'plami (18 qism)",
    description:
      "Kundalik foydalanish uchun mustahkam chinni to'plam. Minimal dizayn, oson yuviladi.",
    price: 1_120_000,
    compareAtPrice: 1_350_000,
    category: "tableware",
    brand: "IKEA",
    images: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=1200&q=80",
    ],
    specs: [
      { label: "Qismlar", value: "18" },
      { label: "Material", value: "Chinni" },
      { label: "Mikroto'lqin", value: "Ha" },
      { label: "Idish yuvish", value: "Ha" },
    ],
    featured: true,
    inStock: true,
  },
  {
    id: "12",
    slug: "villeroy-boch-ovqat-servizi",
    name: "Villeroy & Boch ovqat servizi (12 kishi)",
    description:
      "Premium chinni servizi — mehmon kutish va bayram dasturxonlari uchun. Zarif oq sir.",
    price: 5_600_000,
    category: "tableware",
    brand: "Villeroy & Boch",
    images: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&q=80",
      "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=1200&q=80",
    ],
    specs: [
      { label: "Kishi", value: "12" },
      { label: "Material", value: "Premium chinni" },
      { label: "Rang", value: "Oq" },
      { label: "Kafolat", value: "2 yil" },
    ],
    featured: true,
    inStock: true,
  },
  {
    id: "13",
    slug: "bodum-pavina-stakan",
    name: "Bodum Pavina stakan to'plami (6 dona)",
    description:
      "Ikki qavatli shisha stakanlar — issiq va sovuq ichimliklar uchun. Qo'l kuyib ketmaydi.",
    price: 480_000,
    category: "tableware",
    brand: "Bodum",
    images: [
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=1200&q=80",
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1200&q=80",
    ],
    specs: [
      { label: "Dona", value: "6" },
      { label: "Hajm", value: "350 ml" },
      { label: "Material", value: "Borosilikat" },
      { label: "Idish yuvish", value: "Ha" },
    ],
    inStock: true,
  },
  {
    id: "14",
    slug: "joseph-joseph-oshxona-anjomlari",
    name: "Joseph Joseph Nest oshxona anjomlari",
    description:
      "Kompakt saqlanadigan o'lchagich, elak va idishlar to'plami. Kichik oshxonalar uchun qulay.",
    price: 720_000,
    category: "tableware",
    brand: "Joseph Joseph",
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=1200&q=80",
    ],
    specs: [
      { label: "Qismlar", value: "9" },
      { label: "Material", value: "BPA-free plastik" },
      { label: "Rang", value: "Ko'k gradient" },
      { label: "Saqlash", value: "Nest dizayn" },
    ],
    inStock: true,
  },
  {
    id: "15",
    slug: "delonghi-magnifica-kofe",
    name: "De'Longhi Magnifica S kofe mashinasi",
    description:
      "Avtomatik espresso mashinasi — donadan tayyor kofe. Sutli ko'pik va sozlanuvchi maydalash.",
    price: 5_250_000,
    compareAtPrice: 5_900_000,
    category: "appliances",
    brand: "De'Longhi",
    images: [
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=1200&q=80",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80",
    ],
    specs: [
      { label: "Bosim", value: "15 bar" },
      { label: "Suvidon", value: "1.8 L" },
      { label: "Maydalash", value: "13 daraja" },
      { label: "Sutli ko'pik", value: "Ha" },
    ],
    featured: true,
    inStock: true,
  },
  {
    id: "16",
    slug: "zwilling-pichoq-toplami",
    name: "Zwilling Profession pichoq to'plami",
    description:
      "Nemis po'latidan 7 qismli pichoq to'plami + yog'och blok. Oshpazlar uchun aniq kesish.",
    price: 3_150_000,
    category: "cookware",
    brand: "Zwilling",
    images: [
      "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=1200&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1200&q=80",
    ],
    specs: [
      { label: "Qismlar", value: "7 + blok" },
      { label: "Po'lat", value: "Friodur" },
      { label: "Qattiqlik", value: "57 HRC" },
      { label: "Yuvish", value: "Qo'lda tavsiya" },
    ],
    inStock: true,
  },
];

export function getAllProducts(): Product[] {
  return getCatalogProducts();
}

export function getProductBySlug(slug: string): Product | undefined {
  return getCatalogProducts().find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getProductsByCategory(
  category?: ProductCategory | "all",
): Product[] {
  if (!category || category === "all") return products;
  return products.filter((p) => p.category === category);
}

export function filterProducts(options: {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  inStock?: boolean;
}): Product[] {
  let result = [...getCatalogProducts()];

  if (options.category && options.category !== "all") {
    result = result.filter((p) => p.category === options.category);
  }

  if (options.brand && options.brand !== "all") {
    result = result.filter(
      (p) => p.brand.toLowerCase() === options.brand!.toLowerCase(),
    );
  }

  if (typeof options.minPrice === "number") {
    result = result.filter((p) => p.price >= options.minPrice!);
  }

  if (typeof options.maxPrice === "number") {
    result = result.filter((p) => p.price <= options.maxPrice!);
  }

  if (options.inStock) {
    result = result.filter((p) => p.inStock);
  }

  if (options.q?.trim()) {
    const q = options.q.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }

  return result;
}

/** Expand catalog for pagination demos while keeping unique slugs. */
export function getCatalogProducts(): Product[] {
  const target = 48;
  if (products.length >= target) return products;

  const expanded: Product[] = [...products];
  let n = 1;
  while (expanded.length < target) {
    const src = products[(expanded.length - products.length) % products.length];
    n = Math.floor((expanded.length - products.length) / products.length) + 2;
    expanded.push({
      ...src,
      id: `${src.id}-x${n}-${expanded.length}`,
      slug: `${src.slug}-x${n}-${expanded.length}`,
      name: `${src.name}`,
      price: src.price + (expanded.length % 7) * 75_000,
      compareAtPrice: src.compareAtPrice
        ? src.compareAtPrice + (expanded.length % 5) * 50_000
        : undefined,
      featured: false,
      inStock: expanded.length % 9 !== 0,
    });
  }
  return expanded;
}

export function getBrands(): string[] {
  return [...new Set(getCatalogProducts().map((p) => p.brand))].sort();
}

export function getRelatedProducts(
  product: Product,
  limit = 4,
): Product[] {
  return getCatalogProducts()
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}
