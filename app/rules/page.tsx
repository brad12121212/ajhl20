import Link from "next/link";

export const metadata = {
  title: "Rules | AJHL 2.0",
  description: "AJHL2.0 league rules, game structure, and guidelines.",
};

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Home
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900">AJHL2.0 – Rules</h1>
      <p className="mt-1 text-sm text-zinc-500">Rules vary by league. Updated January 2026.</p>

      <section className="mt-8 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">1. Game structure</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-700">
            <li><strong>All leagues</strong> – Three periods of 13 minutes each; game concludes when all time has expired.</li>
            <li><strong>All leagues</strong> – Each team has 1 timeout. Timeout carries over to OT if unused.</li>
            <li><strong>C1/C2/C3</strong> – Running clock once the third period starts and a team is losing by six or more goals. Clock returns to stopped if the gap closes to two goals. 10‑goal differential triggers mercy rule (game ends; players may finish in pickup mode).</li>
            <li><strong>C4/DC/D</strong> – Running clock rule does not apply regardless of score (exception: goalie ejection rule).</li>
            <li><strong>Rule of 13</strong> – Captains seed subs so regular-season gameday rosters have 13 players.</li>
            <li><strong>Full-time roster return</strong> – A full-time roster player who paid in full may return (injury, work, or personal absence) without the four-game sub qualification, including playoffs.</li>
            <li><strong>Playoffs</strong> – Only grandfathered subs with more than 4 games with one team; sub must be equal or lower skill than the player replaced. No new subs in playoffs.</li>
            <li><strong>Goalie ejection</strong> – Team plays with six skaters at even strength. AJHL2.0 does not find a replacement. If that team goes down by 6, running clock; 10‑goal difference ends game (mercy rule).</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-zinc-900">2. Icing</h2>
          <p className="mt-1 text-sm text-zinc-700">C1/C2/C3: red line icing. C4/DC/D: blue line icing.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-zinc-900">3. Scoring caps</h2>
          <ul className="mt-2 list-inside list-disc space-y-0.5 text-sm text-zinc-700">
            <li>C1/C2 – No goal cap</li>
            <li>C3 – No goal cap</li>
            <li>C4 – No player more than 3 goals (resets for OT, including playoffs)</li>
            <li>DC – No goal cap</li>
            <li>D – 3 goal cap</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-zinc-900">4. Penalties</h2>
          <p className="mt-1 text-sm text-zinc-700">Any player with 3 penalties in a row or 4 penalties overall in one game is automatically ejected.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-zinc-900">5. Regular season overtime</h2>
          <p className="mt-1 text-sm text-zinc-700">3v3 for five minutes, running clock; clock stops for the last minute, penalties, or officials timeout. First goal wins. If tied after OT, five-round shootout; if still tied, game ends in a tie.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-zinc-900">A. Playoff overtime</h2>
          <p className="mt-1 text-sm text-zinc-700">First OT: 5v5, five minutes, running clock (stops last minute, penalties, officials timeout). Second OT: 3v3, five minutes, same clock rules. If still tied: 3-round shootout. OT penalties: power play team adds skaters (e.g. 3v3 becomes 3v4, then 3v5); when PP ends, teams rebalance to 3v3.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Best-of-2 playoff series</h2>
          <ul className="mt-2 list-inside list-disc space-y-0.5 text-sm text-zinc-700">
            <li>Two games. Game 1 may end in a tie; Game 2 must have a winner.</li>
            <li>Win both → advance. Tie in Game 1 + win Game 2 → Game 2 winner advances. Split (1-1 or 0-0-2) → tiebreaker: 5v5 OT (5 min, sudden death), then 3v3 OT (5 min, sudden death), then 3-round shootout.</li>
          </ul>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <h2 className="text-lg font-semibold text-zinc-900">USA Hockey rules</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Official USA Hockey playing rules apply.{" "}
            <a
              href="https://cdn1.sportngin.com/attachments/document/603a-2502129/2021-25_USAH_Playing_Rules.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:underline"
            >
              Open USA Hockey Rules PDF
            </a>
          </p>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
          <h2 className="text-lg font-semibold text-amber-900">Statement from the founders</h2>
          <p className="mt-2 text-sm text-zinc-700">
            We ask all captains to review and pass on to players: (1) USA Hockey membership is mandatory; provide USA Hockey number to your Disciplinary Board representative. (2) Players must not contact ownership regarding disciplinary matters—violators receive an automatic game suspension. (3) Use proper protocol: your team&apos;s board representative or ajhl20.discpboard@gmail.com. (4) Disciplinary Board operations: see the league website. (5) During games, matters are handled by the referee; management assists only with league-specific rules. (6) The Board can apply supplemental discipline above USA Hockey minimums. (7) Do not take disputes off the ice; bring concerns to the Disciplinary Board after the game.
          </p>
          <p className="mt-3 text-sm font-medium text-zinc-800">
            — Anthony Baratta, Jean Paul St. Germaine, Joey Vetere
          </p>
        </div>
      </section>
    </div>
  );
}
