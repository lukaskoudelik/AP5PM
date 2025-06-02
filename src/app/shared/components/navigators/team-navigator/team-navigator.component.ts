import { Component, OnInit } from '@angular/core';
import { NavigationService } from 'src/app/services/domain/navigation.service';
import { TeamService } from 'src/app/services/domain/team.service';
import { LeagueService } from 'src/app/services/domain/league.service';
import { OrganizationService } from 'src/app/services/domain/organization.service';


@Component({
  selector: 'app-team-navigator',
  templateUrl: './team-navigator.component.html',
  styleUrls: ['./team-navigator.component.scss'],
  standalone: false,
})
export class TeamNavigatorComponent implements OnInit {

  constructor(
    private navigationService: NavigationService,
    private teamService: TeamService,
    private leagueService: LeagueService,
    private organizationService: OrganizationService
  ) { }

  isItemOpen: {
    list: Record<number, boolean>,
    organization: Record<number, boolean>,
    region: Record<number, boolean>,
    regionUnderDistricts: Record<number, boolean>,
    district: Record<number, boolean>,
    league: Record<number, boolean>,
    locRegion: Record<number, boolean>,
    locDistrict: Record<number, boolean>,
  } = {
      list: {},
      organization: {},
      region: {},
      regionUnderDistricts: {},
      district: {},
      league: {},
      locRegion: {},
      locDistrict: {}
    }

  organizations: any[] = [];
  regions: any[] = [];
  districts: any[] = [];
  teams: any[] = [];
  leagues: any[] = [];

  async ngOnInit() {
    this.organizations = await this.organizationService.loadOrganizations();
    this.regions = await this.organizationService.loadRegions();
    this.districts = await this.organizationService.loadDistricts();
    this.leagues = await this.leagueService.getLeagues();
    this.teams = await this.teamService.getTeamsWithPhotoUrl();
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

  onItemClick(event: Event, league: any, type: 'league' | 'team' | 'player') {
    this.navigationService.goToItem(event, league, type);
  }

}
