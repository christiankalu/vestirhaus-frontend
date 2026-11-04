const statusStyles = {
  pending: "bg-[#F3EACF] text-[#806627]",
  confirmed: "bg-[#E5EBDD] text-[#526B40]",
  processing: "bg-[#E9E2ED] text-[#72577F]",
  shipped: "bg-[#E3EAF0] text-[#49647A]",
  delivered: "bg-[#DDEBDD] text-[#3F7047]",
  cancelled: "bg-[#F3DFDA] text-[#A94F32]",
  refunded: "bg-[#E9E2ED] text-[#72577F]",
  paid: "bg-[#E5EBDD] text-[#526B40]",
  failed: "bg-[#F3DFDA] text-[#A94F32]",
};

export default function AdminStatusBadge({ status }) {
  const value = String(status ?? "unknown").toLowerCase();

  return (
    <span
      className={[
        "inline-flex whitespace-nowrap px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.1em]",
        statusStyles[value] ?? "bg-[#EEE6DB] text-[#766B63]",
      ].join(" ")}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}