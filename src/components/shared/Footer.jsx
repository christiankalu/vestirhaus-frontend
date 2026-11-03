import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import InstagramIcon from "@/components/shared/icons/InstagramIcon";

const footerGroups = [
  {
    heading: "Shop",
    links: [
      { label: "Shop All", to: "/shop" },
      { label: "Men", to: "/shop?gender=men" },
      { label: "Women", to: "/shop?gender=women" },
      { label: "Kids", to: "/shop?gender=kids" },
      { label: "New Arrivals", to: "/shop?sort=newest" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Our Story", to: "/#our-story" },
      { label: "Journal", to: "/blog" },
      { label: "Lookbook", to: "/#lookbook" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Contact Us", to: "/contact" },
      { label: "FAQs", to: "/faq" },
      { label: "Delivery & Returns", to: "/shipping-returns" },
      { label: "My Account", to: "/account" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#211B18] text-[#F7F0E6]">
      <div className="mx-auto max-w-[1600px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="grid gap-12 border-b border-white/15 pb-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-10">
          <div className="max-w-sm">
            <Link
              to="/"
              className="font-serif text-[38px] tracking-[-0.07em]"
            >
              vestirhaus
            </Link>

            <p className="mt-5 max-w-[290px] text-sm leading-7 text-white/65">
              African heritage, considered design, and everyday pieces that
              feel entirely your own.
            </p>

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Visit Instagram"
              className="mt-6 inline-flex items-center gap-2 text-xs text-white/80 transition hover:text-[#D6AF72]"
            >
              <InstagramIcon className="h-[17px] w-[17px]" />
              Follow our story
              <ArrowUpRight size={13} />
            </a>
          </div>

          {footerGroups.map((group) => (
            <div key={group.heading}>
              <h2 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D6AF72]">
                {group.heading}
              </h2>
              <ul className="space-y-3.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/70 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-5 pt-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-[10px] uppercase tracking-[0.15em] text-white/50">
                Secure payments
              </span>

              <span className="rounded-sm bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#0C6B55]">
                Paystack
              </span>

              <span className="rounded-sm bg-white px-2.5 py-1.5 text-[11px] font-black italic tracking-wide text-[#1A3263]">
                VISA
              </span>

              <span className="flex items-center rounded-sm bg-white px-2.5 py-1.5">
                <span className="size-3.5 rounded-full bg-[#EB001B]" />
                <span className="-ml-1.5 size-3.5 rounded-full bg-[#F79E1B]/90" />
                <span className="ml-1 text-[9px] font-bold text-[#211B18]">
                  Mastercard
                </span>
              </span>
            </div>

            <p className="text-xs text-white/60">
              Made in Nigeria 🇳🇬
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 text-[10px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} Vestirhaus. All rights reserved.
            </p>

            <div className="flex gap-5">
              <Link to="/privacy" className="transition hover:text-white/80">
                Privacy
              </Link>
              <Link to="/terms" className="transition hover:text-white/80">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}