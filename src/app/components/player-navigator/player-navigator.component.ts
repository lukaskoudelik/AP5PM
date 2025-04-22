import { Component, Input, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-player-navigator',
  templateUrl: './player-navigator.component.html',
  styleUrls: ['./player-navigator.component.scss'],
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class PlayerNavigatorComponent  implements OnInit {

  constructor(private supabaseService: SupabaseService, private appService: AppService) { }

  organizations: any[] = [];
  regions: any[] = [];
  districts: any[] = [];
  teams: any[] = [];
  leagues: any[] = [];
  players: any[] = [];

  async ngOnInit() {

    this.organizations = await this.supabaseService.getOrganizations();
    this.regions = await this.supabaseService.getRegions();
    this.districts = await this.supabaseService.getDistricts();
    this.leagues = await this.supabaseService.getLeagues();
    this.teams = await this.supabaseService.getTeams();
    this.players = await this.getPlayersWithPhotos();
  }

  isOrgOpen = false;
  isLocationsOpen = false;
  isNoTeamOpen = false;
  openOrgs: Record<number, boolean> = {};
  openRegions: Record<number, boolean> = {};
  openRegionsUnderDistrict: Record<number, boolean> = {};
  openDistricts: Record<number, boolean> = {};
  openLeague: Record<number, boolean> = {};
  openTeamOfOrg: Record<number, boolean> = {};
  openTeamOfLoc: Record<number, boolean> = {};

  openLocRegion: Record<number, boolean> = {};
  openLocDistrict: Record<number, boolean> = {};



  specialOrganizations = ['Celostátní', 'Čechy', 'Morava a Slezsko'];


  async getPlayersWithPhotos() {
    const playersData = await this.supabaseService.getPlayers();
  
    const enrichedPlayers = await Promise.all(
      playersData.map(async (player) => {
        const photoUrl = await this.supabaseService.getPhotoUrl(player.photo_url);
        return {
          ...player,
          photoUrl
        };
      })
    );
    return enrichedPlayers;
  }

  toggleOrganizations() {
    this.isOrgOpen = !this.isOrgOpen;
  }

  toggleLocations() {
    this.isLocationsOpen = !this.isLocationsOpen;
  }

  toggleTeamOfOrg(teamId: number) {
    this.openTeamOfOrg[teamId] = !this.openTeamOfOrg[teamId];
  }

  toggleTeamOfLoc(teamId: number) {
    this.openTeamOfLoc[teamId] = !this.openTeamOfLoc[teamId];
  }

  toggleNoTeam() {
    this.isNoTeamOpen = !this.isNoTeamOpen;
  }

  // Funkce pro otevření organizace
  toggleOrg(orgId: number) {
    this.openOrgs[orgId] = !this.openOrgs[orgId];
  }

  // Funkce pro otevření regionu (kraj)
  toggleRegion(regionId: number) {
    this.openRegions[regionId] = !this.openRegions[regionId];
  }

  toggleRegionUnderDistrict(regionId: number) {
    this.openRegionsUnderDistrict[regionId] = !this.openRegionsUnderDistrict[regionId];
  }

  toggleLeague(leagueId: number) {
    this.openLeague[leagueId] = !this.openLeague[leagueId];
  }

  // Funkce pro otevření okresu
  toggleDistrict(districtId: number) {
    this.openDistricts[districtId] = !this.openDistricts[districtId];
  }

  toggleLocRegion(regionId: number) {
    this.openLocRegion[regionId] = !this.openLocRegion[regionId];
  }

  toggleLocDistrict(districtId: number) {
    this.openLocDistrict[districtId] = !this.openLocDistrict[districtId];
  }

  // Získání soutěží podle regionu
  getLeaguesByRegion(regionId: number) {
    return this.leagues.filter(l => l.region_id === regionId);
  }

  // Získání okresů podle regionu
  getDistrictsByRegion(regionId: number) {
    return this.districts.filter(d => d.region_id === regionId);
  }

  // Získání soutěží podle okresu
  getLeaguesByDistrict(districtId: number) {
    return this.leagues.filter(l => l.district_id === districtId);
  }

  // Získání soutěží podle organizace
  getLeaguesByOrganization(orgId: number) {
    return this.leagues.filter(l => l.organization_id === orgId);
  }

  getTeamsByLeague(leagueId: number) {
    return this.teams.filter(t => t.league_id === leagueId);
  }

  getTeamsByDistrict(districtId: number) {
    return this.teams.filter(t => t.district_id === districtId);
  }

  getPlayersByTeam(teamId: number) {
    return this.players.filter(p => p.team_id === teamId);
  }

  getPlayersWithoutTeam() {
    return this.players.filter(p => p.team_id === null);
  }

  onItemClick(event: Event, league: any, type: 'league' | 'team' | 'player') {
    this.appService.onItemClick(event, league, type);
  }

}
