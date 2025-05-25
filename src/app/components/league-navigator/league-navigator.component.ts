import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { NavigationService } from 'src/app/services/domain/navigation.service';
import { LeagueService } from 'src/app/services/domain/league.service';
import { OrganizationService } from 'src/app/services/domain/organization.service';

@Component({
  selector: 'app-league-navigator',
  templateUrl: './league-navigator.component.html',
  styleUrls: ['./league-navigator.component.scss'],
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class LeagueNavigatorComponent implements OnInit {

  constructor(
    private navigationService: NavigationService,
    private leagueService: LeagueService,
    private organizationService: OrganizationService
  ) { }

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

  openOrgs: Record<number, boolean> = {};
  openRegions: Record<number, boolean> = {};
  openRegionsUnderDistrict: Record<number, boolean> = {};
  openDistricts: Record<number, boolean> = {};

  specialOrganizations = ['Celostátní', 'Čechy', 'Morava a Slezsko'];


  toggleOrg(orgId: number) {
    this.openOrgs[orgId] = !this.openOrgs[orgId];
  }

  toggleRegion(regionId: number) {
    this.openRegions[regionId] = !this.openRegions[regionId];
  }

  toggleRegionUnderDistrict(regionId: number) {
    this.openRegionsUnderDistrict[regionId] = !this.openRegionsUnderDistrict[regionId];
  }

  toggleDistrict(districtId: number) {
    this.openDistricts[districtId] = !this.openDistricts[districtId];
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
