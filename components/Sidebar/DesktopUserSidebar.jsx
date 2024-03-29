import SidebarCanvas from '@/components/Sidebar/SidebarCanvas';
import UserSidebarItem from '@/constants/UserSidebarItem';

export default function DesktopUserSidebar() {
  return (
    <div className='relative hidden h-full w-72 overflow-hidden md:flex'>
      <SidebarCanvas items={UserSidebarItem} />
    </div>
  );
}
