import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-shared-content',
  templateUrl: './shared-content.component.html',
  styleUrls: ['./shared-content.component.scss'],
  standalone: false,
})
export class SharedContentComponent  implements OnInit, OnChanges {

  constructor(private supabaseService: SupabaseService, private appService: AppService, private activatedRoute: ActivatedRoute, private router: Router) { }
  
  @Input() activeTab: 'league' | 'team' | 'player' = 'league';
  @Input() searchQuery: string = '';
  @Input() filteredResults: any[] = [];
  searchedResults: any[] = [];
  @Input() favoriteItems: { league: any[], team: any[], player: any[] } = { league: [], team: [], player: [] };
  itemsData: any[] = [];

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


}
