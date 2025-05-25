import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FavouritesService } from '../services/domain/favourites.service';
import { TabsService } from '../services/domain/tabs.service';

@Component({
  selector: 'app-league',
  templateUrl: 'league.page.html',
  styleUrls: ['league.page.scss'],
  standalone: false,
})
export class LeaguePage implements OnInit, OnDestroy {

  activeTab: 'league' = 'league';
  favoriteLeagues: any[] = [];
  filteredResults: any[] = [];
  searchQuery: string = '';
  favoriteItems: { league: any[], team: any[], player: any[] } = { league: [], team: [], player: [] };
  subscription!: Subscription;

  constructor(private favouriteService: FavouritesService, private tabsService: TabsService) { }

  ngOnInit() {
    this.tabsService.setActiveTab(this.activeTab);
    this.subscription = this.favouriteService.favoriteItems$.subscribe(items => {
      this.favoriteLeagues = items.league;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ionViewWillEnter() {
    this.tabsService.setActiveTab(this.activeTab);
  }
}
