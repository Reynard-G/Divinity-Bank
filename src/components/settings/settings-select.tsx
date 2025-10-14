import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";

interface SettingsSelectProps {
  name: string;
  label: string;
  items: string[];
  defaultItem?: string;
  placeholder?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function SettingsSelect({
  name,
  label,
  items,
  defaultItem,
  placeholder,
  description,
  className,
  disabled = false,
}: SettingsSelectProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium leading-none" htmlFor={name}>
        {label}
      </label>

      <Select name={name} defaultValue={defaultItem} disabled={disabled}>
        <SelectTrigger
          id={name}
          className={cn(disabled && "cursor-not-allowed", className)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
