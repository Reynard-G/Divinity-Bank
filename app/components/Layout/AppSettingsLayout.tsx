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

      <div className="faded-bottom -mx-4 max-h-[50%] flex-1 px-4 md:max-h-[75%]">
        <div className="lg:max-w-xl">{children}</div>
      </div>
    </div>
  );
}
