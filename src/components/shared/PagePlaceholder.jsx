
export default function PagePlaceholder({ title, description }) {
  return (
    <section className="container-editorial py-20 sm:py-28">
      <p className="eyebrow mb-4 text-brand-terracotta">Vestirhaus</p>
      <h1 className="max-w-3xl text-4xl leading-tight sm:text-6xl">
        {title}
      </h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-brand-muted">
        {description || "This page is reserved for its dedicated implementation phase."}
      </p>
    </section>
  );
}
