export default function FormField({
  label,
  name,
  type = "text",
  placeholder,
  register,
  error,
  autoComplete,
}) {
  const id = `field-${name}`;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-medium text-[#211B18]"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...register(name)}
        className={[
          "min-h-[50px] w-full border bg-[#FFFCF7] px-4 py-3 text-sm",
          "outline-none transition placeholder:text-[#B1A69A]",
          error
            ? "border-red-500 focus:border-red-600"
            : "border-[#211B18]/15 focus:border-[#A94F32]",
        ].join(" ")}
      />

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-xs text-red-600"
        >
          {error.message}
        </p>
      )}
    </div>
  );
}