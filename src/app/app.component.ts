import { Component, OnInit } from '@angular/core';
import { FavouritesService } from './services/domain/favourites.service';
import { TabsService } from './services/domain/tabs.service';
import { NavigationService } from './services/domain/navigation.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  favoriteItems: { league: any[], team: any[], player: any[] } = { league: [], team: [], player: [] };
  activeTab: 'league' | 'team' | 'player' = 'team';
  otherTabs: { firstTab: 'league' | 'team' | 'player', secondTab: 'league' | 'team' | 'player' } = { firstTab: 'league', secondTab: 'player' };
  openTab: { league: boolean, team: boolean, player: boolean } = { league: true, team: true, player: true };

  constructor(private favouritesService: FavouritesService, private tabsService: TabsService, private navigationService: NavigationService) { }

  async ngOnInit() {
    const storedDarkMode = localStorage.getItem('darkMode');
    const isDark = storedDarkMode === 'true';
    document.documentElement.classList.toggle('ion-palette-dark', isDark);
    this.favouritesService.favoriteItems$.subscribe(items => {
      this.favoriteItems = items;
    });
    this.tabsService.activeTab$.subscribe(tab => {
      this.activeTab = tab;
      this.tabsService.setUnactiveTab(this.activeTab).then(otherTabs => {
        this.otherTabs = otherTabs;
      });
      this.favouritesService.loadAllFavorites();
    });
  }

  async onMenuOpened() {
    this.favouritesService.loadFavorites(this.activeTab).then(items => {
      this.favoriteItems[this.activeTab] = items;
    });
  }

  onItemClick(event: Event, league: any, type: 'league' | 'team' | 'player') {
    this.navigationService.goToItem(event, league, type);
  }

  async toggleFavoriteItem(item: any, type: 'league' | 'team' | 'player') {
    this.favouritesService.toggleFavorite(item, type);
  }

  async toggleTab(tab: 'league' | 'team' | 'player') {
    this.openTab[tab] = !this.openTab[tab];
  }
}
