import resources from '../resources'
import dJSON from 'dirty-json'

function getLocale() {
  return localStorage.lang || 'es'
}

async function fetchTranslations() {
  const locale = getLocale();
  const existingTranslations = dJSON.parse(sessionStorage.getItem(`i18n.${locale}`));
  if (!resources.fetch_i18n && existingTranslations && existingTranslations.version === resources.version) {
    return existingTranslations;
  } else {
    try {
      const result = await fetch(`/assets/i18n/${locale}.json`)
      if (result.ok) {
        const data = await result.json();
        sessionStorage.setItem(`i18n.${locale}`, JSON.stringify(data));
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