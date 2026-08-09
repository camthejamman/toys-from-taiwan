import { createFileRoute } from '@tanstack/react-router'
import { VideoEmbed } from '../components/VideoEmbed'
import { videos } from '../data/videos'

export const Route = createFileRoute('/videos/')({
  component: Jams,
})

function Jams() {
  return (
    <>
      <p className="-mt-2 mb-8 max-w-2xl text-muted">
        Every video is a real live loop — no backing tracks, built layer by
        layer on screen. Tap a thumbnail to play it right here.
      </p>
      <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoEmbed key={video.id} video={video} />
        ))}
      </div>
    </>
  )
}
