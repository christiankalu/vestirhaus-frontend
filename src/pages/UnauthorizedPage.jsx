import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <section className="container-editorial py-24">
      <p className="eyebrow text-brand-terracotta">Access restricted</p>
      <h1 className="mt-4 text-5xl">You don't have access to this page.</h1>
      <Link className="mt-6 inline-block text-brand-terracotta underline" to="/">
        Return home
      </Link>
    </section>
  );
}