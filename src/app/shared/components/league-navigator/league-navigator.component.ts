import { Component, OnInit } from '@angular/core';
import { NavigationService } from 'src/app/services/domain/navigation.service';
import { LeagueService } from 'src/app/services/domain/league.service';
import { OrganizationService } from 'src/app/services/domain/organization.service';

@Component({
  selector: 'app-league-navigator',
  templateUrl: './league-navigator.component.html',
  styleUrls: ['./league-navigator.component.scss'],
  standalone: false,
})
export class LeagueNavigatorComponent implements OnInit {

  constructor(
    private navigationService: NavigationService,
    private leagueService: LeagueService,
    private organizationService: OrganizationService
  ) { }

  isItemOpen: {
    organization: Record<number, boolean>,
    region: Record<number, boolean>,
    regionUnderDistricts: Record<number, boolean>,
    district: Record<number, boolean>
  } = {
      organization: {},
      region: {},
      regionUnderDistricts: {},
      district: {}
    }

  organizations: any[] = [];
  regions: any[] = [];
  districts: any[] = [];
  leagues: any[] = [];

  async ngOnInit() {
    this.organizations = await this.organizationService.getOrganizations();
    this.regions = await this.organizationService.getRegions();
    this.districts = await this.organizationService.getDistricts();
    this.leagues = await this.leagueService.getLeaguesWithPhotos();
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

  onItemClick(event: Event, league: any, type: 'league' | 'team' | 'player') {
    this.navigationService.goToItem(event, league, type);
  }

}
