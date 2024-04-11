import Page from '@/constants/Page';

export default function sitemap() {
  return [
    {
      url: Page.BASE_URL + Page.HOME,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: Page.BASE_URL + Page.LOGIN,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: Page.BASE_URL + Page.REGISTER,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: Page.BASE_URL + Page.BLOCKED,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.1,
    },
    {
      url: Page.BASE_URL + Page.DASHBOARD,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: Page.BASE_URL + Page.TRANSACTIONS,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: Page.BASE_URL + Page.LOANS,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: Page.BASE_URL + Page.SETTINGS,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.75,
    },
  ];
}
