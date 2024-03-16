import Sidebar from '@/components/Sidebar/Sidebar';
import UserSidebarItems from '@/constants/UserSidebarItems';

export default function UserSidebar() {
  return <Sidebar items={UserSidebarItems} />;
}
