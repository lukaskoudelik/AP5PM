import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppService } from '../services/app.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-player',
  templateUrl: 'player.page.html',
  styleUrls: ['player.page.scss'],
  standalone: false,
})
export class PlayerPage implements OnInit, OnDestroy {

  activeTab: 'player' = 'player';
  favoritePlayers: any[] = [];
  
  filteredResults: any[] = [];
  searchQuery: string = '';
  favoriteItems: { league: any[], team: any[], player: any[] } = { league: [], team: [], player: [] };

  subscription!: Subscription;

  constructor(private appService: AppService) { }


  ngOnInit() {
    this.appService.setActiveTab(this.activeTab);
    this.subscription = this.appService.favoriteItems$.subscribe(items => {
      this.favoritePlayers = items.player;
    });

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ionViewWillEnter() {
    this.appService.setActiveTab(this.activeTab);
  }


}
