import { ImageRepository } from "../repositories/image.repository";
import { LeagueRepository } from "../repositories/league.repository";
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class LeagueService {
    constructor(private leagueRepo: LeagueRepository, private imageRepo: ImageRepository) { }

    async loadLeagues() {
        const leagues = await this.leagueRepo.getLeagues();

        const leaguesMap: { [key: string]: string } = {};
        leagues.forEach(league => {
            leaguesMap[league.id] = league.name;
        });
        return leaguesMap;
    }

    async loadLeagueForTeam(leagueId: number) {
        try {
            const leagueData = await this.leagueRepo.getLeagueById(`${leagueId}`);
            return leagueData;
        } catch (error) {
            console.error('Chyba při načítání lig.', error);
        }
    }

    async getLeague(id: string): Promise<any> {
        try {
            const league = await this.leagueRepo.getLeagueById(id);
            const fullPhotoUrl = await this.imageRepo.getPhotoUrl(league.photo_url);
            return { ...league, photoUrl: fullPhotoUrl };
        } catch (error) {
            console.error('Chyba při načítání lig.', error);
            throw error;
        }
    }

    async getLeagues(){
        return this.leagueRepo.getLeagues()
    }

    async getLeaguesWithPhotos() {
    const leaguesData = await this.leagueRepo.getLeagues();
  
    const enrichedleagues = await Promise.all(
      leaguesData.map(async (league) => {
        const photoUrl = await this.imageRepo.getPhotoUrl(league.photo_url);
        return {
          ...league,
          photoUrl
        };
      })
    );
    return enrichedleagues;
  }
}