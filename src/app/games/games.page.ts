import { Component, OnInit, } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { AppService } from '../services/app.service';

@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
  standalone: false
})
export class GamesPage implements OnInit {

  selectedDate: string = new Date().toISOString();
  isDateModalOpen = false;
  games: any[] = [];
  isLoading = false;
  gamesGroupedByLeague: { [key: string]: any[] } = {};
  leaguesMap: { [key: string]: string } = {};

  constructor(private supabaseService: SupabaseService, private appService: AppService) { }


  async ngOnInit() {
    this.isLoading = true;
    this.appService.setActiveTab('team');
    await this.loadLeagues();
    await this.loadGamesWithTeams();
    this.isLoading = false;
  }

  ionViewWillEnter() {
    this.appService.setActiveTab('team');
  }

  async onDateChange(event: any) {
    this.selectedDate = event.detail.value;
    this.isDateModalOpen = false;
    await this.loadGamesWithTeams();
  }

  async loadGamesWithTeams() {
    try {
      this.isLoading = true;
      const games = await this.supabaseService.getGamesByDate(this.selectedDate);

      const gamesWithTeams = await Promise.all(games.map(async (game) => {
        const { homeTeam, awayTeam } = await this.supabaseService.getTeamsWithPhotos(game.home_team_id, game.away_team_id);
        const leagueName = this.leaguesMap[game.league_id] || 'Neznámá liga';

        return {
          ...game,
          homeTeam,
          awayTeam,
          leagueName
        };
      }));

      // Seskupení podle leagueName
      this.gamesGroupedByLeague = {};
      for (const game of gamesWithTeams) {
        const leagueName = game.leagueName;
        if (!this.gamesGroupedByLeague[leagueName]) {
          this.gamesGroupedByLeague[leagueName] = [];
        }
        this.gamesGroupedByLeague[leagueName].push(game);
      }

      // Seřazení zápasů v každé lize podle času
      for (const league in this.gamesGroupedByLeague) {
        this.gamesGroupedByLeague[league].sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      }

      this.isLoading = false;

    } catch (error) {
      console.error('Chyba při načítání zápasů s týmy:', error);
      this.isLoading = false;
    }
  }

  get hasNoGames(): boolean {
    return !this.isLoading && Object.keys(this.gamesGroupedByLeague).length === 0;
  }

  async loadLeagues() {
    const leagues = await this.supabaseService.getLeagues();

    this.leaguesMap = {};
    leagues.forEach(league => {
      this.leaguesMap[league.id] = league.name;
    });
  }

  goToGameDetail(gameId: string) {
    this.appService.goToGameDetail(gameId);
  }
}
