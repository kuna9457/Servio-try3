import { GA_EVENTS, GA_PARAMS } from '../config/analytics';

declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params?: Record<string, any>
    ) => void;
  }
}

export const trackEvent = (
  eventName: keyof typeof GA_EVENTS,
  params?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', GA_EVENTS[eventName], params);
  }
};

export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
      page_path: url,
    });
  }
};

export const trackSearch = (searchTerm: string) => {
  trackEvent('SEARCH', {
    [GA_PARAMS.SEARCH_TERM]: searchTerm,
  });
};

export const trackAddToCart = (item: {
  id: string;
  name: string;
  category: string;
  price: number;
}) => {
  trackEvent('ADD_TO_CART', {
    [GA_PARAMS.ITEM_ID]: item.id,
    [GA_PARAMS.ITEM_NAME]: item.name,
    [GA_PARAMS.ITEM_CATEGORY]: item.category,
    [GA_PARAMS.ITEM_PRICE]: item.price,
  });
};

export const trackRemoveFromCart = (item: {
  id: string;
  name: string;
  category: string;
  price: number;
}) => {
  trackEvent('REMOVE_FROM_CART', {
    [GA_PARAMS.ITEM_ID]: item.id,
    [GA_PARAMS.ITEM_NAME]: item.name,
    [GA_PARAMS.ITEM_CATEGORY]: item.category,
    [GA_PARAMS.ITEM_PRICE]: item.price,
  });
};

export const trackViewItem = (item: {
  id: string;
  name: string;
  category: string;
  price: number;
}) => {
  trackEvent('VIEW_ITEM', {
    [GA_PARAMS.ITEM_ID]: item.id,
    [GA_PARAMS.ITEM_NAME]: item.name,
    [GA_PARAMS.ITEM_CATEGORY]: item.category,
    [GA_PARAMS.ITEM_PRICE]: item.price,
  });
};

export const trackFilterApplied = (filterType: string, filterValue: string) => {
  trackEvent('FILTER_APPLIED', {
    [GA_PARAMS.FILTER_TYPE]: filterType,
    [GA_PARAMS.FILTER_VALUE]: filterValue,
  });
};

export const trackLocationChanged = (location: string) => {
  trackEvent('LOCATION_CHANGED', {
    [GA_PARAMS.LOCATION]: location,
  });
}; 