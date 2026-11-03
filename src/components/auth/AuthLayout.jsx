import { Link } from "react-router-dom";

export default function AuthLayout({
  eyebrow = "WELCOME TO VESTIRHAUS",
  title,
  description,
  children,
  footer,
}) {
  return (
    <main className="grid min-h-[calc(100svh-74px)] bg-[#F7F0E6] lg:grid-cols-2">
      {/* Brand imagery */}
      <section className="relative hidden min-h-[720px] overflow-hidden bg-[#4A382D] lg:block">
        <img
          src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1500&q=85"
          alt="Vestirhaus-inspired fashion editorial"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/10" />

        <div className="relative flex h-full min-h-[720px] flex-col justify-between p-12 text-white xl:p-16">
          <Link
            to="/"
            className="font-serif text-4xl tracking-[-0.07em]"
          >
            vestirhaus
          </Link>

          <div className="max-w-lg">
            <p className="mb-5 text-[10px] uppercase tracking-[0.25em] text-[#E7C99A]">
              Rooted in culture
            </p>

            <h2 className="font-serif text-6xl leading-[0.98] tracking-[-0.055em] xl:text-7xl">
              Your story.
              <br />
              Your style.
              <br />
              <span className="italic text-[#E7C99A]">Your space.</span>
            </h2>

            <p className="mt-6 max-w-sm text-sm leading-7 text-white/75">
              A more personal way to experience contemporary African
              expression.
            </p>
          </div>

          <p className="text-[9px] uppercase tracking-[0.2em] text-white/60">
            MADE FOR EVERY VERSION OF YOU · NIGERIA
          </p>
        </div>
      </section>

      {/* Form side */}
      <section className="flex min-h-[650px] items-center justify-center px-5 py-12 sm:px-10 lg:px-12 xl:px-20">
        <div className="w-full max-w-[460px]">
          <Link
            to="/"
            className="mb-12 inline-block font-serif text-3xl tracking-[-0.07em] lg:hidden"
          >
            vestirhaus
          </Link>

          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#A94F32]">
            {eyebrow}
          </p>

          <h1 className="mt-4 font-serif text-4xl tracking-[-0.055em] sm:text-5xl">
            {title}
          </h1>

          {description && (
            <p className="mt-4 text-sm leading-7 text-[#766B63]">
              {description}
            </p>
          )}

          <div className="mt-8">{children}</div>

          {footer && (
            <div className="mt-8 border-t border-[#211B18]/10 pt-6 text-center text-xs text-[#766B63]">
              {footer}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}