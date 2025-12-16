declare global {
  interface Window {
    gtag?: (command: string, ...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
export const GA_ENABLED = !!GA_MEASUREMENT_ID;

export const pageview = (url: string) => {
  if (GA_ENABLED && typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

export const event = (action: string, params?: Record<string, any>) => {
  if (GA_ENABLED && typeof window.gtag !== 'undefined') {
    window.gtag('event', action, params);
  }
};

export const trackPhoneCall = () => {
  event('phone_call', {
    event_category: 'engagement',
    event_label: 'Phone Call Initiated',
  });
};

export const trackRepairRequest = (repairType: string) => {
  event('repair_request', {
    event_category: 'conversion',
    event_label: repairType,
  });
};

export const trackPriceCheck = (device: string) => {
  event('price_check', {
    event_category: 'engagement',
    event_label: device,
  });
};

export const trackVoucherView = () => {
  event('voucher_view', {
    event_category: 'engagement',
    event_label: 'Voucher Modal Opened',
  });
};

export const trackContactForm = () => {
  event('contact_form', {
    event_category: 'conversion',
    event_label: 'Contact Form Submitted',
  });
};
