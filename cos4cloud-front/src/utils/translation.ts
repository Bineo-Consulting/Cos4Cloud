import resources from '../resources'
import dJSON from 'dirty-json'

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}
function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

function getLocale() {
  return localStorage.lang || (navigator.language || 'en').split('-')[0]
}

async function fetchTranslations(i18n?) {
  const locale = getLocale();
  const existingTranslations = JSON.parse(localStorage.getItem(`i18n.${locale}`));
  if (resources.cache_i18n && existingTranslations && existingTranslations.version === resources.version) {
    return mergeDeep(i18n || {}, existingTranslations);
  } else {
    try {
      const result = await fetch(`/assets/i18n/${locale}.json`)
      if (result.ok) {
        const data = dJSON.parse(await result.text());
        localStorage.setItem(`i18n.${locale}`, JSON.stringify({
          ...data,
          version: resources.version
        }));
        return mergeDeep(i18n || {}, data)
      }
    } catch (exception) {
      console.error(`Error loading locale: ${locale}`, exception);
    }
  }
}

export {
  getLocale, fetchTranslations
}