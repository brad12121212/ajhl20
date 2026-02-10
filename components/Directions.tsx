import { getVenue } from "@/lib/rinks";

type Props = {
  venueKey: string | null;
};

export function Directions({ venueKey }: Props) {
  const venue = getVenue(venueKey);
  if (!venue) return null;

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <h3 className="text-sm font-medium text-zinc-900">Location & directions</h3>
      <p className="mt-1 text-sm text-zinc-700">{venue.address}</p>
      <p className="mt-0.5 text-sm text-zinc-600">
        <a href={`tel:${venue.phone.replace(/\D/g, "")}`} className="hover:underline">
          {venue.phone}
        </a>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={venue.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm ring-1 ring-zinc-200 hover:bg-zinc-50"
        >
          Google Maps
        </a>
        <a
          href={venue.wazeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm ring-1 ring-zinc-200 hover:bg-zinc-50"
        >
          Waze
        </a>
        <a
          href={venue.appleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm ring-1 ring-zinc-200 hover:bg-zinc-50"
        >
          Apple Maps
        </a>
      </div>
    </div>
  );
}
