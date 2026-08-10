import { SpriteIcon } from './SpriteIcon'
import { formatShowDate } from '../data/shows'
import type { Show } from '../data/shows'

export function ShowList({ shows }: { shows: Show[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-4 p-0 xl:grid xl:grid-cols-2">
      {shows.map((show) => (
        <li
          key={`${show.date}-${show.venue}`}
          className="card-glass flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-4">
            <SpriteIcon
              name="icon-calendar"
              className="mt-1 h-6 w-6 shrink-0 text-accent"
            />
            <div>
              <p className="m-0 font-semibold text-ink">
                {formatShowDate(show.date)}
                {show.time ? (
                  <span className="whitespace-nowrap font-normal text-muted"> · {show.time}</span>
                ) : null}
              </p>
              <p className="m-0 text-ink">{show.venue}</p>
              <p className="m-0 text-sm text-muted">
                {show.city}
                {show.note ? ` · ${show.note}` : ''}
              </p>
            </div>
          </div>
          {show.href ? (
            <a
              href={show.href}
              target="_blank"
              rel="noreferrer"
              className="btn-3d inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-card-border bg-card px-4 py-1.5 text-sm font-semibold text-accent no-underline transition hover:border-accent sm:w-fit"
            >
              Details
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
