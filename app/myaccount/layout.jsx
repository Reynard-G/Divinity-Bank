import DashboardLayout from '@/components/Layout/UserDashboardLayout';

export const metadata = {
  title: 'Divinity: My Account',
  description: 'Manage your account settings, transactions, and more.',
};

export default function MyAccountLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
