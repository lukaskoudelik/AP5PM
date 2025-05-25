import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { OrganizationService } from 'src/app/services/domain/organization.service';
import { LeagueService } from 'src/app/services/domain/league.service';
import { TeamService } from 'src/app/services/domain/team.service';
import { PlayerService } from 'src/app/services/domain/player.service';
import { NavigationService } from 'src/app/services/domain/navigation.service';

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

  constructor(private navigationService: NavigationService, private playerService: PlayerService, private organizationService: OrganizationService, private leagueService: LeagueService, private teamService: TeamService) { }

  organizations: any[] = [];
  regions: any[] = [];
  districts: any[] = [];
  teams: any[] = [];
  leagues: any[] = [];
  players: any[] = [];

  async ngOnInit() {

    this.organizations = await this.organizationService.getOrganizations();
    this.regions = await this.organizationService.getRegions();
    this.districts = await this.organizationService.getDistricts();
    this.leagues = await this.leagueService.getLeagues();
    this.teams = await this.teamService.getTeamsWithPhotoUrl();
    this.players = await this.playerService.getPlayersWithPhotos();
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

  toggleOrg(orgId: number) {
    this.openOrgs[orgId] = !this.openOrgs[orgId];
  }

  toggleRegion(regionId: number) {
    this.openRegions[regionId] = !this.openRegions[regionId];
  }

  toggleRegionUnderDistrict(regionId: number) {
    this.openRegionsUnderDistrict[regionId] = !this.openRegionsUnderDistrict[regionId];
  }

  toggleLeague(leagueId: number) {
    this.openLeague[leagueId] = !this.openLeague[leagueId];
  }

  toggleDistrict(districtId: number) {
    this.openDistricts[districtId] = !this.openDistricts[districtId];
  }

  toggleLocRegion(regionId: number) {
    this.openLocRegion[regionId] = !this.openLocRegion[regionId];
  }

  toggleLocDistrict(districtId: number) {
    this.openLocDistrict[districtId] = !this.openLocDistrict[districtId];
  }

  getLeaguesByRegion(regionId: number) {
    return this.leagues.filter(l => l.region_id === regionId);
  }

  getDistrictsByRegion(regionId: number) {
    return this.districts.filter(d => d.region_id === regionId);
  }

  getLeaguesByDistrict(districtId: number) {
    return this.leagues.filter(l => l.district_id === districtId);
  }

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
    this.navigationService.goToItem(event, league, type);
  }

}
