import SidebarCanvas from '@/components/Sidebar/SidebarCanvas';
import UserSidebarItem from '@/constants/UserSidebarItem';

export default function UserSidebar() {
  return <SidebarCanvas items={UserSidebarItem} />;
}
