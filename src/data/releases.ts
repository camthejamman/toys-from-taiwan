import shortsVol1Cover from '../assets/images/shorts-vol-1.jpg'

export type Release = {
  slug: string
  title: string
  year: number
  releaseDate: string
  cover: string
  coverAlt: string
  blurb: string
  tags: string[]
  trackCount: number
  bandcampUrl: string
  /** Bandcamp album id — from the album page's bc-page-properties meta tag. */
  bandcampAlbumId: string
}

/**
 * Discography, newest first. To add a release: drop the cover art in
 * src/assets/images, add an entry here, and the Music page picks it up.
 */
export const releases: Release[] = [
  {
    slug: 'shorts-vol-1',
    title: 'Shorts! Vol. 1',
    year: 2026,
    releaseDate: '2026-07-30',
    cover: shortsVol1Cover,
    coverAlt:
      'Shorts! Vol. 1 album cover — rainbow chrome 3D lettering over a blue sky with clouds and a 3D-rendered pair of denim shorts',
    blurb:
      "A compilation of my live looping video shorts! It's all 100% live looping jams — 40 bite-size tracks of cheesy-midi, video-game-flavored grooves, every one looped live with no backing tracks.",
    tags: ['live looping', 'game music', 'vaporwave', 'midi', 'experimental'],
    trackCount: 40,
    bandcampUrl: 'https://toysfromtaiwan.bandcamp.com/album/shorts-vol-1',
    bandcampAlbumId: '3995634118',
  },
]
