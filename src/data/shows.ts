export type Show = {
  /** ISO date, e.g. '2026-09-12' — local venue date. */
  date: string
  time?: string
  venue: string
  city: string
  /** Optional link for details/tickets/venue page. */
  href?: string
  note?: string
}

/**
 * Upcoming shows — add entries here and the Shows page (and home teaser)
 * update automatically. Newest additions can go anywhere; lists are sorted
 * by date before rendering.
 */
export const upcomingShows: Show[] = [
  // {
  //   date: '2026-09-12',
  //   time: '6:00–9:00pm',
  //   venue: 'Example Taproom',
  //   city: 'Jacksonville Beach, FL',
  //   href: 'https://example.com',
  //   note: 'All ages',
  // },
]

/** Rooms the live-looping rig has filled. */
export const pastShows: Show[] = [
  {
    date: '2024-06-19',
    time: '6:00–8:00pm',
    venue: 'Graet Goods — West King Wednesday',
    city: 'St. Augustine, FL',
    href: 'https://www.facebook.com/graetgoods',
  },
  {
    date: '2024-06-15',
    time: '4:00–6:30pm',
    venue: 'Green Room Brewing — 13 Year Anniversary',
    city: 'Jacksonville Beach, FL',
    href: 'https://www.instagram.com/reel/C6e_K0Au2Mv/',
  },
  {
    date: '2022-11-26',
    time: '4:00–6:30pm',
    venue: 'Bold Bean Coffee Roasters',
    city: 'Jacksonville, FL',
    href: 'https://boldbeancoffee.com/',
  },
  {
    date: '2022-10-22',
    time: '6:30–9:30pm',
    venue: 'Wildcrafters — Booze-Free Bar',
    city: 'Jacksonville, FL',
    href: 'https://www.instagram.com/wildcraftersjax/',
  },
]

export function sortShows(shows: Show[], direction: 'asc' | 'desc' = 'asc') {
  return [...shows].sort((a, b) =>
    direction === 'asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date),
  )
}

export function formatShowDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
