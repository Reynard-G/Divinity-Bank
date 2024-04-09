export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/myaccount/',
    },
    sitemap: 'https://divinity.milklegend.xyz/sitemap.xml',
  };
}
