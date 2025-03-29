import { Component, OnInit} from '@angular/core';
import { AppService } from './services/app.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  favoriteItems: { league: any[], team: any[], player: any[] } = { league: [], team: [], player: [] };
  activeTab: 'league' | 'team' | 'player' = 'league';

  constructor(private appService: AppService) {}

  ngOnInit() {
    this.appService.favoriteItems$.subscribe(items => {
      this.favoriteItems = items;
    });
    this.appService.activeTab$.subscribe(tab => {
      this.activeTab = tab;
    this.appService.loadAllFavorites();
  });
  }

  async onMenuOpened() {
    this.appService.loadFavorites(this.activeTab).then(items => {
      this.favoriteItems[this.activeTab] = items;
      console.log(this.favoriteItems[this.activeTab])
    });
  }

  onItemClick(event: Event, league: any, type: 'league' | 'team' | 'player'){
    this.appService.onItemClick(event, league, type);
  }

  async toggleFavorite(item: any, type: 'league' | 'team' | 'player'){
    this.appService.toggleFavorite(item, type);
  }

}
