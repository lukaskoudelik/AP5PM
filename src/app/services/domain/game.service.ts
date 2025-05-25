import { GameRepository } from '../repositories/game.repository';
import { TeamService } from './team.service';
import { GamePlayerRepository } from '../repositories/game-player.repository';
import { GoalRepository } from '../repositories/goal.repository';
import { CardRepository } from '../repositories/card.repository';
import { LeagueRepository } from '../repositories/league.repository';
import { ImageRepository } from '../repositories/image.repository';
import { RefereeRepository } from '../repositories/referee.repository';
import { StadiumRepository } from '../repositories/stadium.repository';
import { PlayerRepository } from '../repositories/player.repository';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class GameService {
    constructor(
        private gameRepo: GameRepository,
        private teamService: TeamService,
        private gamePlayerRepo: GamePlayerRepository,
        private goalRepo: GoalRepository,
        private cardRepo: CardRepository,
        private leagueRepo: LeagueRepository,
        private imageRepo: ImageRepository,
        private refereeRepo: RefereeRepository,
        private stadiumRepo: StadiumRepository,
        private playerRepo: PlayerRepository
    ) { }

    async loadGamesByDate(leaguesMap: { [key: string]: string }, date: string) {
        try {
            const games = await this.gameRepo.getGamesByDate(date);

            const gamesWithTeams = await Promise.all(games.map(async (game) => {
                const { homeTeam, awayTeam } = await this.teamService.getTeamsWithPhotos(game.home_team_id, game.away_team_id);
                const leagueName = leaguesMap[game.league_id] || 'Neznámá liga';

                return {
                    ...game,
                    homeTeam,
                    awayTeam,
                    leagueName
                };
            }));

            const gamesGroupedByLeague: { [key: string]: any[] } = {};
            for (const game of gamesWithTeams) {
                if (!gamesGroupedByLeague[game.leagueName]) {
                    gamesGroupedByLeague[game.leagueName] = [];
                }
                gamesGroupedByLeague[game.leagueName].push(game);
            }

            for (const league in gamesGroupedByLeague) {
                gamesGroupedByLeague[league].sort((a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );
            }

            return gamesGroupedByLeague;

        } catch (error) {
            console.error('Chyba při načítání zápasů', error);
            return {};
        }
    }

    async loadGamesWithTeams(type: 'league' | 'team', id: string) {
        try {
            let games;
            if (type === 'team') {
                games = await this.gameRepo.getGamesByTeamId(id);
            }
            else {
                games = await this.gameRepo.getGamesByLeagueId(id);
            }

            const gamesWithTeams = await Promise.all(games.map(async (game) => {
                const { homeTeam, awayTeam } = await this.teamService.getTeamsWithPhotos(game.home_team_id, game.away_team_id);
                return {
                    ...game,
                    homeTeam,
                    awayTeam
                };
            }));

            const gamesPlayed = gamesWithTeams.filter(game => game.result).sort((a, b) => b.round_number - a.round_number);;
            const gamesToPlay = gamesWithTeams.filter(game => !game.result);

            return [gamesPlayed, gamesToPlay];

        } catch (error) {
            console.error('Chyba při načítání zápasů s týmy:', error);
            return [];
        }
    }

    async loadPlayersGames(playerId: number) {
        try {

            const gamePlayersData = await this.gamePlayerRepo.getGamePlayersByPlayerId(`${playerId}`);
            const playersGame = gamePlayersData;
            let allGames: any[] = [];
            for (const playerGame of playersGame) {
                const game = await this.gameRepo.getGameById(`${playerGame.game_id}`);
                if (game) {
                    allGames.push(game);
                }
            }

            const games = allGames;

            const gamesWithTeams = await Promise.all(games.map(async (game) => {
                const playerGame = playersGame.find(pg => pg.game_id === game.id);
                const { homeTeam, awayTeam } = await this.teamService.getTeamsWithPhotos(game.home_team_id, game.away_team_id);

                const goals = await this.goalRepo.getGoalsByGameId(`${game.id}`);
                const playerGoals = goals.filter(goal => goal.player_id === playerId);

                const playerGoalsCount = playerGoals.length;
                const playerGoalsMinutes = playerGoalsCount > 0
                    ? `${playerGoals.map(goal => `${goal.minute}'`).join(', ')}`
                    : '';

                const cards = await this.cardRepo.getCardsByGameId(`${game.id}`);

                const playerCards = cards.filter(card => card.player_id === playerId);

                const yellowCards = playerCards.filter(card => card.type === 'yellow');
                const secondYellowCards = playerCards.filter(card => card.type === 'second_yellow');
                const redCards = playerCards.filter(card => card.type === 'red');

                const yellowCardMinutes = yellowCards.length > 0
                    ? `${yellowCards.map(card => `${card.minute}'`).join(', ')}`
                    : '';

                const secondYellowCardMinutes = secondYellowCards.length > 0
                    ? `${secondYellowCards.map(card => `${card.minute}'`).join(', ')}`
                    : '';

                const redCardMinutes = redCards.length > 0
                    ? `${redCards.map(card => `${card.minute}'`).join(', ')}`
                    : '';

                let playerRole: string;
                if (playerGame?.role == "starter") {
                    playerRole = "základní sestava";
                }
                else if (playerGame?.role == "bench") {
                    playerRole = "střídající hráč";
                }
                else {
                    playerRole = "mimo sestavu";
                }

                const role = playerRole;

                const homeOrAway = playerGame?.home_or_away;

                return {
                    ...game,
                    homeTeam,
                    awayTeam,
                    role,
                    homeOrAway,
                    playerGoalsCount,
                    playerGoalsMinutes,
                    yellowCardCount: yellowCards.length,
                    yellowCardMinutes,
                    secondYellowCardCount: secondYellowCards.length,
                    secondYellowCardMinutes,
                    redCardCount: redCards.length,
                    redCardMinutes
                };
            }));

            return gamesWithTeams.filter(game => game.result).sort((a, b) => b.round_number - a.round_number);;

        } catch (error) {
            console.error('Chyba při načítání zápasů hráče:', error);
            return [];
        }
    }

    async getGame(id: string): Promise<any> {
        const game = await this.gameRepo.getGameById(id);
        return game;
    }

    async loadGameDetails(gameId: string) {
        try {
            const game = await this.gameRepo.getGameById(gameId);

            if (!game) {
                console.warn('Zápas nenalezen');
                return;
            }

            const { homeTeam, awayTeam } = await this.teamService.getTeamsWithPhotos(game.home_team_id, game.away_team_id);
            const league = await this.leagueRepo.getLeagueById(`${game.league_id}`)
            const leaguePhotoUrl = await this.imageRepo.getPhotoUrl(league.photo_url);

            let score_home = null;
            let score_away = null;

            if (game.result) {
                const [home, away] = game.result.split('-').map(Number);
                score_home = home !== null ? home : null;
                score_away = away !== null ? away : null;
            }

            let stadiumName = null;
            if (game.stadium_id) {
                const stadium = await this.stadiumRepo.getStadiumById(`${game.stadium_id}`);
                stadiumName = stadium ? stadium.name : null;
            } else {
                const stadium = await this.stadiumRepo.getStadiumById(`${homeTeam.stadium_id}`)
                stadiumName = stadium ? stadium.name : null;
            }

            const referee = await this.refereeRepo.getRefereeById(`${game.referee_id}`);
            const first_ar = await this.refereeRepo.getRefereeById(`${game.first_assistant_id}`);
            const second_ar = await this.refereeRepo.getRefereeById(`${game.second_assistant_id}`);

            return {
                ...game,
                homeTeam,
                awayTeam,
                league,
                leaguePhotoUrl,
                score_home,
                score_away,
                stadiumName,
                referee,
                first_ar,
                second_ar,
            };


        } catch (error) {
            console.error('Chyba při načítání zápasu s týmy:', error);
            return [];
        }
    }

    async loadGoalsAndCards(gameId: string) {
        try {
            const goals = await this.goalRepo.getGoalsByGameId(gameId);
            const cards = await this.cardRepo.getCardsByGameId(gameId);

            const enrichedGoals = await Promise.all(
                goals.map(async (goal) => {
                    const player = await this.playerRepo.getPlayerById(goal.player_id);
                    return {
                        ...goal,
                        playerName: `${player.first_name} ${player.second_name}`,
                        homeOrAway: goal.home_or_away,
                        player
                    };
                })
            );

            const enrichedCards = await Promise.all(
                cards.map(async (card) => {
                    const player = await this.playerRepo.getPlayerById(card.player_id);
                    return {
                        ...card,
                        playerName: `${player.first_name} ${player.second_name}`,
                        homeOrAway: card.home_or_away,
                        player
                    };
                })
            );

            const homeGoals = enrichedGoals.filter(goal => goal.homeOrAway === 'home');
            const awayGoals = enrichedGoals.filter(goal => goal.homeOrAway === 'away');

            const homeYellowCards = enrichedCards.filter(card => card.type === 'yellow' && card.homeOrAway === 'home');
            const awayYellowCards = enrichedCards.filter(card => card.type === 'yellow' && card.homeOrAway === 'away');

            const homeSecondYellowCards = enrichedCards.filter(card => card.type === 'second_yellow' && card.homeOrAway === 'home');
            const awaySecondYellowCards = enrichedCards.filter(card => card.type === 'second_yellow' && card.homeOrAway === 'away');

            const homeRedCards = enrichedCards.filter(card => card.type === 'red' && card.homeOrAway === 'home');
            const awayRedCards = enrichedCards.filter(card => card.type === 'red' && card.homeOrAway === 'away');

            const allGoals = [...enrichedGoals].sort((a, b) => a.minute - b.minute);

            const allYellowCards = enrichedCards.filter(card => card.type === 'yellow').sort((a, b) => a.minute - b.minute);
            const allSecondYellowCards = enrichedCards.filter(card => card.type === 'second_yellow').sort((a, b) => a.minute - b.minute);
            const allRedCards = enrichedCards.filter(card => card.type === 'red').sort((a, b) => a.minute - b.minute);

            const goalsWithType = enrichedGoals.map(goal => ({
                ...goal,
                type: 'goal'
            }));

            const allEvents = [...goalsWithType, ...enrichedCards].sort((a, b) => a.minute - b.minute);
            const firstHalfEvents = allEvents.filter(event => event.minute <= 45);
            const secondHalfEvents = allEvents.filter(event => event.minute > 45);

            return {
                homeGoals,
                awayGoals,
                homeYellowCards,
                awayYellowCards,
                homeSecondYellowCards,
                awaySecondYellowCards,
                homeRedCards,
                awayRedCards,
                allGoals,
                allYellowCards,
                allSecondYellowCards,
                allRedCards,
                allEvents,
                firstHalfEvents,
                secondHalfEvents
            };

        } catch (error) {
            console.error('Chyba při načítání gólů a karet:', error);
            return {
                homeGoals: [],
                awayGoals: [],
                homeYellowCards: [],
                awayYellowCards: [],
                homeSecondYellowCards: [],
                awaySecondYellowCards: [],
                homeRedCards: [],
                awayRedCards: [],
                allGoals: [],
                allYellowCards: [],
                allSecondYellowCards: [],
                allRedCards: [],
                allEvents: [],
                firstHalfEvents: [],
                secondHalfEvents: []
            };
        }
    }

}