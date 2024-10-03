import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils/cn";

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

export default function SettingsSelect({
  name,
  label,
  items,
  defaultItem = undefined,
  placeholder = undefined,
  description,
  className,
  disabled = false,
}: SettingsSelectProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium leading-none" htmlFor={name}>
        {label}
        <Select name={name} defaultValue={defaultItem} disabled={disabled}>
          <SelectTrigger
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
      </label>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
