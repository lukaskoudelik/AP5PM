import { ImageRepository } from "../repositories/image.repository";
import { PlayerRepository } from "../repositories/player.repository";
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class PlayerService {
    constructor(private playerRepo: PlayerRepository, private imageRepo: ImageRepository) { }

    async getPlayersWithPhotos(teamId?: number) {
        try {
            let players;
            if (teamId) {
                players = await this.playerRepo.getPlayersByTeamId(`${teamId}`);
            }
            else {
                players = await this.playerRepo.getPlayers();
            }

            const playersWithPhotos = await Promise.all(players.map(async (player: any) => {
                const photoUrl = await this.imageRepo.getPhotoUrl(player.photo_url);
                return { ...player, photoUrl };
            }));

            return playersWithPhotos;
        } catch (error) {
            console.error('Chyba při načítání hráčů s fotkami:', error);
            return [];
        }
    }

    async getPlayer(id: string): Promise<any> {
        try {
            const player = await this.playerRepo.getPlayerById(id);
            const fullPhotoUrl = await this.imageRepo.getPhotoUrl(player.photo_url);
            return { ...player, photoUrl: fullPhotoUrl };
        } catch (error) {
            console.error('Error fetching player with photo URL:', error);
            throw error;
        }
    }

    async loadLineups(gameId: string) {
        try {
            const gamePlayers = await this.playerRepo.getPlayersByGameId(gameId);

            const enrichedPlayers = await Promise.all(
                gamePlayers.map(async (gp) => {
                    const player = await this.playerRepo.getPlayerById(gp.player_id);
                    return {
                        ...gp,
                        player,
                        id: player.id
                    };
                })
            );

            const positionOrder = ['goalkeeper', 'defender', 'midfielder', 'attacker'];

            const homeStarters = enrichedPlayers
                .filter(p => p.home_or_away === 'home' && p.role === 'starter')
                .sort((a, b) => positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position));

            const homeBench = enrichedPlayers
                .filter(p => p.home_or_away === 'home' && p.role === 'bench')
                .sort((a, b) => positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position));

            const awayStarters = enrichedPlayers
                .filter(p => p.home_or_away === 'away' && p.role === 'starter')
                .sort((a, b) => positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position));

            const awayBench = enrichedPlayers
                .filter(p => p.home_or_away === 'away' && p.role === 'bench')
                .sort((a, b) => positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position));

            const starters = Math.max(homeStarters.length, awayStarters.length);
            const benchers = Math.max(homeBench.length, awayBench.length);

            const startersIndexes = Array.from({ length: starters }, (_, i) => i);
            const benchersIndexes = Array.from({ length: benchers }, (_, i) => i);

            const positionCounts = {
                goalkeeper: 0,
                defender: 0,
                midfielder: 0,
                attacker: 0,
                other: 0
            };

            const allPlayers = [...homeStarters, ...homeBench, ...awayStarters, ...awayBench];

            allPlayers.forEach(player => {
                switch (player.position) {
                    case 'goalkeeper':
                        positionCounts.goalkeeper++;
                        break;
                    case 'defender':
                        positionCounts.defender++;
                        break;
                    case 'midfielder':
                        positionCounts.midfielder++;
                        break;
                    case 'attacker':
                        positionCounts.attacker++;
                        break;
                    default:
                        positionCounts.other++;
                        break;
                }
            });

            return {
                homeStarters,
                homeBench,
                awayStarters,
                awayBench,
                starters,
                benchers,
                startersIndexes,
                benchersIndexes,
                positionCounts
            };

        } catch (error) {
            console.error('Chyba při načítání sestav:', error);
            return {
                homeStarters: [],
                homeBench: [],
                awayStarters: [],
                awayBench: [],
                starters: 0,
                benchers: 0,
                startersIndexes: [],
                benchersIndexes: [],
                positionCounts: {
                    goalkeeper: 0,
                    defender: 0,
                    midfielder: 0,
                    attacker: 0,
                    other: 0
                }
            };
        }
    }

}