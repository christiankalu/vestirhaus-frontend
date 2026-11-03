import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  MoveRight,
} from "lucide-react";

import ProductCard from "@/components/products/ProductCard";
import {
  featuredCategories,
  featuredProducts,
  heroImage,
  lookbookImages,
} from "@/data/homepage";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  function handleNewsletterSubmit(event) {
    event.preventDefault();

    if (!email.trim()) return;

    // UI preview only. Connect this handler to your newsletter endpoint
    // before launch; do not tell visitors they have subscribed yet.
    setNewsletterMessage(
      "The signup interface is ready. Connect your newsletter service to complete registration.",
    );
  }

  return (
    <div className="overflow-hidden bg-[#F7F0E6] text-[#211B18]">
      {/* 1. HERO */}
      <section className="relative flex min-h-[calc(100svh-74px)] items-end overflow-hidden bg-[#4A382D] text-white">
        <img
          src={heroImage}
          alt="Contemporary fashion editorial"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />

        <div className="relative mx-auto w-full max-w-[1600px] px-5 pb-24 pt-28 sm:px-8 sm:pb-32 lg:px-12 lg:pb-36">
          <div className="hero-copy max-w-4xl">
            <p className="mb-6 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.26em] text-white/80 sm:text-xs">
              <span className="h-px w-8 bg-[#D6AF72]" />
              Contemporary African expression
            </p>

            <h1 className="max-w-4xl font-serif text-[clamp(3.6rem,9vw,8.5rem)] leading-[0.91] tracking-[-0.065em]">
              Wear your
              <br />
              <span className="font-normal italic text-[#E7C99A]">
                roots.
              </span>
            </h1>

            <p className="mt-7 max-w-md text-sm leading-7 text-white/80 sm:text-base">
              Thoughtful pieces inspired by where we come from and made for
              every version of who we are becoming.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/shop?gender=men"
                className="vh-button vh-button--light"
              >
                Shop Men
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/shop?gender=women"
                className="group inline-flex min-h-12 items-center justify-center gap-6 border border-white/65 px-6 text-xs font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Shop Women
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>

        <a
          href="#featured-categories"
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[9px] uppercase tracking-[0.23em] text-white/75"
        >
          Discover
          <ArrowDown size={15} className="scroll-indicator" />
        </a>

        <p className="absolute bottom-8 right-5 hidden text-[9px] uppercase tracking-[0.2em] text-white/65 sm:block lg:right-12">
          EST. IN NIGERIA
        </p>
      </section>

      {/* BRAND PROMISE STRIP */}
      <section className="border-b border-[#211B18]/10 bg-[#F7F0E6]">
        <div className="mx-auto grid max-w-[1600px] gap-3 px-5 py-5 text-center text-[9px] uppercase tracking-[0.17em] text-[#766B63] sm:grid-cols-3 sm:px-8 sm:py-6 sm:text-[10px]">
          <p>Considered design</p>
          <p>Inspired by heritage</p>
          <p>Made for everyday expression</p>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES */}
      <section
        id="featured-categories"
        className="scroll-mt-24 py-16 sm:py-20 lg:py-28"
      >
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
          <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
            <div>
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[#A94F32]">
                Find your expression
              </p>
              <h2 className="font-serif text-4xl tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                Shop by edit.
              </h2>
            </div>

            <Link
              to="/shop"
              className="mb-1 hidden items-center gap-2 text-xs font-medium transition hover:text-[#A94F32] sm:inline-flex"
            >
              Explore all <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-5 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0">
            {featuredCategories.map((category, index) => (
              <Link
                key={category.label}
                to={category.href}
                className="group relative aspect-[3/4] w-[68vw] max-w-[285px] shrink-0 snap-start overflow-hidden bg-[#D9CABC] sm:w-auto sm:max-w-none"
              >
                <img
                  src={category.image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <span className="absolute left-4 top-4 text-[9px] tracking-[0.16em] text-white/80">
                  0{index + 1}
                </span>

                <div className="absolute inset-x-4 bottom-5 flex items-end justify-between gap-2 text-white">
                  <div>
                    <p className="mb-2 text-[8px] tracking-[0.16em] text-white/75">
                      {category.eyebrow}
                    </p>
                    <h3 className="font-serif text-2xl leading-none sm:text-xl lg:text-2xl">
                      {category.label}
                    </h3>
                  </div>

                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/60 transition group-hover:border-white group-hover:bg-white group-hover:text-[#211B18]">
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <Link
            to="/shop"
            className="mt-5 inline-flex items-center gap-2 text-xs font-medium sm:hidden"
          >
            Explore all categories <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="bg-[#F0E8DC] py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
          <div className="mb-9 flex items-end justify-between gap-5 sm:mb-12">
            <div>
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[#A94F32]">
                Made to be lived in
              </p>
              <h2 className="font-serif text-4xl tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                In the spotlight.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#766B63]">
                Everyday staples and statement pieces, brought together with
                intention.
              </p>
            </div>

            <Link
              to="/shop"
              className="group mb-1 hidden shrink-0 items-center gap-2 text-xs font-medium sm:inline-flex"
            >
              Shop all
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 text-center sm:hidden">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 border-b border-[#211B18] pb-2 text-xs font-medium"
            >
              Explore the collection <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. BRAND STORY */}
      <section
        id="our-story"
        className="scroll-mt-24 py-16 sm:py-24 lg:py-32"
      >
        <div className="mx-auto grid max-w-[1600px] items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-12">
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden bg-[#E1D2C0]">
              <img
                src="https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1400&q=85"
                alt="Fashion editorial representing considered design"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="pattern-adire absolute -bottom-5 -right-3 grid aspect-square w-[32%] place-items-center border-4 border-[#F7F0E6] bg-[#A94F32] p-3 text-center text-[9px] font-medium uppercase tracking-[0.18em] text-white sm:-right-5 sm:w-[28%]">
              Culture
              <span className="font-serif text-2xl italic">in every thread.</span>
            </div>
          </div>

          <div className="py-5 lg:py-10">
            <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.23em] text-[#A94F32]">
              A little about us
            </p>

            <h2 className="max-w-xl font-serif text-[clamp(2.8rem,5vw,5rem)] leading-[1.04] tracking-[-0.06em]">
              Rooted in culture,
              <br />
              <span className="italic text-[#A94F32]">crafted for today.</span>
            </h2>

            <div className="mt-7 max-w-lg space-y-4 text-sm leading-7 text-[#766B63]">
              <p>
                What we wear can hold a memory, tell a story, and make space
                for the person we are becoming. Vestirhaus brings that idea
                into a wardrobe designed for real life.
              </p>
              <p>
                Inspired by African creativity and shaped by contemporary
                living, we celebrate pieces that feel personal rather than
                disposable — expressive, thoughtful, and made to be worn your
                way.
              </p>
            </div>

            <Link
              to="/#our-story"
              className="group mt-8 inline-flex items-center gap-4 border-b border-[#211B18] pb-3 text-xs font-medium"
            >
              Discover our story
              <MoveRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <p className="mt-12 font-serif text-2xl italic text-[#A94F32] sm:text-3xl">
              “Wear what moves you.”
            </p>
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL LOOKBOOK */}
      <section
        id="lookbook"
        className="scroll-mt-24 bg-[#E8DDCE] py-16 sm:py-20 lg:py-28"
      >
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
          <div className="mb-9 flex flex-col justify-between gap-5 sm:mb-12 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[#A94F32]">
                The Vestirhaus perspective
              </p>
              <h2 className="font-serif text-4xl tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                Worn your way.
              </h2>
            </div>

            <p className="max-w-xs text-sm leading-6 text-[#766B63]">
              Pieces, people, and the little details that make a style your
              own.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {lookbookImages.map((item, index) => (
              <a
                key={item.alt}
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                className={[
                  "group relative block overflow-hidden bg-[#D0BFAE]",
                  index === 0
                    ? "aspect-[3/4] sm:row-span-2 sm:aspect-auto"
                    : index === 3
                      ? "col-span-2 aspect-[16/8] sm:col-span-1 sm:aspect-[3/4]"
                      : "aspect-[3/4]",
                ].join(" ")}
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70 transition group-hover:opacity-100" />

                <span className="absolute bottom-3 left-3 flex items-center gap-2 text-[10px] tracking-[0.12em] text-white sm:bottom-4 sm:left-4">
                  <span className="grid size-7 place-items-center rounded-full border border-white/70">
                    <ArrowUpRight size={13} />
                  </span>
                  <span className="hidden sm:inline">THE LOOKBOOK</span>
                </span>
              </a>
            ))}
          </div>

          <p className="mt-6 text-center text-[10px] tracking-[0.1em] text-[#766B63]">
            FOLLOW THE STORY · SOCIAL LINKS TO BE UPDATED WITH VESTIRHAUS ACCOUNTS
          </p>
        </div>
      </section>

      {/* 6. NEWSLETTER */}
      <section className="relative overflow-hidden bg-[#A94F32] text-[#FFF9F1]">
        <div className="pattern-adire pointer-events-none absolute inset-0 opacity-30" />

        <div className="relative mx-auto grid max-w-[1600px] gap-9 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-20 lg:px-12 lg:py-24">
          <div>
            <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.25em] text-white/75">
              The inside edit
            </p>

            <h2 className="max-w-2xl font-serif text-5xl leading-[0.98] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
              Good things
              <br />
              are on the way.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/80">
              New collections, stories, and a little something for your first
              order.
            </p>

            <div className="mt-8 inline-flex items-center gap-3 border border-white/30 px-4 py-3">
              <span className="font-serif text-3xl">10%</span>
              <span className="max-w-[150px] text-[10px] uppercase leading-5 tracking-[0.13em]">
                off your first order
              </span>
            </div>
          </div>

          <div className="border-t border-white/30 pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <h3 className="font-serif text-2xl sm:text-3xl">
              Make yourself at home.
            </h3>

            <p className="mt-3 text-sm leading-6 text-white/75">
              Leave your email. We'll save you a seat.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              className="mt-7"
            >
              <label
                htmlFor="newsletter-email"
                className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/80"
              >
                Your email address
              </label>

              <div className="flex border-b border-white/65">
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setNewsletterMessage("");
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="min-w-0 flex-1 bg-transparent py-4 text-sm text-white outline-none placeholder:text-white/55"
                />

                <button
                  type="submit"
                  aria-label="Submit newsletter email"
                  className="grid size-12 shrink-0 place-items-center transition hover:text-[#F2D09C]"
                >
                  <ArrowRight size={20} />
                </button>
              </div>

              <p
                role="status"
                aria-live="polite"
                className="mt-4 min-h-5 text-xs leading-5 text-white/85"
              >
                {newsletterMessage}
              </p>

              <p className="mt-2 text-[10px] leading-5 text-white/55">
                By subscribing, you agree to receive Vestirhaus updates.
                Connect this form to your newsletter service before launch.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}