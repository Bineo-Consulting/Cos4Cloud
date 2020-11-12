export const toQueryString = object =>
  '?' +
  Object.keys(object)
    .map(key => object[key] && `${key}=${object[key].toString()}`)
    .filter(Boolean)
    .join('&');