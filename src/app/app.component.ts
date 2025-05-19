import { Component, OnInit } from '@angular/core';
import { AppService } from './services/app.service';

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

  constructor(private appService: AppService) { }

  ngOnInit() {
    const storedDarkMode = localStorage.getItem('darkMode');
    const isDark = storedDarkMode === 'true';
    document.documentElement.classList.toggle('ion-palette-dark', isDark);
    this.appService.favoriteItems$.subscribe(items => {
      this.favoriteItems = items;
    });
    this.appService.activeTab$.subscribe(tab => {
      this.activeTab = tab;
      this.setUnactiveTab();
      this.appService.loadAllFavorites();
    });
  }

  async onMenuOpened() {
    this.appService.loadFavorites(this.activeTab).then(items => {
      this.favoriteItems[this.activeTab] = items;
    });
  }

  onItemClick(event: Event, league: any, type: 'league' | 'team' | 'player') {
    this.appService.onItemClick(event, league, type);
  }

  async toggleFavorite(item: any, type: 'league' | 'team' | 'player') {
    this.appService.toggleFavorite(item, type);
  }

  async setUnactiveTab() {
    if (this.activeTab === 'league') {
      this.otherTabs = { firstTab: 'team', secondTab: 'player' };
    }
    else if (this.activeTab === 'team') {
      this.otherTabs = { firstTab: 'league', secondTab: 'player' };
    }
    else {
      this.otherTabs = { firstTab: 'team', secondTab: 'league' };
    }
  }

  async toggleTab(tab: 'league' | 'team' | 'player') {
    this.openTab[tab] = !this.openTab[tab];
  }
}
