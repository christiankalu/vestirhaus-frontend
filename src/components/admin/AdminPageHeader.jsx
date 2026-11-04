export default function AdminPageHeader({
  eyebrow = "VESTIRHAUS ADMIN",
  title,
  description,
  action,
}) {
  return (
    <header className="mb-8 flex flex-col justify-between gap-5 border-b border-[#211B18]/10 pb-7 sm:mb-10 sm:flex-row sm:items-end">
      <div>
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#A94F32]">
          {eyebrow}
        </p>

        <h1 className="font-serif text-4xl tracking-[-0.05em] sm:text-5xl">
          {title}
        </h1>

        {description && (
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#766B63]">
            {description}
          </p>
        )}
      </div>

      {action}
    </header>
  );
}