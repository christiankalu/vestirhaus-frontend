import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { featuredCategories } from "@/data/homepage";

export default function CollectionsPage() {
  const collections = featuredCategories.filter(
    (item) =>
      ["Men", "Women", "Kids"].includes(item.label),
  );

  const unisex = {
    label: "Unisex",
    eyebrow: "EXPRESS YOURSELF",
    href: "/shop/unisex",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85",
  };

  const allCollections = [...collections, unisex];

  return (
    <main className="min-h-screen bg-[#F7F0E6] text-[#211B18]">
      <section className="mx-auto max-w-[1600px] px-5 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-24 lg:px-12">
        <p className="mb-4 text-[10px] uppercase tracking-[0.23em] text-[#A94F32]">
          Find your expression
        </p>

        <h1 className="max-w-3xl font-serif text-5xl leading-[0.98] tracking-[-0.06em] sm:text-7xl">
          Collections for
          <br />
          <span className="italic text-[#A94F32]">every expression.</span>
        </h1>

        <p className="mt-6 max-w-xl text-sm leading-7 text-[#766B63]">
          Explore the Vestirhaus wardrobe, from everyday essentials to
          pieces that make a statement. Find the edit that feels like you.
        </p>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 pb-20 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {allCollections.map((collection, index) => (
            <Link
              key={collection.label}
              to={collection.href}
              className="group relative aspect-[3/4] overflow-hidden bg-[#E5D9CB]"
            >
              <img
                src={collection.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

              <div className="absolute inset-x-5 bottom-5 text-white">
                <p className="mb-2 text-[9px] tracking-[0.2em] text-white/75">
                  0{index + 1} / {collection.eyebrow}
                </p>

                <div className="flex items-end justify-between gap-3">
                  <h2 className="font-serif text-3xl">
                    {collection.label}
                  </h2>
                  <span className="grid size-10 place-items-center rounded-full border border-white/65 transition group-hover:bg-white group-hover:text-[#211B18]">
                    <ArrowRight size={17} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-5 border-t border-[#211B18]/10 pt-9 sm:flex-row sm:items-center">
          <div>
            <p className="font-serif text-3xl">A wardrobe without limits.</p>
            <p className="mt-2 text-sm text-[#766B63]">
              Explore pieces designed to move with you.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex min-h-12 items-center gap-3 bg-[#211B18] px-6 text-xs font-medium uppercase tracking-[0.12em] text-white transition hover:bg-[#A94F32]"
          >
            Shop everything <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  );
}