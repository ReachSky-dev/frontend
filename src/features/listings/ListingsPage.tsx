import { Link } from 'react-router-dom'
import type { AuctionDto } from '../../api/types'
import { ApiError } from '../../api/client'
import { Button } from '../../components/ui/Button'
import { Countdown } from '../../components/ui/Countdown'
import { PriceDisplay } from '../../components/ui/PriceDisplay'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatusDot } from '../../components/ui/StatusDot'
import { useTheme } from '../../lib/theme'
import { auctionStatusShape, auctionTypeLabel } from '../auctions/auctionMeta'
import { useAuctions } from '../auctions/useAuctions'
import { useCountdown } from '../auctions/useCountdown'
import { ListingCard } from './ListingCard'
import { useListings } from './useListings'

function LiveCountdown({ endsAt }: { endsAt: string }) {
  const { h, m, s } = useCountdown(endsAt)
  return <Countdown h={h} m={m} s={s} label="Koniec za" />
}

function LiveAuctionPanel({ auction, title }: { auction: AuctionDto; title?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-layer">
      {/* Nagłówek — sygnalizuje że to właśnie ta aukcja ucieka najszybciej */}
      <div className="flex items-center justify-between border-b border-line px-6 py-3">
        <div className="flex items-center gap-2">
          <StatusDot shape={auctionStatusShape[auction.status]} label="" />
          <span className="text-sm font-medium text-price">Gorąca aukcja</span>
        </div>
        <span className="text-xs text-ink-3">{auctionTypeLabel[auction.type]}</span>
      </div>

      <div className="p-6">
        {/* Tytuł licytowanego zasobu */}
        {title && (
          <p className="mb-5 text-base font-medium leading-snug text-ink-1">{title}</p>
        )}

        {/* Cena i odliczanie */}
        <div className="flex items-end justify-between gap-4">
          <PriceDisplay
            amount={auction.currentPriceAmount}
            currency={auction.currentPriceCurrency}
            label="Cena bieżąca"
          />
          <div className="pb-1">
            <LiveCountdown endsAt={auction.endsAt} />
          </div>
        </div>

        <Link
          to={`/auctions/${auction.id}`}
          className="mt-6 block rounded bg-primary-solid px-4 py-2 text-center text-sm font-medium text-primary-text transition-opacity hover:opacity-90"
        >
          Licytuj teraz
        </Link>
      </div>
    </div>
  )
}

function HeroRight() {
  const { theme } = useTheme()
  const { data: auctions, isPending: auctionsPending } = useAuctions()
  const { data: listings } = useListings()

  if (auctionsPending) {
    return (
      <div className="overflow-hidden rounded-lg border border-line bg-layer">
        <div className="flex items-center justify-between border-b border-line px-6 py-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="space-y-5 p-6">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-end justify-between gap-4">
            <Skeleton className="h-14 w-40" />
            <Skeleton className="h-8 w-28" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    )
  }

  const live = (auctions ?? [])
    .filter(a => a.status === 'RUNNING')
    .sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime())[0]

  if (live) {
    const title = (listings ?? []).find(l => l.id === live.listingId)?.title
    return <LiveAuctionPanel auction={live} title={title} />
  }

  return (
    <img
      src={theme === 'dark' ? '/illustrations/hero.svg' : '/illustrations/hero-light.svg'}
      alt=""
      aria-hidden="true"
      className="w-full"
    />
  )
}

function Hero() {
  return (
    <div className="mb-12 grid grid-cols-12 items-center gap-8">
      <div className="col-span-12 sm:col-span-6 lg:col-span-5">
        <p className="mb-6 text-xl font-medium leading-snug text-ink-1 sm:text-2xl">
          Miejsca w busie, pokoje na jutro, terminy last-minute — licytowane zanim przepadną.
        </p>
        <Link
          to="/auctions"
          className="inline-block rounded bg-primary-solid px-5 py-2.5 text-sm font-medium text-primary-text transition-opacity hover:opacity-90"
        >
          Przeglądaj aukcje
        </Link>
      </div>
      <div className="col-span-12 sm:col-span-6 lg:col-span-7">
        <HeroRight />
      </div>
    </div>
  )
}

function ListingsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border border-line bg-layer p-4">
          <div className="flex justify-between gap-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="mt-auto flex flex-col gap-1">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ListingsPage() {
  const { data, isPending, isError, error, refetch } = useListings()
  const now = Date.now()
  const listings = (data ?? []).filter(l => new Date(l.windowEnd).getTime() > now)

  return (
    <div>
      <Hero />

      <h2 className="mb-4 text-lg font-medium text-ink-1">Aktywne oferty</h2>

      {/* Stan: ładowanie */}
      {isPending && <ListingsSkeleton />}

      {/* Stan: błąd */}
      {isError && (
        <div className="rounded-lg border border-err/20 bg-err-muted p-8 text-center">
          <p className="font-medium text-err">
            {error instanceof ApiError
              ? `${error.title}${error.detail ? ` — ${error.detail}` : ''}`
              : 'Nie udało się wczytać ofert.'}
          </p>
          <Button variant="secondary" buttonSize="sm" className="mt-4" onClick={() => void refetch()}>
            Spróbuj ponownie
          </Button>
        </div>
      )}

      {/* Stan: brak danych */}
      {!isPending && !isError && listings.length === 0 && (
        <div className="rounded-lg border border-line bg-layer p-12 text-center">
          <p className="text-ink-2">Brak aktywnych ofert.</p>
        </div>
      )}

      {/* Stan: dane */}
      {!isPending && !isError && listings.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}
