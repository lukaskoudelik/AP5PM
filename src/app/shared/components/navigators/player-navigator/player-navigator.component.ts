import { Component, OnInit } from '@angular/core';
import { OrganizationService } from 'src/app/services/domain/organization.service';
import { LeagueService } from 'src/app/services/domain/league.service';
import { TeamService } from 'src/app/services/domain/team.service';
import { PlayerService } from 'src/app/services/domain/player.service';
import { NavigationService } from 'src/app/services/domain/navigation.service';

@Component({
  selector: 'app-player-navigator',
  templateUrl: './player-navigator.component.html',
  styleUrls: ['./player-navigator.component.scss'],
  standalone: false,
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
    this.organizations = await this.organizationService.loadOrganizations();
    this.regions = await this.organizationService.loadRegions();
    this.districts = await this.organizationService.loadDistricts();
    this.leagues = await this.leagueService.getLeagues();
    this.teams = await this.teamService.getTeamsWithPhotoUrl();
    this.players = await this.playerService.getPlayersWithPhotos();
  }

  isItemOpen: {
    list: Record<number, boolean>,
    organization: Record<number, boolean>,
    region: Record<number, boolean>,
    regionUnderDistricts: Record<number, boolean>,
    district: Record<number, boolean>,
    league: Record<number, boolean>,
    locRegion: Record<number, boolean>,
    locDistrict: Record<number, boolean>,
    orgTeam: Record<number, boolean>,
    locTeam: Record<number, boolean>
  } = {
      list: {},
      organization: {},
      region: {},
      regionUnderDistricts: {},
      district: {},
      league: {},
      locRegion: {},
      locDistrict: {},
      orgTeam: {},
      locTeam: {}
    }
    
  specialOrganizations = ['Celostátní', 'Čechy', 'Morava a Slezsko'];

  toggleItem(type: keyof typeof this.isItemOpen, id: number) {
    this.isItemOpen[type][id] = !this.isItemOpen[type][id];
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
