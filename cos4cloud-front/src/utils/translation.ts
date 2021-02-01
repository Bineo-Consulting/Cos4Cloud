const version = '1.0'
function getLocale() {
  return localStorage.lang || 'es'
}

async function fetchTranslations() {
  const locale = getLocale();
  const existingTranslations = JSON.parse(sessionStorage.getItem(`i18n.${locale}`));
  if (existingTranslations && existingTranslations.version === version) {
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