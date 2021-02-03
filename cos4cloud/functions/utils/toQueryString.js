const toQueryString = object => '?' + Object.keys(object)
  .map(key => object[key] && `${key}=${encodeURIComponent(object[key].toString())}`)
  .filter(Boolean)
  .join('&');

module.exports = toQueryString