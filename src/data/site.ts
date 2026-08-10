/**
 * Central site data — edit this file to update links, contact info, and
 * platform handles everywhere on the site at once.
 */

export const site = {
  /** Absolute production URL (no trailing slash) — used for og: meta tags. */
  url: 'https://camthejamman.github.io/toys-from-taiwan',
  name: 'Toys From Taiwan',
  artist: 'JAM',
  artistChinese: '果酱',
  tagline: '100% Live-Looping with JAM',
  location: 'Jacksonville Beach, FL',
  description:
    'Get ready to jam out with Toys From Taiwan, a 100% live-looping one man jam band music project! Join me, Jam, the one-man jam band, as I craft live looping instrumental jam sessions using an array of musical instruments, including guitar, bass, keyboards, theremins, drum machines, loop stations, and a ton of effects pedals! Experience a fusion of psychedelic, surfer rock, indie vibes, vaporwave, and global influences in every live performance. Welcome to Toys From Taiwan!',
  email: 'camjamt@gmail.com',
  phone: '9045633433',
  phoneDisplay: '(904) 563-3433',
  linktree: 'https://linktr.ee/jamontheweb',
} as const

export type PlatformLink = {
  id: string
  label: string
  href: string
  icon: string
  /** Short human note, shown where there is room (e.g. Support page). */
  note?: string
  /** Light-mode icon color. Brand color where one exists; unset falls
   * back to the rotating vibrant palette. Dark mode renders white. */
  color?: string
}

/** Social platforms — where the shows, streams, and videos live. */
export const socials: PlatformLink[] = [
  {
    id: 'youtube',
    label: 'YouTube',
    href: 'https://www.youtube.com/@toysfromtaiwan',
    icon: 'icon-youtube',
    note: 'Full jams & video shorts',
    color: '#e00000',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    href: 'https://www.tiktok.com/@toysfromtaiwan',
    icon: 'icon-tiktok',
    note: 'Live every Thursday · 9:30pm ET',
    color: '#161823',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/toysfromtaiwan/',
    icon: 'icon-instagram',
    note: 'Clips & show announcements',
    color: '#e4405f',
  },
  {
    id: 'twitch',
    label: 'Twitch',
    href: 'https://www.twitch.tv/toysfromtaiwan',
    icon: 'icon-twitch',
    note: 'Live-looping streams',
    color: '#9146ff',
  },
]

/** Streaming / listening platforms — where the music lives. */
export const streaming: PlatformLink[] = [
  {
    id: 'spotify',
    label: 'Spotify',
    href: 'https://open.spotify.com/artist/2FOHOwAyJLD2RImyfPimKa',
    icon: 'icon-spotify',
    color: '#1db954',
  },
  {
    id: 'bandcamp',
    label: 'Bandcamp',
    href: 'https://toysfromtaiwan.bandcamp.com/',
    icon: 'icon-bandcamp',
    note: 'Name your price — best way to buy',
    color: '#408294',
  },
  {
    id: 'applemusic',
    label: 'Apple Music',
    href: 'https://music.apple.com/us/artist/toys-from-taiwan/6796355234',
    icon: 'icon-applemusic',
    color: '#fa233b',
  },
  {
    id: 'youtubemusic',
    label: 'YouTube Music',
    href: 'https://music.youtube.com/channel/UCS143MNau76WxnPjGWrMWRw',
    icon: 'icon-youtubemusic',
    color: '#e00000',
  },
]

/** Every platform, for the footer strip. */
export const allPlatforms: PlatformLink[] = [
  ...socials,
  ...streaming.filter((p) => p.id !== 'youtubemusic'),
]

export type PaymentLink = PlatformLink & { handle: string }

/** Tip jar — Support page. */
export const payments: PaymentLink[] = [
  {
    id: 'cashapp',
    label: 'Cash App',
    href: 'https://cash.app/$jamontheweb',
    icon: 'icon-cashapp',
    handle: '$jamontheweb',
  },
  {
    id: 'venmo',
    label: 'Venmo',
    href: 'https://account.venmo.com/u/jamontheweb',
    icon: 'icon-venmo',
    handle: '@jamontheweb',
  },
  {
    id: 'paypal',
    label: 'PayPal',
    href: 'https://www.paypal.com/paypalme/toysfromtaiwan',
    icon: 'icon-paypal',
    handle: 'paypal.me/toysfromtaiwan',
  },
]
