export default {
  site: 'divinity.milklegend.xyz',
  cache: false,
  debug: true,
  chrome: {
    useSystem: true,
  },
  scanner: {
    device: 'desktop',
    samples: 3,
    throttle: true,
  },
  hooks: {
    async authenticate(page) {
      // login to the page
      await page.goto('https://divinity.milklegend.xyz/login');
      const usernameInput = await page.$('input[type="text"]');
      await usernameInput.type('null');
      const passwordInput = await page.$('input[type="password"]');
      await passwordInput.type('69UnL1ghth0u53');
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation(),
      ]);
    },
  },
};
