import { Icon } from '@iconify/react';
import Page from '@/constants/Page';

export default [
  {
    name: 'Dashboard',
    icon: <Icon icon='tabler:layout-dashboard' fontSize='1.5rem' />,
    href: Page.DASHBOARD,
  },
  {
    name: 'My Accounts',
    icon: <Icon icon='mdi:accounts-outline' fontSize='1.5rem' />,
    href: Page.ACCOUNTS,
  },
  {
    name: 'Transactions',
    icon: <Icon icon='bitcoin-icons:transactions-outline' fontSize='1.5rem' />,
    href: Page.TRANSACTIONS,
  },
  {
    name: 'Transfer Money',
    icon: <Icon icon='ph:money' fontSize='1.5rem' />,
    href: Page.TRANSFER,
  },
  {
    name: 'Loans',
    icon: <Icon icon='carbon:white-paper' fontSize='1.5rem' />,
    href: Page.LOANS,
  },
  {
    name: 'Settings',
    icon: <Icon icon='lucide:settings' fontSize='1.5rem' />,
    href: Page.SETTINGS,
  },
];
