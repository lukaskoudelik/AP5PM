import { ImageRepository } from '../repositories/image.repository';
import { TeamRepository } from '../repositories/team.repository';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class TeamService {
    constructor(private teamRepo: TeamRepository, private imageRepo: ImageRepository) { }

    async getTeamsWithPhotos(homeTeamId: number, awayTeamId: number) {
        let homeTeam: any = null;
        let awayTeam: any = null;

        try {
            const homeTeamData = await this.teamRepo.getTeamById(`${homeTeamId}`);
            const homeTeamPhoto = await this.imageRepo.getPhotoUrl(homeTeamData?.photo_url);
            homeTeam = {
                ...homeTeamData?.data?.[0],
                photoUrl: homeTeamPhoto,
                name: homeTeamData?.name,
                id: homeTeamData?.id,
                stadium_id: homeTeamData?.stadium_id,
            };

            const awayTeamData = await this.teamRepo.getTeamById(`${awayTeamId}`);
            const awayTeamPhoto = await this.imageRepo.getPhotoUrl(awayTeamData?.photo_url);
            awayTeam = {
                ...awayTeamData?.data?.[0],
                photoUrl: awayTeamPhoto,
                name: awayTeamData?.name,
                id: awayTeamData?.id,
            };
        } catch (error) {
            console.error('Chyba při načítání týmů:', error);
        }

        return { homeTeam, awayTeam };
    }

    async getTeam(id: string): Promise<any> {
        try {
            const team = await this.teamRepo.getTeamById(id);
            const fullPhotoUrl = await this.imageRepo.getPhotoUrl(team.photo_url);
            return { ...team, photoUrl: fullPhotoUrl };
        } catch (error) {
            console.error('Error fetching team with photo URL:', error);
            throw error;
        }
    }

    async getTeamsWithPhotoUrl() {
        const teamsData = await this.teamRepo.getTeams();

        const enrichedTeams = await Promise.all(
            teamsData.map(async (team) => {
                const photoUrl = await this.imageRepo.getPhotoUrl(team.photo_url);
                return {
                    ...team,
                    photoUrl
                };
            })
        );
        return enrichedTeams;
    }

    async loadTeamForPlayer(teamId: number) {
        try {
            const teamData = await this.teamRepo.getTeamById(`${teamId}`);
            return teamData;
        } catch (error) {
            console.error('Error loading team:', error);
        }
    }

}