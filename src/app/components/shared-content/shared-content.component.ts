import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-shared-content',
  templateUrl: './shared-content.component.html',
  styleUrls: ['./shared-content.component.scss'],
  standalone: false
})
export class SharedContentComponent  implements OnInit, OnChanges {

  constructor(private supabaseService: SupabaseService, private appService: AppService, private activatedRoute: ActivatedRoute, private router: Router) { }
  
  @Input() activeTab: 'league' | 'team' | 'player' = 'league';
  @Input() searchQuery: string = '';
  @Input() filteredResults: any[] = [];
  searchedResults: any[] = [];
  @Input() favoriteItems: { league: any[], team: any[], player: any[] } = { league: [], team: [], player: [] };
  itemsData: any[] = [];
  organizations: any[] = [];
  regions: any[] = [];
  districts: any[] = [];
  leagues: any[] = [];

  async ngOnInit() {
    this.activatedRoute.url.subscribe(urlSegments => {
      const tab = urlSegments[1]?.path;
      if (tab === 'league' || tab === 'team' || tab === 'player') {
        this.setActiveTab(tab);
      }
    });
    this.appService.favoriteItems$.subscribe(items => {
      this.favoriteItems = items;
    });

    this.appService.loadAllFavorites();
    this.organizations = await this.supabaseService.getOrganizations();
    this.regions = await this.supabaseService.getRegions();
    this.districts = await this.supabaseService.getDistricts();
    this.leagues = await this.supabaseService.getLeagues();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activeTab']) {
      this.appService.setActiveTab(this.activeTab);
    }
  }

  setActiveTab(tab: 'league' | 'team' | 'player') {
    this.activeTab = tab;

    this.appService.loadFavorites(this.activeTab).then(items => {
      this.favoriteItems[this.activeTab] = items;
    });
  }

  onSearchInput(type: 'league' | 'team' | 'player') {
    if (!this.searchQuery) {
      this.searchedResults = [];
      this.filteredResults = [];
    } else {
      this.loadAll(type);
    }
  }

  async loadAll(type: 'league' | 'team' | 'player') {
    try {
      if (type == 'league') {
        this.itemsData = await this.supabaseService.getLeagues();
      }
      else if (type == 'team') {
        this.itemsData = await this.supabaseService.getTeams();
      }
      else if (type == 'player') {
        this.itemsData = await this.supabaseService.getPlayers();
      }

      const formatteditems = await this.formatData(this.itemsData, type);

      this.searchedResults = [...formatteditems];
      this.filteredResults = [...this.searchedResults];
      this.filterResults();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async formatData(data: any[], type: 'league' | 'team' | 'player') {
    const formattedData = [];

    for (const item of data) {
      const photoUrl = await this.supabaseService.getPhotoUrl(item.photo_url);
      formattedData.push({
        id: item.id,
        name: type === 'player' ? `${item.first_name} ${item.second_name}` : item.name,
        photoUrl,
      });
    }
    return formattedData;
  }

  filterResults() {
    this.filteredResults = [];
    this.filteredResults = this.searchedResults.filter(item =>
      item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

  }

  onItemClick(event: Event, league: any, type: 'league' | 'team' | 'player'){
    this.appService.onItemClick(event, league, type);
  }


  isOrgOpen = false;
openOrgs: Record<number, boolean> = {}; // Mapování organizace -> otevřeno/uzavřeno
openRegions: Record<number, boolean> = {}; // Mapování regionu -> otevřeno/uzavřeno
openRegionsUnderOrg: Record<number, boolean> = {};
openDistricts: Record<number, boolean> = {}; // Mapování okresu -> otevřeno/uzavřeno


specialOrganizations = ['Celostátní', 'Čechy', 'Morava a Slezsko']; // Speciální organizace

toggleOrganizations() {
  this.isOrgOpen = !this.isOrgOpen;
}

// Funkce pro otevření organizace
toggleOrg(orgId: number, orgName: string) {
  if (this.specialOrganizations.includes(orgName)) {
    this.openOrgs[orgId] = !this.openOrgs[orgId];
  } else {
    // Organizace "Kraj" nebo "Okres"
    this.openOrgs[orgId] = !this.openOrgs[orgId];
    if (this.openOrgs[orgId]) {
      this.openRegionsUnderOrg[orgId] = true;
    } else {
      this.openRegionsUnderOrg[orgId] = false;
    }
  }
}

// Funkce pro otevření regionu (kraj)
toggleRegion(regionId: number) {
  this.openRegions[regionId] = !this.openRegions[regionId];
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


}
