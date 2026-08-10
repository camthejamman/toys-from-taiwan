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
    date: '2026-07-17',
    venue: 'Dragonfly Lounge — Live Music w/ Cam Jam',
    city: 'Neptune Beach, FL',
    href: 'https://dragonflylounge-beaches.com/',
  },
  {
    date: '2026-06-20',
    time: '4:00–7:00pm',
    venue: 'Green Room Brewing — 15 Year Anniversary',
    city: 'Jacksonville Beach, FL',
    href: 'https://greenroombrewing.com/',
  },
  {
    date: '2026-06-06',
    time: '7:00–10:00pm',
    venue: 'Solune Coffee',
    city: 'Jacksonville, FL',
  },
  {
    date: '2026-05-02',
    time: '8:00–11:00pm',
    venue: 'Dragonfly Lounge',
    city: 'Neptune Beach, FL',
    href: 'https://dragonflylounge-beaches.com/',
  },
  {
    date: '2026-04-11',
    time: '6:00–9:00pm',
    venue: "Spinster Abbott's",
    city: 'St. Augustine, FL',
  },
  {
    date: '2026-04-04',
    time: '8:00–11:00pm',
    venue: 'Dragonfly Lounge',
    city: 'Neptune Beach, FL',
    href: 'https://dragonflylounge-beaches.com/',
  },
  {
    date: '2026-03-28',
    time: '7:00pm',
    venue: 'Solune Coffee — Eccentrically Electric Energy (E3)',
    city: 'Jacksonville, FL',
    note: 'Free show w/ Veritas Prism & Cellular Terror',
  },
  {
    date: '2026-02-18',
    time: '5:00–8:00pm',
    venue: 'Graet Goods — West King Wednesday',
    city: 'St. Augustine, FL',
    href: 'https://www.facebook.com/graetgoods',
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
