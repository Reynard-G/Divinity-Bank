interface SidebarSectionProps {
  children: React.ReactNode;
}

export default function SidebarSection({ children }: SidebarSectionProps) {
  return (
    <div className="mb-2 flex flex-col gap-0.5 border-b border-b-[#343434] pb-2 last:border-b-0">
      {children}
    </div>
  );
}
