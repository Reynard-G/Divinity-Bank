import { Switch } from "@/components/ui/switch";

interface SettingsSwitchProps {
  name: string;
  label: string;
  defaultChecked?: boolean;
  description?: string;
  disabled?: boolean;
}

export function SettingsSwitch({
  name,
  label,
  defaultChecked = false,
  description,
  disabled = false,
}: SettingsSwitchProps) {
  return (
    <div className="flex flex-row items-center justify-between space-y-2 rounded-lg border p-4">
      <div className="space-y-0.5">
        <label className="text-base font-semibold peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <Switch name={name} defaultChecked={defaultChecked} disabled={disabled} />
    </div>
  );
}
