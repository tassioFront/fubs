function FieldError({ message, id }: { message?: string; id: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-small text-gary-danger" role="alert">
      {message}
    </p>
  );
}

export function Input({
  id,
  value,
  type,
  required,
  label,
  ariaDescribedby,
  errorMessage,
  defaultValue,
}: {
  id: string;
  value: string;
  label: string;
  type: string;
  required?: boolean;
  ariaDescribedby?: string;
  errorMessage?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-small text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        name={value}
        type={type}
        className="w-full rounded-md border border-muted px-3 py-2 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gary-accent"
        required={required}
        aria-describedby={ariaDescribedby}
        defaultValue={defaultValue}
      />
      <FieldError id={ariaDescribedby ?? ''} message={errorMessage} />
    </div>
  );
}
