import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="container-editorial py-24">
      <p className="eyebrow text-brand-terracotta">404 · Not found</p>
      <h1 className="mt-4 text-5xl">This page took a different path.</h1>
      <Link className="mt-6 inline-block text-brand-terracotta underline" to="/">
        Return home
      </Link>
    </section>
  );
}