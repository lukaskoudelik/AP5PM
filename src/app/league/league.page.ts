import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppService } from '../services/app.service';
import { Subscription } from 'rxjs';

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

  constructor(private appService: AppService) { }


  ngOnInit() {
    this.appService.setActiveTab(this.activeTab);
    this.subscription = this.appService.favoriteItems$.subscribe(items => {
      this.favoriteLeagues = items.league;
    });

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ionViewWillEnter() {
    this.appService.setActiveTab(this.activeTab);
  }


}
