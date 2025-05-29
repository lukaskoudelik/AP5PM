import { ImageRepository } from "../repositories/image.repository";
import { LeagueRepository } from "../repositories/league.repository";
import { PlayerRepository } from "../repositories/player.repository";
import { TeamRepository } from "../repositories/team.repository";
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class SearchService {
    constructor(private teamRepo: TeamRepository, private leagueRepo: LeagueRepository, private playerRepo: PlayerRepository, private imageRepo: ImageRepository) { }

    async loadNextPage(searchQuery: string, filter: 'all' | 'team' | 'player' | 'league', currentPage: number, itemsPerPage: number) {
        let newItemsCount = 0;
        let formattedResults = [];

        const fetchers: Record<'team' | 'player' | 'league', () => Promise<any[]>> = {
            team: () => this.teamRepo.getTeamsWithOffset(searchQuery, currentPage, itemsPerPage),
            player: () => this.playerRepo.getPlayersWithOffset(searchQuery, currentPage, itemsPerPage),
            league: () => this.leagueRepo.getLeaguesWithOffset(searchQuery, currentPage, itemsPerPage),
        };

        if (filter === 'all') {
            const [teams, leagues, players] = await Promise.all([
                fetchers.team(),
                fetchers.league(),
                fetchers.player()
            ]);

            const [formattedTeams, formattedLeagues, formattedPlayers] = await Promise.all([
                this.formatData(teams, 'team'),
                this.formatData(leagues, 'league'),
                this.formatData(players, 'player')
            ]);

            formattedResults = [...formattedTeams, ...formattedLeagues, ...formattedPlayers];
        } else {
            const data = await fetchers[filter]();
            formattedResults = await this.formatData(data, filter);
        }

        newItemsCount = formattedResults.length;
        return { newItemsCount, formattedResults };
    }

    async formatData(data: any[], type: string) {
        const formattedData = [];
        const storedFavorites = localStorage.getItem('favorites');
        const favorites = storedFavorites ? new Set(JSON.parse(storedFavorites)) : new Set<string>();

        for (const item of data) {
            const photoUrl = await this.imageRepo.getPhotoUrl(item.photo_url);
            formattedData.push({
                id: item.id,
                name: item.name || `${item.first_name} ${item.second_name}`,
                type,
                photoUrl,
                isFavorite: favorites.has(`${type}:${item.id}`),
            });
        }
        return formattedData;
    }

    async loadAll(type: 'league' | 'team' | 'player', searchQuery: string) {
        try {
            let itemsData: any[] = [];
            if (type == 'league') {
                itemsData = await this.leagueRepo.getLeagues();
            }
            else if (type == 'team') {
                itemsData = await this.teamRepo.getTeams();
            }
            else if (type == 'player') {
                itemsData = await this.playerRepo.getPlayers();
            }

            const formatteditems = await this.formatData(itemsData, type);
            const searchedResults = [...formatteditems];

            const filteredResults = searchedResults.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return filteredResults;

        } catch (error) {
            console.error('Chyba při náčítání dat.', error);
            return [];
        }
    }

}