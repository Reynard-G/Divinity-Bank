import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

interface SettingsInputProps {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  type?: string;
}

export function SettingsInput({
  name,
  label,
  defaultValue,
  placeholder,
  description,
  className,
  disabled = false,
  readOnly = false,
  type = "text",
}: SettingsInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium leading-none" htmlFor={name}>
        {label}
      </label>
      <Input
        type={type}
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        autoComplete="off"
        className={cn(
          (disabled || readOnly) && "cursor-not-allowed",
          className
        )}
      />

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
