import Sidebar from '@/components/Sidebar/Sidebar';
import UserSidebarItem from '@/constants/UserSidebarItem';

export default function UserSidebar() {
  return <Sidebar items={UserSidebarItem} />;
}
