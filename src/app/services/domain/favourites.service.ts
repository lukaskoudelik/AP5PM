import { ToastController } from "@ionic/angular";
import { ImageRepository } from "../repositories/image.repository";
import { LeagueRepository } from "../repositories/league.repository";
import { PlayerRepository } from "../repositories/player.repository";
import { TeamRepository } from "../repositories/team.repository";
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FavouritesService {
    private favoriteItemsSubject = new BehaviorSubject<{ league: any[], team: any[], player: any[] }>({
        league: [],
        team: [],
        player: []
    });

    favoriteItems$ = this.favoriteItemsSubject.asObservable();

    constructor(private leagueRepo: LeagueRepository, private teamRepo: TeamRepository, private playerRepo: PlayerRepository, private imageRepo: ImageRepository, private toastController: ToastController) { }

    async loadFavorites(type: 'league' | 'team' | 'player') {
        const storedFavorites = localStorage.getItem('favorites');
        let favorites = new Set<string>();

        if (storedFavorites) {
            favorites = new Set(JSON.parse(storedFavorites));
        }

        const [leaguesData, teamsData, playersData] = await Promise.all([
            this.leagueRepo.getLeagues(),
            this.teamRepo.getTeams(),
            this.playerRepo.getPlayers()
        ]);

        const dataMap = {
            league: leaguesData,
            team: teamsData,
            player: playersData
        };

        const selectedData = dataMap[type] || [];

        const favoriteItems = await Promise.all(
            selectedData
                .filter(item => favorites.has(`${type}:${item.id}`))
                .map(async item => ({
                    id: item.id,
                    name: type === 'player' ? `${item.first_name} ${item.second_name}` : item.name,
                    photoUrl: await this.imageRepo.getPhotoUrl(item.photo_url)
                }))
        );

        const currentFavorites = this.favoriteItemsSubject.value;
        this.favoriteItemsSubject.next({ ...currentFavorites, [type]: favoriteItems });

        return favoriteItems;
    }

    async loadAllFavorites() {
        await Promise.all([
            this.loadFavorites('league'),
            this.loadFavorites('team'),
            this.loadFavorites('player')
        ]);
    }

    toggleFavorite(item: any, type: 'league' | 'team' | 'player') {
        const key = `${type}:${item.id}`;
        const storedFavorites = localStorage.getItem('favorites');
        let favorites = new Set<string>();

        if (storedFavorites) {
            favorites = new Set(JSON.parse(storedFavorites));
        }

        if (favorites.has(key)) {
            favorites.delete(key);
            this.showToast('Odebráno z oblíbených.');
        } else {
            favorites.add(key);
            this.showToast('Přidáno do oblíbených.');
        }

        localStorage.setItem('favorites', JSON.stringify(Array.from(favorites)));
        this.loadFavorites(type);
    }

    isFavoriteItem(type: 'league' | 'team' | 'player', id: string): boolean {
        const storedFavorites = localStorage.getItem('favorites');
        if (!storedFavorites) {
            return false;
        }

        const favorites = new Set(JSON.parse(storedFavorites));

        return favorites.has(`${type}:${id}`);

    }

    async showToast(message: string) {
        const toast = await this.toastController.create({
            message,
            duration: 2000,
            position: 'bottom',
            color: 'primary',
            cssClass: 'center-toast'
        });
        toast.present();
    }

}