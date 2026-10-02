// FormInput — labeled input wrapper supporting hint text and error state.
export default function FormInput({
  label,
  hint,
  error,
  type = 'text',
  as = 'input',
  options = [],
  className = '',
  ...rest
}) {
  const baseClass = `input ${error ? 'input-error' : ''}`;

  let field;
  if (as === 'textarea') {
    field = <textarea className={`${baseClass} min-h-[110px]`} {...rest} />;
  } else if (as === 'select') {
    field = (
      <select className={baseClass} {...rest}>
        {options.map((o) =>
          typeof o === 'string' ? (
            <option key={o} value={o}>{o}</option>
          ) : (
            <option key={o.value} value={o.value}>{o.label}</option>
          )
        )}
      </select>
    );
  } else {
    field = <input type={type} className={baseClass} {...rest} />;
  }

  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      {field}
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-navy-400">{hint}</p>
      ) : null}
    </div>
  );
}
