const image = (photo, width = 900) =>
  `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=85`;

export const heroImage = image("photo-1529139574466-a303027c1d8b", 2200);

export const featuredCategories = [
  {
    label: "Men",
    eyebrow: "01 / THE MENSWEAR EDIT",
    href: "/shop?gender=men",
    image: image("photo-1515886657613-9f3515b0c78f"),
  },
  {
    label: "Women",
    eyebrow: "02 / THE WOMENSWEAR EDIT",
    href: "/shop?gender=women",
    image: image("photo-1539109136881-3be0616acf4b"),
  },
  {
    label: "Kids",
    eyebrow: "03 / LITTLE EXPRESSIONS",
    href: "/shop?gender=kids",
    image: image("photo-1503919005314-30d93d07d823"),
  },
  {
    label: "New Arrivals",
    eyebrow: "04 / JUST LANDED",
    href: "/shop?sort=newest",
    image: image("photo-1525507119028-ed4c629a60a3"),
  },
  {
    label: "Sale",
    eyebrow: "05 / THE LAST CHANCE EDIT",
    href: "/shop?sale=true",
    image: image("photo-1483985988355-763728e1935b"),
  },
];

export const featuredProducts = [
  {
    id: "demo-1",
    slug: "the-lagos-linen-set",
    name: "The Lagos Linen Set",
    category: "WOMEN",
    price: 78500,
    compareAtPrice: null,
    badge: "NEW",
    image: image("photo-1539109136881-3be0616acf4b"),
    secondaryImage: image("photo-1529139574466-a303027c1d8b"),
    colors: [
      { name: "Terracotta", hex: "#A94F32" },
      { name: "Natural", hex: "#D8C5A5" },
      { name: "Black", hex: "#282523" },
    ],
  },
  {
    id: "demo-2",
    slug: "the-heritage-shirt",
    name: "The Heritage Shirt",
    category: "MEN",
    price: 46500,
    compareAtPrice: null,
    badge: null,
    image: image("photo-1521572163474-6864f9cf17ab"),
    secondaryImage: image("photo-1529139574466-a303027c1d8b"),
    colors: [
      { name: "Ivory", hex: "#F0E7D7" },
      { name: "Olive", hex: "#6F7350" },
      { name: "Ink", hex: "#282523" },
    ],
  },
  {
    id: "demo-3",
    slug: "the-sunday-co-ord",
    name: "The Sunday Co-ord",
    category: "WOMEN",
    price: 62000,
    compareAtPrice: 76000,
    badge: "SALE",
    image: image("photo-1515886657613-9f3515b0c78f"),
    secondaryImage: image("photo-1539109136881-3be0616acf4b"),
    colors: [
      { name: "Rust", hex: "#A94F32" },
      { name: "Cream", hex: "#EADFCF" },
    ],
  },
  {
    id: "demo-4",
    slug: "the-everyday-tee",
    name: "The Everyday Tee",
    category: "UNISEX",
    price: 18500,
    compareAtPrice: null,
    badge: "NEW",
    image: image("photo-1521572163474-6864f9cf17ab"),
    secondaryImage: image("photo-1503341504253-dff4815485f1"),
    colors: [
      { name: "White", hex: "#F8F6F0" },
      { name: "Brown", hex: "#654735" },
      { name: "Black", hex: "#262626" },
    ],
  },
];

export const lookbookImages = [
  {
    image: image("photo-1539109136881-3be0616acf4b"),
    alt: "Editorial fashion look in warm neutral tones",
    className: "lookbook-tall",
  },
  {
    image: image("photo-1529139574466-a303027c1d8b"),
    alt: "Contemporary fashion styling",
    className: "",
  },
  {
    image: image("photo-1515886657613-9f3515b0c78f"),
    alt: "Editorial portrait in a statement outfit",
    className: "",
  },
  {
    image: image("photo-1483985988355-763728e1935b"),
    alt: "Fashion shopping and styling inspiration",
    className: "lookbook-wide",
  },
];