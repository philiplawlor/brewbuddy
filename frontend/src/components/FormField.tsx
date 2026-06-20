interface FormFieldProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}

export function FormField({
  label,
  type,
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  minLength,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-200"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: error ? '#ef4444' : 'var(--border-default)',
          color: 'var(--text-primary)',
        }}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
