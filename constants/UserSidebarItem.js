import {
  ArrowLeftRight,
  Banknote,
  LayoutDashboard,
  ScrollText,
  Settings,
} from 'lucide-react';

import Page from '@/constants/Page';

export default [
  {
    name: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
    href: Page.DASHBOARD,
  },
  {
    name: 'Transfer Money',
    icon: <ArrowLeftRight size={20} />,
    href: Page.TRANSFER,
  },
  {
    name: 'Transactions',
    icon: <Banknote size={20} />,
    href: Page.TRANSACTIONS,
  },
  {
    name: 'Loans',
    icon: <ScrollText size={20} />,
    href: Page.LOANS,
  },
  {
    name: 'Settings',
    icon: <Settings size={20} />,
    href: Page.SETTINGS,
  },
];
