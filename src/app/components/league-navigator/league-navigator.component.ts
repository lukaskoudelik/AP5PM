import { Component, Input, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-league-navigator',
  templateUrl: './league-navigator.component.html',
  styleUrls: ['./league-navigator.component.scss'],
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class LeagueNavigatorComponent  implements OnInit {

  constructor(private supabaseService: SupabaseService, private appService: AppService) { }

  organizations: any[] = [];
  regions: any[] = [];
  districts: any[] = [];
  leagues: any[] = [];

  async ngOnInit() {

    this.organizations = await this.supabaseService.getOrganizations();
    this.regions = await this.supabaseService.getRegions();
    this.districts = await this.supabaseService.getDistricts();
    this.leagues = await this.getLeaguesWithPhotos();
  }

  openOrgs: Record<number, boolean> = {};
  openRegions: Record<number, boolean> = {};
  openRegionsUnderDistrict: Record<number, boolean> = {};
  openDistricts: Record<number, boolean> = {};
  
  
  specialOrganizations = ['Celostátní', 'Čechy', 'Morava a Slezsko']; // Speciální organizace
  

  async getLeaguesWithPhotos() {
    const leaguesData = await this.supabaseService.getLeagues();
  
    const enrichedLeagues = await Promise.all(
      leaguesData.map(async (league) => {
        const photoUrl = await this.supabaseService.getPhotoUrl(league.photo_url);
        return {
          ...league,
          photoUrl
        };
      })
    );
  
    return enrichedLeagues;
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
  
  // Funkce pro otevření okresu
  toggleDistrict(districtId: number) {
    this.openDistricts[districtId] = !this.openDistricts[districtId];
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

  onItemClick(event: Event, league: any, type: 'league' | 'team' | 'player'){
    this.appService.onItemClick(event, league, type);
  }

}
