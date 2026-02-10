const RED_STYLE = { badge: "bg-red-100 text-red-800 border-red-200", border: "border-l-red-400", card: "bg-red-50/30" };

const LEAGUE_STYLES: Record<string, { badge: string; border: string; card: string }> = {
  A: RED_STYLE,
  B: RED_STYLE,
  C: RED_STYLE,
  D: RED_STYLE,
};

export function getLeagueStyles(league: string) {
  return LEAGUE_STYLES[league] ?? LEAGUE_STYLES.A;
}

type Props = { league: string; className?: string };

export function LeagueBadge({ league, className = "" }: Props) {
  const styles = getLeagueStyles(league);
  return (
    <span
      className={`inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border text-xs font-semibold ${styles.badge} ${className}`}
      title={`${league} League`}
    >
      {league}
    </span>
  );
}
