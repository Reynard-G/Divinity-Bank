import { Icon } from '@iconify/react';
import Pages from '@/constants/Pages';

export default [
  {
    name: 'Dashboard',
    icon: <Icon icon='tabler:layout-dashboard' fontSize='1.5rem' />,
    href: Pages.DASHBOARD,
  },
  {
    name: 'My Accounts',
    icon: <Icon icon='mdi:accounts-outline' fontSize='1.5rem' />,
    href: Pages.ACCOUNTS,
  },
  {
    name: 'Transactions',
    icon: <Icon icon='bitcoin-icons:transactions-outline' fontSize='1.5rem' />,
    href: Pages.TRANSACTIONS,
  },
  {
    name: 'Transfer Money',
    icon: <Icon icon='ph:money' fontSize='1.5rem' />,
    href: Pages.TRANSFER,
  },
  {
    name: 'Loans',
    icon: <Icon icon='carbon:white-paper' fontSize='1.5rem' />,
    href: Pages.LOANS,
  },
  {
    name: 'Settings',
    icon: <Icon icon='lucide:settings' fontSize='1.5rem' />,
    href: Pages.SETTINGS,
  },
];
