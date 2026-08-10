import { createFileRoute } from '@tanstack/react-router'
import { VideoEmbed } from '../components/VideoEmbed'
import { pageHead, site } from '../data/site'
import { videos } from '../data/videos'

export const Route = createFileRoute('/videos/')({
  component: Jams,
  head: () =>
    pageHead(
      '/videos/',
      `Videos · ${site.name}`,
      'Watch Toys From Taiwan live-looping videos — full jams, live streams, and video-game-flavored grooves, built one loop at a time.',
    ),
})

function Jams() {
  return (
    <>
      <p className="-mt-2 mb-8 max-w-2xl text-muted lg:max-w-3xl lg:text-lg">
        Every video is a real live loop — no backing tracks, built layer by
        layer on screen. Tap a thumbnail to play it right here.
      </p>
      <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:gap-x-6 2xl:gap-y-10">
        {videos.map((video, i) => (
          <div key={video.id} className="jam-card">
            <VideoEmbed video={video} eager={i < 3} />
          </div>
        ))}
      </div>
    </>
  )
}
