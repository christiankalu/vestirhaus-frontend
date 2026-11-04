export default function AdminStatCard({
  label,
  value,
  note,
  icon: Icon,
}) {
  return (
    <article className="border border-[#211B18]/10 bg-[#FFFCF7] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#766B63]">
            {label}
          </p>

          <p className="mt-4 font-serif text-3xl tracking-[-0.04em] sm:text-4xl">
            {value}
          </p>

          {note && (
            <p className="mt-2 text-[10px] text-[#8B7D72]">
              {note}
            </p>
          )}
        </div>

        <div className="grid size-10 shrink-0 place-items-center bg-[#F0E8DC] text-[#A94F32]">
          {Icon && <Icon size={19} strokeWidth={1.6} />}
        </div>
      </div>
    </article>
  );
}