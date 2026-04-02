import axios from "axios";

// Fetch exchange rates from backend
export async function fetchExchangeRates(base = "USD") {
  const res = await axios.get(`/api/currency/${base}`);
  return res.data.data;
}

// Fetch supported currencies (from exchange API response)
export async function fetchSupportedCurrencies(base = "USD") {
  const data = await fetchExchangeRates(base);
  if (!data || typeof data !== 'object' || !data.conversion_rates) {
    // Optionally, log or throw a more descriptive error here
    return [];
  }
  return Object.keys(data.conversion_rates);
}

// Fetch experience with translation
export async function fetchExperienceWithLang(id, lang = "en") {
  const res = await axios.get(`/api/experiences/${id}?lang=${lang}`);
  return res.data.data;
}
