const axios = require('axios');

const LANGBLY_API_KEY = process.env.LANGBLY_API_KEY;
const LANGBLY_URL = 'https://api.langbly.com/api/translate';

/**
 * Translate text using Langbly API
 * @param {string} text - The text to translate
 * @param {string} targetLang - The target language code (e.g., 'fr', 'es')
 * @returns {Promise<string>} - The translated text
 */
async function translateText(text, targetLang) {
  if (!text || typeof text !== 'string') return '';
  if (!targetLang || targetLang === 'en') return text;
  try {
    const response = await axios.post(
      LANGBLY_URL,
      { text, target_lang: targetLang },
      {
        headers: {
          'Authorization': `Bearer ${LANGBLY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 8000,
      }
    );
    if (response.data && response.data.translated_text) {
      return response.data.translated_text;
    }
    // fallback if API returns unexpected structure
    return text;
  } catch (err) {
    // Return original text if translation fails
    return text;
  }
}

module.exports = { translateText };
