export namespace TranslationUtils {

  /**
   * Attempts to find the closest tag with a lang attribute.
   * Falls back to english if no language is found.
   * @param element The element to find a lang attribute for.
   */
  function getLocale() {
    return localStorage.lang || 'en'
  }

  export async function fetchTranslations() {
    const locale = getLocale();
    const existingTranslations = JSON.parse(sessionStorage.getItem(`i18n.${locale}`));
    if (existingTranslations && Object.keys(existingTranslations).length > 0) {
      return existingTranslations;
    } else {
      try {
        const result = await fetch(`/i18n/${locale}.json`);
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

}
