import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const articles = [
  {
    slug: "style-as-self-expression",
    category: "STYLE & IDENTITY",
    title: "Style as a form of self-expression",
    excerpt:
      "What we wear can tell stories that words sometimes cannot. Explore the connection between clothing, individuality, and identity.",
    date: "EDITORIAL",
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1100&q=85",
  },
  {
    slug: "building-an-everyday-wardrobe",
    category: "THE WARDROBE",
    title: "Building an everyday wardrobe with intention",
    excerpt:
      "A considered wardrobe is less about having more and more about choosing pieces that work together and feel like you.",
    date: "STYLE NOTES",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1100&q=85",
  },
  {
    slug: "the-beauty-of-african-inspiration",
    category: "CULTURE",
    title: "The beauty of African inspiration in modern style",
    excerpt:
      "A look at the creativity, visual language, and inspiration that continue to shape contemporary African fashion.",
    date: "CULTURE NOTES",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1100&q=85",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#F7F0E6] text-[#211B18]">
      <section className="mx-auto max-w-[1500px] px-5 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-24 lg:px-12">
        <p className="mb-4 text-[10px] uppercase tracking-[0.23em] text-[#A94F32]">
          The Vestirhaus journal
        </p>

        <h1 className="font-serif text-6xl tracking-[-0.06em] sm:text-8xl">
          Stories to wear.
        </h1>

        <p className="mt-6 max-w-xl text-sm leading-7 text-[#766B63]">
          Ideas, perspectives, and inspiration from the world of fashion,
          culture, and everyday expression.
        </p>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 pb-20 sm:px-8 lg:px-12">
        <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <article key={article.slug} className="group">
              <Link
                to={`/blog/${article.slug}`}
                className="block aspect-[4/5] overflow-hidden bg-[#E6DACC]"
              >
                <img
                  src={article.image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </Link>

              <div className="pt-5">
                <div className="flex items-center justify-between gap-3 text-[9px] uppercase tracking-[0.17em] text-[#A94F32]">
                  <span>{article.category}</span>
                  <span className="text-[#8B7D72]">{article.date}</span>
                </div>

                <h2 className="mt-4 font-serif text-2xl leading-tight sm:text-3xl">
                  <Link
                    to={`/blog/${article.slug}`}
                    className="transition hover:text-[#A94F32]"
                  >
                    {article.title}
                  </Link>
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#766B63]">
                  {article.excerpt}
                </p>

                <Link
                  to={`/blog/${article.slug}`}
                  className="mt-5 inline-flex items-center gap-2 text-xs font-medium"
                >
                  Read article
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}