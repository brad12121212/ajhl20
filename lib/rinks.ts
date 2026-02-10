/**
 * Predefined rink venues for AJHL. Used for event location, directions, and emails.
 * Admin can also specify a custom "rink name" (ice sheet) per event.
 */

export type VenueKey =
  | "rink_on_the_beach"
  | "ice_plex"
  | "ice_den"
  | "palm_beach_skate_zone"
  | "boca_ice";

export type RinkVenue = {
  key: VenueKey;
  name: string;
  address: string;
  addressForMaps: string; // URL-encoded or comma format for map links
  phone: string;
  googleMapsUrl: string;
  wazeUrl: string;
  appleMapsUrl: string;
};

function buildMapUrls(address: string) {
  const encoded = encodeURIComponent(address);
  return {
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
    wazeUrl: `https://www.waze.com/ul?q=${encoded}`,
    appleMapsUrl: `https://maps.apple.com/?address=${encoded}`,
  };
}

export const RINK_VENUES: RinkVenue[] = [
  {
    key: "rink_on_the_beach",
    name: "Rink on the Beach",
    address: "4601 N Federal Hwy, Pompano Beach, FL 33064",
    addressForMaps: "4601 N Federal Hwy, Pompano Beach, FL 33064",
    phone: "(954) 943-1437",
    ...buildMapUrls("4601 N Federal Hwy, Pompano Beach, FL 33064"),
  },
  {
    key: "ice_plex",
    name: "Baptist Health IcePlex",
    address: "800 NE 8th St, Fort Lauderdale, FL 33304",
    addressForMaps: "800 NE 8th St, Fort Lauderdale, FL 33304",
    phone: "(954) 835-7080",
    ...buildMapUrls("800 NE 8th St, Fort Lauderdale, FL 33304"),
  },
  {
    key: "ice_den",
    name: "Panthers IceDen",
    address: "3299 Sportsplex Dr, Coral Springs, FL 33065",
    addressForMaps: "3299 Sportsplex Dr, Coral Springs, FL 33065",
    phone: "(954) 341-9956",
    ...buildMapUrls("3299 Sportsplex Dr, Coral Springs, FL 33065"),
  },
  {
    key: "palm_beach_skate_zone",
    name: "Palm Beach Skate Zone",
    address: "8125 Lake Worth Rd, Lake Worth, FL 33467",
    addressForMaps: "8125 Lake Worth Rd, Lake Worth, FL 33467",
    phone: "(561) 963-5900",
    ...buildMapUrls("8125 Lake Worth Rd, Lake Worth, FL 33467"),
  },
  {
    key: "boca_ice",
    name: "Boca Ice",
    address: "TBD",
    addressForMaps: "TBD",
    phone: "TBD",
    ...buildMapUrls("TBD"),
  },
];

const byKey = new Map(RINK_VENUES.map((v) => [v.key, v]));

export function getVenue(key: VenueKey | string | null): RinkVenue | null {
  if (!key) return null;
  return byKey.get(key as VenueKey) ?? null;
}

export function getVenueKeys(): VenueKey[] {
  return RINK_VENUES.map((v) => v.key);
}
