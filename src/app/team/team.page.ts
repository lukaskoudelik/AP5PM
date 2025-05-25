import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FavouritesService } from '../services/domain/favourites.service';
import { TabsService } from '../services/domain/tabs.service';

@Component({
  selector: 'app-team',
  templateUrl: 'team.page.html',
  styleUrls: ['team.page.scss'],
  standalone: false,
})
export class TeamPage implements OnInit, OnDestroy {

  activeTab: 'team' = 'team';
  favoriteTeams: any[] = [];
  filteredResults: any[] = [];
  searchQuery: string = '';
  favoriteItems: { league: any[], team: any[], player: any[] } = { league: [], team: [], player: [] };
  subscription!: Subscription;

  constructor(private favouriteService: FavouritesService, private tabsService: TabsService) { }

  ngOnInit() {
    this.tabsService.setActiveTab(this.activeTab);
    this.subscription = this.favouriteService.favoriteItems$.subscribe(items => {
      this.favoriteTeams = items.team;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ionViewWillEnter() {
    this.tabsService.setActiveTab(this.activeTab);
  }
}
