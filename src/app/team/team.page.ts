import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppService } from '../services/app.service';
import { Subscription } from 'rxjs';

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

  constructor(private appService: AppService) { }


  ngOnInit() {
    this.appService.setActiveTab(this.activeTab);
    this.subscription = this.appService.favoriteItems$.subscribe(items => {
      this.favoriteTeams = items.team;
    });

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ionViewWillEnter() {
    this.appService.setActiveTab(this.activeTab);
  }


}
