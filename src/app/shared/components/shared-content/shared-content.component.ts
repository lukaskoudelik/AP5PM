import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FavouritesService } from 'src/app/services/domain/favourites.service';
import { NavigationService } from 'src/app/services/domain/navigation.service';
import { SearchService } from 'src/app/services/domain/search.service';
import { TabsService } from 'src/app/services/domain/tabs.service';

@Component({
  selector: 'app-shared-content',
  templateUrl: './shared-content.component.html',
  styleUrls: ['./shared-content.component.scss'],
  standalone: false,
})
export class SharedContentComponent  implements OnInit, OnChanges {

  constructor(private favouritesService: FavouritesService, private tabsService: TabsService, private searchService: SearchService, private navigationService: NavigationService) { }
  
  @Input() activeTab: 'league' | 'team' | 'player' = 'team';
  @Input() searchQuery: string = '';
  @Input() filteredResults: any[] = [];
  @Input() favoriteItems: { league: any[], team: any[], player: any[] } = { league: [], team: [], player: [] };
  itemsData: any[] = [];

  async ngOnInit() {
    this.favouritesService.favoriteItems$.subscribe(items => {
      this.favoriteItems = items;
    });

    this.favouritesService.loadAllFavorites();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activeTab']) {
      this.tabsService.setActiveTab(this.activeTab);
    }
  }

  setActiveTab(tab: 'league' | 'team' | 'player') {
    this.activeTab = tab;

    this.favouritesService.loadFavorites(this.activeTab).then(items => {
      this.favoriteItems[this.activeTab] = items;
    });
  }

  async onSearchInput(type: 'league' | 'team' | 'player') {
    if (!this.searchQuery) {
      this.filteredResults = [];
    } else {
      this.filteredResults = await this.searchService.loadAll(type, this.searchQuery);
    }
  }

  onItemClick(event: Event, league: any, type: 'league' | 'team' | 'player'){
    this.navigationService.goToItem(event, league, type);
  }

}
