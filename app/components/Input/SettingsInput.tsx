import { Input } from "~/components/ui/input";

interface SettingsInputProps {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
}

export default function SettingsInput({
  name,
  label,
  defaultValue = undefined,
  placeholder = undefined,
  description,
  disabled = false,
}: SettingsInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium leading-none" htmlFor={name}>
        {label}
        <Input
          type="text"
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
        />
      </label>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
