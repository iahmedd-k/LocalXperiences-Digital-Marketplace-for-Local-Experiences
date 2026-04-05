import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchExchangeRates } from "../services/currencyAndTranslationService";
import AutoTranslatePage from "./AutoTranslatePage";

const CurrencyContext = createContext(null);

// Full currency list with names
export const CURRENCIES = [
  { code: "CNY", name: "Chinese Yuan" },
  { code: "USD", name: "U.S. Dollars" },
  { code: "AFN", name: "Afghan Afghani" },
  { code: "ALL", name: "Albanian Lek" },
  { code: "DZD", name: "Algerian Dinar" },
  { code: "AOA", name: "Angolan Kwanza" },
  { code: "ARS", name: "Argentine Peso" },
  { code: "AMD", name: "Armenian Dram" },
  { code: "AWG", name: "Aruban Guilder" },
  { code: "AUD", name: "Australian Dollars" },
  { code: "AZN", name: "Azerbaijani Manat" },
  { code: "BSD", name: "Bahamian Dollars" },
  { code: "BHD", name: "Bahraini Dinar" },
  { code: "BDT", name: "Bangladeshi Taka" },
  { code: "BBD", name: "Barbados Dollars" },
  { code: "BYN", name: "Belarusian Rubles" },
  { code: "BZD", name: "Belize Dollars" },
  { code: "BMD", name: "Bermudian Dollars" },
  { code: "BTN", name: "Bhutanese Ngultrum" },
  { code: "BOB", name: "Bolivian Boliviano" },
  { code: "BAM", name: "Bosnia and Herzegovina Convertible Marks" },
  { code: "BWP", name: "Botswana Pula" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "GBP", name: "British Pounds" },
  { code: "BND", name: "Brunei Dollars" },
  { code: "MMK", name: "Burmese Kyat" },
  { code: "BIF", name: "Burundi Francs" },
  { code: "KHR", name: "Cambodian Riel" },
  { code: "CAD", name: "Canadian Dollars" },
  { code: "CVE", name: "Cape Verde Escudo" },
  { code: "KYD", name: "Cayman Islands Dollars" },
  { code: "XAF", name: "CFA Francs BEAC" },
  { code: "XOF", name: "CFA Francs BCEAO" },
  { code: "XPF", name: "CFP Francs" },
  { code: "CLP", name: "Chilean Peso" },
  { code: "COP", name: "Colombian Peso" },
  { code: "KMF", name: "Comorian Franc" },
  { code: "CDF", name: "Congolese Franc" },
  { code: "CRC", name: "Costa Rican Colón" },
  { code: "HRK", name: "Croatian Kuna" },
  { code: "CZK", name: "Czech Koruna" },
  { code: "DKK", name: "Danish Krone" },
  { code: "DJF", name: "Djiboutian Franc" },
  { code: "DOP", name: "Dominican Peso" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "ERN", name: "Eritrean Nakfa" },
  { code: "ETB", name: "Ethiopian Birr" },
  { code: "EUR", name: "Euro" },
  { code: "FKP", name: "Falkland Islands Pounds" },
  { code: "FJD", name: "Fijian Dollars" },
  { code: "GMD", name: "Gambian Dalasi" },
  { code: "GEL", name: "Georgian Lari" },
  { code: "GHS", name: "Ghanaian Cedi" },
  { code: "GIP", name: "Gibraltar Pounds" },
  { code: "GTQ", name: "Guatemalan Quetzal" },
  { code: "GNF", name: "Guinean Franc" },
  { code: "GYD", name: "Guyanese Dollars" },
  { code: "HTG", name: "Haitian Gourde" },
  { code: "HNL", name: "Honduran Lempira" },
  { code: "HKD", name: "Hong Kong Dollars" },
  { code: "HUF", name: "Hungarian Forint" },
  { code: "ISK", name: "Icelandic Króna" },
  { code: "INR", name: "Indian Rupee" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "ILS", name: "Israeli Shekel" },
  { code: "JMD", name: "Jamaican Dollars" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "JOD", name: "Jordanian Dinar" },
  { code: "KZT", name: "Kazakhstani Tenge" },
  { code: "KES", name: "Kenyan Shilling" },
  { code: "KWD", name: "Kuwaiti Dinar" },
  { code: "KGS", name: "Kyrgyzstani Som" },
  { code: "LAK", name: "Laotian Kip" },
  { code: "LBP", name: "Lebanese Pound" },
  { code: "LSL", name: "Lesotho Loti" },
  { code: "LRD", name: "Liberian Dollars" },
  { code: "MOP", name: "Macanese Pataca" },
  { code: "MKD", name: "Macedonian Denar" },
  { code: "MGA", name: "Malagasy Ariary" },
  { code: "MWK", name: "Malawian Kwacha" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "MVR", name: "Maldivian Rufiyaa" },
  { code: "MRO", name: "Mauritanian Ouguiya" },
  { code: "MUR", name: "Mauritian Rupee" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "MDL", name: "Moldovan Leu" },
  { code: "MNT", name: "Mongolian Tögrög" },
  { code: "MAD", name: "Moroccan Dirham" },
  { code: "MZN", name: "Mozambican Metical" },
  { code: "NAD", name: "Namibian Dollars" },
  { code: "NPR", name: "Nepalese Rupee" },
  { code: "NZD", name: "New Zealand Dollars" },
  { code: "NIO", name: "Nicaraguan Córdoba" },
  { code: "NGN", name: "Nigerian Naira" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "OMR", name: "Omani Rial" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "PAB", name: "Panamanian Balboa" },
  { code: "PGK", name: "Papua New Guinean Kina" },
  { code: "PYG", name: "Paraguayan Guaraní" },
  { code: "PEN", name: "Peruvian Sol" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "PLN", name: "Polish Złoty" },
  { code: "QAR", name: "Qatari Riyal" },
  { code: "RON", name: "Romanian Leu" },
  { code: "RUB", name: "Russian Ruble" },
  { code: "RWF", name: "Rwandan Franc" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "SGD", name: "Singapore Dollars" },
  { code: "SOS", name: "Somali Shilling" },
  { code: "ZAR", name: "South African Rand" },
  { code: "KRW", name: "South Korean Won" },
  { code: "LKR", name: "Sri Lankan Rupee" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "TWD", name: "Taiwan Dollars" },
  { code: "TZS", name: "Tanzanian Shilling" },
  { code: "THB", name: "Thai Baht" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "UGX", name: "Ugandan Shilling" },
  { code: "UAH", name: "Ukrainian Hryvnia" },
  { code: "AED", name: "United Arab Emirates Dirham" },
  { code: "UYU", name: "Uruguayan Peso" },
  { code: "UZS", name: "Uzbekistani Som" },
  { code: "VND", name: "Vietnamese Dong" },
  { code: "YER", name: "Yemeni Rial" },
  { code: "ZMW", name: "Zambian Kwacha" },
];

export function CurrencyProvider({ children }) {
  const queryClient = useQueryClient();
  const [currency, setCurrencyState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lx_currency")) || { code: "USD", name: "U.S. Dollars" };
    } catch {
      return { code: "USD", name: "U.S. Dollars" };
    }
  });

  const [language, setLanguageState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lx_language")) || { code: "en", label: "English", icon: "🇺🇸" };
    } catch {
      return { code: "en", label: "English", icon: "🇺🇸" };
    }
  });

  useEffect(() => {
    fetchExchangeRates("USD").then(rates => {
      if (rates) {
        localStorage.setItem("lx_exchange_rates", JSON.stringify(rates));
      }
    }).catch(err => console.error("Failed to load exchange rates", err));
  }, []);

  useEffect(() => {
    document.documentElement.lang = language?.code || "en";
  }, [language]);

  useEffect(() => {
    if (!language?.code) return;
    queryClient.invalidateQueries();
  }, [language?.code, queryClient]);

  useEffect(() => {
    if (!currency?.code) return;
    // Fetch exchange rates for the selected currency
    fetchExchangeRates(currency.code).then(rates => {
      if (rates) {
        localStorage.setItem("lx_exchange_rates", JSON.stringify(rates));
      }
    }).catch(err => console.error("Failed to load exchange rates for currency", err));
    // Invalidate queries to refetch prices with new currency
    queryClient.invalidateQueries();
  }, [currency?.code, queryClient]);

  const setCurrency = (cur) => {
    setCurrencyState(cur);
    localStorage.setItem("lx_currency", JSON.stringify(cur));
  };

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem("lx_language", JSON.stringify(lang));
  };

  const providerValue = useMemo(
    () => ({ currency, setCurrency, language, setLanguage }),
    [currency, language]
  );

  const appRefreshKey = `${currency?.code || "USD"}-${language?.code || "en"}`;

  return (
    <CurrencyContext.Provider value={providerValue}>
      <div key={appRefreshKey}>
        <AutoTranslatePage />
        {children}
      </div>
    </CurrencyContext.Provider>
  );
}

// Hook to use anywhere in the app
export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
