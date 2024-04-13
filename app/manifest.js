export default function manifest() {
  return {
    name: 'Divinity Bank',
    short_name: 'Divinity',
    description:
      'Divinity Bank is a digital bank that offers loans and other financial services in Minecraft Servers.',
    start_url: '/',
    display: 'standalone',
    background_color: '#181818',
    theme_color: '#FFFFFF',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '64x64 32x32 24x24 16x16',
        type: 'image/x-icon',
      },
    ],
  };
}
