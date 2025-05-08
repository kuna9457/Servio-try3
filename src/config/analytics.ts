export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Event names
export const GA_EVENTS = {
  PAGE_VIEW: 'page_view',
  SEARCH: 'search',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  VIEW_ITEM: 'view_item',
  FILTER_APPLIED: 'filter_applied',
  LOCATION_CHANGED: 'location_changed',
} as const;

// Event parameters
export const GA_PARAMS = {
  SEARCH_TERM: 'search_term',
  ITEM_ID: 'item_id',
  ITEM_NAME: 'item_name',
  ITEM_CATEGORY: 'item_category',
  ITEM_PRICE: 'price',
  FILTER_TYPE: 'filter_type',
  FILTER_VALUE: 'filter_value',
  LOCATION: 'location',
} as const; 