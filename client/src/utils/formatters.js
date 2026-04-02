// Format price → "$24"
export const formatPrice = (priceInUSD, forceCurrency) => {
  const num = Number(priceInUSD);
  if (!Number.isFinite(num)) return '$0';

  let currencyCode = forceCurrency;
  if (!currencyCode) {
    try {
      const storedCur = JSON.parse(localStorage.getItem('lx_currency'));
      currencyCode = storedCur?.code || 'USD';
    } catch {
      currencyCode = 'USD';
    }
  }

  let finalPrice = num;
  if (currencyCode !== 'USD') {
    try {
      const rates = JSON.parse(localStorage.getItem('lx_exchange_rates'));
      if (rates && rates[currencyCode]) {
        finalPrice = num * rates[currencyCode];
      }
    } catch {
      // ignore
    }
  }

  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 }).format(finalPrice);
  } catch (err) {
    // Fallback if currency code is unsupported by Intl
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(finalPrice);
  }
}

// Format duration → "2h 30m"
export const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

// Format date → "Mar 8, 2026"
export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

// Format date → "March 8"
export const formatShortDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

// Truncate text
export const truncate = (text, length = 100) =>
  text?.length > length ? text.slice(0, length) + '...' : text

// Get initials from name → "Ahmed Khan" → "AK"
export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

// Format rating → "4.9"
export const formatRating = (rating) => Number(rating).toFixed(1)