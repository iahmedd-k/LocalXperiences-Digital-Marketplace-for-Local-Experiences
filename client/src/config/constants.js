export const CATEGORIES = [
  { value: 'food',      label: 'Food & Drink'  },
  { value: 'culture',   label: 'Culture'        },
  { value: 'adventure', label: 'Adventure'      },
  { value: 'art',       label: 'Art'            },
  { value: 'music',     label: 'Music'          },
  { value: 'sports',    label: 'Sports'         },
  { value: 'wellness',  label: 'Wellness'       },
  { value: 'tour',      label: 'Tours'          },
  { value: 'workshop',  label: 'Workshops'      },
  { value: 'other',     label: 'Other'          },
]

export const SORT_OPTIONS = [
  { value: 'createdAt',  label: 'Newest'         },
  { value: 'rating',     label: 'Top Rated'      },
  { value: 'price_asc',  label: 'Price: Low→High'},
  { value: 'price_desc', label: 'Price: High→Low'},
]

export const BOOKING_STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100  text-green-700',
  cancelled: 'bg-red-100    text-red-700',
  completed: 'bg-blue-100   text-blue-700',
}

export const DEFAULT_RADIUS  = 50000  // 50km in meters
export const CACHE_STALE_TIME = 1000 * 60 * 5  // 5 min

export const ANIMATION_TIMINGS = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.45,
}

export const ANIMATION_EASE = [0.22, 1, 0.36, 1]

export const ANIMATION_MS = {
  fast: `${ANIMATION_TIMINGS.fast * 1000}ms`,
  normal: `${ANIMATION_TIMINGS.normal * 1000}ms`,
  slow: `${ANIMATION_TIMINGS.slow * 1000}ms`,
}