import { GameRepository } from "../repositories/game.repository";
import { ImageRepository } from "../repositories/image.repository";
import { TeamRepository } from "../repositories/team.repository";
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class TableService {
    constructor(private gameRepo: GameRepository, private teamRepo: TeamRepository, private imageRepo: ImageRepository) { }

    async loadLeagueTable(leagueId: number) {
        try {
            const games = await this.gameRepo.getGamesByLeagueId(`${leagueId}`);

            const teamsStats: { [teamId: number]: { points: number; goalsFor: number; goalsAgainst: number; gamesPlayed: number } } = {};

            games.forEach(game => {
                if (game.result) {
                    const [homeScore, awayScore] = game.result.split('-').map(Number);

                    if (!teamsStats[game.home_team_id]) {
                        teamsStats[game.home_team_id] = { points: 0, goalsFor: 0, goalsAgainst: 0, gamesPlayed: 0 };
                    }
                    if (!teamsStats[game.away_team_id]) {
                        teamsStats[game.away_team_id] = { points: 0, goalsFor: 0, goalsAgainst: 0, gamesPlayed: 0 };
                    }

                    teamsStats[game.home_team_id].goalsFor += homeScore;
                    teamsStats[game.home_team_id].goalsAgainst += awayScore;
                    teamsStats[game.away_team_id].goalsFor += awayScore;
                    teamsStats[game.away_team_id].goalsAgainst += homeScore;

                    teamsStats[game.home_team_id].gamesPlayed++;
                    teamsStats[game.away_team_id].gamesPlayed++;

                    if (homeScore > awayScore) {
                        teamsStats[game.home_team_id].points += 3;
                    } else if (awayScore > homeScore) {
                        teamsStats[game.away_team_id].points += 3;
                    } else {
                        teamsStats[game.home_team_id].points += 1;
                        teamsStats[game.away_team_id].points += 1;
                    }
                }
            });

            const sortedTeams = Object.keys(teamsStats).map(teamId => ({
                teamId: Number(teamId),
                ...teamsStats[Number(teamId)],
            })).sort((a, b) => {
                if (b.points === a.points) {
                    const goalDifferenceB = b.goalsFor - b.goalsAgainst;
                    const goalDifferenceA = a.goalsFor - a.goalsAgainst;
                    return goalDifferenceB - goalDifferenceA;
                }
                return b.points - a.points;
            });

            const teams = await this.teamRepo.getTeamsByIds(sortedTeams.map(team => team.teamId.toString()));

            const leagueTable = await Promise.all(sortedTeams.map(async teamStat => {
                const team = teams.find(t => t.id === teamStat.teamId);
                const photoUrl = await this.imageRepo.getPhotoUrl(team.photo_url);
                return {
                    name: team.name,
                    points: teamStat.points,
                    goalsFor: teamStat.goalsFor,
                    goalsAgainst: teamStat.goalsAgainst,
                    gamesPlayed: teamStat.gamesPlayed,
                    photoUrl,
                    id: team.id
                };
            }));

            return leagueTable;
        } catch (error) {
            console.error('Chyba při načítání tabulky ligy:', error);
            throw error;
        }
    }
}