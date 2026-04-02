import { useCurrency } from "../components/Currencycontext";
import translations from "../config/translations";

/**
 * Hook that returns a `t(key)` function for translating UI strings.
 * Falls back to English if the key is missing in the active language.
 */
export default function useTranslation() {
  const { language } = useCurrency();
  const code = language?.code || "en";

  const t = (key) => {
    const lang = translations[code] || translations.en;
    return lang[key] ?? translations.en[key] ?? key;
  };

  return { t, lang: code };
}
