import { Component, OnInit, } from '@angular/core';
import { GameService } from '../services/domain/game.service';
import { TabsService } from '../services/domain/tabs.service';
import { NavigationService } from '../services/domain/navigation.service';
import { LeagueService } from '../services/domain/league.service';

@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
  standalone: false
})
export class GamesPage implements OnInit {

  selectedDate: string = new Date().toISOString();
  isDateModalOpen = false;
  isLoading = false;
  games: { [key: string]: any[] } = {};
  leaguesMap: { [key: string]: string } = {};

  constructor(private gameService: GameService, private tabsService: TabsService, private navigationService: NavigationService, private leagueService: LeagueService) { }

  async ngOnInit() {
    this.isLoading = true;
    this.tabsService.setActiveTab('team');
    this.leaguesMap = await this.leagueService.loadLeagues();
    this.games = await this.gameService.loadGamesByDate(this.leaguesMap, this.selectedDate);
    this.isLoading = false;

  }

  ionViewWillEnter() {
    this.tabsService.setActiveTab('team');
  }

  async onDateChange(event: any) {
    this.isLoading = true;
    this.selectedDate = event.detail.value;
    this.isDateModalOpen = false;
    this.games = await this.gameService.loadGamesByDate(this.leaguesMap, this.selectedDate);
    this.isLoading = false;
  }

  get hasNoGames(): boolean {
    return !this.isLoading && Object.keys(this.games).length === 0;
  }

}
