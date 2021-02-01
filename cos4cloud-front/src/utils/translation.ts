import resources from '../resources'

function getLocale() {
  return localStorage.lang || (navigator.language || 'en').split('-')[0]
}

async function fetchTranslations() {
  const locale = getLocale();
  const existingTranslations = JSON.parse(localStorage.getItem(`i18n.${locale}`));
  if (resources.cache_i18n && existingTranslations && existingTranslations.version === resources.version) {
    return existingTranslations;
  } else {
    try {
      const result = await fetch(`/assets/i18n/${locale}.json`)
      if (result.ok) {
        const data = await result.json();
        localStorage.setItem(`i18n.${locale}`, JSON.stringify({
          ...data,
          version: resources.version
        }));
        return data;
      }
    } catch (exception) {
      console.error(`Error loading locale: ${locale}`, exception);
    }
  }
}

export {
  getLocale, fetchTranslations
}