import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="bg-[#F7F0E6] text-[#211B18]">
      <section className="relative flex min-h-[65vh] items-end overflow-hidden bg-[#4A382D] text-white">
        <img
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=2000&q=85"
          alt="Contemporary fashion editorial"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />

        <div className="relative mx-auto w-full max-w-[1600px] px-5 pb-16 pt-32 sm:px-8 sm:pb-24 lg:px-12">
          <p className="mb-5 text-[10px] uppercase tracking-[0.23em] text-[#E7C99A]">
            The story of Vestirhaus
          </p>

          <h1 className="max-w-3xl font-serif text-6xl leading-[0.95] tracking-[-0.06em] sm:text-8xl">
            More than
            <br />
            what we wear.
          </h1>

          <p className="mt-6 max-w-lg text-sm leading-7 text-white/80">
            A celebration of identity, creativity, and the stories we carry
            into everything we wear.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] items-center gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-20 lg:px-12">
        <div>
          <p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-[#A94F32]">
            Our philosophy
          </p>

          <h2 className="font-serif text-4xl leading-[1.06] tracking-[-0.05em] sm:text-6xl">
            Rooted in culture,
            <br />
            <span className="italic text-[#A94F32]">
              crafted for today.
            </span>
          </h2>

          <div className="mt-7 space-y-5 text-sm leading-7 text-[#766B63]">
            <p>
              Vestirhaus is built around the belief that clothing can be
              personal. It can express where we come from, what inspires us,
              and how we choose to show up in the world.
            </p>

            <p>
              Our creative direction draws inspiration from African
              expression and contemporary everyday living. We bring those
              influences into a wardrobe intended to feel thoughtful,
              versatile, and distinctly individual.
            </p>

            <p>
              We believe style should make room for everyone. Our vision
              includes clothing for men, women, children, and people who
              simply wear what feels right to them.
            </p>
          </div>
        </div>

        <div className="aspect-[4/5] overflow-hidden bg-[#E6DACC]">
          <img
            src="https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1300&q=85"
            alt="Fashion editorial representing the Vestirhaus design direction"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="bg-[#211B18] px-5 py-16 text-center text-[#F7F0E6] sm:px-8 sm:py-24">
        <p className="mb-5 text-[10px] uppercase tracking-[0.23em] text-[#D6AF72]">
          The Vestirhaus point of view
        </p>

        <h2 className="mx-auto max-w-4xl font-serif text-4xl leading-tight tracking-[-0.05em] sm:text-6xl">
          Wear what moves you.
          <br />
          Carry what inspires you.
        </h2>

        <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-white/60">
          We are creating a space where heritage and modern expression
          belong in the same wardrobe.
        </p>

        <Link
          to="/shop"
          className="mt-9 inline-flex min-h-12 items-center gap-3 bg-[#F7F0E6] px-6 text-xs font-medium uppercase tracking-[0.12em] text-[#211B18] transition hover:bg-[#D6AF72]"
        >
          Explore the collection <ArrowRight size={15} />
        </Link>
      </section>
    </main>
  );
}