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
  ];
}
