import { Separator } from "~/components/ui/separator";

interface AppSettingsLayoutProps {
  title: string;
  desc: string;
  children: JSX.Element;
}

export default function AppSettingsLayout({
  title,
  desc,
  children,
}: AppSettingsLayoutProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-none">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>

      <Separator className="my-4 mt-2 flex-none" />

      <div className="faded-bottom -mx-4 flex-1 overflow-y-auto px-4">
        <div className="lg:max-w-xl">{children}</div>
      </div>
    </div>
  );
}
