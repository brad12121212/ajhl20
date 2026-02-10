import Link from "next/link";

export const metadata = {
  title: "Contact & Staff | AJHL 2.0",
  description: "AJHL2.0 ownership, advisory council, and disciplinary board.",
};

const PHOTO_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect fill='%23e4e4e7' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23a1a1aa' font-size='10' font-family='system-ui'%3EPhoto%3C/text%3E%3C/svg%3E";

/** Staff photos from https://ajhl20.hockeyshift.com/staff (AJHL2.0 official staff page) */
const STAFF_PHOTOS: Record<string, string> = {
  "Anthony Baratta": "https://digitalshift-assets.sfo2.cdn.digitaloceanspaces.com/pw/2a2deb75-4ef2-46f5-994f-069ee0dfa915/p-dd71afd6-3f52-40a9-bdb1-a5bed8845999/1709187281-circle.jpg",
  "JP St. Germaine": "https://digitalshift-assets.sfo2.cdn.digitaloceanspaces.com/pw/2a2deb75-4ef2-46f5-994f-069ee0dfa915/p-a66a6725-5a7d-480a-bce6-4a2e42de7575/1709187233-circle.jpg",
  "Joey Vetere": "https://digitalshift-assets.sfo2.cdn.digitaloceanspaces.com/pw/2a2deb75-4ef2-46f5-994f-069ee0dfa915/p-f7c2a43e-8a07-41fb-9488-2f8582120029/1709187144-circle.jpg",
  "AJ Winne": "https://digitalshift-assets.sfo2.cdn.digitaloceanspaces.com/pw/2a2deb75-4ef2-46f5-994f-069ee0dfa915/p-c757c86b-1b61-4a33-8344-8c3f4832fc8d/1709187170-circle.jpg",
  "Matt Caflun": "https://digitalshift-assets.sfo2.cdn.digitaloceanspaces.com/pw/2a2deb75-4ef2-46f5-994f-069ee0dfa915/p-0e8513dc-294c-4c1c-9233-c6e93e4ec41e/1709187094-circle.jpg",
  "Bill Carlisle": "https://digitalshift-assets.sfo2.cdn.digitaloceanspaces.com/pw/2a2deb75-4ef2-46f5-994f-069ee0dfa915/p-f93e94dc-a942-4878-8b2d-ffda8882db2f/1709187118-circle.jpg",
  "Jay Dragum": "https://digitalshift-assets.sfo2.cdn.digitaloceanspaces.com/pw/2a2deb75-4ef2-46f5-994f-069ee0dfa915/p-86ee49ab-7915-4a28-8de0-cb478af0e926/1709187015-circle.jpg",
  "Benji Horowitz": "https://digitalshift-assets.sfo2.cdn.digitaloceanspaces.com/pw/2a2deb75-4ef2-46f5-994f-069ee0dfa915/p-4eb7e046-2b79-4365-8105-c2eb924576d5/1720752663-circle.jpg",
  "Gary Bilitis": "https://digitalshift-assets.sfo2.cdn.digitaloceanspaces.com/pw/2a2deb75-4ef2-46f5-994f-069ee0dfa915/p-1b2648e1-839c-4853-a9ff-1d7aabd68650/1709188256-circle.jpg",
  "Scott Caruso": "https://digitalshift-assets.sfo2.cdn.digitaloceanspaces.com/pw/2a2deb75-4ef2-46f5-994f-069ee0dfa915/p-adde1694-56ee-42a0-91fd-ef69a9c82f11/1709188411-circle.jpg",
  "Anthony DiFalco": "https://digitalshift-assets.sfo2.cdn.digitaloceanspaces.com/pw/2a2deb75-4ef2-46f5-994f-069ee0dfa915/p-ce045b24-6fc0-4efa-b10c-fcb815c3db9d/1720753563-circle.jpg",
  "Chava Sobreyra": "https://digitalshift-assets.sfo2.cdn.digitaloceanspaces.com/pw/2a2deb75-4ef2-46f5-994f-069ee0dfa915/p-04cab9a0-2f08-41b0-bf03-57aa2107e7c5/1720753729-circle.jpg",
};

function StaffCard({
  name,
  role,
  email,
  photoUrl,
}: {
  name: string;
  role: string;
  email?: string;
  photoUrl?: string;
}) {
  const src = photoUrl ?? PHOTO_PLACEHOLDER;
  return (
    <div className="flex gap-4 rounded-lg border border-zinc-200 bg-white p-4">
      <img
        src={src}
        alt=""
        className="h-20 w-20 shrink-0 rounded-lg object-cover"
        width={80}
        height={80}
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-zinc-900">{name}</p>
        <p className="text-sm text-zinc-600">{role}</p>
        {email && (
          <a href={`mailto:${email}`} className="mt-1 text-sm text-red-600 hover:underline">
            {email}
          </a>
        )}
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Home
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900">Contact & Staff</h1>
      <p className="mt-1 text-sm text-zinc-500">
        AJHL2.0 leadership, advisory council, and disciplinary board.
      </p>

      {/* Ownership – Co-Founders at top */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900">Ownership</h2>
        <ul className="mt-4 space-y-3">
          <li><StaffCard name="Anthony Baratta" role="Co-Founder" photoUrl={STAFF_PHOTOS["Anthony Baratta"]} /></li>
          <li><StaffCard name="JP St. Germaine" role="Co-Founder" photoUrl={STAFF_PHOTOS["JP St. Germaine"]} /></li>
        </ul>
      </section>

      {/* AJHL2.0 Officers */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-zinc-900">AJHL2.0 Officers</h2>
        <ul className="mt-4 space-y-3">
          <li><StaffCard name="Joey Vetere" role="AJHL20 – Treasurer / Monday Night C3–C1/2 Commissioner" photoUrl={STAFF_PHOTOS["Joey Vetere"]} /></li>
        </ul>
      </section>

      {/* Advisory Council – moved below Ownership / Mission / Officers */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-zinc-900">Advisory Council</h2>
        <ul className="mt-4 space-y-3">
          <li><StaffCard name="AJ Winne" role="Council Chair / Player's Board Chairman" photoUrl={STAFF_PHOTOS["AJ Winne"]} /></li>
          <li><StaffCard name="Joey Vetere" role="Council Chair / League Treasurer" photoUrl={STAFF_PHOTOS["Joey Vetere"]} /></li>
          <li><StaffCard name="Bill Carlisle" role="Player's Board Arbitrator / Goaltending Director" photoUrl={STAFF_PHOTOS["Bill Carlisle"]} /></li>
          <li><StaffCard name="Matt Caflun" role="Facilities Coordinator" photoUrl={STAFF_PHOTOS["Matt Caflun"]} /></li>
          <li><StaffCard name="Jay Dragum" role="Captains Liaison" photoUrl={STAFF_PHOTOS["Jay Dragum"]} /></li>
        </ul>
        <h3 className="mt-6 text-base font-semibold text-zinc-900">Advisory Council (detailed)</h3>
        <ul className="mt-4 space-y-3">
          <li><StaffCard name="AJ Winne" role="Advisory Council Chair Lead" photoUrl={STAFF_PHOTOS["AJ Winne"]} /></li>
          <li><StaffCard name="Joey Vetere" role="Advisory Council Vice Chair" photoUrl={STAFF_PHOTOS["Joey Vetere"]} /></li>
          <li><StaffCard name="Matt Caflun" role="Facilities Coordinator / Rink Ambassador" photoUrl={STAFF_PHOTOS["Matt Caflun"]} /></li>
          <li><StaffCard name="Bill Carlisle" role="Goaltending Director" photoUrl={STAFF_PHOTOS["Bill Carlisle"]} /></li>
          <li><StaffCard name="Jay Dragum" role="Captains Liaison" photoUrl={STAFF_PHOTOS["Jay Dragum"]} /></li>
          <li><StaffCard name="Benji Horowitz" role="Player Development" photoUrl={STAFF_PHOTOS["Benji Horowitz"]} /></li>
        </ul>
      </section>

      {/* Disciplinary Board */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-zinc-900">AJHL2.0 Players Disciplinary Board</h2>
        <ul className="mt-4 space-y-3">
          <li><StaffCard name="JP St. Germaine" role="Co-Founder – Commissioner" email="AJHLtwo.0@gmail.com" photoUrl={STAFF_PHOTOS["JP St. Germaine"]} /></li>
          <li><StaffCard name="Bill Carlisle" role="Disciplinary Board Arbitrator – Mediator – Chair" photoUrl={STAFF_PHOTOS["Bill Carlisle"]} /></li>
          <li><StaffCard name="Joey Vetere" role="Board Member" photoUrl={STAFF_PHOTOS["Joey Vetere"]} /></li>
          <li><StaffCard name="Gary Bilitis" role="Board Member" photoUrl={STAFF_PHOTOS["Gary Bilitis"]} /></li>
          <li><StaffCard name="Scott Caruso" role="Board Member" photoUrl={STAFF_PHOTOS["Scott Caruso"]} /></li>
          <li><StaffCard name="AJ Winne" role="Board Member" photoUrl={STAFF_PHOTOS["AJ Winne"]} /></li>
          <li><StaffCard name="Anthony DiFalco" role="Board Member" photoUrl={STAFF_PHOTOS["Anthony DiFalco"]} /></li>
          <li><StaffCard name="Chava Sobreyra" role="Board Member" photoUrl={STAFF_PHOTOS["Chava Sobreyra"]} /></li>
        </ul>
        <p className="mt-3 text-sm text-zinc-600">
          For disciplinary matters: contact your team&apos;s board representative or{" "}
          <a href="mailto:ajhl20.discpboard@gmail.com" className="text-red-600 hover:underline">
            ajhl20.discpboard@gmail.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
