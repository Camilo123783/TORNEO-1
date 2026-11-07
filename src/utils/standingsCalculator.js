/**
 * Calculates standings table for a group of teams based on finished matches.
 * Standard Microfútbol / Fútbol de Salón rules:
 * - 3 points for a win
 * - 1 point for a draw
 * - 0 points for a loss
 * Tiebreakers: Points > Goal Difference > Goals For > Fewest Goals Against
 */
export function calculateGroupStandings(teams, matches, groupKey) {
  // Filter teams in this group
  const groupTeams = teams.filter(t => t.group === groupKey);

  // Initialize stats for each team
  const statsMap = {};
  groupTeams.forEach(t => {
    statsMap[t.id] = {
      team: t,
      pj: 0, // Partidos Jugados
      pg: 0, // Ganados
      pe: 0, // Empatados
      pp: 0, // Perdidos
      gf: 0, // Goles a Favor
      gc: 0, // Goles en Contra
      dg: 0, // Diferencia de Gol
      pts: 0, // Puntos
      form: [] // Last results: 'W', 'D', 'L'
    };
  });

  // Filter finished matches for this group
  const finishedGroupMatches = matches.filter(
    m => m.group === groupKey && 
         m.status === 'finished' && 
         m.home_score !== null && 
         m.away_score !== null &&
         statsMap[m.home_team_id] && 
         statsMap[m.away_team_id]
  );

  finishedGroupMatches.forEach(m => {
    const home = statsMap[m.home_team_id];
    const away = statsMap[m.away_team_id];

    home.pj += 1;
    away.pj += 1;
    home.gf += Number(m.home_score);
    home.gc += Number(m.away_score);
    away.gf += Number(m.away_score);
    away.gc += Number(m.home_score);

    if (m.home_score > m.away_score) {
      home.pg += 1;
      home.pts += 3;
      home.form.push('W');
      away.pp += 1;
      away.form.push('L');
    } else if (m.home_score < m.away_score) {
      away.pg += 1;
      away.pts += 3;
      away.form.push('W');
      home.pp += 1;
      home.form.push('L');
    } else {
      home.pe += 1;
      away.pe += 1;
      home.pts += 1;
      away.pts += 1;
      home.form.push('D');
      away.form.push('D');
    }
  });

  // Calculate goal differences
  Object.values(statsMap).forEach(stat => {
    stat.dg = stat.gf - stat.gc;
  });

  // Convert to array and sort
  const standings = Object.values(statsMap);
  standings.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    if (a.gc !== b.gc) return a.gc - b.gc;
    return a.team.name.localeCompare(b.team.name);
  });

  return standings;
}
