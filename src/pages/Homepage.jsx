
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="pattern-adire">
      <div className="container-editorial grid min-h-[560px] items-center gap-12 py-16 md:grid-cols-2 md:py-24">
        <div className="max-w-xl">
          <p className="eyebrow mb-6 text-brand-terracotta">
            The new African wardrobe
          </p>

          <h1 className="text-5xl leading-[1.08] tracking-tight sm:text-7xl">
            Rooted in culture.
            <span className="mt-2 block text-brand-terracotta">
              Made for now.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-brand-muted">
            Discover contemporary African-inspired fashion for every
            expression, every occasion and every generation.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="rounded-none bg-brand-terracotta px-7 hover:bg-brand-sienna">
              <Link to="/shop">Explore the collection</Link>
            </Button>

            <Button asChild variant="outline" className="rounded-none border-brand-ink/30 px-7">
              <Link to="/categories/women">Discover the edit</Link>
            </Button>
          </div>

          <p className="mt-8 text-xs tracking-wide text-brand-muted">
            MEN · WOMEN · KIDS · UNISEX
          </p>
        </div>

        <div className="relative hidden min-h-[400px] overflow-hidden bg-brand-cream md:block">
          <div className="absolute inset-4 border border-brand-gold/60" />
          <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
            <div>
              <p className="eyebrow text-brand-terracotta">Vestirhaus</p>
              <p className="mt-4 font-heading text-4xl leading-tight">
                Heritage in every thread.
              </p>
              <p className="mt-4 text-sm text-brand-muted">
                A new perspective on African style.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
