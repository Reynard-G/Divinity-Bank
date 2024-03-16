import { usePathname } from 'next/navigation';
import { Listbox, ListboxItem } from '@nextui-org/listbox';

export default function SidebarItems({ items }) {
  const pathname = usePathname();

  return (
    <Listbox
      as='nav'
      color='default'
      variant='flat'
      hideSelectedIcon={true}
      selectionMode='single'
      selectedKeys={[
        items.find((item) => pathname === item.href && item.href)?.name,
      ]}
      itemClasses={{
        base: 'px-3 rounded-large h-[44px] data-[selected=true]:bg-default-100',
        title:
          'font-medium text-lg text-default-500 group-data-[selected=true]:text-foreground',
      }}
      className='list-none'
      aria-label='Sidebar Navigation'
    >
      {items.map((item) => (
        <ListboxItem key={item.name} startContent={item.icon} href={item.href}>
          {item.name}
        </ListboxItem>
      ))}
    </Listbox>
  );
}
