type Props = { message?: string; id?: string };

/**
 * Inline form field error. Hidden when no message — does not affect layout.
 * Use the matching `id` on the input via `aria-describedby` for a11y.
 */
const FieldError = ({ message, id }: Props) => {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs font-body text-destructive">
      {message}
    </p>
  );
};

export default FieldError;
