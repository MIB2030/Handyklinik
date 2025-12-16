export const legalConfig = {
  apiUrl: 'https://www.it-recht-kanzlei.de/api',
  apiToken: 'YOUR_API_TOKEN_HERE',
  shopId: 'YOUR_SHOP_ID_HERE',

  endpoints: {
    impressum: '/rechtstexte/impressum',
    datenschutz: '/rechtstexte/datenschutz',
    agb: '/rechtstexte/agb',
  },

  cacheExpiration: 24 * 60 * 60 * 1000,

  isConfigured(): boolean {
    return !!(
      this.apiUrl &&
      this.apiToken !== 'YOUR_API_TOKEN_HERE' &&
      this.shopId !== 'YOUR_SHOP_ID_HERE'
    );
  },

  enabled: true,
};

export default legalConfig;
