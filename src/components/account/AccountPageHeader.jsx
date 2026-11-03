export default function AccountPageHeader({
  eyebrow = "MY ACCOUNT",
  title,
  description,
}) {
  return (
    <header className="mb-8 border-b border-[#211B18]/10 pb-6 sm:mb-10">
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
    </header>
  );
}